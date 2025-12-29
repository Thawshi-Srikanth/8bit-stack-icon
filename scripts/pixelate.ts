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

    // Create a 2D grid of colors
    const grid: (string | null)[][] = Array(targetSize).fill(null).map(() => Array(targetSize).fill(null));
    const colors = new Set<string>();

    for (let y = 0; y < targetSize; y++) {
      for (let x = 0; x < targetSize; x++) {
        const idx = (y * targetSize + x) * 4;
        const r = buffer[idx];
        const g = buffer[idx + 1];
        const b = buffer[idx + 2];
        const a = buffer[idx + 3];

        if (a > CONFIG.threshold) {
             const hex = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
             grid[y][x] = hex;
             colors.add(hex);
        }
      }
    }

    // Greedy meshing per color
    // Contour tracing per color
    for (const color of colors) {
      // Edges: key = "x,y", val = [ "x,y" of end point ]
      // We'll treat edges as directed vectors.
      // Top edge of pixel (x,y) is (x,y) -> (x+1,y)
      // Right edge of pixel (x,y) is (x+1,y) -> (x+1,y+1)
      // Bottom edge of pixel (x,y) is (x+1,y+1) -> (x,y+1)
      // Left edge of pixel (x,y) is (x,y+1) -> (x,y)
      
      const edges = new Map<string, string[]>();
      function addEdge(x1: number, y1: number, x2: number, y2: number) {
        const key = `${x1},${y1}`;
        if (!edges.has(key)) edges.set(key, []);
        edges.get(key)!.push(`${x2},${y2}`);
      }

      for (let y = 0; y < targetSize; y++) {
        for (let x = 0; x < targetSize; x++) {
          if (grid[y][x] === color) {
            // Check 4 neighbors
            // Top
            if (y === 0 || grid[y - 1][x] !== color) {
              addEdge(x, y, x + 1, y);
            }
            // Right
            if (x === targetSize - 1 || grid[y][x + 1] !== color) {
              addEdge(x + 1, y, x + 1, y + 1);
            }
            // Bottom
            if (y === targetSize - 1 || grid[y + 1][x] !== color) {
              addEdge(x + 1, y + 1, x, y + 1);
            }
            // Left
            if (x === 0 || grid[y][x - 1] !== color) {
              addEdge(x, y + 1, x, y);
            }
          }
        }
      }

      const paths: string[] = [];
      while (edges.size > 0) {
        // Start a new contour
        const iteratorResult = edges.keys().next();
        if (iteratorResult.done) break;
        
        const startKey = iteratorResult.value;
        const [startX, startY] = startKey.split(',').map(Number);
        
        let currX = startX;
        let currY = startY;
        let d = `M${currX} ${currY}`;
        
        // Trace loop
        do {
          const key = `${currX},${currY}`;
          const nextPoints = edges.get(key);
          
          if (!nextPoints || nextPoints.length === 0) {
              edges.delete(key);
              break; 
          }

          // Pick first available edge (greedy)
          const nextPointStr = nextPoints.shift()!; 
          if (nextPoints.length === 0) {
              edges.delete(key);
          }
          
          const [nextX, nextY] = nextPointStr.split(',').map(Number);
          
          // Simple Line To
          d += `L${nextX} ${nextY}`;

          currX = nextX;
          currY = nextY;
        } while (currX !== startX || currY !== startY);

        d += 'z';
        paths.push(d);
      }
      
      pathMap.set(color, paths);
    }

    // Combine all path commands for each color
    let finalContent = ''
    for (const [color, cmds] of pathMap) {
      finalContent += `<path fill="${color}" fill-rule="evenodd" d="${cmds.join('')}" />`
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
