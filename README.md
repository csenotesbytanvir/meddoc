# 🏥 MedDoc Prescriber

An **educational web application** built for **Hacktasyne 2025 – Tech Fusion Fest** by **Code_For_Humanity**.  
Theme: **Smart Solutions, Simple Codes**

---

## 📋 Project Plan

**Team Name:** Code_For_Humanity  
**Hackathon:** Hacktasyne 2025 - Tech Fusion Fest  
**Theme:** Smart Solutions, Simple Codes  

---

### ✅ Remote Phase Tasks (Before 17 Nov 2025, 8:00 PM)

**Status:** **100% Complete.** Successfully delivered a fully-functional UI/UX prototype, simulating the end-to-end user flow using static mock data.

#### Project Setup & Structure
- [✅] Initialize React + Vite/TypeScript project structure.
- [✅] Configure build tools and Git repository. (`.gitignore`, Vercel setup)
- [✅] Define core TypeScript interfaces and types for data handling.
- [✅] Setup `GEMINI_API_KEY=PLACEHOLDER_API_KEY` for future API integration. (Confirms readiness in `.env.local`)

#### UI/UX & Flow Development
- [✅] Implement core application flow: Welcome → Intake → Loading → Results. (`App.tsx`)
- [✅] Build all primary screen components (Intake Form, Results Screen).
- [✅] Implement responsive design and Dark Mode styling.

#### Data & Logic Simulation
- [✅] Create constant data structures for symptoms and body parts.
- [✅] Implement **Mock Analysis Service** using `MOCK_ANALYSIS_RESULTS` in `constants.ts`.
- [✅] Simulate the analysis process with a time delay (`setTimeout` in `App.tsx`) to display the loading state and then the static mock result.

#### Documentation & Submission
- [✅] Write core project documentation. (`metadata.json`, `README.md`, `PROJECT_PLAN.md`)
- [✅] Complete Vercel deployment and share repository access.

---

### 🚀 Onsite Phase Tasks (18 Nov 2025, 8:00 AM - 6:30 PM)

**Focus:** Transitioning from the **Simulated Prototype** to the **Dynamic AI-Driven Smart Solution** by integrating the Gemini API.

#### 🌟 Core AI Integration
- [⏳] **API Integration Setup:** Install the Gemini SDK (`@google/genai`).
- [⏳] **API Key Security:** Update `GEMINI_API_KEY` in the environment to replace the `PLACEHOLDER_API_KEY`.
- [⏳] **Build API Wrapper:** Create a service file (e.g., `api.ts`) to manage the asynchronous API call logic.
- [⏳] **Replace Mock Logic:** Update the `handleAnalyze` function in `App.tsx` to call the live API wrapper instead of using `MOCK_ANALYSIS_RESULTS`.
- [⏳] **Structured Output:** Implement **JSON Schema** in the API call to force the Gemini model to return data that matches the `AnalysisResult` TypeScript interface.
- [⏳] **Prompt Engineering:** Design a robust system prompt to guide the AI in generating context-aware educational conditions, example prescriptions, and lifestyle advice.

#### Feature & Logic Enhancements
- [⏳] Implement local storage to save and retrieve a history of past patient analyses.
- [⏳] Add print functionality for the final prescription/report page.
- [⏳] Implement logic to handle and process multiple selected symptoms simultaneously.
- [⏳] Incorporate AI-driven detection for critical/emergency symptoms, triggering an immediate disclaimer.

#### UI/UX Refinements & Polish
- [⏳] Refine loading state with dynamic, context-aware messages/animations.
- [⏳] Implement robust error handling for API failures and display user-friendly messages.
- [⏳] Create a dedicated "History View" screen.
- [⏳] Code cleanup and refactoring.

#### Final Delivery
- [⏳] Final round of testing and bug fixes with live API data.
- [⏳] Final deployment and preparation for the live demo/presentation.

---

### 📊 Progress Tracking

| Phase        | Status     | Completion |
|--------------|------------|------------|
| Remote Phase | ✅ Complete | 100%       |
| Onsite Phase | ⏳ Pending  | 0%         |

---

## 🏥 Project Report

### 📌 Executive Summary
MedDoc Prescriber is an educational web application designed to help users understand symptoms and explore example prescriptions. The remote phase delivered a complete mock-data prototype. The onsite phase will integrate Gemini API for dynamic analysis.

---

### 💡 Solution Overview

#### Remote Phase (Completed)
- UI/UX prototype with mock data only.  
- Responsive dark theme and animations.  
- Clear disclaimers for educational use.  
- Deployment via Vercel.  

#### Onsite Phase (Planned)
- Gemini API integration.  
- Local storage for patient history.  
- Multi-symptom selection and severity rating.  
- Print/export functionality.  
- Emergency symptom detection.  

---

### 🛠️ Technology Stack
- React 19.2.0 + TypeScript  
- Vite 6.2.0  
- Tailwind CSS + custom animations  
- Mock data service (offline constants)  
- Deployment: Vercel + GitHub  
- Future: Gemini API (`@google/genai`)  

---

### 🔒 Safety & Ethics
- ⚠️ Educational demonstration only.  
- ⚠️ Not for actual medical diagnosis.  
- ⚠️ No real patient data stored or processed.  
- ⚠️ Remote phase uses mock data only.  

---

### 🧪 Testing
- Form validation tested.  
- Mock analysis flow verified.  
- Responsive design checked.  
- Deployment tested on Vercel.  

---

### 📈 Timeline
| Date | Milestone |
|------|-----------|
| 12 Nov 2025 | Project ideation and planning |
| 13 Nov 2025 | UI/UX design and component development |
| 14 Nov 2025 | Mock data setup and integration |
| 15 Nov 2025 | Testing and bug fixes |
| 16 Nov 2025 | Documentation and presentation |
| 17 Nov 2025 | Final deployment and submission |
| 18 Nov 2025 | Onsite Hackathon |

---

## ⚙️ Run Locally

**Prerequisites:** Node.js

1. Install dependencies:
   ```bash
   npm install
Set the GEMINI_API_KEY in .env.local (currently placeholder for future onsite integration).

2.Run the app:

   npm run dev

---

## 👥 Team
**Prepared by:** Code_For_Humanity Team 
**Team Leader:** MD Tanvir Ahmmed 
**Date:** 18 November 2025  
**Event:** Hacktasyne 2025 - Tech Fusion Fest  
**Organized by:** BASIS Students' Forum of BUBT Chapter Club

---
*"Simplicity is the ultimate sophistication." – Leonardo da Vinci*
