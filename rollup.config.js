import replace from 'rollup-plugin-replace';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import typescript from 'rollup-plugin-typescript2';
import pkg from './package.json';

const commonjsConfig = {
	include: 'node_modules/**',
	namedExports: {
		'node_modules/react/index.js': [
			'Component', 
			'PureComponent', 
			'Fragment', 
			'Children', 
			'createElement',
			'createContext',
			'useContext',
			'useEffect',
			'useMemo',
		],
	}
};

export default [
	// browser-friendly UMD build
	{
		input: 'src/index.ts',
		external: ['react', 'history'],
		output: {
			globals: {
				react: 'React',
				'react-dom': 'ReactDOM',
				'history': 'History',
				'url-search-params': 'URLSearchParams',
			},
			name: 'refilterable',
			file: pkg.browser,
			format: 'umd'
		},
		plugins: [
			replace({
				'process.env.NODE_ENV': JSON.stringify('development'),
			}),
			resolve(),   // so Rollup can find `ms`
			commonjs(commonjsConfig),
			typescript() // so Rollup can convert TypeScript to JavaScript
		]
	},

	// CommonJS (for Node) and ES module (for bundlers) build.
	// (We could have three entries in the configuration array
	// instead of two, but it's quicker to generate multiple
	// builds from a single configuration where possible, using
	// an array for the `output` option, where we can specify 
	// `file` and `format` for each target)
	{
		input: 'src/index.ts',
		external: [
			...Object.keys(pkg.dependencies || {}),
			...Object.keys(pkg.peerDependencies || {}),
		],
		plugins: [
			typescript(), // so Rollup can convert TypeScript to JavaScript,
			commonjs(commonjsConfig),
		],
		output: [
			{ file: pkg.main, format: 'cjs' },
			{ file: pkg.module, format: 'es' }
		]
	}
];
