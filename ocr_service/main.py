import os
import io
import time
import requests
import numpy as np
import cv2
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
import fitz # PyMuPDF
from pdf2image import convert_from_bytes
from paddleocr import PaddleOCR
import pytesseract
from PIL import Image, ImageEnhance

app = FastAPI(title="MedBridge OCR Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize PaddleOCR for both English and Urdu (lang='en' or 'ur')
# PaddleOCR automatically handles multilingual if you use appropriate models, 
# or we initialize two instances, but 'ur' supports Urdu and often works with numbers. 
# Alternatively, 'en' and 'ur' can be run sequentially or combined. 
# PaddleOCR's default multilingual model supports English.
try:
    ocr_paddle_ur = PaddleOCR(use_angle_cls=True, lang='ur', use_gpu=False, show_log=False)
    ocr_paddle_en = PaddleOCR(use_angle_cls=True, lang='en', use_gpu=False, show_log=False)
except Exception as e:
    print("Warning: PaddleOCR failed to initialize. Make sure paddlepaddle is installed correctly.", e)

def preprocess_image(cv_image):
    """
    Image preprocessing: Grayscale, Deskew, Noise Removal, Adaptive Thresholding
    """
    # 1. Grayscale
    if len(cv_image.shape) == 3:
        gray = cv2.cvtColor(cv_image, cv2.COLOR_BGR2GRAY)
    else:
        gray = cv_image
        
    # 2. Deskewing
    coords = np.column_stack(np.where(gray > 0))
    if len(coords) > 0:
        angle = cv2.minAreaRect(coords)[-1]
        if angle < -45:
            angle = -(90 + angle)
        else:
            angle = -angle
        (h, w) = gray.shape[:2]
        center = (w // 2, h // 2)
        M = cv2.getRotationMatrix2D(center, angle, 1.0)
        gray = cv2.warpAffine(gray, M, (w, h), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE)
        
    # 3. Noise removal & Contrast enhancement
    # Denoising
    denoised = cv2.fastNlMeansDenoising(gray, h=10)
    
    # Adaptive thresholding
    # Keep the image somewhat smooth for dot-heavy languages like Urdu
    processed = cv2.adaptiveThreshold(denoised, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2)
    
    # Return processed image, it acts as enhanced version for OCR
    return processed

def extract_text_digital_pdf(file_bytes):
    doc = fitz.open(stream=file_bytes, filetype="pdf")
    pages_text = []
    has_readable_text = False
    
    for page_num in range(len(doc)):
        page = doc[page_num]
        text = page.get_text("text").strip()
        if len(text) > 10: # Threshold to consider it a digital page
            has_readable_text = True
        pages_text.append({
            "page": page_num + 1,
            "text": text,
            "is_digital": len(text) > 10
        })
    doc.close()
    return pages_text, has_readable_text

def run_paddle_ocr(image_np):
    # Try Urdu & English models
    try:
        # PaddleOCR returns list of lines, each line is [box, (text, confidence)]
        res_ur = ocr_paddle_ur.ocr(image_np, cls=True)
        res_en = ocr_paddle_en.ocr(image_np, cls=True)
        
        texts = []
        confidences = []
        
        # Merge or select best result... for simplicity we grab both and combine or just run UR which typically handles latin letters well enough for mixed docs.
        # But let's run UR primarily as it's specifically requested for Urdu.
        
        if not res_ur or not res_ur[0]:
            if res_en and res_en[0]:
                for line in res_en[0]:
                    if line:
                        texts.append(line[1][0])
                        confidences.append(line[1][1])
        else:
            for line in res_ur[0]:
                if line:
                    texts.append(line[1][0])
                    confidences.append(line[1][1])
                    
        extracted_text = " ".join(texts)
        avg_conf = sum(confidences)/len(confidences) if confidences else 0
        return extracted_text, avg_conf
    except Exception as e:
        print("PaddleOCR error", e)
        return "", 0

def run_tesseract_ocr(image_np):
    try:
        # Require urd and eng installed in system
        text = pytesseract.image_to_string(image_np, lang="urd+eng")
        return text, 0.5 # Tesseract confidence out of scope for simple call, assume 0.5
    except Exception as e:
        print("Tesseract fallback error", e)
        return "", 0

@app.post("/api/ocr/process")
async def process_document(file: UploadFile = File(...)):
    if not file:
        raise HTTPException(status_code=400, detail="No file provided")
        
    contents = await file.read()
    filename = file.filename.lower()
    
    result = {
        "filename": file.filename,
        "total_pages": 0,
        "processing_status": "started",
        "pages": [],
        "combined_text": "",
        "avg_confidence": 0
    }
    
    start_time = time.time()
    
    if filename.endswith(".pdf"):
        # Path A: Digital PDF parsing
        pages_text, is_digital = extract_text_digital_pdf(contents)
        
        if is_digital:
            # Contains actual text
            result["total_pages"] = len(pages_text)
            result["pages"] = pages_text
            result["combined_text"] = "\n\n".join([p["text"] for p in pages_text])
            result["processing_status"] = "completed_digital"
            result["avg_confidence"] = 1.0
            return result
        
        # Path B: Scanned PDF / Image-based PDF
        images = convert_from_bytes(contents, dpi=300)
        result["total_pages"] = len(images)
        
        all_text = []
        conf_sum = 0
        
        for i, img in enumerate(images):
            # Preprocess
            img_np = np.array(img)
            # prep_img = preprocess_image(img_np) # Optional full preprocessing
            
            # OCR
            text, conf = run_paddle_ocr(img_np)
            if not text.strip():
                text, conf = run_tesseract_ocr(img_np)
                
            result["pages"].append({
                "page": i + 1,
                "text": text,
                "confidence": conf,
                "is_digital": False
            })
            all_text.append(text)
            conf_sum += conf
            
        result["combined_text"] = "\n\n".join(all_text)
        result["avg_confidence"] = conf_sum / len(images) if images else 0
        result["processing_status"] = "completed_ocr"
        
    else:
        # Process as single image
        np_arr = np.frombuffer(contents, np.uint8)
        img_np = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
        
        if img_np is None:
            raise HTTPException(status_code=400, detail="Invalid image format")
            
        prep_img = preprocess_image(img_np)
        
        text, conf = run_paddle_ocr(prep_img)
        if not text.strip(): # Fallback
            text, conf = run_tesseract_ocr(prep_img)
            
        result["total_pages"] = 1
        result["pages"] = [{
            "page": 1,
            "text": text,
            "confidence": conf,
            "is_digital": False
        }]
        result["combined_text"] = text
        result["avg_confidence"] = conf
        result["processing_status"] = "completed_ocr"
        
    # Check for low confidence
    if result["avg_confidence"] < 0.6 and not result["processing_status"].endswith("digital"):
        result["flag"] = "Uncertain OCR text — Manual verification required."
        
    return result

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
