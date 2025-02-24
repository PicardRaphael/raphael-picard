'use server';
import { z } from 'zod';

const formSchema = z.object({
	name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
	subject: z.string().min(3, 'Le sujet est trop court'),
	email: z.string().email('Adresse email invalide'),
	message: z.string().min(10, 'Le message doit contenir au moins 10 caractères'),
});

type FormState = {
	errors?: {
		name?: string[];
		subject?: string[];
		email?: string[];
		message?: string[];
		general?: string[];
	};
	values?: {
		name?: string;
		subject?: string;
		email?: string;
		message?: string;
	};
	success?: string;
};

export async function submitForm(prevState: FormState, formData: FormData): Promise<FormState> {
	const rawData = Object.fromEntries(formData) as Record<string, string>;

	const parsedData = formSchema.safeParse(rawData);
	if (!parsedData.success) {
		return {
			errors: parsedData.error.flatten().fieldErrors,
			values: rawData,
		};
	}
	try {
		const response = await fetch('https://api.web3forms.com/submit', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Accept: 'application/json',
			},
			body: JSON.stringify({ ...parsedData.data, access_key: process.env.WEB3_FORMS_API_KEY }),
		});
		const result = await response.json();
		if (result.success) {
			console.log(result);
			return { success: 'Votre message a bien été envoyé !' };
		}
		return { errors: { general: ['Une erreur est survenue, veuillez réessayer plus tard.'] }, values: rawData };
	} catch (e) {
		return { errors: { general: ['Une erreur est survenue, veuillez réessayer plus tard.'] }, values: rawData };
	}
}
