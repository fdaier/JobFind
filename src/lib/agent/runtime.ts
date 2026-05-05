import type { Job, Material } from "../types";

import type { AgentResult } from "./types";

export interface AgentRuntimeContext {
  job: Job;
  jobs: Job[];
  materials: Material[];
  completedTaskIds: string[];
  now?: Date;
}

export interface AgentRuntime {
  buildResult(context: AgentRuntimeContext): AgentResult;
}
