import { Composition, Still, registerRoot } from 'remotion';

import cues from './cues.json';
import { Poster } from './Poster.jsx';
import { Resume } from './Resume.jsx';

function Root() {
	return (
		<>
			<Composition
				id="resume"
				component={Resume}
				durationInFrames={cues.duration}
				fps={cues.fps}
				width={1920}
				height={1080}
				defaultProps={{ framesDir: 'frames', audio: 'mix.wav' }}
			/>
			<Composition
				id="resume-vertical"
				component={Resume}
				durationInFrames={cues.duration}
				fps={cues.fps}
				width={1080}
				height={1920}
				defaultProps={{ framesDir: 'frames-portrait', audio: 'mix.wav' }}
			/>
			<Still id="poster" component={Poster} width={1920} height={1080} defaultProps={{ framesDir: 'frames' }} />
		</>
	);
}

registerRoot(Root);
