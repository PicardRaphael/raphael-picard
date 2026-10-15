export type Project = {
	name: string;
	kind: string;
	pitch: string;
	highlights: string[];
	stack: string[];
	url: string;
	featured?: boolean;
	badge?: string;
};

export const projects: Project[] = [
	{
		name: 'wow-forever',
		kind: 'App MCP · système expert',
		pitch: "Un assistant expert où l'IA ne calcule jamais : chaque chiffre est lu dans les données du jeu, calculé par un moteur testé et livré avec sa provenance et son niveau de certitude.",
		highlights: [
			'Serveur MCP de 8 outils + plugin Claude Code (8 skills, 2 agents)',
			'Garde-fou automatique : tout chiffre qui ne vient pas d’un outil est signalé',
			'Compatible Claude Desktop, Codex, Gemini CLI et Cursor',
			'Veille quotidienne des versions en CI, 400+ fichiers de tests',
		],
		stack: ['Python', 'uv', 'MCP', 'Claude Code', 'Lua'],
		url: 'https://github.com/PicardRaphael/wow-forever',
		featured: true,
		badge: '970+ commits en 3 semaines',
	},
	{
		name: 'claude-forge',
		kind: 'Méta-framework Claude Code',
		pitch: 'Mon studio R&D : il conseille, génère de la configuration Claude Code conforme et capitalise chaque leçon dans un vault interrogeable par MCP.',
		highlights: [
			'Serveur MCP forge-brain : FastMCP + SQLite FTS5, 22 outils',
			'Hooks bloquants, doctrine vivante avec validation humaine typée',
			'Contournement documenté des MCP non chargés dans les sub-agents',
		],
		stack: ['Python', 'FastMCP', 'SQLite FTS5', 'Claude Code'],
		url: 'https://github.com/PicardRaphael/claude-forge',
		featured: true,
		badge: '770+ commits',
	},
	{
		name: 'agentsdir',
		kind: 'CLI open source · MIT',
		pitch: 'Installe dans n’importe quel dépôt l’architecture AGENTS.md + .agents/ lue par Codex, Cursor et opencode, et la projette vers Claude Code — sans aucune dérive.',
		highlights: ['init, add, sync, check, doctor : tout est vérifiable en CI', 'Tests unitaires + end-to-end Ubuntu et Windows', 'Durcissement sécurité : path traversal, symlinks, injections'],
		stack: ['TypeScript', 'Node 22', 'Vitest'],
		url: 'https://github.com/PicardRaphael/agentsdir',
		badge: 'v1.0.0',
	},
	{
		name: 'mcp-server-documentation',
		kind: 'Serveur MCP',
		pitch: 'Une recherche unifiée dans la documentation de LangChain, LangGraph, Next.js, Tailwind ou FastMCP, directement accessible aux agents.',
		highlights: ['Résolution intelligente des noms de librairies', 'Requêtes asynchrones et récupération parallèle'],
		stack: ['Python', 'FastMCP', 'asyncio'],
		url: 'https://github.com/PicardRaphael/mcp-server-documentation',
		badge: '13 ★',
	},
	{
		name: 'job-booster',
		kind: 'RAG applicatif',
		pitch: 'Génère e-mails, messages LinkedIn et lettres de motivation en croisant une offre avec le profil du candidat.',
		highlights: ['Recherche vectorielle Qdrant + reranker BGE', 'Multi-LLM : Anthropic, OpenAI, Gemini', 'Traces Langfuse, architecture hexagonale'],
		stack: ['FastAPI', 'Next.js', 'LangChain', 'Qdrant'],
		url: 'https://github.com/PicardRaphael/job-booster',
	},
	{
		name: 'coder-crew',
		kind: 'Multi-agents',
		pitch: 'Quatre agents — lead, backend, frontend, tests — qui conçoivent, codent et testent une application Python ensemble.',
		highlights: ['Un LLM choisi par rôle', 'Monitoring des coûts et sessions avec AgentOps'],
		stack: ['CrewAI', 'Claude', 'GPT-4o', 'Gradio'],
		url: 'https://github.com/PicardRaphael/coder-crew',
	},
];

export type Experience = {
	period: string;
	role: string;
	company: string;
	context: string;
	points: string[];
	stack: string[];
	current?: boolean;
};

export const experiences: Experience[] = [
	{
		period: 'Nov. 2025 — aujourd’hui',
		role: 'Senior AI Engineer & Responsable IA',
		company: 'Neoteem',
		context: 'ERP pour les professionnels de l’immobilier · CDI, remote',
		current: true,
		points: [
			'8 agents LangGraph en production : chatbot métier ReAct outillé (14 tools mutualisés), support RAG anti-hallucination, devis Map-Reduce, recherche web sur sources officielles',
			'Backend ERP from scratch en TypeScript (Bun, Hono, PostgreSQL) et migration d’un legacy 100 % fonctions PostgreSQL',
			'Base de connaissances de 989 notes branchée aux agents via 2 serveurs MCP maison',
			'Stratégie IA auprès de la direction, management du pôle IA, formation de toute l’équipe',
		],
		stack: ['Python', 'FastAPI', 'LangGraph', 'Gemini', 'pgvector', 'Langfuse', 'GCP'],
	},
	{
		period: 'Déc. 2022 — Nov. 2025',
		role: 'Développeur Full-Stack & IA',
		company: 'Raphaël Picard EI',
		context: 'Indépendant · solutions web et IA sur mesure',
		points: [
			'Agents autonomes et workflows multi-agents (LangGraph, CrewAI, OpenAI Agents SDK, AutoGen)',
			'Premier serveur MCP et chatbot RAG personnel, automatisations n8n (Notion, Slack, Airtable)',
			'APIs FastAPI et applications Next.js en Clean Architecture',
		],
		stack: ['LangGraph', 'CrewAI', 'MCP', 'n8n', 'Next.js', 'FastAPI'],
	},
	{
		period: 'Déc. 2022 — Avr. 2025',
		role: 'Développeur Front-End Senior',
		company: 'Royal Canin · Ekino',
		context: 'Plateforme e-commerce internationale, plus de 100 pays · mission freelance',
		points: [
			'Optimisation des parcours critiques B2B et B2C à l’échelle internationale',
			'Migration complète JavaScript → TypeScript et refonte en React Hooks',
			'Tests automatisés Jest & Testing Library pour fiabiliser les livraisons',
		],
		stack: ['React', 'TypeScript', 'Jest'],
	},
	{
		period: 'Mars 2022 — Déc. 2022',
		role: 'Développeur Full-Stack',
		company: 'Schoolmouv',
		context: 'Plateforme éducative interactive · CDI',
		points: [
			'MVP conçu from scratch, R&D technique et architecture hexagonale',
			'Bibliothèque Storybook, API REST Express documentée Swagger',
			'Encadrement technique de développeurs juniors',
		],
		stack: ['Next.js', 'TypeScript', 'Node.js', 'Storybook'],
	},
	{
		period: 'Sept. 2018 — Mars 2022',
		role: 'Développeur Full-Stack',
		company: 'Aixia Systèmes · Leasys Rent',
		context: 'Mobilité automobile · CDI',
		points: [
			'PWA React intégrant Google Vision pour analyser automatiquement des documents : ma première IA en production',
			'BFF GraphQL (Node.js, Apollo) devant les microservices, monorepo Lerna et CI/CD GitLab',
			'Migration et sécurisation d’API Symfony 3 → 5',
		],
		stack: ['React', 'GraphQL', 'Node.js', 'Symfony'],
	},
];

export const certifications = [
	{ name: 'Claude Code in Action', issuer: 'Anthropic Academy' },
	{ name: 'Claude with the Anthropic API', issuer: 'Anthropic Academy' },
	{ name: 'Introduction to Agent Skills', issuer: 'Anthropic Academy' },
	{ name: 'Introduction to Model Context Protocol', issuer: 'Anthropic Academy' },
	{ name: 'AI Agents Fundamentals', issuer: 'Hugging Face' },
	{ name: 'Introduction to Large Language Models', issuer: 'Google' },
	{ name: 'Introduction to Responsible AI', issuer: 'Google' },
	{ name: 'Concepteur Développeur Web — RNCP 6 (Bac+4)', issuer: "O'clock" },
];

export const testimonials = [
	{
		quote: 'Un ingénieur Front-End exemplaire, combinant expertise technique, engagement et excellentes qualités humaines.',
		author: 'Kévin François',
		context: 'Projet Royal Canin',
	},
	{
		quote: 'Un profil compétent, pro-actif, avec une bonne vision du métier et une ouverture sur des sujets actuels comme l’IA.',
		author: 'Matthieu Marseille',
		context: 'Projet Royal Canin',
	},
];
