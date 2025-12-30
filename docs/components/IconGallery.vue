<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import * as Icons from '@8bit-stack-icon/vue'
import IconDrawer from './IconDrawer.vue'

const isDrawerOpen = ref(false)
const selectedIcon = ref(null)

const openDrawer = (icon) => {
  selectedIcon.value = icon
  isDrawerOpen.value = true
}

const closeDrawer = () => {
  isDrawerOpen.value = false
  selectedIcon.value = null
}

const searchQuery = ref('')

const allIcons = Object.keys(Icons).map((name) => ({
  name: name.replace(/Icon$/, ''),
  component: Icons[name],
}))

const filteredIconList = computed(() => {
  return allIcons.filter((icon) =>
    icon.name.toLowerCase().includes(searchQuery.value.toLowerCase()),
  )
})

// Pagination / Infinite Scroll
const pageSize = 60
const currentPage = ref(1)
const displayedIcons = ref([])
const sentinel = ref(null)

const updateDisplayedIcons = () => {
  const end = currentPage.value * pageSize
  displayedIcons.value = filteredIconList.value.slice(0, end)
}

watch(filteredIconList, () => {
  currentPage.value = 1
  updateDisplayedIcons()
  // Reset scroll or similar if needed, but usually just resetting page is enough
})

watch(currentPage, () => {
  updateDisplayedIcons()
})

const observer = new IntersectionObserver((entries) => {
  if (entries[0].isIntersecting) {
    if (displayedIcons.value.length < filteredIconList.value.length) {
      currentPage.value++
    }
  }
})

onMounted(() => {
  updateDisplayedIcons()
  if (sentinel.value) {
    observer.observe(sentinel.value)
  }
})
</script>

<template>
  <div class="gallery-container">
    <div class="search-bar">
      <input
        v-model="searchQuery"
        placeholder="Search icons..."
        class="search-input"
      />
    </div>

    <div class="icon-grid">
      <div v-for="icon in displayedIcons" :key="icon.name" class="icon-card" @click="openDrawer(icon)">
        <div class="icon-preview">
          <component :is="icon.component" :width="32" :height="32" />
        </div>
        <div class="icon-name">{{ icon.name }}</div>
      </div>
    </div>
    <div ref="sentinel" class="sentinel"></div>

    <IconDrawer :isOpen="isDrawerOpen" :icon="selectedIcon" :onClose="closeDrawer" />
  </div>
</template>

<style scoped>
.gallery-container {
  margin-top: 2rem;
}
.search-input {
  width: 100%;
  padding: 10px;
  border: 1px solid #444;
  border-radius: 8px;
  background: var(--vp-c-bg-alt);
  color: var(--vp-c-text-1);
  margin-bottom: 2rem;
}
.icon-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 1rem;
}
.icon-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}
.icon-card:hover {
  background: var(--vp-c-bg-soft);
  transform: translateY(-2px);
}
.icon-preview {
  margin-bottom: 0.5rem;
  color: var(--vp-c-brand);
}
.icon-name {
  font-size: 0.8rem;
  color: var(--vp-c-text-2);
}
.sentinel {
  height: 20px;
  width: 100%;
}
</style>
