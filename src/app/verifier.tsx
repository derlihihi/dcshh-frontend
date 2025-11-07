"use client";

import { useState, useEffect } from "react";
import { FaHospital, FaSchool, FaPlane } from "react-icons/fa";
import "./verifier.css";
import "./issuer.css";

// 定義情境與參考編號的對應表
const SCENE_REF_MAP = {
  hospital: "00000000_t002", // 醫療院所
  school: "00000000_t003", // 學校
  travel: "00000000_t004", // 旅遊
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
  const [sheetOpen, setSheetOpen] = useState(false);


  // 倒數計時器
  useEffect(() => {
    if (!showModal || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((t) => (t > 0 ? t - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [showModal, timeLeft]);
  

  // 產生 QRCode
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
  const filterClaimsByScene = (scene: keyof typeof SCENE_REF_MAP, claims: any[]) => {
    if (!Array.isArray(claims)) return [];

    if (scene === "hospital") return claims; // 全部揭露

    if (scene === "school") {
      return claims.filter((c) =>
        ["name", "vaccine", "vaccination_doses"].includes(c.ename)
      );
    }

    if (scene === "travel") {
      return claims.filter((c) =>
        ["name", "vaccine", "vaccination_date", "vaccination_doses"].includes(c.ename)
      );
    }

    return claims;
  };


  // 驗證結果
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
      const claims = data?.data?.[0]?.claims || [];

      setVerifyResult({
        ...data,
        filteredClaims: filterClaimsByScene(currentScene!, claims),
      });

      //按下開始驗證後自動關閉 QR 彈窗
      setShowModal(false);
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

  //  顯示疫苗接種資料的表格
  const renderVaccineTable = () => {
    if (!verifyResult?.vaccines && !verifyResult?.data?.vaccines) return null;

    const vaccines = verifyResult.vaccines || verifyResult.data.vaccines;

    return (
      <table className="w-full mt-4 border-collapse border border-gray-300 bg-white rounded-lg">
        <thead className="bg-blue-100">
          <tr>
            <th className="border border-gray-300 px-4 py-2 text-left">疫苗名稱</th>
            <th className="border border-gray-300 px-4 py-2 text-left">劑次</th>
            <th className="border border-gray-300 px-4 py-2 text-left">接種日期</th>
          </tr>
        </thead>
        <tbody>
          {vaccines.flatMap((v: any) =>
            v.doses.map((d: any, idx: number) => (
              <tr key={`${v.name}-${idx}`}>
                <td className="border border-gray-300 px-4 py-2">{v.name}</td>
                <td className="border border-gray-300 px-4 py-2">第 {idx + 1} 劑</td>
                <td className="border border-gray-300 px-4 py-2">{d.date}</td>
              </tr>
            ))
          )}
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
        <div className="qr-modal" onClick={() => setShowModal(false)}>
          <div className="qr-box" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setShowModal(false)}>
              ✕
            </button>
            <p>請使用「數位憑證皮夾APP」掃描 QR Code</p>
            <p>請注意 QR Code 僅可使用一次，如失效請重新產生。</p>
            <img src={qrCodeUrl} alt="QRCode" />
            <p>驗證倒數：{formatTime(timeLeft)}</p>

            {/* 重新產生 QR Code */}
            <button
              onClick={() => currentScene && handleScene(currentScene)}
              style={{ marginTop: "8px", background: "#059669", color: "white" }}
            >
              重新產生 QR Code
             </button>
            {/* 新增：authUri 連結 */}
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
            <button
              onClick={handleVerify}
              style={{ marginTop: "8px", background: "#1d4ed8", color: "white" }}
            >
              開始驗證
            </button>
          </div>
        </div>
      )}

      {/* 驗證結果區 */}
      {verifyResult && (
        <div className="verify-result-panel">
          <h3 className="font-bold text-blue-800 mb-3">驗證成功</h3>

          {/* 重新查看 QR Code */}
          <button className="verify-show-btn" onClick={() => setShowModal(true)}>
            重新查看 QR Code
          </button>

          {/* 查看疫苗 / 基礎資料 → Bottom Sheet */}
          <button className="open-sheet-btn" onClick={() => setSheetOpen(true)}>
            查看授權揭露資料
          </button>

          {/* 如果有疫苗資料 → 表格顯示 */}
          {renderVaccineTable()}

          {/* JSON 保留給技術審查 
          <pre className="result-json">
            {JSON.stringify(verifyResult, null, 2)}
          </pre>*/}
        </div>
      )}

      {/* Bottom Sheet */}
      <div className={`bottom-sheet ${sheetOpen ? "open" : ""}`}>
        <div className="sheet-header" onClick={() => setSheetOpen(false)}></div>
        <div className="sheet-content">
          {verifyResult?.filteredClaims?.map((c: any, i: number) => (
            <div key={i} className="sheet-item">
              <span className="sheet-label">{c.cname || c.ename}</span>
              <span className="sheet-value">{c.value}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
