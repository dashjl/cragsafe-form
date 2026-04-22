<template>
  <FormSection
    title="Route Details"
    description="Provide the Mountain Project link for the route requiring maintenance, then describe the work carried out."
  >
    <div class="field" :class="{ 'field-error': errors.mountainProjectUrl }">
      <label class="required">Mountain Project URL</label>
      <input
        type="url"
        v-model="form.mountainProjectUrl"
        placeholder="https://www.mountainproject.com/route/..."
        @input="errors.mountainProjectUrl = ''"
      />
      <span v-if="errors.mountainProjectUrl" class="error-msg">{{ errors.mountainProjectUrl }}</span>
    </div>

    <div class="field" :class="{ 'field-error': errors.workDescription }">
      <label class="required">What work was performed?</label>
      <textarea
        v-model="work.description"
        placeholder="Describe the specific work carried out — replaced bolts at pitch 2, installed new anchor chains, rebolted entire route..."
        rows="4"
        @input="errors.workDescription = ''"
      />
      <span v-if="errors.workDescription" class="error-msg">{{ errors.workDescription }}</span>
    </div>

    <div class="field" :class="{ 'field-error': errors.workReason }">
      <label class="required">Why was this work necessary?</label>
      <textarea
        v-model="work.reason"
        placeholder="Describe the condition requiring maintenance — corrosion, spinner bolts, missing hardware, safety concerns..."
        rows="4"
        @input="errors.workReason = ''"
      />
      <span v-if="errors.workReason" class="error-msg">{{ errors.workReason }}</span>
    </div>
  </FormSection>
</template>

<script setup>
import { reactive } from 'vue'
import FormSection from './FormSection.vue'

const props = defineProps({
  form: { type: Object, required: true },
  work: { type: Object, required: true },
})

const errors = reactive({})

function validate() {
  let valid = true
  if (!props.form.mountainProjectUrl?.trim()) {
    errors.mountainProjectUrl = 'This field is required'
    valid = false
  } else if (!/^https?:\/\/www\.mountainproject\.com\/route/i.test(props.form.mountainProjectUrl)) {
    errors.mountainProjectUrl = 'Please enter a valid Mountain Project route URL (e.g. https://www.mountainproject.com/route/...)'
    valid = false
  }
  if (!props.work.description?.trim()) {
    errors.workDescription = 'Please describe the work performed'
    valid = false
  }
  if (!props.work.reason?.trim()) {
    errors.workReason = 'Please explain why the work was necessary'
    valid = false
  }
  return valid
}

defineExpose({ validate })
</script>
