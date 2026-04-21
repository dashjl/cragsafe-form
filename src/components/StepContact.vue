<template>
  <FormSection
    title="Contact Information"
    description="Provide your contact details for application correspondence and payment."
  >
    <div class="field-row">
      <div class="field" :class="{ 'field-error': errors.firstName }">
        <label class="required">First Name</label>
        <input type="text" v-model="form.firstName" placeholder="Jane" @input="errors.firstName = ''" />
        <span v-if="errors.firstName" class="error-msg">{{ errors.firstName }}</span>
      </div>
      <div class="field" :class="{ 'field-error': errors.lastName }">
        <label class="required">Last Name</label>
        <input type="text" v-model="form.lastName" placeholder="Smith" @input="errors.lastName = ''" />
        <span v-if="errors.lastName" class="error-msg">{{ errors.lastName }}</span>
      </div>
    </div>

    <div class="field-row">
      <div class="field" :class="{ 'field-error': errors.email }">
        <label class="required">Email Address</label>
        <input type="email" v-model="form.email" placeholder="jane@example.com" @input="errors.email = ''" />
        <span v-if="errors.email" class="error-msg">{{ errors.email }}</span>
        <span class="helper-text">This email will be used to send eTransfer funding if your application is approved.</span>
      </div>
      <div class="field" :class="{ 'field-error': errors.phone }">
        <label>Phone Number</label>
        <input type="tel" v-model="form.phone" placeholder="+1 (555) 000-0000" />
      </div>
    </div>
  </FormSection>
</template>

<script setup>
import { reactive } from 'vue'
import FormSection from './FormSection.vue'

const props = defineProps({ form: { type: Object, required: true } })
const errors = reactive({})

function validate() {
  let valid = true
  const required = ['firstName', 'lastName', 'email']
  for (const key of required) {
    if (!props.form[key]?.trim()) {
      errors[key] = 'Required'
      valid = false
    }
  }
  if (props.form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(props.form.email)) {
    errors.email = 'Please enter a valid email address'
    valid = false
  }
  return valid
}

defineExpose({ validate })
</script>
