import type {
  FunnelData,
  Job,
  Material,
  MaterialType,
  RiskTag,
  TaskPriority,
  TodayTask,
} from './types';

const MS_PER_HOUR = 60 * 60 * 1000;
const MS_PER_DAY = 24 * MS_PER_HOUR;

function parseDate(value: string): Date {
  return new Date(value);
}

function getHoursUntil(target: string, now: Date): number {
  return (parseDate(target).getTime() - now.getTime()) / MS_PER_HOUR;
}

function getDaysSince(target: string, now: Date): number {
  return (now.getTime() - parseDate(target).getTime()) / MS_PER_DAY;
}

function formatOverdueDeadline(hoursLate: number): string {
  if (hoursLate >= 24) {
    return `网申已截止 ${Math.ceil(hoursLate / 24)} 天`;
  }

  return `网申已截止 ${Math.ceil(hoursLate)} 小时`;
}

function buildPriority(score: number): TaskPriority {
  if (score >= 130) {
    return 'urgent';
  }

  if (score >= 80) {
    return 'high';
  }

  if (score >= 50) {
    return 'medium';
  }

  return 'low';
}

function materialName(type: MaterialType): string {
  return type.replace('_', ' ');
}

function getBoundMaterialTypes(job: Job, materials: Material[]): MaterialType[] {
  const materialById = new Map(materials.map((material) => [material.id, material] as const));

  return job.boundMaterialIds
    .map((id) => materialById.get(id))
    .filter((material): material is Material => Boolean(material))
    .map((material) => material.type);
}

function getMissingMaterials(job: Job, materials: Material[]): MaterialType[] {
  const boundTypes = new Set(getBoundMaterialTypes(job, materials));

  return job.requiredMaterials.filter((type) => !boundTypes.has(type));
}

export function calculateMaterialCompleteness(job: Job, materials: Material[]): { percentage: number; missing: MaterialType[] } {
  if (job.requiredMaterials.length === 0) {
    return { percentage: 100, missing: [] };
  }

  const missing = getMissingMaterials(job, materials);
  const completeCount = job.requiredMaterials.length - missing.length;

  return {
    percentage: Math.round((completeCount / job.requiredMaterials.length) * 100),
    missing,
  };
}

export function generateRiskTags(job: Job, materials: Material[], now: Date = new Date()): RiskTag[] {
  const risks: RiskTag[] = [];

  const deadlineEligible = job.stage === 'interested' || job.stage === 'to_apply' || job.stage === 'applied';
  if (deadlineEligible && job.applicationDeadline) {
    const hoursUntilDeadline = getHoursUntil(job.applicationDeadline, now);
    if (hoursUntilDeadline < 0) {
      risks.push({
        type: 'deadline',
        level: 'critical',
        message: formatOverdueDeadline(Math.abs(hoursUntilDeadline)),
      });
    } else if (hoursUntilDeadline <= 24) {
      risks.push({
        type: 'deadline',
        level: 'critical',
        message: `网申剩余 ${Math.ceil(hoursUntilDeadline)} 小时`,
      });
    } else if (hoursUntilDeadline > 24 && hoursUntilDeadline <= 72) {
      risks.push({
        type: 'deadline',
        level: 'warning',
        message: `网申剩余 ${Math.ceil(hoursUntilDeadline / 24)} 天`,
      });
    }
  }

  const missingMaterials = getMissingMaterials(job, materials);
  if (missingMaterials.length > 0) {
    risks.push({
      type: 'material_gap',
      level: 'warning',
      message: `Missing materials: ${missingMaterials.map(materialName).join(', ')}`,
    });
  }

  if (job.stage === 'interviewing' && job.interviewDate) {
    const hoursUntilInterview = getHoursUntil(job.interviewDate, now);
    if (hoursUntilInterview < 0) {
      risks.push({
        type: 'interview_prep',
        level: 'critical',
        message: '面试时间已过，请补充复盘',
      });
    } else if (hoursUntilInterview <= 72) {
      risks.push({
        type: 'interview_prep',
        level: 'critical',
        message: `面试还有 ${Math.ceil(hoursUntilInterview)} 小时`,
      });
    }
  }

  if (job.stage === 'applied' && job.appliedDate) {
    const daysSinceApplied = getDaysSince(job.appliedDate, now);
    if (daysSinceApplied >= 10) {
      risks.push({
        type: 'silence',
        level: 'warning',
        message: `No response for ${Math.floor(daysSinceApplied)} days`,
      });
    }
  }

  return risks;
}

export function generateTodayTasks(jobs: Job[], materials: Material[], now: Date = new Date()): TodayTask[] {
  const scoredTasks = jobs.flatMap((job) =>
    generateRiskTags(job, materials, now).map((riskTag) => {
      let score = riskTag.level === 'critical' ? 100 : 50;
      let actionType: TodayTask['actionType'];
      let action: string;
      let reason: string;

      switch (riskTag.type) {
        case 'deadline':
          score += 50;
          actionType = 'submit_application';
          action = `Submit application for ${job.company} ${job.position}`;
          reason = riskTag.message;
          break;
        case 'material_gap':
          actionType = 'bind_material';
          action = `Bind materials for ${job.company} ${job.position}`;
          reason = riskTag.message;
          break;
        case 'interview_prep':
          score += 30;
          actionType = 'prepare_interview';
          action = `Prepare interview for ${job.company} ${job.position}`;
          reason = riskTag.message;
          break;
        case 'silence':
          actionType = 'follow_up';
          action = `Follow up with ${job.company} ${job.position}`;
          reason = riskTag.message;
          break;
        default:
          actionType = 'update_material';
          action = `Review ${job.company} ${job.position}`;
          reason = riskTag.message;
      }

      return {
        task: {
          id: `${job.id}-${riskTag.type}`,
          jobId: job.id,
          company: job.company,
          position: job.position,
          action,
          reason,
          priority: buildPriority(score),
          actionType,
          score,
          completed: false,
        },
        score,
      };
    }),
  );

  return scoredTasks
    .sort((left, right) => {
      const scoreDelta = right.score - left.score;
      if (scoreDelta !== 0) {
        return scoreDelta;
      }

      return left.task.id.localeCompare(right.task.id);
    })
    .slice(0, 5)
    .map(({ task }) => task);
}

export function calculateFunnelData(jobs: Job[]): FunnelData {
  const data: FunnelData = {
    interested: 0,
    toApply: 0,
    applied: 0,
    writtenTest: 0,
    interviewing: 0,
    offer: 0,
    rejected: 0,
  };

  for (const job of jobs) {
    switch (job.stage) {
      case 'interested':
        data.interested += 1;
        break;
      case 'to_apply':
        data.toApply += 1;
        break;
      case 'applied':
        data.applied += 1;
        break;
      case 'written_test':
        data.writtenTest += 1;
        break;
      case 'interviewing':
        data.interviewing += 1;
        break;
      case 'offer':
        data.offer += 1;
        break;
      case 'rejected':
        data.rejected += 1;
        break;
    }
  }

  return data;
}
