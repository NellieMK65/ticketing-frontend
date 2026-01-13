import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import { Toaster } from "react-hot-toast";

import "./index.css";
import Home from "./pages/home";
import Login from "./pages/login";
import { MainLayout } from "./components/layout/main-layout";
import EventsPage from "./pages/events";
import EventDetailsPage from "./pages/event-details";
import { AuthProvider } from "./context/auth-context";

const router = createBrowserRouter([
  {
    Component: MainLayout,
    children: [
      { index: true, element: <Home /> },
      { path: "/events", element: <EventsPage /> },
      { path: "/events/:id", element: <EventDetailsPage /> },
    ],
  },
  {
    path: "/login",
    element: <Login />,
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Toaster position="top-right" />
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </StrictMode>
);
