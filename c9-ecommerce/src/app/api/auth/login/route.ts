import { NextResponse } from 'next/server';
import pool from '@/app/lib/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { serialize } from 'cookie';

export async function POST(req: Request) {
  try {
    const { phone, password } = await req.json();

    if (!phone || !password) {
      return new NextResponse('Phone and password are required', { status: 400 });
    }

    const userResult = await pool.query('SELECT * FROM users WHERE phone = $1', [phone]);

    if (userResult.rows.length === 0) {
      return new NextResponse('Invalid credentials', { status: 401 });
    }

    const user = userResult.rows[0];
    const passwordsMatch = await bcrypt.compare(password, user.password);

    if (!passwordsMatch) {
      return new NextResponse('Invalid credentials', { status: 401 });
    }

    const token = jwt.sign(
      { userId: user.id, username: user.username },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' } // Token expires in 7 days
    );

    const cookie = serialize('authToken', token, {
      httpOnly: true, // Prevents client-side JS from accessing the cookie
      secure: process.env.NODE_ENV === 'production', // Only send over HTTPS in production
      sameSite: 'strict', // Mitigates CSRF attacks
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/',
    });

    return new NextResponse(JSON.stringify({ message: 'Login successful' }), {
      status: 200,
      headers: { 'Set-Cookie': cookie },
    });

  } catch (error) {
    console.error('[LOGIN_ERROR]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
