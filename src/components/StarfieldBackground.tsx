
import React, { useEffect, useRef } from 'react';

interface StarfieldBackgroundProps {
  density?: number;
  speed?: number;
  className?: string;
}

export function StarfieldBackground({
  density = 100,
  speed = 0.5,
  className,
}: StarfieldBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas to full screen
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    
    // Create stars
    class Star {
      x: number;
      y: number;
      z: number;
      size: number;
      color: string;
      
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.z = Math.random() * canvas.width; // depth
        this.size = 0.5 + Math.random() * 1;
        
        const brightness = 0.5 + Math.random() * 0.5;
        
        // Randomly assign colors with a bias towards white/cyan
        const colors = [
          `rgba(255, 255, 255, ${brightness})`, // white
          `rgba(220, 255, 255, ${brightness})`, // slight cyan tint
          `rgba(200, 200, 255, ${brightness})`, // slight blue tint
          `rgba(181, 96, 255, ${0.3 + brightness * 0.3})`, // violet with reduced opacity
        ];
        
        this.color = colors[Math.floor(Math.random() * colors.length)];
      }
      
      update() {
        this.z = this.z - speed;
        
        // Reset star when it reaches the screen edge
        if (this.z <= 0) {
          this.z = canvas.width;
          this.x = Math.random() * canvas.width;
          this.y = Math.random() * canvas.height;
        }
      }
      
      draw() {
        const sx = (this.x - canvas.width / 2) * (canvas.width / this.z) + canvas.width / 2;
        const sy = (this.y - canvas.height / 2) * (canvas.width / this.z) + canvas.height / 2;
        
        const r = this.size * (canvas.width / this.z);
        
        ctx.beginPath();
        ctx.fillStyle = this.color;
        ctx.arc(sx, sy, r, 0, 2 * Math.PI);
        ctx.fill();
        
        // Add a subtle glow to some stars
        if (Math.random() > 0.97) {
          ctx.beginPath();
          ctx.arc(sx, sy, r * 2, 0, 2 * Math.PI);
          ctx.fillStyle = this.color.replace(')', ', 0.3)');
          ctx.fill();
        }
      }
    }
    
    const stars = Array(density).fill(null).map(() => new Star());
    
    // Animation loop
    const animate = () => {
      ctx.fillStyle = 'rgba(10, 15, 44, 0.1)'; // Almost complete clear with slight trail
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      stars.forEach(star => {
        star.update();
        star.draw();
      });
      
      requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [density, speed]);
  
  return <canvas ref={canvasRef} className={`fixed inset-0 -z-10 ${className}`} />;
}
