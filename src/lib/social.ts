/** Sprite icon for a profile social link, by its `key`. */
export const socialIcon = (key: string) => (key === 'linkedin' ? 'si-linkedin' : key === 'github' ? 'si-github' : undefined);

/** "Burak Üren" → "Burak_Uren_CV.pdf": the CV's download name. */
export const cvFileName = (name: string) => `${name.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, '_')}_CV.pdf`;

/** contact@example.com → contact[at]example[dot]com, for display only. */
export const displayEmail = (email: string) => email.replace('@', '[at]').replace(/\./g, '[dot]');
