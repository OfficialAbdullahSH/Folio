export const LOGIN_PATH = "/login";
export const SIGNUP_PATH = "/signup";
export const DASHBOARD_PATH = "/dashboard";
/**
 * Where a signed-out visitor lands (AC-8). The landing page, not the login
 * page: a person who has just left does not want the form they just filled in.
 */
export const SIGNED_OUT_PATH = "/";

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

/**
 * The same rules, as a location to send the browser to (D-097).
 *
 * An anonymous visitor who asks for a protected page is sent to the login page with
 * the page they asked for, so logging in returns them there instead of dropping them
 * on the dashboard. The value is a path this app built, and `safeNextPath` checks it
 * again when it comes back, because the visitor can edit the URL in between.
 */
export function redirectLocation(
  pathname: string,
  search: string,
  signedIn: boolean,
): string | null {
  const target = redirectFor(pathname, signedIn);

  if (target !== LOGIN_PATH) {
    return target;
  }

  const asked = `${pathname.replace(/\/+$/, "") || "/"}${search}`;

  return `${LOGIN_PATH}?next=${encodeURIComponent(asked)}`;
}
