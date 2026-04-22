<template>
  <FormSection title="Review & Upload Receipts">
    <template #badge>
      <span v-if="uploadSuccess" class="status-badge complete">
        ✓ Uploaded
      </span>
      <span v-else-if="files.length > 0" class="status-badge pending">
        {{ files.length }} file{{ files.length !== 1 ? 's' : '' }}
      </span>
    </template>

    <!-- Hardware Summary -->
    <div class="section-label">Supplies & Hardware Summary</div>
    <div class="hardware-list">
      <div v-for="(item, i) in hardware" :key="item.id" class="hardware-item">
        <div class="hardware-index">{{ i + 1 }}</div>
        <div class="hardware-details">
          <div class="hardware-type">{{ HARDWARE_FIELDS[item.type]?.label }}</div>
          <div class="hardware-meta">
            <span class="qty">{{ item.values.quantity }} qty</span>
            <span class="cost">{{ formatCurrency(calcItemTotal(item)) }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="section-total">
      <div class="total-label">Total Hardware Cost</div>
      <div class="total-amount">{{ formatCurrency(grandTotal) }}</div>
    </div>

    <!-- File Upload -->
    <div style="margin-top: 28px;">
      <div class="section-label">Receipt Photos & PDFs</div>
      <div class="upload-area" :class="{ 'upload-area--drag': isDragging }">
        <input
          ref="fileInput"
          type="file"
          multiple
          accept="image/*,.pdf"
          @change="handleFileInput"
          @dragover.prevent="isDragging = true"
          @dragleave.prevent="isDragging = false"
          @drop.prevent="handleDrop"
          style="display: none"
        />
        <div
          class="upload-trigger"
          @click="fileInput?.click()"
          @dragover.prevent="isDragging = true"
          @dragleave.prevent="isDragging = false"
          @drop.prevent="handleDrop"
        >
          <div class="upload-icon">📎</div>
          <div class="upload-text">
            <div class="upload-title">Click to upload or drag files</div>
            <div class="upload-hint">PNG, JPG, PDF • Max 50MB total</div>
          </div>
        </div>
      </div>

      <!-- Selected files -->
      <TransitionGroup name="list" tag="div" v-if="files.length > 0" class="files-list">
        <div v-for="(file, i) in files" :key="file.name + i" class="file-item">
          <div class="file-icon">📄</div>
          <div class="file-info">
            <div class="file-name">{{ file.name }}</div>
            <div class="file-size">{{ formatFileSize(file.size) }}</div>
          </div>
          <button
            type="button"
            class="file-remove"
            @click="removeFile(i)"
            aria-label="Remove file"
          >
            ✕
          </button>
        </div>
      </TransitionGroup>


      <!-- Success message -->
      <transition name="slide-fade">
        <div v-if="uploadSuccess" class="upload-success">
          <div class="success-icon">✓</div>
          <div class="success-text">
            <div class="success-title">Upload Successful</div>
            <div class="success-hint">{{ files.length }} file{{ files.length !== 1 ? 's' : '' }} ready to submit</div>
          </div>
        </div>
      </transition>

      <!-- Error message -->
      <transition name="slide-fade">
        <div v-if="uploadError" class="upload-error">
          <strong>Upload failed.</strong> {{ uploadError }}
        </div>
      </transition>

      <!-- Validation / upload error -->
      <p v-if="showError" class="error-msg" style="margin-top: 12px;">
        {{ errorMsg }}
      </p>
    </div>
  </FormSection>
</template>

<script setup>
import { ref, computed } from 'vue'
import FormSection from './FormSection.vue'
import { HARDWARE_FIELDS, calcItemTotal, formatCurrency } from '../composables/hardwareData.js'

const props = defineProps({
  hardware: { type: Array, required: true },
})

const fileInput = ref(null)
const files = ref([])
const isDragging = ref(false)
const uploading = ref(false)
const uploadProgress = ref(0)
const uploadSuccess = ref(false)
const uploadError = ref('')
const showError = ref(false)
const errorMsg = ref('')

const grandTotal = computed(() =>
  props.hardware.reduce((sum, item) => sum + calcItemTotal(item), 0)
)

function handleFileInput(event) {
  const newFiles = Array.from(event.target.files || [])
  files.value.push(...newFiles)
  isDragging.value = false
}

function handleDrop(event) {
  const newFiles = Array.from(event.dataTransfer.files || [])
  files.value.push(...newFiles)
  isDragging.value = false
}

function removeFile(index) {
  files.value.splice(index, 1)
  uploadSuccess.value = false
}

function formatFileSize(bytes) {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

async function uploadFiles() {
  uploading.value = true
  uploadError.value = ''
  uploadProgress.value = 0

  try {
    const formData = new FormData()
    files.value.forEach((file, index) => {
      formData.append(`receipt_${index}`, file)
    })

    // Simulate upload — in production this sends to Apps Script
    await new Promise(r => setTimeout(r, 1500))
    uploadProgress.value = 100

    uploadSuccess.value = true
    showError.value = false
    return true
  } catch (err) {
    uploadError.value = 'Failed to upload files. Please try again.'
    return false
  } finally {
    uploading.value = false
  }
}

async function validate() {
  if (files.value.length === 0) {
    errorMsg.value = 'Please add at least one receipt photo or PDF before continuing.'
    showError.value = true
    return false
  }
  if (uploadSuccess.value) return true
  const ok = await uploadFiles()
  if (!ok) {
    errorMsg.value = 'Upload failed. Please try again.'
    showError.value = true
  }
  return ok
}

defineExpose({ validate, files })
</script>

<style scoped>
.section-label {
  font-size: 0.68rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--text-muted);
  margin-bottom: 12px;
}

.hardware-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
  padding: 12px 0;
  border-top: 1px solid rgba(26,26,24,0.08);
  border-bottom: 1px solid rgba(26,26,24,0.08);
}

.hardware-item {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  padding: 10px 0;
  font-size: 0.85rem;
}

.hardware-index {
  min-width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(196,82,26,0.10);
  border: 1px solid rgba(196,82,26,0.25);
  border-radius: 2px;
  color: var(--rust);
  font-size: 0.75rem;
  font-weight: 600;
}

.hardware-details {
  flex: 1;
}

.hardware-type {
  color: var(--stone);
  font-weight: 500;
  margin-bottom: 3px;
}

.hardware-meta {
  display: flex;
  gap: 12px;
  font-size: 0.75rem;
  color: var(--text-muted);
}

.section-total {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  background: rgba(196,82,26,0.05);
  border: 1px solid rgba(196,82,26,0.18);
  border-radius: 3px;
}

.total-label {
  font-size: 0.72rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--text-muted);
}

.total-amount {
  font-family: var(--font-display);
  font-size: 1.2rem;
  color: var(--stone);
  letter-spacing: 0.06em;
}

.upload-area {
  border: 2px dashed rgba(26,26,24,0.15);
  border-radius: 3px;
  transition: all 0.2s;
  margin-bottom: 16px;
  background: rgba(26,26,24,0.02);
}

.upload-area--drag {
  border-color: rgba(196,82,26,0.5);
  background: rgba(196,82,26,0.04);
}

.upload-trigger {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px 16px;
  cursor: pointer;
  user-select: none;
  transition: background 0.15s;
}

.upload-trigger:hover {
  background: rgba(26,26,24,0.03);
}

.upload-icon {
  font-size: 1.8rem;
  opacity: 0.5;
}

.upload-text {
  flex: 1;
}

.upload-title {
  font-size: 0.95rem;
  color: var(--stone);
  margin-bottom: 2px;
}

.upload-hint {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.files-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
}

.file-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  background: var(--card-bg);
  border: 1px solid rgba(26,26,24,0.10);
  border-radius: 2px;
}

.file-icon {
  font-size: 1.1rem;
  opacity: 0.5;
}

.file-info {
  flex: 1;
  min-width: 0;
}

.file-name {
  font-size: 0.85rem;
  color: var(--stone);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.file-size {
  font-size: 0.72rem;
  color: var(--text-muted);
  margin-top: 2px;
}

.file-remove {
  background: none;
  border: none;
  color: rgba(26,26,24,0.3);
  cursor: pointer;
  padding: 4px 8px;
  font-size: 0.9rem;
  transition: color 0.15s;
}

.file-remove:hover {
  color: var(--stone);
}


.spinner {
  display: inline-block;
  width: 12px;
  height: 12px;
  border: 2px solid rgba(26,26,24,0.15);
  border-top-color: var(--stone);
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  margin-right: 6px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.upload-success {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  background: rgba(74,92,58,0.08);
  border: 1px solid rgba(74,92,58,0.25);
  border-radius: 3px;
  color: #3d7030;
}

.success-icon {
  font-size: 1.2rem;
}

.success-text {
  flex: 1;
}

.success-title {
  font-size: 0.85rem;
  font-weight: 500;
}

.success-hint {
  font-size: 0.75rem;
  color: #5a9048;
  margin-top: 2px;
}

.upload-error {
  padding: 12px 14px;
  background: rgba(184,48,48,0.06);
  border: 1px solid rgba(184,48,48,0.2);
  border-radius: 3px;
  font-size: 0.82rem;
  color: #b83030;
  margin-bottom: 12px;
}

.error-msg {
  color: var(--error);
  font-size: 0.82rem;
}

.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}

.list-enter-from {
  opacity: 0;
  transform: translateX(-10px);
}

.list-leave-to {
  opacity: 0;
  transform: translateX(10px);
}

.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.15s ease;
}

.slide-fade-enter-from {
  opacity: 0;
  transform: translateY(-8px);
}

.slide-fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
