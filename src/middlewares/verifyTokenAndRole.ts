import jwt from 'jsonwebtoken';
import { NextFunction, Response } from 'express';
import userTable from '../drizzle/schema/user';
import db from '../drizzle/db';
import { eq } from 'drizzle-orm';
import { CustomAdminRequest, CustomUserRequest } from '../types/CustomRequest';
import adminTable from '../drizzle/schema/admin';

interface JwtPayload {
  id: string;
  role: string;
}

export const verifyTokenAndRole = (requiredRole: string) => {
  return async (req: CustomUserRequest, res: Response, next: NextFunction) => {
    if (
      req.headers &&
      req.headers.authorization &&
      req.headers.authorization.split(' ')[0] === 'JWT'
    ) {
      jwt.verify(
        req.headers.authorization.split(' ')[1],
        process.env.API_SECRET!,
        async (err, decode) => {
          if (err) {
            return res.status(401).json({ msg: 'Unauthorized' });
          }

          const decoded = decode as JwtPayload;

          try {
            const result = await db
              .select()
              .from(userTable)
              .where(eq(userTable.id, parseInt(decoded.id)));

            const user = result[0];
            if (!user) {
              return res.status(404).json({ msg: 'User not found' });
            }
            if (user.role !== requiredRole) {
              return res
                .status(403)
                .json({ msg: 'Access forbidden: Insufficient privileges' });
            }
            req.user = user;
            next();
          } catch (err) {
            res.status(500).send({ msg: err });
          }
        },
      );
    } else {
      return res.status(400).send({ msg: 'Token not provided' });
    }
  };
};

export const verifyTokenForAdmin = async (
  req: CustomAdminRequest,
  res: Response,
  next: NextFunction,
) => {
  console.log('in the verify token for admin middleware');

  if (
    req.headers &&
    req.headers.authorization &&
    req.headers.authorization.split(' ')[0] === 'JWT'
  ) {
    console.log('in the verify token for admin middleware');
    jwt.verify(
      req.headers.authorization.split(' ')[1],
      process.env.API_SECRET!,
      async (err, decode) => {
        if (err) {
          return res.status(401).json({ msg: 'Unauthorized' });
        }

        const decoded = decode as JwtPayload;

        try {
          const result = await db
            .select()
            .from(adminTable)
            .where(eq(adminTable.id, parseInt(decoded.id)));

          const admin = result[0];
          if (!admin) {
            return res.status(404).json({ msg: 'User not found' });
          }
          if (decoded.role !== 'ADMIN') {
            return res
              .status(403)
              .json({ msg: 'Access forbidden: Insufficient privileges' });
          }
          req.admin = admin;
          next();
        } catch (err) {
          res.status(500).send({ msg: err });
        }
      },
    );
  } else {
    return res.status(400).send({ msg: 'Token not provided' });
  }
};
