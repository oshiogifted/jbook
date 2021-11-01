import { useEffect, useRef } from 'react';

interface PreviewProps {
  code: string;
}

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

const Preview: React.FC<PreviewProps> = ({ code }) => {
  const iframeRef = useRef<any>();

  useEffect(() => {
    // only run this if code changes (hence dependency)
    // resetting iframe contents when user clicks submit before bundling
    iframeRef.current.srcdoc = html;
    // bundled code is written in <textarea/>
    // postMessage contains bundled code
    // parent posts message with bundled code in it, child has listener for 'message' and executes bundled code using eval
    iframeRef.current.contentWindow.postMessage(code, '*');
  }, [code]);

  return (
    <iframe
      title='preview'
      ref={iframeRef}
      sandbox='allow-scripts'
      srcDoc={html}
    />
  );
};

export default Preview;
