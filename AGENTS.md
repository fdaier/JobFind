# JobFind Project Instructions

Before making decisions or editing product code, read `docs/JobFind-Current-State.md`. It is the current source of truth for product scope, deployment state, decisions, verification, and next priorities.

- Use repository root `D:\projects\JobFind` on branch `main` as the implementation and release source.
- Treat `.worktrees/jobfind-core-loop` and its deployment handoff material as historical Stage 1/v1.2 context, not the current deployment source.
- New product work is document-driven: write a draft design first, obtain approval, then update formal docs and code.
- Commit product and durable project-document changes. Before production deployment, verify the linked Vercel identity/project and validate `https://jobfind.fdaier.xyz` after release.
