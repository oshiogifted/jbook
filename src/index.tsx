import * as esbuild from 'esbuild-wasm';
import { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { unpkgPathPlugin } from './plugins/unpkg-path-plugin';

const App = () => {
	const ref = useRef<any>();
	const [ input, setInput ] = useState('');
	const [ code, setCode ] = useState('');

	// Initialize esbuild
	const startService = async () => {
		ref.current = await esbuild.startService({
			worker: true,
			wasmURL: '/esbuild.wasm' // fetch binary from public dir
		});
		//console.log(service); // using "transform()" to transpile our code, and "build()" to bundle
	};

	useEffect(() => {
		startService();
	}, []);

	const onClick = async () => {
		// if the service is not ready, return early
		if (!ref.current) {
			return;
		}
		//console.log(ref.current);
		// transpiling
		/* 	const result = await ref.current.transform(input, {
			loader: 'jsx',
			target: 'es2015'
		}); */

		// bundling
		const result = await ref.current.build({
			entryPoints: ['index.js'],
			bundle: true,
			write: false,
			plugins: [unpkgPathPlugin()]
		});
		console.log(result);
		setCode(result.outputFiles[0].text);
	};

	return (
		<div>
			<textarea value={input} onChange={(e) => setInput(e.target.value)} />
			<div>
				<button onClick={onClick}>Submit</button>
			</div>
			<pre>{code}</pre>
		</div>
	);
};

ReactDOM.render(<App />, document.querySelector('#root'));
