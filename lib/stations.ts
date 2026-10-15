export type StationShape = 'logo' | 'tree' | 'helix' | 'portal' | 'constellation' | 'knot' | 'galaxy';
export type Realm = 'ancien' | 'futur';

export type Station = { id: string; code: string; sector: string; nav: string; shape: StationShape; realm: Realm };

/**
 * The journey, in scroll order. The first realm is a fantasy world (the craft years),
 * the arcane portal is the 2025 pivot, the second realm is the AI era.
 */
export const STATIONS: Station[] = [
	{ id: 'accueil', code: 'I', sector: 'Sanctuaire de Raphy', nav: 'Accueil', shape: 'logo', realm: 'ancien' },
	{ id: 'a-propos', code: 'II', sector: 'Cercle du Manifeste', nav: 'Manifeste', shape: 'tree', realm: 'ancien' },
	{ id: 'parcours', code: 'III', sector: 'Journal de quêtes', nav: 'Parcours', shape: 'helix', realm: 'ancien' },
	{ id: 'portail', code: 'IV', sector: 'Le Portail · 2025', nav: 'Le Portail', shape: 'portal', realm: 'ancien' },
	{ id: 'expertise', code: 'V', sector: 'Constellation des Agents', nav: 'Expertise', shape: 'constellation', realm: 'futur' },
	{ id: 'architecture', code: 'VI', sector: 'Noyau d’orchestration', nav: 'Architecture', shape: 'knot', realm: 'futur' },
	{ id: 'projets', code: 'VII', sector: 'Galerie des Projets', nav: 'Projets', shape: 'galaxy', realm: 'futur' },
	{ id: 'contact', code: 'VIII', sector: 'Balise de contact', nav: 'Contact', shape: 'logo', realm: 'futur' },
];

export const REALMS: Record<Realm, { name: string; era: string }> = {
	ancien: { name: 'Val des Origines', era: 'L’ère du code' },
	futur: { name: 'Le Nexus', era: 'L’ère des agents' },
};

/** Station index of the portal, where the world switches. */
export const PORTAL_INDEX = STATIONS.findIndex((s) => s.id === 'portail');
