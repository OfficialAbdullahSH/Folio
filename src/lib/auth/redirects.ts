export const LOGIN_PATH = "/login";
export const SIGNUP_PATH = "/signup";
export const DASHBOARD_PATH = "/dashboard";

/**
 * The route rules of AC-6, as a pure function so they can be tested without a
 * request. Returns the path to redirect to, or null to let the request through.
 */
export function redirectFor(pathname: string, signedIn: boolean): string | null {
  const path = pathname.replace(/\/+$/, "") || "/";

  if (signedIn) {
    if (path === LOGIN_PATH || path === SIGNUP_PATH) {
      return DASHBOARD_PATH;
    }

    return null;
  }

  if (path === DASHBOARD_PATH || path.startsWith(`${DASHBOARD_PATH}/`)) {
    return LOGIN_PATH;
  }

  return null;
}
