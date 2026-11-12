import { beforeEach, describe, expect, it, vi } from "vitest";

import { emptyContent } from "@/portfolio/defaults";
import { editorialDesign } from "@/schema/fixtures";

const mocks = vi.hoisted(() => ({
  getCurrentUser: vi.fn(),
  readSupabaseConfig: vi.fn(),
  createSupabaseServerClient: vi.fn(),
  revalidatePath: vi.fn(),
}));

vi.mock("@/lib/auth/session", () => ({ getCurrentUser: mocks.getCurrentUser }));
vi.mock("@/lib/supabase/config", () => ({
  readSupabaseConfig: mocks.readSupabaseConfig,
}));
vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: mocks.createSupabaseServerClient,
}));
vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidatePath }));

import { publishAction, resetToPublishedAction, unpublishAction } from "../actions";

const USER = "11111111-1111-4111-8111-111111111111";
const USERNAME = "amelia-hart";

const content = {
  ...emptyContent(),
  about: { text: "I build things for the web." },
  skills: { skillIds: ["typescript", "react"] },
};

type Call = {
  table: string;
  op: "select" | "update" | "upsert" | "delete";
  columns?: string;
  values?: Record<string, unknown>;
  options?: unknown;
  column?: string;
  value?: unknown;
};

type Options = {
  profile?: Record<string, unknown> | null;
  draft?: Record<string, unknown> | null;
  published?: Record<string, unknown> | null;
  skills?: { slug: string }[] | null;
  writeError?: { message: string } | null;
};

const DEFAULT_PROFILE = {
  username: USERNAME,
  display_name: "Amelia Hart",
  headline: "Product designer",
};

function fakeClient(options: Options = {}) {
  const calls: Call[] = [];
  const writeError = options.writeError ?? null;
  const writeResult = { data: writeError ? null : [{ user_id: USER }], error: writeError };

  const profileRow = options.profile === undefined ? DEFAULT_PROFILE : options.profile;
  const draftRow =
    options.draft === undefined ? { design: editorialDesign, content } : options.draft;
  const publishedRow = options.published === undefined ? null : options.published;
  const skillRows =
    options.skills === undefined
      ? [{ slug: "typescript" }, { slug: "react" }]
      : options.skills;

  const rowsFor = (table: string): unknown => {
    if (table === "profiles") {
      return profileRow;
    }

    if (table === "portfolios") {
      return draftRow;
    }

    if (table === "published_portfolios") {
      return publishedRow;
    }

    if (table === "skills") {
      return skillRows;
    }

    return null;
  };

  const settle = (rows: unknown) => Promise.resolve({ data: rows, error: null });

  function read(table: string, columns: string) {
    const call: Call = { table, op: "select", columns };
    calls.push(call);

    const rows = rowsFor(table);
    const then = (resolve: (value: unknown) => unknown) => settle(rows).then(resolve);

    return {
      then,
      eq(column: string, value: unknown) {
        call.column = column;
        call.value = value;

        return { maybeSingle: async () => ({ data: rows, error: null }), then };
      },
    };
  }

  function write(
    table: string,
    op: "update" | "upsert",
    values: Record<string, unknown>,
    writeOptions?: unknown,
  ) {
    const call: Call = { table, op, values, options: writeOptions };
    calls.push(call);

    const then = (resolve: (value: unknown) => unknown) => Promise.resolve(writeResult).then(resolve);

    return {
      then,
      select: async () => writeResult,
      eq(column: string, value: unknown) {
        call.column = column;
        call.value = value;

        return { select: async () => writeResult, then };
      },
    };
  }

  const from = (table: string) => ({
    select: (columns: string) => read(table, columns),
    update: (values: Record<string, unknown>) => write(table, "update", values),
    upsert: (values: Record<string, unknown>, writeOptions?: unknown) =>
      write(table, "upsert", values, writeOptions),
    delete: () => ({
      eq: (column: string, value: unknown) => {
        calls.push({ table, op: "delete", column, value });

        return Promise.resolve({ data: null, error: writeError });
      },
    }),
  });

  return { client: { from }, calls };
}

const idle = { status: "idle" } as const;

beforeEach(() => {
  mocks.getCurrentUser.mockReset();
  mocks.readSupabaseConfig.mockReset();
  mocks.createSupabaseServerClient.mockReset();
  mocks.revalidatePath.mockReset();

  mocks.getCurrentUser.mockResolvedValue({ id: USER });
  mocks.readSupabaseConfig.mockReturnValue({
    url: "https://project.supabase.co",
    anonKey: "key",
  });
});

describe("publishAction", () => {
  it("AC-2 publishes the profile and draft read on the server", async () => {
    const fake = fakeClient();
    mocks.createSupabaseServerClient.mockResolvedValue(fake.client);

    const state = await publishAction(idle);

    expect(state).toEqual({ status: "published", username: USERNAME });

    const upsert = fake.calls.find((call) => call.op === "upsert");

    expect(upsert?.table).toBe("published_portfolios");
    expect(upsert?.values).toMatchObject({
      user_id: USER,
      username: USERNAME,
      display_name: "Amelia Hart",
      headline: "Product designer",
      design: editorialDesign,
      content,
    });
  });

  it("AC-2 takes no form payload, so nothing about the portfolio comes from the browser", () => {
    expect(publishAction.length).toBe(1);
  });

  it("AC-2 refuses to publish for a signed-out visitor", async () => {
    mocks.getCurrentUser.mockResolvedValue(null);

    const state = await publishAction(idle);

    expect(state.status).toBe("error");
    expect(mocks.createSupabaseServerClient).not.toHaveBeenCalled();
  });

  it("AC-3 republishing never writes published_at, so the first publish time is kept", async () => {
    const fake = fakeClient();
    mocks.createSupabaseServerClient.mockResolvedValue(fake.client);

    await publishAction(idle);

    const upsert = fake.calls.find((call) => call.op === "upsert");

    expect(upsert?.values).not.toHaveProperty("published_at");
    expect(upsert?.values).toHaveProperty("updated_at");
    expect(upsert?.options).toEqual({ onConflict: "user_id" });
  });

  it("AC-1 refuses to publish a saved draft that no longer validates", async () => {
    const fake = fakeClient({
      draft: { design: { ...editorialDesign, world: "elsewhere" }, content },
    });
    mocks.createSupabaseServerClient.mockResolvedValue(fake.client);

    const state = await publishAction(idle);

    expect(state.status).toBe("error");
    expect(fake.calls.some((call) => call.op === "upsert")).toBe(false);
  });

  it("AC-1 refuses to publish a skill that is not in the list", async () => {
    const fake = fakeClient({ skills: [{ slug: "typescript" }] });
    mocks.createSupabaseServerClient.mockResolvedValue(fake.client);

    const state = await publishAction(idle);

    expect(state.status).toBe("error");
    expect(fake.calls.some((call) => call.op === "upsert")).toBe(false);
  });

  it("AC-2 stops when the signed-in user has no profile row", async () => {
    const fake = fakeClient({ profile: null });
    mocks.createSupabaseServerClient.mockResolvedValue(fake.client);

    const state = await publishAction(idle);

    expect(state.status).toBe("error");
    expect(fake.calls.some((call) => call.op === "upsert")).toBe(false);
  });

  it("AC-2 reports a failed write instead of claiming success", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});

    const fake = fakeClient({ writeError: { message: "connection reset" } });
    mocks.createSupabaseServerClient.mockResolvedValue(fake.client);

    const state = await publishAction(idle);

    expect(state.status).toBe("error");
    vi.restoreAllMocks();
  });

  it("D-085 revalidates the public page and the dashboard", async () => {
    const fake = fakeClient();
    mocks.createSupabaseServerClient.mockResolvedValue(fake.client);

    await publishAction(idle);

    expect(mocks.revalidatePath).toHaveBeenCalledWith(`/u/${USERNAME}`);
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/dashboard");
  });
});

describe("unpublishAction", () => {
  it("AC-5 deletes only the signed-in owner's published row", async () => {
    const fake = fakeClient({ published: { design: editorialDesign, content } });
    mocks.createSupabaseServerClient.mockResolvedValue(fake.client);

    const state = await unpublishAction(idle);

    expect(state).toEqual({ status: "unpublished" });

    const remove = fake.calls.find((call) => call.op === "delete");

    expect(remove?.table).toBe("published_portfolios");
    expect(remove?.column).toBe("user_id");
    expect(remove?.value).toBe(USER);
  });

  it("AC-5 leaves the draft alone", async () => {
    const fake = fakeClient({ published: { design: editorialDesign, content } });
    mocks.createSupabaseServerClient.mockResolvedValue(fake.client);

    await unpublishAction(idle);

    expect(fake.calls.some((call) => call.table === "portfolios" && call.op !== "select")).toBe(
      false,
    );
  });

  it("AC-5 reports a failed delete instead of claiming success", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});

    const fake = fakeClient({ writeError: { message: "permission denied" } });
    mocks.createSupabaseServerClient.mockResolvedValue(fake.client);

    const state = await unpublishAction(idle);

    expect(state.status).toBe("error");
    vi.restoreAllMocks();
  });
});

describe("resetToPublishedAction", () => {
  it("AC-6 copies the published snapshot back into the signed-in owner's draft", async () => {
    const fake = fakeClient({
      published: { design: editorialDesign, content },
      draft: { design: editorialDesign, content: emptyContent() },
    });
    mocks.createSupabaseServerClient.mockResolvedValue(fake.client);

    const state = await resetToPublishedAction(idle);

    expect(state).toEqual({ status: "reset" });

    const update = fake.calls.find((call) => call.table === "portfolios" && call.op === "update");

    expect(update?.values).toEqual({ design: editorialDesign, content });
    expect(update?.column).toBe("user_id");
    expect(update?.value).toBe(USER);
  });

  it("AC-6 refuses when nothing is published", async () => {
    const fake = fakeClient({ published: null });
    mocks.createSupabaseServerClient.mockResolvedValue(fake.client);

    const state = await resetToPublishedAction(idle);

    expect(state.status).toBe("error");
    expect(fake.calls.some((call) => call.op === "update")).toBe(false);
  });
});
