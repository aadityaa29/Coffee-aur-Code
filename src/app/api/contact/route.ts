// app/api/contact/route.ts
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const data = await req.json();
  console.log('Contact form submitted:', data);

  // Normally: save to DB or send email

  return NextResponse.json({ message: 'Thanks for contacting us!' });
}
