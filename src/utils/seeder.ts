import { drizzle } from 'drizzle-orm/postgres-js';
import { faker } from '@faker-js/faker';
import postgres from 'postgres';
import userTable from '../drizzle/schema/user';
import { eq } from 'drizzle-orm';
import argon2 from 'argon2';
import deliveryTable from '../drizzle/schema/delivery';

// Set up your database connection
const client = postgres(
  'postgresql://rms_owner:bKX4vWZGSq0P@ep-summer-bird-a5ncgk39.us-east-2.aws.neon.tech/rms?sslmode=require',
);

const db = drizzle(client);

interface User {
  name: string;
  email: string;
  password: string;
  levelId: number;
  role: 'MANAGER' | 'EMPLOYEE';
  deliveryId: number;
  reportingManagerId: number | null;
}

const generateRandomUser = async (
  isManager: boolean,
  levelId: number | null = null,
  deliveryId: number | null = null,
): Promise<User> => {
  const level =
    levelId ??
    (isManager
      ? faker.datatype.number({ min: 10, max: 13 })
      : faker.datatype.number({ min: 1, max: 9 }));
  const delivery = deliveryId ?? faker.datatype.number({ min: 1, max: 11 });

  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@bounteous.com`;
  const hashedPassword = await argon2.hash('12345678');

  return {
    name: `${firstName} ${lastName}`,
    email: email,
    password: hashedPassword,
    levelId: level,
    role: isManager ? 'MANAGER' : 'EMPLOYEE',
    deliveryId: delivery,
    reportingManagerId: null, // This will be set later
  };
};

const insertUser = async (user: User): Promise<number> => {
  const insertedUser = await db
    .insert(userTable)
    .values(user)
    .returning({ id: userTable.id })
    .execute();
  console.log(insertedUser[0]);
  return insertedUser[0].id;
};

const incrementEmployeeCount = async (deliveryId: number): Promise<void> => {
  const deliveryRes = await db
    .select({ employeeCount: deliveryTable.employeeCount })
    .from(deliveryTable)
    .where(eq(deliveryTable.id, deliveryId))
    .execute();

  if (deliveryRes.length === 0) {
    throw new Error('Delivery Not Found');
  }

  const prevEmpCount = deliveryRes[0].employeeCount ?? 0;

  await db
    .update(deliveryTable)
    .set({ employeeCount: prevEmpCount + 1 })
    .where(eq(deliveryTable.id, deliveryId))
    .execute();
};

const main = async () => {
  try {
    // Number of managers and employees to generate
    const numManagers = 80;
    const numEmployees = 420;

    // Insert highest level managers first
    const managersByLevelAndDelivery: {
      [level: number]: { [deliveryId: number]: number[] };
    } = {};
    for (let level = 13; level >= 10; level--) {
      managersByLevelAndDelivery[level] = {};
      for (let deliveryId = 1; deliveryId <= 11; deliveryId++) {
        managersByLevelAndDelivery[level][deliveryId] = [];
      }
    }

    // Insert managers
    for (let level = 13; level >= 10; level--) {
      const numManagersAtLevel =
        Math.floor(numManagers / 4) + (level === 10 ? numManagers % 4 : 0);
      for (let i = 0; i < numManagersAtLevel; i++) {
        const deliveryId = faker.datatype.number({ min: 1, max: 11 });
        const manager = await generateRandomUser(true, level, deliveryId);
        const managerId = await insertUser(manager);
        managersByLevelAndDelivery[level][deliveryId].push(managerId);
        await incrementEmployeeCount(deliveryId);
      }
    }

    // Set reporting managers for managers
    for (let level = 12; level >= 10; level--) {
      for (let deliveryId = 1; deliveryId <= 11; deliveryId++) {
        const higherLevelManagers: number[] = [];
        for (let higherLevel = level + 1; higherLevel <= 13; higherLevel++) {
          higherLevelManagers.push(
            ...managersByLevelAndDelivery[higherLevel][deliveryId],
          );
        }
        for (const managerId of managersByLevelAndDelivery[level][deliveryId]) {
          if (higherLevelManagers.length > 0) {
            const reportingManagerId =
              faker.helpers.arrayElement(higherLevelManagers);
            await db
              .update(userTable)
              .set({ reportingManagerId })
              .where(eq(userTable.id, managerId))
              .execute();
          }
        }
      }
    }

    // Insert employees and assign random managers
    for (let i = 0; i < numEmployees; i++) {
      const deliveryId = faker.datatype.number({ min: 1, max: 11 });
      const employee = await generateRandomUser(false, null, deliveryId);
      const potentialManagers: number[] = [];
      for (let level = 10; level <= 13; level++) {
        potentialManagers.push(
          ...managersByLevelAndDelivery[level][deliveryId],
        );
      }
      if (potentialManagers.length > 0) {
        employee.reportingManagerId =
          faker.helpers.arrayElement(potentialManagers);
      }
      await insertUser(employee);
      await incrementEmployeeCount(deliveryId);
    }
  } catch (error) {
    console.error('Error inserting users:', error);
  } finally {
    await client.end();
  }
};

main();
