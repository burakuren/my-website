const SOCIAL_ICONS = { linkedin: 'si-linkedin', github: 'si-github' } as const;

/** Sprite icon for a profile social link, by its `key`. */
export const socialIcon = (key: string) => SOCIAL_ICONS[key as keyof typeof SOCIAL_ICONS] as (typeof SOCIAL_ICONS)[keyof typeof SOCIAL_ICONS] | undefined;

/** contact@example.com → contact[at]example[dot]com, for display only. */
export const displayEmail = (email: string) => email.replace('@', '[at]').replace(/\./g, '[dot]');
