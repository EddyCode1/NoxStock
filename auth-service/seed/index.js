import { seedMasterUser } from './seedMasterUser.js';
import { seedUsers } from './seedUsers.js';

export const runAuthSeeds = async () => {
  await seedMasterUser();
  await seedUsers();
};

export default runAuthSeeds;
