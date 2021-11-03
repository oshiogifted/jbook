import './styles/resizable.css';
import { useEffect } from 'react';
import { ResizableBox, ResizableBoxProps } from 'react-resizable';

interface ResizableProps {
  direction: 'horizontal' | 'vertical';
}

const Resizable: React.FC<ResizableProps> = ({ direction, children }) => {
  useEffect(() => {
    const listener = () => {
      console.log(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', listener);

    // cleanup if we ever decide to stop showing Resizable component
    return () => {
      window.removeEventListener('resize', listener);
    };
  }, []);

  // To allow for different direction prop settings (vertical & horizontal)
  let resizableProps: ResizableBoxProps;

  if (direction === 'horizontal') {
    resizableProps = {
      className: 'resize-horizontal',
      minConstraints: [window.innerWidth * 0.2, Infinity],
      maxConstraints: [window.innerWidth * 0.75, Infinity],
      height: Infinity, // tall or small as it wants as long as it fits inside the constraints
      width: window.innerWidth * 0.75,
      resizeHandles: ['e'],
    };
  } else {
    resizableProps = {
      minConstraints: [Infinity, 24],
      maxConstraints: [Infinity, window.innerHeight * 0.9], // 90% of browser window
      height: 300,
      width: Infinity,
      resizeHandles: ['s'],
    };
  }

  return <ResizableBox {...resizableProps}>{children}</ResizableBox>;
};
export default Resizable;
