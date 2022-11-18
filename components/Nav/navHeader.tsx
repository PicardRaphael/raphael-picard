import { HomeIcon } from '@heroicons/react/24/outline';
import { Link as LinkScroll } from 'react-scroll';

import { NavMainData } from '../../utils/navConfig';

const NavHeader = () => {
  const Icons = {
    home: <HomeIcon className='w-6 h-6' />,
  };
  return (
    <nav>
      <ul className='flex gap-3 justify-evenly'>
        {NavMainData.map((item) => (
          <li
            key={item.key}
            className='flex items-center font-bold text-gray-300 capitalize cursor-pointer hover:text-white'
          >
            <LinkScroll
              activeClass='link-active'
              smooth
              spy
              to={item.url}
              offest={85}
              href={`#${item.url}`}
            >
              {Icons[item.icon] || item.label}
            </LinkScroll>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default NavHeader;
