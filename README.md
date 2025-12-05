# 🔮 Virtual Tokens

A modern web application for automatically generating virtual tokens from electrical appliance part numbers.

## 🚀 Technologies Used

| Technology        | Purpose                                                |
| ----------------- | ------------------------------------------------------ |
| ⚡ **Vite**       | Fast build tool and development server                 |
| ⚛️ **React**      | Modern UI library for building user interfaces         |
| 📘 **TypeScript** | Type-safe JavaScript for better development experience |
| 🐻 **Zustand**    | Lightweight state management solution                  |
| 🛡️ **Zod**        | Schema validation and TypeScript-first type inference  |
| 🎨 **Chakra UI**  | Accessible and modular component library               |
| 🔧 **Biome**      | Fast formatter and linter for web projects             |

## ✨ Features

-   🎯 **Automatic Token Generation** - Convert part numbers to virtual tokens seamlessly
-   📱 **Responsive Design** - Works perfectly on all devices
-   🎨 **Beautiful UI** - Clean and modern interface powered by Chakra UI
-   🔒 **Type Safety** - Full TypeScript support with Zod validation
-   ⚡ **Blazing Fast** - Optimized performance with Vite
-   🧩 **Modular Architecture** - Well-structured and maintainable codebase

## 🛠️ Development

### Prerequisites

-   Node.js (version 19.2 or higher)
-   npm or yarn package manager

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd virtual-tokens

# Install dependencies
npm install

# Start development server
npm run dev
```

<br><br>

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

-   [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
-   [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
	globalIgnores(["dist"]),
	{
		files: ["**/*.{ts,tsx}"],
		extends: [
			// Other configs...

			// Remove tseslint.configs.recommended and replace with this
			tseslint.configs.recommendedTypeChecked,
			// Alternatively, use this for stricter rules
			tseslint.configs.strictTypeChecked,
			// Optionally, add this for stylistic rules
			tseslint.configs.stylisticTypeChecked,

			// Other configs...
		],
		languageOptions: {
			parserOptions: {
				project: ["./tsconfig.node.json", "./tsconfig.app.json"],
				tsconfigRootDir: import.meta.dirname,
			},
			// other options...
		},
	},
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from "eslint-plugin-react-x"
import reactDom from "eslint-plugin-react-dom"

export default defineConfig([
	globalIgnores(["dist"]),
	{
		files: ["**/*.{ts,tsx}"],
		extends: [
			// Other configs...
			// Enable lint rules for React
			reactX.configs["recommended-typescript"],
			// Enable lint rules for React DOM
			reactDom.configs.recommended,
		],
		languageOptions: {
			parserOptions: {
				project: ["./tsconfig.node.json", "./tsconfig.app.json"],
				tsconfigRootDir: import.meta.dirname,
			},
			// other options...
		},
	},
])
````
