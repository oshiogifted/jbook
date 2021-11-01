import 'bulmaswatch/superhero/bulmaswatch.min.css'; //using superhero theme
import * as esbuild from 'esbuild-wasm';
import { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { unpkgPathPlugin } from './plugins/unpkg-path-plugin';
import { fetchPlugin } from './plugins/fetch-plugin';
import CodeEditor from './components/code-editor';
import Preview from './components/preview';

const App = () => {
  const ref = useRef<any>();
  const [input, setInput] = useState('');
  const [code, setCode] = useState('');

  // Initialize esbuild
  const startService = async () => {
    ref.current = await esbuild.startService({
      worker: true,
      // fetch binary from unpkg (isntead of public dir (not wise to move stuff from node_modules as we did))
      wasmURL: 'https://unpkg.com/esbuild-wasm@0.8.27/esbuild.wasm',
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
      plugins: [unpkgPathPlugin(), fetchPlugin(input)],
      define: {
        'process.env.NODE_ENV': '"production"',
        global: 'window',
      },
    });
    //console.log(result);
    setCode(result.outputFiles[0].text);
  };

  return (
    <div>
      <CodeEditor
        intialValue='const a = 1;'
        onChange={(value) => setInput(value)}
      />
      <div>
        <button onClick={onClick}>Submit</button>
      </div>
      <Preview code={code} />
    </div>
  );
};

ReactDOM.render(<App />, document.querySelector('#root'));
