"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useState } from "react";

export default function AboutPage() {
  const [newsletterMsg, setNewsletterMsg] = useState("");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

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

      {/* Main Glass Card */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, type: "spring" }}
        className="w-full max-w-3xl bg-gray-900/80 backdrop-blur-2xl border border-white/10 shadow-2xl rounded-3xl p-10 md:p-16 mb-10 flex flex-col items-center"
      >
        {/* Profile Pic */}
        <img
          src="/images/adiphoto.jpg"
          alt="Aditya Pachouri"
          className="w-50 h-50 rounded-full border-4 border-purple-500 shadow-lg mb-4 object-cover"
        />

        {/* About Sections */}
        <h1 className="text-4xl font-extrabold mb-2 text-center">
          <span className="text-purple-400">👋 About Me</span>
        </h1>
        <p className="mb-4 text-lg text-gray-300 text-center">
          Hey, I'm <span className="text-purple-300 font-bold">Aditya Pachouri</span> — a <span className="font-semibold text-pink-300">curious mind</span> passionate about <span className="font-semibold text-yellow-300">tech</span>, <span className="font-semibold text-blue-300">design</span>, and <span className="font-semibold text-purple-300">digital storytelling</span>. I’m a <span className="font-semibold text-green-300">full-stack web developer</span> and <span className="font-semibold text-teal-300">student</span>, constantly exploring the intersection of <span className="font-semibold text-pink-400">creativity</span> and <span className="font-semibold text-purple-400">code</span>.
        </p>

        <div className="mb-4 text-center">
          <span className="text-2xl">📝</span>
          <p className="mt-2 text-gray-200">
            <b className="text-pink-400">Why This Blog Exists:</b> This blog is my <span className="font-semibold text-purple-300">digital notebook</span>, a space where I share <span className="text-yellow-300 font-semibold">tutorials</span>, <span className="text-blue-300 font-semibold">ideas</span>, <span className="text-pink-300 font-semibold">experiences</span>, and <span className="text-purple-300 font-semibold">experiments</span> from my journey in web development, coding, and beyond. It’s not just about code — it's about <span className="text-green-300 font-semibold">learning</span>, <span className="text-pink-300 font-semibold">building</span>, and <span className="text-yellow-300 font-semibold">growing together</span>.
          </p>
        </div>

        <div className="mb-4 text-center">
          <span className="text-2xl">🗂️</span>
          <p className="mt-2 text-gray-200">
            <b className="text-purple-400">What You’ll Find Here:</b>
            <ul className="list-disc list-inside text-left mx-auto max-w-md mt-1 text-gray-300">
              <li><span className="font-semibold text-yellow-300">Hands-on guides</span> on modern JavaScript frameworks (<span className="text-blue-300">Next.js</span>, <span className="text-blue-400">React</span>)</li>
              <li><span className="font-semibold text-pink-300">Insights</span> into <span className="text-yellow-300">Firebase</span> and backend integrations</li>
              <li><span className="font-semibold text-purple-300">Tips</span> on UI/UX design and developer productivity</li>
              <li><span className="font-semibold text-green-300">Project breakdowns</span> from concept to deployment</li>
              <li><span className="font-semibold text-pink-300">Occasional personal reflections</span> on life, learning, and growth</li>
            </ul>
          </p>
        </div>

        <div className="mb-4 text-center">
          <span className="text-2xl">🚀</span>
          <p className="mt-2 text-gray-200">
            <b className="text-yellow-400">My Mission:</b> I want to make <span className="font-semibold text-green-300">complex tech topics simple</span> and help <span className="font-semibold text-pink-300">aspiring developers</span> feel more confident in building impactful, user-friendly digital products. Through this blog, I aim to <span className="text-purple-300 font-semibold">share value</span>, <span className="text-pink-300 font-semibold">spark curiosity</span>, and <span className="text-yellow-300 font-semibold">inspire others</span> to create.
          </p>
        </div>

        <div className="mb-4 text-center">
          <span className="text-2xl">🎯</span>
          <p className="mt-2 text-gray-200">
            <b className="text-pink-400">A Little More About Me:</b>
            <ul className="list-disc list-inside text-left mx-auto max-w-md mt-1 text-gray-300">
              <li>Watching anime or reimagining story plots <span className="text-blue-300">🌀</span></li>
              <li>Sipping a cup of <span className="font-semibold text-yellow-300">strong coffee</span> ☕</li>
              <li>Designing <span className="font-semibold text-purple-300">sleek interfaces</span> or brainstorming hackathon ideas <span className="text-pink-300">💡</span></li>
              <li>Staying curious and experimenting with <span className="font-semibold text-green-300">new tech</span> 🚧</li>
            </ul>
            <span className="block mt-2">
              I believe in <span className="font-semibold text-yellow-300">lifelong learning</span>, <span className="font-semibold text-purple-300">clean UI logic</span>, and the magic of turning ideas into products.
            </span>
          </p>
        </div>

        <div className="mb-6 text-center">
          <span className="text-2xl">📬</span>
          <p className="mt-2 text-gray-200">
            <b className="text-purple-400">Let’s Connect!</b> If you enjoy the content, have feedback, or want to collaborate, I’d love to hear from you!
            <br />
            <span className="flex flex-wrap gap-4 justify-center mt-2">
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
            </span>
          </p>
        </div>

        {/* Newsletter CTA */}
        <div className="mt-8 w-full">
          <form
            action="#"
            className="flex flex-col sm:flex-row gap-2 justify-center"
            onSubmit={e => {
              e.preventDefault();
              setNewsletterMsg("Thanks for subscribing! (Demo only)");
            }}
          >
            <input
              type="email"
              className="flex-1 p-3 rounded bg-gray-800 text-white border-none outline-none"
              placeholder="Your email for newsletter"
              required
            />
            <button
              type="submit"
              className="bg-pink-600 hover:bg-pink-700 px-6 py-3 rounded text-white font-semibold transition"
            >
              Subscribe
            </button>
          </form>
          <AnimatePresence>
            {newsletterMsg && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-2 text-center text-green-400"
              >
                {newsletterMsg}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.section>
      
    </main>
  );
}
