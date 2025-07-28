// app/api/intasend/callback/route.ts
import { NextResponse } from "next/server";

// 👇 Replace this with your DB or order service
async function markOrderAsPaid(orderId: string, txnId: string) {
  console.log(`✅ Marking order ${orderId} as paid. IntaSend TXN: ${txnId}`);
  // Example:
  // await db.order.update({ where: { id: orderId }, data: { status: "paid", paymentTxnId: txnId } });
}

export async function POST(req: Request) {
  const url = new URL(req.url || "");
  const orderId = url.searchParams.get("order_id");

  const body = await req.json();
  const { event, data } = body;

  if (event === "payment.successful" && orderId && data?.tracking_id) {
    await markOrderAsPaid(orderId, data.tracking_id);
    return NextResponse.json({ received: true });
  }

  return NextResponse.json({ received: false }, { status: 400 });
}