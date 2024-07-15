import { Request } from 'express';
import userTable from '../drizzle/schema/user';
import adminTable from '../drizzle/schema/admin';

export interface CustomUserRequest extends Request {
  user?: typeof userTable.$inferSelect;
}

export interface CustomAdminRequest extends Request {
  admin?: typeof adminTable.$inferSelect;
}
