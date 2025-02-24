import { openai } from '@ai-sdk/openai';
import { DataAPIClient } from '@datastax/astra-db-ts';
import { embed, streamText } from 'ai';

const client = new DataAPIClient(process.env.ASTRA_DB_APPLICATION_TOKEN);
const db = client.db(process.env.ASTRA_DB_API_ENDPOINT as string, { namespace: process.env.ASTRA_DB_NAMESPACE });

export async function POST(req: Request) {
	try {
		const { messages } = await req.json();
		const latestMessage = messages[messages.length - 1]?.content;
		let docContext = '';

		const { embedding } = await embed({
			model: openai.embedding('text-embedding-3-small'),
			value: latestMessage,
		});
		try {
			const collection = await db.collection(process.env.ASTRA_DB_COLLECTION as string);
			const cursor = collection.find(
				{},
				{
					sort: {
						$vector: embedding,
					},
					limit: 10,
				},
			);
			const documents = await cursor.toArray();
			const docmap = documents?.map((doc) => doc.text);
			docContext = JSON.stringify(docmap);
		} catch (error) {
			console.error('Error quering db...');
			docContext = '';
		}

		const template = {
			role: 'system',
			content: `You are an AI assistant who knows everything about Raphaël PICARD. Use the context below to augment your knowledge about Raphaël PICARD. The context will provide you with the most recent data from raphaelpicard.com, LinkedIn, and other sources. If the context doesn't include the information you need, answer based on your existing knowledge without mentioning the source of your information or what the context does or doesn't include. Format responses without images and use the language that the user employs. You should only answer questions about Raphaël PICARD. If asked about other topics, respond: "Désolé, mais je ne peux répondre qu'aux questions sur Raphaël PICARD." You may provide links but not images. Ensure that links are formatted in Markdown as URL no link text.If (${messages.length} > 7), then do not answer any further questions and instead respond with: "Pour de plus amples informations sur Raphaël, veuillez le contacter au 06 50 93 15 73.".
      -----------------
      START CONTEXT
      ${docContext}
      END CONTEXT
      -----------------
      QUESTION: ${latestMessage}
      -----------------
      `,
		};
		const result = await streamText({
			model: openai('gpt-4o'),
			messages: [template, ...messages],
		});

		return result.toDataStreamResponse();
	} catch (error) {
		console.error('Error ');
	}
}
