import { readdir, mkdir, rm } from "node:fs/promises";
import { join, basename, extname } from "node:path";

const ROOT_DIR = process.cwd();
const PACKAGES_DIR = join(ROOT_DIR, "packages");
const ICONS_SOURCE_DIR = join(PACKAGES_DIR, "icons", "src");

// Helpers
const toPascalCase = (str: string) =>
    str.replace(/[-_](.)/g, (_, c) => c.toUpperCase())
        .replace(/^(.)/, c => c.toUpperCase());

const cleanSvg = (svg: string) => {
    return svg
        .replace(/<\?xml.*?\?>/, "")
        .replace(/width=".*?"/, "")
        .replace(/height=".*?"/, "");
};

async function buildReact(name: string, svg: string) {
    const componentName = `${toPascalCase(name)}Icon`;
    // React-specific cleanup
    let content = cleanSvg(svg)
        .replace(/class=/g, "className=")
        .replace(/shape-rendering/g, "shapeRendering")
        .replace(/fill-rule/g, "fillRule")
        .replace(/clip-rule/g, "clipRule")
        .replace(/stroke-width/g, "strokeWidth")
        .replace(/stroke-linecap/g, "strokeLinecap")
        .replace(/stroke-linejoin/g, "strokeLinejoin")
        .replace(/<svg(.*?)>/, `<svg$1 {...props}>`);

    return {
        fileName: `${componentName}.tsx`,
        code: `import * as React from "react";
import type { SVGProps } from "react";

export const ${componentName} = (props: SVGProps<SVGSVGElement>) => (
  ${content}
);`
    };
}

async function buildVue(name: string, svg: string) {
    const componentName = `${toPascalCase(name)}Icon`;
    const content = cleanSvg(svg).replace(/<svg(.*?)>/, `<svg$1 v-bind="$attrs">`);

    return {
        fileName: `${componentName}.vue`,
        code: `<template>
${content}
</template>
<script>
export default {
  name: "${componentName}"
}
</script>`
    };
}

async function buildSvelte(name: string, svg: string) {
    const componentName = `${toPascalCase(name)}Icon`;
    const content = cleanSvg(svg).replace(/<svg(.*?)>/, `<svg$1 {...$$props}>`);

    return {
        fileName: `${componentName}.svelte`,
        code: `${content}`
    };
}

async function build() {
    console.log("Starting Build...");

    const files = await readdir(ICONS_SOURCE_DIR);
    const svgFiles = files.filter(f => f.endsWith(".svg"));

    const targets = [
        { name: "react", fn: buildReact, ext: "tsx" },
        { name: "vue", fn: buildVue, ext: "vue" },
        { name: "svelte", fn: buildSvelte, ext: "svelte" },
    ];

    for (const target of targets) {
        console.log(`Building for ${target.name}...`);
        const outDir = join(PACKAGES_DIR, target.name, "dist");

        // Reset dist
        await rm(outDir, { recursive: true, force: true });
        await mkdir(outDir, { recursive: true });

        const indexExports: string[] = [];

        for (const file of svgFiles) {
            // Re-read file content inside the loop or reuse if optimal, strictly per-target here to avoid mutation issues
            // Actually reading once is fine as strings are immutable.
            let svgContent = await Bun.file(join(ICONS_SOURCE_DIR, file)).text();
            const name = basename(file, extname(file));

            const { fileName, code } = await target.fn(name, svgContent);
            await Bun.write(join(outDir, fileName), code);

            const componentName = fileName.replace(extname(fileName), "");

            if (target.name === "vue") {
                indexExports.push(`export { default as ${componentName} } from "./${fileName}";`);
            } else {
                indexExports.push(`export { ${componentName} } from "./${componentName}";`);
            }
        }

        // Write index
        if (target.name === "react") {
            await Bun.write(join(outDir, "index.ts"), indexExports.join("\n"));
            console.log("Compiling React TypeScript...");
            const proc = Bun.spawn(["bun", "x", "tsc"], {
                cwd: join(PACKAGES_DIR, "react"),
                stdout: "inherit",
                stderr: "inherit"
            });
            await proc.exited;
        } else {
            await Bun.write(join(outDir, "index.js"), indexExports.join("\n"));
            await Bun.write(join(outDir, "index.d.ts"), indexExports.join("\n").replace(/\.vue/g, "").replace(/\.svelte/g, ""));
        }
    }

    console.log("Build Complete!");
}

build();
