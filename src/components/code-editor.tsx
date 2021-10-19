import MonacoEditor from '@monaco-editor/react';

interface CodeEditorProps {
	intialValue: string;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ intialValue }) => {
	return (
		<MonacoEditor
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
