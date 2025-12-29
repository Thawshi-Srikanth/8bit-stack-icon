import { readdir } from 'node:fs/promises'
import { join } from 'node:path'

console.log('Verifying builds...')

const packages = ['react', 'vue', 'svelte']
let success = true

for (const pkg of packages) {
  const dist = join(process.cwd(), 'packages', pkg, 'dist')
  try {
    const files = await readdir(dist)
    if (files.length === 0) throw new Error('Empty dist')

    // Check for specific files
    if (!files.includes('index.js')) throw new Error('Missing index.js')
    if (pkg === 'react' && !files.includes('index.d.ts'))
      throw new Error('Missing index.d.ts')

    console.log(`✅ ${pkg} package verified (${files.length} files)`)
  } catch (e) {
    console.error(`❌ ${pkg} verification failed:`, e.message)
    success = false
  }
}

if (!success) process.exit(1)
