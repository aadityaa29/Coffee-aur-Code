'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from './firebase/firebaseConfig';
import Modal from '@/components/modal';

// Helper: Strip HTML tags and truncate text
function getExcerpt(html: string, maxLength = 120) {
  if (typeof window === 'undefined') return '';
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  const text = tempDiv.textContent || tempDiv.innerText || '';
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
}

type Blog = {
  id: string;
  title: string;
  excerpt: string;
  author: string;
  date: string;
  content: string;
  isDeleted: boolean;
  status: 'draft' | 'published' | 'error';
};

export default function Home() {
  const [search, setSearch] = useState('');
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null);

  useEffect(() => {
    const q = collection(db, 'blogs');
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setBlogs((data as Blog[]).filter((b) => !b.isDeleted));
        setLoading(false);
      },
      () => {
        setBlogs([]);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const filteredBlogs = blogs.filter(
  (blog) =>
    !blog.isDeleted &&
    blog.status === 'published' &&
    blog.title.toLowerCase().includes(search.toLowerCase())
);
  return (
    <main className="relative min-h-screen bg-gradient-to-br from-[#1a1333] via-[#232946] to-[#0c0c1d] text-gray-100 overflow-x-hidden">
      {/* Animated Glowing Background Blobs */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-0 left-0 w-[600px] h-[600px] rounded-full bg-purple-500 opacity-25 blur-3xl"
          animate={{ x: [0, 100, -100, 0], y: [0, 50, 100, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full bg-pink-500 opacity-20 blur-3xl"
          animate={{ x: [0, -100, 50, 0], y: [0, -60, -100, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-[40%] left-[30%] w-[400px] h-[400px] rounded-full bg-blue-400 opacity-15 blur-2xl"
          animate={{ x: [0, 60, -60, 0], y: [0, 40, 20, 0] }}
          transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Welcome Card */}
      <div className="relative z-10 flex flex-col items-center justify-center w-[95%] ma-w-3xl mx-auto h-[260px] mt-[6vh] bg-white/10 backdrop-blur-lg rounded-3xl border border-white/20 shadow-2xl">
        <h2 className="text-4xl sm:text-5xl font-extrabold mb-2 text-white drop-shadow-lg text-center">
          Welcome to <span className="text-purple-400">Coffee aur Code!</span>
        </h2>
        <p className="max-w-2xl mx-auto text-gray-300 text-lg mb-0 text-center mt-1">
          Caffeine aur Code – Dono ka perfect blend yahin milega!
        </p>
      </div>

      {/* Main Content Section */}
      <section className="relative z-10">
        {/* Hero Section */}
        <motion.section
          className="text-center py-16 px-4"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <h3 className="max-w-4xl mx-auto text-3xl sm:text-2xl font-semibold tracking-wide text-center mb-8 bg-gradient-to-r from-purple-300 via-pink-200 to-blue-200 bg-clip-text text-transparent drop-shadow">
            A place to share knowledge, ideas, and tutorials about web development, tools, and productivity.
          </h3>

          <Link
            href="/readblogs"
            className="inline-block bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 px-7 py-3 rounded-xl text-white font-semibold text-base transition shadow-lg hover:scale-105"
          >
            Read Blogs
          </Link>
        </motion.section>

        {/* Search Bar */}
        <section className="px-6 py-4 max-w-2xl mx-auto">
          <input
            type="text"
            placeholder="🔍  Search blog by title..."
            className="w-full px-5 py-3 rounded-2xl bg-gray-900 text-white border border-gray-700 focus:ring-2 focus:ring-purple-500 outline-none shadow transition"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </section>

        {/* Blog Cards */}
        <section className="px-6 py-8 max-w-5xl mx-auto">
          <h3 className="text-2xl font-bold mb-6 text-purple-300 tracking-wide">Latest Posts</h3>
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <span className="loader border-4 border-purple-400 border-t-transparent rounded-full w-10 h-10 animate-spin"></span>
              <span className="ml-4 text-gray-400">Loading blogs...</span>
            </div>
          ) : filteredBlogs.length > 0 ? (
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8">
              {filteredBlogs.map((blog) => (
                <motion.div
                  key={blog.id}
                  className="bg-gradient-to-br from-[#232946]/80 to-[#1a1333]/80 rounded-2xl p-6 shadow-lg border border-purple-900/30 hover:border-purple-400/70 transition-all duration-200 hover:shadow-2xl group cursor-pointer"
                  whileHover={{ scale: 1.03, y: -6 }}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  onClick={() => setSelectedBlog(blog)}
                >
                  <h4 className="text-xl font-bold text-white mb-2 group-hover:text-purple-300 transition">{blog.title}</h4>
                  <p className="text-xs text-gray-400 mb-2">{blog.date} &mdash; by {blog.author}</p>
                  <p className="text-gray-300 text-sm mb-4">{getExcerpt(blog.content)}</p>
                  <span className="text-purple-400 hover:text-pink-400 underline text-sm font-medium transition">
                    Read more →
                  </span>
                </motion.div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 mt-4 text-center">No blogs match your search.</p>
          )}

          {/* Blog Modal */}
          <Modal show={!!selectedBlog} onClose={() => setSelectedBlog(null)}>
            {selectedBlog && (
              <div>
                <h2 className="text-2xl font-bold mb-2">{selectedBlog.title}</h2>
                <div className="text-sm text-gray-400 mb-1">
                  Author: {selectedBlog.author} | Date: {selectedBlog.date}
                </div>
                <div className="prose prose-invert max-w-none mb-2" dangerouslySetInnerHTML={{ __html: selectedBlog.content }} />
              </div>
            )}
          </Modal>
        </section>
      </section>

      {/* Footer */}
      <footer className="w-full text-center py-7 bg-[#18122b] text-gray-400 border-t border-gray-800 mt-16 relative z-10">
        <div className="flex justify-center space-x-6 mb-3">
          <a href="https://github.com/aadityaa29" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">GitHub</a>
          <a href="https://www.linkedin.com/in/adityapachouri/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">Linkdin</a>
          <a href="mailto:adityapachouri01@gmail.com" className="hover:text-white transition">Email</a>
        </div>
        <p className="text-xs opacity-80">
  © {new Date().getFullYear()} Coffee aur Code. All rights reserved.
</p>

      </footer>

      {/* Optional: Loader styling */}
      <style jsx>{`
        .loader {
          border-radius: 50%;
          border-top-color: transparent;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </main>
  );
}
