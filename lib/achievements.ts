import { mobs } from './mobs';
import type { QuestStatus } from './quests';
import { LANDMARKS } from './world';

type State = { quests: Record<string, QuestStatus>; visited: string[]; kills: number; flags: string[]; jumps: number; sound: boolean; zone: string };

export type Achievement = { id: string; title: string; text: string; progress: (s: State) => [number, number] };

const places = LANDMARKS.filter((l) => !['portal-back'].includes(l.id));

export const ACHIEVEMENTS: Achievement[] = [
	{ id: 'adventure', title: 'En route pour l’aventure !', text: 'Quitter la clairière de départ.', progress: (s) => [s.flags.includes('left_spawn') ? 1 : 0, 1] },
	{ id: 'traveler', title: 'Grand voyageur', text: 'Visiter tous les lieux du monde.', progress: (s) => [places.filter((l) => s.visited.includes(l.id)).length, places.length] },
	{ id: 'origins', title: 'Artisan du code', text: 'Terminer « Les origines du développeur ».', progress: (s) => [s.quests.origines === 'done' ? 1 : 0, 1] },
	{ id: 'career', title: 'Compagnon du val', text: 'Terminer « Le parcours de l’artisan ».', progress: (s) => [s.quests.parcours === 'done' ? 1 : 0, 1] },
	{ id: 'portal', title: 'Passe-portail', text: 'Traverser la grande porte vers le Nexus.', progress: (s) => [s.flags.includes('nexus') ? 1 : 0, 1] },
	{ id: 'operator', title: 'Opérateur du Nexus', text: 'Terminer « Les agents en production ».', progress: (s) => [s.quests.production === 'done' ? 1 : 0, 1] },
	{ id: 'nexus', title: 'Ingénieur du Nexus', text: 'Terminer « L’ère des agents ».', progress: (s) => [s.quests.agents === 'done' ? 1 : 0, 1] },
	{ id: 'tracker', title: 'Traqueur de bugs', text: 'Terminer « La chasse aux bugs ».', progress: (s) => [s.quests.chasse === 'done' ? 1 : 0, 1] },
	{ id: 'guardian', title: 'Gardien du Nexus', text: 'Terminer « Purge du Nexus ».', progress: (s) => [s.quests.purge === 'done' ? 1 : 0, 1] },
	{ id: 'hunter', title: 'Chasseur de bugs', text: 'Corriger tous les bugs du monde.', progress: (s) => [Math.min(s.kills, mobs.length), mobs.length] },
	{ id: 'jumper', title: 'Saut de foi', text: 'Sauter 20 fois.', progress: (s) => [Math.min(s.jumps, 20), 20] },
	{ id: 'map', title: 'Cartographe', text: 'Ouvrir la carte du monde.', progress: (s) => [s.flags.includes('map') ? 1 : 0, 1] },
	{ id: 'sound', title: 'Mélomane', text: 'Écouter la musique des deux mondes.', progress: (s) => [(s.flags.includes('music_val') ? 1 : 0) + (s.flags.includes('music_nexus') ? 1 : 0), 2] },
];

export function unlocked(s: State) {
	return ACHIEVEMENTS.filter((a) => {
		const [n, max] = a.progress(s);
		return n >= max;
	}).map((a) => a.id);
}
