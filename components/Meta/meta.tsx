import Head from 'next/head';
import { NextSeo } from 'next-seo';

import { AppConfig } from '../../utils/appConfig';

export type MetaProps = {
  title: string;
  description: string;
  canonical?: string;
};

const Meta = ({ title, description }: MetaProps) => (
  <>
    <Head>
      <meta charSet='UTF-8' key='charset' />
      <meta
        name='viewport'
        content='width=device-width,initial-scale=1'
        key='viewport'
      />
      <meta name='author' content='Raphaël PICARD' />
      <link rel='icon' type='image/svg' href='/assets/logo/logo-sombre.svg' />
    </Head>
    <NextSeo
      title={title}
      titleTemplate={title}
      description={description}
      defaultTitle={title}
      canonical='https://raphaelpicard.com/'
      openGraph={{
        title: AppConfig.title,
        description: AppConfig.description,
        url: 'https://raphaelpicard.com/',
        locale: AppConfig.locale,
        siteName: AppConfig.site_name,
        type: 'website',
        profile: {
          firstName: 'Raphaël',
          lastName: 'Picard',
          username: 'RaphaelPicard',
          gender: 'male',
        },
        images: [
          {
            url: 'https://zupimages.net/up/22/47/z4cz.png',
            alt: 'Raphaël PICARD',
            width: 1200,
            height: 630,
          },
          {
            url: 'https://zupimages.net/up/22/47/z4cz.png',
            alt: 'Raphaël PICARD',
            width: 1200,
            height: 630,
          },
          {
            url: 'https://zupimages.net/up/22/47/z4cz.png',
            alt: 'Raphaël PICARD',
            width: 1200,
            height: 630,
          },
        ],
      }}
      facebook={{
        appId: '1234567890',
      }}
      twitter={{
        handle: '@RPRaphaelPicard',
        site: '@RPRaphaelPicard',
        cardType: 'summary_large_image',
      }}
    />
  </>
);

export default Meta;
