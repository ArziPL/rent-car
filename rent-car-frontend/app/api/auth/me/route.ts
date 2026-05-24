import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const cookieStore = await cookies();
  const email = cookieStore.get("email")?.value;
  const role = cookieStore.get("role")?.value;

  if (!email || !role) {
    return NextResponse.json({ email: null, role: null }, { status: 200 });
  }

  return NextResponse.json({ email, role }, { status: 200 });
}
