import {
  date,
  index,
  integer,
  pgEnum,
  pgTable,
  serial,
  varchar,
} from 'drizzle-orm/pg-core';
import deliveryTable from './delivery';
import userTable from './user';
import { relations } from 'drizzle-orm';
import projectAssigneeTable from './projectAssignee';
import { createInsertSchema } from 'drizzle-zod';

export const projectType = pgEnum('project_type', ['Retainer', 'Fixed', 'TNM']);

export const projectStatusEnum = pgEnum('project_status', [
  'NotStarted',
  'InProgress',
  'Completed',
  'OnHold',
]);

const projectTable = pgTable(
  'project',
  {
    id: serial('id').primaryKey(),
    projectName: varchar('project_name', { length: 50 }).notNull(), //idx
    clientName: varchar('name', { length: 50 }).notNull(), //idx
    deliveryId: integer('delivery_id') //idx
      .references(() => deliveryTable.id)
      .notNull(),
    managerId: integer('manager_id')
      .references(() => userTable.id)
      .notNull(), //idx
    projectType: projectType('project_type').notNull(), //idx
    startDate: date('start_date').notNull(),
    endDate: date('end_date'),
    projectStatus: projectStatusEnum('project_status').default('NotStarted'), //idx
  },
  (table) => {
    return {
      projectNameIdx: index('project_name_idx').on(table.projectName),
      clientNameIdx: index('client_name_idx').on(table.clientName),
      projectDeliveryIdx: index('project_delivery_idx').on(table.deliveryId),
      managerIdx: index('manager_idx').on(table.managerId),
      projectTypeIdx: index('project_type_idx').on(table.projectType),
      projectStatusIdx: index('project_status_idx').on(table.projectStatus),
    };
  }
);

export const projectRelations = relations(projectTable, ({ one, many }) => ({
  EmployeesAssignedRef: many(projectAssigneeTable),
  productManagerRef: one(userTable, {
    fields: [projectTable.managerId],
    references: [userTable.id],
  }),
  deliveryRef: one(deliveryTable, {
    fields: [projectTable.deliveryId],
    references: [deliveryTable.id],
  }),
}));

export const insertProjectSchema = createInsertSchema(projectTable, {
  endDate: (schema) => schema.endDate.optional(),
});

export default projectTable;
