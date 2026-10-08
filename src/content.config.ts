import { defineCollection } from 'astro:content';
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

export const collections = { blog, profile, projects, experience, skills };
