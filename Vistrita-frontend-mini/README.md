# Vistrita Frontend

The frontend for **Vistrita**, an AI-powered Product Description Generator. Built with React, Vite, and Tailwind CSS.

## 🚀 Features
- **AI Content Generation:** Dashboard to input product features and get marketing copy.
- **Image Analysis:** Upload images to extract attributes (color, material, style) using Computer Vision.
- **Unified Workflow:** Extract features from an image and generate a full description in one go.
- **History Tracking:** Review previously generated product descriptions.
- **Modern UI:** Built with Shadcn/UI and Framer Motion for a premium look and feel.

## 🛠️ Tech Stack
- **Framework:** React + Vite
- **Styling:** Tailwind CSS + Shadcn/UI
- **Animations:** Framer Motion
- **Language:** TypeScript
- **Containerization:** Docker

## ⚡ Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Create a `.env` file or use the global one in the root. The frontend expects the backend to be at `http://localhost:8000`.

### 3. Run Development Server
```bash
npm run dev
```
The app will be available at [http://localhost:3000](http://localhost:3000)

## 📦 Docker Deployment
You can also run just the frontend via Docker:
```bash
docker build -t vistrita-frontend .
docker run -p 3000:80 vistrita-frontend
```

## 📜 License
This project is licensed under the MIT License.
