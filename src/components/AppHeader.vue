<template>
  <header class="app-header">
    <div class="header-top">
      <div class="logo-lockup">
        <img src="/logo-invert.png" alt="CragSafe British Columbia" class="logo-img" />
        <div class="logo-text">CragSafe</div>
      </div>
      <div class="header-badge">Funding Application</div>
    </div>
    <div class="header-rule"></div>

    <!-- Before You Begin — shown only on step 0 -->
    <div v-if="currentStep === 0" class="prereq-block">
      <h2 class="prereq-heading">Before You Begin</h2>
      <p class="prereq-intro">Please have the following ready before starting your application:</p>
      <ol class="prereq-list">
        <li>The route work must be completed before applying</li>
        <li>A complete list of hardware used for the project</li>
        <li>Digital copies of receipts for all hardware purchased</li>
        <li>An updated <a href="https://www.mountainproject.com" target="_blank" rel="noopener">Mountain Project</a> route page with all route details (name, grade, first ascent, height, description, and protection)</li>
      </ol>
    </div>

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
import { computed } from 'vue'

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

<style scoped>
.app-header {
  background: var(--card-bg);
  border: 1px solid rgba(26,26,24,0.09);
  border-radius: 6px;
  padding: 28px 28px 0;
  margin-bottom: 48px;
  box-shadow: 0 1px 4px rgba(26,26,24,0.06);
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

.logo-img {
  width: 52px;
  height: 52px;
  flex-shrink: 0;
  object-fit: contain;
}

.logo-text {
  font-family: var(--font-display);
  font-size: 2rem;
  letter-spacing: 0.08em;
  line-height: 1;
  color: var(--stone);
}

.header-badge {
  font-size: 0.65rem;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--rust);
  border: 1px solid rgba(196,82,26,0.35);
  padding: 4px 10px;
  border-radius: 2px;
}

.header-rule {
  height: 1px;
  background: linear-gradient(90deg, var(--rust), rgba(196,82,26,0.1), transparent);
  margin-bottom: 24px;
}

/* Before You Begin */
.prereq-block {
  background: rgba(212, 146, 10, 0.06);
  border: 1px solid rgba(212, 146, 10, 0.22);
  border-radius: 4px;
  padding: 20px 24px;
  margin-bottom: 28px;
}

.prereq-heading {
  font-family: var(--font-display);
  font-size: 1.1rem;
  letter-spacing: 0.06em;
  color: #a07010;
  margin: 0 0 8px;
}

.prereq-intro {
  font-size: 0.85rem;
  color: var(--text-muted);
  margin: 0 0 10px;
}

.prereq-list {
  margin: 0;
  padding-left: 20px;
  font-size: 0.85rem;
  color: var(--text-muted);
  line-height: 1.7;
}

.prereq-list li {
  margin-bottom: 4px;
}

.prereq-list li:last-child {
  margin-bottom: 0;
}

.prereq-list a {
  color: var(--sky);
  text-decoration: underline;
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
  border: 1px solid rgba(26,26,24,0.18);
  background: rgba(26,26,24,0.03);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.72rem;
  color: var(--text-muted);
  font-family: var(--font-mono);
  transition: all 0.3s ease;
  position: relative;
  z-index: 1;
}

.progress-step.active .step-dot {
  border-color: var(--rust);
  background: rgba(196,82,26,0.10);
  color: var(--rust);
  box-shadow: 0 0 10px rgba(196,82,26,0.18);
}

.progress-step.complete .step-dot {
  border-color: var(--moss);
  background: var(--moss);
  color: #4a7a30;
}

.step-label {
  font-size: 0.62rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text-muted);
  text-align: center;
  transition: color 0.3s;
}

.progress-step.active .step-label {
  color: var(--stone);
}

.progress-bar {
  height: 2px;
  background: rgba(26,26,24,0.08);
  border-radius: 1px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--rust), var(--rust-light));
  border-radius: 1px;
  transition: width 0.4s ease;
}

@media (max-width: 480px) {
  .app-header {
    padding: 16px 16px 0;
  }

  .header-top {
    flex-wrap: wrap;
    gap: 8px;
  }

  .logo-text {
    font-size: 1.5rem;
  }

  .header-badge {
    align-self: center;
    font-size: 0.55rem;
    padding: 3px 8px;
  }

  .prereq-block {
    padding: 14px 16px;
  }
}
</style>
