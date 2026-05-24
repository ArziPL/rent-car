import { NextRequest } from "next/server";
import { proxyRequest } from "../../../../_proxy";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return proxyRequest(req, `/api/admin/vehicles/motorbikes/${id}`);
}
