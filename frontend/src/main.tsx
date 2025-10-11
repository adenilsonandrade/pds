
  import { createRoot } from "react-dom/client";
  import { BrowserRouter } from "react-router-dom";
  import App from "./App";
  import { SelectedBusinessProvider } from './contexts/SelectedBusinessContext';
  import "./index.css";

  createRoot(document.getElementById("root")!).render(
    <BrowserRouter>
      <SelectedBusinessProvider>
        <App />
      </SelectedBusinessProvider>
    </BrowserRouter>
  );
  