# ========== 第一階段：Build 專案 ==========
FROM node:20-alpine AS builder

# 設定工作目錄
WORKDIR /app

# 複製 package 檔先安裝依賴
COPY package*.json ./

# 安裝依賴（含 devDependencies，用於 build）
RUN npm install

# 複製全部程式碼
COPY . .

# 建置 Next.js 專案
RUN npm run build

# ========== 第二階段：Production 運行 ==========
FROM node:20-alpine AS runner

WORKDIR /app

# 設定 NODE_ENV 為 production
ENV NODE_ENV=production
ENV PORT=3001 
# 從 builder 複製 build 結果與必要檔案
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./

# 安裝 production-only 依賴（不裝 devDependencies）
RUN npm install --omit=dev

# Next.js 預設會跑在 port 3000
EXPOSE 3000
EXPOSE 3001 
# 啟動 Next.js 應用
CMD ["npm", "start"]
