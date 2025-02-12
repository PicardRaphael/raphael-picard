import NavItem from '@/components/Header/NavItem';
import navigationConfig from '@/utils/nav-config';

const NavHeader = () => {
	return (
		<nav className="relative">
			<ul className="relative flex justify-evenly gap-6">
				{navigationConfig.map((item) => (
					<NavItem item={item} key={item.key} />
				))}
			</ul>
		</nav>
	);
};

export default NavHeader;
