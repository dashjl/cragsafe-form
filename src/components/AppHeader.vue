<template>
  <header class="app-header">
    <div class="header-top">
      <div class="logo-lockup">
        <svg class="logo-icon" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <polygon points="20,4 36,34 4,34" fill="none" stroke="#c4521a" stroke-width="2"/>
          <polygon points="20,10 30,30 10,30" fill="none" stroke="rgba(240,237,230,0.2)" stroke-width="1"/>
          <circle cx="20" cy="26" r="2.5" fill="#c4521a"/>
          <line x1="20" y1="14" x2="20" y2="23" stroke="#c4521a" stroke-width="1.5"/>
        </svg>
        <div>
          <div class="logo-text">CragSafe</div>
          <div class="logo-sub">Foundation</div>
        </div>
      </div>
      <div class="header-badge">Funding Application</div>
    </div>
    <div class="header-rule"></div>
    <p class="header-description">
      Route maintenance hardware reimbursement program. Complete all sections to submit your application for review.
    </p>

    <!-- Progress bar -->
    <div class="progress-section">
      <div class="progress-steps">
        <div
          v-for="(step, i) in steps"
          :key="step.id"
          class="progress-step"
          :class="{ active: currentStep === i, complete: currentStep > i }"
        >
          <div class="step-dot">
            <svg v-if="currentStep > i" viewBox="0 0 12 12" fill="none">
              <path d="M2 6l3 3 5-5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
            <span v-else>{{ i + 1 }}</span>
          </div>
          <div class="step-label">{{ step.label }}</div>
        </div>
      </div>
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: progressPct + '%' }"></div>
      </div>
    </div>
  </header>
</template>

<script setup>
const props = defineProps({
  currentStep: { type: Number, default: 0 },
  steps: { type: Array, default: () => [] },
})

const progressPct = computed(() =>
  props.steps.length > 1
    ? (props.currentStep / (props.steps.length - 1)) * 100
    : 0
)
</script>

<script>
import { computed } from 'vue'
</script>

<style scoped>
.app-header {
  padding: 40px 0 0;
  margin-bottom: 40px;
}

.header-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.logo-lockup {
  display: flex;
  align-items: center;
  gap: 14px;
}

.logo-icon {
  width: 40px;
  height: 40px;
  flex-shrink: 0;
}

.logo-text {
  font-family: var(--font-display);
  font-size: 2rem;
  letter-spacing: 0.08em;
  line-height: 1;
  color: var(--chalk);
}

.logo-sub {
  font-size: 0.65rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--chalk-dim);
  font-family: var(--font-mono);
  margin-top: 2px;
}

.header-badge {
  font-size: 0.65rem;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--rust-light);
  border: 1px solid rgba(196,82,26,0.35);
  padding: 4px 10px;
  border-radius: 2px;
}

.header-rule {
  height: 1px;
  background: linear-gradient(90deg, var(--rust), transparent);
  margin-bottom: 16px;
}

.header-description {
  font-size: 0.85rem;
  color: var(--chalk-dim);
  max-width: 520px;
  line-height: 1.7;
  margin-bottom: 32px;
}

/* Progress */
.progress-section {
  padding-bottom: 8px;
}

.progress-steps {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  position: relative;
}

.progress-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  flex: 1;
}

.step-dot {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 1px solid rgba(240,237,230,0.2);
  background: rgba(240,237,230,0.04);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.72rem;
  color: var(--chalk-dim);
  font-family: var(--font-mono);
  transition: all 0.3s ease;
  position: relative;
  z-index: 1;
}

.progress-step.active .step-dot {
  border-color: var(--rust);
  background: rgba(196,82,26,0.15);
  color: var(--rust-light);
  box-shadow: 0 0 12px rgba(196,82,26,0.3);
}

.progress-step.complete .step-dot {
  border-color: var(--moss);
  background: var(--moss);
  color: #8ab870;
}

.step-label {
  font-size: 0.62rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--chalk-dim);
  text-align: center;
  transition: color 0.3s;
}

.progress-step.active .step-label {
  color: var(--chalk);
}

.progress-bar {
  height: 2px;
  background: rgba(240,237,230,0.08);
  border-radius: 1px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--rust), var(--rust-light));
  border-radius: 1px;
  transition: width 0.4s ease;
}
</style>
