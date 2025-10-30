"use client";

import { useState } from "react";
import { vaccines } from "../../data/vaccines"; // 你整理好的疫苗清單

export default function ImmunizationForm({
  patientId,
  onSubmitData,
}: {
  patientId: string;
  onSubmitData: (data: any[]) => void;
}) {
  const [entries, setEntries] = useState([
    {
      status: "completed",
      vaccineCode: "",
      occurrenceDateTime: "",
      occurrenceString: "",
      doseNumber: "1", // 預設 1
    },
  ]);

  // 更新單筆資料
  const handleChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setEntries((prev) => {
      const updated = [...prev];
      updated[index][name as keyof typeof updated[0]] = value;
      return updated;
    });
  };

  // 新增一筆
  const handleAdd = () => {
    setEntries((prev) => [
      ...prev,
      {
        status: "completed",
        vaccineCode: "",
        occurrenceDateTime: "",
        occurrenceString: "",
        doseNumber: "1",
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

    const immunizationResources = entries.map((item) => {
      const selected = vaccines.find((v) => v.code === item.vaccineCode);

      return {
        resourceType: "Immunization",
        status: item.status,
        vaccineCode: {
          coding: selected
            ? [
                {
                  system: selected.system || "http://snomed.info/sct",
                  code: selected.code,
                  display: selected.display,
                },
              ]
            : [],
          text: selected ? selected.display : "",
        },
        patient: {
          reference: `Patient/${patientId}`, // 後端綁定病患
        },
        occurrenceDateTime: item.occurrenceDateTime || undefined,
        occurrenceString: item.occurrenceString || undefined,
        protocolApplied: [
          {
            doseNumberPositiveInt: parseInt(item.doseNumber),
          },
        ],
      };
    });

    console.log("Immunization 表單資料：", immunizationResources);
    onSubmitData(immunizationResources);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {entries.map((entry, index) => {
        const selected = vaccines.find((v) => v.code === entry.vaccineCode);
        return (
          <fieldset key={index} className="p-4 border rounded-md">
            {/* 顯示疫苗名稱 */}
            <legend className="font-semibold">
              {selected
                ? `${selected.display} ${selected.text || ""}`
                : `疫苗紀錄 ${index + 1}`}
            </legend>

            {/* 疫苗代碼 */}
            <div>
              <label>疫苗代碼 *</label>
              <select
                name="vaccineCode"
                value={entry.vaccineCode}
                onChange={(e) => handleChange(index, e)}
                required
                style={{ whiteSpace: "normal" }} // 支援長文字換行
                className="w-full"
              >
                <option value="">請選擇疫苗</option>
                {vaccines.map((v) => (
                  <option key={v.code} value={v.code}>
                    {v.text ? ` ${v.text}` : ""} ({v.code})
                  </option>
                ))}
              </select>
            </div>

            {/* 接種狀態 */}
            <div>
              <label>接種狀態 *</label>
              <select
                name="status"
                value={entry.status}
                onChange={(e) => handleChange(index, e)}
                required
              >
                <option value="completed">完成</option>
                <option value="not-done">未完成</option>
                <option value="entered-in-error">錯誤</option>
              </select>
            </div>

            {/* 接種日期 DateTime */}
            <div>
              <label>接種日期 (DateTime)</label>
              <input
                type="datetime-local"
                name="occurrenceDateTime"
                value={entry.occurrenceDateTime}
                onChange={(e) => handleChange(index, e)}
              />
            </div>

            {/* 接種日期 String */}
            <div>
              <label>接種日期 (不精確文字)</label>
              <input
                type="text"
                name="occurrenceString"
                value={entry.occurrenceString}
                onChange={(e) => handleChange(index, e)}
                placeholder="例如：2023年夏天"
              />
            </div>

            {/* 劑次編號 */}
            <div>
              <label>劑次編號 *</label>
              <input
                type="number"
                name="doseNumber"
                value={entry.doseNumber}
                onChange={(e) => handleChange(index, e)}
                required
                min={1}
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
          新增疫苗紀錄
        </button>
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
          儲存疫苗紀錄
        </button>
      </div>
    </form>
  );
}
