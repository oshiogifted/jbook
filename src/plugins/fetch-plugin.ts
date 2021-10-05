import * as esbuild from 'esbuild-wasm';
import axios from 'axios';
import localforage from 'localforage';

// IndexedDB via localforage
const fileCache = localforage.createInstance({
	name: 'filecache'
});

// testing IndexedDB
/* (async () => {
	await fileCache.setItem('color', 'red');

	const color = await fileCache.getItem('color');

	console.log(color);
})() //IIFE */

export const fetchPlugin = (inputCode: string) => {
	return {
		name: 'fetch-plugin',
		setup(build: esbuild.PluginBuild) {
			build.onLoad({ filter: /.*/, namespace: 'a' }, async (args: any) => {
				console.log('onLoad', args);

				if (args.path === 'index.js') {
					return {
						loader: 'jsx',
						contents: inputCode
					};
				}

				/*** Caching with key:value pairs using IndexedDB */
				// Check to see if we have already fetched this file and if it is in the cache
				// using args.path as key
				/* 	const cachedResult = await fileCache.getItem<esbuild.OnLoadResult>(args.path);
				// If it is, return it immediately
				if (cachedResult) {
					return cachedResult;
				} */
				// If not, make a fetch and...
				// fetch pkg from unpkg using axios
				const { data, request } = await axios.get(args.path);
				//console.log("fetching from unpkg - ", data);
				//console.log('axios response request -', request);
				//console.log('args.path - ', args.path);

				const fileType = args.path.match(/.css$/) ? 'css' : 'jsx';
				const contents =
					fileType === 'css'
						? `
          const style = document.createElement('style');
          style.innerText = 'body { background-color: "red" }';
          document.head.appendChild(style);        
         `
						: data;
				const result: esbuild.OnLoadResult = {
					loader: 'jsx', // just so esbuild can understand that it may have to parse some jsx in the file
					contents: contents,
					resolveDir: new URL('./', request.responseURL).pathname
				};

				// ...store response in cache
				await fileCache.setItem(args.path, result);

				return result;
			});
		}
	};
};
