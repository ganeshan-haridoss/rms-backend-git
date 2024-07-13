import {
  index,
  integer,
  json,
  pgEnum,
  pgTable,
  serial,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';
import userTable from './user';
import { relations } from 'drizzle-orm';
import { createInsertSchema } from 'drizzle-zod';

export const requestStatusEnum = pgEnum('request_status', [
  'Pending',
  'Approved',
  'Denied',
]);

const requestTable = pgTable(
  'request',
  {
    id: serial('id').primaryKey(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
    senderId: integer('sender_id') //idx
      .references(() => userTable.id)
      .notNull(),
    receiverId: integer('receiver_id') //idx
      .references(() => userTable.id)
      .notNull(),
    resourceId: integer('resource_id') //idx
      .references(() => userTable.id)
      .notNull(),
    requestBody: json('request_body').notNull(),
    message: varchar('message', { length: 255 }).notNull(),
    requestStatus: requestStatusEnum('request_status').default('Pending'), //idx
  },
  (table) => {
    return {
      senderIdx: index('sender_idx').on(table.senderId),
      receiverIdx: index('receiver_idx').on(table.receiverId),
      resourceIdx: index('resource_idx').on(table.resourceId),
      requestStatusIdx: index('status_idx').on(table.requestStatus),
    };
  },
);

export const requestRelations = relations(requestTable, ({ one }) => ({
  senderRef: one(userTable, {
    fields: [requestTable.senderId],
    references: [userTable.id],
  }),
  receiverRef: one(userTable, {
    fields: [requestTable.receiverId],
    references: [userTable.id],
  }),
  resourceRef: one(userTable, {
    fields: [requestTable.resourceId],
    references: [userTable.id],
  }),
}));

export const insertRequestSchema = createInsertSchema(requestTable);

export default requestTable;

//Ideas to make use of Reuqest Body

// Example request body structure for a hypothetical request
// const requestExample = {
//   preferences: {
//     theme: 'dark',
//     notifications: true,
//   },
//   details: {
//     urgency: 'high',
//     priority: 1,
//   },
//   additionalInfo: {
//     comments: 'Urgent request for project approval',
//     attachments: ['file1.pdf', 'file2.docx'],
//   },
// };

// // Example usage in a request data object
// const requestData = {
//   senderId: 123,
//   receiverId: 456,
//   resourceId: 789,
//   requestBody: requestExample, // Example use of request body
//   message: 'Sample request message',
//   status: 'Pending',
// };

// // Insert into requestTable with the request body
// try {
//   insertRequestSchema.parse(requestData); // Validate and insert request data
//   console.log('Request data with requestBody is valid');
// } catch (e) {
//   console.error('Request data with requestBody is invalid', e.errors);
// }
