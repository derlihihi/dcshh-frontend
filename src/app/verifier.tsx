"use client";

import { useState } from "react";
import { FaHospital, FaSchool, FaPlane } from "react-icons/fa";
import "./verifier.css";
import "./issuer.css";

// 💡 定義情境與參考編號的對應表
const SCENE_REF_MAP = {
  hospital: "00000000_t001", // 醫療院所
  school: "00000000_t002",   // 學校
  travel: "00000000_t003",    // 旅遊
};

export default function VerifierPage() {
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [verifyResult, setVerifyResult] = useState<any>(null);
  
  // 🚀 新增：儲存當前情境的參考編號 (ref)
  const [sceneRef, setSceneRef] = useState<string | null>(null); 

  const handleScene = async (scene: keyof typeof SCENE_REF_MAP) => {
    setVerifyResult(null);
    
    // 1. 取得並儲存對應的參考編號
    const newRef = SCENE_REF_MAP[scene] || null;
    setSceneRef(newRef); // <--- 儲存 ref
    console.log(newRef)
    if (!newRef) {
        alert("無效的情境選擇");
        return;
    }

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL;
      // 依據你的後端設計，使用 GET 並在 Query 帶上 scene
      const res = await fetch(`${API_URL}/api/oidvp/qrcode?ref=${newRef}`, {
        method: "GET",
      });
      const data = await res.json();

      setTransactionId(data.transactionId);
      setQrCodeUrl(data.qrcodeImage);
    } catch (err) {
      console.error("無法取得 QRCode 錯誤:", err); 
      alert("無法取得 QRCode");
    }
  };

  const handleVerify = async () => {
    if (!transactionId) return alert("請先取得 QRCode");
    // 確保有參考編號
    if (!sceneRef) return alert("情境參考編號遺失，請重新選擇情境"); 

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL;

      // 🚨 調整：將 sceneRef 加入 POST 請求的 Body
      const res = await fetch(
        `${API_URL}/api/oidvp/result`, 
        {
          method: "POST", 
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            transactionId: transactionId, 
            ref: sceneRef, // <--- 傳遞 sceneRef 給後端
          }),
        }
      );
      
      const data = await res.json();

      // 保留完整回傳資料，供後續處理
      setVerifyResult(data);
    } catch (err) {
      console.error("驗證檢查錯誤:", err); 
      setVerifyResult({ error: "系統錯誤" });
    }
  };

  return (
    <div className="space-y-8">
      <div className="scene-row">
        {/* 傳遞情境字串，必須與 SCENE_REF_MAP 的 Key 相符 */}
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
          
          {/* 顯示當前的參考編號，方便確認 (可移除) */}


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