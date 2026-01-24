# 🧾 Vyapaar360 — A 360 Degree Solution for Modern Indian Businesses

Vyapaar360 is a **full-stack MERN business management platform** built specifically for **Indian retail shop owners** to digitize their daily operations — including billing, GST tracking, inventory management, purchases, smart insights, and professional reports.

This project focuses not only on features, but also on **real-world production deployment**, **timezone-safe calculations (IST)**, **environment handling**, and **scalable shop specific backend architecture**.

<img width="922" height="271" alt="logo" src="https://github.com/user-attachments/assets/646a9208-4c99-4534-89c9-44a836ce86c2" />

## ✨ Key Features

### 🏪 For Shop Owners (Core Features)

#### 📊 Smart Business Dashboard
- Today’s Sales tracking
- Monthly Sales & Purchases overview
- GST Input / Output summary
- Low stock alerts
- Visual sales & purchase trends (charts)

#### 🧾 GST Ready Billing & Sales
- Invoice generation with automatic GST calculation
- Customer management
- Pending payments & credit tracking
- Sales history with filtering

#### 📦 Purchase Management
- Record all shop purchases
- Track monthly purchase totals
- Maintain supplier purchase history

#### 📦 Inventory Management
- Live stock count
- Low stock alerts
- Dead stock detection
- Smart stock status (LOW / NORMAL / HIGH)

#### 🧠 Smart Insights (Rule-based analytics)
- Business Health Score
- Cash Flow Health
- Reorder Suggestions based on last 30 days sales
- Customer Payment Risk detection

#### 📄 Professional PDF Reports
- Today’s Business Report
- Monthly Business Report
- Sales Summary Report

#### 🌐 Professional Landing Page
- Feature showcase with real screenshots
- Professional UI for real shop owners
- Direct login/register access

## 🚀 Technology Stack

### Frontend
- React.js (Vite)
- Tailwind CSS
- Axios with Interceptors
- React Router DOM

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- PDFKit for reports

### Deployment
- Frontend: Vercel
- Backend: Render
- Database: MongoDB Atlas

## 📱 Application Screenshots

### 🏠 Landing Page
<!-- ADD LANDING PAGE SCREENSHOT HERE -->
<img width="1901" height="917" alt="Screenshot 2026-01-24 145503" src="https://github.com/user-attachments/assets/39e7c6d1-2449-4394-833f-f5b59afbe537" />

### 🔐 Login / Register
<!-- ADD LOGIN PAGE SCREENSHOT HERE -->

<img width="1919" height="917" alt="Screenshot 2026-01-24 145657" src="https://github.com/user-attachments/assets/6abb1c5b-b14c-49b4-9d8b-b949331e2370" />
<img width="1919" height="919" alt="Screenshot 2026-01-24 145707" src="https://github.com/user-attachments/assets/b9cbfa9f-d6af-4fda-ab9b-bf4e2d13b69d" />

### 📊 Dashboard Overview
<!-- ADD DASHBOARD SCREENSHOT HERE -->
<img width="1898" height="832" alt="Screenshot 2026-01-24 145940" src="https://github.com/user-attachments/assets/62366d5a-9d2e-4634-aafc-4ffc2d90f1ca" />
<img width="991" height="549" alt="Screenshot 2026-01-23 182635" src="https://github.com/user-attachments/assets/80f5a52d-b79f-4f6f-ba59-fde7b6fecd52" />


### 🧾 Billing / Sales Page
<!-- ADD SALES PAGE SCREENSHOT HERE -->
<img width="1899" height="914" alt="Screenshot 2026-01-24 150309" src="https://github.com/user-attachments/assets/e51554fe-c44f-4e05-8403-57e22bd140ef" />
<img width="1901" height="920" alt="Screenshot 2026-01-24 150327" src="https://github.com/user-attachments/assets/68a01b8c-bf29-4be3-822b-af88f655b27d" />



### 📦 Purchase Management
<!-- ADD PURCHASE PAGE SCREENSHOT HERE -->
<img width="1379" height="868" alt="Screenshot 2026-01-23 180843" src="https://github.com/user-attachments/assets/8931ff37-f096-4e42-a894-fc200e03de9e" />
<img width="1899" height="917" alt="Screenshot 2026-01-24 150354" src="https://github.com/user-attachments/assets/d68f3bc8-f14e-447e-886c-ec9964078e0a" />


### 📦 Inventory & Stock Alerts
<!-- ADD INVENTORY PAGE SCREENSHOT HERE -->
<img width="1900" height="918" alt="Screenshot 2026-01-24 150441" src="https://github.com/user-attachments/assets/87159a9b-8791-4aa0-86b1-8b16f1d8af67" />



### 🧠 Smart Insights Page
<!-- ADD INSIGHTS PAGE SCREENSHOT HERE -->
<img width="1899" height="919" alt="Screenshot 2026-01-24 150426" src="https://github.com/user-attachments/assets/ca6b6889-76ae-4664-93c1-4a5fb9f15242" />



### 📄 Reports Download (PDF)
<!-- ADD REPORTS PAGE SCREENSHOT HERE -->
<img width="1900" height="915" alt="Screenshot 2026-01-24 150154" src="https://github.com/user-attachments/assets/38908a5b-04d7-4f13-a910-aa758850cd5c" />


## 🌐 Live Demo

**🔗 [Visit Vyapaar360](https://vyapaar360.vercel.app/)**

## 📋 Prerequisites

- Node.js (v16+)
- npm
- MongoDB Atlas
- Git

## ⚡ Quick Start (Local Setup)

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/gtushar8055/vyapaar360.git
cd vyapaar360
```

### 2️⃣ Install Dependencies

**Backend**
```bash
cd backend
npm install
```

**Frontend**
```bash
cd ../frontend
npm install
```

### 3️⃣ Environment Variables

- Create .env files in both frontend and backend

### 4️⃣ Run the Application

**Backend**
```bash
cd backend
npm run dev
```

**Frontend**
```bash
cd frontend
npm run dev
```

- Frontend → http://localhost:5173
- Backend → http://localhost:5000

## 📁 Project Structure

```
vyapaar360/
├── backend/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   ├── server.js
│   └── package.json
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── pages/
│   │   └── App.jsx
│   └── package.json
```

## 🧠 Important Engineering Learnings

- IST vs UTC timezone handling in production
- Environment-based API handling (local + deployed)
- Axios interceptor for JWT
- Vercel SPA routing rewrites
- Render root directory deployment
- MongoDB aggregations for analytics

## 🚀 Deployment

### Backend → Render
- Root Directory: backend
- Build: npm install
- Start: npm start

### Frontend → Vercel
- Root Directory: frontend
- Framework: Vite

## 📞 Contact

**Developer:** Tushar Gupta  
**GitHub:** https://github.com/gtushar8055  
**Email:** tushargupta12312021@gmail.com  

## ⭐ Support

If you found this project helpful, give it a ⭐ on GitHub!

**Made with dedication and real-world debugging by Tushar Gupta**
