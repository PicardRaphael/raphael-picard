'use client';
import { useActionState, useOptimistic } from 'react';
import { submitForm } from '../actions';

const FormContact = () => {
	const [state, formAction] = useActionState(submitForm, {
		errors: {},
		values: {},
		success: '',
	});

	const [optimisticSuccess, setOptimisticSuccess] = useOptimistic(state.success);

	if (state.success) {
		setTimeout(() => setOptimisticSuccess(''), 5000);
	}

	return (
		<form action={formAction} className="my-3 hidden w-full flex-col space-y-3 lg:flex">
			<input type="hidden" name="access_key" value="f36fa929-b2c0-4f1f-abfe-1dd37057fbd3" />
			<div className="flex flex-wrap lg:flex-row lg:gap-4">
				{/* Nom / Prénom */}
				<div className="flex w-full flex-col lg:flex-1">
					<label className="text-secondary-light" htmlFor="name">
						Nom / Prénom
					</label>
					<input
						name="name"
						id="name"
						type="text"
						className="contact-input placeholder:text-sm"
						placeholder="Quel est ton nom / prénom ?"
						defaultValue={state.values?.name}
					/>
					{state.errors?.name && <p className="text-sm text-red-500">{state.errors.name[0]}</p>}
				</div>

				{/* Sujet */}
				<div className="flex w-full flex-col lg:flex-2">
					<label className="text-secondary-light" htmlFor="subject">
						Sujet
					</label>
					<input
						name="subject"
						id="subject"
						type="text"
						className="contact-input placeholder:text-sm"
						placeholder="Que puis-je faire pour toi ?"
						defaultValue={state.values?.subject}
					/>
					{state.errors?.subject && <p className="text-sm text-red-500">{state.errors.subject[0]}</p>}
				</div>
			</div>

			{/* Email */}
			<div className="flex flex-col">
				<label className="text-secondary-light" htmlFor="email">
					Email
				</label>
				<input
					name="email"
					id="email"
					type="email"
					className="contact-input placeholder:text-sm"
					placeholder="Sur quelle adresse dois-je répondre ?"
					defaultValue={state.values?.email}
				/>
				{state.errors?.email && <p className="text-sm text-red-500">{state.errors.email[0]}</p>}
			</div>

			{/* Message */}
			<div className="flex flex-col">
				<label className="text-secondary-light" htmlFor="message">
					Message
				</label>
				<textarea
					name="message"
					id="message"
					className="contact-input min-h-[50%] placeholder:text-sm"
					placeholder="Entre ton message"
					defaultValue={state.values?.message}
				></textarea>
				{state.errors?.message && <p className="text-sm text-red-500">{state.errors.message[0]}</p>}
			</div>

			{/* Bouton Submit */}
			<button type="submit" className="text-secondary-light btn-gradient rounded-sm py-2 font-bold">
				Envoyer
			</button>

			{/* ✅ Message de succès temporaire */}
			{optimisticSuccess && <p className="text-center font-bold text-green-500">{optimisticSuccess}</p>}

			{/* Message d'erreur général */}
			{state.errors?.general && <p className="text-center text-red-500">{state.errors.general[0]}</p>}
		</form>
	);
};

export default FormContact;
