<template>
  <FormSection
    title="Liability Waiver"
    description="Please read the following waiver carefully before signing."
  >
    <div class="waiver-scroll">
      <div class="waiver-text serif">
        <p><strong>RELEASE OF LIABILITY, WAIVER OF CLAIMS, ASSUMPTION OF RISKS AND INDEMNITY AGREEMENT</strong></p>

        <p>By submitting this application to CragSafe Foundation ("CragSafe"), the applicant ("Applicant") acknowledges and agrees to the following terms and conditions:</p>

        <p><strong>1. Nature of Activity.</strong> The Applicant acknowledges that rock climbing route maintenance, including the installation, replacement, or inspection of fixed protection hardware, is an inherently dangerous activity. Risks include but are not limited to: falls, rockfall, equipment failure, weather, and other hazards associated with working at height in a natural environment.</p>

        <p><strong>2. Accuracy of Information.</strong> The Applicant certifies that all information provided in this application is true, accurate, and complete to the best of their knowledge. The Applicant agrees to provide supporting receipts and documentation upon request. Submission of false or misleading information will result in immediate disqualification and may require repayment of any funds received.</p>

        <p><strong>3. Compliance with Standards.</strong> The Applicant confirms that all route maintenance work was performed in accordance with applicable standards for fixed protection installation, including but not limited to manufacturer specifications, American Safe Climbing Association (ASCA) guidelines, and local access and land management regulations.</p>

        <p><strong>4. No Warranty.</strong> CragSafe makes no warranty or representation, express or implied, regarding the safety of any hardware funded through this program. CragSafe's provision of funding does not constitute endorsement, certification, or inspection of any hardware or installation.</p>

        <p><strong>5. Release and Indemnification.</strong> In consideration of CragSafe's review of this application, the Applicant releases, waives, discharges, and covenants not to sue CragSafe Foundation, its directors, officers, volunteers, and agents from any and all liability, claims, demands, actions and causes of action arising out of or related to any loss, damage, or injury that may be sustained in connection with the route maintenance described herein. The Applicant agrees to indemnify and hold harmless CragSafe from any claims arising from the Applicant's work or the funded hardware.</p>

        <p><strong>6. Governing Law.</strong> This agreement shall be governed by the laws of the applicable jurisdiction. If any provision of this agreement is found to be unenforceable, the remaining provisions shall remain in full force and effect.</p>

        <p>THE APPLICANT HAS READ THIS AGREEMENT, UNDERSTANDS IT, AND SIGNS IT VOLUNTARILY AS THEIR OWN FREE ACT. THIS IS A LEGALLY BINDING AGREEMENT.</p>
      </div>
    </div>

    <div class="waiver-sign">
      <div class="sign-header">Electronic Signature</div>

      <div class="field" :class="{ 'field-error': errors.signatureName }">
        <label class="required">Type your full legal name to sign</label>
        <input
          type="text"
          v-model="form.signatureName"
          :placeholder="expectedName || 'Jane Smith'"
          class="signature-input"
          @input="errors.signatureName = ''"
        />
        <span v-if="errors.signatureName" class="error-msg">{{ errors.signatureName }}</span>
        <span v-else-if="expectedName" class="helper-text">Must match the name entered on the previous page: <strong>{{ expectedName }}</strong></span>
      </div>

      <div class="field-row">
        <div class="field">
          <label>Date</label>
          <input type="text" :value="todayFormatted" readonly class="date-readonly" />
        </div>
      </div>

      <div class="checkbox-item agree-check" :class="{ 'check-error': errors.agreed }" @click="toggleAgree">
        <input type="checkbox" v-model="form.signed" @change="errors.agreed = ''" />
        <span>I have read, understood, and agree to the terms of this liability waiver. I confirm that the information in this application is accurate and complete.</span>
      </div>
      <span v-if="errors.agreed" class="error-msg">{{ errors.agreed }}</span>
    </div>
  </FormSection>
</template>

<script setup>
import { reactive, computed } from 'vue'
import FormSection from './FormSection.vue'

const props = defineProps({
  form: { type: Object, required: true },
  contact: { type: Object, default: () => ({}) },
})
const errors = reactive({})

const expectedName = computed(() => {
  const first = props.contact.firstName?.trim() || ''
  const last = props.contact.lastName?.trim() || ''
  return first && last ? `${first} ${last}` : first || last
})

const todayFormatted = computed(() => {
  return new Date().toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' })
})

function toggleAgree() {
  props.form.signed = !props.form.signed
  if (props.form.signed) errors.agreed = ''
}

function validate() {
  let valid = true
  const typed = props.form.signatureName?.trim() || ''
  if (!typed) {
    errors.signatureName = 'Please type your full name to sign'
    valid = false
  } else if (expectedName.value && typed.toLowerCase() !== expectedName.value.toLowerCase()) {
    errors.signatureName = `Name does not match your contact information. Please go back and correct your name, or type "${expectedName.value}" to match.`
    valid = false
  }
  if (!props.form.signed) {
    errors.agreed = 'You must agree to the waiver to submit'
    valid = false
  }
  return valid
}

defineExpose({ validate })
</script>

<style scoped>
.waiver-scroll {
  max-height: 320px;
  overflow-y: auto;
  border: 1px solid rgba(26,26,24,0.10);
  border-radius: 3px;
  padding: 20px;
  margin-bottom: 24px;
  background: rgba(26,26,24,0.02);
  scrollbar-width: thin;
  scrollbar-color: rgba(196,82,26,0.3) transparent;
}

.waiver-text {
  font-size: 0.8rem;
  line-height: 1.8;
  color: rgba(26,26,24,0.72);
}

.waiver-text p {
  margin-bottom: 12px;
}

.waiver-text strong {
  color: var(--stone);
}

.waiver-sign {
  border: 1px solid rgba(196,82,26,0.18);
  border-radius: 3px;
  padding: 20px;
  background: rgba(196,82,26,0.03);
}

.sign-header {
  font-family: var(--font-display);
  font-size: 1rem;
  letter-spacing: 0.1em;
  margin-bottom: 16px;
  color: var(--stone);
}

.signature-input {
  font-family: 'DM Serif Text', serif;
  font-size: 1.2rem !important;
  font-style: italic;
  letter-spacing: 0.02em;
}

.date-readonly {
  background: rgba(26,26,24,0.03) !important;
  color: var(--text-muted) !important;
  cursor: default;
}

.agree-check {
  cursor: pointer;
  padding: 12px;
  border: 1px solid rgba(26,26,24,0.10);
  border-radius: 3px;
  transition: background 0.15s;
  font-size: 0.82rem;
  line-height: 1.6;
}

.agree-check:hover {
  background: rgba(26,26,24,0.03);
}

.helper-text {
  display: block;
  font-size: 0.78rem;
  color: var(--text-muted);
  margin-top: 4px;
}

.helper-text strong {
  color: var(--stone);
}

.check-error {
  border-color: var(--error);
}
</style>
