/**
 * Content specific to the CV (app/cv → public/raphael-picard-cv-senior-ai-engineer-responsable-ia.pdf): richer than the site, never contradicting it.
 * Facts shared with the site (projects, degrees, certifications, contact) are read from content/work.ts and lib/site.ts.
 * Only real figures: nothing here is rounded up or estimated.
 */

export const cvHeader = {
	location: 'Lyon · télétravail',
	keywords: 'Agents LLM en production · RAG · LLMOps · MCP · Python · TypeScript · GCP',
	phone: { label: '06 50 93 15 73', href: 'tel:+33650931573' },
};

export const cvSummary =
	'Plus de huit ans d’ingénierie logicielle, dont la mise en production d’agents IA. Depuis novembre 2025, Senior AI Engineer et responsable IA chez Neoteem, éditeur d’un ERP immobilier : je conçois et mets en production des assistants IA utilisés au quotidien par les gestionnaires, en lecture seule sur leurs données, sous contrôle humain, évalués avant chaque version, leur coût suivi en continu. Je porte la stratégie IA auprès de la direction, j’encadre le pôle IA et je forme les équipes techniques et métier.';

/** Key figures of the CV header: the site's figures (content/profile.ts), worded for a standalone page. */
export const cvStats = [
	{ value: '7', label: 'agents IA en production' },
	{ value: '−33 %', label: 'de coût d’inférence (context caching)' },
	{ value: '64 × 5', label: 'cas rejoués avant chaque version' },
	{ value: '5', label: 'points de contrôle humain' },
];

export type CvSkill = { label: string; items: string };

export const cvSkills: CvSkill[] = [
	{ label: 'IA générative & agents', items: 'LangGraph, agents ReAct, multiagents, human-in-the-loop, Gemini (Vertex AI), Claude (API Anthropic), context caching' },
	{ label: 'RAG & données', items: 'RAG hybride (plein texte + pgvector, fusion RRF), reranking, embeddings, Unstructured' },
	{ label: 'LLMOps & qualité', items: 'DeepEval (LLM-as-judge, Faithfulness), golden sets, Langfuse (traces, coûts, latence), Pytest, Vitest, mutation testing' },
	{ label: 'Outillage agentique', items: 'Claude Code (skills, sous-agents, hooks), serveurs MCP (FastMCP), n8n' },
	{ label: 'Back-end & cloud', items: 'Python (FastAPI, Pydantic), TypeScript (Bun, Hono, Zod), PostgreSQL, OpenAPI, GCP (Cloud Run, Vertex AI), Docker, CI/CD' },
	{ label: 'Front-end', items: 'React, Next.js, TypeScript, Storybook' },
];

/** A group of bullets inside a job; a sub-mission carries its own period. */
export type CvBlock = { title?: string; period?: string; points: string[] };

export type CvExperience = {
	role: string;
	company: string;
	period: string;
	context: string;
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
					'Architecture de chatbots spécialisés plutôt qu’un chatbot unique : proposée à la direction, adoptée en production',
					'Notes de décision pour la direction : choix du langage (Python, Go ou TypeScript), RAG ou base de connaissances, organisation du pôle IA',
					'Encadrement du pôle IA (3 à 4 personnes) ; formation des équipes techniques et métier (Claude Code, Claude Desktop, Cowork, bonnes pratiques IA)',
				],
			},
			{
				title: 'Sept agents IA en production',
				points: [
					'**NeoChat** : assistant des gestionnaires sur leurs données, courriels et documents ; moteur ReAct, 42 vues métier servies par 5 outils génériques',
					'**NeoSupport** : RAG hybride sur la documentation du logiciel ; demande une précision si la question est ambiguë, signale les manques de la documentation plutôt que d’inventer',
					'**NeoAgent** : comparaison de devis PDF (extraction multimodale, détection d’incohérences), rédaction d’annonces immobilières et de documents',
					'Sécurité dès la conception : données en lecture seule, 5 points de contrôle humain (interruptions LangGraph) ; aucun courriel envoyé ni document supprimé sans validation humaine',
					'Service IA FastAPI sur GCP Cloud Run, client HTTP généré depuis le contrat OpenAPI de l’ERP',
				],
			},
			{
				title: 'Qualité, évaluation et coûts (LLMOps)',
				points: [
					'Golden set de 64 cas rejoués 5 fois (DeepEval) avant chaque version ; plus de 7 000 tests, CI à chaque PR',
					'Chaque conversation tracée dans Langfuse, coût et latence suivis par application et par agent ; context caching : −33 % sur le coût d’inférence',
				],
			},
			{
				title: 'Outillage agentique',
				points: [
					'Claude Code déployé pour l’équipe : skills, sous-agents et hooks partagés sur 5 dépôts (TDD délégué, garde-fous déterministes)',
					'Base de connaissances interne reliée aux agents par 2 serveurs MCP développés en interne',
					'4 assistants Cowork pour les métiers : direction, tri des demandes de support, retours utilisateurs, backlog produit',
				],
			},
			{
				title: 'Back-end TypeScript',
				points: [
					'Couche de données qui alimente les agents entièrement réécrite en TypeScript (Bun, Hono, Zod, PostgreSQL) : 41 routes OpenAPI typées',
					'Architecture hexagonale vérifiée en CI, score de mutation de 80 % exigé à chaque PR',
				],
			},
		],
	},
	{
		role: 'Développeur full-stack et IA, indépendant',
		company: 'Raphaël Picard EI',
		period: 'Déc. 2022 – nov. 2025',
		context: 'Une mission longue pour Royal Canin, puis des projets d’IA appliquée publiés en open source',
		blocks: [
			{
				title: 'Développeur front-end senior · Royal Canin (via Ekino)',
				period: 'Déc. 2022 – avr. 2025',
				points: [
					'Plateforme de commerce en ligne déployée dans plus de 100 pays : optimisation des parcours critiques (B2B, B2C) et des performances',
					'Migration complète du code de JavaScript vers TypeScript, refonte en React Hooks, tests Jest et Testing Library',
					'Alignement de la refonte technique sur la feuille de route avec le PMO et les product owners',
				],
			},
			{
				title: 'Projets d’IA appliquée, en open source sur GitHub',
				period: '2025',
				points: [
					'[mcp-server-documentation](https://github.com/PicardRaphael/mcp-server-documentation) (13 étoiles) : serveur MCP (FastMCP) qui donne aux agents un accès unifié et à jour à la documentation de LangChain, LangGraph, Next.js et Tailwind',
					'[coder-crew](https://github.com/PicardRaphael/coder-crew) : quatre agents CrewAI (lead, back-end, front-end, tests) qui conçoivent, codent et testent une application ensemble ; un LLM par rôle, coûts suivis avec AgentOps',
					'[job-booster](https://github.com/PicardRaphael/job-booster) : RAG applicatif (FastAPI, Next.js, LangChain, Qdrant et reranker BGE) qui rédige courriels et lettres de motivation à partir d’une offre ; multi-LLM, traces Langfuse',
					'Agents LangGraph et OpenAI Agents SDK, API en Clean Architecture (FastAPI, Node.js), automatisations n8n',
				],
			},
		],
	},
	{
		role: 'Développeur full-stack',
		company: 'Schoolmouv',
		period: 'Mars – déc. 2022',
		context: 'Plateforme éducative interactive · CDI, télétravail',
		blocks: [
			{
				points: [
					'Conception et développement du MVP, de zéro (React, Next.js, TypeScript) : R&D technique, architecture hexagonale',
					'Bibliothèque Storybook de composants ; API REST Express documentée avec Swagger ; tests Jest et Testing Library',
					'Encadrement technique de développeurs juniors ; coordination avec le PMO et le produit (priorités du MVP, jalons, livrables)',
				],
			},
		],
	},
	{
		role: 'Développeur full-stack',
		company: 'Aixia Systèmes, pour Leasys Rent',
		period: 'Sept. 2018 – mars 2022',
		context: 'Refonte des outils numériques d’un loueur de véhicules · CDI, télétravail partiel',
		blocks: [
			{
				points: [
					'PWA React (MUI) qui analyse des documents avec l’API Google Vision : première intégration d’IA en production (2018)',
					'Refonte complète du front-end et création d’un BFF GraphQL (Node.js, Apollo) devant les microservices',
					'Monorepo Lerna et CI/CD GitLab pour une équipe de 7 développeurs ; migration et sécurisation des API Symfony 3 → 5',
				],
			},
		],
	},
];

/** Open-source repos on the CV, in this order, with a short description (the site's pitches are longer). */
export const cvProjectNotes: Record<string, string> = {
	'wow-forever': 'assistant expert de World of Warcraft où l’IA ne calcule jamais, avec un serveur MCP de 8 outils, un plugin Claude Code et plus de 400 fichiers de tests',
	'claude-forge': 'méta-framework Claude Code qui génère une configuration conforme, avec hooks bloquants et serveur MCP de 22 outils (FastMCP)',
	agentsdir: 'outil en ligne de commande TypeScript (licence MIT) qui projette une architecture AGENTS.md pour Codex, Cursor et opencode vers Claude Code, vérifiée en CI',
};

export const cvLanguages = [
	{ label: 'Français', level: 'langue maternelle' },
	{ label: 'Anglais', level: 'B1, technique et opérationnel' },
];
