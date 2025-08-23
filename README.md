# 🚀 Shiftpack

**Free and Open Source package and library version migrator for React (based on [jscodeshift](https://github.com/facebook/jscodeshift)).**

Shiftpack helps developers migrate React projects between major versions (e.g., React Router v5 → v6) or update third-party libraries with minimal manual work.  
It provides ready-to-use codemods, so you can quickly apply official or community-recommended migrations.

---

## ✨ Features

- 📦 **Pre-built migrations** for React ecosystem libraries.  
- 🔧 **Codemod powered** by [jscodeshift](https://github.com/facebook/jscodeshift).  
- 📚 **Organized migration collections** by library and version.  
- 🌐 **Community & official migrations**: supports both Shiftpack’s built-in migrations and external recommended codemods.  
- 🛠 **Custom migration support**: extend with your own codemods.

---

## 📂 Repository Structure

Migrations are organized by library and version:

```
shiftpack/
├── react/
│   ├── v5-to-v6/
│   │   ├── useEffectMigration.js
│   │   ├── useRouteMatchMigration.js
│   │   └── ...
│   └── ...
├── redux/
│   ├── v3-to-v4/
│   │   ├── connectToHooks.js
│   │   └── ...
│   └── ...
└── ...
```

- `react/v5-to-v6/useEffectMigration.js` → Example migration for `useEffect` usage in React Router v6.  
- `redux/v3-to-v4/...` → Redux upgrade codemods.  
- Each migration is modular and can be run individually.

---

## 🚀 Getting Started

### 1. Install
```bash
npm install -g shiftpack
```

or use `npx` directly:
```bash
npx shiftpack <options>
```

---

### 2. Run a Migration
```bash
shiftpack migrate react/v5-to-v6/useEffectMigration --path src/
```

You can also apply an entire migration set:
```bash
shiftpack migrate react/v5-to-v6 --path src/
```

---

### 3. Using Official Migrations
If a library provides its own recommended codemods, Shiftpack links them in the repo.  
For example:

- **React Router v6** official codemods → [react-router/codemods](https://github.com/remix-run/react-router/tree/main/packages/codemods)  
- **Redux Toolkit** migration → [reduxjs/redux-toolkit-migration](https://github.com/reduxjs/redux-toolkit)  

---

## 📖 Example

Before (`React Router v5`):
```jsx
import { useRouteMatch } from "react-router-dom";

const Profile = () => {
  const match = useRouteMatch();
  return <Link to={`${match.url}/settings`}>Settings</Link>;
};
```

After running:
```jsx
import { useResolvedPath } from "react-router-dom";

const Profile = () => {
  const match = useResolvedPath("");
  return <Link to={`${match.pathname}/settings`}>Settings</Link>;
};
```

---

## 📌 Roadmap

- [ ] Add more React Router v5 → v6 migrations  
- [ ] Redux migrations  
- [ ] Material UI v4 → v5 codemods  
- [ ] Vue ecosystem support (future)  
- [ ] CLI improvements & interactive mode  

---

## 🤝 Contributing

Contributions are welcome! 🎉  
- Fork the repo  
- Add or improve a migration  
- Open a PR with clear description and tests  

---

## 📜 License

MIT License © 2025 [Shiftpack Contributors](./LICENSE)  
Free to use, modify, and distribute.
