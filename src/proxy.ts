import { NextResponse, type NextRequest } from "next/server";

import { redirectFor } from "@/lib/auth/redirects";
import { updateSession } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  const { response, userId } = await updateSession(request);
  const target = redirectFor(request.nextUrl.pathname, userId !== null);

  if (target === null) {
    return response;
  }

  const url = request.nextUrl.clone();
  url.pathname = target;
  url.search = "";

  const redirect = NextResponse.redirect(url);

  // The refreshed auth cookies live on `response`. Copying them keeps the browser
  // and the next request in step; without this a redirect can sign the user out.
  response.cookies.getAll().forEach((cookie) => {
    redirect.cookies.set(cookie);
  });

  for (const header of ["cache-control", "expires", "pragma"]) {
    const value = response.headers.get(header);

    if (value !== null) {
      redirect.headers.set(header, value);
    }
  }

  return redirect;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
