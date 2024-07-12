import { date, index, integer, pgEnum, pgTable } from 'drizzle-orm/pg-core';
import projectTable from './project';
import userTable from './user';
import { relations } from 'drizzle-orm';
import { createInsertSchema } from 'drizzle-zod';

export const workType = pgEnum('work_type', ['Shadow', 'Billable']);

const projectAssigneeTable = pgTable(
  'project_assignee',
  {
    projectId: integer('project_id') //idx
      .references(() => projectTable.id)
      .notNull(),
    userId: integer('user_id') //idx
      .references(() => userTable.id)
      .notNull(),
    workType: workType('work_type').notNull(),
    billablePercentage: integer('billable_percentage').default(0),
    startDate: date('start_date').notNull(),
    endDate: date('end_date'),
  },
  (table) => {
    return {
      projectIdx: index('project_idx').on(table.projectId),
      assignedUserIdx: index('assigned_user_idx').on(table.userId),
    };
  }
);

export const projectAssigneeRelations = relations(
  projectAssigneeTable,
  ({ one }) => ({
    projectAssigneeRef: one(userTable, {
      fields: [projectAssigneeTable.userId],
      references: [userTable.id],
    }),
    projectRef: one(projectTable, {
      fields: [projectAssigneeTable.projectId],
      references: [projectTable.id],
    }),
  })
);

export const insertProjectAssigneeSchema = createInsertSchema(
  projectAssigneeTable,
  {
    endDate: (schema) => schema.endDate.optional(),
  }
);

export default projectAssigneeTable;
