import { beforeEach, describe, expect, it, vi } from "vitest";

import { defaultDesign } from "@/portfolio/defaults";

const mocks = vi.hoisted(() => ({
  getCurrentUser: vi.fn(),
  readSupabaseConfig: vi.fn(),
  createSupabaseServerClient: vi.fn(),
  redirect: vi.fn((url: string) => {
    throw new Error(`redirect:${url}`);
  }),
}));

vi.mock("@/lib/auth/session", () => ({ getCurrentUser: mocks.getCurrentUser }));
vi.mock("@/lib/supabase/config", () => ({
  readSupabaseConfig: mocks.readSupabaseConfig,
}));
vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: mocks.createSupabaseServerClient,
}));
vi.mock("next/navigation", () => ({ redirect: mocks.redirect }));

import { resetDesignAction, saveDesignAction } from "../actions";

const USER = "11111111-1111-4111-8111-111111111111";
const OTHER = "22222222-2222-4222-8222-222222222222";

type Write = { design?: unknown; [key: string]: unknown };

function fakeClient(result: { data: unknown; error: unknown } = { data: [{ user_id: USER }], error: null }) {
  const write: Write = {};
  const eq = vi.fn((column: string, value: string) => {
    write.column = column;
    write.value = value;

    return {
      select: vi.fn(async () => result),
      then: (resolve: (value: typeof result) => unknown, reject?: (reason: unknown) => unknown) =>
        Promise.resolve(result).then(resolve, reject),
    };
  });
  const update = vi.fn((values: Write) => {
    write.design = values.design;
    write.keys = Object.keys(values);

    return { eq };
  });
  const from = vi.fn((table: string) => {
    write.table = table;

    return { update };
  });

  return { client: { from }, write };
}

function payload(design: unknown, extra: Record<string, unknown> = {}): FormData {
  const data = new FormData();
  data.set("payload", JSON.stringify({ design, revision: 3, ...extra }));

  return data;
}

const previous = { status: "idle" } as const;

beforeEach(() => {
  mocks.getCurrentUser.mockReset();
  mocks.readSupabaseConfig.mockReset();
  mocks.createSupabaseServerClient.mockReset();
  mocks.redirect.mockClear();

  mocks.getCurrentUser.mockResolvedValue({ id: USER });
  mocks.readSupabaseConfig.mockReturnValue({ url: "https://project.supabase.co", key: "key" });
});

describe("saveDesignAction", () => {
  it("AC-8 writes only portfolios.design for the signed-in user", async () => {
    const fake = fakeClient();
    mocks.createSupabaseServerClient.mockResolvedValue(fake.client);

    const state = await saveDesignAction(previous, payload(defaultDesign()));

    expect(state.status).toBe("saved");
    expect(fake.write.table).toBe("portfolios");
    expect(fake.write.keys).toEqual(["design"]);
    expect(fake.write.column).toBe("user_id");
    expect(fake.write.value).toBe(USER);
  });

  it("AC-8 takes the user id from the session, never from the payload", async () => {
    const fake = fakeClient();
    mocks.createSupabaseServerClient.mockResolvedValue(fake.client);

    await saveDesignAction(previous, payload(defaultDesign(), { userId: OTHER, user_id: OTHER }));

    expect(fake.write.value).toBe(USER);
  });

  it("AC-8 refuses an unauthenticated call and writes nothing", async () => {
    mocks.getCurrentUser.mockResolvedValue(null);

    const state = await saveDesignAction(previous, payload(defaultDesign()));

    expect(state).toEqual({
      status: "error",
      errors: [],
      message: "Your session ended. Log in again, then save.",
    });
    expect(mocks.createSupabaseServerClient).not.toHaveBeenCalled();
  });

  it("AC-8 refuses an invalid design without writing", async () => {
    const fake = fakeClient();
    mocks.createSupabaseServerClient.mockResolvedValue(fake.client);

    const state = await saveDesignAction(
      previous,
      payload({ ...defaultDesign(), world: "elsewhere" }),
    );

    expect(state.status).toBe("error");
    expect(fake.write.table).toBeUndefined();
  });

  it("AC-8 echoes the revision so the saved state clears the unsaved marker", async () => {
    const fake = fakeClient();
    mocks.createSupabaseServerClient.mockResolvedValue(fake.client);

    const state = await saveDesignAction(previous, payload(defaultDesign()));

    expect(state).toMatchObject({ status: "saved", revision: 3 });
  });

  it("AC-8 reports a missing row instead of claiming a save", async () => {
    const fake = fakeClient({ data: [], error: null });
    mocks.createSupabaseServerClient.mockResolvedValue(fake.client);

    const state = await saveDesignAction(previous, payload(defaultDesign()));

    expect(state.status).toBe("error");
  });
});

describe("resetDesignAction", () => {
  it("AC-10 restores the default design only when it is called", async () => {
    const fake = fakeClient({ data: [{ user_id: USER }], error: null });
    mocks.createSupabaseServerClient.mockResolvedValue(fake.client);

    await expect(resetDesignAction()).rejects.toThrow("redirect:/dashboard/design");

    expect(fake.write.table).toBe("portfolios");
    expect(fake.write.design).toEqual(defaultDesign());
    expect(fake.write.column).toBe("user_id");
    expect(fake.write.value).toBe(USER);
  });

  it("AC-10 sends a signed-out visitor to the login page", async () => {
    mocks.getCurrentUser.mockResolvedValue(null);

    await expect(resetDesignAction()).rejects.toThrow("redirect:/login");

    expect(mocks.createSupabaseServerClient).not.toHaveBeenCalled();
  });
});
