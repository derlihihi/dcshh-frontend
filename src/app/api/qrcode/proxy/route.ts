// src/app/api/qrcode/proxy/route.ts
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  let accessToken: string | undefined;
  let data: string | undefined;

  try {
    const body = await request.json();
    accessToken = body.accessToken;
    data = body.data;
  } catch {
    return NextResponse.json({ error: "請提供正確的 JSON 請求" }, { status: 400 });
  }

  // ⚙️ 模擬模式開關
  const USE_MOCK_QRCODE = true; // ✅ 串接後改成 false

  // ✅ 模擬：手動輸入 QRCode base64
  const MOCK_QRCODE =
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAZAAAAGQCAIAAAAP3aGbAABF8UlEQ"; // 你可以手動替換這段

  // 🧩 模擬模式（目前尚未串接後端）
  if (USE_MOCK_QRCODE) {
    console.log("⚠️ 使用手動輸入 QRCode 模擬資料");
    return NextResponse.json(
      {
        success: true,
        source: "mock",
        qrcodeImage: MOCK_QRCODE,
      },
      { status: 200 }
    );
  }

  // 🚨 若沒開啟模擬模式，就執行實際後端串接
  if (!accessToken?.trim()) {
    return NextResponse.json({ error: "Access token 必填" }, { status: 400 });
  }

  if (!data || typeof data !== "string") {
    return NextResponse.json({ error: "data 必須是 JSON 字串" }, { status: 400 });
  }

  console.log("準備送往官方 API 的 data:", data);

  try {
    const apiRes = await fetch("https://issuer-sandbox.wallet.gov.tw/api/qrcode/data", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Access-Token": accessToken.trim(),
      },
      body: JSON.stringify({ data }),
    });

    const rawText = await apiRes.text();
    console.log("官方 API 原始回傳:", rawText);

    let result;
    try {
      result = JSON.parse(rawText);
    } catch {
      return NextResponse.json(
        { error: "官方回應非 JSON", raw: rawText.slice(0, 500) },
        { status: 500 }
      );
    }

    if (!apiRes.ok) {
      return NextResponse.json(
        {
          error: result.message || "API 錯誤",
          code: result.code,
          status: apiRes.status,
        },
        { status: apiRes.status }
      );
    }

    const qrCodeValue = result.qrCode || result.qrcodeImage; // 有些後端會用 qrcodeImage
    if (!qrCodeValue) {
      return NextResponse.json({ error: "缺少 qrCode 欄位" }, { status: 400 });
    }

    return NextResponse.json(
      {
        success: true,
        source: "api",
        qrcodeImage: qrCodeValue,
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("Proxy 錯誤:", err);
    return NextResponse.json(
      { error: err.message || "網路錯誤" },
      { status: 502 }
    );
  }
}
