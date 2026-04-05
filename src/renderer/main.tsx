import React from 'react';
import ReactDOM from 'react-dom/client';
import { Navigate, createHashRouter, RouterProvider } from "react-router-dom";
import '@/styles/globals.css';
import { AppShell } from './layout/AppLayout';



const router = createHashRouter([
  {
    path: "/",
    element: <AppShell />
  }
]);


ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);
