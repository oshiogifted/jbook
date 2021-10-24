import { useRef } from 'react';
import MonacoEditor, { OnMount } from '@monaco-editor/react';
import prettier from 'prettier';
import parser from 'prettier/parser-babel';

interface CodeEditorProps {
  intialValue: string;
  onChange(value: string): void; // or onChange: (value: string) => void;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ onChange, intialValue }) => {
  // ref can be used not only for getting a reference to a component but a reference to any kind of arbitrary value inside a component and hold a reference to it
  const editorRef = useRef<any>();

  // called whenever the editor is first displayed on the screen
  // getValue - fn to get the currentValue out of the editor
  // onDidChangeModelContent listener is emitted whenever user changes code in editor
  const onMount: OnMount = (editor) => {
    editorRef.current = editor;
    editor.onDidChangeModelContent(() => {
      //console.log(editor.getValue());
      onChange(editor.getValue());
    });
    editor.getModel()?.updateOptions({
      tabSize: 2,
      bracketColorizationOptions: {
        enabled: true,
      },
    });
  };

  const onFormatClick = () => {
    //console.log(editorRef.current);
    // get current value from editor
    const unformatted = editorRef.current.getValue();

    // format that value
    const formatted = prettier.format(unformatted, {
      // keep this as JS and use parser as imported above
      parser: 'babel',
      plugins: [parser],
      useTabs: false,
      semi: true,
      singleQuote: true,
    });

    // set the formatted value back in the editor
    editorRef.current.getModel().setValue(formatted);
  };

  return (
    <div>
      <button onClick={onFormatClick}>Format</button>
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
          automaticLayout: true,
        }}
      />
    </div>
  );
};

export default CodeEditor;
