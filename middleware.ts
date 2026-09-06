import createMiddleware from 'next-intl/middleware'

export default createMiddleware({
  locales: ['fr', 'en'],
  defaultLocale: 'fr',
  localePrefix: 'as-needed' // /fr/dashboard ou /en/dashboard mais /dashboard = fr par défaut
})

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\..*).*)']
}
