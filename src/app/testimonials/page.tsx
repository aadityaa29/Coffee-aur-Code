"use client";

type Testimonial = {
  id: number;
  name: string;
  role: string;
  message: string;
  avatarUrl?: string;
};

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "Alice Johnson",
    role: "Product Manager",
    message:
      "This service completely transformed how I manage my projects. Highly recommended!",
    avatarUrl:
      "https://randomuser.me/api/portraits/women/44.jpg",
  },
  {
    id: 2,
    name: "Mark Thompson",
    role: "Software Engineer",
    message:
      "Excellent user experience and fantastic support. I use it every day!",
    avatarUrl:
      "https://randomuser.me/api/portraits/men/46.jpg",
  },
  {
    id: 3,
    name: "Sophia Lee",
    role: "Designer",
    message:
      "Beautiful design and very intuitive. Helped me speed up my workflow.",
    avatarUrl:
      "https://randomuser.me/api/portraits/women/68.jpg",
  },
];

export default function TestimonialsPage() {
  return (
    <div className="max-w-4xl mx-auto mt-16 px-4">
      <h1 className="text-4xl font-bold mb-12 text-purple-700 text-center">What Our Users Say</h1>
      <div className="grid gap-10 md:grid-cols-3">
        {testimonials.map(({ id, name, role, message, avatarUrl }) => (
          <div key={id} className="p-6 border rounded shadow-sm bg-white">
            <div className="flex items-center mb-4 space-x-4">
              {avatarUrl && (
                <img
                  src={avatarUrl}
                  alt={name}
                  className="w-14 h-14 rounded-full object-cover"
                />
              )}
              <div>
                <p className="font-semibold text-lg">{name}</p>
                <p className="text-sm text-gray-500">{role}</p>
              </div>
            </div>
            <p className="text-gray-700">&quot;{message}&quot;</p>
          </div>
        ))}
      </div>
    </div>
  );
}
