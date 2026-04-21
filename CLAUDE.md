# CragSafe Form — Development Guidelines

## Architecture

- **Frontend**: Vue 3 + Vite (SPA)
- **Backend**: Google Apps Script (Web App)
- **Data**: Google Sheets + Google Drive

### File Submission Flow

1. User uploads receipt photos/PDFs in `StepSummary.vue`
2. Frontend sends files + form data to `submitToGoogleSheets()` in `useSubmit.js`
3. Apps Script backend receives multipart/form-data in `doPost(e)`
4. Backend creates dated folder in Google Drive and saves files
5. Backend writes spreadsheet row + adds folder link to Contact Info column

---

## Critical Rule: Frontend ↔ Backend Sync

**⚠️ IMPORTANT**: Whenever you modify `src/composables/useSubmit.js`, you MUST review and update `google-apps-script/Code.gs` accordingly.

### Fields in Sync

These fields are sent from frontend to backend and must match in both files:

#### In `useSubmit.js` → `flattenFormData()`:
- `submittedAt` — ISO timestamp
- `applicationId` — Format: `YYMMDD-XXX` (e.g., `260421-837`)
- `mountainProjectUrl`, `workDescription`, `workReason`
- `hardwareJson`, `hardwareCount`, `hardwareTotalCost`
- `firstName`, `lastName`, `email`, `phone`
- `waiverSigned`, `waiverSignatureName`, `waiverDate`
- **NEW**: Receipt files sent as `receipt_0`, `receipt_1`, etc. (multipart)

#### In `Code.gs` → `HEADERS` array:
Must include all fields from the form data payload. Add files-related column(s) if processing receipts.

### Update Checklist

When modifying form submission:
- [ ] Update `flattenFormData()` in `useSubmit.js` with new/removed fields
- [ ] Update `HEADERS` array in `Code.gs` to match
- [ ] Update `doPost()` in `Code.gs` to read the new fields
- [ ] If adding file handling: implement multipart parsing in `Code.gs`
- [ ] Test end-to-end: submit form → check spreadsheet for all fields

---

## File Organization

```
cragsafe-form/
├── src/
│   ├── components/
│   │   ├── StepRoute.vue        (Step 0: Route + Work)
│   │   ├── StepHardware.vue     (Step 1: Hardware selection)
│   │   ├── StepSummary.vue      (Step 2: Review + Upload receipts)
│   │   ├── StepContact.vue      (Step 3: Name, email, phone)
│   │   ├── StepWaiver.vue       (Step 4: Legal waiver)
│   │   ├── AppHeader.vue        (Progress indicator)
│   │   └── SuccessScreen.vue    (Post-submission)
│   ├── composables/
│   │   ├── useSubmit.js         (Frontend → Backend submission)
│   │   └── hardwareData.js      (Hardware types & helpers)
│   ├── App.vue                  (Main form orchestration)
│   └── main.js
├── google-apps-script/
│   └── Code.gs                  (Backend: spreadsheet + file handling)
└── index.html
```

---

## Testing Receipts Locally

To test file uploads without a real Apps Script URL:
1. Leave `VITE_APPS_SCRIPT_URL` unset in `.env.local`
2. The form will show a "Developer Note" but still let you proceed
3. Upload works, but data doesn't reach Google Sheets
4. When ready to deploy, set `VITE_APPS_SCRIPT_URL` to your Web App URL

---

## Deployment

### Frontend
```bash
npm run build
# Deploy dist/ to your hosting (Netlify, Vercel, etc.)
```

### Backend
1. Copy `google-apps-script/Code.gs` content
2. Open Google Sheets → Extensions → Apps Script
3. Paste into editor, update `SHEET_ID`
4. Deploy → New Deployment → Web App (Anyone can access)
5. Copy deployment URL → `.env.local` and GitHub Secrets
