# 8-bit Stack Icons

A library of 8-bit / pixel-art style icons for popular tech stack technologies.

## Installation

```bash
npm install 8bit-stack-icon
# or
bun add 8bit-stack-icon
# or
yarn add 8bit-stack-icon
# or
pnpm add 8bit-stack-icon
```

## Usage

### React

Icons are available as React components.

```tsx
import { JavascriptIcon, TypescriptIcon } from "8bit-stack-icon";

function App() {
  return (
    <div>
      <JavascriptIcon width={32} height={32} />
      <TypescriptIcon className="my-icon" />
    </div>
  );
}
```

### Raw SVG

You can access the raw SVG files from the `dist/icons` directory (if your bundler supports it) or simply copy them from the package.

```tsx
import jsIconUrl from "8bit-stack-icon/dist/icons/javascript.svg";
```

## Contributing

1. Add new 8-bit SVGs to `src/icons`.
2. Run `bun run build`.

## License

MIT
