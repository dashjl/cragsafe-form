/**
 * CragSafe Foundation — Google Apps Script Backend
 *
 * SETUP INSTRUCTIONS:
 * 1. Open Google Sheets → Extensions → Apps Script
 * 2. Paste this entire file into the editor
 * 3. Update SHEET_ID and RECEIPTS_FOLDER_ID in Config.gs
 * 4. Click Deploy → New Deployment → Web App
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 5. Copy the Web App URL into your .env.local as VITE_APPS_SCRIPT_URL
 *    and into GitHub Secrets as VITE_APPS_SCRIPT_URL
 */

const HEADERS = [
  'Submitted At',
  'Application ID',
  // Route
  'Mountain Project URL',
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
  // Waiver
  'Waiver Signed',
  'Signature Name',
  'Waiver Date',
  // Receipts
  'Receipts Folder Link',
]

function doPost(e) {
  try {
    Logger.log('=== doPost triggered ===')
    Logger.log('postData type: ' + (e.postData ? e.postData.type : 'none'))
    Logger.log('postData length: ' + (e.postData ? e.postData.contents.length : 0))
    Logger.log('e.parameters keys: ' + JSON.stringify(Object.keys(e.parameters || {})))

    // Parse form data (can be JSON or multipart)
    const data = {}
    let receiptsFolderLink = ''

    // Handle multipart/form-data (when files are uploaded)
    const contentType = e.postData ? e.postData.type : ''
    if (contentType.indexOf('multipart/form-data') !== -1) {
      Logger.log('Parsing as multipart/form-data')
      parseMultipartData(e, data)
      Logger.log('Parsed data keys: ' + JSON.stringify(Object.keys(data)))
    } else if (e.postData && e.postData.contents) {
      Logger.log('Parsing as JSON')
      Object.assign(data, JSON.parse(e.postData.contents))
    } else {
      Logger.log('Parsing from e.parameters')
      Object.assign(data, e.parameter)
    }

    Logger.log('applicationId: ' + data.applicationId)
    Logger.log('email: ' + data.email)

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

    // Collect file blobs parsed from multipart data
    const fileBlobs = {}
    for (const key of Object.keys(data)) {
      if (key.startsWith('receipt_') && data[key] instanceof Object) {
        fileBlobs[key] = data[key]
      }
    }
    Logger.log('Receipt file keys found: ' + JSON.stringify(Object.keys(fileBlobs)))
    Logger.log('RECEIPTS_FOLDER_ID configured: ' + (RECEIPTS_FOLDER_ID !== 'YOUR_RECEIPTS_FOLDER_ID_HERE'))

    // Create receipts subfolder if files exist and RECEIPTS_FOLDER_ID is set
    if (Object.keys(fileBlobs).length > 0 && RECEIPTS_FOLDER_ID !== 'YOUR_RECEIPTS_FOLDER_ID_HERE') {
      const parentFolder = DriveApp.getFolderById(RECEIPTS_FOLDER_ID)
      const appFolder = parentFolder.createFolder(data.applicationId)
      Logger.log('Created Drive folder: ' + appFolder.getUrl())

      for (const [key, blob] of Object.entries(fileBlobs)) {
        const savedFile = appFolder.createFile(blob)
        Logger.log('Saved file: ' + savedFile.getName())
      }

      receiptsFolderLink = appFolder.getUrl()
      Logger.log('receiptsFolderLink: ' + receiptsFolderLink)
    }

    const row = [
      data.submittedAt,
      data.applicationId,
      data.mountainProjectUrl,
      data.workDescription,
      data.workReason,
      data.hardwareCount,
      data.hardwareTotalCost,
      data.hardwareJson,
      data.firstName,
      data.lastName,
      data.email,
      data.phone,
      data.waiverSigned,
      data.waiverSignatureName,
      data.waiverDate,
      receiptsFolderLink,
    ]

    sheet.appendRow(row)

    // Auto-resize columns for readability (skip the JSON column — it's long)
    sheet.autoResizeColumns(1, HEADERS.length - 1)

    return ContentService
      .createTextOutput(JSON.stringify({ success: true, id: data.applicationId, folderUrl: receiptsFolderLink }))
      .setMimeType(ContentService.MimeType.JSON)

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: err.message }))
      .setMimeType(ContentService.MimeType.JSON)
  }
}

// Helper function to parse multipart form data
function parseMultipartData(e, data) {
  const boundary = getBoundary(e.postData.type)
  const contents = e.postData.contents
  const parts = contents.split('--' + boundary)

  for (let i = 1; i < parts.length - 1; i++) {
    const part = parts[i]
    const lines = part.split('\r\n')

    // Find the blank line that separates headers from content
    let emptyLineIndex = -1
    for (let j = 0; j < lines.length; j++) {
      if (lines[j] === '') {
        emptyLineIndex = j
        break
      }
    }

    if (emptyLineIndex === -1) continue

    // Extract field name from Content-Disposition header
    const dispositionLine = lines[0] + (lines[1] ? '\r\n' + lines[1] : '')
    const nameMatch = dispositionLine.match(/name="([^"]+)"/)
    const filenameMatch = dispositionLine.match(/filename="([^"]+)"/)

    if (!nameMatch) continue

    const fieldName = nameMatch[1]
    const content = lines.slice(emptyLineIndex + 1).join('\r\n').replace(/\r\n$/, '')

    if (filenameMatch) {
      // It's a file
      const filename = filenameMatch[1]
      const blob = Utilities.newBlob(content, 'application/octet-stream', filename)
      data[fieldName] = blob
    } else {
      // It's a regular field
      data[fieldName] = content
    }
  }
}

// Helper to extract boundary from Content-Type header
function getBoundary(contentType) {
  const matches = contentType.match(/boundary=([^;]+)/)
  return matches ? matches[1].replace(/"/g, '') : ''
}

// GET handler for testing the deployment is live
function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'CragSafe Apps Script is running' }))
    .setMimeType(ContentService.MimeType.JSON)
}
