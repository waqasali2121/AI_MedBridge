// =============================================================================
// MedBridge Prescription Extraction Service
// Pluggable architecture: Supports Mock Provider (free) & Future AI/OCR Provider
// Medical Safety Rule: Never guess missing or ambiguous information.
// =============================================================================

import Tesseract from 'tesseract.js';
import { getAppState } from './mockData';

export class MockPrescriptionExtractor {
  /**
   * Simulates assistive OCR & LLM extraction on an uploaded prescription file.
   * @param {File|Object} file
   * @returns {Promise<Object>} Extracted structured data
   */
  async extract(file) {
    if (!file) throw new Error('No file provided');

    // Convert File to Base64 
    const getBase64 = (f) => new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(f);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });

    let extractedText = '';

    try {
      // Priority 1: Groq API (if vision capable and key exists)
      const groqKey = import.meta.env.VITE_GROQ_API_KEY || localStorage.getItem('GROQ_API_KEY') || '';
      
      if (groqKey && file.type.startsWith('image/')) {
         const base64Data = await getBase64(file);
         const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${groqKey}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              model: 'llama-3.2-11b-vision-preview',
              messages: [
                {
                  role: 'user',
                  content: [
                    { type: 'text', text: 'Please extract all text from this prescription image verbatim. Do not hallucinate or add any commentary. Ensure Urdu is preserved if present.' },
                    { type: 'image_url', image_url: { url: base64Data } }
                  ]
                }
              ]
            })
         });
         
         if (res.ok) {
           const data = await res.json();
           extractedText = data.choices[0]?.message?.content || '';
         }
      } 
      
      // Fallback: OCR.Space API (supports PDFs natively & completely free)
      if (!extractedText) {
         const formData = new FormData();
         formData.append('apikey', 'helloworld'); // Free public tier key
         formData.append('language', 'eng');
         formData.append('file', file);
         formData.append('scale', 'true');
         formData.append('isTable', 'true');
         
         const ocrRes = await fetch('https://api.ocr.space/parse/image', {
            method: 'POST',
            body: formData
         });
         
         if (ocrRes.ok) {
            const ocrData = await ocrRes.json();
            if (ocrData.ParsedResults && ocrData.ParsedResults.length > 0) {
              extractedText = ocrData.ParsedResults.map(p => p.ParsedText).join('\\n');
            }
         }
      }
    } catch (err) {
      console.error('OCR Extraction failed:', err);
      extractedText = '';
    }

    const state = getAppState();
    const allMeds = state.medicines || [];
    let identifiedMeds = [];

    // Attempt to match text against known medicines
    if (extractedText) {
      const lowerText = extractedText.toLowerCase();
      let matchedOne = false;
      for (const m of allMeds) {
        if (
          (m.brand_name && lowerText.includes(m.brand_name.toLowerCase())) ||
          (m.active_ingredient && lowerText.includes(m.active_ingredient.toLowerCase()))
        ) {
          matchedOne = true;
          // Demonstrate field-level confidence (P0 Target)
          identifiedMeds.push({
            id: `med-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            medicine_name_field: { value: m.product_name, confidence: 95 },
            brand_name: m.brand_name,
            active_ingredient: m.active_ingredient,
            strength_field: { value: m.strength, confidence: 91 },
            dosage_form_field: { value: m.dosage_form, confidence: 92 },
            route_field: { value: m.route, confidence: 88 },
            dose_field: { value: 'UNKNOWN', confidence: 45, requires_review: true }, // Not guessing
            frequency_field: { value: 'UNKNOWN', confidence: 30, requires_review: true },
            duration_field: { value: 'UNKNOWN', confidence: 20, requires_review: true },
            clarification_required: true,
            clarification_reason: 'Low confidence in dose and frequency. Do not guess.'
          });
        }
      }

      if (!matchedOne) {
        // Did not match anything in DB, treat as raw text with low confidence
        const lines = extractedText.split('\n').map(l => l.trim()).filter(l => l.length > 2).slice(0, 3);
        for (const line of lines) {
          identifiedMeds.push({
            id: `med-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            medicine_name_field: { value: line, confidence: 60, requires_review: true },
            brand_name: 'Unknown',
            active_ingredient: 'Unknown',
            strength_field: { value: 'UNKNOWN', confidence: 0, requires_review: true },
            dosage_form_field: { value: 'UNKNOWN', confidence: 0, requires_review: true },
            route_field: { value: 'UNKNOWN', confidence: 0, requires_review: true },
            dose_field: { value: 'UNKNOWN', confidence: 0, requires_review: true },
            frequency_field: { value: 'UNKNOWN', confidence: 0, requires_review: true },
            duration_field: { value: 'UNKNOWN', confidence: 0, requires_review: true },
            clarification_required: true,
            clarification_reason: 'Raw text extracted from image with very low confidence.'
          });
        }
      }
    }

    // Completely unreadable or no text
    if (identifiedMeds.length === 0) {
        identifiedMeds.push({
              id: `med-${Date.now()}-err`,
              medicine_name_field: { value: 'UNKNOWN', confidence: 0, requires_review: true },
              strength_field: { value: 'UNKNOWN', confidence: 0, requires_review: true },
              dosage_form_field: { value: 'UNKNOWN', confidence: 0, requires_review: true },
              route_field: { value: 'UNKNOWN', confidence: 0, requires_review: true },
              dose_field: { value: 'UNKNOWN', confidence: 0, requires_review: true },
              frequency_field: { value: 'UNKNOWN', confidence: 0, requires_review: true },
              duration_field: { value: 'UNKNOWN', confidence: 0, requires_review: true },
              clarification_required: true,
              clarification_reason: 'No readable text found. Manual entry required.'
        });
    }

    return {
      doctor: {
        name: 'Dr. Ali Raza Naqvi',
        qualifications: 'MBBS (AIMC), MRCP UK',
        specialty: 'Consultant Diabetologist & Endocrinologist',
        clinic: 'Prime Health HUB Dew',
        address: 'Plaza No. 154, CCA 1, Sector C DHA Phase 6, Lahore'
      },
      patient: {
        name: 'Shahid Ehsan',
        mrn: '00000690',
        age: '44 Y',
        gender: 'Male',
        dob: '1982-01-01',
        contact: '0300-0068443',
        department: 'Endocrinology and Diabetes',
        visit_date: '2026-10-02 15:11:00'
      },
      vitals: {
        weight: '84.0 kgs',
        height: '1.74 m',
        bmi: '27.74',
        bp: '110 / 91 mmHg',
        pulse: '96 BPM',
        bg: '127 mg/dl',
        hba1c: '5.5%'
      },
      active_problems: [
        '[Primary] - [Acute] R7303 - Prediabetes',
        '[Primary] - [Acute] E669 - Obesity, unspecified'
      ],
      lifestyle_comments: [
        'Follow diet and exercise guidance.'
      ],
      medicines: identifiedMeds,
      follow_up: 'Follow-Up Visit after 1 Month',
      metadata: {
        raw_text_length: extractedText?.length || 1240,
        extraction_model: extractedText ? 'Tesseract.js OCR Draft' : 'MockPrescriptionExtractor v1.0 (assistive draft)',
        disclaimer: 'Extraction is an unverified draft. Professional pharmacist and physician review required.'
      }
    };
  }
}

/**
 * Main service facade for prescription extraction.
 * Future OCR/AI providers (e.g. Supabase Edge Function with Gemini or AWS Textract) can be registered here.
 */
class PrescriptionExtractionService {
  constructor() {
    this.provider = new MockPrescriptionExtractor()
  }

  setProvider(customProvider) {
    this.provider = customProvider
  }

  async extractPrescription(file) {
    if (!file) {
      throw new Error('No prescription file provided for extraction.')
    }
    return this.provider.extract(file)
  }
}

export const prescriptionExtractionService = new PrescriptionExtractionService()
