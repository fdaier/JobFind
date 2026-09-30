import { describe, expect, it } from "vitest";

import { selectUidPage } from "./uid-page";

describe("selectUidPage", () => {
  it("starts at the first actual UID even when the server uses large UIDs", () => {
    expect(selectUidPage([1676908776, 1676908774, 1676908775], 1, 2)).toEqual({
      selected: [1676908774, 1676908775], nextUid: 1676908776, uidNext: 1676908777, totalMessages: 3,
    });
  });

  it("skips UID gaps without scanning empty ranges", () => {
    expect(selectUidPage([4, 9000, 12000], 5, 2)).toEqual({
      selected: [9000, 12000], nextUid: 12001, uidNext: 12001, totalMessages: 3,
    });
  });

  it("finishes immediately for an empty mailbox", () => {
    expect(selectUidPage([], 1, 50)).toEqual({ selected: [], nextUid: 1, uidNext: 1, totalMessages: 0 });
  });
});
