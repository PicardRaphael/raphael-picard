/**
 * Content specific to the CV (app/cv → public/raphael-picard-cv-senior-ai-engineer-responsable-ia.pdf): richer than the site, never contradicting it.
 * Facts shared with the site (projects, degrees, certifications, contact) are read from content/work.ts and lib/site.ts.
 * Only real figures: nothing here is rounded up or estimated. One word per thing: an « assistant » is the product a
 * user talks to, an « agent » the LangGraph building block inside it.
 */

export const cvHeader = {
	location: 'Lyon · télétravail',
	keywords: 'Agents LLM en production · LangGraph · RAG · LLMOps · MCP · Python · TypeScript · GCP',
};

export const cvSummary =
	'Ingénieur logiciel depuis plus de 8 ans, Senior AI Engineer et responsable IA chez Neoteem (éditeur d’un ERP immobilier) depuis novembre 2025. Je conçois et mets en production des assistants IA utilisés au quotidien par les gestionnaires, avec une gouvernance stricte : données métier en lecture seule, validation humaine avant toute action engageante, évaluation systématique avant livraison. Je porte la stratégie IA auprès de la direction, j’encadre le pôle IA et je forme les équipes techniques et métier.';

/** Key figures of the CV header: the site's figures (content/profile.ts), worded for a standalone page. */
export const cvStats = [
	{ value: '7', label: 'agents IA en production' },
	{ value: '−33 %', label: 'de coût d’inférence' },
	{ value: '0', label: 'action engageante sans validation humaine' },
	{ value: '3 à 4', label: 'personnes encadrées' },
];

export type CvSkill = { label: string; items: string };

export const cvSkills: CvSkill[] = [
	{ label: 'Agents et IA générative', items: 'LangGraph, LangChain, CrewAI, agents ReAct, systèmes multi-agents, human-in-the-loop, Gemini (Vertex AI), Claude, prompt engineering' },
	{ label: 'RAG et données', items: 'RAG hybride (plein texte et pgvector, fusion RRF), reranking, embeddings, Qdrant, ingestion de documents (Unstructured)' },
	{ label: 'Évaluation et LLMOps', items: 'DeepEval (LLM-as-judge), golden sets, observabilité Langfuse (traces, coûts, latence)' },
	{ label: 'Qualité logicielle', items: 'Pytest, Vitest, Jest, mutation testing, architecture hexagonale, CI/CD' },
	{ label: 'Back-end et cloud', items: 'Python (FastAPI, Pydantic), TypeScript (Bun, Hono, Zod, Node.js), PostgreSQL, OpenAPI, GraphQL, Google Cloud (Cloud Run), Docker' },
	{ label: 'Outillage et front-end', items: 'Claude Code, serveurs MCP (FastMCP), n8n, React, Next.js, Storybook' },
];

/** A group of bullets inside a job; a sub-mission carries its own period. */
export type CvBlock = { title?: string; period?: string; points: string[] };

export type CvExperience = {
	role: string;
	company: string;
	period: string;
	context: string;
	/** The client of a consulting job, shown after the employer in plain text: « Aixia Systèmes (pour Leasys Rent) ». */
	client?: string;
	blocks: CvBlock[];
};

export const cvExperiences: CvExperience[] = [
	{
		role: 'Senior AI Engineer & Responsable IA',
		company: 'Neoteem',
		period: 'Nov. 2025 – aujourd’hui',
		context: 'Éditeur d’un ERP pour les professionnels de l’immobilier · CDI, télétravail',
		blocks: [
			{
				title: 'Stratégie et leadership',
				points: [
					'Architecture en assistants spécialisés plutôt qu’en assistant unique : proposée à la direction et adoptée en production',
					'Notes de décision pour la direction : organisation du pôle IA, choix d’architecture (recherche documentaire ou base de connaissances structurée), langage de programmation du pôle',
					'Encadrement du pôle IA (3 à 4 personnes) et formation des équipes techniques et métier aux outils IA et à leurs bonnes pratiques',
				],
			},
			{
				title: '3 assistants IA en production (7 agents)',
				points: [
					'**NeoChat** : répond aux gestionnaires à partir de leurs données, courriels et documents. Un agent ReAct couvre 42 vues métier avec seulement 5 outils génériques',
					'**NeoSupport** : répond aux questions sur le logiciel à partir de sa documentation (RAG hybride). Il demande une précision si la question est ambiguë et signale les sujets non documentés plutôt que d’inventer une réponse',
					'**NeoAgent** : compare les devis PDF et signale leurs incohérences (extraction multimodale), et rédige des annonces immobilières et des documents',
					'Gouvernance dès la conception : données métier en lecture seule, envoi de courriel et suppression de document soumis à 5 points de validation humaine (interruptions LangGraph)',
				],
			},
			{
				title: 'Qualité et coûts sous contrôle',
				points: [
					'Coût d’inférence réduit de 33 % par le context caching. Chaque conversation tracée dans Langfuse, coût et latence suivis par agent',
					'Aucune version livrée sans évaluation : golden set de 64 cas rejoués 5 fois (DeepEval, LLM-as-judge) et plus de 7 000 tests automatisés',
				],
			},
			{
				title: 'Ingénierie et outillage',
				points: [
					'Couche de données des agents réécrite en TypeScript (Bun, Hono, Zod, PostgreSQL) à la place de fonctions SQL historiques, en architecture hexagonale vérifiée en CI',
					'Score de mutation minimal de 80 % exigé avant chaque fusion, pour mesurer la capacité des tests à détecter les régressions',
					'Claude Code déployé pour l’équipe (règles, sous-agents et garde-fous communs sur 5 dépôts). 2 serveurs MCP développés en interne relient les agents à la base de connaissances',
				],
			},
		],
	},
	{
		role: 'Développeur full-stack et IA',
		company: 'Indépendant (EI)',
		period: 'Déc. 2022 – nov. 2025',
		context: 'Mission longue chez Royal Canin, puis projets d’IA appliquée publiés en open source',
		blocks: [
			{
				title: 'Développeur front-end senior · Royal Canin (via Ekino)',
				period: 'Déc. 2022 – avr. 2025',
				points: [
					'Site de commerce en ligne déployé dans plus de 100 pays : optimisation des parcours B2B et B2C et des performances',
					'Migration complète du code de JavaScript vers TypeScript, passage aux React Hooks, tests Jest et Testing Library',
					'Alignement de la refonte technique sur la feuille de route avec le PMO et les product owners',
				],
			},
			{
				title: 'Projets d’IA appliquée, en open source sur GitHub',
				period: 'Mars 2025 – nov. 2025',
				points: [
					'[mcp-server-documentation](https://github.com/PicardRaphael/mcp-server-documentation) : serveur MCP (FastMCP) qui donne aux agents un accès unifié et actualisé à la documentation de LangChain, LangGraph, Next.js et Tailwind CSS',
					'[coder-crew](https://github.com/PicardRaphael/coder-crew) : 4 agents CrewAI (lead, back-end, front-end, tests) qui conçoivent, codent et testent ensemble une application, avec un LLM par rôle et des coûts suivis avec AgentOps',
					'[job-booster](https://github.com/PicardRaphael/job-booster) : application RAG (FastAPI, Next.js, LangChain, Qdrant, reranker BGE) qui rédige des courriels et des lettres de motivation à partir d’une offre d’emploi, avec plusieurs LLM au choix et des traces Langfuse',
					'Autres projets : agents LangGraph et OpenAI Agents SDK, API FastAPI et Node.js en Clean Architecture, automatisations n8n',
				],
			},
		],
	},
	{
		role: 'Développeur full-stack',
		company: 'Schoolmouv',
		period: 'Mars 2022 – déc. 2022',
		context: 'Plateforme éducative interactive · CDI, télétravail',
		blocks: [
			{
				points: [
					'Conception et développement du MVP de zéro (React, Next.js, TypeScript), en architecture hexagonale',
					'Bibliothèque de composants Storybook, API REST Express documentée avec Swagger',
					'Encadrement technique de développeurs juniors et coordination avec le PMO et l’équipe produit (priorités du MVP, jalons, livrables)',
				],
			},
		],
	},
	{
		role: 'Développeur full-stack',
		company: 'Aixia Systèmes',
		client: 'pour Leasys Rent',
		period: 'Sept. 2018 – mars 2022',
		context: 'Refonte des outils numériques d’un loueur de véhicules · CDI, télétravail partiel',
		blocks: [
			{
				points: [
					'Création, dès 2018, d’une PWA React (MUI) d’analyse automatique de documents avec l’API Google Vision',
					'Refonte complète du front-end et création d’un BFF GraphQL (Node.js, Apollo) devant les microservices',
					'Mise en place d’un monorepo Lerna et de la CI/CD GitLab pour une équipe de 7 développeurs, puis migration des API de Symfony 3 à Symfony 5 et sécurisation',
				],
			},
		],
	},
];

/** Open-source repos on the CV, in this order, with a short description (the site's pitches are longer). */
export const cvProjectNotes: Record<string, string> = {
	'claude-forge': 'générateur de configurations Claude Code vérifiées automatiquement, avec des hooks bloquants et un serveur MCP de 22 outils (FastMCP)',
	agentsdir: 'outil en ligne de commande TypeScript (licence MIT) qui unifie les fichiers d’instructions AGENTS.md de Codex, Cursor et opencode, les convertit pour Claude Code et les vérifie en CI',
	'wow-forever': 'assistant expert d’un jeu vidéo où le LLM ne calcule jamais, chaque chiffre venant d’un outil déterministe (serveur MCP de 8 outils, plugin Claude Code)',
};

export const cvLanguages = [
	{ label: 'Français', level: 'langue maternelle' },
	{ label: 'Anglais', level: 'B1, lecture technique courante (documentation lue et formations suivies en anglais)' },
];
