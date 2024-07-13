import { Request, Response } from 'express';
import userTable from '../../drizzle/schema/user';
import argon2 from 'argon2';
import db from '../../drizzle/db';
import { eq } from 'drizzle-orm';

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const result = await db
      .select()
      .from(userTable)
      .where(eq(userTable.email, email));
    if (result.length === 0) {
      return res.status(400).json({ error: 'Incorrect Email!' });
    }
    const user = result[0];
    const isPasswordValid = await argon2.verify(user.password, password);
    if (isPasswordValid) {
      if (!user.passChanged) {
        res.status(200).json({
          passChanged: user.passChanged,
          message: 'Password change required.',
        });
      } else {
        res.status(200).json({
          msg: 'Logged In Successfully!',
          role: user.role,
        });
      }
    } else {
      return res.status(400).json({ error: 'Incorrect Password' });
    }
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const changePassword = async (req: Request, res: Response) => {
  try {
    const { email, currentPassword, newPassword } = req.body;

    // Validate input
    if (!email || !currentPassword || !newPassword) {
      return res.status(400).json({ error: 'All fields are required!' });
    }

    const result = await db
      .select()
      .from(userTable)
      .where(eq(userTable.email, email));

    if (result.length === 0) {
      return res.status(400).json({ error: 'User not found!' });
    }

    const user = result[0];
    const isCurrentPasswordValid = await argon2.verify(
      user.password,
      currentPassword,
    );

    if (!isCurrentPasswordValid) {
      return res.status(400).json({ error: 'Current password is incorrect!' });
    }

    const hashedNewPassword = await argon2.hash(newPassword);

    await db
      .update(userTable)
      .set({ password: hashedNewPassword, passChanged: true })
      .where(eq(userTable.email, email));

    return res.status(200).json({ message: 'Password changed successfully!' });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};
