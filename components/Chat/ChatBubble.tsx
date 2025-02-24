import Image from 'next/image';
import type { FC } from 'react';
import Loading from '../Loading';

interface ChatBubbleProps {
	message?: string;
	sender: string;
	timestamp: string;
	avatar: string;
	isOutgoing?: boolean;
	isLoading?: boolean;
}

const ChatBubble: FC<ChatBubbleProps> = ({ message, sender, timestamp, avatar, isOutgoing = false, isLoading = false }) => {
	return (
		<div className={`flex ${isOutgoing ? 'justify-end' : 'justify-start'} mb-4`}>
			<div className={`flex ${isOutgoing ? 'flex-row-reverse' : 'flex-row'} max-w-[70%]`}>
				<div className="mb-2 flex-shrink-0 self-end">
					<Image src={avatar || '/placeholder.svg'} alt={`${sender}'s avatar`} width={40} height={40} className="rounded-full" />
				</div>
				<div className={`mx-2 ${isOutgoing ? 'items-end' : 'items-start'}`}>
					<div className={`mb-1 text-sm font-semibold ${isOutgoing ? 'text-right' : 'text-left'}`}>{sender}</div>
					<div className={`relative rounded-lg p-3 ${isOutgoing ? 'bg-primary-default text-primary-foreground' : 'bg-secondary-default'}`}>
						{isLoading ? (
							<div className="bg-black-500 rounded-lg">
								<Loading />
							</div>
						) : (
							<p className="text-xs md:text-sm">{message}</p>
						)}
						<div
							className={`absolute bottom-0 h-4 w-4 ${isOutgoing ? 'bg-primary-default right-[-8px]' : 'bg-secondary-default left-[-8px]'}`}
							style={{
								clipPath: isOutgoing ? 'polygon(0 0, 0% 100%, 100% 100%)' : 'polygon(100% 0, 100% 100%, 0 100%)',
							}}
						></div>
					</div>
					<div className={`text-muted-foreground mt-1 text-xs ${isOutgoing ? 'text-right' : 'text-left'}`}>{timestamp}</div>
				</div>
			</div>
		</div>
	);
};

export default ChatBubble;
