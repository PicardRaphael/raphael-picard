/* eslint-disable no-underscore-dangle */
import { BeakerIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import { Link } from 'react-scroll';

import { urlFor } from '../../sanity';
import type { Footer as FooterType } from '../../types/footer';
import { AppConfig } from '../../utils/appConfig';
import { NavMainData } from '../../utils/navConfig';
import Logo from '../Logo/logo';

type FooterProps = {
  data: FooterType;
};
const Footer = ({ data }: FooterProps) => (
  <footer className='w-full text-sm text-center text-gray-300 border-t border-gray-600'>
    <div className='max-w-6xl px-4 mx-auto sm:px-6'>
      <div className='grid w-full grid-cols-3 gap-4 py-10 lg:flex'>
        <div className='col-span-3 text-left md:w-full lg:w-2/5'>
          <Logo />
          <h3 className='text-lg font-bold text-white uppercase'>
            {data.name}
          </h3>
          <h4 className='text-sm text-white uppercase'>{AppConfig.job}</h4>
          <p className='mt-2 text-xs text-white'>
            {data.address}
            <br /> {data.city} <br />{' '}
            <strong className='text-white uppercase'>{data.country}</strong>
          </p>
          <p className='pb-2 mb-2 text-xs border-b border-gray-600'>
            Portable : {data.phoneNumber}
          </p>
          <p id='copyright' className='pl-[2px] text-xs text-gray-300'>
            © {new Date().getFullYear()} developed with{' '}
            <span role='img' aria-label='Love' className='text-red-500'>
              ♥
            </span>{' '}
            by {AppConfig.site_name}
          </p>
          <p id='stack' className='flex items-center text-xs text-gray-400'>
            <BeakerIcon className='w-3 h-3 mr-1' />
            Stack utilisé : Next.js . React.js . Tailwind
          </p>
        </div>
        <div className='hidden col-span-3 md:block md:col-span-1 lg:w-2/5'>
          <h4 className='mb-3 text-base font-bold text-white'>Navigation</h4>
          <ul className='flex flex-col items-center justify-center gap-3'>
            {NavMainData.map((item) => (
              <li
                key={item.key}
                className='flex items-center font-bold text-gray-300 capitalize cursor-pointer hover:text-white'
              >
                <Link
                  smooth
                  spy
                  to={item.url}
                  offest={85}
                  href={`#${item.url}`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className='hidden col-span-3 text-center md:block md:col-span-1 lg:w-1/5'>
          <h4 className='mb-3 text-base font-bold text-white'>Réseaux</h4>
          <div className='flex flex-col gap-y-2'>
            {data.socials.map((social) => (
              <a
                key={social._id}
                className='icon-animate'
                target='_blank'
                href={social.url}
                rel='noreferrer'
                title='Linkedin'
              >
                <Image
                  src={urlFor(social.image).url()}
                  width={35}
                  height={35}
                  alt={social.title}
                />
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
