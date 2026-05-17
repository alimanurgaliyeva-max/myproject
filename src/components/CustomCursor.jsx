import React, { useEffect, useRef } from 'react';

export default function CustomCursor() {
  const cursorRef = useRef(null);
  const dotRef = useRef(null);
  const pos = useRef({ x: 0, y: 0 });
  const dot = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const move = (e) => {
      pos.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('mousemove', move);

    let raf;
    const animate = () => {
      dot.current.x += (pos.current.x - dot.current.x) * 0.12;
      dot.current.y += (pos.current.y - dot.current.y) * 0.12;

      if (cursorRef.current) {
        cursorRef.current.style.left = `${pos.current.x}px`;
        cursorRef.current.style.top = `${pos.current.y}px`;
      }
      if (dotRef.current) {
        dotRef.current.style.left = `${dot.current.x}px`;
        dotRef.current.style.top = `${dot.current.y}px`;
      }
      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);

    const onDown = () => { cursorRef.current?.classList.add('scale-75'); };
    const onUp = () => { cursorRef.current?.classList.remove('scale-75'); };
    window.addEventListener('mousedown', onDown);
    window.addEventListener('mouseup', onUp);

    return () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mousedown', onDown);
      window.removeEventListener('mouseup', onUp);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      <div
        ref={cursorRef}
        className="fixed pointer-events-none z-[9999] transition-transform duration-100"
        style={{
          width: 28,
          height: 28,
          borderRadius: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'radial-gradient(circle at 35% 35%, #b892ff, #7B4FE0)',
          boxShadow: '0 2px 10px rgba(123, 79, 224, 0.6), inset 0 1px 3px rgba(255,255,255,0.4)',
          border: '2px solid rgba(255,255,255,0.5)',
        }}
      />
      <div
        ref={dotRef}
        className="fixed pointer-events-none z-[9998]"
        style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          transform: 'translate(-50%, -50%)',
          background: '#FF6B7A',
          boxShadow: '0 0 6px rgba(255, 107, 122, 0.8)',
        }}
      />
    </>
  );
}
