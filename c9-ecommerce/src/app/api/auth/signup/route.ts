import { NextResponse } from 'next/server';
import pool from '@/app/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const { phone, password, fullName, email, address, username } = await req.json();

    if (!phone || !password || !fullName || !username) {
      return new NextResponse('Missing required fields: phone, password, fullName, username', { status: 400 });
    }

    const existingUser = await pool.query(
      'SELECT id FROM users WHERE phone = $1 OR username = $2',
      [phone, username]
    );

    if (existingUser.rows.length > 0) {
      return new NextResponse('User with this phone or username already exists.', { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await pool.query(
      'INSERT INTO users (phone, password, full_name, email, address, username) VALUES ($1, $2, $3, $4, $5, $6)',
      [phone, hashedPassword, fullName, email, address, username]
    );

    return new NextResponse(JSON.stringify({ message: 'User created successfully' }), { status: 201 });

  } catch (error) {
    console.error('[SIGNUP_ERROR]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
