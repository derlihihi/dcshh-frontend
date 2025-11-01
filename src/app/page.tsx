"use client";

import { useState } from "react";
import PatientForm from "../../src/app/patient/PatientForm";
import AllergyForm from "../../src/app/allergy/AllergyForm";
import ConditionForm from "../../src/app/condition/ConditionForm";
import VitalSignsForm from "../../src/app/vitalsigns/VitalSignsForm";
import ImmunizationForm from "../../src/app/immunization/ImmunizationForm";

// ✅ Tab 按鈕元件
function Tabs({
  activeTab,
  setActiveTab,
  tabs,
}: {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  tabs: { key: string; label: string }[];
}) {
  return (
    <div className="tab-buttons">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          className={`tab-button ${activeTab === tab.key ? "active" : ""}`}
          onClick={() => setActiveTab(tab.key)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

// ✅ 主畫面（包含發行端 + 驗證端）
export default function MainPage() {
  // 模式切換：發行端 / 驗證端
  const [mode, setMode] = useState<"issuer" | "verifier">("issuer");

  // -----------------------
  // 🎯 發行端邏輯（原本內容）
  // -----------------------
  const [activeTab, setActiveTab] = useState("patient");

  // 收集子表單資料
  const [patientData, setPatientData] = useState<any>(null);
  const [allergyData, setAllergyData] = useState<any>(null);
  const [conditionData, setConditionData] = useState<any>(null);
  const [vitalSignsData, setVitalSignsData] = useState<any>(null);
  const [immunizationData, setImmunizationData] = useState<any>(null);

  const handlePatientSubmit = (data: any) => {
    console.log("父層收到病患資料:", data);
    setPatientData(data);
  };
  const handleAllergySubmit = (data: any) => {
    console.log("父層收到過敏資料:", data);
    setAllergyData(data);
  };
  const handleConditionSubmit = (data: any) => {
    console.log("父層收到病況資料:", data);
    setConditionData(data);
  };
  const handleVitalSignsSubmit = (data: any) => {
    console.log("父層收到生命徵象資料:", data);
    setVitalSignsData(data);
  };
  const handleImmunizationSubmit = (data: any) => {
    console.log("父層收到疫苗資料:", data);
    setImmunizationData(data);
  };

  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);

  // 發行端：送出資料並生成 QRCode
  const handleExport = async () => {
    const allData = {
      patient: patientData,
      allergy: allergyData,
      condition: conditionData,
      vitalSigns: vitalSignsData,
      immunization: immunizationData,
    };

    console.log("全部資料：", allData);

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL;
      const res = await fetch(`${API_URL}/ips/convert`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(allData),
      });

      if (!res.ok) {
        throw new Error(`Server Error: ${res.status}`);
      }

      const result = await res.json();
      console.log("後端回傳結果：", result);

      // 假設後端回傳 { converterResponse: { qrCode: "data:image/png;base64,..." } }
      if (result.converterResponse && result.converterResponse.qrCode) {
        setQrCodeUrl(result.converterResponse.qrCode);
      } else {
        alert("成功送出，但未收到 QR Code");
      }
    } catch (err) {
      console.error("傳送失敗：", err);
      alert("送出失敗，請檢查後端是否啟動！");
    }
  };

  // Tab 設定
  const tabs = [
    { key: "patient", label: "病患資料" },
    { key: "allergy", label: "過敏資訊" },
    { key: "condition", label: "病況資訊" },
    { key: "vitalSigns", label: "生命徵象" },
    { key: "immunization", label: "疫苗接種" },
  ];

  return (
    <main className="container mx-auto p-6">
      <h1 className="text-2xl font-bold text-center mb-6">
        FHIR Resource 系統
      </h1>

      {/* 模式切換 */}
      <div className="flex justify-center gap-4 mb-6">
        <button
          className={`px-4 py-2 rounded-xl ${
            mode === "issuer" ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
          onClick={() => setMode("issuer")}
        >
          發行端
        </button>
        <button
          className={`px-4 py-2 rounded-xl ${
            mode === "verifier" ? "bg-green-600 text-white" : "bg-gray-200"
          }`}
          onClick={() => setMode("verifier")}
        >
          驗證端
        </button>
      </div>

      {/* ---------------- 發行端內容 ---------------- */}
      {mode === "issuer" && (
        <>
          <Tabs activeTab={activeTab} setActiveTab={setActiveTab} tabs={tabs} />

          <div className="tab-content mt-6">
            {activeTab === "patient" && (
              <PatientForm onSubmitData={handlePatientSubmit} />
            )}
            {activeTab === "allergy" && (
              <AllergyForm
                patientId="example-patient-id"
                onSubmitData={handleAllergySubmit}
              />
            )}
            {activeTab === "condition" && (
              <ConditionForm
                patientId="example-patient-id"
                onSubmitData={handleConditionSubmit}
              />
            )}
            {activeTab === "vitalSigns" && (
              <VitalSignsForm
                patientId="example-patient-id"
                onSubmitData={handleVitalSignsSubmit}
              />
            )}
            {activeTab === "immunization" && (
              <ImmunizationForm
                patientId="example-patient-id"
                onSubmitData={handleImmunizationSubmit}
              />
            )}
          </div>

          {/* 完成按鈕 */}
          <div className="mt-8 flex justify-center">
            <button
              className="bg-green-500 text-white px-6 py-3 rounded-xl hover:bg-green-600 transition"
              onClick={handleExport}
            >
              完成輸入，發行卡片
            </button>
          </div>

          {/* QR Code 彈窗 */}
          {qrCodeUrl && (
            <div
              className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
              onClick={() => setQrCodeUrl(null)}
            >
              <div
                className="bg-white p-6 rounded-2xl shadow-xl relative max-w-sm text-center"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => setQrCodeUrl(null)}
                  className="absolute top-2 right-3 text-gray-500 text-2xl"
                >
                  ×
                </button>
                <h3 className="text-lg font-semibold mb-3">童行證 QR Code</h3>
                <img
                  src={qrCodeUrl}
                  alt="QR Code"
                  className="mx-auto border rounded-lg"
                />
                <p className="text-sm text-gray-600 mt-2">
                  點擊背景可關閉視窗
                </p>
              </div>
            </div>
          )}
        </>
      )}

      {/* ---------------- 驗證端內容 ---------------- */}
      {mode === "verifier" && <VerifierSection />}
    </main>
  );
}

// ✅ 驗證端區塊
function VerifierSection() {
  const [selectedScene, setSelectedScene] = useState<string | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [verifyResult, setVerifyResult] = useState<string | null>(null);

  const scenes = [
    { key: "hospital", label: "醫療院所", icon: "🏥" },
    { key: "school", label: "學校", icon: "🏫" },
    { key: "travel", label: "旅遊", icon: "✈️" },
  ];

  // 取得 QRCode（模擬應用場景請求）
  const handleSceneClick = async (sceneKey: string) => {
    setSelectedScene(sceneKey);
    setVerifyResult(null);

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL;
      const res = await fetch(`${API_URL}/api/oidvp/qrcode`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scene: sceneKey }),
      });

      if (!res.ok) throw new Error("伺服器錯誤");
      const result = await res.json();

      console.log("驗證端取得 QRCode:", result);
      setQrCodeUrl(result.qrcodeImage);
      setTransactionId(result.transactionId);
    } catch (err) {
      console.error("取得失敗:", err);
      alert("取得 QRCode 失敗");
    }
  };

  // 驗證檢查
  const handleVerify = async () => {
    if (!transactionId) return alert("尚未取得 transactionId");

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL;
      const res = await fetch(
        `${API_URL}/api/oidvp/verify?transactionId=${transactionId}`
      );
      const data = await res.json();

      if (data.verifyResult === true) {
        setVerifyResult("✅ 驗證成功");
      } else {
        setVerifyResult("❌ 驗證失敗");
      }
    } catch (err) {
      console.error("驗證錯誤:", err);
      setVerifyResult("⚠️ 系統錯誤");
    }
  };

  return (
    <div className="flex flex-col items-center mt-10 space-y-6">
      <h2 className="text-xl font-bold">選擇驗證場景</h2>

      <div className="grid grid-cols-3 gap-6">
        {scenes.map((scene) => (
          <div
            key={scene.key}
            onClick={() => handleSceneClick(scene.key)}
            className={`flex flex-col items-center justify-center p-6 rounded-2xl cursor-pointer shadow-md hover:scale-105 transition ${
              selectedScene === scene.key ? "bg-green-100" : "bg-white"
            }`}
          >
            <span className="text-5xl">{scene.icon}</span>
            <span className="mt-2 text-lg font-medium">{scene.label}</span>
          </div>
        ))}
      </div>

      {/* 顯示 QRCode 與驗證按鈕 */}
      {qrCodeUrl && (
        <div className="bg-yellow-100 p-6 rounded-2xl shadow-lg text-center mt-4">
          <img src={qrCodeUrl} alt="QRCode" className="mx-auto w-48 h-48 mb-4" />
          <button
            onClick={handleVerify}
            className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition"
          >
            驗證檢查
          </button>
          {verifyResult && (
            <p className="mt-3 text-lg font-semibold">{verifyResult}</p>
          )}
        </div>
      )}
    </div>
  );
}
