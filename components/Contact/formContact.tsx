import type { FormEvent } from 'react';

const FormContact = () => {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.target as HTMLFormElement);
    const data = Object.fromEntries(formData);

    window.location.href = `mailto:raphaelpicard@outlook.fr?subject=${data.subject}&body=Bonjour, je m'appelle ${data.name}. ${data.message} (${data.email})`;
  };
  return (
    <form
      onSubmit={(evt) => handleSubmit(evt)}
      className='flex flex-col w-full mx-auto mt-3 space-y-3 md:w-fit'
    >
      <div className='flex flex-col space-y-3 md:flex-row md:space-x-2 md:space-y-0'>
        <div className='flex flex-col'>
          <label className='text-secondary-light' htmlFor='name'>
            Prénom
          </label>
          <input
            name='name'
            id='name'
            type='text'
            className='contactInput placeholder:text-sm'
            placeholder='Quel est ton prénom ?'
          />
        </div>
        <div className='flex flex-col'>
          <label className='text-secondary-light ' htmlFor='subject'>
            Sujet
          </label>
          <input
            name='subject'
            id='subject'
            type='text'
            className='contactInput placeholder:text-sm'
            placeholder='Que puis-je faire pour toi ?'
          />
        </div>
      </div>
      <div className='flex flex-col'>
        <label className='text-secondary-light ' htmlFor='email'>
          Email
        </label>
        <input
          name='email'
          id='email'
          type='email'
          className='contactInput placeholder:text-sm'
          placeholder='Sur quelle adresse dois-je répondre ?'
        />
      </div>
      <div className='flex flex-col'>
        <label className='text-secondary-light ' htmlFor='message'>
          Message
        </label>
        <textarea
          name='message'
          id='message'
          className='contactInput min-h-[50%] placeholder:text-sm'
          placeholder='Entre ton message'
        />
      </div>

      <button
        type='submit'
        className='py-2 font-bold rounded-sm text-secondary-light btn-gradient'
      >
        Envoyer
      </button>
    </form>
  );
};
export default FormContact;
