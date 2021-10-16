import * as esbuild from 'esbuild-wasm';
import { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { unpkgPathPlugin } from './plugins/unpkg-path-plugin';
import { fetchPlugin } from './plugins/fetch-plugin';

const App = () => {
	const ref = useRef<any>();
	const iframeRef = useRef<any>();
	const [ input, setInput ] = useState('');

	// Initialize esbuild
	const startService = async () => {
		ref.current = await esbuild.startService({
			worker: true,
			// fetch binary from unpkg (isntead of public dir (not wise to move stuff from node_modules as we did))
			wasmURL: 'https://unpkg.com/esbuild-wasm@0.8.27/esbuild.wasm'
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

		// resetting iframe contents when user clicks submit before bundling
		iframeRef.current.srcdoc = html;

		//console.log(ref.current);
		// transpiling
		/* 	const result = await ref.current.transform(input, {
			loader: 'jsx',
			target: 'es2015'
		}); */

		// bundling
		const result = await ref.current.build({
			entryPoints: [ 'index.js' ],
			bundle: true,
			write: false,
			plugins: [ unpkgPathPlugin(), fetchPlugin(input) ],
			define: {
				'process.env.NODE_ENV': '"production"',
				global: 'window'
			}
		});
		//console.log(result);
		//setCode(result.outputFiles[0].text);

		// bundled code is written in <textarea/>
		// postMessage contains bundled code
		// parent posts message with bundled code in it, child has listener for 'message' and executes bundled code using eval
		iframeRef.current.contentWindow.postMessage(result.outputFiles[0].text, '*');
	};

	const html = `
		<html>
			<head></head>
			<body>
				<div id="root"></div>
				<script>
				// setup listener for messages in iframe
				window.addEventListener('message', (event) => {
					try {
						eval(event.data); // execute the event data string via eval
					} catch (err) {
						const root = document.querySelector('#root');
						root.innerHTML = '<div style="color: red;"><h4>Runtime Error</h4>' + err + '</div>'
						throw err; // or console.error(err) throws error to console so user can see callstack
					}
				}, false);
				</script>
			</body>
		</html>
	`;

	return (
		<div>
			<textarea
				value={input}
				onChange={(e) => {
					setInput(e.target.value);
				}}
			/>
			<div>
				<button onClick={onClick}>Submit</button>
			</div>
			<iframe title='preview' ref={iframeRef} sandbox='allow-scripts' srcDoc={html} />
		</div>
	);
};

ReactDOM.render(<App />, document.querySelector('#root'));
