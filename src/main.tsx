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
import { DashboardLayout } from "./components/layout/dashboard/dashboard-layout";
import DashboardPage from "./pages/admin/dashboard";
import AdminEventsPage from "./pages/admin/events";
import AdminUsersPage from "./pages/admin/users";
import CheckoutPage from "./pages/checkout";

const router = createBrowserRouter([
  {
    Component: MainLayout,
    children: [
      { index: true, element: <Home /> },
      { path: "/events", element: <EventsPage /> },
      { path: "/events/:id", element: <EventDetailsPage /> },
      { path: "/checkout", element: <CheckoutPage /> },
    ],
  },
  {
    path: "/dashboard",
    Component: DashboardLayout,
    children: [
      { index: true, element: <DashboardPage /> },
      {
        path: "/dashboard/events",
        element: <AdminEventsPage />,
      },
      {
        path: "/dashboard/users",
        element: <AdminUsersPage />,
      },
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
