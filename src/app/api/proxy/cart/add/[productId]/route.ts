import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const BAGISTO_URL = "https://kenyaeastklad.dukasasa.co.ke/api";

export async function POST(
  req: NextRequest,
  { params }: { params: { productId: string } }
) {
  const body = await req.json();
  const cookieStore = cookies();
  const session = cookieStore.get("bagisto_session");
  const authHeader = req.headers.get("authorization");

  console.log("🛒 Add to Cart Attempt");
  console.log("Product ID:", params.productId);
  console.log("Payload:", JSON.stringify(body, null, 2));
  console.log("Auth Header:", authHeader);
  console.log("Session Cookie:", session?.value);

  const headers: Record<string, string> = {
    Accept: "application/json",
    "Content-Type": "application/json",
  };

  if (authHeader?.startsWith("Bearer ")) {
    headers["Authorization"] = authHeader;
  } else if (session?.value) {
    headers["Cookie"] = `bagisto_session=${session.value}`;
  }
  console.log("✅  Headers being sent to Bagisto: ", headers, body);

  try {
    const res = await fetch(
      `${BAGISTO_URL}/checkout/cart/add/${params.productId}`,
      {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      }
    );
    const settCookie = res.headers.get("set-cookie") // <-- extract the session
    console.log("✅  extracted session: ", settCookie);

    const text = await res.text();
    //console.log(text);

    let data: any;
    try {
      data = JSON.parse(text);
    } catch {
      console.error("❌ Invalid JSON from Bagisto:", text);
      return NextResponse.json(
        { success: false, message: "Invalid JSON from Bagisto", raw: text },
        { status: 502 }
      );
    }

    // 🔍 Check for known Bagisto error
    if (
      data?.error?.message?.includes(
        "Trying to get property 'status' of non-object"
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Likely invalid payload for product type.",
          error: data.error,
        },
        { status: 400 }
      );
    }

    // ✅ Set session cookie if returned from Bagisto
    const setCookie = res.headers.get("set-cookie");
    const nextRes = NextResponse.json(
      { success: res.ok, data },
      { status: res.status }
    );

    if (setCookie) {
      const match = setCookie.match(/bagisto_session=([^;]+);/);
      if (match) {
        nextRes.cookies.set("bagisto_session", match[1], {
          path: "/",
          httpOnly: false, // ❗ Must be false for browser to access cookie
          sameSite: "lax",
          secure: true,
        });
      }
    }

    return nextRes;
  } catch (error: any) {
    console.error("❌ Add to Cart Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to connect to Bagisto or invalid payload.",
        error: error.message || error,
      },
      { status: 500 }
    );
  }
}