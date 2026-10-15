'use server';

import { z } from 'zod';

const schema = z.object({
	name: z.string().trim().min(2, 'Votre nom doit contenir au moins 2 caractères.'),
	email: z.email('Adresse e-mail invalide.'),
	subject: z.string().trim().min(3, 'Le sujet est trop court.'),
	message: z.string().trim().min(10, 'Le message doit contenir au moins 10 caractères.'),
	// honeypot: humans never fill it
	company: z.string().max(0).optional(),
});

export type ContactState = {
	ok?: boolean;
	message?: string;
	errors?: Partial<Record<'name' | 'email' | 'subject' | 'message' | 'company', string[]>>;
	values?: Record<string, string>;
};

export async function sendContact(_prev: ContactState, formData: FormData): Promise<ContactState> {
	const raw = Object.fromEntries(Array.from(formData.entries()).map(([k, v]) => [k, String(v)]));
	const parsed = schema.safeParse(raw);
	if (!parsed.success) {
		return { errors: z.flattenError(parsed.error).fieldErrors, values: raw };
	}
	const key = process.env.WEB3_FORMS_API_KEY;
	if (!key) {
		return { message: "Le formulaire n'est pas encore configuré : écrivez-moi directement par e-mail.", values: raw };
	}
	try {
		const { name, email, subject, message } = parsed.data;
		const res = await fetch('https://api.web3forms.com/submit', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
			body: JSON.stringify({ name, email, subject, message, access_key: key, from_name: 'raphaelpicard.com' }),
		});
		const json = (await res.json()) as { success?: boolean };
		if (json.success) return { ok: true, message: 'Message reçu. Je vous réponds sous 48 h.' };
	} catch {
		// fall through to the generic error
	}
	return { message: "Le message n'est pas parti. Réessayez, ou écrivez-moi par e-mail.", values: raw };
}
