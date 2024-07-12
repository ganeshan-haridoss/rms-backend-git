import { relations } from 'drizzle-orm';
import { pgTable, serial, varchar } from 'drizzle-orm/pg-core';
import userSkillsTable from './userSkills';
import { createInsertSchema } from 'drizzle-zod';

const skillsTable = pgTable('skills', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
});

export const skillsRelations = relations(skillsTable, ({ many }) => ({
  userSkillRef: many(userSkillsTable),
}));

export const insertSkillSchema = createInsertSchema(skillsTable);

export default skillsTable;
