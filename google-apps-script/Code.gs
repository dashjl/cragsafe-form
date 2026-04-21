/**
 * CragSafe Foundation — Google Apps Script Backend
 * 
 * SETUP INSTRUCTIONS:
 * 1. Open Google Sheets → Extensions → Apps Script
 * 2. Paste this entire file into the editor
 * 3. Update SHEET_ID below with your spreadsheet ID
 * 4. Click Deploy → New Deployment → Web App
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 5. Copy the Web App URL into your .env.local as VITE_APPS_SCRIPT_URL
 *    and into GitHub Secrets as VITE_APPS_SCRIPT_URL
 */

const SHEET_ID = 'YOUR_SPREADSHEET_ID_HERE' // ← Replace this

const HEADERS = [
  'Submitted At',
  'Application ID',
  // Route
  'Mountain Project URL',
  'Route Name',
  'First Ascent',
  'Grade',
  'Height',
  'Route Description',
  'Protection Details',
  // Work
  'Work Performed',
  'Work Reason',
  // Hardware summary
  'Hardware Item Count',
  'Hardware Total Cost (CAD)',
  'Hardware JSON',
  // Contact
  'First Name',
  'Last Name',
  'Email',
  'Phone',
  'Address',
  'City',
  'Province',
  'Postal Code',
  // Waiver
  'Waiver Signed',
  'Signature Name',
  'Waiver Date',
]

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents)
    const ss = SpreadsheetApp.openById(SHEET_ID)
    let sheet = ss.getSheetByName('Applications')

    // Create sheet with headers if it doesn't exist
    if (!sheet) {
      sheet = ss.insertSheet('Applications')
      sheet.appendRow(HEADERS)
      // Style the header row
      const headerRange = sheet.getRange(1, 1, 1, HEADERS.length)
      headerRange.setBackground('#2c2c28')
      headerRange.setFontColor('#f0ede6')
      headerRange.setFontWeight('bold')
      sheet.setFrozenRows(1)
    }

    const row = [
      data.submittedAt,
      data.applicationId,
      data.mountainProjectUrl,
      data.routeName,
      data.firstAscent,
      data.grade,
      data.height,
      data.description,
      data.protection,
      data.workDescription,
      data.workReason,
      data.hardwareCount,
      data.hardwareTotalCost,
      data.hardwareJson,
      data.firstName,
      data.lastName,
      data.email,
      data.phone,
      data.address,
      data.city,
      data.province,
      data.postalCode,
      data.waiverSigned,
      data.waiverSignatureName,
      data.waiverDate,
    ]

    sheet.appendRow(row)

    // Auto-resize columns for readability (skip the JSON column — it's long)
    sheet.autoResizeColumns(1, HEADERS.length - 1)

    return ContentService
      .createTextOutput(JSON.stringify({ success: true, id: data.applicationId }))
      .setMimeType(ContentService.MimeType.JSON)

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: err.message }))
      .setMimeType(ContentService.MimeType.JSON)
  }
}

// GET handler for testing the deployment is live
function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'CragSafe Apps Script is running' }))
    .setMimeType(ContentService.MimeType.JSON)
}
