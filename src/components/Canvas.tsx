// Canvas.tsx

import { useRef, useEffect } from 'react';
import "../index.css";

interface CanvasProps extends React.CanvasHTMLAttributes<HTMLCanvasElement> {
  draw: (context: CanvasRenderingContext2D) => void;
}

const Canvas = ({ draw, ...rest }: CanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    draw(context);
  }, [draw]);

  return <canvas ref={canvasRef} {...rest} />;
};

export default Canvas;