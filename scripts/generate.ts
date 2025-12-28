import { readdir, mkdir, rm } from "node:fs/promises";
import { join, basename, extname } from "node:path";

const ICONS_DIR = join(process.cwd(), "src/icons");
const OUTPUT_DIR = join(process.cwd(), "src/generated");
const REACT_DIR = join(OUTPUT_DIR, "react");

async function build() {
    console.log("Starting build...");

    // Clean generated
    await rm(OUTPUT_DIR, { recursive: true, force: true });
    await mkdir(REACT_DIR, { recursive: true });

    const files = await readdir(ICONS_DIR);
    const svgFiles = files.filter(f => f.endsWith(".svg"));

    const indexExports: string[] = [];

    for (const file of svgFiles) {
        const name = basename(file, extname(file));
        const pascalName = name
            .replace(/[-_](.)/g, (_, c) => c.toUpperCase())
            .replace(/^(.)/, c => c.toUpperCase()) + "Icon";

        // Read SVG content
        let svgContent = await Bun.file(join(ICONS_DIR, file)).text();

        // Simple SVG cleaning/conversion for React
        // 1. Remove xml declaration
        svgContent = svgContent.replace(/<\?xml.*?\?>/, "");
        // 2. Convert class to className (if any)
        svgContent = svgContent.replace(/class=/g, "className=");
        // 3. Convert kebab-case attributes to camelCase (basic ones)
        svgContent = svgContent.replace(/shape-rendering/g, "shapeRendering");
        svgContent = svgContent.replace(/fill-rule/g, "fillRule");
        svgContent = svgContent.replace(/clip-rule/g, "clipRule");
        svgContent = svgContent.replace(/stroke-width/g, "strokeWidth");
        svgContent = svgContent.replace(/stroke-linecap/g, "strokeLinecap");
        svgContent = svgContent.replace(/stroke-linejoin/g, "strokeLinejoin");

        // Add props spread
        svgContent = svgContent.replace(/<svg(.*?)>/, `<svg$1 {...props}>`);

        const componentContent = `import * as React from "react";
import type { SVGProps } from "react";

export const ${pascalName} = (props: SVGProps<SVGSVGElement>) => (
  ${svgContent}
);
`;

        await Bun.write(join(REACT_DIR, `${pascalName}.tsx`), componentContent);
        indexExports.push(`export { ${pascalName} } from "./react/${pascalName}";`);
        console.log(`Generated ${pascalName}`);
    }

    await Bun.write(join(OUTPUT_DIR, "index.ts"), indexExports.join("\n"));
    console.log("Build complete!");
}

build();
