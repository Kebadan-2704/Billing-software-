import re
import base64
import io
import os
import logging
from typing import Optional
import numpy as np
from PIL import Image, ImageEnhance, ImageFilter
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Invoice OCR Service", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Lazy-load EasyOCR reader
_reader = None

def get_reader():
    global _reader
    if _reader is None:
        import easyocr
        logger.info("Loading EasyOCR model...")
        _reader = easyocr.Reader(["en"], gpu=False)
        logger.info("EasyOCR model loaded.")
    return _reader


class OCRRequest(BaseModel):
    image: str  # base64-encoded image


class InvoiceItem(BaseModel):
    name: str
    price: float


class OCRResponse(BaseModel):
    items: list[InvoiceItem]
    total: float
    description: str
    raw_text: Optional[str] = None


# ──────────────────────────────────────────────────────────────
# v2: Smart invoice parsing — no header detection needed
# ──────────────────────────────────────────────────────────────

NOISE_KEYWORDS = {
    'GSTIN', 'EMAIL', 'PAN', 'PHONE', 'ADDRESS', 'STATE CODE', 'INVOICE',
    'TAX', 'CGST', 'SGST', 'IGST', 'HSN', 'SAC', 'DATE', 'BILL NO',
    'CUSTOMER', 'BUYER', 'SELLER', 'SHIP TO', 'PLACE OF', 'SUPPLY',
    'BANK', 'IFSC', 'A/C', 'ACCOUNT', 'BRANCH', 'UPI', 'PAYMENT',
    'TERMS', 'NOTE', 'AUTHORIZED', 'SIGNATORY', 'SUBJECT TO',
    'DECLARATION', 'REGISTERED', 'JURISDICTION', 'THANK',
    'ORIGINAL', 'DUPLICATE', 'COPY', 'WWW', 'HTTP',
    'SL NO', 'SR NO', 'S.NO', 'PARTICULARS', 'QTY', 'RATE',
    'DESCRIPTION', 'PRODUCT', 'SERVICE', 'UNIT PRICE',
    'DELIVER', 'DELIVERY', 'PLEASE', 'BUILDING',
    'DISPATCH', 'KINDLY', 'REGARDS', 'DEAR', 'SIR', 'MADAM',
    'RECEIVED', 'CERTIFIED', 'TRANSPORT', 'FREIGHT', 'VEHICLE',
    'CONSIGNEE', 'CONSIGNOR', 'PARTY', 'FIRM', 'COMPANY',
    'E. & O.E', 'MOBILE', 'FAX', 'TEL', 'RUPEES', 'IN WORDS',
}

SUMMARY_KEYWORDS = {
    'TOTAL', 'SUBTOTAL', 'SUB TOTAL', 'GRAND', 'NET',
    'BALANCE', 'AMOUNT PAYABLE', 'AMOUNT DUE', 'ROUND',
    'GROSS', 'NET PAYABLE',
}


def preprocess_image(image: Image.Image) -> Image.Image:
    """Enhance the image for better OCR accuracy."""
    # Convert to grayscale
    img = image.convert('L')
    # Increase contrast
    enhancer = ImageEnhance.Contrast(img)
    img = enhancer.enhance(2.0)
    # Sharpen
    img = img.filter(ImageFilter.SHARPEN)
    # Scale up small images for better recognition
    w, h = img.size
    if w < 1000:
        scale = 1500 / w
        img = img.resize((int(w * scale), int(h * scale)), Image.LANCZOS)
    return img.convert('RGB')


def is_noise(upper: str) -> bool:
    """Check if a line is noise/metadata (not an item or total)."""
    if len(upper) < 3:
        return True
    return any(kw in upper for kw in NOISE_KEYWORDS)


def is_summary(upper: str) -> bool:
    """Check if a line is a total/summary line."""
    return any(kw in upper for kw in SUMMARY_KEYWORDS)


def extract_items_and_total(lines: list[str]) -> tuple[list[dict], float]:
    """
    v2: Simple scan — every line with text + number is a potential item.
    No header/trigger detection needed.
    """
    items = []
    total_amount = 0.0

    for line in lines:
        trimmed = line.strip()
        upper = trimmed.upper()

        if is_noise(upper):
            continue

        # Summary/Total lines → capture total
        if is_summary(upper):
            nums = re.findall(r'(\d[\d,]*\.?\d*)', trimmed)
            if nums:
                price = float(nums[-1].replace(',', ''))
                if price > 0:
                    total_amount = max(total_amount, price)
                    logger.info(f"  TOTAL: {price}")
            continue

        # Try to extract item: must have text AND a number
        nums = re.findall(r'(\d[\d,]*\.?\d*)', trimmed)
        if not nums:
            continue

        # Name: strip leading index (1. or 1) or 1 ), then get text before first big number
        name_part = re.sub(r'^\d{1,2}[\.\)\s]+', '', trimmed)
        big_num = re.search(r'\d{3,}|\d+\.\d', name_part)
        if big_num:
            name_part = name_part[:big_num.start()]
        name_part = re.sub(r'[^a-zA-Z\s]', '', name_part).strip()

        if len(name_part) < 2:
            continue

        # Price: prefer explicit decimals (xxx.xx), else use last number
        explicit = re.findall(r'(\d[\d,]*\.\d{2})', trimmed)
        if explicit:
            price = float(explicit[-1].replace(',', ''))
        else:
            price = float(nums[-1].replace(',', ''))

        if price > 0 and price < 10_000_000:
            items.append({"name": name_part.upper(), "price": price})
            logger.info(f"  ITEM: {name_part.upper()} -> {price}")

    # If no summary total found, sum up items
    if total_amount == 0 and items:
        total_amount = sum(it["price"] for it in items)

    return items, total_amount


# ──────────────────────────────────────────────────────────────
# Routes
# ──────────────────────────────────────────────────────────────

@app.get("/")
def health():
    return {"status": "ok", "service": "Invoice OCR API v2.0"}


@app.get("/health")
def health_check():
    return {"status": "ok", "version": "2.0.0"}


@app.post("/extract", response_model=OCRResponse)
async def extract_invoice(request: OCRRequest):
    try:
        # Decode base64 image
        img_data = base64.b64decode(request.image)
        image = Image.open(io.BytesIO(img_data)).convert("RGB")

        # Preprocess for better accuracy
        processed = preprocess_image(image)
        img_array = np.array(processed)

        reader = get_reader()

        logger.info("Running EasyOCR on preprocessed image...")
        # Use detail=1 to get bounding boxes + confidence
        results = reader.readtext(img_array, detail=1, paragraph=False)
        logger.info(f"Got {len(results)} text blocks from EasyOCR")

        # Sort by vertical position (top-to-bottom) then horizontal (left-to-right)
        results.sort(key=lambda r: (r[0][0][1], r[0][0][0]))

        # Group nearby text blocks into logical lines based on Y-coordinate
        lines = []
        current_line = []
        current_y = -1
        y_threshold = 15  # pixels - blocks within this vertical range are same line

        for bbox, text, conf in results:
            y_center = (bbox[0][1] + bbox[2][1]) / 2
            if current_y == -1:
                current_y = y_center
            
            if abs(y_center - current_y) > y_threshold:
                # Start a new line
                if current_line:
                    # Sort blocks within line by X position (left to right)
                    current_line.sort(key=lambda b: b[1])
                    line_text = " ".join(b[0] for b in current_line)
                    lines.append(line_text)
                current_line = [(text, bbox[0][0])]
                current_y = y_center
            else:
                current_line.append((text, bbox[0][0]))

        # Don't forget the last line
        if current_line:
            current_line.sort(key=lambda b: b[1])
            line_text = " ".join(b[0] for b in current_line)
            lines.append(line_text)

        raw_text = "\n".join(lines)
        logger.info(f"Reconstructed {len(lines)} lines:\n{raw_text}")

        items, total = extract_items_and_total(lines)

        description = items[0]["name"] if items else "Extracted Expense"

        return OCRResponse(
            items=[InvoiceItem(name=it["name"], price=it["price"]) for it in items],
            total=total,
            description=description,
            raw_text=raw_text,
        )

    except Exception as e:
        logger.error(f"OCR Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
