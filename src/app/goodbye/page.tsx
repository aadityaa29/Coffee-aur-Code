"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useSearchParams } from "next/navigation";

export default function GoodbyePage() {
  // Try to get the user's name from query param or localStorage
  const searchParams = useSearchParams();
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    const nameFromQuery = searchParams.get("name");
    if (nameFromQuery) {
      setUserName(nameFromQuery);
      localStorage.removeItem("userName");
    } else {
      const stored = localStorage.getItem("userName");
      if (stored) setUserName(stored);
    }
  }, [searchParams]);

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

      <div className="bg-gray-900/80 backdrop-blur-2xl border border-white/10 shadow-2xl rounded-3xl p-10 md:p-16 max-w-xl w-full flex flex-col items-center">
        <h1 className="text-4xl font-extrabold mb-4 text-center text-purple-200 drop-shadow-lg">
          Goodbye{userName ? `, ${userName}` : ""}! 👋
        </h1>
        <p className="mb-6 text-lg text-gray-200 text-center leading-relaxed">
          It was truly wonderful having you as part of{" "}
          <span
            className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-yellow-300 text-2xl tracking-tight"
            style={{
              fontFamily: '"Geist", "Inter", "Segoe UI", Arial, sans-serif',
              letterSpacing: "0.02em",
              display: "inline-block",
            }}
          >
            Coffee aur Code
          </span>
          .<br />
          We hope you enjoyed your journey here.<br />
          Remember, you’re always welcome back!
        </p>
        <div className="mb-8 text-center">
          <span className="text-5xl">☕</span>
        </div>
        <Link
          href="/readblogs"
          className="bg-purple-600 hover:bg-purple-700 px-8 py-3 rounded-xl font-bold text-white text-lg transition shadow-lg"
        >
          Continue Reading Blogs
        </Link>
        <div className="mt-10 text-center text-gray-400 text-sm">
          <p>
            Thank you for being part of our community.<br />
            Wishing you all the best on your next adventure!
          </p>
        </div>
      </div>
    </main>
  );
}
