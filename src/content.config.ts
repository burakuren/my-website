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
      // Guest posts published elsewhere: no body, no local page; lists link out.
      externalUrl: z.url().optional(),
      publisher: z.string().optional(),
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

// Text fields marked "bold" accept **double asterisks** around metrics
// (rendered by src/lib/inline.ts); everything else is plain text.
const profile = defineCollection({
  loader: singleton('src/data/profile.yml', 'profile'),
  schema: z.object({
    name: z.string(),
    handle: z.string(),
    role: z.string(),
    tagline: z.string(),
    /** bold */
    lead: z.string(),
    availability: z.string().optional(),
    seoTitle: z.string(),
    seoDescription: z.string().max(170),
    services: z
      .array(
        z.object({
          flag: z.string(),
          title: z.string(),
          body: z.string(),
          /** bold */
          proof: z.string().optional(),
        }),
      )
      .default([]),
    about: z.array(z.string()),
    facts: z
      .array(
        z.object({
          label: z.string(),
          /** bold */
          value: z.string(),
          sub: z.string().optional(),
        }),
      )
      .default([]),
    location: z.object({ city: z.string(), country: z.string() }),
    email: z.email(),
    contactHeading: z.string(),
    contactText: z.string().optional(),
    /** bold: "**Lead** rest of the step." */
    contactSteps: z.array(z.string()).default([]),
    social: z.array(link.extend({ key: z.string() })),
    resume: z.string().optional(),
    knowsAbout: z.array(z.string()).default([]),
    alumniOf: z.string().optional(),
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
    // Label beside the dates; "HEAD" marks the current job (green dot).
    ref: z.string().optional(),
    // "YYYY-MM"; end omitted means ongoing.
    start: z.string().regex(/^\d{4}-\d{2}$/),
    end: z.string().regex(/^\d{4}-\d{2}$/).optional(),
    summary: z.string(),
    results: z.array(z.object({ value: z.string(), label: z.string() })).default([]),
    /** bold; shown under "Technical details" */
    highlights: z.array(z.string()).default([]),
    stack: z.array(z.string()).default([]),
  }),
});

const skills = defineCollection({
  loader: singleton('src/data/skills.yml', 'skills'),
  schema: z.object({
    groups: z.array(z.object({ name: z.string(), tools: z.string() })),
  }),
});

export const collections = { blog, profile, experience, skills };
