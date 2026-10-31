import { useState, useRef, forwardRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Download } from 'lucide-react';
import { toPng } from 'html-to-image';
import Logo from '../components/shared/Logo';

const POSTER_FONT = "'Poppins', sans-serif";
const TARGET_URL = 'https://useattestify.vercel.app';

const PINTECH_PARTNERS = [
  { name: 'PHEC', src: '/phec-logo.png', label: 'Punjab Higher Education Commission' },
  { name: 'Pintech', src: '/pintech-logo.png', label: 'Pintech Innovation & Technology Expo 2026' },
  { name: 'Honahar', src: '/honahar-logo.png', label: 'Chief Minister Honahar Scholarship Program' }
];

export default function Poster() {
  const [downloading, setDownloading] = useState(null);

  const poster3x3Ref = useRef(null);
  const poster3x8Ref = useRef(null);
  const poster2x5Ref = useRef(null);

  const downloadPoster = async (format) => {
    const refMap = {
      '3x3': poster3x3Ref,
      '3x8': poster3x8Ref,
      '2x5': poster2x5Ref
    };
    const targetRef = refMap[format];
    if (!targetRef?.current) return;

    try {
      setDownloading(format);
      const dataUrl = await toPng(targetRef.current, {
        pixelRatio: 4,
        cacheBust: true,
        quality: 1.0,
        backgroundColor: '#ffffff'
      });
      const link = document.createElement('a');
      link.download = `attestify-expo-${format}-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to export poster PNG:', err);
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div
      className="min-h-screen bg-zinc-100 text-zinc-900 py-10 px-4 sm:px-6"
      style={{ fontFamily: POSTER_FONT }}
    >
      <main className="max-w-[1400px] mx-auto flex flex-col items-center gap-14">
        {/* Reception Desk (3x3) */}
        <section className="relative w-full max-w-[960px] flex flex-col items-center">
          <div className="w-full flex items-center justify-end mb-2.5 px-1">
            <button
              onClick={() => downloadPoster('3x3')}
              disabled={downloading === '3x3'}
              title="Download 3×3 poster (PNG)"
              aria-label="Download 3×3 poster"
              className="p-2 rounded-lg bg-white border border-zinc-200 shadow-xs text-zinc-700 hover:text-purple-600 hover:border-purple-300 transition-colors cursor-pointer disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
          <ExpoTemplate3x3 ref={poster3x3Ref} targetUrl={TARGET_URL} />
        </section>

        {/* Backdrop (3x8) */}
        <section className="relative w-full max-w-[500px] flex flex-col items-center">
          <div className="w-full flex items-center justify-end mb-2.5 px-1">
            <button
              onClick={() => downloadPoster('3x8')}
              disabled={downloading === '3x8'}
              title="Download 3×8 banner (PNG)"
              aria-label="Download 3×8 banner"
              className="p-2 rounded-lg bg-white border border-zinc-200 shadow-xs text-zinc-700 hover:text-purple-600 hover:border-purple-300 transition-colors cursor-pointer disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
          <ExpoTemplate3x8 ref={poster3x8Ref} targetUrl={TARGET_URL} />
        </section>

        {/* Standee (2x5) */}
        <section className="relative w-full max-w-[540px] flex flex-col items-center">
          <div className="w-full flex items-center justify-end mb-2.5 px-1">
            <button
              onClick={() => downloadPoster('2x5')}
              disabled={downloading === '2x5'}
              title="Download 2×5 banner (PNG)"
              aria-label="Download 2×5 banner"
              className="p-2 rounded-lg bg-white border border-zinc-200 shadow-xs text-zinc-700 hover:text-purple-600 hover:border-purple-300 transition-colors cursor-pointer disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
          <ExpoTemplate2x5 ref={poster2x5Ref} targetUrl={TARGET_URL} />
        </section>
      </main>
    </div>
  );
}

function ExpoCornerRibbons() {
  return (
    <>
      <svg
        viewBox="0 0 160 160"
        className="absolute top-0 left-0 w-32 h-32 sm:w-44 sm:h-44 pointer-events-none z-10"
      >
        {/* Outer green diagonal stripe closer to red stripe */}
        <polygon points="44,0 72,0 0,72 0,44" fill="#15803d" />
        {/* Inner red diagonal stripe */}
        <polygon points="80,0 108,0 0,108 0,80" fill="#dc2626" />
      </svg>
      <svg
        viewBox="0 0 160 160"
        className="absolute bottom-0 right-0 w-32 h-32 sm:w-44 sm:h-44 pointer-events-none z-10"
      >
        {/* Outer green diagonal stripe closer to red stripe */}
        <polygon points="116,160 88,160 160,88 160,116" fill="#15803d" />
        {/* Inner red diagonal stripe */}
        <polygon points="80,160 52,160 160,52 160,80" fill="#dc2626" />
      </svg>
    </>
  );
}

function ExpoSponsorRow({ size = 'large' }) {
  const isLarge = size === 'large';

  return (
    <div
      className={`flex items-center justify-center ${
        isLarge ? 'gap-6 sm:gap-10 max-w-2xl' : 'gap-3.5 sm:gap-6 max-w-sm sm:max-w-md'
      } w-full mx-auto px-4 select-none`}
    >
      {PINTECH_PARTNERS.map((partner) => {
        const isHonahar = partner.name === 'Honahar';
        const heightClass = isLarge
          ? isHonahar
            ? 'h-16 sm:h-22 max-w-[120px] sm:max-w-[170px]'
            : 'h-24 sm:h-32 max-w-[160px] sm:max-w-[240px]'
          : isHonahar
            ? 'h-11 sm:h-15 max-w-[85px] sm:max-w-[120px]'
            : 'h-18 sm:h-24 max-w-[120px] sm:max-w-[180px]';

        return (
          <img
            key={partner.name}
            src={partner.src}
            alt={partner.name}
            className={`${heightClass} w-auto object-contain shrink-0`}
          />
        );
      })}
    </div>
  );
}

const ExpoTemplate3x3 = forwardRef(function ExpoTemplate3x3({ targetUrl }, ref) {
  return (
    <article
      ref={ref}
      style={{
        fontFamily: POSTER_FONT,
        background: 'radial-gradient(circle at 12% 15%, rgba(254, 226, 226, 0.45), transparent 45%), radial-gradient(circle at 88% 85%, rgba(209, 250, 229, 0.45), transparent 45%), #ffffff'
      }}
      className="w-full aspect-square border border-zinc-200 rounded-3xl p-6 sm:p-10 relative overflow-hidden flex flex-col justify-between select-none shadow-xl text-center"
    >
      <ExpoCornerRibbons />

      <header className="relative z-10 w-full pt-1">
        <ExpoSponsorRow size="large" />
      </header>

      <section className="relative z-10 my-auto flex flex-col items-center justify-center space-y-5">
        <div className="w-full max-w-3xl px-4 text-center flex flex-col items-center">
          <Logo className="w-20 h-20 sm:w-28 sm:h-28 shrink-0 drop-shadow-sm mb-3 sm:mb-4" />
          <h1
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            className="text-5xl sm:text-6xl md:text-7xl font-black lowercase tracking-tight text-black leading-none mb-2"
          >
            attestify
          </h1>
          <h2 className="text-xs sm:text-sm md:text-base font-semibold uppercase tracking-widest text-zinc-600">
            Decentralized Academic Credentials
          </h2>
        </div>

        <div className="flex flex-col items-center pt-1">
          <img
            src="/uoc-logo.png"
            alt="University of Chakwal"
            className="h-32 sm:h-44 w-auto object-contain drop-shadow-xs mb-3"
          />
          <h3 className="text-2xl sm:text-3xl font-extrabold text-[#1e293b] tracking-tight">
            University of Chakwal
          </h3>
        </div>

        <div className="w-full max-w-xs sm:max-w-md">
          <div className="h-[3px] w-52 sm:w-72 bg-[#dc2626] mx-auto rounded-full mb-2" />
          <div className="text-sm sm:text-base font-semibold text-[#1e293b] tracking-wide">
            Punjab Higher Education Commission
          </div>
        </div>
      </section>

      <footer className="relative z-10 w-full pb-2 flex items-center justify-center">
        <div className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-white/95 border border-zinc-200 shadow-xs">
          <QRCodeSVG value={targetUrl} size={54} bgColor="#ffffff" fgColor="#08090d" level="M" />
          <div className="text-left font-sans">
            <div className="text-xs font-bold text-zinc-900 leading-tight">Scan to Open App</div>
            <div className="text-[11px] font-mono font-medium text-emerald-700">useattestify.vercel.app</div>
          </div>
        </div>
      </footer>
    </article>
  );
});

const ExpoTemplate3x8 = forwardRef(function ExpoTemplate3x8({ targetUrl }, ref) {
  return (
    <article
      ref={ref}
      style={{
        fontFamily: POSTER_FONT,
        background: 'radial-gradient(circle at 15% 15%, rgba(254, 226, 226, 0.5), transparent 45%), radial-gradient(circle at 85% 85%, rgba(209, 250, 229, 0.5), transparent 45%), #ffffff'
      }}
      className="w-full aspect-[3/8] border border-zinc-200 rounded-3xl p-6 sm:p-10 relative overflow-hidden flex flex-col justify-between select-none shadow-xl text-center"
    >
      <ExpoCornerRibbons />

      <header className="relative z-10 w-full pt-4">
        <ExpoSponsorRow size="medium" />
      </header>

      <section className="relative z-10 my-auto flex flex-col items-center space-y-8 sm:space-y-10">
        <div className="w-full px-4 text-center flex flex-col items-center">
          <Logo className="w-16 h-16 sm:w-24 sm:h-24 shrink-0 drop-shadow-sm mb-3 sm:mb-4" />
          <h1
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            className="text-4xl sm:text-5xl md:text-6xl font-black lowercase tracking-tight text-black leading-none mb-2"
          >
            attestify
          </h1>
          <h2 className="text-xs sm:text-sm font-semibold uppercase tracking-widest text-zinc-600">
            Decentralized Academic Credentials
          </h2>
        </div>

        <div className="flex flex-col items-center">
          <img
            src="/uoc-logo.png"
            alt="University of Chakwal"
            className="h-36 sm:h-48 w-auto object-contain drop-shadow-xs mb-4"
          />
          <h3 className="text-2xl sm:text-3xl font-extrabold text-[#1e293b] tracking-tight">
            University of Chakwal
          </h3>
        </div>

        <div className="w-full max-w-[280px]">
          <div className="h-[3px] w-52 bg-[#dc2626] mx-auto rounded-full mb-3" />
          <div className="text-xs sm:text-sm font-semibold text-[#1e293b] tracking-wide">
            Punjab Higher Education Commission
          </div>
        </div>
      </section>

      <footer className="relative z-10 w-full pb-4 flex flex-col items-center gap-1.5">
        <div className="p-2.5 rounded-2xl bg-white border border-zinc-200 shadow-xs">
          <QRCodeSVG value={targetUrl} size={78} bgColor="#ffffff" fgColor="#08090d" level="M" />
        </div>
        <div className="text-xs font-bold text-zinc-900 leading-tight">Scan to Open App</div>
        <div className="text-[11px] font-mono font-medium text-emerald-700">useattestify.vercel.app</div>
      </footer>
    </article>
  );
});

const ExpoTemplate2x5 = forwardRef(function ExpoTemplate2x5({ targetUrl }, ref) {
  return (
    <article
      ref={ref}
      style={{
        fontFamily: POSTER_FONT,
        background: 'radial-gradient(circle at 15% 15%, rgba(254, 226, 226, 0.5), transparent 45%), radial-gradient(circle at 85% 85%, rgba(209, 250, 229, 0.5), transparent 45%), #ffffff'
      }}
      className="w-full aspect-[2/5] border border-zinc-200 rounded-3xl p-6 sm:p-10 relative overflow-hidden flex flex-col justify-between select-none shadow-xl text-center"
    >
      <ExpoCornerRibbons />

      <header className="relative z-10 w-full pt-4">
        <ExpoSponsorRow size="medium" />
      </header>

      <section className="relative z-10 my-auto flex flex-col items-center space-y-8 sm:space-y-10">
        <div className="w-full px-4 text-center flex flex-col items-center">
          <Logo className="w-20 h-20 sm:w-28 sm:h-28 shrink-0 drop-shadow-sm mb-3 sm:mb-4" />
          <h1
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            className="text-4xl sm:text-5xl md:text-6xl font-black lowercase tracking-tight text-black leading-none mb-2"
          >
            attestify
          </h1>
          <h2 className="text-xs sm:text-sm font-semibold uppercase tracking-widest text-zinc-600">
            Decentralized Academic Credentials
          </h2>
        </div>

        <div className="flex flex-col items-center">
          <img
            src="/uoc-logo.png"
            alt="University of Chakwal"
            className="h-38 sm:h-50 w-auto object-contain drop-shadow-xs mb-4"
          />
          <h3 className="text-2xl sm:text-3xl font-extrabold text-[#1e293b] tracking-tight">
            University of Chakwal
          </h3>
        </div>

        <div className="w-full max-w-[300px]">
          <div className="h-[3px] w-56 bg-[#dc2626] mx-auto rounded-full mb-3" />
          <div className="text-sm font-semibold text-[#1e293b] tracking-wide">
            Punjab Higher Education Commission
          </div>
        </div>
      </section>

      <footer className="relative z-10 w-full pb-4 flex flex-col items-center gap-1.5">
        <div className="p-2.5 rounded-2xl bg-white border border-zinc-200 shadow-xs">
          <QRCodeSVG value={targetUrl} size={84} bgColor="#ffffff" fgColor="#08090d" level="M" />
        </div>
        <div className="text-xs font-bold text-zinc-900 leading-tight">Scan to Open App</div>
        <div className="text-[11px] font-mono font-medium text-emerald-700">useattestify.vercel.app</div>
      </footer>
    </article>
  );
});


