/**
 * Every word displayed on the site lives here: edit this file to update the portfolio.
 * Numbers come from the CV (oct. 2026), the public architecture sheet of the Neoteem AI platform,
 * the public GitHub repos and the MCP usage logs.
 */

export const hero = {
	eyebrow: 'Senior AI Engineer & Responsable IA · Neoteem · Lyon',
	status: 'NeoChat · NeoSupport · NeoAgent en production',
	headline: 'J’industrialise l’IA agentique.',
	lead: 'Agents LangGraph, RAG hybrides, serveurs MCP : je les mets en production, testés, évalués (DeepEval) et observés (Langfuse). Chez Neoteem : 7 agents spécialisés en production, des données servies en lecture seule par construction, −33 % de coûts d’inférence, et une équipe formée pour les faire vivre.',
	primaryCta: { label: 'Voir les agents en production', href: '#projets' },
	secondaryCta: { label: 'Télécharger le CV', href: '/cv-RaphaelPICARD-IA.pdf' },
};

export const stats = [
	{ value: 7, suffix: '', label: 'agents IA en production' },
	{ value: 7000, suffix: '+', label: 'tests sur la plateforme IA' },
	{ value: 33, suffix: ' %', label: 'de coûts d’inférence en moins' },
	{ value: 9, suffix: '', label: 'ans d’ingénierie logicielle' },
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
	eyebrow: 'II — Le héros',
	title: 'De développeur full-stack à ingénieur IA.',
	paragraphs: [
		'En neuf ans d’ingénierie logicielle, j’ai livré des produits web à grande échelle : une plateforme e-commerce déployée dans plus de 100 pays, un MVP EdTech conçu de zéro, des outils métier pour la mobilité, où j’ai mis ma première IA en production dès 2018. J’y ai appris ce qui fait tenir un logiciel : l’architecture, les tests, la rigueur de livraison.',
		'Depuis novembre 2025, je suis Senior AI Engineer & Responsable IA chez Neoteem, éditeur d’un ERP pour les professionnels de l’immobilier. J’y ai mis en production sept agents LangGraph répartis dans NeoChat, NeoSupport et NeoAgent, construit de zéro le backend TypeScript qui leur sert les données et fait adopter par la direction une architecture multi-chatbots spécialisés. J’encadre le pôle IA (2 à 3 personnes) et je forme les équipes, tech et non-tech.',
		'Mon avantage : un profil hybride. Je parle architecture aux développeurs, ROI aux dirigeants, et prompts aux modèles.',
	],
	principles: [
		{
			title: 'Le LLM ne calcule jamais',
			text: 'Les chiffres viennent d’outils déterministes et testés ; le modèle raisonne, cite sa source et dit « je ne sais pas » quand il le faut.',
		},
		{
			title: 'Pas d’agent sans évaluation',
			text: 'Golden set rejoué en plusieurs tirages, LLM-as-judge, traces Langfuse : un agent se mesure avant de se déployer.',
		},
		{
			title: 'L’architecture d’abord',
			text: 'Hexagonale, frontières vérifiées en CI, contrats OpenAPI : l’IA mérite la même discipline que le reste du code.',
		},
		{
			title: 'L’humain garde la main',
			text: 'Lecture seule par construction, validation humaine avant tout envoi ou toute suppression : l’agent propose, l’humain décide.',
		},
	],
};

export type Expertise = { id: string; title: string; pitch: string; points: string[]; tags: string[]; metric?: string };

export const expertise: Expertise[] = [
	{
		id: 'agents',
		title: 'Agents & multi-agents',
		pitch: 'Des agents spécialisés qui raisonnent, appellent des outils et collaborent — en production, pas en démo.',
		points: [
			'Moteur ReAct déclaratif : un agent se déclare (état, prompt, outils, interruptions) et son graphe LangGraph en est dérivé',
			'Chaque outil est un module autonome : fonction typée, schémas Pydantic, consignes de prompt propres',
			'Données en catalogue : 42 vues métier couvertes par 5 outils génériques, choisies par similarité sémantique',
			'Humain dans la boucle : 5 interruptions avant toute action sensible ; streaming SSE, Map-Reduce',
		],
		tags: ['LangGraph', 'ReAct', 'Gemini', 'Claude'],
		metric: '7 agents en prod',
	},
	{
		id: 'rag',
		title: 'RAG hybride',
		pitch: 'Des réponses ancrées dans les bons documents, avec une source vérifiable à chaque fois.',
		points: [
			'Recherche hybride plein texte + sémantique (pgvector) fusionnée en Reciprocal Rank Fusion',
			'Relances réécrites en questions autonomes, passages étendus à leur page complète',
			'Honnêteté des échecs : une panne de recherche n’est jamais présentée comme « rien trouvé »',
		],
		tags: ['pgvector', 'RRF', 'LangGraph', 'Qdrant'],
		metric: 'Support autonome',
	},
	{
		id: 'mcp',
		title: 'MCP & intégrations',
		pitch: 'Je branche les modèles sur les vraies données de l’entreprise via le Model Context Protocol.',
		points: [
			'2 serveurs MCP maison (FastMCP) déployés en production : base de connaissances et PostgreSQL',
			'Base de connaissances de 989 notes interrogée par les agents',
			'Backend conçu pour accueillir des serveurs MCP par domaine métier',
			'Apps MCP compatibles Claude, Codex, Gemini CLI et Cursor',
		],
		tags: ['MCP', 'FastMCP', 'SQLite FTS5', 'Obsidian'],
		metric: '2 MCP en prod',
	},
	{
		id: 'claude-code',
		title: 'Développement agentique',
		pitch: 'Le développement lui-même outillé comme un système multi-agent : skills, sous-agents, hooks et plugins.',
		points: [
			'Workflow /spec → /feature → /go → /ship : TDD par sous-agents, une revue par diff, merge humain',
			'Garde-fous déterministes par hooks : pas de DDL, pas de commit direct, secrets, tests ciblés',
			'Sur la plateforme IA : 13 sous-agents, 38 skills, 27 hooks ; 162 skills sur 5 dépôts au total',
			'7 plugins publiés, dont 4 Cowork : copilote dirigeant, triage support, feedback, backlog',
		],
		tags: ['Claude Code', 'Cowork', 'Hooks', 'Plugins'],
		metric: '162 skills',
	},
	{
		id: 'llmops',
		title: 'LLMOps : évals & coûts',
		pitch: 'Ce qui ne se mesure pas ne part pas en production.',
		points: [
			'Pyramide de tests : unitaires, intégration sur base réelle, fonctionnels LLM ; plus de 7 000 tests',
			'DeepEval : Faithfulness, Answer Relevancy, G-Eval métier et contrôle des outils appelés',
			'Golden set de 64 cas rejoué 5 fois : une vraie régression se distingue de la variance',
			'Langfuse : traces lisibles par le métier, coûts et latences par agent ; context caching −33 %',
		],
		tags: ['Langfuse', 'DeepEval', 'Pytest', 'FinOps'],
		metric: '−33 % de coûts',
	},
	{
		id: 'backend',
		title: 'Backend & cloud',
		pitch: 'Des fondations solides pour que l’IA ait des données fiables à manipuler.',
		points: [
			'Backend ERP de zéro : Bun, Hono, Zod, TypeScript strict, PostgreSQL avec une base par client',
			'Passerelle IA en lecture seule par construction : vues autorisées, colonnes validées, paramètres liés',
			'Architecture hexagonale vérifiée en CI, mutation testing à 80 % sur chaque PR',
			'41 endpoints OpenAPI, 496 schémas Zod ; 77 routes FastAPI sur GCP Cloud Run',
		],
		tags: ['TypeScript', 'Hono', 'PostgreSQL', 'GCP'],
		metric: '41 endpoints OpenAPI',
	},
];

export const leadership = {
	title: 'Stratégie, management & formation',
	points: [
		'Architecture multi-chatbots spécialisés proposée à la direction, puis adoptée en production',
		'Plus de 6 notes de décision stratégiques : choix de langage, RAG ou base de connaissances, organisation du pôle IA',
		'Encadrement direct de 2 à 3 personnes ; 3 à 5 sessions de formation tech et non-tech (Claude Code, Claude Desktop, Cowork)',
	],
};
