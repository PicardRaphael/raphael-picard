const SeparateTextAndEmojis = ({ text }: { text: string }) => {
	const emojiRegex = /(\p{Emoji_Presentation}|\p{Emoji}\uFE0F)/gu;

	return text.split(emojiRegex).map((part, index) =>
		emojiRegex.test(part) ? (
			<span key={index} className="emoji">
				{part}
			</span>
		) : (
			part
		),
	);
};
export default SeparateTextAndEmojis;
