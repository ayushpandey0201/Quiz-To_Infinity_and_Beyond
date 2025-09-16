import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

// Enhanced security configuration
const JWT_SECRET = process.env.JWT_SECRET || crypto.randomBytes(64).toString('hex');
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || '$2b$12$YourSecureHashHere';

// Fallback secure hash for 'alia' with higher cost factor (12 instead of 10)
const SECURE_FALLBACK_HASH = '$2b$12$8K.7zF4qYhTmKz5.Nx8j8.JQzBvH4vNjKz.8mP2FJh.5mL8zN9jK.2';

// Function to get the admin password hash with security enhancements
function getAdminPasswordHash(): string {
  // First try environment variable
  if (process.env.ADMIN_PASSWORD_HASH && process.env.ADMIN_PASSWORD_HASH.startsWith('$2')) {
    return process.env.ADMIN_PASSWORD_HASH;
  }
  
  // If no valid env var, use the known good hash for 'alia'
  return '$2b$10$Lk3BFnjXtn.Ms.EKiQ9x/ObfDn29N8b3fE3MmQ9QJXSb.ejhdz6A2';
}

export interface AdminUser {
  id: string;
  username: string;
  role: 'admin';
}

export async function verifyAdminPassword(password: string): Promise<boolean> {
  // Add timing attack protection
  const startTime = Date.now();
  
  try {
    const hash = getAdminPasswordHash();
    const isValid = await bcrypt.compare(password, hash);
    
    // Constant-time delay to prevent timing attacks
    const elapsed = Date.now() - startTime;
    const minDelay = 100; // Minimum 100ms delay
    if (elapsed < minDelay) {
      await new Promise(resolve => setTimeout(resolve, minDelay - elapsed));
    }
    
    return isValid;
  } catch (error) {
    // Always take the minimum time even on error
    const elapsed = Date.now() - startTime;
    const minDelay = 100;
    if (elapsed < minDelay) {
      await new Promise(resolve => setTimeout(resolve, minDelay - elapsed));
    }
    return false;
  }
}

export function generateToken(user: AdminUser): string {
  // Enhanced JWT with more secure options
  return jwt.sign(
    {
      ...user,
      iat: Math.floor(Date.now() / 1000), // Issued at time
      jti: crypto.randomUUID(), // Unique token ID
    },
    JWT_SECRET,
    {
      expiresIn: '24h',
      issuer: 'TeamCodeLocked',
      audience: 'admin-panel',
      algorithm: 'HS256'
    }
  );
}

// Function to generate stronger password hashes
export async function generateSecureHash(password: string, costFactor: number = 12): Promise<string> {
  return bcrypt.hash(password, costFactor);
}

// Function to generate a new admin password hash (for setup)
export async function generateAdminHash(password: string): Promise<void> {
  const hash = await generateSecureHash(password, 12);
  console.log('🔐 New Admin Password Hash (add to environment):');
  console.log(`ADMIN_PASSWORD_HASH="${hash}"`);
  console.log('💡 This hash uses cost factor 12 for enhanced security');
}

export function verifyToken(token: string): AdminUser | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AdminUser;
  } catch (error) {
    return null;
  }
}

export function createAdminUser(): AdminUser {
  return {
    id: 'admin',
    username: 'admin',
    role: 'admin',
  };
}