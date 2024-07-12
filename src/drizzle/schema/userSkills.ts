//THIS IS A STRICTLY JOIN TABLE (and so is projectAssignee Table but it also has much more data)

import { index, integer, pgTable } from 'drizzle-orm/pg-core';
import userTable from './user';
import skillsTable from './skills';
import { relations } from 'drizzle-orm';
import { createInsertSchema } from 'drizzle-zod';

const userSkillsTable = pgTable(
  'user_skills',
  {
    userId: integer('user_id').references(() => userTable.id), //idx
    skillId: integer('skill_id').references(() => skillsTable.id), //idx
  },
  (table) => {
    return {
      userIdx: index('user_idx').on(table.userId),
      skillIdx: index('skill_idx').on(table.skillId),
    };
  }
);

export const userSkillsRelations = relations(userSkillsTable, ({ one }) => ({
  userRef: one(userTable, {
    fields: [userSkillsTable.userId],
    references: [userTable.id],
  }),
  skillRef: one(skillsTable, {
    fields: [userSkillsTable.skillId],
    references: [skillsTable.id],
  }),
}));

export const insertUserSkillSchema = createInsertSchema(userSkillsTable);

export default userSkillsTable;
