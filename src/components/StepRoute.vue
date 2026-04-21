<template>
  <FormSection
    title="Route Details"
    description="Provide information about the route requiring maintenance. A Mountain Project link is required."
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

    <div class="field-row">
      <div class="field" :class="{ 'field-error': errors.routeName }">
        <label class="required">Route Name</label>
        <input type="text" v-model="form.routeName" placeholder="e.g. The Nose" @input="errors.routeName = ''" />
        <span v-if="errors.routeName" class="error-msg">{{ errors.routeName }}</span>
      </div>
      <div class="field" :class="{ 'field-error': errors.grade }">
        <label class="required">Grade</label>
        <input type="text" v-model="form.grade" placeholder="e.g. 5.10a" @input="errors.grade = ''" />
        <span v-if="errors.grade" class="error-msg">{{ errors.grade }}</span>
      </div>
    </div>

    <div class="field-row">
      <div class="field" :class="{ 'field-error': errors.firstAscent }">
        <label class="required">First Ascent (FA)</label>
        <input type="text" v-model="form.firstAscent" placeholder="e.g. John Gill, 1961" @input="errors.firstAscent = ''" />
        <span v-if="errors.firstAscent" class="error-msg">{{ errors.firstAscent }}</span>
      </div>
      <div class="field" :class="{ 'field-error': errors.height }">
        <label class="required">Height</label>
        <input type="text" v-model="form.height" placeholder="e.g. 60m / 200ft" @input="errors.height = ''" />
        <span v-if="errors.height" class="error-msg">{{ errors.height }}</span>
      </div>
    </div>

    <div class="field" :class="{ 'field-error': errors.description }">
      <label class="required">Route Description</label>
      <textarea
        v-model="form.description"
        placeholder="Describe the route — character, style, notable features..."
        rows="4"
        @input="errors.description = ''"
      />
      <span v-if="errors.description" class="error-msg">{{ errors.description }}</span>
    </div>

    <div class="field" :class="{ 'field-error': errors.protection }">
      <label class="required">Protection Details</label>
      <textarea
        v-model="form.protection"
        placeholder="Describe existing protection — bolt counts, spacing, anchor style, gear requirements..."
        rows="3"
        @input="errors.protection = ''"
      />
      <span v-if="errors.protection" class="error-msg">{{ errors.protection }}</span>
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
  const required = ['mountainProjectUrl', 'routeName', 'grade', 'firstAscent', 'height', 'description', 'protection']
  for (const key of required) {
    if (!props.form[key]?.trim()) {
      errors[key] = 'This field is required'
      valid = false
    }
  }
  if (props.form.mountainProjectUrl && !props.form.mountainProjectUrl.startsWith('http')) {
    errors.mountainProjectUrl = 'Please enter a valid URL'
    valid = false
  }
  return valid
}

defineExpose({ validate })
</script>
