import React from "react";
import { LogIn, Rocket, X } from "lucide-react";
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
      <div className="edu-glass rounded-3xl shadow-xl w-full max-w-md overflow-hidden relative border border-[var(--line)]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[var(--muted)] hover:text-[var(--brand)] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        
        <div className="p-8 text-center">
          <div className="w-16 h-16 bg-[var(--brand-soft)] rounded-2xl flex items-center justify-center mx-auto mb-6 border border-[var(--line)]">
            <Rocket className="w-8 h-8 text-[var(--brand)]" />
          </div>
          <h2 className="text-2xl font-bold section-title mb-2">Join Code Rocket</h2>
          <p className="section-subtitle mb-8">
            Create an account or sign in to enroll in courses and access live classes.
          </p>
          
          <button
            onClick={handleLogin}
            className="w-full flex items-center justify-center space-x-2 bg-[var(--brand)] text-white py-3 px-4 rounded-xl font-medium hover:brightness-110 transition-colors"
          >
            <LogIn className="w-5 h-5" />
            <span>Continue with Google</span>
          </button>
        </div>
      </div>
    </div>
  );
}
