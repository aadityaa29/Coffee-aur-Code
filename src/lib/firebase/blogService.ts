// lib/firebase/blogService.ts
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "@/app/firebase/firebaseConfig";

export const fetchBlogs = async () => {
  const q = query(collection(db, "blogs"), orderBy("createdAt", "desc"));
  const querySnapshot = await getDocs(q);
  const blogs: any[] = [];

  querySnapshot.forEach((doc) => {
    const data = doc.data();
    blogs.push({
      id: doc.id,
      title: data.title,
      excerpt: data.content.slice(0, 100) + "...",
      author: data.author,
      date: data.createdAt.toDate().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
    });
  });

  return blogs;
};
