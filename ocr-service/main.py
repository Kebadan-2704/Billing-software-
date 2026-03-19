import re
import base64
import io
import os
import logging
from typing import Optional
import numpy as np
from PIL import Image
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Invoice OCR Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Lazy-load EasyOCR reader to avoid slow startup
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
# Invoice-specific parsing logic
# ──────────────────────────────────────────────────────────────

TABLE_START_KEYWORDS = {
    "PRODUCT", "SERVICE", "DESCRIPTION", "ITEM", "PARTICULARS"
}
TABLE_SECOND_KEYWORDS = {
    "RATE", "PRICE", "AMOUNT", "QTY", "VALUE", "TAXABLE", "TOTAL"
}
TABLE_END_KEYWORDS = {
    "TOTAL", "SUBTOTAL", "GRAND TOTAL", "AMOUNT IN WORDS",
    "AMOUNT PAYABLE", "NET PAYABLE"
}
SUMMARY_KEYWORDS = {
    "TOTAL", "SUBTOTAL", "GRAND TOTAL", "GROSS TOTAL",
    "AMOUNT PAYABLE", "NET PAYABLE", "TAXABLE VALUE"
}
GARBAGE_KEYWORDS = {
    "GSTIN", "EMAIL", "PAN NO", "PHONE", "ADDRESS", "STATE CODE",
    "AUTHORIZED", "SIGNATORY", "SEAL", "DECLARATION", "NOTE"
}


def parse_price(text: str) -> float:
    """Extract numeric price from a string (e.g. '1,200.00' -> 1200.0)"""
    cleaned = text.replace(",", "").strip()
    try:
        return float(cleaned)
    except ValueError:
        return 0.0


def extract_price_from_line(line: str) -> float:
    """Find the last explicit price (with decimal) or trailing large integer."""
    # Explicit decimal prices: 11,200.00 or 1200.00
    explicit = re.findall(r"\d{1,3}(?:,\d{3})*\.\d{2}", line)
    if explicit:
        return parse_price(explicit[-1])

    # Implicit price: trailing 4+ digit integer (divide by 100 to recover decimals)
    implicit = re.findall(r"(\d{4,10})(?:\s*$)", line)
    if implicit:
        return int(implicit[-1]) / 100

    return 0.0


def extract_name_from_line(line: str) -> str:
    """Grab leading alphabetic text strictly before numerics start."""
    match = re.match(
        r"^[\d\s]*([a-zA-Z][a-zA-Z\s]{1,40}?)(?=\s{2,}|\s\d|\d{2,}|$)",
        line
    )
    if match:
        return match.group(1).strip()
    return ""


def is_table_start(upper: str) -> bool:
    has_first = any(k in upper for k in TABLE_START_KEYWORDS)
    has_second = any(k in upper for k in TABLE_SECOND_KEYWORDS)
    return has_first and has_second


def is_table_end(upper: str) -> bool:
    return any(upper.startswith(k) or upper == k for k in TABLE_END_KEYWORDS)


def is_summary(upper: str) -> bool:
    return any(k in upper for k in SUMMARY_KEYWORDS)


def is_garbage(upper: str, line_len: int) -> bool:
    if line_len < 3:
        return True
    return any(k in upper for k in GARBAGE_KEYWORDS)


def parse_invoice(lines: list[str]) -> tuple[list[dict], float]:
    """
    Parse OCR lines into items and total.
    Returns (items_list, total_amount)
    """
    items: list[dict] = []
    total_amount = 0.0
    pending_name = ""
    table_started = False
    table_finished = False

    for line in lines:
        trimmed = line.strip()
        upper = trimmed.upper()

        # Table start trigger (before garbage filter)
        if not table_started and is_table_start(upper):
            table_started = True
            logger.info("TABLE STARTED")
            continue

        # Table end trigger (before garbage filter)
        if table_started and not table_finished and is_table_end(upper):
            table_started = False
            table_finished = True
            logger.info("TABLE FINISHED")

        # Garbage/noise filter (runs AFTER triggers)
        if is_garbage(upper, len(trimmed)):
            continue

        # Summary line → capture total
        if is_summary(upper):
            price = extract_price_from_line(trimmed)
            if price > 0 and re.search(r"(TOTAL|AMOUNT|PAYABLE)", upper):
                total_amount = max(total_amount, price)
            continue

        # Item row
        if table_started:
            raw_name = extract_name_from_line(trimmed)
            price = extract_price_from_line(trimmed)

            if raw_name and price > 0:
                items.append({"name": raw_name.upper(), "price": price})
                pending_name = ""
                logger.info(f"  ITEM: {raw_name} -> {price}")
            elif raw_name:
                pending_name = raw_name.upper()
            elif price > 0 and pending_name:
                items.append({"name": pending_name, "price": price})
                logger.info(f"  ITEM (pending): {pending_name} -> {price}")
                pending_name = ""

    # If we never found a summary total, sum up items
    if total_amount == 0 and items:
        total_amount = sum(it["price"] for it in items)

    return items, total_amount


# ──────────────────────────────────────────────────────────────
# Routes
# ──────────────────────────────────────────────────────────────

@app.get("/")
def health():
    return {"status": "ok", "service": "Invoice OCR API"}


@app.get("/health")
def health_check():
    return {"status": "ok"}


@app.post("/extract", response_model=OCRResponse)
async def extract_invoice(request: OCRRequest):
    try:
        # Decode base64 image
        img_data = base64.b64decode(request.image)
        image = Image.open(io.BytesIO(img_data)).convert("RGB")
        img_array = np.array(image)

        reader = get_reader()

        logger.info("Running EasyOCR on image...")
        results = reader.readtext(img_array, detail=0, paragraph=False)
        logger.info(f"Got {len(results)} text blocks from EasyOCR")

        raw_text = "\n".join(results)
        logger.info(f"Raw OCR text:\n{raw_text}")

        items, total = parse_invoice(results)

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
