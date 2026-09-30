export function selectUidPage(uids: number[], cursor: number, pageSize: number) {
  const ordered = [...uids].sort((a, b) => a - b);
  const selected = ordered.filter((uid) => uid >= cursor).slice(0, pageSize);
  const uidNext = Math.max(cursor, (ordered.at(-1) ?? 0) + 1);
  const nextUid = selected.length ? selected[selected.length - 1] + 1 : uidNext;
  return { selected, nextUid, uidNext, totalMessages: ordered.length };
}
