'use client';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export default function SignInPage() {
  const { login, loginWithGoogle } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      router.push('/');
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleGoogle = async () => {
    setError('');
    try {
      await loginWithGoogle();
      router.push('/');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white overflow-x-hidden">
      {/* Animated background blobs */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <motion.div
          className="absolute top-0 left-0 w-[600px] h-[600px] rounded-full bg-purple-700 opacity-25 blur-3xl"
          animate={{ x: [0, 100, -100, 0], y: [0, 50, 100, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-0 right-0 w-[600px] h-[600px] rounded-full bg-pink-700 opacity-20 blur-3xl"
          animate={{ x: [0, -100, 50, 0], y: [0, -60, -100, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-gray-900/80 backdrop-blur-2xl border border-white/10 shadow-2xl rounded-3xl p-10 w-full max-w-md flex flex-col items-center"
      >
        <h1 className="text-3xl font-extrabold mb-6 text-purple-200 drop-shadow-lg text-center">Sign In</h1>
        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-red-400 mb-2 text-center w-full"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>
        <input
          type="email"
          placeholder="Email"
          className="w-full p-3 mb-3 rounded-lg bg-gray-800 text-white border-none outline-none focus:ring-2 focus:ring-purple-500 placeholder:text-gray-400 transition"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full p-3 mb-4 rounded-lg bg-gray-800 text-white border-none outline-none focus:ring-2 focus:ring-purple-500 placeholder:text-gray-400 transition"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          autoComplete="current-password"
        />
        <button
          className="w-full bg-purple-600 hover:bg-purple-700 p-3 rounded-lg font-bold text-lg transition mb-4"
          type="submit"
        >
          Sign In
        </button>

        <div className="flex items-center w-full my-4">
          <div className="flex-1 h-px bg-gray-700" />
          <span className="mx-3 text-gray-400 text-sm">or</span>
          <div className="flex-1 h-px bg-gray-700" />
        </div>

        <button
          type="button"
          className="w-full flex items-center justify-center gap-2 bg-white text-black hover:bg-gray-100 p-3 rounded-lg font-bold text-lg transition"
          onClick={handleGoogle}
        >
          <img
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            alt="Google"
            className="w-6 h-6"
          />
          Sign in with Google
        </button>

        <p className="mt-6 text-center text-gray-300">
          New here?{" "}
          <a href="/register" className="text-purple-400 hover:underline font-semibold">
            Register
          </a>
        </p>
      </form>
    </main>
  );
}
