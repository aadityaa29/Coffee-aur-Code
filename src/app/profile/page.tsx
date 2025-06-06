'use client';

import { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged, updateProfile } from 'firebase/auth';

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [displayName, setDisplayName] = useState('');
  const [photoURL, setPhotoURL] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setDisplayName(firebaseUser?.displayName || '');
      setPhotoURL(firebaseUser?.photoURL || '');
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    if (!user) return;
    try {
      await updateProfile(user, {
        displayName,
        photoURL: photoURL || undefined,
      });
      setMessage('Profile updated successfully!');
    } catch (err: any) {
      setMessage('Failed to update profile.');
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <div>Loading...</div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <div className="bg-gray-800 p-8 rounded-lg shadow-lg text-center">
          <h1 className="text-2xl font-bold mb-4">Please Login</h1>
          <p className="mb-4">You must be logged in to view your profile.</p>
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
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-indigo-900 to-gray-900 text-white">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-3xl font-bold mb-6 text-center">User Profile</h1>
        {message && <p className="mb-4 text-green-400">{message}</p>}
        <div className="flex flex-col items-center mb-4">
          {user.photoURL ? (
            <img
              src={user.photoURL}
              alt="Profile"
              className="w-24 h-24 rounded-full object-cover mb-2"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-gray-700 flex items-center justify-center mb-2">
              <span className="text-3xl">{user.displayName ? user.displayName[0] : user.email[0]}</span>
            </div>
          )}
          <span className="text-lg font-semibold">{user.displayName || 'No Name Set'}</span>
          <span className="text-sm text-gray-400">{user.email}</span>
        </div>
        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div>
            <label className="block mb-1">Display Name</label>
            <input
              type="text"
              className="w-full p-2 rounded bg-gray-700"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
            />
          </div>
          <div>
            <label className="block mb-1">Photo URL</label>
            <input
              type="text"
              className="w-full p-2 rounded bg-gray-700"
              value={photoURL}
              onChange={e => setPhotoURL(e.target.value)}
              placeholder="https://example.com/photo.jpg"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-purple-600 hover:bg-purple-700 p-2 rounded font-bold mt-2"
          >
            Update Profile
          </button>
        </form>
      </div>
    </main>
  );
}
