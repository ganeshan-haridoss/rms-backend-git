import {
  AnyPgColumn,
  boolean,
  date,
  index,
  integer,
  pgEnum,
  pgTable,
  serial,
  varchar,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import levelTable from './level';
import deliveryTable from './delivery';
import projectAssigneeTable from './projectAssignee';
import requestTable from './request';
import userSkillsTable from './userSkills';
import { createInsertSchema } from 'drizzle-zod';

export const userRole = pgEnum('user_role', ['MANAGER', 'EMPLOYEE']);

const userTable = pgTable(
  'user',
  {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 50 }).notNull(),
    email: varchar('email', { length: 100 }).notNull().unique(), //idx
    password: varchar('password', { length: 255 }).notNull(),
    levelId: integer('level_id').references(() => levelTable.id),
    role: userRole('user_role').notNull(), //idx
    deliveryId: integer('delivery_id').references(() => deliveryTable.id), //idx
    reportingManagerId: integer('reporting_manager_id').references(
      (): AnyPgColumn => userTable.id,
    ), //idx
    dateOfBirth: date('date_of_birth'),
    dateOfJoining: date('date_of_joining'),
    yearsOfExperience: integer('years_of_experience'),
    // previousProjects - Array of Projects referring to Project Table -- Can use a join query get using projects with status completed
    resumeUrl: varchar('resume_url', { length: 255 }),
    expertise: varchar('expertise', { length: 50 }),
    totalBillable: integer('total_billable').default(0),
    passChanged: boolean('pass_changed').default(false),
  },
  (table) => {
    return {
      emailIdx: index('email_idx').on(table.email),
      roleIdx: index('role_idx').on(table.role),
      deliveryIdx: index('delivery_idx').on(table.deliveryId),
      reportingManagerIdx: index('reporting_manager_idx').on(
        table.reportingManagerId,
      ),
    };
  },
);

export const userRelations = relations(userTable, ({ one, many }) => ({
  projectAssignmentRef: many(projectAssigneeTable),
  requestsRef: many(requestTable),
  skillsRef: many(userSkillsTable),
  reportingManagerRef: one(userTable, {
    fields: [userTable.reportingManagerId],
    references: [userTable.id],
  }),
  deliveryRef: one(deliveryTable, {
    fields: [userTable.deliveryId],
    references: [deliveryTable.id],
  }),
  levelRef: one(levelTable, {
    fields: [userTable.levelId],
    references: [levelTable.id],
  }),
}));

export const insertUserSchema = createInsertSchema(userTable, {
  id: (schema) => schema.id.positive(),
  email: (schema) => schema.email.email(),
  password: (schema) => schema.password.min(8).max(16),
  dateOfBirth: (schema) => schema.dateOfBirth.optional(),
  dateOfJoining: (schema) => schema.dateOfJoining.optional(),
  yearsOfExperience: (schema) => schema.yearsOfExperience.optional(),
  resumeUrl: (schema) => schema.resumeUrl.optional(),
  expertise: (schema) => schema.expertise.optional(),
  totalBillable: (schema) => schema.totalBillable.optional().default(0),
});

// Write select schema using createSelectSchema(tableName)

export default userTable;
