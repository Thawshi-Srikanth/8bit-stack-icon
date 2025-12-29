import { readdir, mkdir } from 'node:fs/promises'
import { join, basename } from 'node:path'

const ICONS_SRC_DIR = join(import.meta.dir, '../packages/icons/src')
const DOCS_PUBLIC_ICONS_DIR = join(import.meta.dir, '../docs/public/icons')

async function main() {
  console.log(`Syncing icons from ${ICONS_SRC_DIR} to ${DOCS_PUBLIC_ICONS_DIR}`)

  // Ensure output dir exists
  await mkdir(DOCS_PUBLIC_ICONS_DIR, { recursive: true })

  const files = await readdir(ICONS_SRC_DIR)
  const svgFiles = files.filter((f) => f.endsWith('.svg'))

  for (const file of svgFiles) {
    const srcPath = join(ICONS_SRC_DIR, file)
    const destPath = join(DOCS_PUBLIC_ICONS_DIR, file)
    
    // Copy file using Bun
    const content = await Bun.file(srcPath).arrayBuffer()
    await Bun.write(destPath, content)
  }

  console.log(`Synced ${svgFiles.length} icons.`)
}

main().catch(console.error)
