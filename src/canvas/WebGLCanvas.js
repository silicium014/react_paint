import React, { forwardRef, useImperativeHandle, useRef, useEffect, useState, useCallback } from 'react';
import vertexShaderSource from './shaders/vertex.glsl';
import fragmentShaderSource from './shaders/fragment.glsl';

const WebGLCanvas = forwardRef(({ tool, color, brushSize, width = 800, height = 600 }, ref) => {
  const canvasRef = useRef();
  const glRef = useRef();
  const programRef = useRef();
  const isDrawingRef = useRef(false);
  const [points, setPoints] = useState([]);
  const lastPointRef = useRef(null);

  // Инициализация WebGL
  const initWebGL = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl');
    if (!gl) {
      console.error('WebGL не поддерживается');
      return;
    }

    glRef.current = gl;

    // Компиляция шейдеров
    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, vertexShaderSource);
    gl.compileShader(vertexShader);

    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, fragmentShaderSource);
    gl.compileShader(fragmentShader);

    // Проверка компиляции шейдеров
    if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
      console.error('Ошибка компиляции vertex shader:', gl.getShaderInfoLog(vertexShader));
      return;
    }

    if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
      console.error('Ошибка компиляции fragment shader:', gl.getShaderInfoLog(fragmentShader));
      return;
    }

    // Создание программы
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Ошибка линковки программы:', gl.getProgramInfoLog(program));
      return;
    }

    programRef.current = program;
    gl.useProgram(program);

    // Настройка
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  }, []);

  // Отрисовка всех точек
  const renderAllPoints = useCallback(() => {
    const gl = glRef.current;
    const program = programRef.current;
    
    if (!gl || !program) return;

    // Очищаем canvas
    gl.clear(gl.COLOR_BUFFER_BIT);

    if (points.length === 0) return;

    // Подготавливаем данные для буферов
    const positions = [];
    const colors = [];
    const sizes = [];

    points.forEach(point => {
      positions.push(point.x, point.y);
      colors.push(point.r, point.g, point.b, point.a);
      sizes.push(point.size);
    });

    // Устанавливаем атрибут позиций
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
    
    const positionAttr = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(positionAttr);
    gl.vertexAttribPointer(positionAttr, 2, gl.FLOAT, false, 0, 0);

    // Устанавливаем атрибут цветов
    const colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
    
    const colorAttr = gl.getAttribLocation(program, 'a_color');
    gl.enableVertexAttribArray(colorAttr);
    gl.vertexAttribPointer(colorAttr, 4, gl.FLOAT, false, 0, 0);

    // Устанавливаем атрибут размеров
    const sizeBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, sizeBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(sizes), gl.STATIC_DRAW);
    
    const sizeAttr = gl.getAttribLocation(program, 'a_size');
    gl.enableVertexAttribArray(sizeAttr);
    gl.vertexAttribPointer(sizeAttr, 1, gl.FLOAT, false, 0, 0);

    // Рисуем все точки
    gl.drawArrays(gl.POINTS, 0, points.length);
  }, [points]);

  // Преобразование координат мыши в WebGL координаты
  const getWebGLCoords = useCallback((clientX, clientY) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const x = ((clientX - rect.left) / canvas.width) * 2 - 1;
    const y = -(((clientY - rect.top) / canvas.height) * 2 - 1);
    
    return { x, y };
  }, []);

  // Получение цвета для текущего инструмента
  const getCurrentColor = useCallback(() => {
    if (tool === 'eraser') {
      return { r: 1.0, g: 1.0, b: 1.0, a: 1.0 };
    } else {
      const hex = color.replace('#', '');
      return {
        r: parseInt(hex.substr(0, 2), 16) / 255,
        g: parseInt(hex.substr(2, 2), 16) / 255,
        b: parseInt(hex.substr(4, 2), 16) / 255,
        a: 1.0
      };
    }
  }, [tool, color]);

  // Добавление новой точки
  const addPoint = useCallback((x, y) => {
    const currentColor = getCurrentColor();
    const newPoint = {
      x,
      y,
      ...currentColor,
      size: brushSize
    };

    setPoints(prev => [...prev, newPoint]);
  }, [getCurrentColor, brushSize]);

  // Добавление линии между точками для плавного рисования
  const addLine = useCallback((fromX, fromY, toX, toY) => {
    const distance = Math.sqrt(Math.pow(toX - fromX, 2) + Math.pow(toY - fromY, 2));
    const steps = Math.max(2, Math.floor(distance * 100));
    
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const x = fromX + (toX - fromX) * t;
      const y = fromY + (toY - fromY) * t;
      addPoint(x, y);
    }
  }, [addPoint]);

  // Обработчики событий мыши
  const handleMouseDown = useCallback((e) => {
    isDrawingRef.current = true;
    const coords = getWebGLCoords(e.clientX, e.clientY);
    lastPointRef.current = coords;
    addPoint(coords.x, coords.y);
  }, [getWebGLCoords, addPoint]);

  const handleMouseMove = useCallback((e) => {
    if (!isDrawingRef.current) return;
    
    const coords = getWebGLCoords(e.clientX, e.clientY);
    
    if (lastPointRef.current) {
      addLine(lastPointRef.current.x, lastPointRef.current.y, coords.x, coords.y);
    } else {
      addPoint(coords.x, coords.y);
    }
    
    lastPointRef.current = coords;
  }, [getWebGLCoords, addPoint, addLine]);

  const handleMouseUp = useCallback(() => {
    isDrawingRef.current = false;
    lastPointRef.current = null;
  }, []);

  const handleMouseLeave = useCallback(() => {
    isDrawingRef.current = false;
    lastPointRef.current = null;
  }, []);

  // Методы, доступные через ref
  useImperativeHandle(ref, () => ({
    clearCanvas: () => {
      setPoints([]);
      const gl = glRef.current;
      if (gl) {
        gl.clear(gl.COLOR_BUFFER_BIT);
      }
    }
  }));

  // Инициализация WebGL при монтировании
  useEffect(() => {
    initWebGL();
  }, [initWebGL]);

  // Перерисовка при изменении точек
  useEffect(() => {
    renderAllPoints();
  }, [points, renderAllPoints]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      style={{ 
        cursor: tool === 'eraser' ? 'cell' : 'crosshair',
        display: 'block',
        background: 'white'
      }}
    />
  );
});

export default WebGLCanvas;
