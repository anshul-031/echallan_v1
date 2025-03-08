import { query } from '../db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function signUp(email: string, password: string) {
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await query<{ id: string }>(`
      INSERT INTO users (email, password)
      VALUES ($1, $2)
      RETURNING id
    `, [email, hashedPassword]);
    
    return result[0];
  } catch (error: any) {
    if (error.code === '23505') { // Unique violation
      throw new Error('Email already exists');
    }
    throw error;
  }
}

export async function signIn(email: string, password: string) {
  const users = await query<{
    id: string;
    email: string;
    password: string;
    role: string;
  }>('SELECT * FROM users WHERE email = $1', [email]);

  if (users.length === 0) {
    throw new Error('User not found');
  }

  const user = users[0];
  const isValid = await bcrypt.compare(password, user.password);

  if (!isValid) {
    throw new Error('Invalid password');
  }

  const token = jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    process.env.NEXTAUTH_SECRET!,
    { expiresIn: '1d' }
  );

  return {
    user: {
      id: user.id,
      email: user.email,
      role: user.role
    },
    token
  };
}