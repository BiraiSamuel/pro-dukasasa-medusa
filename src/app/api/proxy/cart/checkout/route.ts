import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const BAGISTO_BASE_URL = "https://kenyaeastklad.dukasasa.co.ke";

export async function POST(req: NextRequest) {
  try {
    const cookieStore = cookies();
    const sessionCookie = cookieStore.get("bagisto_session")?.value || "";
    const authHeader = req.headers.get("authorization");

    const headers: Record<string, string> = {
      Accept: "application/json",
    };

    // Prefer Authorization: Bearer token if available
    if (authHeader && authHeader.startsWith("Bearer ")) {
      headers.Authorization = authHeader;
    } else if (sessionCookie) {
      headers.Cookie = `bagisto_session=${sessionCookie}`;
    }

    const res = await fetch(`${BAGISTO_BASE_URL}/api/checkout/save-order`, {
      method: "POST",
      headers,
    });

    const data = await res.json();
    console.log(data);

    return NextResponse.json(data, { status: res.status });
  } catch (error: any) {
    console.error("❌ Checkout error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Checkout failed" },
      { status: 500 }
    );
  }
}