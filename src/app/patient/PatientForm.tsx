"use client";

import { useState } from "react";
import { taiwanAreas } from "../../data/taiwanAreas";

export default function PatientForm({
  onSubmitData,
}: {
  onSubmitData: (data: any) => void;
}) {
  const [formData, setFormData] = useState({
    身分證字號: "",
    姓名: "",
    姓: "",
    名: "",
    性別: "",
    出生日期: "",
    電話: "",
    Email: "",
    縣市: "",
    區鄉鎮: "",
    郵遞區號: "",
    詳細地址: "",
    // 可選擇保留
    // 婚姻狀態: "",
    // 是否死亡: false,
    // 死亡日期: "",
    // 緊急聯絡人關係: "",
    // 緊急聯絡人姓名: "",
    // 緊急聯絡人電話: "",
    // 所屬機構: "",
    語言: "zh-TW",
  });

  // 處理一般輸入
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const target = e.target as HTMLInputElement | HTMLSelectElement;
    const { name, value } = target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // 縣市選單變更
  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCity = e.target.value;
    setFormData({
      ...formData,
      縣市: newCity,
      區鄉鎮: "",
      郵遞區號: "",
    });
  };

  // 區/鄉鎮選單變更，連動郵遞區號
  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newDistrict = e.target.value;
    const postal = formData.縣市
      ? taiwanAreas[formData.縣市].find((d) => d.name === newDistrict)?.zip ||
        ""
      : "";
    setFormData({
      ...formData,
      區鄉鎮: newDistrict,
      郵遞區號: postal,
    });
  };

  // 送出表單
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const 姓 = formData.姓名.charAt(0);
    const 名 = formData.姓名.slice(1);
    const updatedData = { ...formData, 姓, 名 };
    setFormData(updatedData);
    onSubmitData(updatedData);
    alert("病患資料已送出");
    console.log("病患資料送出:", updatedData);
  };

  return (
    <div className="max-w-3xl mx-auto my-6 p-6 border rounded-lg shadow bg-white">
      <h2 className="text-xl font-bold text-center mb-6">病患資料表單</h2>

      <form onSubmit={handleSubmit} className="form-grid gap-4">
        <label>
          身分證字號：
          <input
            name="身分證字號"
            value={formData.身分證字號}
            onChange={handleChange}
          />
        </label>
        <label>
          姓名：
          <input name="姓名" value={formData.姓名} onChange={handleChange} />
        </label>
        <label>
          性別：
          <select name="性別" value={formData.性別} onChange={handleChange}>
            <option value="">請選擇</option>
            <option value="男">男</option>
            <option value="女">女</option>
            {/*
            <option value="其他">其他</option>
            <option value="不明">不明</option>
            */}
          </select>
        </label>
        <label>
          出生日期：
          <input
            type="date"
            name="出生日期"
            value={formData.出生日期}
            onChange={handleChange}
          />
        </label>
        <label>
          電話：
          <input name="電話" value={formData.電話} onChange={handleChange} />
        </label>
        <label>
          Email：
          <input
            type="email"
            name="Email"
            value={formData.Email}
            onChange={handleChange}
          />
        </label>

        {/* 地址 */}
        <fieldset className="col-span-full border p-4 rounded">
          <legend className="font-semibold">地址</legend>

          <label>
            縣/市：
            <select name="縣市" value={formData.縣市} onChange={handleCityChange}>
              <option value="">請選擇縣市</option>
              {Object.keys(taiwanAreas).map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>

          <label>
            區/鄉鎮：
            <select
              name="區鄉鎮"
              value={formData.區鄉鎮}
              onChange={handleDistrictChange}
              disabled={!formData.縣市}
            >
              <option value="">
                {formData.縣市 ? "請選擇區" : "請先選擇縣市"}
              </option>
              {formData.縣市 &&
                taiwanAreas[formData.縣市].map((d) => (
                  <option key={d.name} value={d.name}>
                    {d.name}
                  </option>
                ))}
            </select>
          </label>

          <label>
            郵遞區號：
            <input type="text" name="郵遞區號" value={formData.郵遞區號} readOnly />
          </label>
          <label>
            詳細地址：
            <input
              name="詳細地址"
              value={formData.詳細地址}
              onChange={handleChange}
            />
          </label>
        </fieldset>

        {/* 送出按鈕 */}
        <div className="col-span-full text-center mt-6">
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            送出病患資料
          </button>
        </div>
      </form>
    </div>
  );
}
