export type Objective = { id: string; label: string; kills?: { zone: 'val' | 'nexus'; n: number } };

export type Quest = {
	id: string;
	title: string;
	giver: string;
	turnIn: string;
	/** What the giver says when offering the quest. */
	intro: string;
	/** Places to open, or bugs to defeat in a realm (`kills`). */
	objectives: Objective[];
	/** What the turn-in NPC says when the quest is completed. */
	outro: string;
	/** `title` is also an entry of the achievements (lib/achievements.ts). */
	reward: { title: string; text: string };
	next?: string;
	/** Side quest only offered once this quest is done. */
	requires?: string;
};

export const QUESTS: Quest[] = [
	{
		id: 'origines',
		title: 'Les origines du développeur',
		giver: 'raphy',
		turnIn: 'raphy',
		intro: 'Bienvenue, voyageur ! Raphaël forge du code depuis plus de huit ans ; il a intégré sa première IA en production dès 2018. Visite la Forge, la Tour du Savoir et le Cercle du Manifeste : tu sauras d’où il vient et ce qu’il défend.',
		objectives: [
			{ id: 'forge', label: 'Examiner la Forge du Code' },
			{ id: 'tower', label: 'Visiter la Tour du Savoir' },
			{ id: 'stones', label: 'Lire le Cercle du Manifeste' },
		],
		outro: 'Tu as vu l’artisan. En novembre 2025, il a franchi une porte : Responsable IA chez Neoteem. Le Portail arcanique s’est éveillé au nord du val, il mène au Nexus : l’ère des agents.',
		reward: { title: 'Artisan du code', text: '8+ ans d’ingénierie logicielle découverts.' },
		next: 'portail',
	},
	{
		id: 'parcours',
		title: 'Le parcours de l’artisan',
		// a side quest, open from the start: the garage hands it out
		giver: 'leasys',
		turnIn: 'raphy',
		intro: 'Ce garage a vu la première intégration d’IA de Raphaël en production, en 2018. Deux autres maisons du val gardent la suite de sa carrière : l’Atelier Schoolmouv et le Comptoir Royal Canin. Va les voir, puis raconte tout à Raphy.',
		objectives: [
			{ id: 'leasys', label: 'Ouvrir le Garage Leasys' },
			{ id: 'schoolmouv', label: 'Visiter l’Atelier Schoolmouv' },
			{ id: 'royal', label: 'Entrer au Comptoir Royal Canin' },
		],
		outro: 'Une première intégration d’IA en production dès 2018, un MVP construit de zéro, une plateforme déployée dans plus de 100 pays : tu connais l’artisan.',
		reward: { title: 'Compagnon du val', text: 'Le parcours de Raphaël est découvert.' },
	},
	{
		id: 'portail',
		title: 'Au-delà du portail',
		giver: 'raphy',
		turnIn: 'holo',
		intro: 'Le Portail arcanique attend au bout du chemin, au nord. Traverse-le.',
		objectives: [{ id: 'portal', label: 'Traverser le Portail arcanique' }],
		outro: 'Connexion établie. Je suis Raphy·OS. Ici, Raphaël met des agents IA en production. Je t’ouvre l’accès au Nexus.',
		reward: { title: 'Passe-portail', text: 'Bienvenue dans le Nexus.' },
		next: 'production',
	},
	{
		id: 'production',
		title: 'Les agents en production',
		giver: 'holo',
		turnIn: 'holo',
		intro: 'Chez Neoteem, sept agents spécialisés travaillent chaque jour pour les gestionnaires immobiliers. Trois bornes les présentent le long de l’avenue, et le Noyau d’orchestration montre comment NeoChat est bâti. Interroge-les.',
		objectives: [
			{ id: 'neochat', label: 'Interroger la borne NeoChat' },
			{ id: 'core', label: 'Inspecter le Noyau : l’architecture de NeoChat' },
			{ id: 'neosupport', label: 'Interroger la borne NeoSupport' },
			{ id: 'neoagent', label: 'Interroger la borne NeoAgent' },
		],
		outro: 'Lecture seule par construction, validation humaine avant tout envoi, plus de 7 000 tests, chaque conversation tracée : voilà ce que « en production » veut dire pour Raphaël.',
		reward: { title: 'Opérateur du Nexus', text: 'Les agents en production sont découverts.' },
		next: 'agents',
	},
	{
		id: 'agents',
		title: 'L’ère des agents',
		giver: 'holo',
		turnIn: 'beacon',
		intro: 'Deux systèmes complètent le portrait : la Constellation des Agents, qui porte ses compétences, et la Galerie des Projets, qui expose ses réalisations. Analyse-les, puis active la Balise de contact.',
		objectives: [
			{ id: 'agents', label: 'Analyser la Constellation des Agents' },
			{ id: 'gallery', label: 'Parcourir la Galerie des Projets' },
		],
		outro: 'Exploration terminée : tu connais Raphaël. Un poste IA à pourvoir ? La balise est ouverte.',
		reward: { title: 'Ingénieur du Nexus', text: 'Le monde de Raphaël est entièrement exploré.' },
	},
	{
		id: 'chasse',
		title: 'La chasse aux bugs',
		// side quest of the val, handed out by the forge
		giver: 'forge',
		turnIn: 'forge',
		intro: 'Des bugs rôdent dans le val : régressions, dette technique, hallucinations… Chacun cache un problème réel et sa parade. Corriges-en trois, puis reviens à la Forge.',
		objectives: [{ id: 'bugs-val', label: 'Corriger 3 bugs du val', kills: { zone: 'val', n: 3 } }],
		outro: 'Trois bugs corrigés. Ouvre le Bestiaire du menu : chaque fiche raconte le problème et la parade que Raphaël applique en production.',
		reward: { title: 'Traqueur de bugs', text: 'Le val respire mieux.' },
	},
	{
		id: 'purge',
		title: 'Purge du Nexus',
		// side quest of the Nexus, handed out by the orchestration core once the visitor got there
		requires: 'portail',
		giver: 'core',
		turnIn: 'core',
		intro: 'Prompt injection, coût explosif, dérive du modèle : les bugs des agents en production hantent les rues. Corriges-en trois, le Noyau te dira comment Raphaël les tient à distance.',
		objectives: [{ id: 'bugs-nexus', label: 'Corriger 3 bugs du Nexus', kills: { zone: 'nexus', n: 3 } }],
		outro: 'Évaluations, traces, garde-fous : c’est ce qui sépare une démo d’un agent en production. Le Bestiaire garde les fiches de chaque bug.',
		reward: { title: 'Gardien du Nexus', text: 'Les rues du Nexus sont plus sûres.' },
	},
];

export type QuestStatus = 'locked' | 'available' | 'active' | 'ready' | 'done';

/** Story quests start locked behind the one leading to them; side quests behind their requirement. */
export function initialQuests(): Record<string, QuestStatus> {
	return Object.fromEntries(QUESTS.map((q) => [q.id, q.requires || QUESTS.some((o) => o.next === q.id) ? 'locked' : 'available']));
}

export function quest(id: string) {
	return QUESTS.find((q) => q.id === id);
}

export type Marker = '!' | '?' | '?grey' | 'objective' | null;

/** Is this objective of the quest met (place opened, or enough bugs defeated since the quest began)? */
export function objectiveDone(q: Quest, o: Objective, visited: string[], progress: Record<string, number>) {
	return o.kills ? (progress[q.id] ?? 0) >= o.kills.n : visited.includes(o.id);
}

/** WoW-style marker of a place: quest to pick up, quest to hand in (gold / grey) or objective to visit. */
export function markerFor(id: string, quests: Record<string, QuestStatus>, visited: string[], progress: Record<string, number> = {}): Marker {
	if (QUESTS.some((q) => q.giver === id && quests[q.id] === 'available')) return '!';
	if (QUESTS.some((q) => q.turnIn === id && quests[q.id] === 'ready')) return '?';
	if (QUESTS.some((q) => quests[q.id] === 'active' && q.objectives.some((o) => o.id === id && !objectiveDone(q, o, visited, progress)))) return 'objective';
	if (QUESTS.some((q) => q.turnIn === id && quests[q.id] === 'active')) return '?grey';
	return null;
}
