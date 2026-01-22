import { PrismaClient } from '@prisma/client';
import locationsData from '../data/locations.json';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // Clear existing data in correct order (respecting foreign keys)
  await prisma.gameRound.deleteMany();
  await prisma.game.deleteMany();
  await prisma.location.deleteMany();
  console.log('Cleared existing data');

  // Create locations from JSON
  for (const location of locationsData) {
    await prisma.location.create({
      data: {
        title: location.title,
        panoUrl: location.panoUrl,
        lat: location.lat,
        lng: location.lng,
        country: location.country || null,
        region: location.region || null,
      },
    });
  }

  console.log(`Created ${locationsData.length} locations`);
  console.log('Seed completed!');
}

main()
  .catch((e) => {
    console.error('Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
