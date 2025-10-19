import React from 'react';

const BrushSize = ({ brushSize, setBrushSize }) => {
  const sizes = [
    { value: 5, label: 'small', name: 'Маленькая' },
    { value: 10, label: 'medium', name: 'Средняя' },
    { value: 20, label: 'large', name: 'Большая' },
  ];

  return (
    <div className="brush-size">
      <span>Размер кисти:</span>
      {sizes.map((size) => (
        <div
          key={size.value}
          className={`size-option ${size.label} ${brushSize === size.value ? 'active' : ''}`}
          onClick={() => setBrushSize(size.value)}
          title={size.name}
        />
      ))}
    </div>
  );
};

export default BrushSize;