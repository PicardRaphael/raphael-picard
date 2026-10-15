/**
 * Every word displayed on the site lives here: edit this file to update the portfolio.
 * Numbers come from the CV (oct. 2026), the public GitHub repos and the MCP usage logs.
 */

export const hero = {
	eyebrow: 'Ingénieur IA · Lead IA · Lyon',
	status: '8 agents IA en production',
	headline: "J'industrialise l'IA agentique.",
	lead: "Agents LangGraph, RAG hybrides, serveurs MCP, outillage Claude Code : je conçois des systèmes d'IA qui tiennent en production — testés, évalués, observés. Et je forme les équipes qui les font vivre.",
	primaryCta: { label: 'Parlons de votre projet IA', href: '#contact' },
	secondaryCta: { label: 'Télécharger le CV', href: '/cv-RaphaelPICARD-IA.pdf' },
};

export const stats = [
	{ value: 8, suffix: '', label: 'agents IA en production' },
	{ value: 162, suffix: '', label: 'skills Claude Code écrites' },
	{ value: 6, suffix: '', label: 'serveurs MCP construits' },
	{ value: 9, suffix: '+', label: "ans d'ingénierie logicielle" },
];

export const stack = [
	'LangGraph',
	'Claude',
	'Gemini 2.5',
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
	title: "De développeur full-stack à architecte d'agents.",
	paragraphs: [
		"Pendant neuf ans, j'ai livré des produits web à grande échelle : une plateforme e-commerce déployée dans plus de 100 pays, un MVP EdTech conçu de zéro, des outils métier pour la mobilité. J'y ai appris ce qui fait tenir un logiciel : l'architecture, les tests, la rigueur de livraison.",
		"Depuis novembre 2025, je suis Responsable IA chez Neoteem, éditeur d'un ERP pour les professionnels de l'immobilier. Je porte la stratégie IA auprès de la direction, j'encadre le pôle IA et j'ai mis en production huit agents qui travaillent chaque jour avec les données métier.",
		"Mon avantage : un profil hybride. Je parle architecture aux développeurs, ROI aux dirigeants, et prompts aux modèles.",
	],
	principles: [
		{
			title: "Le LLM ne calcule jamais",
			text: "Les chiffres viennent d'outils déterministes et testés ; le modèle raisonne, cite sa source et dit « je ne sais pas » quand il le faut.",
		},
		{
			title: 'Pas d’agent sans évaluation',
			text: 'LLM-as-judge, tests de régression, traces Langfuse : un agent se mesure avant de se déployer.',
		},
		{
			title: "L'architecture d'abord",
			text: 'Hexagonale, frontières vérifiées en CI, contrats OpenAPI : l’IA mérite la même discipline que le reste du code.',
		},
		{
			title: 'Chaque leçon capitalisée',
			text: 'Vaults de connaissances, skills, hooks et rules : l’équipe et les agents deviennent meilleurs à chaque itération.',
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
			'Moteur ReAct déclaratif, function calling, sub-agents',
			'Routage hybride : embeddings + RRF, repli LLM à la demande',
			'Pipelines Map-Reduce, streaming SSE, mémoire de conversation',
		],
		tags: ['LangGraph', 'ReAct', 'Gemini 2.5', 'Claude'],
		metric: '8 agents en prod',
	},
	{
		id: 'rag',
		title: 'RAG hybride',
		pitch: 'Des réponses ancrées dans les bons documents, avec une source vérifiable à chaque fois.',
		points: [
			'Recherche hybride pgvector + lexicale fusionnée en RRF',
			'Reranking cross-encoder, grounding Vertex AI Search',
			'Extraction verbatim anti-hallucination, ETL Unstructured',
		],
		tags: ['pgvector', 'Qdrant', 'Vertex AI', 'Unstructured'],
		metric: 'RAG support 9 nœuds',
	},
	{
		id: 'mcp',
		title: 'MCP & intégrations',
		pitch: 'Je branche les modèles sur les vraies données de l’entreprise via le Model Context Protocol.',
		points: [
			'Serveurs MCP maison en FastMCP, déployés et monitorés',
			'Base de connaissances de 989 notes interrogée par les agents',
			'Apps MCP compatibles Claude, Codex, Gemini CLI et Cursor',
		],
		tags: ['MCP', 'FastMCP', 'SQLite FTS5', 'Obsidian'],
		metric: '6 serveurs MCP',
	},
	{
		id: 'claude-code',
		title: 'Outillage Claude Code',
		pitch: 'Je transforme Claude Code en plateforme d’équipe : skills, agents, hooks et plugins distribuables.',
		points: [
			'162 skills, 41 agents, 47 hooks, 74 rules sur 5 dépôts',
			'Plugin d’équipe versionné : 41 skills, 12 profils utilisateurs',
			'7 plugins Cowork : copilote dirigeant, triage support, backlog…',
		],
		tags: ['Claude Code', 'Cowork', 'Hooks', 'Plugins'],
		metric: '162 skills',
	},
	{
		id: 'llmops',
		title: 'LLMOps : évals & coûts',
		pitch: 'Ce qui ne se mesure pas ne part pas en production.',
		points: [
			'Tracing distribué et suivi FinOps avec Langfuse',
			'DeepEval : faithfulness, LLM-as-judge, non-régression',
			'Context caching : −33 % de coûts d’inférence',
		],
		tags: ['Langfuse', 'DeepEval', 'Pytest', 'FinOps'],
		metric: '−33 % de coûts',
	},
	{
		id: 'backend',
		title: 'Backend & cloud',
		pitch: 'Des fondations solides pour que l’IA ait des données fiables à manipuler.',
		points: [
			'Backend ERP from scratch : Bun, Hono, TypeScript, PostgreSQL',
			'41 endpoints OpenAPI, 496 schémas Zod, architecture hexagonale',
			'77 routes FastAPI sur GCP Cloud Run, CI/CD GitLab & GitHub',
		],
		tags: ['Python', 'TypeScript', 'PostgreSQL', 'GCP'],
		metric: '41 endpoints OpenAPI',
	},
];

export const leadership = {
	title: 'Stratégie, management & formation',
	points: [
		"Architecture multi-chatbots spécialisés proposée à la direction, puis adoptée en production",
		'Notes de décision : choix de langage, RAG vs base de connaissances, organisation du pôle IA',
		'Management direct du pôle IA et formation des équipes tech et non-tech à Claude Code, Claude Desktop et Cowork',
	],
};
