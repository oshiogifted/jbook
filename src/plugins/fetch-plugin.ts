import * as esbuild from 'esbuild-wasm';
import axios from 'axios';
import localforage from 'localforage';

// IndexedDB via localforage
const fileCache = localforage.createInstance({
	name: 'filecache'
});

export const fetchPlugin = (inputCode: string) => {
	return {
		name: 'fetch-plugin',
		setup(build: esbuild.PluginBuild) {
			build.onLoad({ filter: /(^index\.js$)/ }, () => {
				return {
					loader: 'jsx',
					contents: inputCode
				};
			});

			// ESBuild will still execute this onLoad() even if it does not return anything
			// It still executes other onLoad functions
			build.onLoad({ filter: /.*/ }, async (args: any) => {
				/*** Caching with key:value pairs using IndexedDB */
				// Check to see if we have already fetched this file and if it is in the cache
				// using args.path as key
				const cachedResult = await fileCache.getItem<esbuild.OnLoadResult>(args.path);
				// If it is, return it immediately
				if (cachedResult) {
					return cachedResult;
				}
			});
      
			build.onLoad({ filter: /.css$/ }, async (args: any) => {
				// If not, make a fetch and...
				// fetch pkg from unpkg using axios
				const { data, request } = await axios.get(args.path);

				const escapedCSS = data
					.replace(/\n/g, '') // find any new line chars and replace them with an empty string (collapse css into one single line)
					.replace(/"/g, '\\"') // find any double quotes and escape them
					.replace(/'/g, "\\'"); // find any single quotes and escape them
				const contents = `
          const style = document.createElement('style');
          style.innerText = '${escapedCSS}';
          document.head.appendChild(style);        
         `;
				const result: esbuild.OnLoadResult = {
					loader: 'jsx', // just so esbuild can understand that it may have to parse some jsx in the file
					contents: contents,
					resolveDir: new URL('./', request.responseURL).pathname
				};

				// ...store response in cache
				await fileCache.setItem(args.path, result);

				return result;
			});

			build.onLoad({ filter: /.*/, namespace: 'a' }, async (args: any) => {
				// If not, make a fetch and...
				// fetch pkg from unpkg using axios
				const { data, request } = await axios.get(args.path);

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
