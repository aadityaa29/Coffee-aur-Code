'use client';

import { useEffect, useState } from 'react';
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
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [blogs, setBlogs] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [newCategory, setNewCategory] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [isFetching, setIsFetching] = useState(true);

  // Form state for create/edit post
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [formTags, setFormTags] = useState('');
  const [status, setStatus] = useState('draft'); // 'draft' or 'published'
  const [formError, setFormError] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  // Auth state
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
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

  // Fetch categories/tags (simple: read all from blogs)
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'blogs'), (snapshot) => {
      const cats = new Set<string>();
      const tgs = new Set<string>();
      snapshot.docs.forEach((doc) => {
        const data = doc.data();
        if (data.category) cats.add(data.category);
        if (Array.isArray(data.tags)) data.tags.forEach((t: string) => tgs.add(t));
      });
      setCategories(Array.from(cats));
      setTags(Array.from(tgs));
    });
    return () => unsubscribe();
  }, []);

  // Overview stats
  const totalPosts = blogs.length;
  const publishedCount = blogs.filter((b) => b.status !== 'draft' && !b.isDeleted).length;
  const draftCount = blogs.filter((b) => b.status === 'draft' && !b.isDeleted).length;

  // Category/Tag management (simple: just add to list, not a separate collection)
  const handleAddCategory = async () => {
    if (!newCategory.trim()) return;
    setCategories((prev) => [...prev, newCategory.trim()]);
    setNewCategory('');
  };
  const handleAddTag = async () => {
    if (!newTag.trim()) return;
    setTags((prev) => [...prev, newTag.trim()]);
    setNewTag('');
  };

  // Blog delete (soft delete)
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this blog?')) return;
    try {
      await updateDoc(doc(db, 'blogs', id), { isDeleted: true });
    } catch (err) {
      alert('Delete error');
    }
  };

  // Start editing a post
  const handleEdit = (blog: any) => {
    setEditingId(blog.id);
    setTitle(blog.title || '');
    setContent(blog.content || '');
    setCategory(blog.category || '');
    setFormTags((blog.tags || []).join(', '));
    setStatus(blog.status || 'draft');
    setFormError(null);
  };

  // Reset form
  const resetForm = () => {
    setEditingId(null);
    setTitle('');
    setContent('');
    setCategory('');
    setFormTags('');
    setStatus('draft');
    setFormError(null);
  };

  // Create or update post (draft or published)
  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) {
      setFormError('Title and Content are required');
      return;
    }
    setFormLoading(true);
    setFormError(null);

    const blogData = {
      title,
      content,
      category,
      tags: formTags.split(',').map((tag) => tag.trim()).filter(Boolean),
      author: user.displayName || user.email || 'User',
      authorId: user.uid,
      status,
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
      setFormError('Failed to save post');
    } finally {
      setFormLoading(false);
    }
  };

  if (!user) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-indigo-900 to-gray-900 text-white">
        <div className="bg-gray-800 p-8 rounded-lg shadow-lg text-center">
          <h1 className="text-2xl font-bold mb-4">Please Login</h1>
          <p className="mb-4">You must be logged in to access the dashboard.</p>
          <a
            href="/signin"
            className="inline-block bg-purple-600 hover:bg-purple-700 px-6 py-2 rounded text-white font-semibold"
          >
            Go to Login
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-gray-900 text-white p-6">
      <h1 className="text-4xl font-bold mb-6 text-center">Dashboard</h1>
      {/* Overview */}
      <section className="mb-8 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
        <div className="bg-gray-800 p-6 rounded-lg shadow flex flex-col items-center">
          <span className="text-2xl font-bold">{totalPosts}</span>
          <span className="text-gray-400">Total Posts</span>
        </div>
        <div className="bg-gray-800 p-6 rounded-lg shadow flex flex-col items-center">
          <span className="text-2xl font-bold">{publishedCount}</span>
          <span className="text-gray-400">Published</span>
        </div>
        <div className="bg-gray-800 p-6 rounded-lg shadow flex flex-col items-center">
          <span className="text-2xl font-bold">{draftCount}</span>
          <span className="text-gray-400">Drafts</span>
        </div>
      </section>

      {/* Create/Edit Post */}
      <section className="max-w-4xl mx-auto mb-10">
        <h2 className="text-2xl font-bold mb-4">{editingId ? "Edit Post" : "Create New Post"}</h2>
        <form onSubmit={handlePost} className="bg-gray-800 p-6 rounded-lg shadow space-y-4 mb-8">
          {formError && <div className="text-red-400">{formError}</div>}
          <input
            type="text"
            placeholder="Title"
            className="w-full p-2 rounded bg-gray-700"
            value={title}
            onChange={e => setTitle(e.target.value)}
            disabled={formLoading}
          />
          <textarea
            placeholder="Content"
            className="w-full p-2 rounded bg-gray-700 min-h-[120px]"
            value={content}
            onChange={e => setContent(e.target.value)}
            disabled={formLoading}
          />
          <input
            type="text"
            placeholder="Category"
            className="w-full p-2 rounded bg-gray-700"
            value={category}
            onChange={e => setCategory(e.target.value)}
            disabled={formLoading}
          />
          <input
            type="text"
            placeholder="Tags (comma separated)"
            className="w-full p-2 rounded bg-gray-700"
            value={formTags}
            onChange={e => setFormTags(e.target.value)}
            disabled={formLoading}
          />
          <select
            value={status}
            onChange={e => setStatus(e.target.value)}
            className="w-full p-2 rounded bg-gray-700"
            disabled={formLoading}
          >
            <option value="draft">Save as Draft</option>
            <option value="published">Publish</option>
          </select>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={formLoading}
              className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded text-white font-semibold"
            >
              {editingId ? (formLoading ? 'Saving...' : 'Update Post') : (formLoading ? 'Saving...' : 'Save Post')}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-600 hover:bg-gray-800 px-4 py-2 rounded text-white font-semibold"
                disabled={formLoading}
              >
                Cancel Edit
              </button>
            )}
          </div>
        </form>
      </section>

      {/* Posts Management */}
      <section className="max-w-4xl mx-auto mb-10">
        <h2 className="text-2xl font-bold mb-4">Your Posts</h2>
        {isFetching ? (
          <div className="text-center text-gray-300">Loading...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left bg-gray-800 rounded-lg overflow-hidden">
              <thead>
                <tr className="bg-gray-700 text-purple-200">
                  <th className="px-4 py-2">Title</th>
                  <th className="px-4 py-2">Date</th>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {blogs
                  .filter((b) => !b.isDeleted)
                  .map((blog) => (
                  <tr key={blog.id} className="border-b border-gray-700">
                    <td className="px-4 py-2">{blog.title}</td>
                    <td className="px-4 py-2">
                      {blog.createdAt?.toDate
                        ? blog.createdAt.toDate().toLocaleDateString()
                        : 'Saving...'}
                    </td>
                    <td className="px-4 py-2 capitalize">{blog.status || 'published'}</td>
                    <td className="px-4 py-2 flex gap-2">
                      <button
                        onClick={() => handleEdit(blog)}
                        className="bg-indigo-600 hover:bg-indigo-800 px-3 py-1 rounded text-white text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(blog.id)}
                        className="bg-red-600 hover:bg-red-800 px-3 py-1 rounded text-white text-sm"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Categories/Tags Management */}
      <section className="max-w-4xl mx-auto mb-10">
        <h2 className="text-2xl font-bold mb-4">Categories</h2>
        <div className="flex gap-2 flex-wrap mb-2">
          {categories.map((cat) => (
            <span key={cat} className="bg-purple-700 px-3 py-1 rounded text-white text-sm">{cat}</span>
          ))}
        </div>
        <form
          onSubmit={e => {
            e.preventDefault();
            handleAddCategory();
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            placeholder="New category"
            className="p-2 rounded bg-gray-700 text-white"
            value={newCategory}
            onChange={e => setNewCategory(e.target.value)}
          />
          <button
            type="submit"
            className="bg-purple-600 hover:bg-purple-700 px-3 py-1 rounded text-white text-sm"
          >
            Add
          </button>
        </form>
        <h2 className="text-2xl font-bold mb-4 mt-8">Tags</h2>
        <div className="flex gap-2 flex-wrap mb-2">
          {tags.map((tag) => (
            <span key={tag} className="bg-pink-700 px-3 py-1 rounded text-white text-sm">{tag}</span>
          ))}
        </div>
        <form
          onSubmit={e => {
            e.preventDefault();
            handleAddTag();
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            placeholder="New tag"
            className="p-2 rounded bg-gray-700 text-white"
            value={newTag}
            onChange={e => setNewTag(e.target.value)}
          />
          <button
            type="submit"
            className="bg-pink-600 hover:bg-pink-700 px-3 py-1 rounded text-white text-sm"
          >
            Add
          </button>
        </form>
      </section>
    </main>
  );
}
