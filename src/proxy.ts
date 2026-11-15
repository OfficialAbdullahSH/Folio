import { NextResponse, type NextRequest } from "next/server";

import { redirectLocation } from "@/lib/auth/redirects";
import { updateSession } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  const { response, userId } = await updateSession(request);
  const target = redirectLocation(
    request.nextUrl.pathname,
    request.nextUrl.search,
    userId !== null,
  );

  if (target === null) {
    return response;
  }

  const queryStart = target.indexOf("?");
  const url = request.nextUrl.clone();
  url.pathname = queryStart === -1 ? target : target.slice(0, queryStart);
  url.search = queryStart === -1 ? "" : target.slice(queryStart);

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
