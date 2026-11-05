import { Navigate } from 'react-router-dom'
import App from './App.jsx'
import { hasUser } from './auth.js'

export default function ProtectedApp() {
  return hasUser() ? <App /> : <Navigate to="/login" replace />
}
