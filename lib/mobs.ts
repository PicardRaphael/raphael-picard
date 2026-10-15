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

const SPECS: { name: string; lesson: string; zone: Zone; x: number; z: number }[] = [
	{ name: 'Hallucination', lesson: 'Vaincue par un RAG hybride et une extraction verbatim : chaque réponse cite sa source.', zone: 'val', x: -24, z: 2 },
	{ name: 'Régression', lesson: 'Vaincue par les tests DeepEval LLM-as-judge lancés avant chaque mise en production.', zone: 'val', x: 26, z: -2 },
	{ name: 'Bug 404', lesson: 'Corrigé : contrats OpenAPI et 496 schémas Zod valident chaque entrée.', zone: 'val', x: 12, z: -58 },
	{ name: 'Dette technique', lesson: 'Remboursée par une architecture hexagonale aux frontières vérifiées en CI.', zone: 'val', x: -30, z: -40 },
	{ name: 'Fuite de contexte', lesson: 'Colmatée par le context caching : −33 % de coûts d’inférence.', zone: 'val', x: 14, z: 28 },
	{ name: 'Prompt injection', lesson: 'Bloquée : les sorties du modèle sont validées comme des saisies utilisateur.', zone: 'nexus', x: -20, z: NEXUS_Z - 30 },
	{ name: 'Timeout', lesson: 'Évité par le routage hybride : un LLM n’est appelé qu’en repli.', zone: 'nexus', x: 22, z: NEXUS_Z - 34 },
	{ name: 'Coût explosif', lesson: 'Maîtrisé grâce au suivi FinOps Langfuse et au bon modèle pour chaque tâche.', zone: 'nexus', x: 30, z: NEXUS_Z - 100 },
	{ name: 'Agent perdu', lesson: 'Retrouvé : chaque agent a son graphe LangGraph, ses outils et ses garde-fous.', zone: 'nexus', x: -30, z: NEXUS_Z - 105 },
];

export const mobs: Mob[] = SPECS.map((s, i) => ({
	id: i,
	name: s.name,
	lesson: s.lesson,
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
