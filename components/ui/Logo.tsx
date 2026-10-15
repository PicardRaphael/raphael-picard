/** The "Raphy" R mark — gradient body and two white eyes, as in the brand SVG. */
export function Logo({ className = 'h-8 w-8' }: { className?: string }) {
	return (
		// eslint-disable-next-line @next/next/no-img-element
		<img src="/logo/logo-sombre.svg" alt="" width={148} height={164} className={className} />
	);
}
