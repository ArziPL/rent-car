import { NextRequest } from "next/server";
import { proxyRequest } from "../_proxy";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const qs = searchParams.toString();
  return proxyRequest(req, `/api/vehicles${qs ? `?${qs}` : ""}`);
}
