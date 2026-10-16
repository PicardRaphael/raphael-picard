/**
 * Every word displayed on the site lives here: edit this file to update the portfolio.
 * Numbers come from the public architecture sheet of the Neoteem AI platform, the CV,
 * the public GitHub repos and the MCP usage logs.
 */

export const hero = {
	eyebrow: 'Senior AI Engineer & Responsable IA · Neoteem · Lyon',
	status: 'NeoChat · NeoSupport · NeoAgent en production',
	headline: 'J’industrialise l’IA agentique.',
	lead: 'Je conçois et mets en production des assistants IA utiles au quotidien. Chez Neoteem, éditeur d’un ERP immobilier, 7 agents spécialisés assistent les gestionnaires : questions sur leurs données et sur l’aide du logiciel, comparaison de devis, rédaction. Ils lisent les données de l’ERP sans pouvoir les modifier, et aucun mail ne part, aucun document n’est supprimé sans validation humaine. Chaque version est testée avant sa mise en ligne, chaque coût est suivi : −33 % sur la facture des modèles. Et l’équipe est formée pour les faire vivre.',
	primaryCta: { label: 'Voir les agents en production', href: '#projets' },
	secondaryCta: { label: 'Télécharger le CV', href: '/raphael-picard-cv-senior-ai-engineer-responsable-ia.pdf' },
};

/** « Raphaël en 30 secondes » : the summary a hurried reader gets everywhere (game start screen, menu, /portfolio). */
export const pitch30 = {
	title: 'Raphaël en 30 secondes',
	points: [
		{ label: 'Qui', text: 'Senior AI Engineer & Responsable IA chez Neoteem, à Lyon. 8+ ans d’ingénierie logicielle, dont la mise en production de l’IA.' },
		{ label: 'Ce qu’il livre', text: '7 agents IA en production (NeoChat, NeoSupport, NeoAgent), utilisés chaque jour par des gestionnaires immobiliers sur leurs propres données.' },
		{ label: 'Comment', text: 'Des agents qui lisent l’ERP sans pouvoir le modifier, 5 contrôles humains avant toute action engageante, chaque version évaluée avant sa mise en ligne.' },
		{ label: 'Résultat', text: '−33 % sur la facture des modèles grâce au context caching, et une équipe IA encadrée et formée pour faire vivre les agents.' },
		{ label: 'Pourquoi lui', text: 'Un profil hybride : il parle architecture aux développeurs, coûts et usages aux dirigeants, et prompts aux modèles.' },
	],
};

export const stats = [
	{ value: 7, suffix: '', label: 'agents IA en production' },
	{ value: 5, suffix: '', label: 'contrôles humains avant toute action engageante' },
	{ value: 33, suffix: ' %', label: 'de coûts d’inférence en moins (context caching)' },
	{ value: 8, suffix: '+', label: 'ans d’ingénierie logicielle' },
];

export const stack = [
	'LangGraph',
	'Claude',
	'Gemini',
	'MCP',
	'FastAPI',
	'pgvector',
	'Langfuse',
	'DeepEval',
	'Vertex AI',
	'Cloud Run',
	'Python',
	'TypeScript',
	'Hono',
	'PostgreSQL',
	'Next.js',
	'React 19',
	'Docker',
	'Claude Code',
];

export const about = {
	eyebrow: 'II — Manifeste',
	title: 'De développeur full-stack à ingénieur IA.',
	paragraphs: [
		'En plus de huit ans d’ingénierie logicielle, j’ai livré des produits web à grande échelle : une plateforme e-commerce déployée dans plus de 100 pays, un MVP EdTech conçu de zéro, des outils métier pour la mobilité, où j’ai intégré mon premier service d’IA en production dès 2018. J’y ai appris ce qui fait tenir un logiciel : l’architecture, les tests, la rigueur de livraison.',
		'Depuis novembre 2025, je suis Senior AI Engineer & Responsable IA chez Neoteem, éditeur d’un ERP pour les professionnels de l’immobilier. J’y ai mis en production sept agents LangGraph répartis dans NeoChat, NeoSupport et NeoAgent, réécrit de zéro en TypeScript la couche de données qui les alimente et fait adopter par la direction une architecture multi-chatbots spécialisés. J’encadre le pôle IA (3 à 4 personnes) et je forme les équipes, tech et non-tech.',
		'Mon avantage : un profil hybride. Je parle architecture aux développeurs, coûts et usages aux dirigeants (chaque agent a son coût suivi), et prompts aux modèles.',
	],
	principles: [
		{
			title: 'L’IA ne calcule jamais un chiffre',
			text: 'Montants et soldes sont lus dans le logiciel par des outils testés. Le modèle explique, et dit « je ne sais pas » quand il ne sait pas.',
		},
		{
			title: 'Pas d’agent sans évaluation',
			text: 'Chaque nouvelle version est rejouée sur un jeu de cas réels avant sa mise en ligne, puis suivie en production : un agent se mesure avant et après son déploiement.',
		},
		{
			title: 'L’architecture d’abord',
			text: 'Hexagonale, frontières vérifiées en CI, contrats OpenAPI : l’IA mérite la même discipline que le reste du code.',
		},
		{
			title: 'L’humain garde la main',
			text: 'Les données de l’ERP en lecture seule, une validation humaine avant tout envoi ou toute suppression : l’agent propose, l’humain décide.',
		},
	],
};

export type Expertise = { id: string; title: string; pitch: string; points: string[]; tags: string[]; metric?: string };

export const expertise: Expertise[] = [
	{
		id: 'agents',
		title: 'Agents IA',
		pitch: 'Des agents spécialisés, chacun avec son périmètre d’outils et ses points de contrôle humain — en production, pas en démo.',
		points: [
			'Moteur ReAct déclaratif : un agent se déclare (état, prompt, outils, interruptions) et son graphe LangGraph en est dérivé',
			'Chaque outil est un module autonome : fonction typée, schémas Pydantic, consignes de prompt propres',
			'Données en catalogue : 42 vues métier couvertes par 5 outils génériques, choisies par similarité sémantique',
			'5 points de contrôle humain (interruptions LangGraph) : homonymes, destinataire, rédaction, aperçu avant envoi, suppression',
			'Invariants vérifiés avant chaque appel d’outil. Jeu d’outils fixe qui échoue bruyamment',
		],
		tags: ['LangGraph', 'ReAct', 'Gemini', 'Claude'],
		metric: '7 agents en prod',
	},
	{
		id: 'rag',
		title: 'RAG hybride',
		pitch: 'Des réponses ancrées dans la documentation, et un aveu clair quand elle ne couvre pas la question.',
		points: [
			'Recherche hybride plein texte + sémantique (pgvector) fusionnée en Reciprocal Rank Fusion',
			'Relances réécrites en questions autonomes, passages étendus à leur page complète, classement qui ordonne sans exclure',
			'Demande de précision quand plusieurs sujets correspondent, signalement des manques de la documentation',
			'Honnêteté des échecs : une panne de recherche n’est jamais présentée comme « rien trouvé »',
		],
		tags: ['pgvector', 'RRF', 'LangGraph', 'Gemini'],
		metric: 'Recherche hybride RRF',
	},
	{
		id: 'securite',
		title: 'Sécurité & gouvernance',
		pitch: 'Un agent ne doit jamais pouvoir faire plus que l’utilisateur qui lui parle — même manipulé.',
		points: [
			'Accès en lecture seule : l’IA consulte les données métier, elle ne peut ni les modifier ni les effacer',
			'Les données de chaque client restent dans sa propre base, choisie par le déploiement',
			'Rien ne part sans un humain : choix du destinataire, relecture, aperçu avant envoi, confirmation avant suppression',
			'Tout est tracé : chaque étape d’une conversation est consultable dans Langfuse, avec son coût',
			'Côté technique : SELECT uniquement, opérateurs en liste fermée, paramètres liés, identité tirée du jeton vérifié. Analyse statique, détection de secrets et audit des dépendances sur chaque PR',
		],
		tags: ['Moindre privilège', 'Human-in-the-loop', 'SAST', 'Langfuse'],
		metric: '5 contrôles humains',
	},
	{
		id: 'claude-code',
		title: 'Développement agentique',
		pitch: 'Le développement lui-même outillé comme un système multi-agent : skills, sous-agents, hooks et serveurs MCP.',
		points: [
			'Workflow /spec → /feature → /go → /ship : TDD par sous-agents, une revue par diff, merge humain',
			'Garde-fous déterministes par hooks : pas de DDL, pas de commit direct sur les branches principales, secrets, tests ciblés',
			'Sur la plateforme IA : 13 sous-agents, 38 skills, 27 hooks, et 162 skills sur 5 dépôts au total',
			'2 serveurs MCP maison (base de connaissances de 989 notes, PostgreSQL) au service des assistants IA de l’équipe',
		],
		tags: ['Claude Code', 'MCP', 'Hooks', 'Plugins'],
		metric: '162 skills',
	},
	{
		id: 'llmops',
		title: 'LLMOps : évals & coûts',
		pitch: 'Ce qui ne se mesure pas ne part pas en production.',
		points: [
			'Pyramide de tests : unitaires, intégration sur base réelle, fonctionnels LLM (DeepEval + juge). Plus de 7 000 fonctions de test, CI sur chaque PR',
			'Avant chaque release : Answer Relevancy, Faithfulness, critères métier G-Eval et contrôle déterministe des outils appelés',
			'Golden set de 64 cas × 5 tirages : une vraie régression se distingue de la variance du modèle',
			'Langfuse : étapes nommées pour le métier, coût et latence par application et par agent, retours utilisateurs. Context caching −33 %',
		],
		tags: ['Langfuse', 'DeepEval', 'Pytest', 'FinOps'],
		metric: '−33 % de coûts',
	},
	{
		id: 'backend',
		title: 'Backend & cloud',
		pitch: 'Des fondations solides pour que l’IA ait des données fiables à manipuler.',
		points: [
			'Couche de données de l’ERP réécrite de zéro en TypeScript (Bun, Hono, Zod, PostgreSQL), en remplacement de fonctions PostgreSQL historiques',
			'Architecture hexagonale vérifiée en CI, mutation testing à 80 % sur chaque PR',
			'Contrat partagé : le client HTTP de l’IA est généré depuis la spec OpenAPI du backend',
			'41 endpoints OpenAPI, 496 schémas Zod, et 77 routes FastAPI sur GCP Cloud Run',
		],
		tags: ['TypeScript', 'Hono', 'PostgreSQL', 'GCP'],
		metric: '41 endpoints OpenAPI',
	},
];

export const leadership = {
	title: 'Responsable IA : stratégie, équipe, adoption',
	points: [
		'Architecture multi-chatbots spécialisés proposée à la direction, puis adoptée en production',
		'Plus de 6 notes de décision stratégiques : choix de langage, RAG ou base de connaissances, organisation du pôle IA',
		'Encadrement direct de 3 à 4 personnes. Formation des équipes tech et non-tech (Claude Code, Claude Desktop, Cowork)',
	],
};
