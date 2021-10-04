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

export const unpkgPathPlugin = (inputCode: string) => {
	return {
		name: 'unpkg-path-plugin',
		setup(build: esbuild.PluginBuild) {
			// Handle root entry file of 'index.js'
			build.onResolve({ filter: /(^index\.js$)/ }, () => {
				return { path: 'index.js', namespace: 'a' };
			});

			// Handle relative paths in a module
			build.onResolve({ filter: /^\.+\// }, (args: any) => {
				return {
					namespace: 'a',
					path: new URL(args.path, 'https://unpkg.com' + args.resolveDir + '/').href
				};
			});

			// Handle main file of a module (ex. unpkg.com/react -> takes u to main file index.js)
			build.onResolve({ filter: /.*/ }, async (args: any) => {
				return {
					namespace: 'a',
					path: `https://unpkg.com/${args.path}`
				};
			});

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
				const cachedResult = await fileCache.getItem<esbuild.OnLoadResult>(args.path);
				// If it is, return it immediately
				if (cachedResult) {
					return cachedResult;
				}
				// If not, make a fetch and...
				// fetch pkg from unpkg using axios
				const { data, request } = await axios.get(args.path);
				//console.log("fetching from unpkg - ", data);
				//console.log('axios response request -', request);
				const result: esbuild.OnLoadResult = {
					loader: 'jsx', // just so esbuild can understand that it may have to parse some jsx in the file
					contents: data,
					resolveDir: new URL('./', request.responseURL).pathname
				};

				// ...store response in cache
				await fileCache.setItem(args.path, result);

				return result;
			});
		}
	};
};
