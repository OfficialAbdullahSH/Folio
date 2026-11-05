/**
 * The rules for a project image (D-025, D-065, D-066).
 *
 * One module owns the bucket name, the accepted types, the public URL prefix and
 * the check the server runs on save, so the browser and the server cannot drift.
 */

export const IMAGE_BUCKET = "project-images";

export const IMAGE_MAX_BYTES = 2 * 1024 * 1024;

export const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

export type ImageType = (typeof IMAGE_TYPES)[number];

const EXTENSIONS: Record<ImageType, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

const ALLOWED_EXTENSIONS = /\.(jpe?g|png|webp)$/i;

/** The public prefix every stored image URL must start with (D-066). */
export function imageUrlPrefix(supabaseUrl: string): string {
  return `${supabaseUrl.replace(/\/+$/, "")}/storage/v1/object/public/${IMAGE_BUCKET}/`;
}

export function isImageType(value: string): value is ImageType {
  return (IMAGE_TYPES as readonly string[]).includes(value);
}

/** A friendly reason to refuse a file, or null when it is acceptable. */
export function checkImageFile(file: { type: string; size: number }): string | null {
  if (!isImageType(file.type)) {
    return "Use a JPEG, PNG or WebP image.";
  }

  if (file.size > IMAGE_MAX_BYTES) {
    return "That image is larger than 2 MB. Please choose a smaller one.";
  }

  if (file.size === 0) {
    return "That file is empty. Please choose another image.";
  }

  return null;
}

/**
 * The object path for a new upload: `<user id>/<random uuid>.<ext>`.
 *
 * The name is never taken from the file the user picked, so an upload cannot
 * choose where it lands or what it is called (D-065). The first folder segment is
 * the user id, which is what the storage policy checks.
 */
export function newImagePath(userId: string, type: ImageType, id: string): string {
  return `${userId}/${id}.${EXTENSIONS[type]}`;
}

/**
 * True only for a URL inside this project's bucket.
 *
 * An exact prefix check, not a substring one: `https://evil.test/?x=<prefix>`
 * and `<prefix>/../../other/x.png` are both rejected (D-066).
 */
export function isProjectImageUrl(value: string, prefix: string): boolean {
  if (!value.startsWith(prefix)) {
    return false;
  }

  const path = value.slice(prefix.length);

  if (path.length === 0 || path.startsWith("/")) {
    return false;
  }

  if (path.includes("..") || path.includes("@") || path.includes("\\")) {
    return false;
  }

  if (path.includes("?") || path.includes("#")) {
    return false;
  }

  return ALLOWED_EXTENSIONS.test(path);
}
