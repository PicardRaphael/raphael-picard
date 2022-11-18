import { motion } from 'framer-motion';
import { Link } from 'react-scroll';

import Cv from '../CV/cv';
import Logo from '../Logo/logo';
import NavHeader from '../Nav/navHeader';
import NavHeaderMobile from '../Nav/navHeaderMobile';

const Header = () => (
  <header className="sticky top-0 z-50 h-20 w-full bg-black-500/[.96]">
    <div className="mx-auto max-w-6xl px-4 md:px-6">
      <div className="flex h-20 items-center">
        <motion.div
          initial={{
            x: -500,
            opacity: 0,
            scale: 0.5,
          }}
          animate={{
            x: 0,
            opacity: 1,
            scale: 1,
          }}
          transition={{ duration: 0.5, type: 'tween' }}
          className="flex w-6/12 items-center py-2 md:w-3/12 cursor-pointer"
        >
          <Link smooth spy to="hero" offest={85}>
            <Logo />
          </Link>
        </motion.div>
        <motion.div
          initial={{
            y: -500,
            opacity: 0,
            scale: 0.5,
          }}
          animate={{
            y: 0,
            opacity: 1,
            scale: 1,
          }}
          transition={{ duration: 0.5, type: 'keyframes' }}
          className="hidden w-0 md:block md:w-7/12"
        >
          <NavHeader />
        </motion.div>
        <motion.div
          initial={{
            x: 500,
            opacity: 0,
            scale: 0.5,
          }}
          animate={{
            x: 0,
            opacity: 1,
            scale: 1,
          }}
          transition={{ duration: 0.5, type: 'tween' }}
          className="flex w-6/12 justify-end md:w-2/12"
        >
          <div className="hidden md:block">
            <Cv />
          </div>
          <div className="flex md:hidden">
            <NavHeaderMobile />
          </div>
        </motion.div>
      </div>
    </div>
  </header>
);

export default Header;
