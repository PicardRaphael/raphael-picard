import ClientLayout from '@/components/ClientLayout';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import { SanityLive } from '@/sanity/lib/live';
import { homeMetadata } from '@/utils/metadata/home-metadata';
import '../assets/styles/globals.css';

export const metadata = homeMetadata;
export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="fr" className="scroll-smooth">
			<body className="flex min-h-screen flex-col">
				<Header />
				<main className="flex-grow antialiased">
					<ClientLayout>{children}</ClientLayout>
				</main>
				<Footer />
				<SanityLive />
			</body>
		</html>
	);
}
