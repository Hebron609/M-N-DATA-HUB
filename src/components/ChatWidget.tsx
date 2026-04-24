"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MessageSquare, Send, X } from "lucide-react";

const SUPPORT_PHONE = "233541234567";

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages] = useState([
    {
      type: "bot",
      text: "Hello from M&N DATA HUB. How can we help you today?",
    },
  ]);

  const handleSend = () => {
    if (!input.trim()) return;
    const encodedMsg = encodeURIComponent(input);
    window.open(`https://wa.me/${SUPPORT_PHONE}?text=${encodedMsg}`, "_blank");
    setInput("");
  };

  return (
    <div className="fixed bottom-8 right-5 z-50 sm:right-8">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="glass mb-4 w-[20rem] overflow-hidden rounded-[1.7rem] border border-[#c7d9ef] shadow-2xl"
          >
            <div className="flex items-center justify-between bg-[#0a2144] p-5 text-white">
              <div>
                <h4 className="hub-display text-base font-bold">
                  Support Chat
                </h4>
                <p className="text-[10px] uppercase tracking-[0.2em] text-[#9cc6ff]">
                  Response in minutes
                </p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="transition-transform hover:rotate-90"
                title="Close chat"
                aria-label="Close chat"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="h-64 space-y-4 overflow-y-auto bg-[#f4f7fb]/80 p-5">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.type === "bot" ? "justify-start" : "justify-end"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl p-3.5 text-sm ${
                      msg.type === "bot"
                        ? "bg-white text-[#17345e] shadow-sm"
                        : "bg-[#0a2144] text-white"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-2 border-t border-[#d6e1f0] bg-white p-4">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Type a message..."
                className="flex-1 rounded-xl border border-[#d6e1f0] bg-[#f8fbff] px-4 py-2 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#0ea5a8]/30"
              />
              <button
                onClick={handleSend}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0ea5a8] text-white shadow-lg transition-colors hover:bg-[#0b8c8e]"
                title="Send message"
                aria-label="Send message"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="group flex h-14 w-14 items-center justify-center rounded-full bg-[#0a2144] text-white shadow-2xl transition-colors hover:bg-[#123a70]"
        title="Open support chat"
        aria-label="Open support chat"
      >
        <MessageSquare className="h-6 w-6 transition-transform group-hover:rotate-12" />
      </motion.button>
    </div>
  );
}
