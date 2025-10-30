"use client";

import { useState, useEffect } from "react";
import { allergens } from "../../data/allergens"; // 過敏原清單
import { reactions } from "../../data/reactions"; // 過敏反應清單

// 定義單筆過敏紀錄
type AllergyItem = {
  clinicalStatus: "active" | "inactive" | "resolved" | "";
  type: "allergy" | "intolerance" | "";
  onsetDate: string;
  allergenCode: string;
  reactionCode: string;
  severity: "mild" | "moderate" | "severe" | "";
};

type AllergyFormProps = {
  patientId: string;
  onSubmitData: (data: any) => void;
};

export default function AllergyForm({ patientId, onSubmitData }: AllergyFormProps) {
  const [allergyList, setAllergyList] = useState<AllergyItem[]>([
    { clinicalStatus: "", type: "", onsetDate: "", allergenCode: "", reactionCode: "", severity: "" },
  ]);

  // ✅ 載入 localStorage
  useEffect(() => {
    const saved = localStorage.getItem("allergyList");
    if (saved) {
      setAllergyList(JSON.parse(saved));
    }
  }, []);

  // ✅ 每次更新都存進 localStorage
  useEffect(() => {
    localStorage.setItem("allergyList", JSON.stringify(allergyList));
  }, [allergyList]);

  // 欄位變更
  const handleChange = (index: number, field: keyof AllergyItem, value: string) => {
    const newList = [...allergyList];
    newList[index][field] = value as any;
    setAllergyList(newList);
  };

  // 新增一筆
  const addAllergy = () => {
    setAllergyList([
      ...allergyList,
      { clinicalStatus: "", type: "", onsetDate: "", allergenCode: "", reactionCode: "", severity: "" },
    ]);
  };

  // 刪除一筆
  const removeAllergy = (index: number) => {
    setAllergyList(allergyList.filter((_, i) => i !== index));
  };

  // 送出表單
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const payload = allergyList.map((item) => {
      const selectedAllergen = allergens.find((a) => a.code === item.allergenCode);
      const selectedReaction = reactions.find((r) => r.code === item.reactionCode);

      return {
        resourceType: "AllergyIntolerance",
        clinicalStatus: item.clinicalStatus,
        type: item.type,
        code: {
          coding: [
            {
              system: "http://snomed.info/sct",
              code: item.allergenCode,
              display: selectedAllergen?.display || "",
            },
          ],
          text: selectedAllergen?.display || "",
        },
        onsetDateTime: item.onsetDate || undefined,
        reaction: [
          {
            manifestation: [
              {
                coding: [
                  {
                    system: "http://snomed.info/sct",
                    code: item.reactionCode,
                    display: selectedReaction?.display || "",
                  },
                ],
                text: selectedReaction?.display || "",
              },
            ],
            severity: item.severity || undefined,
          },
        ],
        patient: { reference: `Patient/${patientId}` },
      };
    });

    console.log("過敏原資料送出:", payload);
    onSubmitData(payload);
    alert("過敏原資料已送出");
  };

  return (
    <div className="max-w-3xl mx-auto my-6 p-6 border rounded-lg shadow bg-white">
      <h2 className="text-xl font-bold text-center mb-6">過敏原表單</h2>
      <form onSubmit={handleSubmit} className="form-grid gap-4">
        {allergyList.map((item, index) => {
          const selectedAllergen = allergens.find((a) => a.code === item.allergenCode);
          return (
            <fieldset key={index} className="col-span-full border p-4 rounded">
              <legend className="font-semibold">
                {selectedAllergen ? `過敏原：${selectedAllergen.display}` : `過敏紀錄 ${index + 1}`}
              </legend>

              <label>
                臨床狀態：
                <select value={item.clinicalStatus} onChange={(e) => handleChange(index, "clinicalStatus", e.target.value)}>
                  <option value="">請選擇</option>
                  <option value="active">活躍</option>
                  <option value="inactive">不活躍</option>
                  <option value="resolved">已解決</option>
                </select>
              </label>

              <label>
                類型：
                <select value={item.type} onChange={(e) => handleChange(index, "type", e.target.value)}>
                  <option value="">請選擇</option>
                  <option value="allergy">過敏</option>
                  <option value="intolerance">不耐受</option>
                </select>
              </label>

              <label>
                發作日期：
                <input type="date" value={item.onsetDate} onChange={(e) => handleChange(index, "onsetDate", e.target.value)} />
              </label>

              <label className="col-span-full">
                過敏原：
                <select value={item.allergenCode} onChange={(e) => handleChange(index, "allergenCode", e.target.value)} className="w-full">
                  <option value="">請選擇過敏原</option>
                  {allergens.map((a) => (
                    <option key={a.code} value={a.code}>
                      {a.display}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                過敏症狀：
                <select value={item.reactionCode} onChange={(e) => handleChange(index, "reactionCode", e.target.value)}>
                  <option value="">請選擇症狀</option>
                  {reactions.map((r) => (
                    <option key={r.code} value={r.code}>
                      {r.display}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                嚴重程度：
                <select value={item.severity} onChange={(e) => handleChange(index, "severity", e.target.value)}>
                  <option value="">請選擇</option>
                  <option value="mild">輕微</option>
                  <option value="moderate">中等</option>
                  <option value="severe">嚴重</option>
                </select>
              </label>

              {allergyList.length > 1 && (
                <div className="col-span-full mt-2">
                  <button
                    type="button"
                    className="bg-red-500 px-3 py-1 text-white rounded"
                    onClick={() => removeAllergy(index)}
                  >
                    刪除這筆
                  </button>
                </div>
              )}
            </fieldset>
          );
        })}

        <div className="col-span-full flex gap-3 mt-4 justify-center">
          <button type="button" className="bg-green-500 px-4 py-2 text-white rounded" onClick={addAllergy}>
            新增過敏原
          </button>
          <button type="submit" className="bg-blue-600 px-4 py-2 text-white rounded">
            送出過敏資料
          </button>
        </div>
      </form>
    </div>
  );
}
