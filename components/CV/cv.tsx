import { DocumentArrowDownIcon } from '@heroicons/react/24/outline';

const Cv = () => {
  return (
    <a
      className='flex items-center justify-center p-2 font-bold rounded-sm btn-gradient'
      href='https://cdn.sanity.io/files/emwliyjg/production/c6197a480097314f84c3d0d05d3f4f9d4e5cb6dc.pdf'
      download
      target='_blank'
      rel='noreferrer'
    >
      <DocumentArrowDownIcon className='w-6 h-6 mr-1' />
      CV
    </a>
  );
};

export default Cv;
