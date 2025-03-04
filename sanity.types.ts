/**
 * ---------------------------------------------------------------------------------
 * This file has been generated by Sanity TypeGen.
 * Command: `sanity typegen generate`
 *
 * Any modifications made directly to this file will be overwritten the next time
 * the TypeScript definitions are generated. Please make changes to the Sanity
 * schema definitions and/or GROQ queries if you need to update these types.
 *
 * For more information on how to use Sanity TypeGen, visit the official documentation:
 * https://www.sanity.io/docs/sanity-typegen
 * ---------------------------------------------------------------------------------
 */

// Source: schema.json
export type SanityImagePaletteSwatch = {
	_type: 'sanity.imagePaletteSwatch';
	background?: string;
	foreground?: string;
	population?: number;
	title?: string;
};

export type SanityImagePalette = {
	_type: 'sanity.imagePalette';
	darkMuted?: SanityImagePaletteSwatch;
	lightVibrant?: SanityImagePaletteSwatch;
	darkVibrant?: SanityImagePaletteSwatch;
	vibrant?: SanityImagePaletteSwatch;
	dominant?: SanityImagePaletteSwatch;
	lightMuted?: SanityImagePaletteSwatch;
	muted?: SanityImagePaletteSwatch;
};

export type SanityImageDimensions = {
	_type: 'sanity.imageDimensions';
	height?: number;
	width?: number;
	aspectRatio?: number;
};

export type Geopoint = {
	_type: 'geopoint';
	lat?: number;
	lng?: number;
	alt?: number;
};

export type Slug = {
	_type: 'slug';
	current: string;
	source?: string;
};

export type Portfolio = {
	_id: string;
	_type: 'portfolio';
	_createdAt: string;
	_updatedAt: string;
	_rev: string;
	title: string;
	image: {
		asset?: {
			_ref: string;
			_type: 'reference';
			_weak?: boolean;
			[internalGroqTypeReferenceTo]?: 'sanity.imageAsset';
		};
		hotspot?: SanityImageHotspot;
		crop?: SanityImageCrop;
		alt: string;
		_type: 'image';
	};
	description: Array<{
		children?: Array<{
			marks?: Array<string>;
			text?: string;
			_type: 'span';
			_key: string;
		}>;
		style?: 'normal' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'blockquote';
		listItem?: 'bullet' | 'number';
		markDefs?: Array<{
			href?: string;
			_type: 'link';
			_key: string;
		}>;
		level?: number;
		_type: 'block';
		_key: string;
	}>;
	technologies: Array<{
		_ref: string;
		_type: 'reference';
		_weak?: boolean;
		_key: string;
		[internalGroqTypeReferenceTo]?: 'skill';
	}>;
	linkToGithub?: string;
	linkToYoutube?: string;
	linkToProject?: string;
};

export type Cv = {
	_id: string;
	_type: 'cv';
	_createdAt: string;
	_updatedAt: string;
	_rev: string;
	cv: {
		asset?: {
			_ref: string;
			_type: 'reference';
			_weak?: boolean;
			[internalGroqTypeReferenceTo]?: 'sanity.fileAsset';
		};
		_type: 'file';
	};
};

export type SanityFileAsset = {
	_id: string;
	_type: 'sanity.fileAsset';
	_createdAt: string;
	_updatedAt: string;
	_rev: string;
	originalFilename?: string;
	label?: string;
	title?: string;
	description?: string;
	altText?: string;
	sha1hash?: string;
	extension?: string;
	mimeType?: string;
	size?: number;
	assetId?: string;
	uploadId?: string;
	path?: string;
	url?: string;
	source?: SanityAssetSourceData;
};

export type Project = {
	_id: string;
	_type: 'project';
	_createdAt: string;
	_updatedAt: string;
	_rev: string;
	title: string;
	company: string;
	dateStarted: string;
	dateEnded: string;
	image: {
		asset?: {
			_ref: string;
			_type: 'reference';
			_weak?: boolean;
			[internalGroqTypeReferenceTo]?: 'sanity.imageAsset';
		};
		hotspot?: SanityImageHotspot;
		crop?: SanityImageCrop;
		alt: string;
		_type: 'image';
	};
	summary: Array<{
		children?: Array<{
			marks?: Array<string>;
			text?: string;
			_type: 'span';
			_key: string;
		}>;
		style?: 'normal' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'blockquote';
		listItem?: 'bullet' | 'number';
		markDefs?: Array<{
			href?: string;
			_type: 'link';
			_key: string;
		}>;
		level?: number;
		_type: 'block';
		_key: string;
	}>;
	shortSummary: Array<{
		children?: Array<{
			marks?: Array<string>;
			text?: string;
			_type: 'span';
			_key: string;
		}>;
		style?: 'normal' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'blockquote';
		listItem?: 'bullet' | 'number';
		markDefs?: Array<{
			href?: string;
			_type: 'link';
			_key: string;
		}>;
		level?: number;
		_type: 'block';
		_key: string;
	}>;
	technologies: Array<{
		_ref: string;
		_type: 'reference';
		_weak?: boolean;
		_key: string;
		[internalGroqTypeReferenceTo]?: 'skill';
	}>;
	linkToBuild?: string;
	linkToGitHub?: string;
	linkToYoutube?: string;
};

export type ImageCdn = {
	_id: string;
	_type: 'imageCdn';
	_createdAt: string;
	_updatedAt: string;
	_rev: string;
	title: string;
	image: {
		asset?: {
			_ref: string;
			_type: 'reference';
			_weak?: boolean;
			[internalGroqTypeReferenceTo]?: 'sanity.imageAsset';
		};
		hotspot?: SanityImageHotspot;
		crop?: SanityImageCrop;
		alt: string;
		_type: 'image';
	};
};

export type Footer = {
	_id: string;
	_type: 'footer';
	_createdAt: string;
	_updatedAt: string;
	_rev: string;
	name?: string;
	role?: string;
	logo?: Array<{
		_ref: string;
		_type: 'reference';
		_weak?: boolean;
		_key: string;
		[internalGroqTypeReferenceTo]?: 'imageCdn';
	}>;
	email?: string;
	phoneNumber?: string;
	address?: string;
	city?: string;
	social?: Array<{
		_ref: string;
		_type: 'reference';
		_weak?: boolean;
		_key: string;
		[internalGroqTypeReferenceTo]?: 'social';
	}>;
};

export type Social = {
	_id: string;
	_type: 'social';
	_createdAt: string;
	_updatedAt: string;
	_rev: string;
	socialImage: {
		asset?: {
			_ref: string;
			_type: 'reference';
			_weak?: boolean;
			[internalGroqTypeReferenceTo]?: 'sanity.imageAsset';
		};
		hotspot?: SanityImageHotspot;
		crop?: SanityImageCrop;
		alt: string;
		_type: 'image';
	};
	title: string;
	url: string;
};

export type Skill = {
	_id: string;
	_type: 'skill';
	_createdAt: string;
	_updatedAt: string;
	_rev: string;
	title: string;
	image: {
		asset?: {
			_ref: string;
			_type: 'reference';
			_weak?: boolean;
			[internalGroqTypeReferenceTo]?: 'sanity.imageAsset';
		};
		hotspot?: SanityImageHotspot;
		crop?: SanityImageCrop;
		alt: string;
		_type: 'image';
	};
	link: string;
	speciality: string;
	type: string;
	position: string;
};

export type Hero = {
	_id: string;
	_type: 'hero';
	_createdAt: string;
	_updatedAt: string;
	_rev: string;
	name: string;
	role: string;
	typeWriter: Array<string>;
	speciality: string;
	title: string;
	together: Array<
		| {
				children?: Array<{
					marks?: Array<string>;
					text?: string;
					_type: 'span';
					_key: string;
				}>;
				style?: 'normal' | 'h1' | 'h2' | 'h3' | 'h4' | 'blockquote' | 'div' | 'span';
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
		| {
				asset?: {
					_ref: string;
					_type: 'reference';
					_weak?: boolean;
					[internalGroqTypeReferenceTo]?: 'sanity.imageAsset';
				};
				hotspot?: SanityImageHotspot;
				crop?: SanityImageCrop;
				alt?: string;
				_type: 'image';
				_key: string;
		  }
	>;
	profilePicture: {
		asset?: {
			_ref: string;
			_type: 'reference';
			_weak?: boolean;
			[internalGroqTypeReferenceTo]?: 'sanity.imageAsset';
		};
		hotspot?: SanityImageHotspot;
		crop?: SanityImageCrop;
		alt: string;
		_type: 'image';
	};
	skills: Array<{
		_ref: string;
		_type: 'reference';
		_weak?: boolean;
		_key: string;
		[internalGroqTypeReferenceTo]?: 'skill';
	}>;
};

export type About = {
	_id: string;
	_type: 'about';
	_createdAt: string;
	_updatedAt: string;
	_rev: string;
	aboutImage: {
		asset?: {
			_ref: string;
			_type: 'reference';
			_weak?: boolean;
			[internalGroqTypeReferenceTo]?: 'sanity.imageAsset';
		};
		hotspot?: SanityImageHotspot;
		crop?: SanityImageCrop;
		alt: string;
		_type: 'image';
	};
	title: string;
	body: Array<
		| {
				children?: Array<{
					marks?: Array<string>;
					text?: string;
					_type: 'span';
					_key: string;
				}>;
				style?: 'normal' | 'h1' | 'h2' | 'h3' | 'h4' | 'blockquote' | 'div' | 'span';
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
		| {
				asset?: {
					_ref: string;
					_type: 'reference';
					_weak?: boolean;
					[internalGroqTypeReferenceTo]?: 'sanity.imageAsset';
				};
				hotspot?: SanityImageHotspot;
				crop?: SanityImageCrop;
				alt?: string;
				_type: 'image';
				_key: string;
		  }
	>;
};

export type BlockContent = Array<
	| {
			children?: Array<{
				marks?: Array<string>;
				text?: string;
				_type: 'span';
				_key: string;
			}>;
			style?: 'normal' | 'h1' | 'h2' | 'h3' | 'h4' | 'blockquote' | 'div' | 'span';
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
	| {
			asset?: {
				_ref: string;
				_type: 'reference';
				_weak?: boolean;
				[internalGroqTypeReferenceTo]?: 'sanity.imageAsset';
			};
			hotspot?: SanityImageHotspot;
			crop?: SanityImageCrop;
			alt?: string;
			_type: 'image';
			_key: string;
	  }
>;

export type SanityImageCrop = {
	_type: 'sanity.imageCrop';
	top?: number;
	bottom?: number;
	left?: number;
	right?: number;
};

export type SanityImageHotspot = {
	_type: 'sanity.imageHotspot';
	x?: number;
	y?: number;
	height?: number;
	width?: number;
};

export type SanityImageAsset = {
	_id: string;
	_type: 'sanity.imageAsset';
	_createdAt: string;
	_updatedAt: string;
	_rev: string;
	originalFilename?: string;
	label?: string;
	title?: string;
	description?: string;
	altText?: string;
	sha1hash?: string;
	extension?: string;
	mimeType?: string;
	size?: number;
	assetId?: string;
	uploadId?: string;
	path?: string;
	url?: string;
	metadata?: SanityImageMetadata;
	source?: SanityAssetSourceData;
};

export type SanityAssetSourceData = {
	_type: 'sanity.assetSourceData';
	name?: string;
	id?: string;
	url?: string;
};

export type SanityImageMetadata = {
	_type: 'sanity.imageMetadata';
	location?: Geopoint;
	dimensions?: SanityImageDimensions;
	palette?: SanityImagePalette;
	lqip?: string;
	blurHash?: string;
	hasAlpha?: boolean;
	isOpaque?: boolean;
};

export type AllSanitySchemaTypes =
	| SanityImagePaletteSwatch
	| SanityImagePalette
	| SanityImageDimensions
	| Geopoint
	| Slug
	| Portfolio
	| Cv
	| SanityFileAsset
	| Project
	| ImageCdn
	| Footer
	| Social
	| Skill
	| Hero
	| About
	| BlockContent
	| SanityImageCrop
	| SanityImageHotspot
	| SanityImageAsset
	| SanityAssetSourceData
	| SanityImageMetadata;
export declare const internalGroqTypeReferenceTo: unique symbol;
// Source: ./sanity/lib/query/getAbout.ts
// Variable: ABOUT_QUERY
// Query: *[_type == "about"]
export type ABOUT_QUERYResult = Array<{
	_id: string;
	_type: 'about';
	_createdAt: string;
	_updatedAt: string;
	_rev: string;
	aboutImage: {
		asset?: {
			_ref: string;
			_type: 'reference';
			_weak?: boolean;
			[internalGroqTypeReferenceTo]?: 'sanity.imageAsset';
		};
		hotspot?: SanityImageHotspot;
		crop?: SanityImageCrop;
		alt: string;
		_type: 'image';
	};
	title: string;
	body: Array<
		| {
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
		| {
				asset?: {
					_ref: string;
					_type: 'reference';
					_weak?: boolean;
					[internalGroqTypeReferenceTo]?: 'sanity.imageAsset';
				};
				hotspot?: SanityImageHotspot;
				crop?: SanityImageCrop;
				alt?: string;
				_type: 'image';
				_key: string;
		  }
	>;
}>;

// Source: ./sanity/lib/query/getExperiences.ts
// Variable: EXPERIENCES_QUERY
// Query: *[_type == "project"] | order(dateStarted desc){		...,		technologies[]->	}
export type EXPERIENCES_QUERYResult = Array<{
	_id: string;
	_type: 'project';
	_createdAt: string;
	_updatedAt: string;
	_rev: string;
	title: string;
	company: string;
	dateStarted: string;
	dateEnded: string;
	image: {
		asset?: {
			_ref: string;
			_type: 'reference';
			_weak?: boolean;
			[internalGroqTypeReferenceTo]?: 'sanity.imageAsset';
		};
		hotspot?: SanityImageHotspot;
		crop?: SanityImageCrop;
		alt: string;
		_type: 'image';
	};
	summary: Array<{
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
	}>;
	shortSummary: Array<{
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
	}>;
	technologies: Array<{
		_id: string;
		_type: 'skill';
		_createdAt: string;
		_updatedAt: string;
		_rev: string;
		title: string;
		image: {
			asset?: {
				_ref: string;
				_type: 'reference';
				_weak?: boolean;
				[internalGroqTypeReferenceTo]?: 'sanity.imageAsset';
			};
			hotspot?: SanityImageHotspot;
			crop?: SanityImageCrop;
			alt: string;
			_type: 'image';
		};
		link: string;
		speciality: string;
		type: string;
		position: string;
	}>;
	linkToBuild?: string;
	linkToGitHub?: string;
	linkToYoutube?: string;
}>;

// Source: ./sanity/lib/query/getFooter.ts
// Variable: FOOTER_QUERY
// Query: *[_type == "footer"]{		...,    social[]->,		imageCdn[]->	}
export type FOOTER_QUERYResult = Array<{
	_id: string;
	_type: 'footer';
	_createdAt: string;
	_updatedAt: string;
	_rev: string;
	name?: string;
	role?: string;
	logo?: Array<{
		_ref: string;
		_type: 'reference';
		_weak?: boolean;
		_key: string;
		[internalGroqTypeReferenceTo]?: 'imageCdn';
	}>;
	email?: string;
	phoneNumber?: string;
	address?: string;
	city?: string;
	social: Array<{
		_id: string;
		_type: 'social';
		_createdAt: string;
		_updatedAt: string;
		_rev: string;
		socialImage: {
			asset?: {
				_ref: string;
				_type: 'reference';
				_weak?: boolean;
				[internalGroqTypeReferenceTo]?: 'sanity.imageAsset';
			};
			hotspot?: SanityImageHotspot;
			crop?: SanityImageCrop;
			alt: string;
			_type: 'image';
		};
		title: string;
		url: string;
	}> | null;
	imageCdn: null;
}>;

// Source: ./sanity/lib/query/getHero.ts
// Variable: HERO_QUERY
// Query: *[_type == "hero"]{		...,		skills[]->	}
export type HERO_QUERYResult = Array<{
	_id: string;
	_type: 'hero';
	_createdAt: string;
	_updatedAt: string;
	_rev: string;
	name: string;
	role: string;
	typeWriter: Array<string>;
	speciality: string;
	title: string;
	together: Array<
		| {
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
		| {
				asset?: {
					_ref: string;
					_type: 'reference';
					_weak?: boolean;
					[internalGroqTypeReferenceTo]?: 'sanity.imageAsset';
				};
				hotspot?: SanityImageHotspot;
				crop?: SanityImageCrop;
				alt?: string;
				_type: 'image';
				_key: string;
		  }
	>;
	profilePicture: {
		asset?: {
			_ref: string;
			_type: 'reference';
			_weak?: boolean;
			[internalGroqTypeReferenceTo]?: 'sanity.imageAsset';
		};
		hotspot?: SanityImageHotspot;
		crop?: SanityImageCrop;
		alt: string;
		_type: 'image';
	};
	skills: Array<{
		_id: string;
		_type: 'skill';
		_createdAt: string;
		_updatedAt: string;
		_rev: string;
		title: string;
		image: {
			asset?: {
				_ref: string;
				_type: 'reference';
				_weak?: boolean;
				[internalGroqTypeReferenceTo]?: 'sanity.imageAsset';
			};
			hotspot?: SanityImageHotspot;
			crop?: SanityImageCrop;
			alt: string;
			_type: 'image';
		};
		link: string;
		speciality: string;
		type: string;
		position: string;
	}>;
}>;

// Source: ./sanity/lib/query/getPortfolios.ts
// Variable: PROTFOLIO_QUERY
// Query: *[_type == "portfolio"] | order(dateStarted desc){		...,		technologies[]->	}
export type PROTFOLIO_QUERYResult = Array<{
	_id: string;
	_type: 'portfolio';
	_createdAt: string;
	_updatedAt: string;
	_rev: string;
	title: string;
	image: {
		asset?: {
			_ref: string;
			_type: 'reference';
			_weak?: boolean;
			[internalGroqTypeReferenceTo]?: 'sanity.imageAsset';
		};
		hotspot?: SanityImageHotspot;
		crop?: SanityImageCrop;
		alt: string;
		_type: 'image';
	};
	description: Array<{
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
	}>;
	technologies: Array<{
		_id: string;
		_type: 'skill';
		_createdAt: string;
		_updatedAt: string;
		_rev: string;
		title: string;
		image: {
			asset?: {
				_ref: string;
				_type: 'reference';
				_weak?: boolean;
				[internalGroqTypeReferenceTo]?: 'sanity.imageAsset';
			};
			hotspot?: SanityImageHotspot;
			crop?: SanityImageCrop;
			alt: string;
			_type: 'image';
		};
		link: string;
		speciality: string;
		type: string;
		position: string;
	}>;
	linkToGithub?: string;
	linkToYoutube?: string;
	linkToProject?: string;
}>;

// Source: ./sanity/lib/query/getSkills.ts
// Variable: SKILL_QUERY
// Query: *[_type == "skill"]
export type SKILL_QUERYResult = Array<{
	_id: string;
	_type: 'skill';
	_createdAt: string;
	_updatedAt: string;
	_rev: string;
	title: string;
	image: {
		asset?: {
			_ref: string;
			_type: 'reference';
			_weak?: boolean;
			[internalGroqTypeReferenceTo]?: 'sanity.imageAsset';
		};
		hotspot?: SanityImageHotspot;
		crop?: SanityImageCrop;
		alt: string;
		_type: 'image';
	};
	link: string;
	speciality: string;
	type: string;
	position: string;
}>;

// Source: ./sanity/lib/query/getSocial.ts
// Variable: SOCIAL_QUERY
// Query: *[_type == "social"]
export type SOCIAL_QUERYResult = Array<{
	_id: string;
	_type: 'social';
	_createdAt: string;
	_updatedAt: string;
	_rev: string;
	socialImage: {
		asset?: {
			_ref: string;
			_type: 'reference';
			_weak?: boolean;
			[internalGroqTypeReferenceTo]?: 'sanity.imageAsset';
		};
		hotspot?: SanityImageHotspot;
		crop?: SanityImageCrop;
		alt: string;
		_type: 'image';
	};
	title: string;
	url: string;
}>;

// Query TypeMap
import '@sanity/client';
declare module '@sanity/client' {
	interface SanityQueries {
		'*[_type == "about"]': ABOUT_QUERYResult;
		'*[_type == "project"] | order(dateStarted desc){\n\t\t...,\n\t\ttechnologies[]->\n\t}': EXPERIENCES_QUERYResult;
		'*[_type == "footer"]{\n\t\t...,\n    social[]->,\n\t\timageCdn[]->\n\t}': FOOTER_QUERYResult;
		'*[_type == "hero"]{\n\t\t...,\n\t\tskills[]->\n\t}': HERO_QUERYResult;
		'*[_type == "portfolio"] | order(dateStarted desc){\n\t\t...,\n\t\ttechnologies[]->\n\t}': PROTFOLIO_QUERYResult;
		'*[_type == "skill"]': SKILL_QUERYResult;
		'*[_type == "social"]': SOCIAL_QUERYResult;
	}
}
