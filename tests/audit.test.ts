import { describe, expect, it, vi } from "vitest";
import { writeAuditLog } from "../src/lib/audit";

const id = "00000000-0000-0000-0000-000000000001";

function fakeBroken() {
  return {
    auth: {
      getUser: vi.fn(async () => {
        throw new Error("network down");
      }),
    },
    from: vi.fn(() => {
      throw new Error("table missing");
    }),
  } as never;
}

function fakeRecording() {
  const insert = vi.fn(async (_row: { action: string; target?: string | null; detail?: string | null; actor_id?: string | null; actor_email?: string | null }) => ({ error: null }));
  const from = vi.fn(() => ({ insert }));
  const auth = { getUser: vi.fn(async () => ({ data: { user: { id, email: "admin@absycode.com" } }, error: null })) };
  return { from, auth, insert };
}

describe("audit trail", () => {
  it("never throws — a broken audit path cannot block a content save", async () => {
    await expect(writeAuditLog(fakeBroken(), { action: "content_update", target: "site" })).resolves.toBeUndefined();
    await expect(writeAuditLog(fakeBroken(), { action: "login" })).resolves.toBeUndefined();
  });

  it("records actor, action and target against admin_audit_log", async () => {
    const fake = fakeRecording();
    await writeAuditLog(fake as never, { action: "estimator_update", target: "estimator", detail: "n/a" });
    const inserted = fake.insert.mock.calls[0][0];
    expect(inserted).toMatchObject({
      action: "estimator_update",
      target: "estimator",
      actor_id: id,
      actor_email: "admin@absycode.com",
    });
    expect(fake.from).toHaveBeenCalledWith("admin_audit_log");
  });
});