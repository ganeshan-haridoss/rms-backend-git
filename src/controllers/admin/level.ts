import { Request, Response } from 'express';
import { z } from 'zod';
import db from '../../drizzle/db';
import levelTable, { insertLevelSchema } from '../../drizzle/schema/level';

export const createLevel = async (req: Request, res: Response) => {
  try {
    const validatedData = insertLevelSchema.parse(req.body);

    const result = await db
      .insert(levelTable)
      .values(validatedData)
      .returning();

    res
      .status(200)
      .send({ message: 'Level created successfully', user: result[0] });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).send({
        message: 'Validation Error',
        error: err.errors,
      });
      console.log(err);
    } else {
      console.log('Error creating Level: ', err);
      res.status(500).send({
        message: 'Error creating Level',
        error: err,
      });
    }
  }
};

export const getAllLevels = async (req: Request, res: Response) => {
  try {
    const result = await db.select().from(levelTable);

    res.status(200).json(result);
  } catch (err) {
    res.status(500).send({
      message: 'Error fetching Levels',
      error: err,
    });
  }
};
