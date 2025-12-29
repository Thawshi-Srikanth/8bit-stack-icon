import sharp from 'sharp'
import { join, basename, extname } from 'node:path'
import { readdir } from 'node:fs/promises'

/**
 * Configuration for the pixelation process
 */
const CONFIG = {
  targetSize: 100, 
  threshold: 128,
}

/**
 * Converts an SVG to a pixelated SVG
 */
async function pixelateFile(inputPath: string, outputPath: string) {
  try {
    const buffer = await sharp(inputPath)
      .resize(CONFIG.targetSize, CONFIG.targetSize, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .ensureAlpha()
      .raw()
      .toBuffer()

    const pathMap = new Map<string, string[]>()
    
    const { targetSize } = CONFIG

    for (let y = 0; y < targetSize; y++) {
      let currentHex: string | null = null
      let startX = 0

      for (let x = 0; x < targetSize; x++) {
        const idx = (y * targetSize + x) * 4
        const r = buffer[idx]
        const g = buffer[idx + 1]
        const b = buffer[idx + 2]
        const a = buffer[idx + 3]
        
        // Determine hex color for this pixel (null if transparent)
        let hex: string | null = null
        if (a > CONFIG.threshold) {
             hex = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`
        }

        // If color changes, end the previous run
        if (hex !== currentHex) {
          if (currentHex !== null) {
            const width = x - startX
            // Add horizontal rect path: M startX y h width v 1 h -width z
            const cmd = `M${startX} ${y}h${width}v1h-${width}z`
            if (!pathMap.has(currentHex)) pathMap.set(currentHex, [])
            pathMap.get(currentHex)!.push(cmd)
          }
          currentHex = hex
          startX = x
        }
      }

      // End of row: flush the last run if it exists
      if (currentHex !== null) {
        const width = targetSize - startX
        const cmd = `M${startX} ${y}h${width}v1h-${width}z`
        if (!pathMap.has(currentHex)) pathMap.set(currentHex, [])
        pathMap.get(currentHex)!.push(cmd)
      }
    }

    // Combine all path commands for each color
    let finalContent = ''
    for (const [color, cmds] of pathMap) {
      finalContent += `<path fill="${color}" d="${cmds.join('')}" />`
    }

    const finalSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${targetSize} ${targetSize}" width="1em" height="1em">${finalContent}</svg>`
    await Bun.write(outputPath, finalSvg)
    console.log(`Generated: ${basename(outputPath)}`)
  } catch (error) {
    console.error(`Error processing ${inputPath}:`, error)
  }
}

async function main() {
  const [inputDir, outputDir] = process.argv.slice(2)

  if (!inputDir || !outputDir) {
    console.error('Usage: bun run scripts/pixelate.ts <input_dir> <output_dir>')
    process.exit(1)
  }

  // Ensure output dir exists (or rely on user/build script, but safe to check)
  // Bun.write auto-creates dirs? No, usually not. But we assume structure exists per plan.

  console.log(`Reading from: ${inputDir}`)
  console.log(`Writing to: ${outputDir}`)

  const files = await readdir(inputDir)
  const svgFiles = files.filter((f) => f.endsWith('.svg'))

  for (const file of svgFiles) {
    const inputPath = join(inputDir, file)
    const outputPath = join(outputDir, file)
    await pixelateFile(inputPath, outputPath)
  }

  console.log(`Processed ${svgFiles.length} icons.`)
}

main()
