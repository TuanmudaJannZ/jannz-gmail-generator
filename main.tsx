import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { ErrorBoundary } from "./ErrorBoundary";
import { migrate } from "./storage";
import "./index.css";
try { migrate(); } catch (e) { console.error("[JannZ] migrasi gagal, data lama tidak diubah:", e); }
createRoot(document.getElementById("root")!).render(<StrictMode><ErrorBoundary><App /></ErrorBoundary></StrictMode>);
