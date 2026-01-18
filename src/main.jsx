import React from 'react'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from "react-router-dom";
import LoginPage from './pages/login.jsx';
import RegisterPage from './pages/register.jsx';
import HomePage from './pages/homepage.jsx';
import FlycamManagement from './components/flycam/flycam.management.jsx';
import UserManagement from './components/user/user.management.jsx';
import { AuthWrapper } from './context/auth.context.jsx';

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    // errorElement: <ErrorPage />,
    children: [
       {
        index: true,
        element: <Navigate to="/login" replace />,
      },
      {
        //home page
        path: "/homepage",
        element: <HomePage />,

      },
      {
        //flycam management
        path: "/flycams",
        element: <FlycamManagement/>,
      },
      {
        //user management
        path: "/users",
        element: <UserManagement/>,
      }
    ]
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
  },

]); //khai bao router


createRoot(document.getElementById('root')).render(
  // <StrictMode>
  <AuthWrapper>
  <RouterProvider router={router} />
  </AuthWrapper>
  // </StrictMode>,
)
