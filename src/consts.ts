export const SITE = {
  url: 'https://caiofuzatto.com.br',
  title: 'Caio Fuzatto',
  description:
    'Minha página web. Aqui posto um diário de conhecimento técnico. Também tem um pouco sobre minha vida profissional.',
  author: 'Caio Fuzatto',
  tagline: 'Dev Diary & Tech Blog',
  lang: 'pt-BR',
  avatar: '/uploads/avatar.png',
  googleSiteVerification: 'qEQ7n9bRewKMRJaoC4hs7FPPBNxFGPQgVNcxRztv3hY',
  gaMeasurementId: 'G-FE4HS11JXL',
} as const;

// Order matches the header design. TODO: add the YouTube entry once the channel URL
// is known — SocialIcon already carries the glyph.
export const SOCIAL_LINKS = [
  { href: 'https://github.com/itsmicaio', label: 'Github', icon: 'github' },
  { href: 'https://www.linkedin.com/in/itsmicaio/', label: 'LinkedIn', icon: 'linkedin' },
  { href: 'https://www.instagram.com/itsmicaio/', label: 'Instagram', icon: 'instagram' },
] as const;
