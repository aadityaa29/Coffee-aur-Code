"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [statusMsg, setStatusMsg] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    setStatusMsg("");
    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          access_key: "0ded871d-80ec-4504-8a1a-8994970e88c2", // <-- Add your Web3Forms access key here
          name: form.name,
          email: form.email,
          message: form.message,
        }),
      });
      const result = await response.json();
      if (result.success) {
        setStatus("sent");
        setStatusMsg("Thank you! Your message has been sent.");
        setForm({ name: "", email: "", message: "" });
      } else {
        setStatus("error");
        setStatusMsg("Something went wrong. Please try again.");
      }
    } catch {
      setStatus("error");
      setStatusMsg("Something went wrong. Please try again.");
    }
  };

  return (
    <main className="relative min-h-screen w-full flex flex-col items-center justify-center px-2 py-10 overflow-x-hidden bg-gradient-to-br from-gray-950 via-gray-900 to-black text-gray-100">
      {/* Animated background blobs */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <motion.div
          className="absolute top-0 left-0 w-[900px] h-[900px] rounded-full bg-purple-700 opacity-25 blur-3xl"
          animate={{ x: [0, 100, -100, 0], y: [0, 50, 100, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-0 right-0 w-[900px] h-[900px] rounded-full bg-pink-700 opacity-20 blur-3xl"
          animate={{ x: [0, -100, 50, 0], y: [0, -60, -100, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-[30%] left-[30%] w-[700px] h-[700px] rounded-full bg-blue-700 opacity-10 blur-2xl"
          animate={{ x: [0, 60, -60, 0], y: [0, 40, 20, 0] }}
          transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <motion.section
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, type: "spring" }}
        className="w-full max-w-lg bg-gray-900/80 backdrop-blur-2xl border border-white/10 shadow-2xl rounded-3xl p-10 md:p-14 mb-10 flex flex-col items-center"
      >
        <h1 className="text-4xl font-extrabold mb-2 text-center text-purple-200">Contact Me</h1>
        <p className="mb-6 text-gray-300 text-center">
          Got a question, feedback, or want to collaborate?  
          <br />
          Drop me a message below or connect via social links!
        </p>

        <form className="w-full space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="block text-gray-400 mb-1" htmlFor="name">
              Name
            </label>
            <input
              className="w-full p-3 rounded bg-gray-800 text-white border-none outline-none"
              type="text"
              name="name"
              id="name"
              value={form.name}
              onChange={handleChange}
              required
              autoComplete="name"
              placeholder="Your name"
            />
          </div>
          <div>
            <label className="block text-gray-400 mb-1" htmlFor="email">
              Email
            </label>
            <input
              className="w-full p-3 rounded bg-gray-800 text-white border-none outline-none"
              type="email"
              name="email"
              id="email"
              value={form.email}
              onChange={handleChange}
              required
              autoComplete="email"
              placeholder="you@email.com"
            />
          </div>
          <div>
            <label className="block text-gray-400 mb-1" htmlFor="message">
              Message
            </label>
            <textarea
              className="w-full p-3 rounded bg-gray-800 text-white border-none outline-none min-h-[100px]"
              name="message"
              id="message"
              value={form.message}
              onChange={handleChange}
              required
              placeholder="Type your message here..."
            />
          </div>
          <button
            type="submit"
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold px-6 py-3 rounded-lg shadow transition"
            disabled={status === "sending"}
          >
            {status === "sending" ? "Sending..." : "Send Message"}
          </button>
        </form>
        <AnimatePresence>
          {statusMsg && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`mt-4 text-center ${status === "sent" ? "text-green-400" : "text-red-400"}`}
            >
              {statusMsg}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Social Links */}
        <div className="mt-10 flex flex-col items-center gap-2 w-full">
          <div className="flex gap-4 justify-center">
            <a
              href="https://x.com/AdityaPach9586"
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold transition"
              target="_blank"
              rel="noopener noreferrer"
            >
              Twitter (X)
            </a>
            <a
              href="https://www.linkedin.com/in/adityapachouri/"
              className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-lg font-semibold transition"
              target="_blank"
              rel="noopener noreferrer"
            >
              LinkedIn
            </a>
            <a
              href="mailto:adityapachouri01@gmail.com"
              className="bg-purple-700 hover:bg-purple-800 text-white px-4 py-2 rounded-lg font-semibold transition"
              target="_blank"
              rel="noopener noreferrer"
            >
              Email
            </a>
          </div>
          <p className="text-gray-400 text-sm mt-4">
            I usually reply within 24 hours!
          </p>
        </div>
      </motion.section>
    </main>
  );
}
