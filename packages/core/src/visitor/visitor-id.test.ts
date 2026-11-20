import { beforeEach, describe, expect, it } from "vitest";
import { resetVisitorIdForTests, visitorId, type KeyValueStorage } from "./visitor-id";

const ID_1 = "0b5c2d9e-0a6c-4f0a-9d7e-1f1d3c1c2b3a";
const ID_2 = "7f3e1a2b-4c5d-4e6f-8a9b-0c1d2e3f4a5b";

function memoryStorage(initial: Record<string, string> = {}): KeyValueStorage & { data: Record<string, string> } {
  const data = { ...initial };
  return { data, getItem: (key) => data[key] ?? null, setItem: (key, value) => void (data[key] = value) };
}

beforeEach(resetVisitorIdForTests);

describe("visitor id", () => {
  it("is made once and kept on the device", async () => {
    const storage = memoryStorage();
    expect(await visitorId(storage, () => ID_1)).toBe(ID_1);
    expect(await visitorId(storage, () => ID_2)).toBe(ID_1);
    expect(storage.data).toEqual({ "wedplan.visitorId": ID_1 });
  });

  it("replaces a stored value that isn't an id", async () => {
    const storage = memoryStorage({ "wedplan.visitorId": "not-an-id" });
    expect(await visitorId(storage, () => ID_1)).toBe(ID_1);
    expect(storage.data["wedplan.visitorId"]).toBe(ID_1);
  });

  it("works with async storage, as on mobile", async () => {
    const data: Record<string, string> = {};
    const storage: KeyValueStorage = { getItem: async (key) => data[key] ?? null, setItem: async (key, value) => void (data[key] = value) };
    expect(await visitorId(storage, () => ID_1)).toBe(ID_1);
    expect(await visitorId(storage, () => ID_2)).toBe(ID_1);
  });

  it("keeps one id in memory when storage is missing or fails", async () => {
    expect(await visitorId(null, () => ID_1)).toBe(ID_1);
    expect(await visitorId(null, () => ID_2)).toBe(ID_1);
    const broken: KeyValueStorage = {
      getItem: () => {
        throw new Error("blocked");
      },
      setItem: () => undefined,
    };
    expect(await visitorId(broken, () => ID_2)).toBe(ID_1);
  });

  it("keeps the saved id when storage fails later", async () => {
    let failing = false;
    const storage: KeyValueStorage = {
      getItem: () => {
        if (failing) throw new Error("blocked");
        return ID_1;
      },
      setItem: () => undefined,
    };
    expect(await visitorId(storage, () => ID_2)).toBe(ID_1);
    failing = true;
    expect(await visitorId(storage, () => ID_2)).toBe(ID_1);
  });
});
