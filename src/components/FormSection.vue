<template>
  <section class="form-section">
    <div class="section-header">
      <div class="section-title-row">
        <h2 class="section-title">{{ title }}</h2>
        <slot name="badge" />
      </div>
      <p v-if="description" class="section-description">{{ description }}</p>
    </div>
    <div class="section-body">
      <slot />
    </div>
  </section>
</template>

<script setup>
defineProps({
  title: String,
  description: String,
})
</script>

<style scoped>
.form-section {
  margin-bottom: 12px;
}

.section-header {
  margin-bottom: 24px;
  padding-bottom: 14px;
  border-bottom: var(--border);
}

.section-title-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.section-title {
  font-family: var(--font-display);
  font-size: 1.6rem;
  letter-spacing: 0.06em;
  color: var(--chalk);
}

.section-description {
  font-size: 0.82rem;
  color: var(--chalk-dim);
  margin-top: 6px;
  font-family: var(--font-mono);
}

.section-body {
  padding: 0 0 8px;
}
</style>
