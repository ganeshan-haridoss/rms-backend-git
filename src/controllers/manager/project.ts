import { Request, Response } from 'express';
import { z } from 'zod';
import db from '../../drizzle/db';
import projectTable, {
  insertProjectSchema,
} from '../../drizzle/schema/project';
import deliveryTable from '../../drizzle/schema/delivery';
import { eq } from 'drizzle-orm';

export const createProject = async (req: Request, res: Response) => {
  try {
    const validatedData = insertProjectSchema.parse(req.body);

    await db.transaction(async (trx) => {
      //Insert New Project into ProjectTable
      const newProject = await trx
        .insert(projectTable)
        .values(validatedData)
        .returning();

      if (typeof validatedData.deliveryId !== 'number') {
        throw new Error('DeliveryId does not exist');
      }

      //Fetch Previous Project Count
      const deliveryRes = await trx
        .select({
          deliveryName: deliveryTable.name,
          projectCount: deliveryTable.projectCount,
        })
        .from(deliveryTable)
        .where(eq(deliveryTable.id, validatedData.deliveryId));

      if (deliveryRes.length === 0) {
        throw new Error('Delivery Not Found');
      }
      const prevProjCount = deliveryRes[0].projectCount ?? 0;

      //Update Project Count
      await trx
        .update(deliveryTable)
        .set({
          projectCount: prevProjCount + 1,
        })
        .where(eq(deliveryTable.id, validatedData.deliveryId));

      res.status(201).json({
        message: 'Project Created successfully and ProjectCount updated',
        project: newProject,
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
      console.log('Error creating Project: ', err);
      res.status(500).send({
        message: 'Error creating Project',
        error: err,
      });
    }
  }
};

export const getAllProjects = async (req: Request, res: Response) => {
  try {
    const result = await db.select().from(projectTable);

    res.status(200).json(result);
  } catch (err) {
    res.status(500).send({
      message: 'Error fetching Projects',
      error: err,
    });
  }
};

export const updateProjectStatus = async (req: Request, res: Response) => {
  try {
    const { projectId, projectStatus } = req.body;

    if (!projectId || !projectStatus) {
      return res.status(400).json({
        error: 'Enter ProjectId and Status!',
      });
    }

    const updatedProject = await db
      .update(projectTable)
      .set({ projectStatus })
      .where(eq(projectTable.id, projectId))
      .returning();

    if (updatedProject.length === 0) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.status(200).json({
      message: 'Project status updated successfully',
      project: updatedProject[0],
    });
  } catch (error: any) {
    res
      .status(500)
      .json({ message: 'Internal Server Error', error: error.message });
  }
};
