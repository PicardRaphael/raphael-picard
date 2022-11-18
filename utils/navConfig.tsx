export interface NavType {
  label?: string;
  url: string;
  icon?: string;
  key: string;
}

export const NavMainData: NavType[] = [
  {
    label: 'Accueil',
    url: 'hero',
    icon: 'home',
    key: 'home',
  },
  {
    label: 'À propos',
    url: 'a-propos',
    key: 'a-propos',
  },
  {
    label: 'Expériences',
    url: 'experiences',
    key: 'experiences',
  },
  {
    label: 'Compétences',
    url: 'competences',
    key: 'competences',
  },
  {
    label: 'Mes projets',
    url: 'portfolio',
    key: 'portfolio',
  },
  {
    label: 'Contact',
    url: 'contact',
    key: 'contact',
  },
];
