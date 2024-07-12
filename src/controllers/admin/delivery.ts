import { Request, Response } from 'express';
import { z } from 'zod';
import db from '../../drizzle/db';
import deliveryTable, {
  insertDeliverySchema,
} from '../../drizzle/schema/delivery';
import { eq } from 'drizzle-orm';

export const createDelivery = async (req: Request, res: Response) => {
  try {
    const validatedData = insertDeliverySchema.parse(req.body);

    const result = await db
      .insert(deliveryTable)
      .values(validatedData)
      .returning();

    res
      .status(200)
      .send({ message: 'Delivery created successfully', user: result[0] });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).send({
        message: 'Validation Error',
        error: err.errors,
      });
      console.log(err);
    } else {
      console.log('Error creating Delivery: ', err);
      res.status(500).send({
        message: 'Error creating Delivery',
        error: err,
      });
    }
  }
};

export const getAllDelivery = async (req: Request, res: Response) => {
  try {
    const result = await db.select().from(deliveryTable);

    res.status(200).json(result);
  } catch (err) {
    res.status(500).send({
      message: 'Error fetching Deliveries',
      error: err,
    });
  }
};

export const updateVpDelivery = async (req: Request, res: Response) => {
  try {
    const updatedRes = await db
      .update(deliveryTable)
      .set({
        vpId: req.body.vpId,
      })
      .where(eq(deliveryTable.id, req.body.deliveryId))
      .returning();

    res.status(201).json({
      message: 'VP of Delivery updated.',
      updated: updatedRes,
    });
  } catch (err) {
    console.log("Error Updating Delivery's VP: ", err);
    res.status(500).send({
      message: 'Error creating user',
      error: err,
    });
  }
};
