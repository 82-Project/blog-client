import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import './index.css'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import ProtectedApp from './ProtectedApp.jsx'

const router = createBrowserRouter([
  {
    path: '/',
    element: <ProtectedApp />,
  },
  {
    path: '/profile',
    element: <ProtectedApp />,
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/register',
    element: <Register />,
  },
])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
    <ToastContainer position="top-right" autoClose={3000} />
  </StrictMode>,
)
