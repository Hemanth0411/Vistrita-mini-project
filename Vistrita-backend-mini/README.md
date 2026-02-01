# Vistrita API (Mini-Project)

The backend service for **Vistrita**, an AI-powered Product Description Generator. 
This API leverages **Google Gemini 2.0 Flash** to generate marketing copy and extract attributes from product images.

## 🚀 Features
- **Health Check:** Monitor API uptime.
- **AI Text Generation:** Create titles, descriptions, and bullets from raw features.
- **Vision Extraction:** Upload product images to automatically detect color, material, and style.
- **One-Shot Generation:** Upload an image -> Get a full product description in one step.
- **Rate Limiting:** Global and endpoint-specific rate limits to prevent abuse (via `slowapi`).
- **Strict JSON Schemas:** Guaranteed valid JSON outputs for frontend integration.


## 🛠️ Tech Stack
- **Language:** Python 3.10+
- **Framework:** FastAPI
- **AI Model:** Google Gemini 2.0 Flash (via `google-genai` SDK)
- **Containerization:** Docker & Docker Compose

## ⚡ Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/Hemanth0411/Vistrita-backend.git
cd Vistrita-backend
```

### 2. Configure Environment
Create a `.env` file in the root directory:
```bash
cp .env.example .env
```
Open `.env` and paste your Google Gemini API Key:
```ini
GOOGLE_API_KEY=AIzaSy...
```

### 3. Run with Docker (Recommended)
```bash
docker-compose up --build
```
The API will start at: `http://localhost:8000`

## 📚 API Documentation
Once running, access the interactive Swagger UI:
👉 **[http://localhost:8000/docs](http://localhost:8000/docs)**

### Key Endpoints
| Method | Endpoint | Purpose |
| :--- | :--- | :--- |
| `GET` | `/api/v1/health` | Check if backend is running |
| `POST` | `/api/v1/generate` | Generate text from raw inputs |
| `POST` | `/api/v1/vision/extract` | Extract attributes from an image (Base64) |
| `POST` | `/api/v1/generate/from-vision` | Image + Tone -> Full Description |

## 📜 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.



