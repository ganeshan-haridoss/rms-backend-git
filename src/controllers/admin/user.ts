import { Request, Response } from 'express';
import userTable, { insertUserSchema } from '../../drizzle/schema/user';
import { z } from 'zod';
import argon2 from 'argon2';
import db from '../../drizzle/db';
import deliveryTable from '../../drizzle/schema/delivery';
import { eq } from 'drizzle-orm';
import adminTable, { insertAdminSchema } from '../../drizzle/schema/admin';
import jwt from 'jsonwebtoken';

export const createAdmin = async (req: Request, res: Response) => {
  try {
    const validatedData = insertAdminSchema.parse(req.body);

    const hashedPassword = await argon2.hash(validatedData.password);
    const adminData = {
      ...req.body,
      password: hashedPassword,
    };

    const result = await db.insert(adminTable).values(adminData).returning();

    res
      .status(200)
      .send({ message: 'Admin created successfully', user: result[0] });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).send({
        message: 'Validation Error',
        error: err.errors,
      });
      console.log(err);
    } else {
      console.log('Error creating Admin: ', err);
      res.status(500).send({
        message: 'Error creating Admin',
        error: err,
      });
    }
  }
};

export const createUser = async (req: Request, res: Response) => {
  try {
    const validatedData = insertUserSchema.parse(req.body);

    await db.transaction(async (trx) => {
      //Create A User First - Heading

      //Hashing Password
      const hashedPassword = await argon2.hash(validatedData.password);
      const userData = {
        ...req.body,
        password: hashedPassword,
      };
      //Insert New User into UserTable
      const newUser = await trx.insert(userTable).values(userData).returning();

      if (typeof validatedData.deliveryId !== 'number') {
        throw new Error('DeliveryId does not exist');
      }

      //Fetch Previous Employee Count
      const deliveryRes = await trx
        .select({
          deliveryName: deliveryTable.name,
          employeeCount: deliveryTable.employeeCount,
        })
        .from(deliveryTable)
        .where(eq(deliveryTable.id, validatedData.deliveryId));

      if (deliveryRes.length === 0) {
        throw new Error('Delivery Not Found');
      }
      const prevEmpCount = deliveryRes[0].employeeCount ?? 0;

      //Update Employee Count
      await trx
        .update(deliveryTable)
        .set({
          employeeCount: prevEmpCount + 1,
        })
        .where(eq(deliveryTable.id, validatedData.deliveryId));

      res.status(201).json({
        message: 'User Created successfully and EmployeeCount updated',
        user: newUser,
      });
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).send({
        message: 'Validation Error',
        error: err.errors,
      });
      console.log(err);
    } else {
      console.log('Error creating user: ', err);
      res.status(500).send({
        message: 'Error creating user',
        error: err,
      });
    }
  }
};

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const result = await db.select().from(userTable);

    res.status(200).json(result);
  } catch (err) {
    res.status(500).send({
      message: 'Error fetching Users',
      error: err,
    });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const result = await db
      .select()
      .from(adminTable)
      .where(eq(adminTable.email, email));
    if (result.length === 0) {
      return res.status(400).json({ error: 'Incorrect Email!' });
    }
    const admin = result[0];
    const isPasswordValid = await argon2.verify(admin.password, password);
    if (isPasswordValid) {
      let token = jwt.sign(
        { id: admin.id, name: admin.name, role: 'ADMIN' },
        process.env.API_SECRET!,
        {
          expiresIn: 86400,
        },
      );
      res.status(200).json({
        name: admin.name,
        message: 'Logged In As Admin Successfully',
        accessToken: token,
      });
    } else {
      return res.status(400).json({ error: 'Incorrect Password' });
    }
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const getPotentialVp = async (req: Request, res: Response) => {
  try {
    const result = await db
      .select({
        id: userTable.id,
        name: userTable.name,
        email: userTable.email,
      })
      .from(userTable)
      .where(eq(userTable.levelId, 13));

    if (result.length === 0) {
      res.status(400).json({ error: 'No Employees Found with Level13' });
    } else {
      res.status(200).json(result);
    }
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};
