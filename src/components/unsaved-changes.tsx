"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { leaveSession, NO_LEAVE_SESSION } from "@/lib/navigation/leave-session";

import { ConfirmDialog } from "./confirm-dialog";

/**
 * The unsaved-changes guard (D-098, D-104).
 *
 * The provider holds one flag for the whole app shell. The editor and the builder
 * raise it while their document differs from what was saved; every link in the header,
 * the tab bar and the page asks before it navigates. `beforeunload` in those two
 * screens still covers closing the tab or reloading, which no click handler can see.
 *
 * It also counts Leave decisions. Clearing the flag is not enough to discard: Next keeps
 * the route the owner left mounted but hidden, so the screen's own state outlives the
 * navigation. A screen watches `discardToken` and puts its saved document back when it
 * changes, which is what makes Leave mean discard.
 */

type UnsavedChangesValue = {
  dirty: boolean;
  setDirty: (dirty: boolean) => void;
  /** Resolves true when the owner chose to leave and lose the changes. */
  askLeave: () => Promise<boolean>;
  /** Bumped by every Leave decision. */
  discardToken: number;
};

const NO_PROVIDER: UnsavedChangesValue = {
  dirty: false,
  setDirty: () => {},
  askLeave: async () => true,
  discardToken: 0,
};

const UnsavedChangesContext = createContext<UnsavedChangesValue | null>(null);

export function useUnsavedChanges(): UnsavedChangesValue {
  return useContext(UnsavedChangesContext) ?? NO_PROVIDER;
}

export function UnsavedChangesProvider({ children }: { children: ReactNode }) {
  const [session, dispatch] = useReducer(leaveSession, NO_LEAVE_SESSION);
  const [open, setOpen] = useState(false);
  const resolver = useRef<((leave: boolean) => void) | null>(null);

  const setDirty = useCallback((dirty: boolean) => {
    dispatch({ type: "setDirty", dirty });
  }, []);

  const askLeave = useCallback(
    () =>
      new Promise<boolean>((resolve) => {
        resolver.current = resolve;
        setOpen(true);
      }),
    [],
  );

  const answer = useCallback((leave: boolean) => {
    setOpen(false);

    if (leave) {
      dispatch({ type: "leave" });
    }

    const resolve = resolver.current;
    resolver.current = null;
    resolve?.(leave);
  }, []);

  const value = useMemo(
    () => ({
      dirty: session.dirty,
      setDirty,
      askLeave,
      discardToken: session.discardToken,
    }),
    [session.dirty, session.discardToken, setDirty, askLeave],
  );

  return (
    <UnsavedChangesContext.Provider value={value}>
      {children}
      <ConfirmDialog
        open={open}
        title="Leave without saving?"
        description="Your unsaved changes will be lost. Save first if you want to keep them."
        confirmLabel="Leave and lose changes"
        onConfirm={() => answer(true)}
        onCancel={() => answer(false)}
      />
    </UnsavedChangesContext.Provider>
  );
}
