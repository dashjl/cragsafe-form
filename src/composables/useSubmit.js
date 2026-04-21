// Google Sheets submission via Apps Script Web App
// See README for setup instructions

export async function submitToGoogleSheets(formData, scriptUrl, files = []) {
  const payload = flattenFormData(formData)

  // If there are files, use multipart/form-data, otherwise use JSON
  if (files.length > 0) {
    return submitWithFiles(payload, scriptUrl, files)
  }

  const response = await fetch(scriptUrl, {
    method: 'POST',
    mode: 'no-cors', // Apps Script requires no-cors
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  // no-cors means we can't read the response body — treat as success if no throw
  return { success: true }
}

async function submitWithFiles(payload, scriptUrl, files) {
  const formData = new FormData()

  // Add all form fields
  Object.entries(payload).forEach(([key, value]) => {
    formData.append(key, typeof value === 'object' ? JSON.stringify(value) : value)
  })

  // Add files
  files.forEach((file, index) => {
    formData.append(`receipt_${index}`, file)
  })

  const response = await fetch(scriptUrl, {
    method: 'POST',
    mode: 'no-cors',
    body: formData,
  })

  return { success: true }
}

function flattenFormData(formData) {
  return {
    // Metadata
    submittedAt: new Date().toISOString(),
    applicationId: `CS-${Date.now()}`,

    // Route Details
    mountainProjectUrl: formData.route.mountainProjectUrl,

    // Work Description
    workDescription: formData.work.description,
    workReason: formData.work.reason,

    // Hardware — serialized as JSON string (one row per application)
    hardwareJson: JSON.stringify(formData.hardware),
    hardwareCount: formData.hardware.length,
    hardwareTotalCost: formData.hardware.reduce((sum, item) => {
      const qty = parseFloat(item.values.quantity) || 0
      const cost = parseFloat(item.values.costEach) || 0
      return sum + (qty * cost)
    }, 0).toFixed(2),

    // Contact
    firstName: formData.contact.firstName,
    lastName: formData.contact.lastName,
    email: formData.contact.email,
    phone: formData.contact.phone,

    // Waiver
    waiverSigned: formData.waiver.signed,
    waiverSignatureName: formData.waiver.signatureName,
    waiverDate: formData.waiver.date,
  }
}
