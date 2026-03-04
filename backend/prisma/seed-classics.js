import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting classics seed...');

  // Create a Korean translator persona
  const translator = await prisma.user.upsert({
    where: { email: 'soyeon.kim@example.com' },
    update: {},
    create: {
      email: 'soyeon.kim@example.com',
      name: '김소연',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face'
    },
  });

  // Create two classic literature books
  const [thePearl, mobyDick] = await Promise.all([
    prisma.book.create({
      data: {
        title: 'The Pearl',
        author: 'John Steinbeck',
        authorId: translator.id,
        coverImage: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400&h=600&fit=crop',
        description: 'A parable about a poor pearl diver who finds a magnificent pearl and the destruction it brings. Published in 1947, it explores themes of greed, fate, and the corruption of innocence.',
        language: 'en'
      },
    }),
    prisma.book.create({
      data: {
        title: 'Moby Dick',
        author: 'Herman Melville',
        authorId: translator.id,
        coverImage: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&h=600&fit=crop',
        description: 'The epic tale of Captain Ahab\'s obsessive quest to hunt the great white whale. Published in 1851, it is considered one of the Great American Novels.',
        language: 'en'
      },
    }),
  ]);

  // EN→KO translations for The Pearl
  const translationsData = [
    {
      originalText: "In the town they tell the story of the great pearl—how it was found and how it was lost again.",
      translatedText: "마을에서 사람들은 커다란 진주 이야기를 들려준다—어떻게 발견되었고, 어떻게 다시 잃어버렸는지를.",
      sourceLanguage: "en",
      targetLanguage: "ko",
      context: "Opening line of the novella",
      chapter: "Chapter 1",
      pageNumber: 1,
      bookId: thePearl.id,
      translatorId: translator.id
    },
    {
      originalText: "For it is said that humans are never satisfied, that you give them one thing and they want something more.",
      translatedText: "인간은 결코 만족하지 못한다고 한다. 하나를 주면 더 많은 것을 원한다고.",
      sourceLanguage: "en",
      targetLanguage: "ko",
      context: "Reflection on human nature and greed",
      chapter: "Chapter 3",
      pageNumber: 25,
      bookId: thePearl.id,
      translatorId: translator.id
    },
    {
      originalText: "He had lost one world and had not gained another.",
      translatedText: "그는 하나의 세계를 잃었고, 다른 세계를 얻지도 못했다.",
      sourceLanguage: "en",
      targetLanguage: "ko",
      context: "Kino's loss after finding the pearl",
      chapter: "Chapter 5",
      pageNumber: 67,
      bookId: thePearl.id,
      translatorId: translator.id
    },
    {
      originalText: "A plan is a real thing, and things projected are experienced. A plan once made and visualized becomes a reality along with other realities.",
      translatedText: "계획은 실재하는 것이며, 투영된 것들은 경험이 된다. 한번 세워지고 구상된 계획은 다른 현실들과 함께 현실이 된다.",
      sourceLanguage: "en",
      targetLanguage: "ko",
      context: "On the power of imagination and planning",
      chapter: "Chapter 3",
      pageNumber: 22,
      bookId: thePearl.id,
      translatorId: translator.id
    },
    {
      originalText: "The music of the pearl had merged with the music of the family so that one beautified the other.",
      translatedText: "진주의 노래가 가족의 노래와 어우러져 서로를 더욱 아름답게 했다.",
      sourceLanguage: "en",
      targetLanguage: "ko",
      context: "The pearl as a symbol of hope",
      chapter: "Chapter 2",
      pageNumber: 19,
      bookId: thePearl.id,
      translatorId: translator.id
    },

    // EN→KO translations for Moby Dick
    {
      originalText: "Call me Ishmael.",
      translatedText: "나를 이슈메일이라 불러다오.",
      sourceLanguage: "en",
      targetLanguage: "ko",
      context: "Opening line of the novel",
      chapter: "Chapter 1: Loomings",
      pageNumber: 1,
      bookId: mobyDick.id,
      translatorId: translator.id
    },
    {
      originalText: "It is not down on any map; true places never are.",
      translatedText: "그곳은 어떤 지도에도 나와 있지 않다. 진정한 장소는 결코 지도에 없는 법이다.",
      sourceLanguage: "en",
      targetLanguage: "ko",
      context: "On the nature of true discovery",
      chapter: "Chapter 12: Biographical",
      pageNumber: 55,
      bookId: mobyDick.id,
      translatorId: translator.id
    },
    {
      originalText: "I know not all that may be coming, but be it what it will, I'll go to it laughing.",
      translatedText: "무엇이 다가올지 나는 모른다. 하지만 무엇이든, 나는 웃으며 맞이하리라.",
      sourceLanguage: "en",
      targetLanguage: "ko",
      context: "Stubb's fearless attitude toward fate",
      chapter: "Chapter 39: First Night Watch",
      pageNumber: 168,
      bookId: mobyDick.id,
      translatorId: translator.id
    },
    {
      originalText: "There is a wisdom that is woe; but there is a woe that is madness.",
      translatedText: "슬픔 속에 지혜가 있고, 슬픔 속에 광기가 있다.",
      sourceLanguage: "en",
      targetLanguage: "ko",
      context: "Philosophical reflection on suffering",
      chapter: "Chapter 96: The Try-Works",
      pageNumber: 355,
      bookId: mobyDick.id,
      translatorId: translator.id
    },
    {
      originalText: "Better to sleep with a sober cannibal than a drunk Christian.",
      translatedText: "술 취한 기독교인보다 술 깬 식인종과 함께 자는 편이 낫다.",
      sourceLanguage: "en",
      targetLanguage: "ko",
      context: "Ishmael on his friendship with Queequeg",
      chapter: "Chapter 3: The Spouter-Inn",
      pageNumber: 24,
      bookId: mobyDick.id,
      translatorId: translator.id
    },
    {
      originalText: "From hell's heart I stab at thee; for hate's sake I spit my last breath at thee.",
      translatedText: "지옥의 심장으로부터 너를 찌른다. 증오를 위해 마지막 숨을 너에게 내뱉는다.",
      sourceLanguage: "en",
      targetLanguage: "ko",
      context: "Captain Ahab's final words to Moby Dick",
      chapter: "Chapter 135: The Chase—Third Day",
      pageNumber: 468,
      bookId: mobyDick.id,
      translatorId: translator.id
    },
  ];

  const createdTranslations = [];
  for (const translation of translationsData) {
    const created = await prisma.translation.create({
      data: translation
    });
    createdTranslations.push(created);
  }

  console.log('✅ Classics seed completed successfully');
  console.log(`👤 Created 1 user: ${translator.name}`);
  console.log(`📚 Created 2 books: ${thePearl.title}, ${mobyDick.title}`);
  console.log(`📝 Created ${createdTranslations.length} EN→KO translations`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
