"use client";

import { useState } from "react";
import PatientForm from "../../src/app/patient/PatientForm";
import AllergyForm from "../../src/app/allergy/AllergyForm";
import ConditionForm from "../../src/app/condition/ConditionForm";
import VitalSignsForm from "../../src/app/vitalsigns/VitalSignsForm";
import ImmunizationForm from "../../src/app/immunization/ImmunizationForm";
// 共用 Tab 按鈕元件
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

export default function MainPage() {
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
  // 【新增：處理疫苗資料提交的函式】
  const handleImmunizationSubmit = (data: any) => {
    console.log("父層收到疫苗資料:", data);
    setImmunizationData(data);
  };

  // const handleExport = () => {
  //   const allData = {
  //     patient: patientData,
  //     allergy: allergyData,
  //     condition: conditionData,
  //   };

  //   console.log("全部資料：", allData);

  //   const blob = new Blob([JSON.stringify(allData, null, 2)], {
  //     type: "application/json",
  //   });
  //   const url = URL.createObjectURL(blob);
  //   const a = document.createElement("a");
  //   a.href = url;
  //   a.download = "fhir-data.json";
  //   a.click();
  //   URL.revokeObjectURL(url);
  // };

  // ---------- 【新增】QR Code 彈窗 state ----------
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
    
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
        const res = await fetch(`${API_URL}/ips/convert`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(allData),
          });

        if (!res.ok) {
          throw new Error(`Server Error: ${res.status}`);
        }

        const result = await res.json();
        console.log("後端回傳結果：", result);

        // 假設後端回傳 { qrCode: "data:image/png;base64,..." }
if (result.converterResponse && result.converterResponse.qrCode) {
          setQrCodeUrl(result.converterResponse.qrCode); // <-- 讀取正確的路徑
        // --- 結束 ---
        }else {
          alert("成功送出，但未收到 QR Code");
        }
        //alert("資料已成功送出並轉換！");
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
    <main className="container">
      <h1>FHIR Resource 表單</h1>

      {/* Tab Buttons */}
      <Tabs activeTab={activeTab} setActiveTab={setActiveTab} tabs={tabs} />

      {/* Tab Content */}
      <div className="tab-content">
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
            patientId="example-patient-id" // 假設您的表單需要 patientId
            onSubmitData={handleImmunizationSubmit}
          />
        )}
      </div>
      {/* 完成按鈕 */}
      <div className="mt-8">
        <button className="bg-green-500" onClick={handleExport}>
          完成輸入，發行卡片
        </button>
      </div>

      {/* ---------- 【新增】QR Code 便利貼彈窗 ---------- */}
      {qrCodeUrl && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
          onClick={() => setQrCodeUrl(null)} // 點背景關閉
        >
          <div
            style={{
              background: "#fff",
              padding: "24px",
              borderRadius: "12px",
              boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
              position: "relative",
              maxWidth: "90vw",
              textAlign: "center",
            }}
            onClick={(e) => e.stopPropagation()} // 防止點內部也關閉
          >
            {/* 右上角 × */}
            <button
              onClick={() => setQrCodeUrl(null)}
              style={{
                position: "absolute",
                top: "8px",
                right: "12px",
                background: "transparent",
                border: "none",
                fontSize: "24px",
                cursor: "pointer",
                color: "#666",
              }}
            >
              ×
            </button>

            <h3 style={{ margin: "0 0 16px", fontSize: "1.2rem" }}>
              童行證 QR Code
            </h3>
            <img
              src={qrCodeUrl}
              alt="QR Code"
              style={{
                maxWidth: "100%",
                height: "auto",
                border: "2px solid #ddd",
                borderRadius: "8px",
              }}
            />
            <p style={{ marginTop: "12px", color: "#555", fontSize: "0.9rem" }}>
              點擊圖片可下載
            </p>
          </div>
        </div>
      )}
    </main>
  );
}
