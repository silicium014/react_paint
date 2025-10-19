import React, { useState, useRef } from 'react';
import Toolbar from './components/Toolbar';
import WebGLCanvas from './canvas/WebGLCanvas';
import './index.css';

const App = () => {
  const [tool, setTool] = useState('brush');
  const [color, setColor] = useState('#e74c3c');
  const [brushSize, setBrushSize] = useState(10);
  const canvasRef = useRef();

  const handleClear = () => {
    if (canvasRef.current) {
      canvasRef.current.clearCanvas();
    }
  };

  return (
    <div className="app">
      <h1>🎨 Paint App</h1>
      
      <Toolbar
        tool={tool}
        setTool={setTool}
        color={color}
        setColor={setColor}
        brushSize={brushSize}
        setBrushSize={setBrushSize}
      />
      
      <div className="canvas-container">
        <WebGLCanvas
          ref={canvasRef}
          tool={tool}
          color={color}
          brushSize={brushSize}
          width={800}
          height={600}
        />
      </div>

      <div className="controls">
        <button onClick={handleClear}>Очистить холст</button>
      </div>
    </div>
  );
};

export default App;