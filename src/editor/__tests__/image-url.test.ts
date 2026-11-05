import { describe, expect, it } from "vitest";

import {
  IMAGE_BUCKET,
  IMAGE_MAX_BYTES,
  IMAGE_TYPES,
  checkImageFile,
  imageUrlPrefix,
  isProjectImageUrl,
  newImagePath,
} from "../image-url";

const PREFIX = imageUrlPrefix("https://project.supabase.co");
const USER = "11111111-1111-4111-8111-111111111111";
const ID = "33333333-3333-4333-8333-333333333333";

describe("imageUrlPrefix", () => {
  it("AC-10 builds the public URL prefix of the bucket", () => {
    expect(PREFIX).toBe(
      `https://project.supabase.co/storage/v1/object/public/${IMAGE_BUCKET}/`,
    );
  });

  it("AC-10 tolerates a trailing slash on the project URL", () => {
    expect(imageUrlPrefix("https://project.supabase.co/")).toBe(PREFIX);
    expect(imageUrlPrefix("https://project.supabase.co///")).toBe(PREFIX);
  });
});

describe("isProjectImageUrl", () => {
  it("AC-10 accepts a URL this app could have uploaded", () => {
    expect(isProjectImageUrl(`${PREFIX}${USER}/${ID}.png`, PREFIX)).toBe(true);
    expect(isProjectImageUrl(`${PREFIX}${USER}/${ID}.jpg`, PREFIX)).toBe(true);
    expect(isProjectImageUrl(`${PREFIX}${USER}/${ID}.jpeg`, PREFIX)).toBe(true);
    expect(isProjectImageUrl(`${PREFIX}${USER}/${ID}.webp`, PREFIX)).toBe(true);
  });

  it("AC-10 rejects another host", () => {
    expect(isProjectImageUrl("https://evil.test/folio.png", PREFIX)).toBe(false);
  });

  it("AC-10 rejects a URL that only contains the prefix", () => {
    expect(isProjectImageUrl(`https://evil.test/?u=${PREFIX}${USER}/${ID}.png`, PREFIX)).toBe(
      false,
    );
  });

  it("AC-10 rejects a path that climbs out of the bucket", () => {
    expect(isProjectImageUrl(`${PREFIX}${USER}/../other/${ID}.png`, PREFIX)).toBe(false);
  });

  it("AC-10 rejects a different bucket on the same project", () => {
    expect(
      isProjectImageUrl(
        `https://project.supabase.co/storage/v1/object/public/avatars/${USER}/${ID}.png`,
        PREFIX,
      ),
    ).toBe(false);
  });

  it("AC-10 rejects a query string, a fragment and an absolute path", () => {
    expect(isProjectImageUrl(`${PREFIX}${USER}/${ID}.png?download=1`, PREFIX)).toBe(false);
    expect(isProjectImageUrl(`${PREFIX}${USER}/${ID}.png#top`, PREFIX)).toBe(false);
    expect(isProjectImageUrl(`${PREFIX}/${USER}/${ID}.png`, PREFIX)).toBe(false);
  });

  it("AC-10 rejects an extension that is not an allowed image type", () => {
    expect(isProjectImageUrl(`${PREFIX}${USER}/${ID}.svg`, PREFIX)).toBe(false);
    expect(isProjectImageUrl(`${PREFIX}${USER}/${ID}.gif`, PREFIX)).toBe(false);
    expect(isProjectImageUrl(`${PREFIX}${USER}/no-extension`, PREFIX)).toBe(false);
  });

  it("AC-10 rejects a bare prefix and an empty string", () => {
    expect(isProjectImageUrl(PREFIX, PREFIX)).toBe(false);
    expect(isProjectImageUrl("", PREFIX)).toBe(false);
  });
});

describe("checkImageFile", () => {
  it("AC-10 accepts the three allowed types under the limit", () => {
    for (const type of IMAGE_TYPES) {
      expect(checkImageFile({ type, size: 1024 })).toBeNull();
    }
  });

  it("AC-10 refuses a file over 2 MB", () => {
    expect(checkImageFile({ type: "image/png", size: IMAGE_MAX_BYTES + 1 })).toBe(
      "That image is larger than 2 MB. Please choose a smaller one.",
    );
    expect(checkImageFile({ type: "image/png", size: IMAGE_MAX_BYTES })).toBeNull();
  });

  it("AC-10 refuses a type the bucket does not accept", () => {
    expect(checkImageFile({ type: "image/gif", size: 1024 })).toBe(
      "Use a JPEG, PNG or WebP image.",
    );
    expect(checkImageFile({ type: "application/pdf", size: 1024 })).toBe(
      "Use a JPEG, PNG or WebP image.",
    );
  });

  it("AC-10 refuses an empty file", () => {
    expect(checkImageFile({ type: "image/png", size: 0 })).toBe(
      "That file is empty. Please choose another image.",
    );
  });
});

describe("newImagePath", () => {
  it("AC-10 puts the upload in the user's own folder under a random name", () => {
    expect(newImagePath(USER, "image/png", ID)).toBe(`${USER}/${ID}.png`);
    expect(newImagePath(USER, "image/jpeg", ID)).toBe(`${USER}/${ID}.jpg`);
    expect(newImagePath(USER, "image/webp", ID)).toBe(`${USER}/${ID}.webp`);
  });

  it("AC-10 never uses a name the user could have chosen", () => {
    const path = newImagePath(USER, "image/png", ID);

    expect(path.startsWith(`${USER}/`)).toBe(true);
    expect(path).not.toContain("..");
    expect(path).not.toContain("..");
    expect(path.slice(USER.length + 1)).toBe(`${ID}.png`);
  });
});
