# Invoice OCR Service

A Python FastAPI microservice that uses **EasyOCR** for accurate invoice text extraction. Much more accurate than browser-based Tesseract.js for structured documents like invoices and purchase orders.

## Features
- 🔬 **EasyOCR** — state-of-the-art deep-learning OCR model (pre-trained on millions of document images)
- 📊 **Table Detection** — smart header/footer triggers to isolate product rows
- 💰 **Price Recovery** — handles both explicit decimals and missing dots
- 🏷️ **Clean Item Names** — strict alphabetic extraction before numeric columns
- 🌐 **REST API** — simple JSON-in / JSON-out interface

## Deploy to Render

1. Create a new **Web Service** on [render.com](https://render.com)
2. Connect this repository (or the `ocr-service/` subfolder)
3. Set:
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - **Environment**: Python 3.11
4. Copy the deployed URL and set it in `NEXT_PUBLIC_OCR_API_URL` in Vercel

## API

### `POST /extract`

**Request:**
```json
{
  "image": "<base64-encoded-image>"
}
```

**Response:**
```json
{
  "items": [
    { "name": "CLEANIC", "price": 11200.00 },
    { "name": "SOLVENT", "price": 2240.00 }
  ],
  "total": 16590.00,
  "description": "CLEANIC"
}
```

### `GET /health`

Returns `{"status": "ok"}`

## Local Development

```bash
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```
