import { describe, expect, it } from "vitest";

import { createEmptyJDIntakeDraft, createJobFromJDIntake, organizeJDIntake } from "./jd-intake";

const tencentAiProductManagerJD = `岗位描述
1、定义AI产品方向：洞察用户场景中 AI 能创造增量价值的关键节点，推动从概念到上线的完整闭环；
2、驾驭AI技术边界：深入理解大模型（LLM/MLLM）、Agent架构、RAG、多模态等核心AI技术；
3、设计AI交互体验：探索对话式界面、生成式UI、Agent多步推理等；
4、驱动AI产品增长：通过数据实验（A/B测试、用户行为分析、AI使用漏斗等）持续优化产品策略；

岗位要求
AI应用技能：善于借助AI工具拆解复杂问题，并能对AI的输出进行高质量判断。
专业能力：具备优秀的产品Sense和用户同理心，能独立完成从用户洞察到产品方案的全流程思考。

加分项或注意事项
有产品实习经历或独立完成的产品项目（有AI产品经验尤佳）；用AI工具搭建过AI应用原型的实际经验。`;

describe("JD intake", () => {
  it("organizes only facts and explicit suggestions from the Tencent AI product manager JD", () => {
    const organized = organizeJDIntake({
      ...createEmptyJDIntakeDraft(),
      company: " 腾讯 ",
      position: " AI 产品经理 ",
      jdText: tencentAiProductManagerJD,
    });

    expect(organized.company).toBe("腾讯");
    expect(organized.position).toBe("AI 产品经理");
    expect(organized.keywords).toEqual(expect.arrayContaining(["LLM", "MLLM", "Agent", "RAG", "多模态", "A/B 测试", "用户洞察"]));
    expect(organized.requiredMaterials).toEqual(["portfolio"]);
    expect(organized.requirements).toEqual(expect.arrayContaining([expect.stringContaining("AI应用技能")]))
  });

  it("creates a local job without inventing a deadline or B站 data", () => {
    const draft = organizeJDIntake({
      ...createEmptyJDIntakeDraft(),
      company: "腾讯",
      position: "AI 产品经理",
      jdText: tencentAiProductManagerJD,
    });
    const job = createJobFromJDIntake(draft, [], new Date("2026-09-14T08:00:00.000Z"));

    expect(job.id).toMatch(/^manual-jd-/);
    expect(job.company).toBe("腾讯");
    expect(job.position).toBe("AI 产品经理");
    expect(job.jdText).toBe(tencentAiProductManagerJD);
    expect(job.applicationDeadline).toBeNull();
    expect(job.timeline[0]?.description).toBe("添加岗位：腾讯 · AI 产品经理");
    expect(job.requiredMaterials).toEqual(["portfolio"]);
    expect(job.company).not.toBe("B站");
  });

  it("stores a valid date-only deadline at the end of the selected day", () => {
    const job = createJobFromJDIntake(
      {
        ...createEmptyJDIntakeDraft(),
        company: "京东",
        position: "技术产品经理",
        jdText: "岗位要求：具备产品能力。",
        applicationDeadline: "2027-10-01",
      },
      [],
      new Date("2026-09-14T08:00:00.000Z"),
    );

    const deadline = new Date(job.applicationDeadline!);
    expect(deadline.getFullYear()).toBe(2027);
    expect(deadline.getMonth()).toBe(9);
    expect(deadline.getDate()).toBe(1);
    expect(deadline.getHours()).toBe(23);
    expect(deadline.getMinutes()).toBe(59);
  });
});
