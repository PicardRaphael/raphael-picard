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
	Hallucination: 'Le modèle invente une réponse plausible mais fausse : un chiffre, une loi ou une procédure qui n’existe pas.',
	'Régression': 'Un changement de prompt ou de modèle améliore un cas… et en casse dix autres sans que personne ne le voie.',
	'Donnée invalide': 'Une donnée mal formée traverse l’API et fait planter un écran ou un agent, loin de sa cause.',
	'Dette technique': 'Chaque raccourci rend le suivant plus coûteux : le code devient fragile et les livraisons ralentissent.',
	'Contexte obèse': 'On renvoie au modèle les mêmes milliers de tokens à chaque appel : lent et cher.',
	'Golden set biaisé': 'On retouche le prompt jusqu’à passer les 64 cas de test… et l’agent échoue sur les vraies questions.',
	'Boucle infinie': 'Un agent rappelle le même outil en boucle sans jamais conclure, en brûlant des tokens.',
	'Test LLM instable': 'Le même cas passe puis échoue : le modèle n’est pas déterministe, et la CI crie au loup.',
	'Liste tronquée': 'L’agent lit 50 lignes et répond comme s’il avait tout vu : « vous avez 50 impayés ».',
	'Échec silencieux': 'La recherche tombe en panne et l’assistant répond « rien trouvé » : l’utilisateur croit qu’il n’y a rien.',
	'SQL sauvage': 'On laisse le modèle écrire son SQL : une jointure de trop, un DELETE, la table d’un autre client.',
	'Prompt injection': 'Un texte malveillant caché dans un document ou un message détourne l’agent : « ignore tes consignes et… ».',
	Latence: 'Une question traverse plusieurs appels de LLM : sans précaution, l’utilisateur fixe un écran vide.',
	'Coût explosif': 'Sans suivi, la facture d’inférence grimpe en silence jusqu’à la fin du mois.',
	'Dérive du modèle': 'Les réponses se dégradent doucement avec le temps : nouvelles données, nouveau modèle, nouveaux usages.',
	'Fuite de clé API': 'Une clé secrète se retrouve dans le code ou un log, puis sur Internet.',
	'Action irréversible': 'Sur une mauvaise lecture, l’agent envoie le mail au mauvais destinataire ou supprime le mauvais document.',
	'Token perdu': 'La conversation dépasse la fenêtre de contexte : l’agent oublie les consignes du début.',
	'Agent perdu': 'Un agent généraliste à qui l’on confie tout se trompe d’outil et de tâche.',
};

const SPECS: { name: string; lesson: string; zone: Zone; x: number; z: number }[] = [
	{ name: 'Hallucination', lesson: 'Bornée, pas vaincue : les chiffres viennent de vues et de rapports SQL, jamais du modèle ; chaque passage est étendu à sa page complète ; la Faithfulness est mesurée avant chaque release ; et l’agent préfère « je ne sais pas » ou un signalement de manque dans la doc à une réponse inventée.', zone: 'val', x: -24, z: 2 },
	{ name: 'Régression', lesson: 'Bloquée : plus de 7 000 fonctions de test, CI sur chaque PR, et un golden set de 64 cas rejoué 5 fois avec DeepEval avant chaque release.', zone: 'val', x: 26, z: -2 },
	{ name: 'Donnée invalide', lesson: 'Arrêtée à la frontière : contrats OpenAPI, schémas Zod et Pydantic, client HTTP de l’IA généré depuis le contrat du backend.', zone: 'val', x: 12, z: -58 },
	{ name: 'Dette technique', lesson: 'Contenue : architecture hexagonale aux frontières vérifiées en CI, détection de duplication et de code mort, mutation testing à 80 % sur chaque PR.', zone: 'val', x: -30, z: -40 },
	{ name: 'Contexte obèse', lesson: 'Dégonflé : context caching (−33 % de coûts d’inférence) et condensés courts des résultats d’outils pour les tours suivants.', zone: 'val', x: 14, z: 28 },
	{ name: 'Golden set biaisé', lesson: 'Évité : les traces de production et les retours utilisateurs révèlent ce que le golden set ne couvre pas.', zone: 'val', x: -44, z: -10 },
	{ name: 'Boucle infinie', lesson: 'Cassée : jeu d’outils fixe, invariants vérifiés avant chaque appel d’outil, délais bornés ; DeepEval vérifie que l’agent appelle les bons outils.', zone: 'val', x: 30, z: -28 },
	{ name: 'Test LLM instable', lesson: 'Apprivoisé : chaque cas du golden set est rejoué 5 fois pour séparer une vraie régression de la variance ; le contrôle des outils appelés reste déterministe.', zone: 'val', x: -12, z: -74 },
	{ name: 'Liste tronquée', lesson: 'Corrigée : pagination par curseur opaque que le modèle ne voit jamais ; une liste incomplète n’est jamais présentée comme complète.', zone: 'val', x: 44, z: 30 },
	{ name: 'Échec silencieux', lesson: 'Démasqué : une panne n’est jamais déguisée en « rien trouvé », et un outil manquant fait échouer l’agent explicitement.', zone: 'val', x: -58, z: 14 },
	{ name: 'SQL sauvage', lesson: 'Impossible ici : 5 outils génériques sur 42 vues, colonnes validées, opérateurs en liste fermée, paramètres liés, SELECT uniquement, une base par client.', zone: 'val', x: 16, z: -76 },
	{ name: 'Prompt injection', lesson: 'Contenue par construction, pas par le prompt : identité tirée du jeton vérifié, jeu d’outils fixe, invariants avant chaque appel, passerelle en lecture seule, aucun envoi ni suppression sans validation humaine. Une injection réussie ne peut ni écrire dans l’ERP, ni envoyer ou supprimer quoi que ce soit sans validation humaine, ni changer d’identité, ni toucher la base d’un autre client ; l’aperçu avant envoi bloque aussi l’exfiltration par mail.', zone: 'nexus', x: 7, z: NEXUS_Z - 30 },
	{ name: 'Latence', lesson: 'Réduite : streaming SSE, raccourci pour les salutations et cache dans le support, délais bornés côté passerelle.', zone: 'nexus', x: 16, z: NEXUS_Z - 36 },
	{ name: 'Coût explosif', lesson: 'Maîtrisé : coût et latence suivis par application et par agent dans Langfuse, cache dans le support, context caching (−33 %).', zone: 'nexus', x: 9, z: NEXUS_Z - 100 },
	{ name: 'Dérive du modèle', lesson: 'Surveillée : chaque changement de prompt ou de modèle rejoue le golden set (64 cas × 5) avec DeepEval ; en production, traces Langfuse et retours utilisateurs révèlent ce que les tests n’ont pas vu.', zone: 'nexus', x: -9, z: NEXUS_Z - 72 },
	{ name: 'Fuite de clé API', lesson: 'Colmatée : détection de secrets en CI sur chaque PR et hooks qui bloquent avant le commit.', zone: 'nexus', x: 15, z: NEXUS_Z - 116 },
	{ name: 'Action irréversible', lesson: 'Bloquée : choix du destinataire, aperçu avant envoi, confirmation avant suppression — l’agent propose, l’humain décide.', zone: 'nexus', x: 6, z: NEXUS_Z - 50 },
	{ name: 'Token perdu', lesson: 'Retrouvé : prompt système, résumé de la conversation et condensés des résultats d’outils gardent l’essentiel dans la fenêtre.', zone: 'nexus', x: 5, z: NEXUS_Z - 90 },
	{ name: 'Agent perdu', lesson: 'Retrouvé : des agents spécialisés, chacun avec son graphe LangGraph et ses outils — l’architecture multi-chatbots proposée à la direction et adoptée en production.', zone: 'nexus', x: -17, z: NEXUS_Z - 86 },
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
