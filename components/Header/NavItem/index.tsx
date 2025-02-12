import { NavType } from '@/utils/nav-config';
import { HomeIcon } from '@sanity/icons';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
const Icons = {
	home: <HomeIcon className="h-6 w-6" />,
};

type IconKey = keyof typeof Icons;

const NavItem = ({ item }: { item: NavType }) => {
	const pathname = usePathname();
	const isActive = pathname === item.url;
	return (
		<li className={`relative flex cursor-pointer items-center font-bold capitalize hover:text-white`}>
			<Link href={`${item.url}`} className={`transition-colors duration-300 hover:text-white ${isActive ? 'link-active' : 'text-gray-300'}`}>
				{item.icon && <span>{Icons[item.icon as IconKey]}</span>}
				{!item.icon && item.label}
			</Link>
		</li>
	);
};

export default NavItem;
