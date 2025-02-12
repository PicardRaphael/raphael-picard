import { Dispatch, forwardRef, SetStateAction, useEffect, useRef } from 'react';
import { Position } from '../Skills';

interface TabProps {
	children: string;
	setPosition: Dispatch<SetStateAction<Position>>;
	setTabActive: Dispatch<SetStateAction<string>>;
}

const Tab = forwardRef<HTMLLIElement, TabProps>(({ children, setPosition, setTabActive }, ref) => {
	const localRef = useRef<HTMLLIElement | null>(null);

	useEffect(() => {
		if (typeof ref === 'function') {
			ref(localRef.current);
		} else if (ref && 'current' in ref) {
			ref.current = localRef.current;
		}
	}, [ref]);

	const handleInteraction = () => {
		if (!localRef.current) return;
		const { width } = localRef.current.getBoundingClientRect();
		setPosition({
			left: localRef.current.offsetLeft,
			width,
			opacity: 1,
		});
		setTabActive(children.toLowerCase());
	};

	return (
		<li
			id={children.toLowerCase()}
			ref={localRef}
			onClick={handleInteraction}
			className="relative z-5 block cursor-pointer px-3 py-1 text-xs uppercase lg:px-5 lg:py-2 lg:text-sm"
		>
			{children}
		</li>
	);
});

export default Tab;
