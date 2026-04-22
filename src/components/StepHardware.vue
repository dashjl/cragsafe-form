<template>
  <FormSection title="Supplies & Hardware">
    <template #badge>
      <span v-if="hardware.length > 0" class="status-badge complete">
        {{ hardware.length }} item{{ hardware.length !== 1 ? 's' : '' }}
      </span>
    </template>

    <!-- Existing items -->
    <TransitionGroup name="list" tag="div">
      <HardwareCard
        v-for="(item, i) in hardware"
        :key="item.id"
        :item="item"
        :index="i"
        :ref="el => { if (el) cardRefs[item.id] = el }"
        @remove="removeItem(i)"
      />
    </TransitionGroup>

    <!-- Total summary -->
    <div v-if="hardware.length > 0 && grandTotal > 0" class="grand-total">
      <div class="grand-total-label">Estimated Total Hardware Cost</div>
      <div class="grand-total-amount">{{ formatCurrency(grandTotal) }}</div>
    </div>

    <!-- Add item panel -->
    <div class="add-panel" :class="{ 'add-panel--open': showAddPanel }">
      <div class="add-trigger" @click="showAddPanel = !showAddPanel">
        <div class="add-trigger-label">
          <span class="add-icon">{{ showAddPanel ? '−' : '+' }}</span>
          Add Supply Item
        </div>
        <span class="add-trigger-hint">{{ SUPPLY_TYPES.length }} types available</span>
      </div>

      <transition name="slide-fade">
        <div v-if="showAddPanel" class="supply-grid">
          <button
            v-for="type in SUPPLY_TYPES"
            :key="type.id"
            type="button"
            class="supply-btn"
            :style="{
              '--btn-accent': HARDWARE_FIELDS[type.id]?.color || '#c4521a'
            }"
            @click="addItem(type.id)"
          >
            <span class="supply-label">{{ type.label }}</span>
          </button>
        </div>
      </transition>
    </div>

    <transition name="slide-fade">
      <div v-if="errorBanner" class="validation-banner">
        {{ errorBanner }}
      </div>
    </transition>
  </FormSection>
</template>

<script setup>
import { ref, computed } from 'vue'
import FormSection from './FormSection.vue'
import HardwareCard from './HardwareCard.vue'
import { SUPPLY_TYPES, HARDWARE_FIELDS, createHardwareItem, calcItemTotal, formatCurrency } from '../composables/hardwareData.js'

const props = defineProps({
  hardware: { type: Array, required: true },
})
const emit = defineEmits(['update:hardware'])

const showAddPanel = ref(true)
const errorBanner = ref('')
const cardRefs = ref({})

const grandTotal = computed(() =>
  props.hardware.reduce((sum, item) => sum + calcItemTotal(item), 0)
)

function addItem(typeId) {
  const newItem = createHardwareItem(typeId)
  emit('update:hardware', [...props.hardware, newItem])
  showAddPanel.value = false
  errorBanner.value = ''
  // Scroll to bottom after render
  setTimeout(() => {
    const el = document.querySelector('.add-panel')
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, 100)
}

function removeItem(index) {
  const updated = [...props.hardware]
  updated.splice(index, 1)
  emit('update:hardware', updated)
}

function validate() {
  if (props.hardware.length === 0) {
    errorBanner.value = 'Please add at least one supply item before continuing.'
    return false
  }
  errorBanner.value = ''

  // Validate all cards, track first invalid
  let valid = true
  let firstInvalidEl = null
  for (const [id, cardRef] of Object.entries(cardRefs.value)) {
    if (cardRef && !cardRef.validate()) {
      valid = false
      if (!firstInvalidEl) firstInvalidEl = cardRef.root
    }
  }

  if (!valid) {
    errorBanner.value = 'Some items have incomplete required fields — please review the highlighted items below.'
    if (firstInvalidEl) {
      setTimeout(() => {
        firstInvalidEl.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }, 50)
    }
  }

  return valid
}

defineExpose({ validate })
</script>

<style scoped>
.add-panel {
  border: 1px dashed rgba(26,26,24,0.18);
  border-radius: 3px;
  overflow: hidden;
  transition: border-color 0.2s;
}

.add-panel--open {
  border-color: rgba(196,82,26,0.35);
  border-style: solid;
}

.add-trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  cursor: pointer;
  user-select: none;
  transition: background 0.15s;
}

.add-trigger:hover {
  background: rgba(26,26,24,0.03);
}

.add-trigger-label {
  display: flex;
  align-items: center;
  gap: 10px;
  font-family: var(--font-display);
  font-size: 1.1rem;
  letter-spacing: 0.06em;
  color: var(--stone);
}

.add-icon {
  width: 24px;
  height: 24px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(196,82,26,0.5);
  border-radius: 50%;
  color: var(--rust);
  font-size: 1.1rem;
  line-height: 1;
}

.add-trigger-hint {
  font-size: 0.68rem;
  color: var(--text-muted);
  letter-spacing: 0.08em;
  font-family: var(--font-mono);
}

.supply-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 8px;
  padding: 12px 16px 16px;
  border-top: 1px solid rgba(26,26,24,0.08);
  background: rgba(26,26,24,0.02);
}

.supply-btn {
  display: flex;
  align-items: center;
  padding: 12px 14px;
  background: var(--card-bg);
  border: 1px solid rgba(26,26,24,0.10);
  border-radius: 2px;
  cursor: pointer;
  transition: all 0.15s;
  text-align: left;
}

.supply-btn:hover {
  background: var(--card-bg);
  border-color: var(--btn-accent, var(--rust));
  box-shadow: 0 2px 6px rgba(26,26,24,0.08);
  transform: translateY(-1px);
}

.supply-label {
  font-size: 0.78rem;
  letter-spacing: 0.05em;
  color: var(--text-muted);
  font-family: var(--font-mono);
  line-height: 1.3;
}

.validation-banner {
  margin-top: 12px;
  padding: 12px 16px;
  background: rgba(184,48,48,0.07);
  border: 1px solid rgba(184,48,48,0.25);
  border-radius: 3px;
  font-size: 0.82rem;
  color: #b83030;
  line-height: 1.5;
}

.grand-total {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  margin-bottom: 16px;
  background: rgba(196,82,26,0.05);
  border: 1px solid rgba(196,82,26,0.18);
  border-radius: 3px;
}

.grand-total-label {
  font-size: 0.72rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--text-muted);
}

.grand-total-amount {
  font-family: var(--font-display);
  font-size: 1.4rem;
  color: var(--stone);
  letter-spacing: 0.06em;
}
</style>
