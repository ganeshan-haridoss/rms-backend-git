import {
  integer,
  PgColumn,
  pgEnum,
  pgTable,
  serial,
  varchar,
} from 'drizzle-orm/pg-core';
import userTable from './user';
import { relations } from 'drizzle-orm';
import projectTable from './project';
import { createInsertSchema } from 'drizzle-zod';

export const deliveryType = pgEnum('delivery_type', [
  'Business Unit',
  'Practice',
]);

const deliveryTable = pgTable('delivery', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 25 }).notNull(),
  type: deliveryType('type').notNull(),
  vpId: integer('vp_id').references((): PgColumn => userTable.id), //Please Check this
  employeeCount: integer('employee_count').default(0),
  projectCount: integer('project_count').default(0),
});

export const deliveryRelations = relations(deliveryTable, ({ one, many }) => ({
  vpRef: one(userTable, {
    fields: [deliveryTable.vpId],
    references: [userTable.id],
  }),
  projectRef: many(projectTable),
}));

export const insertDeliverySchema = createInsertSchema(deliveryTable, {
  vpId: (schema) => schema.vpId.optional(),
});

export default deliveryTable;
