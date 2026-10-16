export type Project = {
	name: string;
	kind: string;
	pitch: string;
	highlights: string[];
	stack: string[];
	/** Public repository; production systems of an employer have none. */
	url?: string;
	/** Shipped at work (Neoteem) rather than in the open-source lab. */
	production?: boolean;
	featured?: boolean;
	badge?: string;
};

export const projects: Project[] = [
	{
		name: 'NeoChat',
		kind: 'Assistant conversationnel · Neoteem',
		pitch: 'L’assistant du logiciel de gestion immobilière : un gestionnaire pose une question sur ses données, ses mails ou ses documents ; l’agent cherche la réponse et peut agir pour lui, sous son contrôle.',
		highlights: [
			'Moteur ReAct déclaratif : un agent se déclare, son graphe LangGraph en est dérivé',
			'Les données comme un catalogue : 42 vues métier couvertes par 5 outils génériques, choisies par similarité sémantique',
			'Passerelle en lecture seule par construction : vues autorisées, colonnes validées, paramètres liés',
			'5 points de contrôle humain (interruptions LangGraph) : aucun mail ne part sans validation',
			'Pagination par curseur opaque : jamais de liste tronquée présentée comme complète',
		],
		stack: ['LangGraph', 'Gemini', 'FastAPI', 'pgvector', 'Hono', 'Langfuse'],
		production: true,
		featured: true,
		badge: 'En production',
	},
	{
		name: 'NeoSupport',
		kind: 'Agent de support · Neoteem',
		pitch: 'Il répond aux questions d’usage du logiciel à partir de sa documentation, demande une précision quand la question est ambiguë et signale les manques de la doc au lieu d’inventer.',
		highlights: [
			'Graphe RAG conditionnel : relances réécrites, orientation métier, raccourci pour les salutations, cache',
			'Recherche hybride plein texte + sémantique fusionnée en Reciprocal Rank Fusion, passages étendus à la page complète',
			'Classement qui ordonne sans exclure ; service SSE déployé à part ; retours utilisateurs collectés',
			'Une panne de recherche n’est jamais présentée comme « rien trouvé »',
		],
		stack: ['LangGraph', 'pgvector', 'Gemini', 'FastAPI'],
		production: true,
		badge: 'En production',
	},
	{
		name: 'NeoAgent',
		kind: 'Agents métier · Neoteem',
		pitch: 'Des assistants intégrés aux écrans du logiciel pour les tâches qui prennent du temps aux gestionnaires : comparer des devis, reformuler un texte, rédiger une annonce immobilière, préparer un modèle de document. Chacun est un graphe LangGraph dédié, servi par une API REST.',
		highlights: [
			'Comparateur de devis : lit les PDF, les confronte à des référentiels publics, attribue un score et signale les incohérences (extraction multimodale, Map-Reduce)',
			'Reformulation en quatre modes, annonces immobilières en huit styles',
			'Modèles de documents avec un garde-fou contre les variables de fusion inconnues',
		],
		stack: ['LangGraph', 'FastAPI', 'Gemini'],
		production: true,
		badge: 'En production',
	},
	{
		name: 'wow-forever',
		kind: 'App MCP · système expert',
		pitch: 'Un assistant expert pour World of Warcraft: Forever, où l’IA ne calcule jamais : chaque chiffre est lu dans les données du jeu, calculé par un moteur testé et livré avec sa provenance et son niveau de certitude.',
		highlights: [
			'Serveur MCP de 8 outils + plugin Claude Code (8 skills, 2 agents)',
			'Garde-fou automatique : tout chiffre qui ne vient pas d’un outil est signalé',
			'Compatible Claude Desktop, Codex, Gemini CLI et Cursor',
			'Veille quotidienne des versions en CI, 400+ fichiers de tests',
		],
		stack: ['Python', 'uv', 'MCP', 'Claude Code', 'Lua'],
		url: 'https://github.com/PicardRaphael/wow-forever',
		badge: '400+ fichiers de tests',
	},
	{
		name: 'claude-forge',
		kind: 'Méta-framework Claude Code',
		pitch: 'Mon studio R&D : il conseille, génère de la configuration Claude Code conforme et capitalise chaque leçon dans un vault interrogeable par MCP.',
		highlights: [
			'Serveur MCP de connaissances : FastMCP + SQLite FTS5, 22 outils',
			'Hooks bloquants, doctrine vivante avec validation humaine typée',
			'Contournement documenté des MCP non chargés dans les sub-agents',
		],
		stack: ['Python', 'FastMCP', 'SQLite FTS5', 'Claude Code'],
		url: 'https://github.com/PicardRaphael/claude-forge',
		featured: true,
		badge: 'Serveur MCP · 22 outils',
	},
	{
		name: 'agentsdir',
		kind: 'CLI open source · MIT',
		pitch: 'Installe dans n’importe quel dépôt l’architecture AGENTS.md + .agents/ lue par Codex, Cursor et opencode, et la projette vers Claude Code ; `check` échoue en CI dès qu’une projection diverge.',
		highlights: ['init, add, sync, check, doctor : tout est vérifiable en CI', 'Tests unitaires + end-to-end Ubuntu et Windows', 'Durcissement sécurité : path traversal, symlinks, injections'],
		stack: ['TypeScript', 'Node 22', 'Vitest'],
		url: 'https://github.com/PicardRaphael/agentsdir',
		badge: 'v1.0.0 · pas encore sur npm',
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
		highlights: ['Recherche vectorielle Qdrant + reranker BGE', 'Multi-LLM : Anthropic, OpenAI, Gemini', 'Traces Langfuse, architecture hexagonale'],
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
		context: 'ERP pour les professionnels de l’immobilier · CDI, télétravail',
		current: true,
		points: [
			'Plateforme d’IA générative : 3 applications Python (NeoChat, NeoSupport, NeoAgent) et un backend TypeScript, 7 agents spécialisés en production',
			'Données métier servies en lecture seule par construction : 42 vues couvertes par 5 outils génériques, 5 points de contrôle humain',
			'Qualité : plus de 7 000 tests, golden set de 64 cas rejoué 5 fois avec DeepEval, chaque conversation tracée dans Langfuse',
			'Context caching : −33 % de coûts d’inférence',
			'Couche de données de l’ERP réécrite de zéro en TypeScript (Bun, Hono, PostgreSQL), en remplacement de fonctions PostgreSQL historiques : 41 endpoints OpenAPI, 496 schémas Zod, mutation testing à 80 %',
			'Base de connaissances de 989 notes branchée aux agents via 2 serveurs MCP maison',
			'Architecture multi-chatbots spécialisés proposée à la direction et adoptée ; plus de 6 notes de décision stratégiques',
			'Encadrement direct de 3 à 4 personnes ; formation des équipes tech et non-tech',
		],
		stack: ['Python', 'FastAPI', 'LangGraph', 'Gemini', 'pgvector', 'Langfuse', 'GCP'],
	},
	{
		period: 'Déc. 2022 — Nov. 2025',
		role: 'Développeur Full-Stack & IA',
		company: 'Raphaël Picard EI',
		context: 'Indépendant · mission Royal Canin jusqu’en avril 2025, puis projets IA : agents, MCP, RAG',
		points: [
			'Agents autonomes et workflows multi-agents (LangGraph, CrewAI, OpenAI Agents SDK, AutoGen)',
			'Premier serveur MCP et chatbot RAG personnel, automatisations n8n (Notion, Slack, Airtable)',
			'API FastAPI et applications Next.js en Clean Architecture',
		],
		stack: ['LangGraph', 'CrewAI', 'MCP', 'n8n', 'Next.js', 'FastAPI'],
	},
	{
		period: 'Déc. 2022 — Avr. 2025',
		role: 'Développeur Front-End Senior',
		company: 'Royal Canin · Ekino',
		context: 'Plateforme e-commerce internationale, plus de 100 pays · mission freelance via Raphaël Picard EI (pour Ekino)',
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
			'MVP conçu de zéro, R&D technique et architecture hexagonale',
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
			'PWA React intégrant l’API Google Vision pour analyser automatiquement des documents : ma première intégration d’IA en production',
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
	{ name: 'AI Agents Fundamentals', issuer: 'Hugging Face / Google' },
	{ name: 'Concepteur développeur web, titre RNCP de niveau 6 (bac + 4)', issuer: 'O’clock' },
];

/** Degrees, with their years (CV). */
export const education = [
	{ name: 'Concepteur développeur web', title: 'titre RNCP de niveau 6 (bac + 4)', school: 'O’clock', years: '2018–2019' },
	{ name: 'Développeur logiciel', title: 'titre RNCP de niveau 5 (bac + 2)', school: 'O’clock', years: '2018' },
];

export const testimonials = [
	{
		quote: 'Un ingénieur Front-End exemplaire, combinant expertise technique, engagement et excellentes qualités humaines.',
		author: 'Kévin François',
		context: 'Projet Royal Canin',
	},
	{
		quote: 'Un profil compétent, proactif, avec une bonne vision du métier et une ouverture sur des sujets actuels comme l’IA.',
		author: 'Matthieu Marseille',
		context: 'Projet Royal Canin',
	},
];
