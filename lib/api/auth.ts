import { getConnection } from '../db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function signUp(email: string, password: string) {
  const connection = await getConnection();
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await connection.execute(
      'INSERT INTO users (id, email, password) VALUES (UUID(), ?, ?)',
      [email, hashedPassword]
    );
    return result;
  } finally {
    await connection.end();
  }
}

export async function signIn(email: string, password: string) {
  const connection = await getConnection();
  try {
    const [rows]: any = await connection.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    
    if (rows.length === 0) {
      throw new Error('User not found');
    }

    const user = rows[0];
    const isValid = await bcrypt.compare(password, user.password);
    
    if (!isValid) {
      throw new Error('Invalid password');
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.NEXTAUTH_SECRET!,
      { expiresIn: '1d' }
    );

    return { user, token };
  } finally {
    await connection.end();
  }
}