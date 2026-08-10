import { defineCollection, z, reference } from 'astro:content';
import { glob } from 'astro/loaders';

const territoireSchema = z.enum(['construire', 'comprendre', 'reflechir']);
const schemaTypeSchema = z.enum(['BlogPosting', 'HowTo', 'FAQPage']);
const projectColorSchema = z.enum(['cyan', 'warm', 'purple', 'green', 'pink']);
const projectStatusSchema = z.enum([
  'en-cours',
  'live',
  'entretien',
  'termine',
  'archive',
]);
const projectTypeSchema = z.enum(['work', 'perso', 'coup-de-main', 'outil']);

const articles = defineCollection({
  // Keystatic stocke chaque article comme src/content/articles/<slug>/index.mdoc
  loader: glob({ pattern: '**/*.{md,mdoc,mdx}', base: './src/content/articles' }),
  schema: z.object({
    title: z.string().max(120),
    territory: territoireSchema.default('construire'),
    publishedAt: z.coerce.date(),
    // Date de publication programmée : tant qu'elle est dans le futur,
    // l'article est exclu du build (cf. filtres dans les pages + cron scheduled-publish).
    scheduledPublishAt: z.coerce.date().optional(),
    updatedAt: z.coerce.date().optional(),
    summary: z.string().min(50).max(220),
    readingTime: z.number().optional(),
    essentiel: z
      .object({
        sousTitre: z.string().default('Les points essentiels.'),
        readingTime: z.string().optional(),
        items: z.array(z.string()).default([]),
      })
      .optional(),
    tags: z.array(z.string()).default([]),
    coverImage: z.object({
      src: z.string(),
      alt: z.string().min(1),
      caption: z.string().optional(),
    }),
    relatedProject: reference('projets').optional(),
    seo: z
      .object({
        title: z.string().optional(),
        description: z.string().optional(),
        ogImage: z.string().optional(),
        schemaType: schemaTypeSchema.default('BlogPosting'),
        noindex: z.boolean().default(false),
      })
      .default({}),
    howTo: z
      .object({
        totalTime: z.string().optional(),
        steps: z
          .array(z.object({ name: z.string(), text: z.string() }))
          .default([]),
      })
      .optional(),
    faq: z
      .array(z.object({ question: z.string(), answer: z.string() }))
      .default([]),
    draft: z.boolean().default(true),
    featured: z.boolean().default(false),
  }),
});

const projets = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdoc,mdx}', base: './src/content/projets' }),
  schema: z.object({
    title: z.string(),
    color: projectColorSchema.default('cyan'),
    status: projectStatusSchema.default('en-cours'),
    type: projectTypeSchema.default('perso'),
    year: z.string().optional(),
    role: z.string().optional(),
    summary: z.string().min(50),
    subProjects: z
      .array(
        z.object({
          title: z.string(),
          description: z.string().optional(),
        })
      )
      .default([]),
    stack: z.array(z.string()).default([]),
    progress: z.number().min(0).max(100).optional(),
    coverImage: z
      .object({
        src: z.string(),
        alt: z.string().optional(),
      })
      .optional(),
    archived: z.boolean().default(false),
    order: z.number().default(0),
    seo: z
      .object({
        title: z.string().optional(),
        description: z.string().optional(),
        ogImage: z.string().optional(),
      })
      .default({}),
  }),
});

export const collections = { articles, projets };
