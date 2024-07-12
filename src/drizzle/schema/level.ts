import { integer, pgTable, serial } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';

const levelTable = pgTable('level', {
  id: serial('id').primaryKey(),
  levelNumber: integer('level_number').notNull(),
});

export const insertLevelSchema = createInsertSchema(levelTable);

export default levelTable;
