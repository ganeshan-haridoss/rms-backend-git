import express from 'express';
import http from 'http';
import cors from 'cors';
import 'dotenv/config';
import adminRoutes from './routes/adminRoutes';
import managerRoutes from './routes/managerRoutes';
import commonRoutes from './routes/commonRoutes';

const app = express();
const server = http.createServer(app);

//Routes
console.log('hello');
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/admin', adminRoutes);
app.use('/manager', managerRoutes);
app.use('/', commonRoutes);

server.listen(process.env.PORT || 8000, () => {
  console.log('Server is live on port 8000');
});

// import { eq } from 'drizzle-orm';
// import { db } from './drizzle/db';
// import levelTable from './drizzle/schema/level';
// import deliveryTable, { deliveryType } from './drizzle/schema/delivery';
// import levelTable from './drizzle/schema/level';

// async function main() {
//   const users = await db
//     .insert(levelTable)
//     .values({
//       levelNumber: 54,
//     })
//     .returning({
//       id: levelTable.id,
//       number: levelTable.levelNumber,
//     });
//   console.log(users);
// const deleteRes = await db
//   .delete(levelTable)
//   .where(eq(levelTable.levelNumber, 54))
//   .returning({ deletedId: levelTable.id });

// const res = await db
//   .select({
//     employeeCount: deliveryTable.employeeCount,
//   })
//   .from(deliveryTable)
//   .where(eq(deliveryTable.name, 'FIT BU'));

// const prevEmpCount = res[0].employeeCount;
// if (prevEmpCount !== null) {
//   const updatedRes = await db
//     .update(deliveryTable)
//     .set({ employeeCount: prevEmpCount + 1 })
//     .where(eq(deliveryTable.name, 'FIT BU'))
//     .returning();
//   console.log(updatedRes);
// }
// console.log(res[0].employeeCount);
// }

// main();
