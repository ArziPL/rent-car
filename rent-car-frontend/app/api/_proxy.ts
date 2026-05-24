/**
 * Generic proxy helper — reads the httpOnly token cookie, forwards the
 * request to the Spring backend, and returns the response verbatim.
 */
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const BACKEND = process.env.BACKEND_URL ?? "http://localhost:8080";

export async function proxyRequest(
  req: NextRequest,
  backendPath: string,
  method?: string
): Promise<NextResponse> {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  const init: RequestInit = {
    method: method ?? req.method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  };

  // Forward body for mutating methods
  const hasBody = !["GET", "HEAD"].includes(init.method as string);
  if (hasBody) {
    try {
      const body = await req.text();
      if (body) init.body = body;
    } catch {
      /* empty body */
    }
  }

  const res = await fetch(`${BACKEND}${backendPath}`, init);

  if (res.status === 204) {
    return new NextResponse(null, { status: 204 });
  }

  const data = await res.json().catch(() => null);
  return NextResponse.json(data, { status: res.status });
}
