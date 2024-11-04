// src/app/api/auth/refresh/route.js
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

// Mock function to refresh the access token
async function refreshAccessToken() {
  // Replace this with real token refresh logic
  return {
    accessToken: "newAccessToken123",
    newRefreshToken: "newRefreshToken123",
  };
}

export async function GET() {
  const cookieStore = cookies();

  const refreshToken = (await cookieStore).get("refreshToken")?.value;

  console.log("kyuyyyyyy", refreshToken);

  if (!refreshToken) {
    return NextResponse.json(
      { message: "No refresh token provided" },
      { status: 401 }
    );
  }

  const { accessToken, newRefreshToken } = await refreshAccessToken();

  const response = NextResponse.json({ accessToken });

  if (newRefreshToken) {
    response.cookies.set("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 30 * 24 * 60 * 60,
    });
  }

  return response;
}
