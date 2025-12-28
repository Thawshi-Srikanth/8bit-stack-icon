import { JavascriptIcon, TypescriptIcon } from "./dist/index.js";
import { renderToStaticMarkup } from "react-dom/server";

console.log("Testing imports...");

const jsApi = renderToStaticMarkup(JavascriptIcon({ width: 32, height: 32 }));
console.log("JS Icon render:", jsApi.slice(0, 50) + "...");

const tsApi = renderToStaticMarkup(TypescriptIcon({ className: "foo" }));
console.log("TS Icon render:", tsApi.slice(0, 50) + "...");

if (jsApi.includes("svg") && tsApi.includes("svg")) {
    console.log("SUCCESS: Icons rendered as SVGs");
} else {
    console.error("FAILURE: Icons did not render correctly");
    process.exit(1);
}
