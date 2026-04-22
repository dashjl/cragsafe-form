// Google Sheets submission via Apps Script Web App
// See README for setup instructions

export async function submitToGoogleSheets(formData, scriptUrl, files = [], applicationId) {
  const payload = flattenFormData(formData, applicationId)

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

  Object.entries(payload).forEach(([key, value]) => {
    formData.append(key, typeof value === 'object' ? JSON.stringify(value) : value)
  })

  // Encode files as base64 — multipart bodies are dropped by Apps Script's redirect
  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    const base64 = await fileToBase64(file)
    formData.append(`receipt_${i}`, base64)
    formData.append(`receipt_${i}_name`, file.name)
    formData.append(`receipt_${i}_type`, file.type)
  }

  await fetch(scriptUrl, {
    method: 'POST',
    mode: 'no-cors',
    body: formData,
  })

  return { success: true }
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result.split(',')[1])
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

function flattenFormData(formData, applicationId) {
  return {
    // Metadata
    submittedAt: new Date().toISOString(),
    applicationId,

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
