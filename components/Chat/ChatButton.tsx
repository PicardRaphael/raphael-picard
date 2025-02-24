'use client';

import { useChat } from '@ai-sdk/react';
import { ChatBubbleOvalLeftEllipsisIcon, PaperAirplaneIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import ChatBubble from './ChatBubble';
import LoadingBubble from './LoadingBubble';
export function ChatButton() {
	const { append, isLoading, messages, input, handleInputChange, handleSubmit } = useChat();
	const [isOpen, setIsOpen] = useState(false);
	const noMessages = !messages || messages.length === 0;
	const heureActuelle = new Date().toLocaleTimeString('fr-FR', {
		hour: '2-digit',
		minute: '2-digit',
		hour12: false,
	});
	const modalRef = useRef<HTMLDivElement>(null);

	const toggleModal = () => {
		setIsOpen(!isOpen);
	};
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
				setIsOpen(false);
			}
		};

		document.addEventListener('mousedown', handleClickOutside);
		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, [modalRef]);
	console.log(messages.length);
	return (
		<>
			<button
				onClick={toggleModal}
				className="btn-gradient fixed right-4 bottom-4 z-19 cursor-crosshair rounded-full p-3 shadow-lg focus:outline-none"
			>
				<ChatBubbleOvalLeftEllipsisIcon className="h-6 w-6" />
			</button>

			{isOpen && (
				<motion.div
					ref={modalRef}
					initial={{ opacity: 0, scale: 0.9 }}
					animate={{ opacity: 1, scale: 1 }}
					exit={{ opacity: 0, scale: 0.9 }}
					className="chatbot bord fixed bottom-20 z-30 h-122 w-full rounded-lg shadow-lg md:w-200 lg:right-5"
				>
					<div className="h-120 w-full rounded-lg bg-gradient-to-r from-(--color-secondary-default) to-(--color-primary-default) p-1">
						<div className="bg-black-600 flex h-full w-full flex-col rounded-lg p-2">
							<div className="mb-2 flex items-center justify-between">
								<h2 className="text-lg font-bold text-gray-300">Chat avec mon IA</h2>
								<button onClick={toggleModal} className="btn-gradient rounded-full p-1" title="Fermer">
									<XCircleIcon className="h-6 w-6 text-white" />
								</button>
							</div>
							<section className="flex-grow overflow-y-auto">
								<div className="space-y-4">
									{noMessages ? (
										<>
											<ChatBubble
												message="Salut ! 👋 Je suis l'assistant IA de Raphaël Picard. Je suis là pour répondre à toutes tes questions sur lui, son parcours, ses compétences, ses projets et son expertise en développement web, full-stack et automatisation avec l'IA. Besoin d'infos sur son expérience ou comment le contacter ? Pose-moi ta question ! 🚀"
												sender="Krypto"
												timestamp={heureActuelle}
												avatar="https://cdn.sanity.io/images/awd9ns3x/production/63d9b0602eb31c85e2fd6a32c315a55538a215b5-148x164.svg"
											/>
										</>
									) : (
										<>
											{messages.map((message, index) => (
												<ChatBubble
													key={`message-${index}`}
													message={message.content}
													sender={message.role === 'user' ? 'Vous' : 'Krypto'}
													timestamp={heureActuelle}
													avatar={
														message.role === 'user'
															? 'https://cdn.sanity.io/images/awd9ns3x/production/7f397da8a7278e6d19fe562d23416da6bcc6e433-512x512.png'
															: 'https://cdn.sanity.io/images/awd9ns3x/production/63d9b0602eb31c85e2fd6a32c315a55538a215b5-148x164.svg'
													}
													isOutgoing={message.role === 'user' ? true : false}
												/>
											))}
											{isLoading && <LoadingBubble />}
										</>
									)}
								</div>
							</section>
							<form onSubmit={handleSubmit} className="w-full">
								<div className="flex items-center border-t border-gray-700 p-2">
									<input
										disabled={messages.length > 7}
										type="text"
										value={input}
										onChange={handleInputChange}
										placeholder="Posez-moi une question..."
										className="mr-2 flex-grow rounded-lg bg-gray-800 p-2 text-white focus:outline-none"
									/>
									<button disabled={messages.length > 7} className="rounded-full p-2 text-white hover:bg-gray-700">
										<PaperAirplaneIcon className="h-6 w-6 transform" />
									</button>
								</div>
							</form>
						</div>
					</div>
				</motion.div>
			)}
		</>
	);
}
