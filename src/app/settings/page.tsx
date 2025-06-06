"use client";

import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged, updateProfile, deleteUser } from "firebase/auth";
import { db } from "../firebase/firebaseConfig";
import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
  deleteDoc,
} from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null);
  const [displayName, setDisplayName] = useState("");
  const [photoURL, setPhotoURL] = useState("");
  const [bio, setBio] = useState("");
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [preferredCategory, setPreferredCategory] = useState("");
  const [defaultReadTime, setDefaultReadTime] = useState("");
  const [editorTheme, setEditorTheme] = useState("dark");
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterMsg, setNewsletterMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const [saveMsg, setSaveMsg] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [deleting, setDeleting] = useState(false);

  // Force dark mode on mount
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", "dark");
    document.documentElement.classList.add("dark");
  }, []);

  // Fetch user and settings
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        setDisplayName(firebaseUser.displayName || "");
        setPhotoURL(firebaseUser.photoURL || "");
        const settingsRef = doc(db, "userSettings", firebaseUser.uid);
        const snap = await getDoc(settingsRef);
        if (snap.exists()) {
          const data = snap.data();
          setEmailNotifications(data.emailNotifications ?? true);
          setPreferredCategory(data.preferredCategory ?? "");
          setDefaultReadTime(data.defaultReadTime ?? "");
          setEditorTheme(data.editorTheme ?? "dark");
          setBio(data.bio ?? "");
        }
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Save user settings
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveMsg("");
    if (!user) return;
    try {
      await updateProfile(user, { displayName, photoURL });
      await setDoc(
        doc(db, "userSettings", user.uid),
        {
          emailNotifications,
          preferredCategory,
          defaultReadTime,
          editorTheme: "dark",
          bio,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
      setSaveMsg("Settings saved!");
    } catch (err) {
      setSaveMsg("Failed to save settings.");
    }
  };

  // Newsletter subscription
  const handleNewsletter = async (e: React.FormEvent) => {
    e.preventDefault();
    setNewsletterMsg("");
    if (!newsletterEmail) {
      setNewsletterMsg("Please enter your email.");
      return;
    }
    try {
      await setDoc(doc(db, "newsletter", newsletterEmail), {
        email: newsletterEmail,
        subscribedAt: serverTimestamp(),
      });
      setNewsletterMsg("Subscribed! Check your inbox for confirmation.");
      setNewsletterEmail("");
    } catch (err) {
      setNewsletterMsg("Failed to subscribe. Try again.");
    }
  };

  // Delete account
  const handleDeleteAccount = async () => {
    setDeleteError("");
    setDeleting(true);
    try {
      await deleteDoc(doc(db, "userSettings", user.uid));
      await deleteUser(user);
      window.location.href = "/goodbye";
    } catch (err: any) {
      setDeleteError(
        err.code === "auth/requires-recent-login"
          ? "Please re-login and try again."
          : "Failed to delete account."
      );
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-950 via-gray-900 to-black text-gray-100">
        <div>Loading...</div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-950 via-gray-900 to-black text-gray-100">
        <div className="bg-gray-900/90 p-10 rounded-2xl shadow-2xl text-center w-full max-w-md">
          <h1 className="text-3xl font-bold mb-3">Authentication Required</h1>
          <p className="mb-6 text-gray-400">
            Please log in to access Settings.
          </p>
          <a
            href="/signin"
            className="bg-purple-600 hover:bg-purple-700 transition px-6 py-2 rounded-md font-medium"
          >
            Go to Login
          </a>
        </div>
      </main>
    );
  }

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

      <div className="w-full max-w-4xl mx-auto">
        <div className="bg-gray-900/80 backdrop-blur-2xl border border-white/10 shadow-2xl rounded-3xl p-10 md:p-16 mb-10">
          <h1 className="text-4xl font-extrabold mb-8 text-center text-purple-200 drop-shadow-lg">
            Settings & Personalization
          </h1>
          <form onSubmit={handleSave} className="space-y-8">
            {/* User Preferences */}
            <div>
              <h2 className="text-2xl font-semibold mb-3 text-purple-200">
                👤 User Preferences
              </h2>
              <div className="flex flex-col md:flex-row items-center gap-6 mb-4">
                {photoURL ? (
                  <img
                    src={photoURL}
                    alt="Profile"
                    className="w-20 h-20 rounded-full object-cover border-2 border-purple-400"
                  />
                ) : (
                  <span className="w-20 h-20 rounded-full bg-purple-700 flex items-center justify-center text-3xl font-bold text-white border-2 border-purple-400">
                    {displayName ? displayName[0] : user.email[0]}
                  </span>
                )}
                <div className="flex-1 w-full">
                  <label className="block text-gray-400 mb-1">Display Name</label>
                  <input
                    type="text"
                    className="w-full p-3 rounded bg-gray-800 text-white border-none outline-none"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                  />
                  <label className="block text-gray-400 mb-1 mt-4">
                    Profile Image URL
                  </label>
                  <input
                    type="text"
                    className="w-full p-3 rounded bg-gray-800 text-white border-none outline-none"
                    value={photoURL}
                    onChange={(e) => setPhotoURL(e.target.value)}
                    placeholder="https://example.com/photo.jpg"
                  />
                </div>
              </div>
              <div className="flex items-center gap-3 mt-4">
                <input
                  type="checkbox"
                  checked={emailNotifications}
                  onChange={(e) => setEmailNotifications(e.target.checked)}
                  id="notif"
                  className="accent-purple-600 w-5 h-5"
                />
                <label htmlFor="notif" className="text-gray-300">
                  Email me about new comments
                </label>
              </div>
            </div>

            {/* Bio/About Me */}
            <div>
              <h2 className="text-2xl font-semibold mb-3 text-purple-200">
                📝 Bio / About Me
              </h2>
              <textarea
                className="w-full min-h-[100px] rounded bg-gray-800 text-white border-none outline-none p-3"
                value={bio}
                onChange={e => setBio(e.target.value)}
                placeholder="Tell us about yourself, your interests, or your story..."
              />
            </div>

            {/* Blog Defaults */}
            <div>
              <h2 className="text-2xl font-semibold mb-3 text-purple-200">
                🧱 Blog Defaults
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-gray-400 mb-1">
                    Preferred Category
                  </label>
                  <input
                    type="text"
                    className="w-full p-3 rounded bg-gray-800 text-white border-none outline-none mb-2"
                    value={preferredCategory}
                    onChange={(e) => setPreferredCategory(e.target.value)}
                    placeholder="e.g. Web Development"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">
                    Default Read Time
                  </label>
                  <input
                    type="text"
                    className="w-full p-3 rounded bg-gray-800 text-white border-none outline-none mb-2"
                    value={defaultReadTime}
                    onChange={(e) => setDefaultReadTime(e.target.value)}
                    placeholder="e.g. 5 min"
                  />
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-gray-400 mb-1">
                  Preferred Editor Theme
                </label>
                <div className="flex items-center gap-4">
                  <span className="px-4 py-2 rounded bg-purple-600 text-white font-semibold">
                    Dark
                  </span>
                </div>
              </div>
            </div>

            {/* Save & Delete */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mt-8">
              <button
                type="button"
                className="bg-red-700 hover:bg-red-800 px-8 py-3 rounded text-white font-semibold text-lg transition"
                onClick={() => setShowDeleteModal(true)}
              >
                Delete My Account
              </button>
              <button
                type="submit"
                className="bg-purple-600 hover:bg-purple-700 px-8 py-3 rounded text-white font-semibold text-lg transition"
              >
                Save Settings
              </button>
            </div>
            <AnimatePresence>
              {saveMsg && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-green-400 text-center mt-4"
                >
                  {saveMsg}
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </div>

        {/* Newsletter Section */}
        <div className="bg-gray-900/80 backdrop-blur-2xl border border-white/10 shadow-2xl rounded-3xl p-10 md:p-16 mb-10">
          <h2 className="text-2xl font-semibold mb-2 text-pink-200 text-center">
            📬 Newsletter
          </h2>
          <p className="mb-3 text-gray-300 text-center">
            Get the latest updates, tips, and exclusive content straight to your inbox.
          </p>
          <form onSubmit={handleNewsletter} className="flex flex-col sm:flex-row gap-2 mb-2 justify-center">
            <input
              type="email"
              className="flex-1 p-3 rounded bg-gray-800 text-white border-none outline-none"
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              placeholder="Your email address"
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
                className={`mt-2 text-center ${
                  newsletterMsg.includes("Subscribed")
                    ? "text-green-400"
                    : "text-red-400"
                }`}
              >
                {newsletterMsg}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-gray-900 rounded-xl shadow-2xl p-8 max-w-md w-full"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <h3 className="text-2xl font-bold text-red-400 mb-4">
                Confirm Account Deletion
              </h3>
              <p className="mb-4 text-gray-300">
                Are you sure you want to permanently delete your account? This action cannot be undone.
              </p>
              {deleteError && <p className="text-red-400 mb-2">{deleteError}</p>}
              <div className="flex gap-4 justify-end">
                <button
                  className="px-5 py-2 rounded bg-gray-700 text-white hover:bg-gray-800 transition"
                  onClick={() => setShowDeleteModal(false)}
                  disabled={deleting}
                >
                  Cancel
                </button>
                <button
                  className="px-5 py-2 rounded bg-red-700 text-white hover:bg-red-800 transition"
                  onClick={handleDeleteAccount}
                  disabled={deleting}
                >
                  {deleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
