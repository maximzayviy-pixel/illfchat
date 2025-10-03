import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  phoneNumber?: string;
  createdAt: Date;
}

// Простое хранилище пользователей в памяти (в реальном приложении используйте базу данных)
const users: User[] = [];
const userPasswords: { [userId: string]: string } = {};

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword);
}

export function generateToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): { userId: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string };
  } catch {
    return null;
  }
}

export async function createUser(username: string, email: string, password: string): Promise<User> {
  // Проверяем, не существует ли пользователь
  const existingUser = users.find(u => u.email === email || u.username === username);
  if (existingUser) {
    throw new Error('Пользователь с таким email или именем уже существует');
  }

  const hashedPassword = await hashPassword(password);
  const user: User = {
    id: Math.random().toString(36).substring(2, 15),
    username,
    email,
    phoneNumber: generatePhoneNumber(),
    createdAt: new Date(),
  };

  users.push(user);
  userPasswords[user.id] = hashedPassword;

  return user;
}

function generatePhoneNumber(): string {
  // Генерируем номер в формате +666-XXX-XXXX
  const areaCode = Math.floor(Math.random() * 900) + 100; // 100-999
  const number = Math.floor(Math.random() * 9000) + 1000; // 1000-9999
  return `+666-${areaCode}-${number}`;
}

export async function authenticateUser(email: string, password: string): Promise<User | null> {
  const user = users.find(u => u.email === email);
  if (!user) {
    return null;
  }

  const hashedPassword = userPasswords[user.id];
  if (!hashedPassword) {
    return null;
  }

  const isValid = await verifyPassword(password, hashedPassword);
  return isValid ? user : null;
}

export function getUserById(userId: string): User | null {
  return users.find(u => u.id === userId) || null;
}

export function getAllUsers(): User[] {
  return users;
}
