"use client";

import { motion } from "framer-motion";

export default function WhatsAppBadge() {
  return (
    <motion.a
      href="https://chat.whatsapp.com/CAm3VQzgKEh7aJIqQgmEQ2"
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="fixed z-50 flex items-center gap-2 px-5 py-3 font-bold text-white transition-all duration-300 bg-green-500 rounded-full shadow-2xl shadow-green-500/20 top-24 right-8 hover:bg-green-600"
      title="Join our WhatsApp group for instant order updates!"
    >
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 32 32">
        <path d="M16 3C9.373 3 4 8.373 4 15c0 2.385.668 4.607 1.938 6.563L4 29l7.688-1.938A12.93 12.93 0 0016 27c6.627 0 12-5.373 12-12S22.627 3 16 3zm0 22.917c-2.09 0-4.13-.547-5.91-1.586l-.423-.25-4.563 1.148 1.188-4.438-.275-.434C5.547 18.13 5 16.09 5 14c0-6.065 4.935-11 11-11s11 4.935 11 11-4.935 11-11 11zm6.09-7.547c-.334-.167-1.977-.975-2.283-1.086-.307-.112-.531-.167-.755.167-.223.334-.863 1.086-1.058 1.309-.195.223-.39.25-.724.084-.334-.167-1.41-.519-2.687-1.653-.993-.885-1.664-1.977-1.86-2.311-.195-.334-.021-.514.146-.68.15-.149.334-.39.501-.584.167-.195.223-.334.334-.557.112-.223.056-.417-.028-.584-.084-.167-.755-1.823-1.034-2.5-.272-.654-.548-.566-.755-.577-.195-.008-.417-.01-.64-.01-.223 0-.584.084-.89.417-.306.334-1.17 1.143-1.17 2.785 0 1.642 1.198 3.228 1.364 3.453.167.223 2.36 3.606 5.72 4.91.8.276 1.423.441 1.91.564.803.204 1.535.175 2.114.106.646-.077 1.977-.808 2.257-1.588.278-.78.278-1.448.195-1.588-.084-.14-.306-.223-.64-.39z" />
      </svg>
      <span className="hidden sm:inline text-sm tracking-wide">Join WhatsApp Group</span>
    </motion.a>
  );
}
