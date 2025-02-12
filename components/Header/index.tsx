'use client';
import navigationConfig from '@/utils/nav-config';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Cv from '../CV';
import Animate from '../Framer/Animate';
import Logo from '../Logo';
import NavHeader from '../Nav/NavHeader';
import NavHeaderMobile from '../Nav/NavMobile';

const Header = () => {
	const pathname = usePathname();

	// Find the current page label based on the pathname
	const currentPage = navigationConfig.find((navItem) => navItem.url === pathname);
	const currentLabel = currentPage ? currentPage.label : '';

	return (
		<header className="bg-black-700 sticky top-0 z-10 h-15 w-full lg:block lg:h-16">
			<div className="mx-auto max-w-6xl px-4 lg:px-6">
				<div className="flex items-center justify-between">
					<div className="flex w-1/3 items-center py-1 lg:w-3/12 lg:py-2">
						<Animate animate={{ xInitial: -150, xAnimate: 0, opacityInitial: 0 }} className="flex justify-start lg:w-2/12">
							<Link href="/">
								<Logo />
							</Link>
						</Animate>
					</div>
					<Animate animate={{ yInitial: -150, yAnimate: 0, opacityInitial: 0 }} className="hidden w-0 lg:block lg:w-7/12">
						<NavHeader />
					</Animate>
					<div className="flex w-1/3 justify-center lg:hidden">
						<h3 className="gradient text-sm font-bold">{currentLabel}</h3>
					</div>
					<Animate animate={{ xInitial: 150, xAnimate: 0, opacityInitial: 0 }} className="flex w-1/3 justify-end lg:w-2/12">
						<div className="hidden lg:block">
							<Cv />
						</div>
						<div className="flex lg:hidden">
							<NavHeaderMobile />
						</div>
					</Animate>
				</div>
			</div>
		</header>
	);
};

export default Header;
