# JobFind Vercel Deployment

## Current production

- Production URL: `https://jobfind-core-loop.vercel.app`

## Repeatable release

1. Open `D:\projects\JobFind\.worktrees\jobfind-core-loop`.
2. Run `npm install`.
3. Run `npx vercel deploy . --prod --yes --scope fdaiers-projects`.

## Aliyun domain binding

1. Buy the domain in Aliyun.
2. In Vercel, add the domain to project `jobfind-core-loop`.
3. In Aliyun DNS, add the records Vercel shows.
4. Wait for Vercel domain verification to turn green.
