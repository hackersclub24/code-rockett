import React from "react";
import { LogIn, X } from "lucide-react";
import { useAuth } from "./AuthProvider";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { login } = useAuth();

  if (!isOpen) return null;

  const handleLogin = async () => {
    await login();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        
        <div className="p-8 text-center">
          <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-3xl">🚀</span>
          </div>
          <h2 className="text-2xl font-bold text-zinc-900 mb-2">Join Code Rocket</h2>
          <p className="text-zinc-600 mb-8">
            Create an account or sign in to enroll in courses and access live classes.
          </p>
          
          <button
            onClick={handleLogin}
            className="w-full flex items-center justify-center space-x-2 bg-indigo-600 text-white py-3 px-4 rounded-xl font-medium hover:bg-indigo-700 transition-colors focus:ring-4 focus:ring-indigo-100"
          >
            <LogIn className="w-5 h-5" />
            <span>Continue with Google</span>
          </button>
        </div>
      </div>
    </div>
  );
}
