// app/api/proxy/login/route.ts

import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();

  const res = await fetch("https://kenyaeastklad.dukasasa.co.ke/api/customer/login?token=true", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  //console.log(res);

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}