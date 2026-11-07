"use client";

import { useRef, useState } from "react";
import { ImagePlus, Loader2, Trash2 } from "lucide-react";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";

import { cn } from "../lib/cn";
import {
  IMAGE_BUCKET,
  checkImageFile,
  newImagePath,
  type ImageType,
} from "../image-url";
import { BUTTON_SECONDARY, ERROR, HINT, ICON_BUTTON, INPUT_INVALID } from "../lib/styles";

const UPLOAD_FAILED = "We could not upload that image. Please try again.";

/**
 * Uploads a project image straight to the bucket (D-065).
 *
 * The file is checked here first so an obvious mistake gets an instant answer; the
 * bucket's own limits and the storage policy are what actually enforce it. The value
 * the editor keeps is the public URL, which the save action then checks again.
 */
export function ImageUpload({
  id,
  userId,
  projectLabel,
  imageUrl,
  error,
  onUploaded,
  onRemove,
}: {
  id: string;
  userId: string;
  projectLabel: string;
  imageUrl: string | undefined;
  error?: string;
  onUploaded: (url: string) => void;
  onRemove: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);

  const message = problem ?? error;

  async function upload(file: File) {
    const refusal = checkImageFile(file);

    if (refusal !== null) {
      setProblem(refusal);
      return;
    }

    setProblem(null);
    setBusy(true);

    try {
      const supabase = createSupabaseBrowserClient();
      const path = newImagePath(userId, file.type as ImageType, crypto.randomUUID());
      const { error: uploadError } = await supabase.storage
        .from(IMAGE_BUCKET)
        .upload(path, file, { contentType: file.type, upsert: false });

      if (uploadError !== null) {
        console.error("[folio] image upload failed", uploadError.message);
        setProblem(UPLOAD_FAILED);
        return;
      }

      const { data } = supabase.storage.from(IMAGE_BUCKET).getPublicUrl(path);
      onUploaded(data.publicUrl);
    } catch (uploadError) {
      console.error(
        "[folio] image upload failed",
        uploadError instanceof Error ? uploadError.message : "unknown error",
      );
      setProblem(UPLOAD_FAILED);
    } finally {
      setBusy(false);

      if (inputRef.current !== null) {
        inputRef.current.value = "";
      }
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium text-ink">Image</span>

      {imageUrl !== undefined ? (
        <div className="flex flex-col gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element -- D-039: plain image, no remote-domain config in v1 */}
          <img
            src={imageUrl}
            alt={`Preview of ${projectLabel}`}
            className="h-40 w-full rounded-md border border-rule object-cover"
          />
          <button
            type="button"
            className={cn(ICON_BUTTON, "w-auto gap-2 border-transparent px-2 text-danger hover:bg-danger-surface")}
            onClick={onRemove}
            aria-label={`Remove the image from ${projectLabel}`}
          >
            <Trash2 aria-hidden="true" size={18} />
            <span className="text-sm font-medium">Remove image</span>
          </button>
        </div>
      ) : null}

      <div className="relative flex flex-wrap items-center gap-3">
        <input
          ref={inputRef}
          id={id}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          disabled={busy}
          onChange={(event) => {
            const file = event.target.files?.[0];

            if (file !== undefined) {
              void upload(file);
            }
          }}
        />
        <label
          htmlFor={id}
          aria-disabled={busy}
          className={cn(
            BUTTON_SECONDARY,
            "cursor-pointer peer-focus-visible:ring-2 peer-focus-visible:ring-cta peer-focus-visible:ring-offset-2",
            busy && "pointer-events-none opacity-50",
            message !== undefined && INPUT_INVALID,
          )}
        >
          {busy ? (
            <Loader2 aria-hidden="true" size={18} className="animate-spin motion-reduce:animate-none" />
          ) : (
            <ImagePlus aria-hidden="true" size={18} />
          )}
          {busy ? "Uploading…" : imageUrl !== undefined ? "Replace image" : "Choose image"}
        </label>
        <span className={HINT}>JPEG, PNG or WebP, up to 2 MB.</span>
      </div>

      <p role="status" aria-live="polite" className="sr-only">
        {busy ? "Uploading the image" : ""}
      </p>

      {message !== undefined ? <p className={ERROR}>{message}</p> : null}
    </div>
  );
}
