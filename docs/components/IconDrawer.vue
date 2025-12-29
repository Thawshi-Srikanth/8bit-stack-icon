<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  isOpen: Boolean,
  icon: Object, // { name: string, component: any }
  onClose: Function
})

const activeTab = ref('react')

// Dynamic import for raw SVG content using Vite's glob import
// This bundles the SVG strings into the JS, removing need for static files
const svgModules = import.meta.glob('../../packages/icons/src/*.svg', { 
  query: '?raw',
  import: 'default',
  eager: false
})

const getSvgContent = async (iconName) => {
  // Construct the key matching the glob pattern
  // Ensure name is lowercase to match filenames
  const key = `../../packages/icons/src/${iconName.toLowerCase()}.svg`
  const loader = svgModules[key]
  if (!loader) {
    console.error(`Missing SVG for ${iconName}. Checked key: ${key}`)
    console.log('Available keys:', Object.keys(svgModules))
    throw new Error(`SVG not found for ${iconName}`)
  }
  return await loader()
}

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
    const text = await getSvgContent(props.icon.name)
    await navigator.clipboard.writeText(text)
    alert('SVG copied to clipboard!')
  } catch (err) {
    console.error('Failed to fetch SVG', err)
    alert('Failed to load SVG content')
  }
}

const downloadSVG = async () => {
  try {
    const text = await getSvgContent(props.icon.name)
    // Create Data URI for download
    const dataUri = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(text)}`
    
    const link = document.createElement('a')
    link.href = dataUri
    link.download = `${props.icon.name}.svg`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  } catch (err) {
    console.error('Failed to download SVG', err)
    alert('Failed to generate download')
  }
}
</script>

<template>
  <div v-if="isOpen" class="drawer-overlay" @click="onClose">
    <div class="drawer-content bottom-sheet" @click.stop>
      <button class="close-btn" @click="onClose">&times;</button>
      
      <div class="drawer-grid">
        <!-- LEFT COLUMN: Actions & Info -->
        <div class="drawer-left">
          <div class="drawer-header">
            <h2>{{ pascalName }}</h2>
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
                   <button class="action-btn" @click="copySVG">Copy SVG Code</button>
                   <button class="action-btn secondary" @click="downloadSVG">Download SVG File</button>
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

        <!-- RIGHT COLUMN: Large Preview -->
        <div class="drawer-right">
           <div class="preview-container">
              <component :is="icon.component" class="large-preview" />
              <div class="preview-label">100x100px</div>
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
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
  z-index: 200;
  display: flex;
  flex-direction: column;
  justify-content: flex-end; /* Align to bottom for bottom-sheet */
}

/* Bottom Sheet Container */
.drawer-content.bottom-sheet {
  width: 100%;
  max-width: 100%;
  background: var(--vp-c-bg); /* Use theme background */
  border-top: 1px solid var(--vp-c-divider);
  box-shadow: 0 -4px 20px rgba(0,0,0,0.3);
  padding: 2rem;
  padding-bottom: 3rem; /* Extra space for safe area */
  position: relative;
  animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  max-height: 80vh;
  overflow-y: auto;
}

@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}

/* Split Layout Grid */
.drawer-grid {
  display: grid;
  grid-template-columns: 1fr 1fr; /* Split 50/50 */
  gap: 2rem;
  max-width: 900px;
  margin: 0 auto;
}

/* Left Column */
.drawer-left {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.drawer-header h2 {
  font-size: 2rem;
  margin-bottom: 1.5rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}

/* Right Column (Icon Preview) */
.drawer-right {
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--vp-c-bg-soft);
  border-radius: 12px;
  padding: 2rem;
  border: 1px solid var(--vp-c-divider);
}

.preview-container {
  text-align: center;
}

.large-preview {
  width: 192px; /* Bigger Icon */
  height: 192px;
  color: var(--vp-c-text-1);
  filter: drop-shadow(0 4px 6px rgba(0,0,0,0.1));
}

.preview-label {
  margin-top: 1rem;
  color: var(--vp-c-text-2);
  font-family: monospace;
  font-size: 0.9rem;
}

/* Close Button */
.close-btn {
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--vp-c-text-1);
  z-index: 10;
  transition: all 0.2s;
}
.close-btn:hover {
  background: var(--vp-c-bg-mute);
}

/* Tabs */
.tabs {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  border-bottom: 2px solid var(--vp-c-divider);
}

.tabs button {
  background: none;
  border: none;
  padding: 0.5rem 0.2rem;
  cursor: pointer;
  font-weight: 600;
  color: var(--vp-c-text-2);
  border-bottom: 2px solid transparent;
  margin-bottom: -2px;
  transition: color 0.2s;
}

.tabs button:hover {
  color: var(--vp-c-text-1);
}

.tabs button.active {
  color: var(--vp-c-brand);
  border-bottom-color: var(--vp-c-brand);
}

.tab-content {
  padding-top: 0.5rem;
}

/* Code Snippet Box */
.code-box {
  position: relative;
  background: #111; /* Darker background for code */
  border: 1px solid #333;
  border-radius: 8px;
  overflow: hidden;
}

.code-box pre {
  padding: 1.2rem;
  padding-right: 3.5rem;
  margin: 0;
  color: #a6accd; /* Better syntax highlighting color base */
  overflow-x: auto;
  font-family: 'Fira Code', monospace;
  font-size: 0.95rem;
  line-height: 1.5;
}

.copy-icon-btn {
  position: absolute;
  top: 0.8rem;
  right: 0.8rem;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  color: #888;
  cursor: pointer;
  padding: 6px;
  border-radius: 6px;
  transition: all 0.2s;
}

.copy-icon-btn:hover {
  color: #fff;
  background: rgba(255, 255, 255, 0.15);
}

/* Actions */
.svg-actions {
    display: flex;
    gap: 1rem;
}

.action-btn {
  padding: 0.6rem 1.2rem;
  background: var(--vp-c-brand);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: opacity 0.2s;
}
.action-btn:hover {
  opacity: 0.9;
}

.action-btn.secondary {
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
  border: 1px solid var(--vp-c-divider);
}
.action-btn.secondary:hover {
  background: var(--vp-c-bg-mute);
}

/* Responsive */
@media (max-width: 768px) {
  .drawer-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  .drawer-right {
    order: -1; /* Icon on top mobile */
    padding: 1.5rem;
  }
}
</style>
