"use client";

import { useState, useEffect } from "react";
import PatientForm from "../../src/app/patient/PatientForm";
import AllergyForm from "../../src/app/allergy/AllergyForm";
import ConditionForm from "../../src/app/condition/ConditionForm";
import VitalSignsForm from "../../src/app/vitalsigns/VitalSignsForm";
import ImmunizationForm from "../../src/app/immunization/ImmunizationForm";
import "./issuer.css";
// Tab 按鈕元件
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

//主畫面
export default function MainPage() {

  // -----------------------
  // 發行端邏輯（原本內容）
  // -----------------------
  const [activeTab, setActiveTab] = useState("patient");

  // 收集子表單資料
  const [patientData, setPatientData] = useState<any>(null);
  const [allergyData, setAllergyData] = useState<any>(null);
  const [conditionData, setConditionData] = useState<any>(null);
  const [vitalSignsData, setVitalSignsData] = useState<any>(null);
  const [immunizationData, setImmunizationData] = useState<any>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);

  // 倒數計時狀態
  const [timeLeft, setTimeLeft] = useState<number>(0);

  // 控制彈窗開關
  const [showModal, setShowModal] = useState<boolean>(false);

  // 倒數邏輯
  useEffect(() => {
    if (!showModal || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [showModal, timeLeft]);


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

      if (result.converterResponse?.qrCode) {
        setQrCodeUrl(result.converterResponse.qrCode);
        setShowModal(true);
        setTimeLeft(300); // 5分鐘倒數
      } else {
        alert("成功送出，但未收到 QR Code");
      }
    } catch (err) {
      console.error("傳送失敗：", err);
      alert("送出失敗，請檢查後端是否啟動！");
    }
  };
  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60)
      .toString()
      .padStart(2, "0");
    const s = (sec % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  // Tab 設定
  const tabs = [
    { key: "patient", label: "病患資料" },
    { key: "immunization", label: "疫苗接種" },
    { key: "allergy", label: "過敏資訊" },
    { key: "condition", label: "病況資訊" },
    { key: "vitalSigns", label: "生命徵象" },
  ];

 return (
    <main className="container mx-auto p-6">
      <h1 className="text-2xl font-bold text-center mb-6">
        FHIR Resource 系統
      </h1>

      {/* ---------------- 發行端內容 ---------------- */}
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

          {/* QR 彈窗 */}
          {showModal && qrCodeUrl && (
            <div className="qr-modal">
              <div className="qr-box">
                  <button className="close-btn" onClick={() => setShowModal(false)}>✕</button>
                    <p>請使用「數位憑證皮夾APP」掃描 QR Code</p>
                    <p>請注意 QR Code 僅可使用一次，如失效請重新產生。</p>
                    <img src={qrCodeUrl} alt="QRCode" />
                    <p>驗證倒數：{formatTime(timeLeft)}</p>
                    <button onClick={handleExport}>重新產生 QR Code</button>
                    <button style={{ marginTop: "8px", background: "#3b82f6" }}>使用手機開啟</button>
              </div>
            </div>
          )}
        </>
        
        {/* 新增：QR Code 顯示區塊 
        {qrCodeUrl && (
            <div className="mt-8 p-6 bg-gray-100 rounded-xl shadow-lg text-center">
                <h2 className="text-xl font-semibold mb-4 text-gray-800">
                    ✅ 發行成功！請掃描 QR Code
                </h2>                <img 
                    src={qrCodeUrl} 
                    alt="發行卡片的 QR Code" 
                    className="mx-auto w-64 h-64 border-4 border-white shadow-md rounded-lg"
                />
                <p className="mt-4 text-sm text-gray-600">
                    請使用數位錢包 App 掃描此碼，以領取卡片。
                </p>
            </div>
        )}
        */}
    </main>
  );

}
