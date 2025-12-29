<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  isOpen: Boolean,
  icon: Object, // { name: string, component: any }
  onClose: Function
})

const activeTab = ref('react')

const pascalName = computed(() => {
  if (!props.icon) return ''
  return props.icon.name.charAt(0).toUpperCase() + props.icon.name.slice(1)
})

const snippets = computed(() => {
  if (!props.icon) return {}
  const name = pascalName.value
  return {
    react: `import { ${name}Icon } from '@8bit-icon/react';\n\n<${name}Icon />`,
    vue: `import { ${name}Icon } from '@8bit-icon/vue';\n\n<${name}Icon />`,
    svelte: `import { ${name}Icon } from '@8bit-icon/svelte';\n\n<${name}Icon />`
  }
})

const copySnippet = async (text) => {
  try {
    await navigator.clipboard.writeText(text)
    alert('Copied to clipboard!')
  } catch (err) {
    console.error('Failed to copy', err)
  }
}

const copySVG = async () => {
  try {
    const res = await fetch(`/icons/${props.icon.name}.svg`)
    const text = await res.text()
    await navigator.clipboard.writeText(text)
    alert('SVG copied to clipboard!')
  } catch (err) {
    console.error('Failed to fetch SVG', err)
  }
}

const downloadSVG = async () => {
  const link = document.createElement('a')
  link.href = `/icons/${props.icon.name}.svg`
  link.download = `${props.icon.name}.svg`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
</script>

<template>
  <div v-if="isOpen" class="drawer-overlay" @click="onClose">
    <div class="drawer-content" @click.stop>
      <button class="close-btn" @click="onClose">&times;</button>
      
      <div class="drawer-header">
        <h2>{{ pascalName }}</h2>
      </div>

      <div class="drawer-body">
        <div class="preview-section">
            <component :is="icon.component" class="large-preview" />
        </div>

        <div class="actions-section">
          <div class="tabs">
            <button 
              v-for="tab in ['react', 'vue', 'svelte', 'svg']" 
              :key="tab"
              :class="{ active: activeTab === tab }"
              @click="activeTab = tab"
            >
              {{ tab.toUpperCase() }}
            </button>
          </div>

          <div class="tab-content">
            <template v-if="activeTab === 'svg'">
               <div class="svg-actions">
                 <button class="action-btn" @click="copySVG">Copy SVG</button>
                 <button class="action-btn" @click="downloadSVG">Download SVG</button>
               </div>
            </template>
            <template v-else>
              <div class="code-box">
                <button class="copy-icon-btn" @click="copySnippet(snippets[activeTab])" title="Copy">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                  </svg>
                </button>
                <pre><code>{{ snippets[activeTab] }}</code></pre>
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.drawer-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  z-index: 100;
  display: flex;
  justify-content: flex-end; /* Slide from right */
}

.drawer-content {
  width: 100%;
  max-width: 400px;
  background: var(--vp-c-bg);
  height: 100%;
  padding: 2rem;
  box-shadow: -4px 0 12px rgba(0,0,0,0.2);
  display: flex;
  flex-direction: column;
  position: relative;
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
}

.close-btn {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  font-size: 2rem;
  cursor: pointer;
  color: var(--vp-c-text-1);
}

.large-preview {
  width: 128px;
  height: 128px;
  margin: 2rem auto;
  display: block;
  color: var(--vp-c-text-1);
}

.tabs {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  border-bottom: 1px solid var(--vp-c-divider);
}

.tabs button {
  background: none;
  border: none;
  padding: 0.5rem 1rem;
  cursor: pointer;
  font-weight: bold;
  color: var(--vp-c-text-2);
  border-bottom: 2px solid transparent;
}

.tabs button.active {
  color: var(--vp-c-brand);
  border-bottom-color: var(--vp-c-brand);
}

.tab-content {
  background: var(--vp-c-bg-soft);
  padding: 1rem;
  border-radius: 8px;
}

pre {
  margin: 0;
  white-space: pre-wrap;
}

.action-btn {
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background: var(--vp-c-brand);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.svg-actions {
    display: flex;
    gap: 1rem;
}

.code-box {
  position: relative;
  background: #1e1e1e;
  border-radius: 6px;
  overflow: hidden;
}

.code-box pre {
  padding: 1rem;
  padding-right: 3rem; /* Space for copy button */
  margin: 0;
  color: #d4d4d4;
  overflow-x: auto;
  font-family: monospace;
}

.copy-icon-btn {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: transparent;
  border: none;
  color: #888;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: color 0.2s, background 0.2s;
}

.copy-icon-btn:hover {
  color: #fff;
  background: rgba(255, 255, 255, 0.1);
}
</style>
