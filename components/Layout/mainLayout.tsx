import type { ReactNode } from 'react';

import type { Footer as FooterType } from '../../types/footer';
import Footer from '../Footer/footer';
import Header from '../Header/header';
import type { MetaProps } from '../Meta/meta';
import Meta from '../Meta/meta';

type MainLayoutProps = {
  meta: MetaProps;
  children: ReactNode;
  footer: FooterType;
};

const MainLayout = ({ children, meta, footer }: MainLayoutProps) => (
  <>
    <Meta {...meta} />
    <div className='flex flex-col antialiased bg-black-500'>
      <Header />
      <main>{children}</main>
      {footer ? <Footer data={footer} /> : null}
    </div>
  </>
);

export default MainLayout;
