import en from './en'


export const languages: Record<string, typeof en> = {
  en
}

export const i18n = languages[process.env.LANGUAGE ?? 'en'] ?? languages.en
