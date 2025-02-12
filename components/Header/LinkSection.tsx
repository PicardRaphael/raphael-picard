import { NavType } from '@/utils/nav-config';
import { HomeIcon } from '@sanity/icons';
import Link from 'next/link';

const Icons = {
	home: <HomeIcon className="h-6 w-6" />,
};

type IconKey = keyof typeof Icons;

const LinkSection = ({ item }: { item: NavType }) => {
	return (
		<li className="relative flex cursor-pointer items-center font-bold capitalize hover:text-white">
			<Link href={`${item.url}`} className="text-gray-300 transition-colors duration-300 hover:text-white">
				{item.icon && <span>{Icons[item.icon as IconKey]}</span>}
				{item.label}
			</Link>
		</li>
	);
};

export default LinkSection;
