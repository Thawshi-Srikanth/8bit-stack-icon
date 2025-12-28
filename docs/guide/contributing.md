# Contributing to 8-bit Stack Icons

We welcome contributions! The goal is to have an 8-bit representation of every tech stack logo.

## 1. Project Setup
Prerequisites: [Bun](https://bun.sh/).

```bash
# Clone the repo
git clone https://github.com/your-username/8bit-stack-icon.git
cd 8bit-stack-icon

# Install dependencies
bun install
```

## 2. Adding an Icon
1. Design or find an 8-bit SVG.
   - Recommended grid: 16x16 or 32x32.
   - Aim for a pixel-art look (sharp edges).
2. Save it to `packages/icons/src/<icon-name>.svg`.
   - Use kebab-case (e.g., `react-query.svg`).
3. Run the build to verify generation:
   ```bash
   bun run build
   ```

## 3. Verify
You can view your new icon in the documentation site:
```bash
bun run docs:dev
```
Open the provided localhost URL and navigate to "Icons".

## 4. Pull Request
Commit your changes and open a PR!
