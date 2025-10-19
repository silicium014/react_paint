import React from 'react';
import ColorPicker from './ColorPicker';
import BrushSize from './BrushSize';

const Toolbar = ({ tool, setTool, color, setColor, brushSize, setBrushSize }) => {
  const tools = [
    { id: 'brush', label: 'Кисть' },
    { id: 'eraser', label: 'Ластик' },
  ];

  return (
    <div className="toolbar">
      <div className="tools">
        {tools.map((t) => (
          <button
            key={t.id}
            className={`tool-button ${tool === t.id ? 'active' : ''}`}
            onClick={() => setTool(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <ColorPicker color={color} setColor={setColor} />
      <BrushSize brushSize={brushSize} setBrushSize={setBrushSize} />
    </div>
  );
};

export default Toolbar;
