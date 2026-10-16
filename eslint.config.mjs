import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import prettier from 'eslint-config-prettier';

const eslintConfig = [
	...nextVitals,
	...nextTs,
	prettier,
	{
		// React Three Fiber mutates three.js objects (uniforms, vectors, cameras) inside useFrame by design.
		files: ['components/three/**/*.{ts,tsx}'],
		rules: { 'react-hooks/immutability': 'off' },
	},
	{
		ignores: ['.next/**', 'node_modules/**', 'next-env.d.ts', 'out/**', 'old/**', 'scripts/fps-arms/**'],
	},
];

export default eslintConfig;
