import React from 'react';

const ColorPicker = ({ color, setColor }) => {
  const colors = [
    '#e74c3c', '#e67e22', '#f1c40f', '#2ecc71',
    '#3498db', '#9b59b6', '#34495e', '#ecf0f1',
    '#1abc9c', '#d35400', '#c0392b', '#7f8c8d'
  ];

  return (
    <div className="color-picker">
      <span>Цвет:</span>
      {colors.map((col) => (
        <div
          key={col}
          className={`color-option ${color === col ? 'active' : ''}`}
          style={{ backgroundColor: col }}
          onClick={() => setColor(col)}
          title={col}
        />
      ))}
    </div>
  );
};

export default ColorPicker;