import React, { useEffect, useState } from 'react';

const Background = React.memo(({ scrollY = 0, parallax = false }) => {
  const y = parallax ? scrollY : 0;
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-black">
      <div className="absolute inset-0 bg-indigo-500/5 transition-opacity duration-1000" />

      <div
        className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] mix-blend-screen transition-transform duration-300 ease-out"
        style={parallax ? { transform: `translateY(${y * 0.15}px) translateX(${y * 0.05}px)` } : undefined}
      />

      <div
        className="absolute top-[20%] right-[-5%] w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[120px] mix-blend-screen transition-transform duration-300 ease-out"
        style={parallax ? { transform: `translateY(${y * 0.08}px) translateX(${y * -0.05}px)` } : undefined}
      />

      <div
        className="absolute bottom-[-10%] left-[20%] w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-[100px] mix-blend-screen transition-transform duration-300 ease-out"
        style={parallax ? { transform: `translateY(${y * 0.12}px)` } : undefined}
      />

      <div className="absolute inset-0 opacity-[0.015] mix-blend-overlay" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }} />
    </div>
  );
});

Background.displayName = 'Background';

export const useScrollY = () => {
    const [scrollY, setScrollY] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            setScrollY(window.scrollY);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });

        handleScroll();

        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return scrollY;
};

export default Background;
