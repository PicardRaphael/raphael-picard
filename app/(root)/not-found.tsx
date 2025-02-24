'use client';

import Logo from '@/components/Logo';
import Link from 'next/link';

const NotFoundPage = () => {
	return (
		<div className="bg-black-500 flex min-h-screen flex-col items-center justify-center">
			<h2 className="text-2xl font-black text-blue-100 lg:text-5xl">404 - Page non trouvée</h2>
			<div className="my-16">
				<Logo height={90} width={90} />
			</div>
			<Link href="/" className="gradient text-center text-3xl font-bold uppercase">
				Page d'accueil
			</Link>
		</div>
	);
};

export default NotFoundPage;
