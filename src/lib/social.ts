const SOCIAL_ICONS = { linkedin: 'si-linkedin', github: 'si-github' } as const;

/** Sprite icon for a profile social link, by its `key`. */
export const socialIcon = (key: string) => SOCIAL_ICONS[key as keyof typeof SOCIAL_ICONS] as (typeof SOCIAL_ICONS)[keyof typeof SOCIAL_ICONS] | undefined;

/** "Burak Üren" → "Burak_Uren_CV.pdf": the CV's download name. */
export const cvFileName = (name: string) => `${name.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, '_')}_CV.pdf`;

/** contact@example.com → contact[at]example[dot]com, for display only. */
export const displayEmail = (email: string) => email.replace('@', '[at]').replace(/\./g, '[dot]');
