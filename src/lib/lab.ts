import { getCollection, type CollectionEntry } from 'astro:content';

export type LabNote = CollectionEntry<'labNotes'>;
export type LabCategory = CollectionEntry<'labCategories'>;
export type LabDoc = CollectionEntry<'labDocs'>;

/** Categories in the order set by drag-and-drop in the CMS. */
export async function getCategories(): Promise<LabCategory[]> {
  return (await getCollection('labCategories')).sort((a, b) => a.data.order - b.data.order);
}

/** Notes, pinned first, then newest first. */
export async function getNotes(filter?: (n: LabNote) => boolean): Promise<LabNote[]> {
  const notes = await getCollection('labNotes', filter);
  return notes.sort((a, b) => Number(b.data.pinned) - Number(a.data.pinned) || b.data.date.valueOf() - a.data.date.valueOf());
}

export const stars = (n?: number) => (n ? '★'.repeat(n) + '☆'.repeat(5 - n) : '');
export const noteUrl = (n: LabNote) => `/lab/notes/${n.id}/`;
export const categoryUrl = (id: string) => `/lab/c/${id}/`;
export const docUrl = (d: LabDoc) => `/lab/docs/${d.id}/`;
