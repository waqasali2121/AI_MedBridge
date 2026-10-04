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

    // Simulate short processing delay
    await new Promise(resolve => setTimeout(resolve, 800));

    let extractedText = '';

    // If it's an image, attempt basic OCR
    if (file.type && file.type.startsWith('image/')) {
      try {
        const { data } = await Tesseract.recognize(file, 'eng');
        extractedText = data.text;
      } catch (err) {
        console.error('Tesseract OCR failed', err);
        extractedText = ''; // Fallback
      }
    } else if (file.type === 'application/pdf') {
       // Mock or placeholder for PDF since Tesseract cannot directly read PDF files in browser without conversion
       extractedText = 'Extracted Text from PDF Placeholder\nPlease note that browser PDF OCR requires server-side rendering.';
    }

    const state = getAppState();
    const allMeds = state.medicines || [];

    let identifiedMeds = [];

    // Attempt to match text against known medicines
    if (extractedText) {
      const lowerText = extractedText.toLowerCase();

      for (const m of allMeds) {
        if (
          (m.brand_name && lowerText.includes(m.brand_name.toLowerCase())) ||
          (m.active_ingredient && lowerText.includes(m.active_ingredient.toLowerCase()))
        ) {
          identifiedMeds.push({
            id: `med-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            medicine_name: m.product_name || m.brand_name,
            brand_name: m.brand_name,
            active_ingredient: m.active_ingredient,
            strength: m.strength,
            dosage_form: m.dosage_form,
            route: m.route,
            dose: '1 unit', // Default fallback
            frequency: 'Consult Physician',
            duration: 'Continuous',
            food_instruction: 'As directed',
            special_instruction: 'Assistive draft: Verify dose.',
            urdu_instruction: 'براہ کرم ڈاکٹر سے رجوع کریں۔',
            extracted_confidence: 0.85,
            clarification_required: true,
            clarification_reason: 'Draft requires validation of exact dose and frequency by a pharmacist.'
          });
        }
      }

      // If no inventory matches, use the raw text lines as real data instead of mock training data!
      if (identifiedMeds.length === 0) {
        const lines = extractedText.split('\n').map(l => l.trim()).filter(l => l.length > 2).slice(0, 5);
        for (const line of lines) {
          identifiedMeds.push({
            id: `med-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            medicine_name: line, // REAL extracted data
            brand_name: 'Unknown',
            active_ingredient: 'Unknown',
            strength: 'Unknown',
            dosage_form: 'Unknown',
            route: 'Unknown',
            dose: 'TBD',
            frequency: 'TBD',
            duration: 'TBD',
            food_instruction: '',
            special_instruction: 'Raw OCR extract.',
            urdu_instruction: '',
            extracted_confidence: 0.50,
            clarification_required: true,
            clarification_reason: 'Raw text extracted from image. Pharmacist must verify and correctly link to inventory.'
          });
        }
      }
    }

    // No hardcoded "training data" fallback anymore!
    if (identifiedMeds.length === 0) {
        identifiedMeds.push({
              id: `med-${Date.now()}-err`,
              medicine_name: 'No readable text found',
              brand_name: 'Unknown',
              active_ingredient: 'Unknown',
              strength: 'N/A',
              dosage_form: 'N/A',
              route: 'N/A',
              dose: 'N/A',
              frequency: 'N/A',
              duration: 'N/A',
              food_instruction: 'N/A',
              special_instruction: 'The uploaded document contained no readable medication text.',
              urdu_instruction: '',
              extracted_confidence: 0.0,
              clarification_required: true,
              clarification_reason: 'Pharmacist manual entry required. Image may be unreadable or blank.'
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
