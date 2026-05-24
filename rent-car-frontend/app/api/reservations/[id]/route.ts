import { NextRequest } from "next/server";
import { proxyRequest } from "../../_proxy";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return proxyRequest(req, `/api/reservations/${id}`);
}
