import { useContext } from "react";
import { AuthContext } from "../context/authContext";

export function useAuth() {
  const context = useContext(AuthContext);
  if(!context) {
    throw new Error('useAuth phải được dùng bên trong AuthProvider');
  }
  return context;
}