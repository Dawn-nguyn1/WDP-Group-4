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
import UserPage from './components/user/user.jsx';
import { AuthWrapper } from './context/auth.context.jsx';
import ZonePage from './pages/zone.jsx';
import UserDetailPage from './pages/user.detail.page.jsx';
import FlightPlanning from './pages/flight.planning.jsx';

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
        //user management
        path: "/users",
        element: <UserPage/>,
      }
      ,
      {
        path: "/users/:id",
        element: <UserDetailPage />,
      }
      ,
      {
        path: "/zones",
        element: <ZonePage />,
      }
      ,
      {
        path: "/flight-planning",
        element: <FlightPlanning />,
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
