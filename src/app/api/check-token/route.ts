import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

export async function GET() {
  try {
    const cookieStore = cookies();
    const token = (await cookieStore).get("token")?.value;

    if (!token) return NextResponse.json({ valid: false }, { status: 401 });

    jwt.verify(token, JWT_SECRET);

    return NextResponse.json({ valid: true });
  } catch (err) {
    console.error("Token verification error:", err);
    return NextResponse.json({ valid: false }, { status: 401 });
  }
}
