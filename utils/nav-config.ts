export type NavType = {
	url: string;
	label?: string;
	icon?: string;
	key: string;
};

const navigationConfig: NavType[] = [
	{ url: '/', label: 'Acceuil', icon: 'home', key: 'hero' },
	{ url: '/a-propos', label: 'À propos', key: 'a-propos' },
	{ url: '/experiences', label: 'Expériences', key: 'experiences' },
	{ url: '/competences', label: 'Compétences', key: 'competences' },
	{ url: '/projets', label: 'Mes projets', key: 'projets' },
	{ url: '/contact', label: 'Contactez-moi', key: 'contact' },
];

export default navigationConfig;
