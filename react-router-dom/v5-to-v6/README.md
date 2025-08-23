# 🚦 React Router DOM Migration Guide (v5 → v6)

React Router v6 introduces **major breaking changes** compared to v5.  
Below are the key differences and migration steps you need to know.

---

## 🔑 API Changes

### 1. `Switch` → `Routes`
- In v5:
  ```tsx
  <Switch>
    <Route path="/about" component={About} />
    <Route path="/dashboard" component={Dashboard} />
  </Switch>
  ```
- In v6:
  ```tsx
  <Routes>
    <Route path="/about" element={<About />} />
    <Route path="/dashboard" element={<Dashboard />} />
  </Routes>
  ```

---

### 2. `component` / `render` props removed → use `element`
- In v5:
  ```tsx
  <Route path="/about" component={About} />
  ```
- In v6:
  ```tsx
  <Route path="/about" element={<About />} />
  ```

---

### 3. `useHistory` → `useNavigate`
- In v5:
  ```tsx
  const history = useHistory();
  history.push("/home");
  ```
- In v6:
  ```tsx
  const navigate = useNavigate();
  navigate("/home");
  ```

---

### 4. `useRouteMatch` → `useMatch`
- In v5:
  ```tsx
  const match = useRouteMatch("/about");
  if (match) console.log(match.url);
  ```
- In v6:
  ```tsx
  const match = useMatch("/about");
  if (match) console.log(match.pathnameBase);
  ```

---

### 5. `Redirect` → `Navigate`
- In v5:
  ```tsx
  <Redirect to="/login" />
  ```
- In v6:
  ```tsx
  <Navigate to="/login" />
  ```

---

### 6. Nested Routes & `../` relative navigation
- In v6 you can define routes inside parent `<Route>`:
  ```tsx
  <Routes>
    <Route path="dashboard" element={<Dashboard />}>
      <Route path="stats" element={<Stats />} />
    </Route>
  </Routes>
  ```
- Navigate relative to the current route:
  ```tsx
  navigate("../profile");
  ```

---

### 7. `exact` is gone
- In v5:
  ```tsx
  <Route exact path="/about" component={About} />
  ```
- In v6, all routes are **exact by default**:
  ```tsx
  <Route path="/about" element={<About />} />
  ```

---

### 8. `withRouter` removed → use hooks
- Replace `withRouter` HOC with hooks like:
  - `useParams()`
  - `useNavigate()`
  - `useLocation()`
  - `useMatch()`

---

### 9. Programmatic Route Creation (`createBrowserRouter`)
- v6 introduces a new **data router API**:
  ```tsx
  import {
    createBrowserRouter,
    RouterProvider,
  } from "react-router-dom";

  const router = createBrowserRouter([
    {
      path: "/",
      element: <Root />,
      children: [
        { path: "about", element: <About /> },
        { path: "dashboard", element: <Dashboard /> },
      ],
    },
  ]);

  export function App() {
    return <RouterProvider router={router} />;
  }
  ```

---

## 📝 Migration Checklist
- [ ] Replace all `<Switch>` with `<Routes>`.
- [ ] Change `component` / `render` to `element`.
- [ ] Replace `useHistory()` with `useNavigate()`.
- [ ] Replace `useRouteMatch()` with `useMatch()`.
- [ ] Update `Redirect` to `Navigate`.
- [ ] Remove `exact` (not needed).
- [ ] Convert nested routes properly.
- [ ] Remove `withRouter`, use hooks instead.
- [ ] Consider migrating to the new `createBrowserRouter` API if using data loaders/actions.

---

✅ After applying these changes step by step, your project will be fully compatible with **React Router v6**.
