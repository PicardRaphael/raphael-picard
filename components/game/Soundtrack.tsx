'use client';

import { useEffect } from 'react';

import { game, useGame } from '@/lib/game-store';
import { music } from '@/lib/music';

/** Bridges the game store to the soundtrack (recorded playlists per zone) and sound effects. */
export function Soundtrack() {
	const sound = useGame((s) => s.sound);
	const zone = useGame((s) => s.zone);
	const toast = useGame((s) => s.toast);
	const ticker = useGame((s) => s.ticker);

	useEffect(() => {
		if (sound) void music.start();
		else music.stop();
	}, [sound]);

	useEffect(() => {
		// really listened to: 30 s of music in the realm, in the game (not under the start screen)
		if (!sound) return;
		const t = setTimeout(() => {
			if (game.get().started && game.get().zone === zone) game.flag(zone === 'val' ? 'music_val' : 'music_nexus');
		}, 30000);
		return () => clearTimeout(t);
	}, [sound, zone]);

	useEffect(() => {
		music.setTheme(zone);
		if (game.get().started) music.sfx('portal');
	}, [zone]);

	useEffect(() => {
		if (toast) music.sfx('quest');
	}, [toast]);
	// each step of a quest chimes too
	useEffect(() => {
		if (ticker) music.sfx('quest');
	}, [ticker]);

	useEffect(() => {
		const hit = () => music.sfx('hit');
		window.addEventListener('player:hit', hit);
		return () => window.removeEventListener('player:hit', hit);
	}, []);

	return null;
}
