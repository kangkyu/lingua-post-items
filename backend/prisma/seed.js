import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🧹 Clearing all tables...');

  await prisma.comment.deleteMany();
  await prisma.bookmark.deleteMany();
  await prisma.translation.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();

  console.log('🌱 Seeding users...');

  const [janeAusten, johnReader, mariaTranslator, cervantes, victorHugo, adminUser, kangkyuUser, kayUser, soyeonKim] = await Promise.all([
    prisma.user.create({
      data: {
        email: 'jane.austen@example.com',
        name: 'Jane Austen',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616c6a10175?w=150&h=150&fit=crop&crop=face'
      }
    }),
    prisma.user.create({
      data: {
        email: 'john.reader@example.com',
        name: 'John Smith',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face'
      }
    }),
    prisma.user.create({
      data: {
        email: 'maria.translator@example.com',
        name: 'María García',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face'
      }
    }),
    prisma.user.create({
      data: {
        email: 'miguel.cervantes@example.com',
        name: 'Miguel de Cervantes',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
      }
    }),
    prisma.user.create({
      data: {
        email: 'victor.hugo@example.com',
        name: 'Victor Hugo',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
      }
    }),
    prisma.user.create({
      data: {
        email: 'admin@lininglink.com',
        name: 'admin website',
        avatar: 'https://lh3.googleusercontent.com/a/ACg8ocKycuB4cddIBlCO0_93761zawdJ65X2ba6wPvqKB_VyMn2EQQ=s96-c'
      }
    }),
    prisma.user.create({
      data: {
        email: 'kangkyu1111@gmail.com',
        name: 'Kang-Kyu Lee',
        avatar: 'https://lh3.googleusercontent.com/a/ACg8ocJC8r74iZr1uzPyu2_lGBpXg3vMf088XRG95ES4nuHUxOSwNrOL=s96-c'
      }
    }),
    prisma.user.create({
      data: {
        email: 'websitekay@gmail.com',
        name: 'kay website',
        avatar: 'https://lh3.googleusercontent.com/a/ACg8ocIdzOZrjhHwzgocX0i72Ut4zCug1IZc2bpHhCYfSyu7Ib2rfQ=s96-c'
      }
    }),
    prisma.user.create({
      data: {
        email: 'soyeon.kim@example.com',
        name: '김소연',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face'
      }
    }),
  ]);

  console.log('📝 Seeding translations...');

  const translationsData = [
    {
      originalText: "It is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife.",
      translatedText: "Es una verdad universalmente reconocida que todo hombre soltero en posesión de una gran fortuna necesita una esposa.",
      sourceLanguage: "en", targetLanguage: "es",
      context: "Opening line of the novel", chapter: "Chapter 1", pageNumber: 1,
      sourceName: "Pride and Prejudice", translatorId: mariaTranslator.id
    },
    {
      originalText: "It is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife.",
      translatedText: "C'est une vérité universellement reconnue qu'un homme célibataire en possession d'une bonne fortune doit être en quête d'une épouse.",
      sourceLanguage: "en", targetLanguage: "fr",
      context: "Opening line of the novel", chapter: "Chapter 1", pageNumber: 1,
      sourceName: "Pride and Prejudice", translatorId: victorHugo.id
    },
    {
      originalText: "I could easily forgive his pride, if he had not mortified mine.",
      translatedText: "Podría perdonar fácilmente su orgullo, si no hubiera herido el mío.",
      sourceLanguage: "en", targetLanguage: "es",
      context: "Elizabeth about Darcy", chapter: "Chapter 5", pageNumber: 15,
      sourceName: "Pride and Prejudice", translatorId: mariaTranslator.id
    },
    {
      originalText: "You must allow me to tell you how ardently I admire and love you.",
      translatedText: "Debe permitirme decirle cuán ardientemente la admiro y la amo.",
      sourceLanguage: "en", targetLanguage: "es",
      context: "Darcy's proposal", chapter: "Chapter 34", pageNumber: 175,
      sourceName: "Pride and Prejudice", translatorId: mariaTranslator.id
    },

    {
      originalText: "En un lugar de la Mancha, de cuyo nombre no quiero acordarme, no ha mucho tiempo que vivía un hidalgo de los de lanza en astillero, adarga antigua, rocín flaco y galgo corredor.",
      translatedText: "In a village of La Mancha, the name of which I have no desire to call to mind, there lived not long ago one of those gentlemen that keep a lance in the lance-rack, an old buckler, a lean hack, and a greyhound for coursing.",
      sourceLanguage: "es", targetLanguage: "en",
      context: "Opening line of Don Quixote", chapter: "Chapter 1", pageNumber: 1,
      sourceName: "Don Quixote", translatorId: janeAusten.id
    },
    {
      originalText: "La libertad, Sancho, es uno de los más preciosos dones que a los hombres dieron los cielos.",
      translatedText: "Freedom, Sancho, is one of the most precious gifts that heaven has bestowed upon men.",
      sourceLanguage: "es", targetLanguage: "en",
      context: "Don Quixote on freedom", chapter: "Chapter 58", pageNumber: 420,
      sourceName: "Don Quixote", translatorId: johnReader.id
    },
    {
      originalText: "La libertad, Sancho, es uno de los más preciosos dones que a los hombres dieron los cielos.",
      translatedText: "La liberté, Sancho, est l'un des dons les plus précieux que le ciel ait accordés aux hommes.",
      sourceLanguage: "es", targetLanguage: "fr",
      context: "Don Quixote on freedom", chapter: "Chapter 58", pageNumber: 420,
      sourceName: "Don Quixote", translatorId: victorHugo.id
    },
    {
      originalText: "In a village of La Mancha, the name of which I have no desire to call to mind, there lived not long ago one of those gentlemen that keep a lance in the lance-rack, an old buckler, a lean hack, and a greyhound for coursing.",
      translatedText: "라 만차의 어느 마을에는 얼마전까지 어느 신사가 살았는데 그에게는 창 방패 말 사냥개가 있었다.",
      sourceLanguage: "en", targetLanguage: "ko",
      context: null, chapter: null, pageNumber: null,
      sourceName: "Don Quixote", translatorId: adminUser.id
    },
    {
      originalText: "In a village of La Mancha, the name of which I have no desire to call to mind, there lived not long ago one of those gentlemen that keep a lance in the lance-rack, an old buckler, a lean hack, and a greyhound for coursing.",
      translatedText: "라만차에 있는, 그 이름을 떠올리고 싶지는 않은 어느 마을에, 그리 오래되지 않은 예전에, 창 걸이에 걸린 창 하나, 낡은 방패, 그리고 날씬한 말 하나와 사냥개가 하나 있는 그런 신사 가운데 한 분이 살았습니다.",
      sourceLanguage: "en", targetLanguage: "ko",
      context: null, chapter: null, pageNumber: null,
      sourceName: "Don Quixote", translatorId: adminUser.id
    },

    {
      originalText: "Il faut, voyez-vous, des émotions aux hommes heureux.",
      translatedText: "Happy people need emotions, you see.",
      sourceLanguage: "fr", targetLanguage: "en",
      context: "Philosophical reflection", chapter: "Book 1, Chapter 3", pageNumber: 45,
      sourceName: "Les Misérables", translatorId: janeAusten.id
    },
    {
      originalText: "Aimer, c'est agir.",
      translatedText: "To love is to act.",
      sourceLanguage: "fr", targetLanguage: "en",
      context: "Victor Hugo's philosophy", chapter: "Book 4, Chapter 1", pageNumber: 234,
      sourceName: "Les Misérables", translatorId: johnReader.id
    },
    {
      originalText: "Aimer, c'est agir.",
      translatedText: "Amar es actuar.",
      sourceLanguage: "fr", targetLanguage: "es",
      context: "Victor Hugo's philosophy", chapter: "Book 4, Chapter 1", pageNumber: 234,
      sourceName: "Les Misérables", translatorId: mariaTranslator.id
    },

    {
      originalText: "The family of Dashwood had long been settled in Sussex.",
      translatedText: "La familia Dashwood había estado establecida en Sussex durante mucho tiempo.",
      sourceLanguage: "en", targetLanguage: "es",
      context: "Opening of the novel", chapter: "Chapter 1", pageNumber: 1,
      sourceName: "Sense and Sensibility", translatorId: mariaTranslator.id
    },
    {
      originalText: "Know your own happiness. You want nothing but patience- or give it a more fascinating name, call it hope.",
      translatedText: "Conoce tu propia felicidad. No necesitas nada más que paciencia, o dale un nombre más fascinante: llámala esperanza.",
      sourceLanguage: "en", targetLanguage: "es",
      context: "Advice on happiness", chapter: "Chapter 48", pageNumber: 312,
      sourceName: "Sense and Sensibility", translatorId: mariaTranslator.id
    },

    {
      originalText: "Mrs. Dalloway said she would buy the flowers herself.",
      translatedText: "댈러웨이 부인은 꽃을 사러 직접 간다고 했다.",
      sourceLanguage: "en", targetLanguage: "ko",
      context: null, chapter: null, pageNumber: null,
      sourceName: "Mrs Dalloway", translatorId: adminUser.id
    },

    {
      originalText: "In the town they tell the story of the great pearl—how it was found and how it was lost again.",
      translatedText: "마을에서 사람들은 커다란 진주 이야기를 들려준다—어떻게 발견되었고, 어떻게 다시 잃어버렸는지를.",
      sourceLanguage: "en", targetLanguage: "ko",
      context: "Opening line of the novella", chapter: "Chapter 1", pageNumber: 1,
      sourceName: "The Pearl", translatorId: soyeonKim.id
    },
    {
      originalText: "For it is said that humans are never satisfied, that you give them one thing and they want something more.",
      translatedText: "인간은 결코 만족하지 못한다고 한다. 하나를 주면 더 많은 것을 원한다고.",
      sourceLanguage: "en", targetLanguage: "ko",
      context: "Reflection on human nature and greed", chapter: "Chapter 3", pageNumber: 25,
      sourceName: "The Pearl", translatorId: soyeonKim.id
    },
    {
      originalText: "He had lost one world and had not gained another.",
      translatedText: "그는 하나의 세계를 잃었고, 다른 세계를 얻지도 못했다.",
      sourceLanguage: "en", targetLanguage: "ko",
      context: "Kino's loss after finding the pearl", chapter: "Chapter 5", pageNumber: 67,
      sourceName: "The Pearl", translatorId: soyeonKim.id
    },
    {
      originalText: "A plan is a real thing, and things projected are experienced. A plan once made and visualized becomes a reality along with other realities.",
      translatedText: "계획은 실재하는 것이며, 투영된 것들은 경험이 된다. 한번 세워지고 구상된 계획은 다른 현실들과 함께 현실이 된다.",
      sourceLanguage: "en", targetLanguage: "ko",
      context: "On the power of imagination and planning", chapter: "Chapter 3", pageNumber: 22,
      sourceName: "The Pearl", translatorId: soyeonKim.id
    },
    {
      originalText: "The music of the pearl had merged with the music of the family so that one beautified the other.",
      translatedText: "진주의 노래가 가족의 노래와 어우러져 서로를 더욱 아름답게 했다.",
      sourceLanguage: "en", targetLanguage: "ko",
      context: "The pearl as a symbol of hope", chapter: "Chapter 2", pageNumber: 19,
      sourceName: "The Pearl", translatorId: soyeonKim.id
    },

    {
      originalText: "Call me Ishmael.",
      translatedText: "나를 이슈메일이라 불러다오.",
      sourceLanguage: "en", targetLanguage: "ko",
      context: "Opening line of the novel", chapter: "Chapter 1: Loomings", pageNumber: 1,
      sourceName: "Moby Dick", translatorId: soyeonKim.id
    },
    {
      originalText: "It is not down on any map; true places never are.",
      translatedText: "그곳은 어떤 지도에도 나와 있지 않다. 진정한 장소는 결코 지도에 없는 법이다.",
      sourceLanguage: "en", targetLanguage: "ko",
      context: "On the nature of true discovery", chapter: "Chapter 12: Biographical", pageNumber: 55,
      sourceName: "Moby Dick", translatorId: soyeonKim.id
    },
    {
      originalText: "I know not all that may be coming, but be it what it will, I'll go to it laughing.",
      translatedText: "무엇이 다가올지 나는 모른다. 하지만 무엇이든, 나는 웃으며 맞이하리라.",
      sourceLanguage: "en", targetLanguage: "ko",
      context: "Stubb's fearless attitude toward fate", chapter: "Chapter 39: First Night Watch", pageNumber: 168,
      sourceName: "Moby Dick", translatorId: soyeonKim.id
    },
    {
      originalText: "There is a wisdom that is woe; but there is a woe that is madness.",
      translatedText: "슬픔 속에 지혜가 있고, 슬픔 속에 광기가 있다.",
      sourceLanguage: "en", targetLanguage: "ko",
      context: "Philosophical reflection on suffering", chapter: "Chapter 96: The Try-Works", pageNumber: 355,
      sourceName: "Moby Dick", translatorId: soyeonKim.id
    },
    {
      originalText: "Better to sleep with a sober cannibal than a drunk Christian.",
      translatedText: "술 취한 기독교인보다 술 깬 식인종과 함께 자는 편이 낫다.",
      sourceLanguage: "en", targetLanguage: "ko",
      context: "Ishmael on his friendship with Queequeg", chapter: "Chapter 3: The Spouter-Inn", pageNumber: 24,
      sourceName: "Moby Dick", translatorId: soyeonKim.id
    },
    {
      originalText: "From hell's heart I stab at thee; for hate's sake I spit my last breath at thee.",
      translatedText: "지옥의 심장으로부터 너를 찌른다. 증오를 위해 마지막 숨을 너에게 내뱉는다.",
      sourceLanguage: "en", targetLanguage: "ko",
      context: "Captain Ahab's final words to Moby Dick", chapter: "Chapter 135: The Chase—Third Day", pageNumber: 468,
      sourceName: "Moby Dick", translatorId: soyeonKim.id
    },
  ];

  const createdTranslations = [];
  for (const translation of translationsData) {
    const created = await prisma.translation.create({ data: translation });
    createdTranslations.push(created);
  }

  const findTranslation = (textSubstring, translatorId) =>
    createdTranslations.find(t => t.originalText.includes(textSubstring) && t.translatorId === translatorId);

  console.log('🔖 Seeding bookmarks...');

  const bookmarkData = [
    { userId: johnReader.id, translationId: createdTranslations[0].id },
    { userId: johnReader.id, translationId: createdTranslations[2].id },

    { userId: mariaTranslator.id, translationId: findTranslation('Il faut', janeAusten.id).id },

    { userId: janeAusten.id, translationId: findTranslation('Aimer', mariaTranslator.id).id },

    { userId: victorHugo.id, translationId: createdTranslations[3].id },

    { userId: adminUser.id, translationId: findTranslation('Know your own happiness', mariaTranslator.id).id },

    { userId: kangkyuUser.id, translationId: findTranslation('Know your own happiness', mariaTranslator.id).id },
    { userId: kangkyuUser.id, translationId: findTranslation('Mrs. Dalloway', adminUser.id).id },
    { userId: kangkyuUser.id, translationId: createdTranslations.find(t => t.translatedText.includes('라만차에 있는')).id },
    { userId: kangkyuUser.id, translationId: findTranslation('family of Dashwood', mariaTranslator.id).id },
  ];

  for (const bookmark of bookmarkData) {
    await prisma.bookmark.create({ data: bookmark });
  }

  console.log('✅ Seed completed successfully');
  console.log(`👤 ${9} users`);
  console.log(`📝 ${createdTranslations.length} translations`);
  console.log(`🔖 ${bookmarkData.length} bookmarks`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
