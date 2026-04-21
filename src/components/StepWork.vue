<template>
  <FormSection
    title="Work Description"
    description="Describe the maintenance work performed and justify why it was necessary."
  >
    <div class="field" :class="{ 'field-error': errors.description }">
      <label class="required">What work was performed?</label>
      <textarea
        v-model="form.description"
        placeholder="Describe the specific work carried out — replaced bolts at pitch 2, installed new anchor chains, rebolted entire route..."
        rows="5"
        @input="errors.description = ''"
      />
      <span v-if="errors.description" class="error-msg">{{ errors.description }}</span>
    </div>

    <div class="field" :class="{ 'field-error': errors.reason }">
      <label class="required">Why was this work necessary?</label>
      <textarea
        v-model="form.reason"
        placeholder="Describe the condition requiring maintenance — corrosion, spinner bolts, missing hardware, safety concerns..."
        rows="5"
        @input="errors.reason = ''"
      />
      <span v-if="errors.reason" class="error-msg">{{ errors.reason }}</span>
    </div>
  </FormSection>
</template>

<script setup>
import { reactive } from 'vue'
import FormSection from './FormSection.vue'

const props = defineProps({
  form: { type: Object, required: true },
})

const errors = reactive({})

function validate() {
  let valid = true
  if (!props.form.description?.trim()) {
    errors.description = 'Please describe the work performed'
    valid = false
  }
  if (!props.form.reason?.trim()) {
    errors.reason = 'Please explain why the work was necessary'
    valid = false
  }
  return valid
}

defineExpose({ validate })
</script>
