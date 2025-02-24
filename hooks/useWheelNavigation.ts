'use client';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import useWindowScroll from 'react-use/lib/useWindowScroll';

interface NavigationConfig {
	[key: string]: string;
}

const useWheelNavigation = (navigationConfig: NavigationConfig) => {
	const router = useRouter();
	const pathname = usePathname();
	const { y } = useWindowScroll();

	useEffect(() => {
		const handleWheel = (event: WheelEvent) => {
			// Check if the page is scrollable
			const isScrollable = document.documentElement.scrollHeight > window.innerHeight;
			if (isScrollable) return; // Allow normal scrolling if the page is scrollable

			// Check if the event target is inside a scrollable card
			const target = event.target as HTMLElement;
			const isInsideScrollableCard = target.closest('.description-portable-text');
			const isInsideScrollableChat = target.closest('.chatbot');

			if (isInsideScrollableCard || isInsideScrollableChat) return; // Do not navigate if scrolling inside a card

			const isScrollingUp = event.deltaY < 0;
			const currentPath = pathname;

			if (isScrollingUp) {
				const nextPath = navigationConfig[currentPath];
				if (nextPath) {
					router.push(nextPath);
				}
			} else {
				const prevPaths = Object.entries(navigationConfig)
					.filter(([_, path]) => path === currentPath)
					.map(([key]) => key);
				const prevPath = prevPaths.find((path) => path !== currentPath);
				if (prevPath) {
					router.push(prevPath);
				}
			}
		};

		window.addEventListener('wheel', handleWheel, { passive: false });
		return () => window.removeEventListener('wheel', handleWheel);
	}, [navigationConfig, pathname, router, y]);
};

export default useWheelNavigation;
