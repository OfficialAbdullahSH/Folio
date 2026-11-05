"use client";

import { Plus } from "lucide-react";

import { CONTACT_KINDS, LIMITS } from "@/schema";
import type { ContactItem } from "@/schema";
import { CONTACT_KIND_LABELS } from "@/render/worlds/labels";

import type { EditorAction } from "../reducer";
import { BUTTON_SECONDARY, INPUT, ITEM_CARD, LABEL } from "../lib/styles";
import { TextField } from "./field";
import { ItemActions } from "./item-actions";
import { EditorSection, EmptyList } from "./section-card";

const PLACEHOLDERS: Record<ContactItem["kind"], string> = {
  email: "you@example.com",
  github: "https://github.com/you",
  linkedin: "https://linkedin.com/in/you",
  website: "https://your-site.com",
  x: "https://x.com/you",
  other: "https://example.com",
};

export function ContactList({
  contact,
  errors,
  dispatch,
  onAdd,
}: {
  contact: ContactItem[];
  errors: Record<string, string>;
  dispatch: (action: EditorAction) => void;
  onAdd: () => void;
}) {
  const canAdd = contact.length < LIMITS.contact;

  return (
    <EditorSection
      id="contact"
      title="Contact"
      description={`How people reach you, up to ${LIMITS.contact} links.`}
      action={
        <button type="button" className={BUTTON_SECONDARY} onClick={onAdd} disabled={!canAdd}>
          <Plus aria-hidden="true" size={18} />
          Add contact
        </button>
      }
    >
      {contact.length === 0 ? (
        <EmptyList>No contact details yet. Add an email so people can reach you.</EmptyList>
      ) : null}

      <ul className="flex flex-col gap-4">
        {contact.map((item, index) => {
          const base = `contact.items.${index}`;
          const heading = item.label.trim().length > 0 ? item.label.trim() : `link ${index + 1}`;

          return (
            <li key={item.id} className={ITEM_CARD}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <h3 className="text-sm font-semibold text-ink">
                  {index + 1}. {heading}
                </h3>
                <ItemActions
                  label={heading}
                  index={index}
                  count={contact.length}
                  onMove={(direction) => dispatch({ type: "moveContact", id: item.id, direction })}
                  onRemove={() => dispatch({ type: "removeContact", id: item.id })}
                />
              </div>

              <div className="mt-4 flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor={`field-${base}.kind`} className={LABEL}>
                    Kind
                  </label>
                  <select
                    id={`field-${base}.kind`}
                    value={item.kind}
                    onChange={(event) =>
                      dispatch({
                        type: "setContactKind",
                        id: item.id,
                        kind: event.target.value as ContactItem["kind"],
                      })
                    }
                    className={INPUT}
                  >
                    {CONTACT_KINDS.map((kind) => (
                      <option key={kind} value={kind}>
                        {CONTACT_KIND_LABELS[kind]}
                      </option>
                    ))}
                  </select>
                </div>

                <TextField
                  id={`field-${base}.label`}
                  label="Label"
                  required
                  value={item.label}
                  maxLength={LIMITS.contactLabel}
                  error={errors[`${base}.label`]}
                  placeholder="Email"
                  onChange={(value) =>
                    dispatch({ type: "setContactField", id: item.id, field: "label", value })
                  }
                />

                <TextField
                  id={`field-${base}.value`}
                  label="Address"
                  required
                  inputMode={item.kind === "email" ? "email" : "url"}
                  value={item.value}
                  maxLength={LIMITS.url}
                  error={errors[`${base}.value`]}
                  hint={
                    item.kind === "email"
                      ? "A plain email address, not a mailto: link."
                      : "A full address starting with https://"
                  }
                  placeholder={PLACEHOLDERS[item.kind]}
                  onChange={(value) =>
                    dispatch({ type: "setContactField", id: item.id, field: "value", value })
                  }
                />
              </div>
            </li>
          );
        })}
      </ul>

      {!canAdd ? (
        <p className="text-sm text-ink-soft">
          That is the maximum of {LIMITS.contact} contacts. Remove one to add another.
        </p>
      ) : null}
    </EditorSection>
  );
}
