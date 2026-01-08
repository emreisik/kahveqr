import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const prisma = new PrismaClient();

export interface AuthRequest extends Request {
  userId?: string;
  businessUser?: {
    id: string;
    email: string;
    name: string;
    role: string;
    brandId: string | null;
    branchId: string | null;
    isActive: boolean;
  };
}

// Regular user authentication
export const authenticateToken = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    req.userId = decoded.userId;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

// Business user authentication with role check
export const authenticateBusinessUser = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { businessUserId: string };
    
    // Fetch business user from database
    const businessUser = await prisma.businessUser.findUnique({
      where: { id: decoded.businessUserId },
    });

    if (!businessUser) {
      return res.status(404).json({ error: 'Business user not found' });
    }

    if (!businessUser.isActive) {
      return res.status(403).json({ error: 'Account is disabled' });
    }

    req.userId = businessUser.id;
    req.businessUser = {
      id: businessUser.id,
      email: businessUser.email,
      name: businessUser.name,
      role: businessUser.role,
      brandId: businessUser.brandId,
      branchId: businessUser.branchId,
      isActive: businessUser.isActive,
    };

    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

// Role-based access control middleware
export const requireRole = (allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.businessUser) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!allowedRoles.includes(req.businessUser.role)) {
      return res.status(403).json({ 
        error: 'Insufficient permissions',
        required: allowedRoles,
        current: req.businessUser.role,
      });
    }

    next();
  };
};

export const generateToken = (userId: string): string => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '30d' });
};

export const generateBusinessToken = (businessUserId: string): string => {
  return jwt.sign({ businessUserId }, JWT_SECRET, { expiresIn: '30d' });
};

