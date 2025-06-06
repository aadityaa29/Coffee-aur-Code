'use client';

import { useEffect, useState, useRef } from 'react';
import { db } from '../firebase/firebaseConfig';
import {
  collection,
  addDoc,
  onSnapshot,
  serverTimestamp,
  doc,
  updateDoc,
  query,
  where,
} from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { AnimatePresence, motion } from 'framer-motion';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Image from '@tiptap/extension-image';
import Link from 'next/link';

export default function BlogDashboard() {
  // Auth/user state
  const [user, setUser] = useState<any>(null);
  const [showWelcome, setShowWelcome] = useState(true);

  // Blog form state
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState('');
  const [author, setAuthor] = useState('');
  const [email, setEmail] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [estimatedReadTime, setEstimatedReadTime] = useState('');
  const [editorContent, setEditorContent] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [status, setStatus] = useState<'published' | 'draft'>('published');
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Blog list state
  const [blogs, setBlogs] = useState<any[]>([]);
  const [isFetching, setIsFetching] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const blogsPerPage = 6;

  // Preview modal
  const [previewOpen, setPreviewOpen] = useState(false);

  // Autosave
  const autosaveTimeout = useRef<NodeJS.Timeout | null>(null);
  const [autosaveStatus, setAutosaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  // Editor
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: 'Write your blog content here...' }),
      Image,
    ],
    content: '',
    onUpdate: ({ editor }) => setEditorContent(editor.getHTML()),
  });

  // Auth state
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser?.email) setEmail(firebaseUser.email);
      if (firebaseUser?.displayName) setAuthor(firebaseUser.displayName);
    });
    return () => unsubscribe();
  }, []);

  // Fetch user's blogs
  useEffect(() => {
    if (!user) {
      setBlogs([]);
      setIsFetching(false);
      return;
    }
    setIsFetching(true);
    const q = query(collection(db, 'blogs'), where('authorId', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setBlogs(data);
      setIsFetching(false);
    });
    return () => unsubscribe();
  }, [user]);

  // Autosave draft every 20 seconds
  useEffect(() => {
    if (!editingId || !user || status !== 'draft') return;
    if (autosaveTimeout.current) clearTimeout(autosaveTimeout.current);

    autosaveTimeout.current = setTimeout(async () => {
      setAutosaveStatus('saving');
      await updateDoc(doc(db, 'blogs', editingId), {
        title, category, tags: tags.split(',').map(t=>t.trim()),
        author, email, shortDescription, estimatedReadTime, content: editor?.getHTML() || '',
        status: 'draft', updatedAt: serverTimestamp(),
      });
      setAutosaveStatus('saved');
      setTimeout(() => setAutosaveStatus('idle'), 2000);
    }, 20000);

    return () => {
      if (autosaveTimeout.current) clearTimeout(autosaveTimeout.current);
    };
    // eslint-disable-next-line
  }, [title, category, tags, author, email, shortDescription, estimatedReadTime, editorContent, editingId, status, user]);

  // Reset form
  const resetForm = () => {
    setEditingId(null);
    setTitle('');
    setCategory('');
    setTags('');
    setAuthor(user?.displayName || '');
    setEmail(user?.email || '');
    setShortDescription('');
    setEstimatedReadTime('');
    setStatus('published');
    setFormError(null);
    editor?.commands.clearContent();
  };

  // Add or update post
  const handlePost = async (statusToSave: 'published' | 'draft') => {
    if (!title || !editorContent || !author || !email || !category) {
      setFormError('Please fill in all required fields.');
      return;
    }
    setLoading(true);
    setFormError(null);

    const blogData = {
      title,
      category,
      tags: tags.split(',').map((tag) => tag.trim()),
      content: editorContent,
      author,
      authorId: user.uid,
      email,
      shortDescription,
      estimatedReadTime,
      status: statusToSave,
      createdAt: serverTimestamp(),
      isDeleted: false,
    };

    try {
      if (editingId) {
        await updateDoc(doc(db, 'blogs', editingId), blogData);
      } else {
        await addDoc(collection(db, 'blogs'), blogData);
      }
      resetForm();
    } catch (err) {
      setFormError('Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  // Edit post
  const handleEdit = (blog: any) => {
    setEditingId(blog.id);
    setTitle(blog.title || '');
    setCategory(blog.category || '');
    setTags((blog.tags || []).join(', '));
    setAuthor(blog.author || user?.displayName || '');
    setEmail(blog.email || user?.email || '');
    setShortDescription(blog.shortDescription || '');
    setEstimatedReadTime(blog.estimatedReadTime || '');
    setStatus(blog.status || 'draft');
    editor?.commands.setContent(blog.content || '');
    setFormError(null);
  };

  // Delete post (soft delete)
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this blog?')) return;
    try {
      await updateDoc(doc(db, 'blogs', id), { isDeleted: true });
    } catch (err) {
      alert('Delete error');
    }
  };

  // Export as Markdown
  const exportMarkdown = () => {
    const markdown = `# ${title}\n\n${shortDescription}\n\n${editorContent}`;
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${title.replace(/\s+/g, '_')}.md`;
    link.click();
  };

  // Filtered and paginated blogs: only show published
  const filteredBlogs = blogs.filter(
    (blog) =>
      !blog.isDeleted &&
      (blog.status === 'published' || blog.status === undefined || blog.status === null || blog.status === 'draft' || blog.status === 'error') &&
      blog.title.toLowerCase().includes(search.toLowerCase())
  );
  const paginatedBlogs = filteredBlogs.slice((page - 1) * blogsPerPage, page * blogsPerPage);

  // Status badge
  const getStatusBadge = (blog: any) => (
    <span className={`inline-block px-2 py-1 rounded text-xs font-bold mr-2
      ${blog.status === 'published' ? 'bg-green-600 text-white' :
        blog.status === 'draft' ? 'bg-yellow-400 text-black' :
        'bg-red-600 text-white'}`}>
      {blog.status === 'published' ? '🟢 Published' :
        blog.status === 'draft' ? '🟡 Draft' : '🔴 Error'}
    </span>
  );

  // Animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 40, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, type: 'spring', stiffness: 120 } },
    exit: { opacity: 0, y: 40, scale: 0.95, transition: { duration: 0.3 } },
  };

  const modalVariants = {
    hidden: { opacity: 0, y: '-100vh' },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 500, damping: 30 } },
    exit: { opacity: 0, y: '100vh', transition: { duration: 0.2 } },
  };

  // Animated error for form
  const AnimatedError = ({ message }: { message: string }) => (
    <AnimatePresence>
      {message && (
        <motion.div
          key={message}
          initial={{ opacity: 0, y: -10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{ duration: 0.3 }}
          className="text-red-400 bg-red-900/50 px-4 py-2 rounded mb-2 shadow"
        >
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  );

  // Custom placeholder color for Tiptap
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      .ProseMirror .is-editor-empty [data-placeholder] {
        color: #a78bfa !important;
        opacity: 1 !important;
        font-style: italic;
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Animated background blobs
  const AnimatedBackground = () => (
    <div className="fixed inset-0 -z-10 pointer-events-none">
      <motion.div
        className="absolute top-0 left-0 w-[600px] h-[600px] rounded-full bg-purple-500 opacity-20 blur-3xl"
        animate={{ x: [0, 100, -100, 0], y: [0, 50, 100, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full bg-pink-500 opacity-15 blur-3xl"
        animate={{ x: [0, -100, 50, 0], y: [0, -60, -100, 0] }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-[40%] left-[30%] w-[400px] h-[400px] rounded-full bg-blue-400 opacity-10 blur-2xl"
        animate={{ x: [0, 60, -60, 0], y: [0, 40, 20, 0] }}
        transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );

  // Welcome message variants
  const welcomeVariants = {
    hidden: { opacity: 0, scale: 0.98, y: 40 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.7, type: 'spring' } },
    exit: { opacity: 0, scale: 0.98, y: -40, transition: { duration: 0.5 } },
  };

  // Welcome section
  const WelcomeSection = () => (
    <motion.div
      className="flex flex-col items-center justify-center min-h-screen w-full px-4 py-10"
      variants={welcomeVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <AnimatedBackground />
      <motion.div
        className="bg-gray-900/90 backdrop-blur-xl rounded-2xl shadow-2xl p-10 max-w-xl w-full flex flex-col items-center"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
      >
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-purple-200 text-center drop-shadow-lg">
          {user?.displayName
            ? `Welcome, ${user.displayName}!`
            : user?.email
            ? `Welcome, ${user.email.split('@')[0]}!`
            : 'Welcome!'}
        </h1>
        <p className="mb-6 text-lg text-gray-200 text-center">
          We’re thrilled to have you here. <br />
          This is your creative space—share your stories, inspire others, and make your mark!
        </p>
        <ul className="mb-6 text-gray-300 text-base space-y-2 text-left max-w-md mx-auto">
          <li>🌟 Write, edit, and publish blogs with ease</li>
          <li>🚀 Save drafts and preview your work live</li>
          <li>💡 Manage your posts, categories, and tags</li>
          <li>🎉 See your published posts shine on the platform</li>
        </ul>
        <motion.button
          onClick={() => setShowWelcome(false)}
          className="mt-4 px-8 py-3 rounded-lg font-bold bg-gradient-to-r from-purple-600 to-pink-500 text-white text-lg shadow-lg hover:scale-105 transition"
          whileHover={{ scale: 1.07 }}
        >
          Start Writing &rarr;
        </motion.button>
      </motion.div>
    </motion.div>
  );

  // If not logged in, show onboarding/benefits page (keep your existing code for this)
// Example testimonials data
const testimonials = [
  {
    name: 'Aarav S.',
    role: 'Full Stack Developer',
    feedback:
      'Coffee aur Code gave me a platform to share my journey. The editor is intuitive, and the community feedback is invaluable!',
    avatar: '/images/avatar-1.png',
  },
  {
    name: 'Priya K.',
    role: 'Student & Blogger',
    feedback:
      'I started as a beginner, but now my posts reach hundreds of readers. The analytics and support are amazing!',
    avatar: '/images/avatar-2.png',
  },
  {
    name: 'Saloni D.',
    role: 'Open Source Enthusiast',
    feedback:
      'I love how easy it is to draft, edit, and publish. The tag system really helps my tutorials get discovered.',
    avatar: '/images/avatar-3.png',
  },
];

const faqData = [
  {
    question: "Who can become an author on Coffee aur Code?",
    answer:
      "Anyone with a passion for writing, coding, or sharing knowledge! Whether you’re a seasoned developer, student, or hobbyist—your story matters.",
  },
  {
    question: "Is it free to create and publish blogs?",
    answer:
      "Yes! Creating an account and publishing your blogs on Coffee aur Code is completely free.",
  },
  {
    question: "Can I save my post as a draft and publish later?",
    answer:
      "Absolutely. You can save your work as a draft and publish it whenever you’re ready.",
  },
  {
    question: "How do I get more readers for my posts?",
    answer:
      "Use relevant categories and tags, share your posts on social media, and engage with the community by commenting and liking other blogs.",
  },
  {
    question: "Can I edit or delete my posts after publishing?",
    answer:
      "Yes, you can always edit or delete your own posts from your dashboard.",
  },
  {
    question: "How can I interact with other authors?",
    answer:
      "You can comment on and like other authors’ posts. More community features are coming soon!",
  },
];

const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  if (!user) {
     
    return (
      
    <main className="relative min-h-screen w-full flex flex-col items-center justify-center px-4 py-10 overflow-x-hidden">
      {/* Background Image */}
      <div
        className="fixed inset-0 z-0 bg-cover bg-center"
        style={{
          backgroundImage: "url('/images/author-bg.jpg')",
          filter: 'brightness(0.5)',
        }}
        aria-hidden="true"
      />
      {/* Overlay Gradient */}
      <div className="fixed inset-0 z-0 bg-gradient-to-br from-purple-900/80 via-indigo-900/80 to-black/90" aria-hidden="true" />

      {/* Video Intro */}
      <div className="relative z-10 w-full flex flex-col items-center mb-8">
        <div className="w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl mb-4 border-4 border-purple-700">
          <video
            className="w-full h-64 object-cover"
            autoPlay
            muted
            loop
            poster="/images/author-video-fallback.jpg"
            playsInline
          >
            <source src="/videos/author-intro.mp4" type="video/mp4" />
            {/* Fallback image for browsers that don't support video */}
            Your browser does not support the video tag.
          </video>
        </div>
        <h1 className="text-5xl font-extrabold mb-4 text-purple-200 text-center drop-shadow-lg">
          Become a Coffee aur Code Author!
        </h1>
        <p className="mb-8 text-xl text-gray-200 text-center max-w-3xl">
          Share your knowledge, inspire others, and join a thriving community of passionate developers, writers, and creators.
        </p>
      </div>

      {/* Benefits Section */}
      <div className="relative z-10 mb-10 w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-gray-900/90 rounded-2xl p-8 shadow-xl flex flex-col items-center">
          <span className="text-4xl mb-3">🌟</span>
          <h2 className="text-2xl font-bold mb-3 text-purple-200">Why Write With Us?</h2>
          <ul className="text-gray-300 text-lg space-y-2 text-left">
            <li>✔️ <b>Showcase your skills</b> and build your online presence</li>
            <li>✔️ <b>Connect</b> with a global audience and fellow authors</li>
            <li>✔️ <b>Grow your personal brand</b> and authority in your field</li>
            <li>✔️ <b>Get feedback</b> and engage with readers</li>
            <li>✔️ <b>Open new opportunities</b> for collaboration and recognition</li>
          </ul>
        </div>
        <div className="bg-gray-900/90 rounded-2xl p-8 shadow-xl flex flex-col items-center">
          <span className="text-4xl mb-3">🚀</span>
          <h2 className="text-2xl font-bold mb-3 text-purple-200">What You Get</h2>
          <ul className="text-gray-300 text-lg space-y-2 text-left">
            <li>✔️ <b>Easy-to-use editor</b> for rich, beautiful posts</li>
            <li>✔️ <b>Analytics</b> on your posts’ performance</li>
            <li>✔️ <b>Draft and publish</b> at your own pace</li>
            <li>✔️ <b>Category & tag management</b> for better reach</li>
            <li>✔️ <b>Comment and like system</b> to engage your readers</li>
          </ul>
        </div>
      </div>

      {/* Who Can Join */}
      <div className="relative z-10 mb-10 bg-purple-900/60 rounded-xl p-8 text-center max-w-3xl w-full shadow-lg">
        <h3 className="text-2xl font-bold mb-2 text-purple-200">Who Can Become an Author?</h3>
        <p className="text-gray-300 mb-2 text-lg">
          Anyone with a passion for writing, coding, or sharing knowledge! Whether you’re a seasoned developer, a student, or a hobbyist—your story matters.
        </p>
        <p className="text-gray-300 text-lg">
          <b>All you need:</b> An account and your unique perspective.
        </p>
      </div>

      {/* Testimonials */}
      <div className="relative z-10 mb-12 w-full max-w-5xl">
        <h2 className="text-3xl font-bold mb-6 text-center text-pink-200">What Our Authors Say</h2>
        <div className="grid gap-8 grid-cols-1 md:grid-cols-3">
          {testimonials.map((t) => (
            <div key={t.name} className="bg-gray-900/90 rounded-xl p-6 shadow-lg flex flex-col items-center">
              <img
                src={t.avatar}
                alt={t.name}
                className="w-16 h-16 rounded-full object-cover mb-3 border-2 border-purple-400"
              />
              <div className="font-bold text-lg text-purple-100 mb-1">{t.name}</div>
              <div className="text-sm text-gray-400 mb-2">{t.role}</div>
              <div className="text-gray-200 italic text-center">"{t.feedback}"</div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="relative z-10 flex flex-col items-center mb-8">
        <Link
          href="/signin"
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-10 py-4 rounded-xl font-bold text-white text-xl transition shadow-lg mb-4"
        >
          Join Now &rarr;
        </Link>
        <p className="text-gray-400 text-base">
          Already have an account? <Link href="/signin" className="text-purple-300 underline">Sign in here</Link>
        </p>
      </div>

      <section className="relative z-10 w-full max-w-3xl mx-auto my-12">
      <h2 className="text-3xl font-bold mb-6 text-center text-purple-200">Frequently Asked Questions</h2>
      <div className="space-y-4">
        {faqData.map((faq, idx) => (
          <div key={faq.question} className="bg-gray-900/80 rounded-lg shadow">
            <button
              className="w-full flex justify-between items-center px-6 py-4 text-lg font-semibold text-left text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
              onClick={() => toggle(idx)}
              aria-expanded={openIndex === idx}
              aria-controls={`faq-${idx}`}
            >
              <span>{faq.question}</span>
              <span className="ml-4 text-2xl text-purple-300">
                {openIndex === idx ? '−' : '+'}
              </span>
            </button>
            <div
              id={`faq-${idx}`}
              className={`overflow-hidden transition-all duration-300 px-6 ${
                openIndex === idx ? 'max-h-40 py-2' : 'max-h-0'
              }`}
              aria-hidden={openIndex !== idx}
            >
              <p className="text-gray-200 text-base">{faq.answer}</p>
            </div>
          </div>
        ))}
      </div>
    </section>


      {/* Closing */}
      <div className="relative z-10 mt-6 text-center text-gray-500 text-base">
        <p>
          <b>Coffee aur Code</b> is more than a blog—it's a community.<br />
          Start your journey, share your voice, and inspire others today!
        </p>
      </div>
    </main>

    );
  }
  if (!user) {
    // ... (keep your onboarding page code here)
    return (
      <main className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Please log in to access your dashboard.</h1>
          <Link
            href="/signin"
            className="mt-8 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-10 py-4 rounded-xl font-bold text-white text-xl transition shadow-lg"
          >
            Sign In
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen bg-gradient-to-br from-gray-900 to-black text-white px-4 py-10">
      <AnimatedBackground />
      <AnimatePresence>
        {showWelcome ? (
          <WelcomeSection key="welcome" />
        ) : (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            transition={{ duration: 0.7, type: 'spring' }}
          >
            <h1 className="text-4xl font-extrabold mb-8 text-center">My Blog Dashboard</h1>
            <div className="mb-8 max-w-3xl mx-auto">
              <input
                type="text"
                placeholder="🔍 Search your blogs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full p-3 rounded-lg bg-gray-800 text-white outline-none focus:ring-2 ring-purple-500 placeholder:text-purple-300"
              />
            </div>
            <div className="bg-gray-800 p-6 rounded-xl mb-12 shadow-lg max-w-4xl mx-auto space-y-4">
              <AnimatedError message={formError || ''} />
              {[{ value: title, set: setTitle, placeholder: 'Blog Title' },
                { value: category, set: setCategory, placeholder: 'Category / Topic' },
                { value: tags, set: setTags, placeholder: 'Tags (comma separated)' },
                { value: author, set: setAuthor, placeholder: 'Author Name' },
                { value: email, set: setEmail, placeholder: 'Author Email' },
                { value: shortDescription, set: setShortDescription, placeholder: 'Short Description' },
                { value: estimatedReadTime, set: setEstimatedReadTime, placeholder: 'Estimated Read Time (e.g., 5 min)' }]
                .map((field, idx) => (
                  <input
                    key={idx}
                    type="text"
                    className="w-full p-3 rounded bg-gray-700 text-white border-none outline-none placeholder:text-purple-300"
                    placeholder={field.placeholder}
                    value={field.value}
                    onChange={(e) => field.set(e.target.value)}
                    disabled={loading}
                  />
              ))}
              <div
                onClick={() => editor?.commands.focus()}
                className="bg-gray-900 rounded-md p-4 min-h-[200px] focus-within:ring-2 ring-purple-600 transition"
              >
                <EditorContent editor={editor} />
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={() => handlePost('published')}
                  disabled={loading}
                  className={`mt-2 px-6 py-2 rounded-md font-semibold transition ${
                    loading ? 'bg-purple-400 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700'
                  }`}
                >
                  {loading ? (editingId ? 'Updating...' : 'Publishing...') : (editingId ? 'Update Blog' : 'Publish')}
                </button>
                <button
                  type="button"
                  onClick={() => handlePost('draft')}
                  disabled={loading}
                  className="mt-2 px-6 py-2 rounded-md font-semibold bg-yellow-500 hover:bg-yellow-600 text-black transition"
                >
                  Save as Draft
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewOpen(true)}
                  className="mt-2 px-6 py-2 rounded-md font-semibold bg-blue-600 hover:bg-blue-700 transition"
                >
                  Preview
                </button>
                <button
                  type="button"
                  onClick={exportMarkdown}
                  className="mt-2 px-6 py-2 rounded-md font-semibold bg-green-600 hover:bg-green-700 transition"
                >
                  Export as Markdown
                </button>
                {editingId && (
                  <button
                    onClick={resetForm}
                    className="mt-2 px-6 py-2 rounded-md font-semibold bg-gray-600 hover:bg-gray-700 transition"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                )}
              </div>
              <div className="text-xs text-gray-400 mt-2">
                {autosaveStatus === 'saving' && <span>Autosaving draft...</span>}
                {autosaveStatus === 'saved' && <span className="text-green-400">Draft autosaved!</span>}
              </div>
            </div>
            {/* Preview Modal */}
            <AnimatePresence>
              {previewOpen && (
                <motion.div
                  className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70"
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  variants={modalVariants}
                >
                  <motion.div
                    className="bg-gray-900 rounded-lg shadow-xl p-8 max-w-xl w-full relative"
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <button
                      onClick={() => setPreviewOpen(false)}
                      className="absolute top-2 right-2 text-gray-400 hover:text-white text-2xl font-bold"
                    >×</button>
                    <h2 className="text-2xl font-bold mb-2">{title}</h2>
                    <div className="text-purple-400 mb-2">{category}</div>
                    <div className="prose prose-invert max-w-none mb-3 border-none"
                      style={{ border: 'none', boxShadow: 'none' }}
                      dangerouslySetInnerHTML={{ __html: editorContent }} />
                    <div className="text-xs text-gray-400 space-y-1">
                      <p><strong>Author:</strong> {author}</p>
                      <p><strong>Email:</strong> {email || 'N/A'}</p>
                      <p><strong>Summary:</strong> {shortDescription || 'N/A'}</p>
                      <p><strong>Read Time:</strong> {estimatedReadTime || 'N/A'}</p>
                      <p><strong>Tags:</strong> {tags || 'None'}</p>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
            {isFetching ? (
              <p className="text-center text-gray-400">Loading blogs...</p>
            ) : (
              <>
                <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  <AnimatePresence>
                    {paginatedBlogs.map((blog) => (
                      <motion.div
                        key={blog.id}
                        className="bg-gradient-to-br from-gray-800 via-gray-900 to-black p-6 rounded-xl shadow-lg flex flex-col justify-between hover:shadow-2xl transition"
                        variants={cardVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        whileHover={{ scale: 1.03, boxShadow: '0 8px 32px rgba(139,92,246,0.25)' }}
                      >
                        <div>
                          <div className="mb-1">{getStatusBadge(blog)}</div>
                          <h2 className="text-xl font-bold text-white mb-2">{blog.title}</h2>
                          <p className="text-sm text-purple-400 italic mb-2">{blog.category}</p>
                          <div
                            className="prose prose-invert max-w-none mb-3 max-h-40 overflow-y-auto border-none"
                            style={{ border: 'none', boxShadow: 'none' }}
                            dangerouslySetInnerHTML={{ __html: blog.content }}
                          />
                          <div className="text-xs text-gray-400 space-y-1">
                            <p><strong>Author:</strong> {blog.author}</p>
                            <p><strong>Email:</strong> {blog.email || 'N/A'}</p>
                            <p><strong>Summary:</strong> {blog.shortDescription || 'N/A'}</p>
                            <p><strong>Read Time:</strong> {blog.estimatedReadTime || 'N/A'}</p>
                            <p><strong>Date:</strong> {blog.createdAt?.toDate ? blog.createdAt.toDate().toLocaleString() : 'Saving...'}</p>
                            <p><strong>Tags:</strong> {blog.tags?.join(', ') || 'None'}</p>
                          </div>
                        </div>
                        <div className="mt-4 flex gap-2 flex-wrap">
                          <button
                            onClick={() => handleEdit(blog)}
                            className="bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-md text-white text-sm"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(blog.id)}
                            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-md text-white text-sm"
                          >
                            Delete
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </section>
                {/* Pagination Controls */}
                <motion.div
                  className="flex justify-center gap-2 my-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.4 }}
                >
                  <button disabled={page === 1} onClick={() => setPage(page - 1)}
                    className="px-4 py-2 rounded bg-gray-700 text-white">Prev</button>
                  <span className="px-4 py-2">{page}</span>
                  <button disabled={page * blogsPerPage >= filteredBlogs.length} onClick={() => setPage(page + 1)}
                    className="px-4 py-2 rounded bg-gray-700 text-white">Next</button>
                </motion.div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
