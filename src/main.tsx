import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router/dom";

import "./index.css";
import Home from "./pages/home";
import Login from "./pages/login";
import { MainLayout } from "./components/layout/main-layout";

const router = createBrowserRouter([
  {
    Component: MainLayout,
    children: [
      {index: true, element: <Home />},
    ]
  },
  {
    path: "/login",
    element: <Login />,
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
