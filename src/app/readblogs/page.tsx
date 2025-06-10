'use client';

import { useEffect, useState } from 'react';
import { db } from '@/app/firebase/firebaseConfig';
import { collection, onSnapshot, QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';
import Modal from '@/components/modal';

// Define the Blog type
interface Blog {
  id: string;
  title: string;
  author: string;
  email?: string;
  category?: string;
  content: string;
  shortDescription?: string;
  estimatedReadTime?: string;
  tags?: string[];
  isDeleted?: boolean;
}

export default function ReadBlogPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null);

  useEffect(() => {
    const q = collection(db, 'blogs');
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data: Blog[] = snapshot.docs.map(
          (doc: QueryDocumentSnapshot<DocumentData>) => ({
            id: doc.id,
            ...(doc.data() as Omit<Blog, 'id'>),
          })
        );
        setBlogs(data.filter((blog) => !blog.isDeleted));
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching blogs:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Group blogs by category
  const groupedBlogs = blogs.reduce<Record<string, Blog[]>>((acc, blog) => {
    const category = blog.category || 'Uncategorized';
    if (!acc[category]) acc[category] = [];
    acc[category].push(blog);
    return acc;
  }, {});

  // Helper: Get short preview from HTML content
  function getExcerpt(html: string, maxLength = 120) {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    const text = tempDiv.textContent || tempDiv.innerText || '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  }

  if (loading) return <p className="text-center mt-10 text-white">Loading blogs...</p>;

  return (
    <main className="min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-4xl font-bold mb-8 text-center">All Blogs by Category</h1>
      <section className="max-w-4xl mx-auto">
        {Object.keys(groupedBlogs).length === 0 && (
          <p className="text-center text-gray-400">No blogs available.</p>
        )}
        {Object.entries(groupedBlogs).map(([category, blogs]) => (
          <div key={category} className="mb-10">
            <h2 className="text-2xl font-bold mb-4 text-purple-300">{category}</h2>
            <ul className="space-y-4">
              {blogs.map((blog) => (
                <li
                  key={blog.id}
                  className="bg-gray-800 rounded-lg p-4 shadow cursor-pointer hover:bg-gray-700 transition"
                  onClick={() => setSelectedBlog(blog)}
                >
                  <h3 className="text-xl font-semibold">{blog.title}</h3>
                  <div className="text-sm text-gray-400 mb-1">
                    Author: {blog.author} | Email: {blog.email || 'N/A'}
                  </div>
                  {blog.shortDescription && (
                    <div className="mb-1 text-gray-300">{blog.shortDescription}</div>
                  )}
                  {blog.estimatedReadTime && (
                    <div className="mb-1 text-gray-400">
                      Estimated Read Time: {blog.estimatedReadTime}
                    </div>
                  )}
                  <div className="mb-2 text-gray-200 text-sm">
                    {getExcerpt(blog.content)}
                  </div>
                  {blog.tags && blog.tags.length > 0 && (
                    <div className="text-xs text-gray-400">
                      Tags: {blog.tags.join(', ')}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>
      {/* Modal for full blog */}
      <Modal show={!!selectedBlog} onClose={() => setSelectedBlog(null)}>
        {selectedBlog && (
          <div>
            <h2 className="text-2xl font-bold mb-2">{selectedBlog.title}</h2>
            <div className="text-sm text-gray-400 mb-1">
              Author: {selectedBlog.author} | Email: {selectedBlog.email || 'N/A'}
            </div>
            {selectedBlog.shortDescription && (
              <div className="mb-1 text-gray-300">{selectedBlog.shortDescription}</div>
            )}
            {selectedBlog.estimatedReadTime && (
              <div className="mb-1 text-gray-400">
                Estimated Read Time: {selectedBlog.estimatedReadTime}
              </div>
            )}
            <div
              className="prose prose-invert max-w-none mb-2"
              dangerouslySetInnerHTML={{ __html: selectedBlog.content }}
            />
            {selectedBlog.tags && selectedBlog.tags.length > 0 && (
              <div className="text-sm text-gray-400 mb-2">
                Tags: {selectedBlog.tags.join(', ')}
              </div>
            )}
            <div className="text-sm text-gray-400">
              Category: {selectedBlog.category || 'N/A'}
            </div>
          </div>
        )}
      </Modal>
    </main>
  );
}
