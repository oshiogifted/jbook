import MonacoEditor from '@monaco-editor/react';

interface CodeEditorProps {
	intialValue: string;
	onChange(value: string): void;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ onChange, intialValue }) => {
	// called whenever the editor is first displayed on the screen
	// getValue - fn to get the currentValue out of the editor
	// onDidChangeModelContent listener is emitted whenever user changes code in editor
	const onMount = (editor: any) => {
		editor.onDidChangeModelContent(() => {
			//console.log(editor.getValue());
			onChange(editor.getValue());
		});
	};

	return (
		<MonacoEditor
			onMount={onMount}
			value={intialValue} // intialize value in editor
			theme='vs-dark'
			language='javascript'
			height='500px'
			options={{
				wordWrap: 'on',
				minimap: { enabled: false },
				showUnused: false,
				folding: false,
				lineNumbersMinChars: 3,
				fontSize: 16,
				scrollBeyondLastLine: false,
				automaticLayout: true
			}}
		/>
	);
};

export default CodeEditor;
