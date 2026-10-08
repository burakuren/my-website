import { defineCollection, reference } from 'astro:content';
import { file, glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { parse as parseYaml } from 'yaml';

/**
 * Blog posts live in page bundles (`src/content/blog/<slug>/index.md`) so
 * images uploaded through Sveltia CMS sit next to the post and go through
 * Astro's image pipeline.
 */
const blog = defineCollection({
  loader: glob({ pattern: '**/index.md', base: './src/content/blog', generateId: ({ entry }) => entry.replace(/\/index\.md$/, '') }),
  schema: ({ image }) =>
    z.object({
      title: z.string().min(1),
      description: z.string().min(1).max(200),
      pubDate: z.coerce.date(),
      updatedDate: z.coerce.date().optional(),
      tags: z.array(z.string()).default([]),
      // Lab: relation to the lab categories collection.
      category: reference('labCategories').optional(),
      cover: image().optional(),
      coverAlt: z.string().optional(),
      draft: z.boolean().default(false),
    }),
});

const link = z.object({ label: z.string(), url: z.string() });

/**
 * Single-document YAML files edited as Sveltia CMS singletons. The `file()`
 * loader expects a list of entries, so each document becomes one entry
 * whose id is the file's purpose.
 */
const singleton = (path: string, id: string) =>
  file(path, { parser: (text) => [{ id, ...(parseYaml(text) as object) }] });

const profile = defineCollection({
  loader: singleton('src/data/profile.yml', 'profile'),
  schema: z.object({
    name: z.string(),
    handle: z.string(),
    role: z.string(),
    tagline: z.string(),
    seoTitle: z.string(),
    seoDescription: z.string().max(170),
    synopsis: z.array(z.object({ flag: z.string(), arg: z.string() })),
    description: z.string(),
    about: z.array(z.string()),
    status: z.string(),
    fetch: z.array(z.object({ key: z.string(), value: z.string() })),
    location: z.object({ city: z.string(), country: z.string() }),
    email: z.email(),
    contactHeadline: z.string(),
    social: z.array(link.extend({ key: z.string() })),
    resume: z.string().optional(),
    knowsAbout: z.array(z.string()).default([]),
    alumniOf: z.string().optional(),
  }),
});

const projects = defineCollection({
  loader: file('src/data/projects.yml', {
    parser: (text) => (parseYaml(text) as { projects: { name: string }[] }).projects.map((p, i) => ({ id: `${String(i).padStart(2, '0')}-${p.name}`, order: i, ...p })),
  }),
  schema: z.object({
    order: z.number(),
    name: z.string(),
    kind: z.enum(['dir', 'file']).default('dir'),
    url: z.url().optional(),
    description: z.string(),
    tags: z.array(z.string()).default([]),
    // Lab: relation to the lab categories collection.
    category: reference('labCategories').optional(),
  }),
});

const experience = defineCollection({
  loader: file('src/data/experience.yml', {
    parser: (text) => (parseYaml(text) as { entries: { org: string; start: string }[] }).entries.map((e, i) => ({ id: `${String(i).padStart(2, '0')}-${e.org}`, order: i, ...e })),
  }),
  schema: z.object({
    order: z.number(),
    role: z.string(),
    org: z.string(),
    url: z.url().optional(),
    kind: z.enum(['work', 'education']).default('work'),
    ref: z.string().optional(),
    // "YYYY-MM"; end omitted means ongoing.
    start: z.string().regex(/^\d{4}-\d{2}$/),
    end: z.string().regex(/^\d{4}-\d{2}$/).optional(),
    note: z.string().optional(),
    highlights: z.array(z.string()).default([]),
  }),
});

const skills = defineCollection({
  loader: singleton('src/data/skills.yml', 'skills'),
  schema: z.object({
    comment: z.string().optional(),
    groups: z.array(
      z.object({
        name: z.string(),
        items: z.array(z.object({ key: z.string(), value: z.string(), comment: z.string().optional() })),
      }),
    ),
  }),
});

/*
 * Lab: throwaway collections that exercise Sveltia CMS features
 * (relations, nested folders, i18n, every field type). Rendered under /lab/.
 */
const labCategories = defineCollection({
  loader: glob({ pattern: '*.yml', base: './src/content/lab/categories' }),
  schema: z.object({
    name: z.string(),
    description: z.string().optional(),
    color: z.string().regex(/^#[0-9a-fA-F]{6}([0-9a-fA-F]{2})?$/),
    order: z.number().default(0),
  }),
});

const labNotes = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/lab/notes' }),
  schema: z.object({
    title: z.string(),
    kind: z.enum(['til', 'snippet', 'link']),
    category: reference('labCategories'),
    tags: z.array(z.string()).default([]),
    date: z.coerce.date(),
    url: z.url().optional(),
    rating: z.number().int().min(1).max(5).optional(),
    pinned: z.boolean().default(false),
  }),
});

const labDocs = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/lab/docs' }),
  schema: z.object({ title: z.string(), weight: z.number().default(0) }),
});

const glossaryLocale = z.object({ term: z.string(), definition: z.string(), category: reference('labCategories').optional() });
const labGlossary = defineCollection({
  loader: glob({ pattern: '*.yml', base: './src/content/lab/glossary' }),
  schema: z.object({ en: glossaryLocale, tr: glossaryLocale.partial().optional() }),
});

const labWidgets = defineCollection({
  loader: singleton('src/data/lab-widgets.yml', 'widgets'),
  schema: z.object({
    uuid: z.string().optional(),
    title: z.string(),
    slug: z.string(),
    permalink: z.string().optional(),
    summary: z.string().optional(),
    count: z.number().optional(),
    price: z.number().optional(),
    enabled: z.boolean().default(false),
    released: z.string().optional(),
    day: z.coerce.string().optional(),
    level: z.string().optional(),
    platforms: z.array(z.string()).default([]),
    favourite_note: reference('labNotes').optional(),
    related_notes: z.array(reference('labNotes')).default([]),
    accent: z.string().optional(),
    location: z.string().optional(),
    snippet: z.object({ code: z.string(), lang: z.string().optional() }).optional(),
    env: z.record(z.string(), z.string()).default({}),
    image: z.string().optional(),
    attachment: z.string().optional(),
    links: z.array(z.string()).default([]),
    author: z.object({ name: z.string(), role: z.string().optional() }).optional(),
    markdown: z.string().optional(),
    schema_version: z.number().optional(),
    blocks: z
      .array(
        z.discriminatedUnion('type', [
          z.object({ type: z.literal('heading'), text: z.string() }),
          z.object({ type: z.literal('paragraph'), text: z.string() }),
          z.object({ type: z.literal('callout'), kind: z.enum(['note', 'tip', 'warning']).default('note'), text: z.string() }),
          z.object({ type: z.literal('link'), label: z.string(), url: z.url() }),
        ]),
      )
      .default([]),
  }),
});

export const collections = { blog, profile, projects, experience, skills, labCategories, labNotes, labDocs, labGlossary, labWidgets };
