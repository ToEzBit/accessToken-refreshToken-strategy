import { NextResponse } from "next/server";

export async function POST() {
  // const { email, password } = await request.json();

  const res = await fetch("http://localhost:8888/auth/login", {
    method: "post",
  });

  const { accessToken, refreshToken } = await res.json();

  const response = NextResponse.json({ accessToken });

  response.cookies.set("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  });

  return response;
}
