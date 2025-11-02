"use client";

import { useState } from "react";
import { FaHospital, FaSchool, FaPlane } from "react-icons/fa";
import "./verifier.css";
import "./issuer.css";

export default function VerifierPage() {
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [verifyResult, setVerifyResult] = useState<any>(null); // 保留原始回傳

  const handleScene = async (scene: string) => {
    setVerifyResult(null);
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL;
      const res = await fetch(`${API_URL}/api/oidvp/qrcode`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scene }),
      });
      const data = await res.json();

      setTransactionId(data.transactionId);
      setQrCodeUrl(data.qrcodeImage);
    } catch (err) {
      alert("無法取得 QRCode");
    }
  };

  const handleVerify = async () => {
    if (!transactionId) return alert("請先取得 QRCode");

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL;
      const res = await fetch(
        `${API_URL}/api/oidvp/verify?transactionId=${transactionId}`
      );
      const data = await res.json();

      // 保留完整回傳資料，供後續處理
      setVerifyResult(data);
    } catch (err) {
      setVerifyResult({ error: "系統錯誤" });
    }
  };

  return (
    <div className="space-y-8">
      <div className="scene-row">
        <div className="scene-card" onClick={() => handleScene("hospital")}>
          <FaHospital className="scene-icon text-red-500" />
          <p className="scene-text">醫療院所</p>
        </div>
        <div className="scene-card" onClick={() => handleScene("school")}>
          <FaSchool className="scene-icon text-yellow-500" />
          <p className="scene-text">學校</p>
        </div>
        <div className="scene-card" onClick={() => handleScene("travel")}>
          <FaPlane className="scene-icon text-blue-500" />
          <p className="scene-text">旅遊</p>
        </div>
      </div>

      {qrCodeUrl && (
        <>
          <div className="qr-sticky">
            <img src={qrCodeUrl} alt="驗證 QR Code" />
            <p>請掃描此 QR Code</p>
          </div>

          <div className="text-center">
            <button
              onClick={handleVerify}
              className="bg-green-500 text-white px-8 py-3 rounded-xl text-lg font-bold hover:bg-green-600 transition"
            >
              驗證檢查
            </button>
          </div>

          {verifyResult && (
            <div className="mt-6 p-6 bg-blue-50 rounded-xl border border-blue-200">
              <h3 className="font-bold text-blue-800 mb-2">驗證結果</h3>
              <pre className="text-sm text-left whitespace-pre-wrap bg-white p-4 rounded border">
                {JSON.stringify(verifyResult, null, 2)}
              </pre>
            </div>
          )}
        </>
      )}
    </div>
  );
}