import type { Zone } from './world';
import { NEXUS_Z } from './world';

/**
 * Wandering "bugs" the player can fight. Each one is named after a real AI-engineering
 * problem and, once defeated, tells how Raphaël fixes it in production.
 */
export type MobState = 'idle' | 'walk' | 'chase' | 'attack' | 'hit' | 'dead';

export type Mob = {
	id: number;
	name: string;
	lesson: string;
	/** The problem this bug stands for. */
	problem: string;
	zone: Zone;
	homeX: number;
	homeZ: number;
	x: number;
	z: number;
	yaw: number;
	hp: number;
	maxHp: number;
	state: MobState;
	/** Seconds spent in the current state. */
	t: number;
	/** Wander target. */
	tx: number;
	tz: number;
	cooldown: number;
};

/** What each bug is, in one plain sentence. */
const PROBLEMS: Record<string, string> = {
	Hallucination: "Le modèle invente une réponse plausible mais fausse : un chiffre, une loi ou une procédure qui n’existe pas.",
	'Régression': "Un changement de prompt ou de modèle améliore un cas… et en casse dix autres sans que personne ne le voie.",
	'Bug 404': "Une donnée mal formée traverse l’API et fait planter un écran ou un agent plus loin, loin de sa cause.",
	'Dette technique': "Chaque raccourci rend la suivante plus coûteuse : le code devient fragile et les livraisons ralentissent.",
	'Fuite de contexte': "On renvoie au modèle les mêmes milliers de tokens à chaque appel : lent et cher.",
	Overfitting: "Le système brille sur les exemples de test mais échoue face aux vraies questions des utilisateurs.",
	'Boucle infinie': "Un agent rappelle le même outil en boucle sans jamais conclure, en brûlant des tokens.",
	'Flaky test': "Un test passe puis échoue sans changement de code : plus personne ne fait confiance à la CI.",
	'Code spaghetti': "Tout dépend de tout : impossible de modifier un module sans en casser un autre.",
	'Merge conflict': "Des branches trop longues divergent et se marchent dessus au moment de fusionner.",
	'Null pointer': "Une valeur absente surgit là où le code ne l’attend pas et fait tout tomber.",
	'Prompt injection': "Un texte malveillant caché dans un document ou un message détourne l’agent : « ignore tes consignes et… ».",
	Timeout: "Appeler un gros LLM pour chaque décision rend l’assistant lent : l’utilisateur attend, puis abandonne.",
	'Coût explosif': "Sans suivi, la facture d’inférence grimpe en silence jusqu’à la fin du mois.",
	'Dérive du modèle': "Les réponses se dégradent doucement avec le temps : nouvelles données, nouveau modèle, nouveaux usages.",
	'Fuite de clé API': "Une clé secrète se retrouve dans le code ou un log, puis sur Internet.",
	'Cold start': "Le premier appel après une pause met de longues secondes : le service redémarre à froid.",
	'Token perdu': "La conversation dépasse la fenêtre de contexte : l’agent oublie les consignes du début.",
	'Agent perdu': "Un agent généraliste à qui l’on confie tout se trompe d’outil et de tâche.",
};

const SPECS: { name: string; lesson: string; zone: Zone; x: number; z: number }[] = [
	{ name: 'Hallucination', lesson: 'Vaincue par un RAG hybride et une extraction verbatim : chaque réponse cite sa source.', zone: 'val', x: -24, z: 2 },
	{ name: 'Régression', lesson: 'Vaincue par les tests DeepEval LLM-as-judge lancés avant chaque mise en production.', zone: 'val', x: 26, z: -2 },
	{ name: 'Bug 404', lesson: 'Corrigé : contrats OpenAPI et 496 schémas Zod valident chaque entrée.', zone: 'val', x: 12, z: -58 },
	{ name: 'Dette technique', lesson: 'Remboursée par une architecture hexagonale aux frontières vérifiées en CI.', zone: 'val', x: -30, z: -40 },
	{ name: 'Fuite de contexte', lesson: 'Colmatée par le context caching : −33 % de coûts d’inférence.', zone: 'val', x: 14, z: 28 },
	{ name: 'Overfitting', lesson: 'Évité : jeux d’évaluation séparés et tests de non-régression sur des cas réels.', zone: 'val', x: -44, z: -10 },
	{ name: 'Boucle infinie', lesson: 'Cassée : chaque agent ReAct a un nombre d’étapes plafonné et des garde-fous.', zone: 'val', x: 34, z: -50 },
	{ name: 'Flaky test', lesson: 'Stabilisé : tests déterministes, données figées et CI sous Ubuntu et Windows.', zone: 'val', x: -12, z: -74 },
	{ name: 'Code spaghetti', lesson: 'Démêlé : architecture hexagonale et frontières vérifiées par import-linter.', zone: 'val', x: 44, z: 30 },
	{ name: 'Merge conflict', lesson: 'Résolu : petites tranches verticales, revues et CI qui juge.', zone: 'val', x: -40, z: 34 },
	{ name: 'Null pointer', lesson: 'Écrasé : typage strict, Zod et Pydantic valident chaque frontière.', zone: 'val', x: 4, z: -86 },
	{ name: 'Prompt injection', lesson: 'Bloquée : les sorties du modèle sont validées comme des saisies utilisateur.', zone: 'nexus', x: -20, z: NEXUS_Z - 30 },
	{ name: 'Timeout', lesson: 'Évité par le routage hybride : un LLM n’est appelé qu’en repli.', zone: 'nexus', x: 22, z: NEXUS_Z - 34 },
	{ name: 'Coût explosif', lesson: 'Maîtrisé grâce au suivi FinOps Langfuse et au bon modèle pour chaque tâche.', zone: 'nexus', x: 30, z: NEXUS_Z - 100 },
	{ name: 'Dérive du modèle', lesson: 'Détectée : traces Langfuse et évaluations LLM-as-judge en continu.', zone: 'nexus', x: -52, z: NEXUS_Z - 70 },
	{ name: 'Fuite de clé API', lesson: 'Colmatée : secrets hors du code, hooks de sécurité qui bloquent avant le commit.', zone: 'nexus', x: 54, z: NEXUS_Z - 72 },
	{ name: 'Cold start', lesson: 'Réchauffé : instances Cloud Run minimales et chargement paresseux des modèles.', zone: 'nexus', x: 0, z: NEXUS_Z - 55 },
	{ name: 'Token perdu', lesson: 'Retrouvé : contexte compacté, mémoire dans le dépôt et skills ciblées.', zone: 'nexus', x: -12, z: NEXUS_Z - 140 },
	{ name: 'Agent perdu', lesson: 'Retrouvé : chaque agent a son graphe LangGraph, ses outils et ses garde-fous.', zone: 'nexus', x: -30, z: NEXUS_Z - 105 },
];

export const mobs: Mob[] = SPECS.map((s, i) => ({
	id: i,
	name: s.name,
	lesson: s.lesson,
	problem: PROBLEMS[s.name] ?? '',
	zone: s.zone,
	homeX: s.x,
	homeZ: s.z,
	x: s.x,
	z: s.z,
	yaw: 0,
	hp: 3,
	maxHp: 3,
	state: 'idle',
	t: Math.random() * 3,
	tx: s.x,
	tz: s.z,
	cooldown: 0,
}));

export function nearestMob(x: number, z: number, max: number) {
	let best: Mob | null = null;
	let d = max;
	for (const m of mobs) {
		if (m.state === 'dead') continue;
		const dist = Math.hypot(m.x - x, m.z - z);
		if (dist < d) {
			d = dist;
			best = m;
		}
	}
	return best;
}
