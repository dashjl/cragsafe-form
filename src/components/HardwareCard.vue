<template>
  <div class="hardware-card" :style="{ '--accent': typeConfig.color }">
    <div class="card-header">
      <div class="card-title-row">
        <div class="type-tag" :style="{ background: typeConfig.color + '22', borderColor: typeConfig.color + '55', color: typeConfig.color }">
          {{ typeConfig.label }}
        </div>
        <div class="card-index">Item #{{ index + 1 }}</div>
      </div>
      <button class="btn btn-danger card-remove" type="button" @click="$emit('remove')">
        ✕ Remove
      </button>
    </div>

    <div class="card-body">
      <template v-for="field in typeConfig.fields" :key="field.id">
        <!-- Regular radio field -->
        <div v-if="field.type === 'radio'" class="field" :class="{ 'field-error': errors[field.id] }">
          <label :class="{ required: field.required }">{{ field.label }}</label>
          <div class="radio-group">
            <div
              v-for="opt in field.options"
              :key="opt"
              class="radio-pill"
            >
              <input
                type="radio"
                :name="`${item.id}-${field.id}`"
                :id="`${item.id}-${field.id}-${opt}`"
                :value="opt"
                v-model="item.values[field.id]"
                @change="errors[field.id] = ''"
              />
              <label :for="`${item.id}-${field.id}-${opt}`">{{ opt }}</label>
            </div>
          </div>
          <!-- Other text input -->
          <transition name="slide-fade">
            <div v-if="item.values[field.id] === 'Other'" class="other-input">
              <input
                type="text"
                v-model="item.otherValues[field.id]"
                placeholder="Please specify..."
              />
            </div>
          </transition>
          <!-- Conditional sub-fields for permadraws -->
          <transition name="slide-fade">
            <div v-if="field.conditional && item.values[field.id] && item.values[field.id] !== 'Other'" class="conditional-fields">
              <template v-for="subField in (field.conditional[item.values[field.id]] || [])" :key="subField.id">
                <div class="field" :class="{ 'field-error': errors[subField.id] }">
                  <label :class="{ required: subField.required }">{{ subField.label }}</label>
                  <div class="radio-group">
                    <div v-for="opt in subField.options" :key="opt" class="radio-pill">
                      <input
                        type="radio"
                        :name="`${item.id}-${subField.id}`"
                        :id="`${item.id}-${subField.id}-${opt}`"
                        :value="opt"
                        v-model="item.values[subField.id]"
                        @change="errors[subField.id] = ''"
                      />
                      <label :for="`${item.id}-${subField.id}-${opt}`">{{ opt }}</label>
                    </div>
                  </div>
                  <transition name="slide-fade">
                    <div v-if="item.values[subField.id] === 'Other'" class="other-input">
                      <input type="text" v-model="item.otherValues[subField.id]" placeholder="Please specify..." />
                    </div>
                  </transition>
                  <span v-if="errors[subField.id]" class="error-msg">{{ errors[subField.id] }}</span>
                </div>
              </template>
            </div>
          </transition>
          <span v-if="errors[field.id]" class="error-msg">{{ errors[field.id] }}</span>
        </div>

        <!-- Integer field -->
        <div v-else-if="field.type === 'integer'" class="field" :class="{ 'field-error': errors[field.id] }">
          <label :class="{ required: field.required }">{{ field.label }}</label>
          <input
            type="number"
            v-model="item.values[field.id]"
            min="1"
            step="1"
            placeholder="0"
            @input="errors[field.id] = ''"
          />
          <span v-if="errors[field.id]" class="error-msg">{{ errors[field.id] }}</span>
        </div>

        <!-- Currency field -->
        <div v-else-if="field.type === 'currency'" class="field" :class="{ 'field-error': errors[field.id] }">
          <label :class="{ required: field.required }">{{ field.label }}</label>
          <div class="currency-input">
            <span class="currency-prefix">$</span>
            <input
              type="number"
              v-model="item.values[field.id]"
              min="0"
              step="0.01"
              placeholder="0.00"
              @input="errors[field.id] = ''"
            />
          </div>
          <span v-if="errors[field.id]" class="error-msg">{{ errors[field.id] }}</span>
        </div>

        <!-- Text field -->
        <div v-else-if="field.type === 'text'" class="field" :class="{ 'field-error': errors[field.id] }">
          <label :class="{ required: field.required }">{{ field.label }}</label>
          <input
            type="text"
            v-model="item.values[field.id]"
            :placeholder="field.placeholder || ''"
            @input="errors[field.id] = ''"
          />
          <span v-if="errors[field.id]" class="error-msg">{{ errors[field.id] }}</span>
        </div>
      </template>

      <!-- Line total -->
      <div v-if="lineTotal > 0" class="line-total">
        <span>Line Total</span>
        <span class="total-amount">{{ formatCurrency(lineTotal) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, computed } from 'vue'
import { HARDWARE_FIELDS, calcItemTotal, formatCurrency } from '../composables/hardwareData.js'

const props = defineProps({
  item: { type: Object, required: true },
  index: { type: Number, required: true },
})
defineEmits(['remove'])

const typeConfig = computed(() => HARDWARE_FIELDS[props.item.type])
const errors = reactive({})
const lineTotal = computed(() => calcItemTotal(props.item))

function validate() {
  let valid = true
  const fields = typeConfig.value.fields
  for (const field of fields) {
    if (field.required && !props.item.values[field.id]) {
      errors[field.id] = 'Required'
      valid = false
    }
    // Check conditional sub-fields
    if (field.conditional && props.item.values[field.id]) {
      const subFields = field.conditional[props.item.values[field.id]] || []
      for (const sf of subFields) {
        if (sf.required && !props.item.values[sf.id]) {
          errors[sf.id] = 'Required'
          valid = false
        }
      }
    }
  }
  return valid
}

defineExpose({ validate })
</script>

<style scoped>
.hardware-card {
  border: 1px solid rgba(240,237,230,0.1);
  border-left: 3px solid var(--accent, var(--rust));
  border-radius: 3px;
  margin-bottom: 16px;
  background: rgba(240,237,230,0.02);
  overflow: hidden;
  transition: border-color 0.2s;
}

.hardware-card:hover {
  border-color: rgba(240,237,230,0.18);
  border-left-color: var(--accent, var(--rust));
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid rgba(240,237,230,0.06);
  background: rgba(240,237,230,0.02);
}

.card-title-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.type-tag {
  font-size: 0.7rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  padding: 3px 10px;
  border-radius: 20px;
  border: 1px solid;
  font-family: var(--font-mono);
  font-weight: 500;
}

.card-index {
  font-size: 0.7rem;
  color: var(--chalk-dim);
  letter-spacing: 0.06em;
}

.card-remove {
  font-family: var(--font-mono);
  font-size: 0.7rem;
  letter-spacing: 0.06em;
  padding: 4px 10px;
}

.card-body {
  padding: 20px 16px 8px;
}

.other-input {
  margin-top: 8px;
}

.conditional-fields {
  margin-top: 16px;
  padding: 16px;
  border: 1px solid rgba(240,237,230,0.08);
  border-radius: 2px;
  background: rgba(240,237,230,0.015);
}

.currency-input {
  position: relative;
}

.currency-prefix {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--chalk-dim);
  font-size: 0.88rem;
  pointer-events: none;
  z-index: 1;
}

.currency-input input {
  padding-left: 26px;
}

.line-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0 8px;
  margin-top: 8px;
  border-top: 1px solid rgba(240,237,230,0.08);
  font-size: 0.78rem;
  color: var(--chalk-dim);
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.total-amount {
  font-size: 0.92rem;
  color: var(--chalk);
  font-weight: 500;
}
</style>
