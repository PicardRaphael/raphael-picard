/**
 * Content specific to the CV (app/cv → public/cv-RaphaelPICARD-IA.pdf): richer than the site, never contradicting it.
 * Facts shared with the site (projects, degrees, certifications, contact) are read from content/work.ts and lib/site.ts.
 */

export const cvHeader = {
	location: 'Lyon · télétravail',
	keywords: 'Agents IA · RAG · MCP · LLMOps · Formation des équipes | LangGraph · Claude Code | Python · TypeScript',
	phone: { label: '06 50 93 15 73', href: 'tel:+33650931573' },
};

export const cvSummary =
	'8+ ans d’ingénierie logicielle et une première intégration d’IA en production dès 2018. Depuis novembre 2025, Senior AI Engineer & Responsable IA chez Neoteem, éditeur d’un ERP immobilier : je conçois et mets en production des agents IA utiles au quotidien. 7 agents spécialisés y assistent les gestionnaires, en lecture seule sur les données, sous contrôle humain, évalués avant chaque version et suivis en coût. Je porte la stratégie IA auprès de la direction, j’encadre le pôle IA et je forme les équipes techniques et métier.';

/** Key figures of the CV header: the site's figures (content/profile.ts), worded for a standalone page. */
export const cvStats = [
	{ value: '7', label: 'agents IA en production' },
	{ value: '5', label: 'contrôles humains avant toute action engageante' },
	{ value: '−33 %', label: 'de coûts d’inférence grâce au context caching' },
	{ value: '8+', label: 'ans d’ingénierie logicielle' },
];

export type CvSkill = { label: string; items: string };

export const cvSkills: CvSkill[] = [
	{
		label: 'IA générative & agents',
		items: 'LangGraph, LangChain, agents ReAct, multi-agents, function calling, human-in-the-loop, CrewAI, OpenAI Agents SDK, AutoGen',
	},
	{ label: 'LLM', items: 'Gemini (Vertex AI), Claude (API Anthropic), context caching, prompt engineering' },
	{ label: 'RAG & données', items: 'RAG hybride plein texte + sémantique, pgvector, Reciprocal Rank Fusion, reranking, embeddings, Unstructured (ETL, chunking)' },
	{ label: 'LLMOps & qualité', items: 'DeepEval (LLM-as-judge, G-Eval, Faithfulness), golden sets, Langfuse (traçage, coûts, latence), Pytest, Jest, Vitest, mutation testing' },
	{ label: 'Développement agentique', items: 'Claude Code (skills, sous-agents, hooks, plugins), serveurs MCP (FastMCP), Cowork, n8n' },
	{ label: 'Backend', items: 'Python (FastAPI, Pydantic), TypeScript (Bun, Hono, Zod), PostgreSQL, OpenAPI, GraphQL, architecture hexagonale' },
	{ label: 'Front-end', items: 'React 19, Next.js, TypeScript, Tailwind CSS, Storybook, Testing Library' },
	{ label: 'Cloud & DevOps', items: 'GCP (Cloud Run, Cloud Functions, Vertex AI), Docker, CI/CD GitLab et GitHub Actions' },
];

export type CvBlock = { title?: string; points: string[] };

export type CvExperience = {
	role: string;
	company: string;
	period: string;
	context: string;
	blocks: CvBlock[];
	stack: string;
};

export const cvExperiences: CvExperience[] = [
	{
		role: 'Senior AI Engineer & Responsable IA',
		company: 'Neoteem',
		period: 'Nov. 2025 – aujourd’hui',
		context: 'Éditeur d’un ERP pour les professionnels de l’immobilier · CDI, télétravail',
		blocks: [
			{
				title: 'Stratégie & leadership',
				points: [
					'Architecture multi-chatbots spécialisés, plutôt qu’un chatbot unique généraliste, proposée à la direction puis adoptée en production',
					'Plus de 6 notes de décision stratégiques rédigées : choix du langage (Python, Go ou TypeScript), RAG ou base de connaissances, organisation du pôle IA',
					'Encadrement direct de 2 à 3 personnes ; 3 à 5 sessions de formation tech et non-tech (Claude Code, Claude Desktop, Cowork, bonnes pratiques IA)',
				],
			},
			{
				title: '7 agents IA en production (Python, FastAPI, LangGraph, Gemini)',
				points: [
					'**NeoChat** : assistant des gestionnaires immobiliers sur leurs données, mails et documents ; moteur ReAct déclaratif, 42 vues métier couvertes par 5 outils génériques choisis par similarité sémantique',
					'**NeoSupport** : RAG hybride sur la documentation du logiciel (plein texte + pgvector, fusion RRF) ; demande une précision si la question est ambiguë, signale les manques de la doc au lieu d’inventer',
					'**NeoAgent** : comparateur de devis (extraction multimodale de PDF, Map-Reduce, score et incohérences), reformulation, annonces immobilières, modèles de documents',
					'Sécurité par construction : passerelle de données en lecture seule et 5 points de contrôle humain (interruptions LangGraph) ; aucun mail ne part, aucun document n’est supprimé sans validation',
					'77 routes FastAPI déployées sur GCP Cloud Run ; client HTTP généré depuis la spec OpenAPI du backend',
				],
			},
			{
				title: 'Qualité, évaluation & coûts (LLMOps)',
				points: [
					'Plus de 7 000 tests, CI sur chaque PR ; golden set de 64 cas × 5 tirages évalué avec DeepEval avant chaque release',
					'Chaque conversation tracée dans Langfuse, coût et latence suivis par application et par agent ; context caching : −33 % de coûts d’inférence',
				],
			},
			{
				title: 'Backend TypeScript',
				points: [
					'Couche de données de l’ERP réécrite de zéro (Bun, Hono, Zod, PostgreSQL) en remplacement de fonctions PostgreSQL historiques : 41 endpoints OpenAPI, 496 schémas Zod',
					'Architecture hexagonale vérifiée en CI, mutation testing à 80 % sur chaque PR',
				],
			},
			{
				title: 'Développement agentique & outillage',
				points: [
					'Claude Code à l’échelle de l’équipe : 162 skills sur 5 dépôts ; plateforme IA : 13 sous-agents, 38 skills, 27 hooks (TDD délégué, garde-fous déterministes)',
					'Base de connaissances de 989 notes branchée aux agents via 2 serveurs MCP maison (base de connaissances, PostgreSQL)',
					'4 plugins Cowork pour les métiers : copilote dirigeant, triage du support, retours utilisateurs, backlog produit',
				],
			},
		],
		stack: 'Python · FastAPI · LangGraph · Gemini · Vertex AI · pgvector · Langfuse · DeepEval · TypeScript · Bun · Hono · PostgreSQL · GCP',
	},
	{
		role: 'Développeur Full-Stack & IA',
		company: 'Raphaël Picard EI',
		period: 'Déc. 2022 – nov. 2025',
		context: 'Indépendant · mission Royal Canin (ci-dessous) jusqu’en avril 2025, puis projets d’IA appliquée',
		blocks: [
			{
				points: [
					'Agents autonomes et workflows multi-agents (LangGraph, CrewAI, OpenAI Agents SDK, AutoGen) : assistants qui collaborent sur la résolution de bugs et le refactoring',
					'Conception d’un serveur MCP (Python) donnant aux agents un accès à jour à la documentation technique ; chatbot RAG personnel (LangChain, embeddings)',
					'Automatisations n8n : appels d’API, enrichissement de données, intégrations Notion, Slack et Airtable',
					'API FastAPI (injection de dépendances, typage fort) et applications Next.js en Clean Architecture (DTO, services, tests Zod et Jest, Prisma, PostgreSQL, Vercel)',
				],
			},
		],
		stack: 'LangGraph · CrewAI · MCP · LangChain · n8n · FastAPI · Next.js',
	},
	{
		role: 'Développeur Front-End Senior',
		company: 'Royal Canin · Ekino',
		period: 'Déc. 2022 – avr. 2025',
		context: 'Plateforme e-commerce internationale, plus de 100 pays · mission freelance via Raphaël Picard EI, pour Ekino',
		blocks: [
			{
				points: [
					'Optimisation des parcours critiques B2B et B2C et des performances UX à l’échelle internationale',
					'Migration complète de la base de code de JavaScript vers TypeScript, refonte en React Hooks',
					'Tests automatisés (Jest, Testing Library) pour fiabiliser les livraisons',
					'Alignement de la refonte technique sur la roadmap avec le PMO et les Product Owners (délais, priorités métier)',
				],
			},
		],
		stack: 'React · TypeScript · Jest · Testing Library',
	},
	{
		role: 'Développeur Full-Stack',
		company: 'Schoolmouv',
		period: 'Mars 2022 – déc. 2022',
		context: 'Plateforme éducative interactive · CDI, télétravail',
		blocks: [
			{
				points: [
					'Conception et développement du MVP de zéro (React, Next.js, TypeScript) : R&D technique, architecture hexagonale',
					'Bibliothèque Storybook de composants réutilisables ; API REST Express documentée avec Swagger ; tests Jest et Testing Library',
					'Encadrement technique de développeurs juniors, amélioration des rituels agiles (Scrum, Kanban)',
					'Coordination avec le PMO et l’équipe produit : priorités du MVP, itérations, jalons et suivi des livrables',
				],
			},
		],
		stack: 'React · Next.js · TypeScript · Node.js · Express · Storybook',
	},
	{
		role: 'Développeur Full-Stack',
		company: 'Aixia Systèmes · Leasys Rent',
		period: 'Sept. 2018 – mars 2022',
		context: 'Refonte des outils numériques d’un loueur automobile · CDI, hybride',
		blocks: [
			{
				points: [
					'PWA React (MUI) intégrant l’API Google Vision pour analyser automatiquement des documents : première intégration d’IA en production, dès 2018',
					'Refonte complète du front-end et BFF GraphQL (Node.js, Apollo) devant les microservices',
					'Monorepo Lerna et CI/CD GitLab au service d’une équipe de 7 développeurs',
					'Migration et sécurisation d’API Symfony 3 → 5, couverture de tests renforcée',
				],
			},
		],
		stack: 'React · GraphQL · Apollo · Node.js · Symfony · GitLab CI',
	},
];

/** Short descriptions of the open-source repos for the CV (the site's pitches are longer). */
export const cvProjectNotes: Record<string, string> = {
	'wow-forever': 'Assistant expert où l’IA ne calcule jamais : serveur MCP de 8 outils + plugin Claude Code, 400+ fichiers de tests.',
	'claude-forge': 'Méta-framework Claude Code : configuration conforme générée, hooks bloquants, serveur MCP de 22 outils (FastMCP).',
	agentsdir: 'CLI TypeScript (MIT) : architecture AGENTS.md pour Codex, Cursor et opencode, projetée vers Claude Code et vérifiée en CI.',
	'mcp-server-documentation': 'Serveur MCP de recherche unifiée dans la documentation de LangChain, LangGraph, Next.js, Tailwind et FastMCP.',
};

export const cvExtraTraining = 'Formations complémentaires Udemy : data, IA, développement web (depuis 2016)';

export const cvLanguages = ['Français : langue maternelle', 'Anglais : B1, technique et opérationnel'];
