"use client";

import { useState } from "react";

// 定義 vitalSigns 清單，包含所有生命體徵類型
const vitalSigns = [
  { code: "85353-1", display: "生命體徵面板", system: "http://loinc.org", unit: "" },
  { code: "9279-1", display: "呼吸率", system: "http://loinc.org", unit: "/min" },
  { code: "8867-4", display: "心率", system: "http://loinc.org", unit: "beats/min" },
  { code: "2708-6", display: "動脈血氧飽和度", system: "http://loinc.org", unit: "%" },
  { code: "8310-5", display: "體溫", system: "http://loinc.org", unit: "Cel" },
  { code: "8302-2", display: "身高", system: "http://loinc.org", unit: "cm" },
  { code: "9843-4", display: "頭圍", system: "http://loinc.org", unit: "cm" },
  { code: "29463-7", display: "體重", system: "http://loinc.org", unit: "kg" },
  { code: "39156-5", display: "身體質量指數 (BMI)", system: "http://loinc.org", unit: "kg/m2" },
  {
    code: "85354-9",
    display: "血壓面板",
    system: "http://loinc.org",
    components: [
      { code: "8480-6", display: "收縮壓", unit: "mmHg" },
      { code: "8462-4", display: "舒張壓", unit: "mmHg" },
      { code: "8478-0", display: "平均血壓", unit: "mmHg" },
    ],
  },
];

// 定義型別
interface Component {
  code: string;
  value: string;
  unit: string;
}

interface ObservationEntry {
  status: string;
  code: string;
  effectiveDateTime: string;
  valueQuantity: { value: string; unit: string };
  components: Component[];
}

export default function VitalSignsForm({
  patientId,
  onSubmitData,
}: {
  patientId: string;
  onSubmitData: (data: any[]) => void;
}) {
  const [entries, setEntries] = useState<ObservationEntry[]>([
    {
      status: "final",
      code: "",
      effectiveDateTime: "",
      valueQuantity: { value: "", unit: "" },
      components: [],
    },
  ]);

  // 狀態選項
  const statusOptions = [
    { code: "registered", display: "已註冊" },
    { code: "preliminary", display: "初步" },
    { code: "final", display: "最終" },
    { code: "amended", display: "已修訂" },
    { code: "corrected", display: "已更正" },
    { code: "cancelled", display: "已取消" },
    { code: "entered-in-error", display: "錯誤輸入" },
    { code: "unknown", display: "未知" },
  ];

  // 更新單筆資料
  const handleChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setEntries((prev) => {
      const updated = [...prev];
      if (name === "code") {
        const selected = vitalSigns.find((v) => v.code === value);
        updated[index] = {
          ...updated[index],
          code: value,
          valueQuantity: selected?.components
            ? { value: "", unit: "" }
            : { value: "", unit: selected?.unit || "" },
          components: selected?.components
            ? selected.components.map((comp) => ({
                code: comp.code,
                value: "",
                unit: comp.unit,
              }))
            : [],
        };
      } else if (name === "valueQuantity") {
        updated[index].valueQuantity = {
          ...updated[index].valueQuantity,
          value: value,
        };
      } else {
        updated[index][name as keyof ObservationEntry] = value as any;
      }
      return updated;
    });
  };

  // 更新組件資料
  const handleComponentChange = (
    entryIndex: number,
    compIndex: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { value } = e.target;
    setEntries((prev) => {
      const updated = [...prev];
      updated[entryIndex].components[compIndex].value = value;
      return updated;
    });
  };

  // 新增一筆
  const handleAdd = () => {
    setEntries((prev) => [
      ...prev,
      {
        status: "final",
        code: "",
        effectiveDateTime: "",
        valueQuantity: { value: "", unit: "" },
        components: [],
      },
    ]);
  };

  // 刪除一筆
  const handleRemove = (index: number) => {
    setEntries((prev) => prev.filter((_, i) => i !== index));
  };

  // 送出所有資料
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const observationResources = entries.map((item) => {
      const selected = vitalSigns.find((v) => v.code === item.code);
      return {
        resourceType: "Observation",
        id: `vital-signs-${item.code || "unknown"}-${Date.now()}`,
        status: item.status,
        category: [
          {
            coding: [
              {
                system: "http://terminology.hl7.org/CodeSystem/observation-category",
                code: "vital-signs",
                display: "Vital Signs",
              },
            ],
            text: "生命體徵測量",
          },
        ],
        code: {
          coding: selected
            ? [
                {
                  system: selected.system,
                  code: selected.code,
                  display: selected.display,
                },
              ]
            : [],
          text: selected?.display || "",
        },
        subject: {
          reference: `Patient/${patientId}`,
        },
        effectiveDateTime: item.effectiveDateTime || undefined,
        valueQuantity: selected?.components
          ? undefined
          : {
              value: parseFloat(item.valueQuantity.value) || undefined,
              unit: item.valueQuantity.unit,
              system: "http://unitsofmeasure.org",
              code: item.valueQuantity.unit,
            },
        component: selected?.components
          ? item.components.map((comp) => ({
              code: {
                coding: [
                  {
                    system: "http://loinc.org",
                    code: comp.code,
                    display:
                      comp.code === "8480-6"
                        ? "Systolic blood pressure"
                        : comp.code === "8462-4"
                        ? "Diastolic blood pressure"
                        : "Mean blood pressure",
                  },
                ],
                text:
                  comp.code === "8480-6"
                    ? "收縮壓"
                    : comp.code === "8462-4"
                    ? "舒張壓"
                    : "平均血壓",
              },
              valueQuantity: {
                value: parseFloat(comp.value) || undefined,
                unit: comp.unit,
                system: "http://unitsofmeasure.org",
                code: comp.unit,
              },
            }))
          : [],
      };
    });

    console.log("Vital Signs 表單資料：", observationResources);
    onSubmitData(observationResources);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {entries.map((entry, index) => {
        const selected = vitalSigns.find((v) => v.code === entry.code);
        return (
          <fieldset key={index} className="p-4 border rounded-md">
            <legend className="font-semibold">
              {selected
                ? `${selected.display}`
                : `生命體徵記錄 ${index + 1}`}
            </legend>

            {/* 狀態 */}
            <div>
              <label className="block text-sm font-medium text-gray-700">狀態 *</label>
              <select
                name="status"
                value={entry.status}
                onChange={(e) => handleChange(index, e)}
                required
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              >
                {statusOptions.map((opt) => (
                  <option key={opt.code} value={opt.code}>
                    {opt.display}
                  </option>
                ))}
              </select>
            </div>

            {/* 分類 (固定為 vital-signs) */}
            <div>
              <label className="block text-sm font-medium text-gray-700">分類 *</label>
              <input
                type="text"
                value="生命體徵 (vital-signs)"
                disabled
                className="mt-1 block w-full border-gray-300 rounded-md bg-gray-100"
              />
            </div>

            {/* 觀察類型 */}
            <div>
              <label className="block text-sm font-medium text-gray-700">觀察類型 *</label>
              <select
                name="code"
                value={entry.code}
                onChange={(e) => handleChange(index, e)}
                required
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">請選擇觀察類型</option>
                {vitalSigns.map((v) => (
                  <option key={v.code} value={v.code}>
                    {v.display}
                  </option>
                ))}
              </select>
            </div>

            {/* 數值或組件 */}
            {selected?.components ? (
              <div>
                <h3 className="text-md font-semibold mt-4">組件</h3>
                {entry.components.map((comp, compIndex) => (
                  <div key={compIndex} className="mt-2">
                    <label className="block text-sm font-medium text-gray-700">
                      {comp.code === "8480-6"
                        ? "收縮壓"
                        : comp.code === "8462-4"
                        ? "舒張壓"
                        : "平均血壓"}{" "}
                      {comp.code !== "8478-0" ? "*" : "(可選)"}
                    </label>
                    <input
                      type="number"
                      value={comp.value}
                      onChange={(e) => handleComponentChange(index, compIndex, e)}
                      required={comp.code !== "8478-0"} // 平均血壓為可選
                      placeholder={`輸入值 (${comp.unit})`}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700">數值 *</label>
                <input
                  type="number"
                  name="valueQuantity"
                  value={entry.valueQuantity.value}
                  onChange={(e) => handleChange(index, e)}
                  required={entry.code !== ""}
                  placeholder={`輸入值 (${selected?.unit || ""})`}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            )}

            {/* 有效時間 */}
            <div>
              <label className="block text-sm font-medium text-gray-700">有效時間 *</label>
              <input
                type="datetime-local"
                name="effectiveDateTime"
                value={entry.effectiveDateTime}
                onChange={(e) => handleChange(index, e)}
                required
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* 刪除按鈕 */}
            {entries.length > 1 && (
              <button
                type="button"
                className="bg-red-500 text-white px-2 py-1 rounded mt-2"
                onClick={() => handleRemove(index)}
              >
                刪除此筆
              </button>
            )}
          </fieldset>
        );
      })}

      <div className="flex gap-4 mt-4">
        <button
          type="button"
          className="bg-green-500 text-white px-4 py-2 rounded"
          onClick={handleAdd}
        >
          新增生命體徵記錄
        </button>
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
          儲存生命體徵記錄
        </button>
      </div>
    </form>
  );
}