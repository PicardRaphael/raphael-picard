export type Quest = {
	id: string;
	title: string;
	giver: string;
	turnIn: string;
	/** What the giver says when offering the quest. */
	intro: string;
	objectives: { id: string; label: string }[];
	/** What the turn-in NPC says when the quest is completed. */
	outro: string;
	reward: { title: string; text: string };
	next?: string;
};

export const QUESTS: Quest[] = [
	{
		id: 'origines',
		title: 'Les origines du développeur',
		giver: 'raphy',
		turnIn: 'raphy',
		intro: "Bienvenue, voyageur ! Avant de devenir ingénieur IA, Raphaël a passé neuf ans à forger du code. Visite la Forge, la Tour du Savoir et le Cercle du Manifeste : tu comprendras d'où il vient.",
		objectives: [
			{ id: 'forge', label: 'Examiner la Forge du Code' },
			{ id: 'tower', label: 'Visiter la Tour du Savoir' },
			{ id: 'stones', label: 'Lire le Cercle du Manifeste' },
		],
		outro: "Tu as vu l'artisan. Mais en 2025, il a franchi une porte. Le Portail arcanique s'est éveillé au nord du val : il mène au Nexus, l'ère des agents.",
		reward: { title: 'Haut fait : Artisan du code', text: '9 ans de développement full-stack découverts.' },
		next: 'portail',
	},
	{
		id: 'parcours',
		title: "Le parcours de l'artisan",
		// a side quest, open from the start: the garage hands it out
		giver: 'leasys',
		turnIn: 'raphy',
		intro: "Ce garage a vu naître la première IA de Raphaël, en 2018. Deux autres maisons du val gardent la suite de sa carrière : l'Atelier Schoolmouv et le Comptoir Royal Canin. Va les voir, puis raconte tout à Raphy.",
		objectives: [
			{ id: 'leasys', label: 'Ouvrir le Garage Leasys' },
			{ id: 'schoolmouv', label: "Visiter l'Atelier Schoolmouv" },
			{ id: 'royal', label: 'Entrer au Comptoir Royal Canin' },
		],
		outro: 'Une première IA en production dès 2018, un MVP construit de zéro, une plateforme vendue dans plus de 100 pays : tu connais l’artisan.',
		reward: { title: 'Haut fait : Compagnon du val', text: 'Le parcours de Raphaël est découvert.' },
	},
	{
		id: 'portail',
		title: 'Au-delà du portail',
		giver: 'raphy',
		turnIn: 'holo',
		intro: 'Le Portail arcanique attend au bout du chemin, au nord. Traverse-le.',
		objectives: [{ id: 'portal', label: 'Traverser le Portail arcanique' }],
		outro: "Connexion établie. Je suis Raphy·OS. Ici, Raphaël construit des agents IA qui tournent en production. Je t'ouvre l'accès au Nexus.",
		reward: { title: 'Haut fait : Passe-portail', text: 'Bienvenue dans le Nexus.' },
		next: 'production',
	},
	{
		id: 'production',
		title: 'Les agents en production',
		giver: 'holo',
		turnIn: 'holo',
		intro: 'Chez Neoteem, huit agents LangGraph travaillent chaque jour. Trois bornes les présentent le long de l’avenue : NeoChat, NeoSupport et NeoAgent. Interroge-les.',
		objectives: [
			{ id: 'neochat', label: 'Interroger la borne NeoChat' },
			{ id: 'neosupport', label: 'Interroger la borne NeoSupport' },
			{ id: 'neoagent', label: 'Interroger la borne NeoAgent' },
		],
		outro: 'Testés, évalués avec DeepEval, observés dans Langfuse : voilà ce que « en production » veut dire pour Raphaël.',
		reward: { title: 'Haut fait : Opérateur du Nexus', text: 'Les agents en production sont découverts.' },
		next: 'agents',
	},
	{
		id: 'agents',
		title: "L'ère des agents",
		giver: 'holo',
		turnIn: 'beacon',
		intro: "Trois systèmes résument le travail de Raphaël aujourd'hui : la Constellation des Agents, le Noyau d'orchestration et la Galerie des Projets. Analyse-les, puis active la Balise de contact.",
		objectives: [
			{ id: 'agents', label: 'Analyser la Constellation des Agents' },
			{ id: 'core', label: "Inspecter le Noyau d'orchestration" },
			{ id: 'gallery', label: 'Parcourir la Galerie des Projets' },
		],
		outro: 'Exploration terminée. Tu connais maintenant Raphaël. Si un projet IA te trotte dans la tête, la balise est ouverte.',
		reward: { title: 'Haut fait : Ingénieur du Nexus', text: 'Le monde de Raphaël est entièrement exploré.' },
	},
];

export type QuestStatus = 'locked' | 'available' | 'active' | 'ready' | 'done';

export function quest(id: string) {
	return QUESTS.find((q) => q.id === id);
}

export type Marker = '!' | '?' | '?grey' | 'objective' | null;

/** WoW-style marker of a place: quest to pick up, quest to hand in (gold / grey) or objective to visit. */
export function markerFor(id: string, quests: Record<string, QuestStatus>, visited: string[]): Marker {
	if (QUESTS.some((q) => q.giver === id && quests[q.id] === 'available')) return '!';
	if (QUESTS.some((q) => q.turnIn === id && quests[q.id] === 'ready')) return '?';
	if (QUESTS.some((q) => quests[q.id] === 'active' && q.objectives.some((o) => o.id === id) && !visited.includes(id))) return 'objective';
	if (QUESTS.some((q) => q.turnIn === id && quests[q.id] === 'active')) return '?grey';
	return null;
}
