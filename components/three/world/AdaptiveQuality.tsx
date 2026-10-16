'use client';

import { PerformanceMonitor } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import { useEffect, useState } from 'react';

import { useGame } from '@/lib/game-store';

/**
 * Resolution that follows the frame rate: below ~50 fps the canvas renders fewer pixels (down to 60 % of the
 * screen's resolution, never under 0.75 device pixel), and climbs back when frames are fast again. Only the
 * resolution moves: shadows and post-processing stay as they are (switching them recompiles every shader).
 * The store's `quality: 'low'` keeps the lower half of the range. Measured once the val is playable, never
 * during the loading and shader compilation.
 */
export function AdaptiveQuality({ cap }: { cap: number }) {
	const ready = useGame((s) => s.ready);
	const low = useGame((s) => s.quality === 'low');
	const setDpr = useThree((s) => s.setDpr);
	const [factor, setFactor] = useState(1);
	useEffect(() => {
		const base = Math.min(window.devicePixelRatio || 1, cap);
		const k = Math.min(factor, low ? 0.5 : 1);
		setDpr(Math.max(0.75, base * (0.6 + 0.4 * k)));
	}, [factor, low, cap, setDpr]);
	if (!ready) return null;
	return (
		<PerformanceMonitor
			factor={1}
			step={0.25}
			// a few changes at most (each one reallocates the render targets), then settle on a safe middle
			flipflops={4}
			onFallback={() => setFactor(0.5)}
			onChange={({ factor: f }) => setFactor(Math.round(f * 4) / 4)}
		/>
	);
}
