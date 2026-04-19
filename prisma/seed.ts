import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const CRYPT_SALT = process.env.CRYPT_SALT;

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Starting database seeding...');

  const hashedPassword = await hash('password123', CRYPT_SALT);

  const admin = await prisma.user.upsert({
    where: { login: 'admin' },
    update: {},
    create: {
      login: 'admin',
      password: hashedPassword,
      role: 'admin',
    },
  });

  const editor = await prisma.user.upsert({
    where: { login: 'editor' },
    update: {},
    create: {
      login: 'editor',
      password: hashedPassword,
      role: 'editor',
    },
  });

  const viewer = await prisma.user.upsert({
    where: { login: 'viewer' },
    update: {},
    create: {
      login: 'viewer',
      password: hashedPassword,
      role: 'viewer',
    },
  });

  console.log('✅ Users created');

  const categories = await Promise.all([
    prisma.category.upsert({
      where: { id: '00000000-0000-0000-0000-000000000001' },
      update: { description: 'Articles about modern technologies' },
      create: {
        id: '00000000-0000-0000-0000-000000000001',
        name: 'Technology',
        description: 'Articles about modern technologies',
      },
    }),

    prisma.category.upsert({
      where: { id: '00000000-0000-0000-0000-000000000002' },
      update: { description: 'Programming languages and best practices' },
      create: {
        id: '00000000-0000-0000-0000-000000000002',
        name: 'Programming',
        description: 'Programming languages and best practices',
      },
    }),

    prisma.category.upsert({
      where: { id: '00000000-0000-0000-0000-000000000003' },
      update: { name: 'Science' },
      create: {
        id: '00000000-0000-0000-0000-000000000003',
        name: 'Science',
        description: 'Scientific discoveries and research',
      },
    }),

    prisma.category.upsert({
      where: { id: '00000000-0000-0000-0000-000000000004' },
      update: { name: 'Business' },
      create: {
        id: '00000000-0000-0000-0000-000000000004',
        name: 'Business',
        description: 'Business, startups and entrepreneurship',
      },
    }),
  ]);

  console.log('✅ Categories created');

  const tags = await Promise.all([
    prisma.tag.upsert({
      where: { name: 'nestjs' },
      update: {},
      create: { name: 'nestjs' },
    }),
    prisma.tag.upsert({
      where: { name: 'typescript' },
      update: {},
      create: { name: 'typescript' },
    }),
    prisma.tag.upsert({
      where: { name: 'prisma' },
      update: {},
      create: { name: 'prisma' },
    }),
    prisma.tag.upsert({
      where: { name: 'docker' },
      update: {},
      create: { name: 'docker' },
    }),
    prisma.tag.upsert({
      where: { name: 'backend' },
      update: {},
      create: { name: 'backend' },
    }),
    prisma.tag.upsert({
      where: { name: 'javascript' },
      update: {},
      create: { name: 'javascript' },
    }),
  ]);

  console.log('✅ Tags created');

  // ==================== ARTICLES ====================
  await prisma.article.create({
    data: {
      title: 'Getting Started with NestJS and Prisma',
      content:
        'In this article we explore how to build scalable backend applications...',
      status: 'published',
      authorId: admin.id,
      categoryId: categories[0].id,
      tags: {
        connect: [{ id: tags[0].id }, { id: tags[1].id }, { id: tags[2].id }],
      },
    },
  });

  await prisma.article.create({
    data: {
      title: 'Advanced TypeScript Patterns',
      content:
        'Deep dive into conditional types, generics and utility types...',
      status: 'published',
      authorId: editor.id,
      categoryId: categories[1].id,
      tags: {
        connect: [{ id: tags[1].id }, { id: tags[5].id }],
      },
    },
  });

  await prisma.article.create({
    data: {
      title: 'Docker for Beginners',
      content: 'Learn how to containerize your applications...',
      status: 'draft',
      authorId: admin.id,
      categoryId: categories[0].id,
      tags: {
        connect: [{ id: tags[3].id }],
      },
    },
  });

  await prisma.article.create({
    data: {
      title: 'Why Backend Development Still Matters',
      content:
        'Exploring the importance of backend in modern web development...',
      status: 'published',
      authorId: editor.id,
      categoryId: categories[3].id,
      tags: {
        connect: [{ id: tags[4].id }],
      },
    },
  });

  await prisma.article.create({
    data: {
      title: 'The Rise of Quantum Computing',
      content:
        'Discover how quantum computers are set to revolutionize computing and solve problems beyond classical capabilities...',
      status: 'published',
      authorId: admin.id,
      categoryId: categories[2].id,
    },
  });

  await prisma.article.create({
    data: {
      title: 'Optimizing Performance in Node.js Applications',
      content:
        'Techniques and best practices for improving speed, scalability, and efficiency in Node.js backend services...',
      status: 'published',
      authorId: editor.id,
      categoryId: categories[1].id,
      tags: {
        connect: [{ id: tags[4].id }, { id: tags[5].id }],
      },
    },
  });

  console.log('✅ Articles created');

  await prisma.comment.create({
    data: {
      content: 'Great article! Very helpful for beginners.',
      authorId: viewer.id,
      articleId: (await prisma.article.findFirst({
        where: { title: { contains: 'NestJS' } },
      }))!.id,
    },
  });

  await prisma.comment.create({
    data: {
      content: 'I would love to see more examples with real-world projects.',
      authorId: editor.id,
      articleId: (await prisma.article.findFirst({
        where: { title: { contains: 'TypeScript' } },
      }))!.id,
    },
  });

  await prisma.comment.create({
    data: {
      content: 'Fascinating insights into quantum computing!',
      authorId: viewer.id,
      articleId: (await prisma.article.findFirst({
        where: { title: { contains: 'Quantum' } },
      }))!.id,
    },
  });

  await prisma.comment.create({
    data: {
      content: 'These optimization tips are really useful for production apps.',
      authorId: editor.id,
      articleId: (await prisma.article.findFirst({
        where: { title: { contains: 'Node.js' } },
      }))!.id,
    },
  });

  console.log('✅ Comments created');
  console.log('🎉 Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
