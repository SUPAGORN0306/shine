# Shine — Smart Energy Decision & Control System

> ⚠️ **Prototype Simulation Notice**
>
> โปรเจกต์นี้เป็น **Prototype** เพื่อสาธิตแนวคิดระบบจัดการพลังงานภายในบ้าน
> ทุกส่วนที่เกี่ยวกับ Energy Monitor, NILM, Prediction, และ Control
> **ยังไม่ใช่การ implement จริง** — ใช้ข้อมูลจำลองและ rule-based logic เท่านั้น
> **ไม่มี AI model ที่ train จริง** และ **ไม่มีการเชื่อมต่ออุปกรณ์จริง**

---

## Overview

Shine เป็น Prototype ของระบบจัดการพลังงานภายในบ้าน ที่มุ่งเน้นแนวคิด:
Monitor → Identify → Predict → What-if → Decide → User Choice → Control → Feedback


ระบบไม่ได้ให้ AI ตัดสินใจแทนผู้ใช้ แต่ให้ระบบวิเคราะห์ เสนอทางเลือก
และ **ให้ผู้ใช้เป็นคนเลือกแผน** ที่ต้องการนำไปใช้

---

## Core Concept

> **AI calculates.**
> **Human decides.**
> **System learns.**

- **AI calculates** — ระบบวิเคราะห์ข้อมูล สร้างการคาดการณ์ และจำลองสถานการณ์
- **Human decides** — ผู้ใช้เป็นผู้เลือกแผน (ไม่มี auto-select)
- **System learns** — ระบบเรียนรู้จาก feedback และปรับ preference score

---

## Features

- **Energy Monitoring** — แสดงกำลังไฟ แรงดัน กระแส และพลังงานสะสม
- **Device Identification** — ประมาณการแยกอุปกรณ์จาก Aggregate Power (Prototype Simulation)
- **Energy Prediction** — คาดการณ์พลังงาน 1/3/6 ชั่วโมงข้างหน้า
- **What-if Simulation** — ทดลองเปลี่ยนพฤติกรรม + คำนวณการประหยัดทันที
- **Decision Engine** — สร้าง 2–3 แผนตาม goal, priority และ constraints
- **Human-in-the-loop** — ระบบเสนอแผน ผู้ใช้เลือกและยืนยัน
- **Device Permission** — AUTO / ASK / NEVER พร้อม enforce จริงใน service layer
- **Control Simulation** — จำลองการ execute ตาม permission
- **Feedback** — เปรียบเทียบ Expected vs Actual + เก็บ rating
- **User Preference Learning** — Rule-based (Prototype) ปรับ preference score ตาม feedback

---

## Technology

- **React 18** + **TypeScript**
- **Vite** (build tool)
- **React Router** (HashRouter สำหรับ GitHub Pages)
- **Recharts** (charts)
- **Lucide React** (icons)
- **GitHub Pages** (hosting)
- **LocalStorage** (persistence — ไม่มี backend)

---

## Current Prototype

### สิ่งที่เป็น **Prototype Simulation** ทั้งหมด:

| ส่วน | สถานะ |
|------|-------|
| **Energy Monitor** | Prototype Simulation — ใช้ mock data ไม่ได้เชื่อมฮาร์ดแวร์จริง |
| **NILM (Device Identification)** | Prototype Simulation — ใช้ rule-based result ไม่ใช่ ML model |
| **Prediction** | Prototype Simulation — ใช้ heuristic (hour-of-day profile) ไม่ได้ train XGBoost |
| **Control Layer** | Prototype Simulation — ไม่ได้เชื่อม Smart Plug / Smart Switch |
| **Decision Engine** | Rule-based Simulation — ใช้ scoring + constraint check |
| **User Preference Learning** | Rule-based Prototype — ไม่ใช่ Deep Learning |

### สิ่งที่ **ยังไม่มี** ใน Prototype นี้:

- ❌ Real hardware integration
- ❌ Real NILM model
- ❌ Real trained prediction model
- ❌ Real smart plug control
- ❌ Backend server
- ❌ Cloud database
- ❌ API key ใดๆ

---

## Future Development

ระบบสามารถต่อยอดเป็นระบบจริงได้ตามเส้นทาง:
Energy Monitor hardware
→ Real-time data ingestion
→ Real NILM model (ML-based disaggregation)
→ XGBoost / Gradient Boosting prediction
→ Real device APIs (Smart Plug / Smart Switch)
→ Real feedback loop


ทุกจุดในระบบออกแบบให้ **แยก logic ออกจาก UI** เพื่อให้เปลี่ยน simulation เป็น real implementation ได้โดยไม่ต้องแก้ UI

---

## Getting Started

### รันในเครื่อง

```bash
npm install
npm run dev

เปิด http://localhost:5173

Build
npm run build
ผลลัพธ์อยู่ในโฟลเดอร์ dist/

Preview production build
npm run preview

Deployment (GitHub Pages)
ขั้นตอนตั้งค่าครั้งแรก
สร้าง Repository ชื่อ shine บน GitHub (Public)

Push โค้ดทั้งหมด ขึ้น branch main

ไปที่ Settings → Pages

Source: เลือก "GitHub Actions" (ไม่ใช่ "Deploy from a branch")

รอ workflow Deploy to GitHub Pages รันเสร็จ (~1-2 นาที)

เว็บจะ live ที่: https://<username>.github.io/shine/

Routing
ใช้ HashRouter เพื่อหลีกเลี่ยง 404 บน GitHub Pages:
https://<username>.github.io/shine/#/dashboard
https://<username>.github.io/shine/#/energy
https://<username>.github.io/shine/#/devices
https://<username>.github.io/shine/#/forecast
https://<username>.github.io/shine/#/what-if
https://<username>.github.io/shine/#/decisions
https://<username>.github.io/shine/#/automation
https://<username>.github.io/shine/#/feedback
https://<username>.github.io/shine/#/settings

Project Structure
shine/
├── .github/workflows/deploy.yml    # GitHub Actions
├── src/
│   ├── components/                 # UI + domain components
│   │   ├── ui/                     # Card, Badge, Button, Modal, ...
│   │   ├── Layout/                 # Layout หลัก
│   │   ├── Sidebar/                # เมนู
│   │   ├── Header/                 # ส่วนบน
│   │   └── ...                     # Domain components
│   ├── pages/                      # 9 หน้า
│   ├── services/                   # Business logic ทั้งหมด
│   ├── data/mockData.ts            # ข้อมูลจำลอง
│   ├── types/index.ts              # Types ศูนย์กลาง
│   ├── utils/                      # Helper functions
│   ├── contexts/                   # React Context
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css                   # Design tokens
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md

Disclaimer
โปรเจกต์นี้เป็น Prototype เพื่อการศึกษาและสาธิต เท่านั้น
❌ ไม่มีการเชื่อมต่อฮาร์ดแวร์จริง
❌ ไม่มี AI model ที่ train จริง
❌ ไม่มีการควบคุมอุปกรณ์จริง
❌ ไม่มี cloud database หรือ backend
ข้อมูลทั้งหมดถูกเก็บใน LocalStorage ของเบราว์เซอร์ และใช้ mock data สำหรับการจำลอง
