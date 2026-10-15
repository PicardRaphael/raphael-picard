const paths: Record<string, string> = {
	agents: 'M12 3v3m0 12v3M3 12h3m12 0h3M6 6l2 2m8 8 2 2M6 18l2-2m8-8 2-2M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z',
	rag: 'M4 6c0-1.7 3.6-3 8-3s8 1.3 8 3-3.6 3-8 3-8-1.3-8-3Zm0 0v6c0 1.7 3.6 3 8 3m-8-3v6c0 1.7 3.6 3 8 3m4-6.5 2 2 4-4',
	mcp: 'M8 3v4m8-4v4M6 7h12v4a6 6 0 0 1-12 0V7Zm6 10v4',
	'claude-code': 'm8 9-4 3 4 3m8-6 4 3-4 3M14 5l-4 14',
	llmops: 'M3 20h18M6 16l4-5 3 3 5-7m0 0h-4m4 0v4',
	backend: 'M4 5h16v5H4zM4 14h16v5H4zM8 7.5h.01M8 16.5h.01',
	securite: 'M12 3 5 6v5c0 4.5 3 8.3 7 10 4-1.7 7-5.5 7-10V6l-7-3Zm-3 9 2 2 4-4',
	lead: 'M12 3l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.4 6.8 19.1l1-5.8L3.5 9.2l5.9-.9L12 3Z',
};

export function Icon({ name, className = 'h-6 w-6' }: { name: string; className?: string }) {
	return (
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
			<path d={paths[name] ?? paths.agents} />
		</svg>
	);
}
