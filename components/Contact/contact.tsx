import {
  EnvelopeIcon,
  MapPinIcon,
  PhoneIcon,
} from '@heroicons/react/24/outline';

import FormContact from './formContact';

const Contact = () => {
  return (
    <div className='section'>
      <div className='flex flex-col items-center'>
        <h2 className='mb-5 text-2xl font-bold gradient md:text-4xl'>
          Contacte-moi
        </h2>

        <h3 className='text-xl font-bold text-white'>Travaillons ensemble !</h3>
        <p className='py-2 text-lg text-center text-gray-300'>
          Envie de me présenter un projet, avoir un conseil, ou tout simplement
          échanger ?
        </p>

        <div className='my-5 space-y-5'>
          <div className='flex items-center justify-center space-x-5'>
            <PhoneIcon className='text-primary animate-pulse h-7 w-7' />
            <p>
              <a href='tel:0650931573'>+33650931573</a>
            </p>
          </div>
          <div className='flex items-center justify-center space-x-5'>
            <EnvelopeIcon className='text-secondary animate-pulse h-7 w-7' />
            <p>
              <a href='mailto: raphaelpicard@outlook.fr'>
                raphaelpicard@outlook.fr
              </a>
            </p>
          </div>
          <div className='flex items-center justify-center space-x-5 text-primary'>
            <MapPinIcon className='animate-pulse h-7 w-7' />
            <p>Lyon, France & Remote</p>
          </div>
        </div>

        <FormContact />
      </div>
    </div>
  );
};
export default Contact;
