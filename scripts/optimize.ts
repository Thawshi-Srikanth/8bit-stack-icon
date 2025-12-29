import { optimize } from 'svgo';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

async function main() {
  const [targetDir] = process.argv.slice(2);

  if (!targetDir) {
    console.error('Usage: bun run scripts/optimize.ts <target_dir>');
    process.exit(1);
  }

  console.log(`Optimizing SVGs in: ${targetDir}`);

  const files = await readdir(targetDir);
  const svgFiles = files.filter((f) => f.endsWith('.svg'));

  let savedBytes = 0;

  for (const file of svgFiles) {
    const filePath = join(targetDir, file);
    const content = await readFile(filePath, 'utf-8');

    try {
      const result = optimize(content, {
        path: filePath,
        multipass: true, // Enable multipass for better optimization
        plugins: [
          'preset-default',
          'removeDimensions', // We want specific width/height usually? Wait, pixelate script adds width/height. SVGO might remove them if viewBox present. Let's keep them if needed, or remove. 
          // The current SVGs have width="1em" height="1em". 'removeDimensions' removes width/height attributes if viewBox is present.
          // Let's stick to preset-default which is usually safe.
          // Actually, let's explicitly enable convertPathData to ensure merging.
          {
            name: 'convertPathData',
            params: {
                forceAbsolutePath: false,
                utilizeAbsolute: false,
            }
          }
        ],
      });

      // The optimize function returns an object with a data property containing the optimized SVG string
      if ('data' in result) {
          const optimizedContent = result.data;
          const originalSize = content.length;
          const optimizedSize = optimizedContent.length;
          savedBytes += originalSize - optimizedSize;
    
          await writeFile(filePath, optimizedContent);
          // console.log(`Optimized ${file}: ${originalSize} -> ${optimizedSize} bytes`);
      } else {
           console.error(`Failed to optimize ${file}:`, result);
      }

    } catch (error) {
      console.error(`Error optimizing ${file}:`, error);
    }
  }

  console.log(`Optimization complete.`);
  console.log(`Total saved: ${(savedBytes / 1024).toFixed(2)} KB`);
}

main();
