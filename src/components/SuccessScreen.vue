<template>
  <div class="success-screen">
    <div class="success-icon">
      <svg viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
        <polygon points="30,6 54,51 6,51" fill="none" stroke="#4a5c3a" stroke-width="2"/>
        <path d="M21 30l6 6 12-12" stroke="#8ab870" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </div>
    <h2 class="success-title">Application Submitted</h2>
    <p class="success-id">Reference: <span>{{ applicationId }}</span></p>
    <p class="success-message">
      Your funding application has been received. Our next review is for applications submitted
      from <strong>{{ quarter.start }}</strong> to <strong>{{ quarter.end }}</strong>,
      and we will respond by <strong>{{ quarter.response }}</strong>.
    </p>
    <div class="success-details">
      <div class="detail-row">
        <span>Mountain Project</span>
        <span class="mp-link"><a :href="mountainProjectUrl" target="_blank" rel="noopener">View Route →</a></span>
      </div>
      <div class="detail-row">
        <span>Hardware Items</span>
        <span>{{ itemCount }}</span>
      </div>
      <div class="detail-row">
        <span>Estimated Cost</span>
        <span>{{ totalCost }}</span>
      </div>
    </div>
    <button class="btn btn-secondary" @click="$emit('reset')">Submit Another Application</button>
  </div>
</template>

<script setup>
import { computed } from 'vue'

defineProps({
  applicationId: String,
  email: String,
  mountainProjectUrl: String,
  itemCount: Number,
  totalCost: String,
})
defineEmits(['reset'])

const quarter = computed(() => {
  const now = new Date()
  const month = now.getMonth() // 0-indexed
  const y = now.getFullYear()
  if (month <= 2)  return { start: `January 1, ${y}`,  end: `March 31, ${y}`,     response: `April 30, ${y}`   }
  if (month <= 5)  return { start: `April 1, ${y}`,    end: `June 30, ${y}`,      response: `July 31, ${y}`    }
  if (month <= 8)  return { start: `July 1, ${y}`,     end: `September 30, ${y}`, response: `October 31, ${y}` }
                   return { start: `October 1, ${y}`,  end: `December 31, ${y}`,  response: `January 31, ${y + 1}` }
})
</script>

<style scoped>
.success-screen {
  text-align: center;
  padding: 60px 0 40px;
}

.success-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto 24px;
}

.success-title {
  font-family: var(--font-display);
  font-size: 2.4rem;
  letter-spacing: 0.06em;
  margin-bottom: 8px;
  color: var(--chalk);
}

.success-id {
  font-size: 0.75rem;
  color: var(--chalk-dim);
  letter-spacing: 0.1em;
  margin-bottom: 20px;
}

.success-id span {
  color: var(--rust-light);
  font-family: var(--font-mono);
}

.success-message {
  font-size: 0.88rem;
  color: var(--chalk-dim);
  max-width: 440px;
  margin: 0 auto 32px;
  line-height: 1.7;
}

.success-message strong {
  color: var(--chalk);
}

.success-details {
  border: 1px solid rgba(240,237,230,0.1);
  border-radius: 2px;
  max-width: 360px;
  margin: 0 auto 32px;
  overflow: hidden;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  padding: 10px 16px;
  font-size: 0.82rem;
  border-bottom: 1px solid rgba(240,237,230,0.06);
}

.detail-row:last-child { border-bottom: none; }

.detail-row span:first-child {
  color: var(--chalk-dim);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  font-size: 0.7rem;
}

.detail-row span:last-child {
  color: var(--chalk);
}

.mp-link a {
  color: var(--sky-light, #7ab8d4);
  text-decoration: underline;
}
</style>
