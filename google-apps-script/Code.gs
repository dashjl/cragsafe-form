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
  'Application ID',
  'Receipts Folder Link',
  'Mountain Project URL',
  'Hardware Total Cost (CAD)',
  'Hardware Item Count',
  // Work
  'Work Performed',
  'Work Reason',
  // Contact
  'First Name',
  'Last Name',
  'Email',
  'Phone',
  // Waiver
  'Waiver Signed',
  'Signature Name',
  'Waiver Date',
  // Detail
  'Hardware JSON',
  'Submitted At',
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

    // Collect base64-encoded files sent as plain form fields
    const fileBlobs = {}
    let i = 0
    while (data[`receipt_${i}`]) {
      const base64 = data[`receipt_${i}`]
      const filename = data[`receipt_${i}_name`] || `receipt_${i}`
      const mimeType = data[`receipt_${i}_type`] || 'application/octet-stream'
      const bytes = Utilities.base64Decode(base64)
      fileBlobs[`receipt_${i}`] = Utilities.newBlob(bytes, mimeType, filename)
      i++
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
      data.applicationId,
      receiptsFolderLink,
      data.mountainProjectUrl,
      data.hardwareTotalCost,
      data.hardwareCount,
      data.workDescription,
      data.workReason,
      data.firstName,
      data.lastName,
      data.email,
      data.phone,
      data.waiverSigned,
      data.waiverSignatureName,
      data.waiverDate,
      data.hardwareJson,
      data.submittedAt,
    ]

    sheet.appendRow(row)
    Logger.log('Row appended to sheet successfully')

    if (NOTIFICATION_EMAIL !== 'YOUR_NOTIFICATION_EMAIL_HERE') {
      sendNotificationEmail(data, receiptsFolderLink)
    }

    // Auto-resize columns for readability (skip the JSON column — it's long)
    sheet.autoResizeColumns(1, HEADERS.length - 1)

    return ContentService
      .createTextOutput(JSON.stringify({ success: true, id: data.applicationId, folderUrl: receiptsFolderLink }))
      .setMimeType(ContentService.MimeType.JSON)

  } catch (err) {
    Logger.log('ERROR in doPost: ' + err.message)
    Logger.log('Stack: ' + err.stack)
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

// --- Test functions --- run these manually from the Apps Script editor to verify config ---

function testGoogleDrive() {
  const folder = DriveApp.getFolderById(RECEIPTS_FOLDER_ID)
  const subfolders = folder.getFolders()
  let count = 0
  while (subfolders.hasNext()) { subfolders.next(); count++ }
  Logger.log('Receipts folder: ' + folder.getName())
  Logger.log('Subfolders (applications): ' + count)
}

function testGmail() {
  MailApp.sendEmail({
    to: NOTIFICATION_EMAIL,
    subject: 'CragSafe — Gmail test',
    htmlBody: '<p>Gmail is working. You can receive CragSafe notifications at this address.</p>',
  })
  Logger.log('Test email sent to ' + NOTIFICATION_EMAIL)
}

function testGoogleSheets() {
  const ss = SpreadsheetApp.openById(SHEET_ID)
  const sheet = ss.getSheetByName('Applications')
  if (!sheet) {
    Logger.log('No Applications sheet found')
    return
  }
  const lastRow = sheet.getLastRow()
  if (lastRow < 2) {
    Logger.log('No submissions yet')
    return
  }
  const latestId = sheet.getRange(lastRow, 1).getValue()
  Logger.log('Sheet: ' + ss.getName())
  Logger.log('Total submissions: ' + (lastRow - 1))
  Logger.log('Latest application ID: ' + latestId)
}

// --- End test functions ---

// GET handler for testing the deployment is live
function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'CragSafe Apps Script is running' }))
    .setMimeType(ContentService.MimeType.JSON)
}

function sendNotificationEmail(data, receiptsFolderLink) {
  const hardware = parseHardwareJson(data.hardwareJson)
  const totalCost = parseFloat(data.hardwareTotalCost) || 0

  const subject = `New CragSafe Application — ${data.applicationId}`

  const hardwareRows = hardware.map(item => {
    const label = TYPE_LABELS[item.type] || item.type
    const qty = item.values.quantity || '—'
    const cost = parseFloat(item.values.costEach) || 0
    const lineTotal = ((parseFloat(qty) || 0) * cost).toFixed(2)
    const details = buildHardwareDetails(item)
    return `
      <tr>
        <td style="padding:10px 12px;border-bottom:1px solid #e8e4dc;font-weight:600;vertical-align:top">${label}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #e8e4dc;vertical-align:top;color:#555">${details}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #e8e4dc;text-align:center;vertical-align:top">${qty}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #e8e4dc;text-align:right;vertical-align:top">$${cost.toFixed(2)}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #e8e4dc;text-align:right;vertical-align:top;font-weight:600">$${lineTotal}</td>
      </tr>`
  }).join('')

  const receiptsHtml = receiptsFolderLink
    ? `<a href="${receiptsFolderLink}" style="color:#c4521a">View receipts in Google Drive →</a>`
    : '<span style="color:#999">No receipts uploaded</span>'

  const submittedDate = data.submittedAt
    ? new Date(data.submittedAt).toLocaleString('en-CA', { timeZone: 'America/Vancouver', dateStyle: 'full', timeStyle: 'short' })
    : '—'

  const body = `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#f5f2eb;font-family:Georgia,serif">
  <div style="max-width:640px;margin:32px auto;background:#ffffff;border-radius:4px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,0.1)">

    <!-- Header -->
    <div style="background:#2c2c28;padding:28px 32px">
      <div style="color:#f0ede6;font-size:11px;letter-spacing:2px;text-transform:uppercase;margin-bottom:6px">CragSafe Foundation</div>
      <div style="color:#ffffff;font-size:22px;font-weight:normal">New Application Received</div>
      <div style="color:#a09880;font-size:13px;margin-top:6px">${data.applicationId} &nbsp;·&nbsp; ${submittedDate}</div>
    </div>

    <div style="padding:28px 32px">

      <!-- Contact -->
      <table style="width:100%;margin-bottom:28px">
        <tr>
          <td style="width:50%;vertical-align:top">
            <div style="font-size:10px;letter-spacing:1.5px;text-transform:uppercase;color:#999;margin-bottom:6px">Applicant</div>
            <div style="font-size:16px;font-weight:600;color:#2c2c28">${data.firstName} ${data.lastName}</div>
            <div style="color:#555;margin-top:4px">${data.email}</div>
            <div style="color:#555">${data.phone || '—'}</div>
          </td>
          <td style="width:50%;vertical-align:top;text-align:right">
            <div style="font-size:10px;letter-spacing:1.5px;text-transform:uppercase;color:#999;margin-bottom:6px">Total Cost</div>
            <div style="font-size:28px;font-weight:600;color:#c4521a">$${totalCost.toFixed(2)} <span style="font-size:14px;color:#999">CAD</span></div>
            <div style="color:#999;font-size:13px">${data.hardwareCount} item type${data.hardwareCount != 1 ? 's' : ''}</div>
          </td>
        </tr>
      </table>

      <!-- Route & Work -->
      <div style="margin-bottom:28px">
        <div style="font-size:10px;letter-spacing:1.5px;text-transform:uppercase;color:#999;margin-bottom:10px">Route & Work</div>
        <div style="margin-bottom:8px">
          <span style="color:#888;font-size:13px">Mountain Project: </span>
          <a href="${data.mountainProjectUrl}" style="color:#c4521a">${data.mountainProjectUrl}</a>
        </div>
        <div style="margin-bottom:6px">
          <span style="color:#888;font-size:13px">Work performed: </span>
          <span style="color:#2c2c28">${data.workDescription || '—'}</span>
        </div>
        <div>
          <span style="color:#888;font-size:13px">Reason: </span>
          <span style="color:#2c2c28">${data.workReason || '—'}</span>
        </div>
      </div>

      <!-- Hardware -->
      <div style="margin-bottom:28px">
        <div style="font-size:10px;letter-spacing:1.5px;text-transform:uppercase;color:#999;margin-bottom:10px">Hardware</div>
        <table style="width:100%;border-collapse:collapse;font-size:14px">
          <thead>
            <tr style="background:#f5f2eb">
              <th style="padding:8px 12px;text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#888;font-weight:normal">Item</th>
              <th style="padding:8px 12px;text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#888;font-weight:normal">Specs</th>
              <th style="padding:8px 12px;text-align:center;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#888;font-weight:normal">Qty</th>
              <th style="padding:8px 12px;text-align:right;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#888;font-weight:normal">Unit</th>
              <th style="padding:8px 12px;text-align:right;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#888;font-weight:normal">Total</th>
            </tr>
          </thead>
          <tbody>${hardwareRows}</tbody>
          <tfoot>
            <tr style="background:#f5f2eb">
              <td colspan="4" style="padding:10px 12px;font-weight:600;font-size:13px;text-transform:uppercase;letter-spacing:1px">Total</td>
              <td style="padding:10px 12px;text-align:right;font-weight:700;color:#c4521a;font-size:16px">$${totalCost.toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <!-- Receipts -->
      <div style="margin-bottom:28px">
        <div style="font-size:10px;letter-spacing:1.5px;text-transform:uppercase;color:#999;margin-bottom:8px">Receipts</div>
        ${receiptsHtml}
      </div>

      <!-- Waiver -->
      <div style="margin-bottom:28px">
        <div style="font-size:10px;letter-spacing:1.5px;text-transform:uppercase;color:#999;margin-bottom:10px">Waiver</div>
        <div style="background:#f5f2eb;border-radius:4px;padding:14px 16px;font-size:13px;color:#666;margin-bottom:16px">
          Signed by <strong>${data.waiverSignatureName}</strong> on ${data.waiverDate}
        </div>
        <div style="border:1px solid #e8e4dc;border-radius:4px;padding:20px;font-size:12px;line-height:1.8;color:#777;max-height:300px;overflow:auto">
          <p style="margin:0 0 10px;border:1px solid rgba(196,82,26,0.4);border-radius:3px;padding:10px 14px;color:#c4521a;font-weight:600">BY COMPLETING THIS AGREEMENT YOU WILL WAIVE CERTAIN LEGAL RIGHTS, INCLUDING THE RIGHT TO SUE FOR NEGLIGENCE, BREACH OF CONTRACT, OR CLAIM COMPENSATION FOLLOWING AN ACCIDENT OR LOSS.</p>

          <p style="margin:0 0 6px"><strong style="color:#555">BACKGROUND AND NATURE OF RELATIONSHIP</strong></p>
          <p style="margin:0 0 10px">CragSafe is a volunteer-run, non-profit organization whose sole purpose is to raise and distribute funds to subsidize the cost of hardware used in the development and maintenance of rock climbing routes for the benefit of the general public. The Recipient acknowledges and agrees that:</p>
          <ol type="a" style="margin:0 0 10px 1.4em;padding:0">
            <li style="margin-bottom:6px">CragSafe does not select, purchase, source, store, supply, transport, or install any hardware, bolts, anchors, or other route development materials;</li>
            <li style="margin-bottom:6px">CragSafe does not direct, supervise, oversee, control, or authorize any route development work, installation activity, or maintenance work, whether funded by CragSafe or otherwise;</li>
            <li style="margin-bottom:6px">The Recipient is not, and shall not be considered, an employee, agent, volunteer, contractor, or subcontractor of CragSafe in any capacity whatsoever. The Recipient acts entirely at their own direction and discretion;</li>
            <li style="margin-bottom:6px">CragSafe's sole activity in relation to the Recipient is the provision of a financial subsidy after the Recipient has independently chosen to undertake a route development or maintenance project;</li>
            <li style="margin-bottom:6px">CragSafe does not inspect, assess, approve, certify, or warrant the quality, safety, suitability, or condition of any route, installation, hardware, or climbing area, whether or not it has provided funding in connection therewith; and</li>
            <li style="margin-bottom:6px">CragSafe may maintain a list of community-reported issues relating to climbing hardware or routes. The maintenance of such a list does not constitute direction, supervision, or instruction to perform any work, and CragSafe assumes no responsibility or liability of any kind arising from the existence, content, accuracy, completeness, or use of any such list.</li>
          </ol>

          <p style="margin:0 0 6px"><strong style="color:#555">ASSUMPTION OF RISKS</strong></p>
          <p style="margin:0 0 10px">The Recipient is aware that route development, rebolting, anchor installation, and all related activities involve serious risks, dangers, and hazards. These include, but are not limited to:</p>
          <ol type="a" start="7" style="margin:0 0 10px 1.4em;padding:0">
            <li style="margin-bottom:6px">Working at height and the risk of falls, equipment failure, and fatal injury;</li>
            <li style="margin-bottom:6px">Rockfall, loose rock, crumbling features, and unstable terrain;</li>
            <li style="margin-bottom:6px">Failure of hardware, tools, anchors, rappel systems, and personal protective equipment;</li>
            <li style="margin-bottom:6px">Inadequate or substandard hardware sourced, selected, or installed by the Recipient;</li>
            <li style="margin-bottom:6px">Errors in drilling, placement, tensioning, or inspection of bolts or anchors;</li>
            <li style="margin-bottom:6px">Adverse and rapidly changing weather conditions, including lightning, high winds, rain, and ice;</li>
            <li style="margin-bottom:6px">Remote terrain with limited access to emergency services or medical treatment;</li>
            <li style="margin-bottom:6px">Encounters with wildlife, insects, and hazardous flora and fauna;</li>
            <li style="margin-bottom:6px">Illness, dehydration, fatigue, exertion, and physical incapacity;</li>
            <li style="margin-bottom:6px">Negligence of other persons present at the climbing area; and</li>
            <li style="margin-bottom:6px"><strong style="color:#555">NEGLIGENCE ON THE PART OF THE RELEASEES.</strong> THE RECIPIENT UNDERSTANDS THAT NEGLIGENCE INCLUDES FAILURE ON THE PART OF CRAGSAFE TO TAKE REASONABLE STEPS TO SAFEGUARD OR PROTECT THE RECIPIENT OR WARN THE RECIPIENT OF RISKS, DANGERS, AND HAZARDS.</li>
          </ol>
          <p style="margin:0 0 10px;border:1px solid rgba(196,82,26,0.4);border-radius:3px;padding:10px 14px;color:#c4521a;font-weight:600">THE RECIPIENT FREELY ACCEPTS AND FULLY ASSUMES ALL RISKS, DANGERS, AND HAZARDS DESCRIBED HEREIN AND ALL POSSIBILITY OF PERSONAL INJURY, DEATH, PROPERTY DAMAGE, OR LOSS RESULTING THEREFROM.</p>

          <p style="margin:0 0 6px"><strong style="color:#555">RELEASE OF LIABILITY, WAIVER OF CLAIMS, AND INDEMNITY</strong></p>
          <p style="margin:0 0 10px">In consideration of CragSafe providing funding to the Recipient, the Recipient hereby agrees as follows:</p>
          <ol style="margin:0 0 10px 1.4em;padding:0">
            <li style="margin-bottom:6px"><strong style="color:#555">COMPLETE WAIVER OF CLAIMS:</strong> The Recipient hereby waives any and all claims that the Recipient has or may in the future have against CragSafe and its directors, officers, volunteers, members, representatives, successors, and assigns (collectively, the "Releasees"), and releases the Releasees from any and all liability for any loss, damage, expense, or injury, including death, that the Recipient or the Recipient's next of kin may suffer as a result of: (a) participation in any route development, rebolting, anchor installation, or related activity, whether or not funded by CragSafe; (b) the condition, quality, or safety of any hardware, route, anchor, or climbing area; or (c) any act or omission of the Releasees — DUE TO ANY CAUSE WHATSOEVER, INCLUDING NEGLIGENCE, BREACH OF CONTRACT, OR BREACH OF ANY STATUTORY OR OTHER DUTY OF CARE.</li>
            <li style="margin-bottom:6px"><strong style="color:#555">NATURE OF FUNDING — NO DUTY OF CARE CREATED:</strong> The Recipient acknowledges that CragSafe's provision of a financial subsidy creates no duty of care, no supervision obligation, and no responsibility of any kind with respect to how funds are used, what hardware is purchased, or how any work is performed. To the maximum extent permitted by law, CragSafe's aggregate liability in any matter arising from this Agreement shall not exceed the dollar amount of funds actually disbursed to the Recipient under this Agreement.</li>
            <li style="margin-bottom:6px"><strong style="color:#555">INDEMNIFICATION OF CRAGSAFE:</strong> The Recipient agrees to indemnify, defend, and hold harmless the Releasees from and against any and all claims, demands, actions, causes of action, damages, losses, costs, and expenses (including reasonable legal fees) arising from or in connection with: (a) the Recipient's route development or maintenance activities; (b) any defect, failure, or dangerous condition of hardware or installations resulting from the Recipient's work; (c) any injury, death, or property damage suffered by any third party arising from climbing on routes developed or maintained by the Recipient; or (d) any civil or criminal liability arising from the Recipient's activities, whether funded by CragSafe or otherwise.</li>
            <li style="margin-bottom:6px"><strong style="color:#555">THIRD PARTY CLAIMS:</strong> The Recipient acknowledges that climbing routes and hardware installed by the Recipient may be used by members of the public, and the Recipient assumes full and sole responsibility for the safety and adequacy of any such installation. The Recipient agrees to indemnify the Releasees against any claim brought by any third party arising from or related to hardware or routes associated with funding received under this Agreement.</li>
            <li style="margin-bottom:6px"><strong style="color:#555">BINDING ON HEIRS AND ESTATE:</strong> This Agreement shall be effective and binding upon the Recipient's heirs, next of kin, executors, administrators, assigns, and legal representatives in the event of the Recipient's death or incapacity.</li>
            <li style="margin-bottom:6px"><strong style="color:#555">GOVERNING LAW:</strong> This Agreement shall be governed by and interpreted solely in accordance with the laws of the Province of British Columbia, Canada, without regard to conflict of law principles.</li>
            <li style="margin-bottom:6px"><strong style="color:#555">JURISDICTION:</strong> Any litigation involving the parties to this Agreement shall be brought solely within the Province of British Columbia and shall be within the exclusive jurisdiction of the courts of that Province.</li>
            <li style="margin-bottom:6px"><strong style="color:#555">SEVERABILITY:</strong> If any provision of this Agreement is found to be unenforceable or invalid by a court of competent jurisdiction, that provision shall be modified to the minimum extent necessary to make it enforceable, and all remaining provisions shall continue in full force and effect.</li>
            <li style="margin-bottom:6px"><strong style="color:#555">ENTIRE AGREEMENT:</strong> This Agreement constitutes the entire agreement between the parties with respect to the subject matter hereof. The Recipient confirms they are not relying on any oral or written representations or statements made by the Releasees other than what is set forth in this Agreement.</li>
            <li style="margin-bottom:0"><strong style="color:#555">INDEPENDENT LEGAL ADVICE:</strong> The Recipient acknowledges that they have had the opportunity to obtain independent legal advice prior to signing this Agreement and that they understand its contents and legal consequences.</li>
          </ol>
        </div>
      </div>

    </div>
  </div>
</body>
</html>`

  MailApp.sendEmail({
    to: NOTIFICATION_EMAIL,
    subject: subject,
    htmlBody: body,
  })

  Logger.log('Notification email sent to ' + NOTIFICATION_EMAIL)
}

const TYPE_LABELS = {
  expansionBolts: 'Expansion Bolts',
  glueInBolts: 'Glue-in Bolts',
  hangers: 'Hangers',
  chain: 'Chain',
  quickLinks: 'Quick Links',
  permadraws: 'Permadraws',
  anchors: 'Anchors & Rappel Rings',
  other: 'Other',
}

function parseHardwareJson(json) {
  try {
    return JSON.parse(json) || []
  } catch (e) {
    return []
  }
}

function buildHardwareDetails(item) {
  const skip = new Set(['quantity', 'costEach'])
  const parts = []
  for (const [key, val] of Object.entries(item.values || {})) {
    if (skip.has(key) || !val) continue
    const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())
    const displayVal = val === 'Other' && item.otherValues && item.otherValues[key]
      ? item.otherValues[key]
      : val
    parts.push(`${label}: ${displayVal}`)
  }
  return parts.join('<br>') || '—'
}
