import React from 'react';

const Background = React.memo(({ scrollY = 0, parallax = false, variant = 'dark' }) => {
  const y = parallax ? scrollY : 0;
  const isWarm = variant === 'warm' || variant === 'light';

  if (isWarm) {
    return (
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-[#FAF7F2]">
        {/* Soft daylight ambient diffusion */}
        <div
          className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-amber-200/25 rounded-full blur-[140px] transition-transform duration-500 ease-out"
          style={parallax ? { transform: `translate(-50%, ${y * 0.1}px)` } : undefined}
        />
        <div
          className="absolute top-[25%] right-[-10%] w-[650px] h-[650px] bg-stone-300/35 rounded-full blur-[140px] transition-transform duration-500 ease-out"
          style={parallax ? { transform: `translateY(${y * 0.06}px)` } : undefined}
        />
        <div
          className="absolute bottom-[-10%] left-[-5%] w-[550px] h-[550px] bg-stone-200/40 rounded-full blur-[130px] transition-transform duration-500 ease-out"
          style={parallax ? { transform: `translateY(${y * 0.08}px)` } : undefined}
        />

        {/* Delicate architectural micro-dot grid */}
        <div
          className="absolute inset-0 opacity-[0.45]"
          style={{
            backgroundImage: 'radial-gradient(rgba(120, 113, 108, 0.14) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
            maskImage: 'radial-gradient(ellipse 90% 70% at 50% 25%, black 40%, transparent 100%)',
            WebkitMaskImage: 'radial-gradient(ellipse 90% 70% at 50% 25%, black 40%, transparent 100%)',
          }}
        />

        {/* Warm fine physical paper grain */}
        <div
          className="absolute inset-0 opacity-[0.035] mix-blend-multiply"
          style={{
            backgroundImage:
              'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")',
          }}
        />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-[#08090d]">
      {/* Primary ambient lighting - unified, single-hue indigo atmosphere */}
      <div
        className="absolute top-[-15%] left-1/2 -translate-x-1/2 w-[900px] h-[550px] bg-indigo-600/[0.08] rounded-full blur-[140px] transition-transform duration-500 ease-out"
        style={parallax ? { transform: `translate(-50%, ${y * 0.1}px)` } : undefined}
      />
      <div
        className="absolute top-[35%] right-[-10%] w-[600px] h-[600px] bg-indigo-500/[0.04] rounded-full blur-[130px] transition-transform duration-500 ease-out"
        style={parallax ? { transform: `translateY(${y * 0.06}px)` } : undefined}
      />
      <div
        className="absolute bottom-[-15%] left-[-5%] w-[500px] h-[500px] bg-slate-600/[0.04] rounded-full blur-[120px] transition-transform duration-500 ease-out"
        style={parallax ? { transform: `translateY(${y * 0.08}px)` } : undefined}
      />

      {/* Architectural micro-dot grid pattern with subtle mask fade */}
      <div
        className="absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.07) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
          maskImage: 'radial-gradient(ellipse 80% 60% at 50% 30%, black 20%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse 80% 60% at 50% 30%, black 20%, transparent 100%)',
        }}
      />

      {/* Fine analog noise texture for physical surface depth */}
      <div
        className="absolute inset-0 opacity-[0.025] mix-blend-overlay"
        style={{
          backgroundImage:
            'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.75%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")',
        }}
      />
    </div>
  );
});

Background.displayName = 'Background';

export default Background;
