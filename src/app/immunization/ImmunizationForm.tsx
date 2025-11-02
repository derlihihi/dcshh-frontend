"use client";

import { useState, useEffect } from "react";
import { vaccines } from "../../data/vaccines";

interface ImmunizationItem {
  接種狀態: string;
  疫苗代碼: string;
  接種日期: string;
  接種日期文字: string;
  劑次: string;
}

export default function ImmunizationForm({
  patientId,
  onSubmitData,
}: {
  patientId: string;
  onSubmitData: (data: any) => void;
}) {
  const [immunizationList, setImmunizationList] = useState<ImmunizationItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // 載入 localStorage
  useEffect(() => {
    const saved = localStorage.getItem(`immunizationList-${patientId}`);
    if (saved) {
      setImmunizationList(JSON.parse(saved));
    } else {
      setImmunizationList([
        {
          接種狀態: "completed",
          疫苗代碼: "",
          接種日期: "",
          接種日期文字: "",
          劑次: "1",
        },
      ]);
    }
    setHydrated(true);
  }, [patientId]);

  // 儲存到 localStorage
  useEffect(() => {
    if (hydrated) {
      localStorage.setItem(`immunizationList-${patientId}`, JSON.stringify(immunizationList));
    }
  }, [immunizationList, hydrated, patientId]);

  const handleChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    const newList = [...immunizationList];

    if (name === "疫苗代碼") {
      const selected = vaccines.find((v) => v.code === value);
      newList[index].疫苗代碼 = value;
      // 這裡不需要 display/text，因為後端會用 code 去查
    } else {
      (newList[index] as any)[name] = value;
    }

    setImmunizationList(newList);
  };

  const addImmunization = () => {
    setImmunizationList([
      ...immunizationList,
      {
        接種狀態: "completed",
        疫苗代碼: "",
        接種日期: "",
        接種日期文字: "",
        劑次: "1",
      },
    ]);
  };

  const removeImmunization = (index: number) => {
    setImmunizationList(immunizationList.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const payload = immunizationList.map((item) => {
      const selected = vaccines.find((v) => v.code === item.疫苗代碼);

      return {
        接種狀態: item.接種狀態,
        疫苗代碼: selected
          ? {
              系統: selected.system || "http://snomed.info/sct",
              代碼: selected.code,
              英文名稱: selected.display || selected.text,
              中文名稱: selected.text,
            }
          : { 系統: "", 代碼: "", 英文名稱: "", 中文名稱: "" },
        關聯病患: {
          reference: `Patient/${patientId}`,
        },
        接種日期: item.接種日期 || undefined,
        接種日期文字: item.接種日期文字 || undefined,
        劑次: parseInt(item.劑次) || 1,
      };
    });

    console.log("疫苗資料送出（中文欄位）:", payload);
    onSubmitData(payload);
    alert("疫苗資料已送出");
  };

  if (!hydrated) {
    return <p className="text-gray-500 text-center">載入中...</p>;
  }

  return (
    <div className="max-w-3xl mx-auto my-6 p-6 border rounded-lg shadow bg-white">
      <h2 className="text-xl font-bold text-center mb-6">預防接種表單</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {immunizationList.map((item, index) => {
          const selected = vaccines.find((v) => v.code === item.疫苗代碼);
          const displayName = selected
            ? `${selected.text || selected.display} (${selected.code})`
            : `疫苗紀錄 ${index + 1}`;

          return (
            <fieldset key={index} className="border p-4 rounded space-y-4">
              <legend className="font-semibold">{displayName}</legend>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 疫苗代碼 */}
                <label className="md:col-span-2">
                  疫苗代碼 *
                  <select
                    name="疫苗代碼"
                    value={item.疫苗代碼}
                    onChange={(e) => handleChange(index, e)}
                    required
                    className="w-full p-2 border rounded"
                  >
                    <option value="">請選擇疫苗</option>
                    {vaccines.map((v) => (
                      <option key={v.code} value={v.code}>
                        {v.text} ({v.code})
                      </option>
                    ))}
                  </select>
                </label>

                {/* 接種狀態 */}
                <label>
                  接種狀態 *
                  <select
                    name="接種狀態"
                    value={item.接種狀態}
                    onChange={(e) => handleChange(index, e)}
                    required
                    className="w-full p-2 border rounded"
                  >
                    <option value="completed">完成</option>
                    <option value="not-done">未完成</option>
                    <option value="entered-in-error">錯誤</option>
                  </select>
                </label>

                {/* 劑次 */}
                <label>
                  劑次 *
                  <input
                    type="number"
                    name="劑次"
                    value={item.劑次}
                    onChange={(e) => handleChange(index, e)}
                    required
                    min={1}
                    className="w-full p-2 border rounded"
                  />
                </label>

                {/* 精確日期 */}
                <label>
                  接種日期（精確）
                  <input
                    type="date"
                    name="接種日期"
                    value={item.接種日期}
                    onChange={(e) => handleChange(index, e)}
                    className="w-full p-2 border rounded"
                  />
                </label>

                {/* 文字日期 */}
                <label>
                  接種日期（文字）
                  <input
                    type="text"
                    name="接種日期文字"
                    value={item.接種日期文字}
                    onChange={(e) => handleChange(index, e)}
                    placeholder="例如：2023年夏天"
                    className="w-full p-2 border rounded"
                  />
                </label>
              </div>

              {/* 刪除按鈕 */}
              {immunizationList.length > 1 && (
                <div className="flex justify-end">
                  <button
                    type="button"
                    className="bg-red-500 px-3 py-1 text-white rounded"
                    onClick={() => removeImmunization(index)}
                  >
                    刪除這筆
                  </button>
                </div>
              )}
            </fieldset>
          );
        })}

        {/* 操作按鈕 */}
        <div className="flex gap-3 mt-4 justify-end">
          <button
            type="button"
            className="bg-green-500 px-4 py-2 text-white rounded"
            onClick={addImmunization}
          >
            新增疫苗
          </button>
          <button
            type="submit"
            className="bg-blue-600 px-4 py-2 text-white rounded"
          >
            送出疫苗資料
          </button>
        </div>
      </form>
    </div>
  );
}