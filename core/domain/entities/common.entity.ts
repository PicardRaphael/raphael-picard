export interface ImageEntity {
	url: string;
	alt: string;
}

// Type pour les blocks de contenu (utilisé dans hero.together, experiences.summary, etc.)
export interface BlockContentText {
	children?: Array<{
		marks?: Array<string>;
		text?: string;
		_type: 'span';
		_key: string;
	}>;
	style?: 'blockquote' | 'div' | 'h1' | 'h2' | 'h3' | 'h4' | 'normal' | 'span';
	listItem?: 'bullet';
	markDefs?: Array<{
		href?: string;
		_type: 'link';
		_key: string;
	}>;
	level?: number;
	_type: 'block';
	_key: string;
}
export interface BlockContentItem {
	children?: Array<{
		marks?: Array<string>;
		text?: string;
		_type: 'span';
		_key: string;
	}>;
	style?: 'blockquote' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'normal';
	listItem?: 'bullet' | 'number';
	markDefs?: Array<{
		href?: string;
		_type: 'link';
		_key: string;
	}>;
	level?: number;
	_type: 'block';
	_key: string;
}
export interface BlockContentImage {
	_type: 'image';
	_key: string;
	asset?: {
		_ref: string;
		_type: 'reference';
	};
	alt?: string;
}

export type BlockContent = Array<BlockContentText | BlockContentImage>;
