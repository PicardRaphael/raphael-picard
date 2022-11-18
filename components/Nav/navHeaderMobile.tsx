import Link from 'next/link';
import { useState } from 'react';

import { NavMainData } from '../../utils/navConfig';
import Cv from '../CV/cv';

const NavHeaderMobile = () => {
  const [isNavOpen, setIsNavOpen] = useState(false);

  return (
    <nav>
      <div>
        <div
          className="animate-pulse space-y-2"
          onClick={() => setIsNavOpen((prev) => !prev)}
        >
          <span className="btn-gradient block h-0.5 w-8 animate-pulse"></span>
          <span className="btn-gradient block h-0.5 w-8 animate-pulse"></span>
          <span className="btn-gradient block h-0.5 w-8 animate-pulse"></span>
        </div>
        <div
          className={`
          absolute
          top-0 right-0  flex
          flex-col
          items-center justify-evenly bg-black-500
          transition-all duration-300
          ${
            isNavOpen
              ? 'z-10 h-[100vh] w-full opacity-100'
              : 'h-0 w-0 overflow-hidden opacity-0'
          }`}
        >
          <div
            className="absolute top-0 right-0 animate-pulse p-8"
            onClick={() => setIsNavOpen(false)}
          >
            <svg
              className="btn-gradient h-9 w-9 rounded-large"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </div>
          <ul className="flex min-h-[250px] flex-col items-center justify-between">
            {NavMainData.map((item) => (
              <li
                onClick={() => setIsNavOpen(false)}
                key={item.key}
                className="border-gradient my-8 border-b uppercase text-gray-300"
              >
                <Link href={item.url}>
                  <a>{item.label}</a>
                </Link>
              </li>
            ))}
          </ul>
          <Cv />
        </div>
      </div>
    </nav>
  );
};

export default NavHeaderMobile;
