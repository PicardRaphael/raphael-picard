interface AppConfigType {
  site_name: string;
  title: string;
  description: string;
  locale: string;
  portable: string;
  job: string;
  postal_code: string;
  city: string;
  address: string;
  country: string;
}

export const AppConfig: AppConfigType = {
  site_name: 'Raphaël PICARD EI',
  title:
    'Raphaël PICARD | Développeur web Front-End freelance spécialisé ReactJS / NextJS',
  description:
    "Raphaël PICARD développeur web sénior spécialisé dans React.js / Next.js - Je vous assiste pour la création de fonctionnalités et d'applications web, de la landing page en passant par le SaaS, pour tous types d'entreprises.",
  locale: 'fr_FR',
  portable: '+33 6 50 93 15 73',
  job: 'Développeur Front-end Freelance',
  address: '60 Impasse Durnerin',
  postal_code: '69430',
  city: 'Marchampt',
  country: 'France',
};
