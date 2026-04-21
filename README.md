# CragSafe Foundation — Route Maintenance Funding Application

A Vite/Vue 3 single-page form for submitting route maintenance hardware reimbursement applications. Deployed automatically to GitHub Pages via GitHub Actions, with optional Google Sheets submission via a Google Apps Script backend.

---

## Features

- **5-step form** with per-step validation before advancing
- **Repeatable hardware section** — add any number of items across 8 supply types
- **Conditional sub-fields** — e.g. Permadraw type reveals cable/chain/carabiner-specific fields
- **Live cost totals** — per-item line totals and grand total update as you type
- **Google Sheets submission** — one row per application, hardware serialized as JSON in a single cell
- **GitHub Actions CI/CD** — pushes to `main` auto-deploy to GitHub Pages

---

## Quick Start

```bash
git clone https://github.com/YOUR-USERNAME/cragsafe-form
cd cragsafe-form
npm install
npm run dev
```

---

## GitHub Pages Deployment

### 1. Create the repository

Push this project to a new GitHub repository named `cragsafe-form` (or update `vite.config.js` → `base` to match your repo name).

### 2. Enable GitHub Pages

In your repo: **Settings → Pages → Source → GitHub Actions**

### 3. Push to main

```bash
git add .
git commit -m "Initial commit"
git push origin main
```

The Actions workflow (`.github/workflows/deploy.yml`) will build and deploy automatically. Your form will be live at:

```
https://YOUR-USERNAME.github.io/cragsafe-form/
```

---

## Google Sheets Setup

Hardware data is serialized as a JSON string in a single `Hardware JSON` column, keeping applications to one row each. A separate `Hardware Item Count` and `Hardware Total Cost` column provide quick at-a-glance summaries without needing to parse JSON.

### 1. Create a Google Spreadsheet

Create a new Google Sheet — note the spreadsheet ID from the URL:
```
https://docs.google.com/spreadsheets/d/SPREADSHEET_ID_HERE/edit
```

### 2. Deploy the Apps Script

1. In your spreadsheet: **Extensions → Apps Script**
2. Replace the default `Code.gs` content with the contents of `google-apps-script/Code.gs`
3. Update `const SHEET_ID = 'YOUR_SPREADSHEET_ID_HERE'` with your actual ID
4. Click **Deploy → New Deployment**
   - Type: **Web App**
   - Execute as: **Me**
   - Who has access: **Anyone**
5. Click **Deploy** and copy the Web App URL

### 3. Configure the URL

**Local development** — create `.env.local`:
```
VITE_APPS_SCRIPT_URL=https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
```

**GitHub Actions** — add a repository secret:
- Go to **Settings → Secrets and variables → Actions → New repository secret**
- Name: `VITE_APPS_SCRIPT_URL`
- Value: your Apps Script Web App URL

### 4. Test

Visit your Apps Script URL directly in a browser — you should see:
```json
{ "status": "CragSafe Apps Script is running" }
```

### Hardware JSON format

Each hardware item in the JSON array looks like:

```json
[
  {
    "id": 1234567890,
    "type": "expansionBolts",
    "values": {
      "boltType": "3/8\" Mechanical Anchor",
      "boltMaterial": "316 Stainless Steel",
      "boltLength": "3\"",
      "boltBrand": "Hilti",
      "quantity": "4",
      "costEach": "8.50"
    },
    "otherValues": {}
  }
]
```

> **Note on `no-cors`:** The Google Apps Script fetch uses `mode: 'no-cors'` because Apps Script doesn't return CORS headers on POST requests from external origins. This means the browser treats the response as opaque — we can't read the response body to confirm success. The form treats any non-thrown fetch as a successful submission. To get true confirmation, you'd need a proxy or a custom backend.

---

## Project Structure

```
cragsafe-form/
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Actions CI/CD
├── google-apps-script/
│   └── Code.gs                 # Paste into Apps Script editor
├── src/
│   ├── components/
│   │   ├── AppHeader.vue       # Branding + progress stepper
│   │   ├── FormSection.vue     # Reusable section wrapper
│   │   ├── HardwareCard.vue    # Individual hardware item card
│   │   ├── StepRoute.vue       # Step 1: Route details
│   │   ├── StepWork.vue        # Step 2: Work description
│   │   ├── StepHardware.vue    # Step 3: Hardware/supplies
│   │   ├── StepContact.vue     # Step 4: Contact info
│   │   ├── StepWaiver.vue      # Step 5: Liability waiver
│   │   └── SuccessScreen.vue   # Post-submission confirmation
│   ├── composables/
│   │   ├── hardwareData.js     # All supply types, field defs, helpers
│   │   └── useSubmit.js        # Google Sheets submission logic
│   ├── App.vue                 # Root: step orchestration + nav
│   ├── main.js
│   └── style.css               # Global design system
├── .env.example
├── .gitignore
├── index.html
├── vite.config.js
└── package.json
```

---

## Customization

### Changing the repo/base path

In `vite.config.js`, update `base` to match your GitHub repository name:
```js
base: '/your-repo-name/',
```

### Adding a new supply type

1. Add an entry to `SUPPLY_TYPES` in `src/composables/hardwareData.js`
2. Add a corresponding config object to `HARDWARE_FIELDS` with your field definitions
3. Add an icon to `supplyIcons` in `StepHardware.vue`

### Changing currency

In `hardwareData.js`, update the `formatCurrency` function:
```js
return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
```
