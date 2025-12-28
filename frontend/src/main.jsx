import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createHashRouter, RouterProvider } from "react-router-dom";

import "./index.css";
import TeacherPage from "./pages/TeacherPage.jsx";
import GroupsPage from "./pages/GroupList.jsx";

const router = createHashRouter([
  {
    path: "/",
    element: <TeacherPage />,
  },
  {
    path: "/groups",
    element: <GroupsPage />,
  },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
