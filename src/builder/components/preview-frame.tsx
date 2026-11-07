"use client";

import { useEffect, useState } from "react";

import { Portfolio } from "@/render/Portfolio";
import type { SkillNames } from "@/render/types";
import type { ContentDocument, DesignDocument, Profile } from "@/schema";

import { designFromMessage } from "../messages";

export type PreviewFrameProps = {
  initialDesign: DesignDocument;
  profile: Profile;
  content: ContentDocument;
  skills: SkillNames;
  fontClassName: string;
};

/**
 * The page inside the preview iframe (D-073).
 *
 * It renders the saved content through the real renderer and swaps in the design the
 * builder sends, so the owner sees their unsaved design without a database write.
 */
export function PreviewFrame({
  initialDesign,
  profile,
  content,
  skills,
  fontClassName,
}: PreviewFrameProps) {
  const [design, setDesign] = useState(initialDesign);

  useEffect(() => {
    function onMessage(event: MessageEvent) {
      const next = designFromMessage(event, {
        origin: window.location.origin,
        parent: window.parent,
      });

      if (next !== null) {
        setDesign(next);
      }
    }

    window.addEventListener("message", onMessage);

    return () => window.removeEventListener("message", onMessage);
  }, []);

  return (
    <div className={fontClassName}>
      <Portfolio profile={profile} design={design} content={content} skills={skills} />
    </div>
  );
}
