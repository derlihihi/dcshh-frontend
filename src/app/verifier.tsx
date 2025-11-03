"use client";

import { useState, useEffect } from "react";
import { FaHospital, FaSchool, FaPlane } from "react-icons/fa";
import "./verifier.css";
import "./issuer.css";

// 💡 定義情境與參考編號的對應表
const SCENE_REF_MAP = {
  hospital: "00000000_t001", // 醫療院所
  school: "00000000_t002", // 學校
  travel: "00000000_t003", // 旅遊
};

export default function VerifierPage() {
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [authUri, setAuthUri] = useState<string | null>(null); // 🔹 新增 authUri 狀態
  const [verifyResult, setVerifyResult] = useState<any>(null);
  const [sceneRef, setSceneRef] = useState<string | null>(null);
  const [currentScene, setCurrentScene] =
    useState<keyof typeof SCENE_REF_MAP | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  // 倒數計時器
  useEffect(() => {
    if (!showModal || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((t) => (t > 0 ? t - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [showModal, timeLeft]);

  // 🎯 產生 QRCode
  const handleScene = async (scene: keyof typeof SCENE_REF_MAP) => {
    setVerifyResult(null);
    setCurrentScene(scene);

    const newRef = SCENE_REF_MAP[scene] || null;
    setSceneRef(newRef);
    if (!newRef) {
      alert("無效的情境選擇");
      return;
    }

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL;
      const res = await fetch(`${API_URL}/api/oidvp/qrcode?ref=${newRef}`, {
        method: "GET",
      });
      const data = await res.json();

      setTransactionId(data.transactionId);
      setQrCodeUrl(data.qrcodeImage);
      setAuthUri(data.authUri || null); // 🔹 接收 authUri
      setShowModal(true);
      setTimeLeft(300);
    } catch (err) {
      console.error("無法取得 QRCode 錯誤:", err);
      alert("無法取得 QRCode");
    }
  };

  // 🎯 驗證結果
  const handleVerify = async () => {
    if (!transactionId) return alert("請先取得 QRCode");
    if (!sceneRef) return alert("情境參考編號遺失，請重新選擇情境");

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL;
      const res = await fetch(`${API_URL}/api/oidvp/result`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transactionId: transactionId,
          ref: sceneRef,
        }),
      });

      const data = await res.json();
      setVerifyResult(data);
    } catch (err) {
      console.error("驗證檢查錯誤:", err);
      setVerifyResult({ error: "系統錯誤" });
    }
  };

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60).toString().padStart(2, "0");
    const s = (sec % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  // 🧩 顯示疫苗接種資料的表格
  const renderVaccineTable = () => {
    if (!verifyResult) return null;

    const vaccines =
      verifyResult.vaccines ||
      verifyResult.immunizations ||
      verifyResult.data?.vaccines ||
      verifyResult.data?.immunizations;

    if (!Array.isArray(vaccines) || vaccines.length === 0) return null;

    return (
      <table className="w-full mt-4 border-collapse border border-gray-300 bg-white rounded-lg">
        <thead className="bg-blue-100">
          <tr>
            <th className="border border-gray-300 px-4 py-2 text-left">疫苗名稱</th>
            <th className="border border-gray-300 px-4 py-2 text-left">接種日期</th>
          </tr>
        </thead>
        <tbody>
          {vaccines.map((v: any, idx: number) => (
            <tr key={idx}>
              <td className="border border-gray-300 px-4 py-2">
                {v.name || v.vaccineName || "—"}
              </td>
              <td className="border border-gray-300 px-4 py-2">
                {v.date || v.vaccinationDate || "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
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

      {/* 彈出 QRCode */}
      {showModal && qrCodeUrl && (
        <div className="qr-modal">
          <div className="qr-box">
            <button className="close-btn" onClick={() => setShowModal(false)}>
              ✕
            </button>
            <p>請使用「數位憑證皮夾APP」掃描 QR Code</p>
            <p>請注意 QR Code 僅可使用一次，如失效請重新產生。</p>
            <img src={qrCodeUrl} alt="QRCode" />
            <p>驗證倒數：{formatTime(timeLeft)}</p>

            {/* 🔁 重新產生 QR Code */}
            <button
              onClick={() => currentScene && handleScene(currentScene)}
              style={{ marginTop: "8px", background: "#059669", color: "white" }}
            >
              重新產生 QR Code
            </button>

            {/* 🔹 新增：authUri 連結 */}
            {authUri && (
              <a
                href={authUri}
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: "none" }}
              >
                <button
                  style={{
                    marginTop: "8px",
                    background: "#3b82f6",
                    color: "white",
                  }}
                >
                  使用手機開啟
                </button>
              </a>
            )}
          </div>
        </div>
      )}

      {/* 驗證結果區 */}
      {verifyResult && (
        <div className="mt-6 p-6 bg-blue-50 rounded-xl border border-blue-200">
          <h3 className="font-bold text-blue-800 mb-2">驗證結果</h3>

          {/* 若有疫苗資料，先顯示表格 */}
          {renderVaccineTable()}

          {/* 保留原始 JSON 顯示 */}
          <pre className="whitespace-pre-wrap text-left bg-white p-4 rounded border overflow-x-auto mt-4">
            {JSON.stringify(verifyResult, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
