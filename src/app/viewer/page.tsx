"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import "./viewer.css";

export default function ViewerPage() {
  const [data, setData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("patient");

  const searchParams = useSearchParams();
  const id = searchParams.get("id") || "A123456789"; // 模擬固定 ID

  // 讀取 viewer.json
  useEffect(() => {
    fetch(`http://localhost:3002/data/viewer.json?id=${id}`)
      .then((res) => res.json())
      .then((json) => setData(json))
      .catch((err) => console.error(err));
  }, [id]);

  if (!data) return <div className="loading">載入中...</div>;

  const { patient, allergy, condition, vitalSigns, immunization } = data;

  // --------------------
  // Render functions
  // --------------------

  const renderPatient = () => (
    <div className="tab-content">
      <h2>基本資料</h2>
      <div className="grid2">
        {Object.entries(patient).map(([k, v]) => (
          <div className="info-item" key={k}>
            <strong>{k}：</strong> {String(v)}
          </div>
        ))}
      </div>
    </div>
  );

  const renderAllergy = () => (
    <div className="tab-content">
      <h2>過敏資訊</h2>
      {allergy.map((a: any, i: number) => (
        <div key={i} className="card">
          <p><strong>名稱：</strong>{a.code.text}</p>
          <p><strong>狀態：</strong>{a.clinicalStatus}</p>
          <p><strong>發生日期：</strong>{a.onsetDateTime}</p>
          <p><strong>反應：</strong>{a.reaction?.[0]?.manifestation?.[0]?.text}</p>
        </div>
      ))}
    </div>
  );

  const renderCondition = () => (
    <div className="tab-content">
      <h2>病況資訊</h2>
      {condition.map((c: any, i: number) => (
        <div key={i} className="card">
          <p><strong>疾病名稱：</strong>{c.code.text}</p>
          <p><strong>狀態：</strong>{c.clinicalStatus.coding[0].code}</p>
          <p><strong>開始日期：</strong>{c.onsetDateTime}</p>
        </div>
      ))}
    </div>
  );

  const renderVital = () => (
    <div className="tab-content">
      <h2>生命徵象</h2>
      {vitalSigns.map((v: any, i: number) => (
        <div key={i} className="card">
          <p>
            <strong>{v.code.text}：</strong>
            {v.valueQuantity.value} {v.valueQuantity.unit}
          </p>
          <p><strong>時間：</strong>{v.effectiveDateTime}</p>
        </div>
      ))}
    </div>
  );

  const renderImmunization = () => (
    <div className="tab-content">
      <h2>疫苗接種</h2>
      {immunization.map((im: any, i: number) => (
        <div key={i} className="card">
          <p><strong>疫苗：</strong>{im.疫苗代碼.中文名稱}</p>
          <p><strong>日期：</strong>{im.接種日期}</p>
          <p><strong>劑次：</strong>{im.劑次}</p>
        </div>
      ))}
    </div>
  );

  // --------------------
  // Main Layout
  // --------------------

  return (
    <div className="container">
      <h1>病患資料檢視（ID: {id}）</h1>

      <div className="tab-buttons">
        <button className={activeTab === "patient" ? "active" : ""} onClick={() => setActiveTab("patient")}>基本資料</button>
        <button className={activeTab === "immunization" ? "active" : ""} onClick={() => setActiveTab("immunization")}>疫苗接種</button>
        <button className={activeTab === "allergy" ? "active" : ""} onClick={() => setActiveTab("allergy")}>過敏資訊</button>
        <button className={activeTab === "condition" ? "active" : ""} onClick={() => setActiveTab("condition")}>病況資訊</button>
        <button className={activeTab === "vital" ? "active" : ""} onClick={() => setActiveTab("vital")}>生命徵象</button>
        
      </div>

      {activeTab === "patient" && renderPatient()}
      {activeTab === "allergy" && renderAllergy()}
      {activeTab === "condition" && renderCondition()}
      {activeTab === "vital" && renderVital()}
      {activeTab === "immunization" && renderImmunization()}
    </div>
  );
}
