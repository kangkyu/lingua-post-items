import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting simple seed...');

  try {
    await prisma.bookmark.deleteMany({});
    await prisma.translation.deleteMany({});
    await prisma.user.deleteMany({});

    const janeAusten = await prisma.user.create({
      data: {
        email: 'jane.austen@example.com',
        name: 'Jane Austen',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616c6a10175?w=150&h=150&fit=crop&crop=face'
      },
    });

    const mariaTranslator = await prisma.user.create({
      data: {
        email: 'maria.translator@example.com',
        name: 'María García',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face'
      },
    });

    await prisma.translation.create({
      data: {
        originalText: "It is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife.",
        translatedText: "Es una verdad universalmente reconocida que todo hombre soltero en posesión de una gran fortuna necesita una esposa.",
        sourceLanguage: "en",
        targetLanguage: "es",
        context: "Opening line of the novel",
        chapter: "Chapter 1",
        pageNumber: 1,
        sourceName: "Pride and Prejudice",
        translatorId: mariaTranslator.id
      }
    });

    console.log('✅ Simple seed completed successfully');
    console.log(`👤 Created 2 users`);
    console.log(`📝 Created 1 translation`);

  } catch (error) {
    console.error('❌ Seed failed:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
