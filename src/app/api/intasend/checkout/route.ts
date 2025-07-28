import { NextResponse } from "next/server";
import IntaSend from "intasend-node";

const IS_PUBLIC_KEY = process.env.INTASEND_PUBLISHABLE_KEY!;
const IS_PRIVATE_KEY = process.env.INTASEND_BEARER_TOKEN!;
const IS_TEST_MODE = false; // Set to false in production

const intasend = new IntaSend(IS_PUBLIC_KEY, IS_PRIVATE_KEY, IS_TEST_MODE);
const collection = intasend.collection();

export async function POST(req: Request) {
  const body = await req.json();
  const { name = "Customer User", email, phone, amount, orderId } = body;

  const [firstName, lastName = "User"] = name.split(" ");
  const reference = orderId || `order-${Date.now()}`;

  try {
    // ✅ Trigger both STK Push and Checkout URL
    const [stkResp, checkoutResp] = await Promise.all([
      collection.mpesaStkPush({
        first_name: firstName,
        last_name: lastName,
        email,
        phone_number: phone,
        amount: Number(amount),
        host: "https://medusapro.dukasasa.co.ke",
        api_ref: reference,
      }),
      collection.charge({
        first_name: firstName,
        last_name: lastName,
        email,
        amount: Number(amount),
        currency: "KES",
        host: "https://medusapro.dukasasa.co.ke",
        api_ref: reference,
        redirect_url: "https://medusapro.dukasasa.co.ke/receipt",
        callback_url: "https://medusapro.dukasasa.co.ke/api/intasend/callback",
      }),
    ]);

    return NextResponse.json({
      success: true,
      stk_invoice: stkResp.invoice,
      checkout_link: checkoutResp.redirect_url,
      checkout_invoice: checkoutResp.invoice,
    });
  } catch (err: any) {
    console.error("❌ IntaSend Error:", err?.response?.data || err.message);
    return NextResponse.json(
      { success: false, error: err?.response?.data || err.message },
      { status: 500 }
    );
  }
}