<template>
  <div id="app-inner">
    <AppHeader :current-step="currentStep" :steps="STEPS" />

    <!-- Success -->
    <transition name="slide-fade">
      <SuccessScreen
        v-if="submitted"
        :application-id="submittedId"
        :email="formData.contact.email"
        :mountain-project-url="formData.route.mountainProjectUrl"
        :item-count="formData.hardware.length"
        :total-cost="grandTotalFormatted"
        @reset="resetForm"
      />
    </transition>

    <!-- Form steps -->
    <transition name="slide-fade">
      <div v-if="!submitted">

        <!-- Step 0: Route + Work -->
        <div v-show="currentStep === 0">
          <StepRoute :form="formData.route" :work="formData.work" ref="stepRoute" />
        </div>

        <!-- Step 1: Hardware -->
        <div v-show="currentStep === 1">
          <StepHardware
            :hardware="formData.hardware"
            @update:hardware="val => formData.hardware = val"
            ref="stepHardware"
          />
        </div>

        <!-- Step 2: Summary -->
        <div v-show="currentStep === 2">
          <StepSummary
            :hardware="formData.hardware"
            ref="stepSummary"
          />
        </div>

        <!-- Step 3: Contact -->
        <div v-show="currentStep === 3">
          <StepContact :form="formData.contact" ref="stepContact" />
        </div>

        <!-- Step 4: Waiver -->
        <div v-show="currentStep === 4">
          <StepWaiver :form="formData.waiver" :contact="formData.contact" ref="stepWaiver" />
        </div>

        <!-- Navigation -->
        <div class="nav-row">
          <button
            v-if="currentStep > 0"
            type="button"
            class="btn btn-secondary"
            @click="goBack"
          >
            ← Back
          </button>
          <div class="nav-spacer" />
          <button
            v-if="currentStep < STEPS.length - 1"
            type="button"
            class="btn btn-primary"
            :disabled="continuing"
            @click="goNext"
          >
            <span v-if="continuing" class="spinner" />
            {{ continuing ? 'Uploading...' : 'Continue →' }}
          </button>
          <button
            v-else
            type="button"
            class="btn btn-primary submit-btn"
            :disabled="submitting"
            @click="handleSubmit"
          >
            <span v-if="submitting" class="spinner" />
            {{ submitting ? 'Submitting...' : 'Submit Application' }}
          </button>
        </div>

        <!-- Submission error -->
        <transition name="slide-fade">
          <div v-if="submitError" class="submit-error">
            <strong>Submission failed.</strong> {{ submitError }}
          </div>
        </transition>

        <!-- Config notice if no script URL set -->
        <transition name="slide-fade">
          <div v-if="showConfigNotice" class="config-notice">
            <strong>Developer Note:</strong> No Google Apps Script URL configured.
            Set <code>VITE_APPS_SCRIPT_URL</code> in your <code>.env</code> file to enable Google Sheets submission.
            <a href="https://github.com/YOUR-REPO#google-sheets-setup" target="_blank">Setup guide →</a>
          </div>
        </transition>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import AppHeader from './components/AppHeader.vue'
import StepRoute from './components/StepRoute.vue'
import StepHardware from './components/StepHardware.vue'
import StepSummary from './components/StepSummary.vue'
import StepContact from './components/StepContact.vue'
import StepWaiver from './components/StepWaiver.vue'
import SuccessScreen from './components/SuccessScreen.vue'
import { submitToGoogleSheets } from './composables/useSubmit.js'
import { calcItemTotal, formatCurrency } from './composables/hardwareData.js'

const STEPS = [
  { id: 'route', label: 'Route' },
  { id: 'hardware', label: 'Hardware' },
  { id: 'summary', label: 'Summary' },
  { id: 'contact', label: 'Contact' },
  { id: 'waiver', label: 'Waiver' },
]

const SCRIPT_URL = import.meta.env.VITE_APPS_SCRIPT_URL || ''

const currentStep = ref(0)
const submitted = ref(false)
const submitting = ref(false)
const continuing = ref(false)
const submitError = ref('')
const submittedId = ref('')
const showConfigNotice = ref(false)

const formData = reactive({
  route: {
    mountainProjectUrl: '',
  },
  work: {
    description: '',
    reason: '',
  },
  hardware: [],
  contact: {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  },
  waiver: {
    signed: false,
    signatureName: '',
    date: new Date().toISOString().split('T')[0],
  },
})

// Step refs
const stepRoute = ref(null)
const stepHardware = ref(null)
const stepSummary = ref(null)
const stepContact = ref(null)
const stepWaiver = ref(null)

const stepRefs = [stepRoute, stepHardware, stepSummary, stepContact, stepWaiver]

const grandTotalFormatted = computed(() => {
  const total = formData.hardware.reduce((sum, item) => sum + calcItemTotal(item), 0)
  return formatCurrency(total)
})

function getStepRef() {
  return stepRefs[currentStep.value]?.value
}

async function goNext() {
  const ref = getStepRef()
  if (ref?.validate) {
    continuing.value = true
    try {
      const valid = await ref.validate()
      if (!valid) {
        window.scrollTo({ top: 0, behavior: 'smooth' })
        return
      }
    } finally {
      continuing.value = false
    }
  }
  currentStep.value++
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function goBack() {
  currentStep.value--
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

async function handleSubmit() {
  const ref = getStepRef()
  if (ref && !ref.validate()) return

  submitting.value = true
  submitError.value = ''

  try {
    const appId = generateApplicationId()

    if (!SCRIPT_URL) {
      // No URL set — show config notice and still "succeed" for demo purposes
      showConfigNotice.value = true
      await new Promise(r => setTimeout(r, 800)) // simulate
    } else {
      const summaryStep = stepSummary.value
      const files = summaryStep?.files || []
      await submitToGoogleSheets(formData, SCRIPT_URL, files, appId)
    }

    submittedId.value = appId
    submitted.value = true
    currentStep.value = STEPS.length
    window.scrollTo({ top: 0, behavior: 'smooth' })
  } catch (err) {
    submitError.value = 'Please check your connection and try again. If the problem persists, contact CragSafe directly.'
  } finally {
    submitting.value = false
  }
}

function generateApplicationId() {
  const now = new Date()
  const yy = String(now.getFullYear()).slice(-2)
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  const dd = String(now.getDate()).padStart(2, '0')
  const xxx = String(Date.now() % 1000).padStart(3, '0')
  return `${yy}${mm}${dd}-${xxx}`
}

function resetForm() {
  currentStep.value = 0
  submitted.value = false
  submitError.value = ''
  showConfigNotice.value = false
  Object.assign(formData.route, { mountainProjectUrl: '' })
  Object.assign(formData.work, { description: '', reason: '' })
  formData.hardware = []
  Object.assign(formData.contact, { firstName: '', lastName: '', email: '', phone: '' })
  Object.assign(formData.waiver, { signed: false, signatureName: '', date: new Date().toISOString().split('T')[0] })
}
</script>

<style scoped>
.nav-row {
  display: flex;
  align-items: center;
  padding: 24px 0 0;
  border-top: var(--border);
  margin-top: 8px;
  gap: 12px;
}

.nav-spacer { flex: 1; }

.submit-btn {
  min-width: 180px;
  justify-content: center;
}

.submit-btn:disabled,
.btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.spinner {
  display: inline-block;
  width: 14px;
  height: 14px;
  border: 2px solid rgba(240,237,230,0.3);
  border-top-color: var(--chalk);
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.submit-error {
  margin-top: 12px;
  padding: 12px 16px;
  background: rgba(196,48,48,0.1);
  border: 1px solid rgba(196,48,48,0.3);
  border-radius: 2px;
  font-size: 0.82rem;
  color: #e08080;
}

.config-notice {
  margin-top: 12px;
  padding: 12px 16px;
  background: rgba(232,160,32,0.08);
  border: 1px solid rgba(232,160,32,0.25);
  border-radius: 2px;
  font-size: 0.78rem;
  color: var(--warn);
  line-height: 1.6;
}

.config-notice code {
  background: rgba(232,160,32,0.15);
  padding: 1px 5px;
  border-radius: 2px;
  font-family: var(--font-mono);
}

.config-notice a {
  color: var(--sky-light);
  text-decoration: underline;
}
</style>
