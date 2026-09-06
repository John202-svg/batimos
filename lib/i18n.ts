import { getRequestConfig } from 'next-intl/server'

export default getRequestConfig(async ({ locale }) => ({
  messages: (await import(`../messages/${locale}.json`)).default
}))

// Vérification 100% bilingue - Toutes les clés doivent exister en FR et EN
export const locales = ['fr', 'en'] as const
export const defaultLocale = 'fr' as const

// Utilisation dans composants:
// import { useTranslations } from 'next-intl'
// const t = useTranslations('dashboard')
// t('title') → "Tableau de bord familial" en FR, "Family Dashboard" en EN
