"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import IssuerPage from "./issuer";
import VerifierPage from "./verifier";
import "./globals.css";

export default function MainPage() {
  const [mode, setMode] = useState<"issuer" | "verifier">("issuer");

  return (
    <main className="flex flex-col items-center justify-start py-16 min-h-screen">
      {/* 標題 */}
      <h1>童行證 FHIR / VC 系統</h1>

      {/* 模式切換按鈕 */}
      <div className="mode-buttons">
        <button
          onClick={() => setMode("issuer")}
          className={mode === "issuer" ? "active bg-blue-500" : "bg-blue-500"}
        >
          發行端
        </button>
        <button
          onClick={() => setMode("verifier")}
          className={mode === "verifier" ? "active bg-green-500" : "bg-green-500"}
        >
          驗證端
        </button>
      </div>

      {/* 動畫切換內容 */}
      <div className="content-wrapper">
        <AnimatePresence mode="wait">
          <motion.div
            key={mode}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
          >
            {mode === "issuer" && <IssuerPage />}
            {mode === "verifier" && (
              <div className="verifier-container">
                <h2>選擇驗證場景</h2>
                <VerifierPage />
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </main>
  );
}
