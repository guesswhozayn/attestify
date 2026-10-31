import { useState, useRef, forwardRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { ArrowRight, Download } from 'lucide-react';
import { toPng } from 'html-to-image';
import AttestifyLogoMark from '../components/shared/AttestifyLogoMark';

const CONTRACT_ADDRESS = '0x71C9F4E5A8325608C5D3081E6160F5F68a64B839';
const POSTER_FONT = "'Poppins', sans-serif";

const PARTNERS = [
  { name: 'PHEC', src: '/phec-logo.png', label: 'Punjab Higher Education Commission' },
  { name: 'Honahar', src: '/honahar-logo.png', label: 'Honahar Scholarship Program' },
  { name: 'Pintech', src: '/pintech-logo.png', label: 'Pintech Innovation' }
];

export default function Poster() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');
  const [zoomLevel, setZoomLevel] = useState(1);
  const [downloading, setDownloading] = useState(null);

  const poster3x3Ref = useRef(null);
  const poster3x8Ref = useRef(null);
  const poster2x5Ref = useRef(null);

  const verifyUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/verify`
    : 'https://attestify.co/verify';

  const downloadPoster = async (format) => {
    const refMap = {
      '3x3': poster3x3Ref,
      '3x8': poster3x8Ref,
      '2x5': poster2x5Ref
    };
    const targetFormat = format || (activeTab === 'all' ? '3x3' : activeTab);
    const targetRef = refMap[targetFormat];
    if (!targetRef?.current) return;

    try {
      setDownloading(targetFormat);
      const dataUrl = await toPng(targetRef.current, {
        pixelRatio: 4,
        cacheBust: true,
        quality: 1.0,
        backgroundColor: '#ffffff'
      });
      const link = document.createElement('a');
      link.download = `attestify-poster-${targetFormat}-${Date.now()}.png`;
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
      className="min-h-screen bg-zinc-100 text-zinc-900"
      style={{ fontFamily: POSTER_FONT }}
    >
      <header className="sticky top-0 z-50 px-4 py-3 bg-white/95 backdrop-blur-md border-b border-zinc-200 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 font-sans">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200 text-xs font-medium text-zinc-700 bg-white hover:bg-zinc-50 transition-colors cursor-pointer"
            >
              <ArrowRight className="w-3.5 h-3.5 rotate-180" /> Back
            </button>
            <div className="h-4 w-px bg-zinc-200" />
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Exhibition posters
            </span>
          </div>

          <div className="flex items-center gap-1 p-1 rounded-xl bg-zinc-100 border border-zinc-200 text-xs">
            {[
              { id: 'all', label: 'All sizes' },
              { id: '3x3', label: '3×3' },
              { id: '3x8', label: '3×8' },
              { id: '2x5', label: '2×5' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-1 px-2 py-1 rounded-lg border border-zinc-200 bg-white text-xs text-zinc-600">
              <button
                onClick={() => setZoomLevel((z) => Math.max(0.6, z - 0.1))}
                className="px-1.5 hover:text-purple-600 cursor-pointer"
                title="Zoom out"
              >
                -
              </button>
              <span className="w-10 text-center font-mono text-[11px]">
                {Math.round(zoomLevel * 100)}%
              </span>
              <button
                onClick={() => setZoomLevel((z) => Math.min(1.4, z + 0.1))}
                className="px-1.5 hover:text-purple-600 cursor-pointer"
                title="Zoom in"
              >
                +
              </button>
            </div>

            <button
              onClick={() => downloadPoster(activeTab === 'all' ? '3x3' : activeTab)}
              disabled={downloading !== null}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-60"
            >
              <Download className="w-3.5 h-3.5" />
              {downloading ? 'Exporting...' : 'Download PNG'}
            </button>
          </div>
        </div>
      </header>

      <main
        className="max-w-[1400px] mx-auto p-4 sm:p-8 flex flex-col items-center gap-12"
        style={{
          transform: `scale(${zoomLevel})`,
          transformOrigin: 'top center',
          transition: 'transform 0.15s ease-out'
        }}
      >
        {(activeTab === 'all' || activeTab === '3x3') && (
          <section className="w-full max-w-[960px] flex flex-col items-center">
            <div className="w-full flex items-center justify-between mb-2 text-xs text-zinc-500 px-2 font-sans">
              <span className="font-semibold text-purple-700">
                3×3 square poster
              </span>
              <button
                onClick={() => downloadPoster('3x3')}
                disabled={downloading === '3x3'}
                className="hover:text-purple-700 font-medium cursor-pointer inline-flex items-center gap-1.5 disabled:opacity-60"
              >
                <Download className="w-3.5 h-3.5" />
                {downloading === '3x3' ? 'Exporting...' : 'Download 3×3 PNG'}
              </button>
            </div>
            <Poster3x3 ref={poster3x3Ref} verifyUrl={verifyUrl} />
          </section>
        )}

        {(activeTab === 'all' || activeTab === '3x8') && (
          <section className="w-full max-w-[500px] flex flex-col items-center">
            <div className="w-full flex items-center justify-between mb-2 text-xs text-zinc-500 px-2 font-sans">
              <span className="font-semibold text-purple-700">
                3×8 tall banner
              </span>
              <button
                onClick={() => downloadPoster('3x8')}
                disabled={downloading === '3x8'}
                className="hover:text-purple-700 font-medium cursor-pointer inline-flex items-center gap-1.5 disabled:opacity-60"
              >
                <Download className="w-3.5 h-3.5" />
                {downloading === '3x8' ? 'Exporting...' : 'Download 3×8 PNG'}
              </button>
            </div>
            <Poster3x8 ref={poster3x8Ref} verifyUrl={verifyUrl} />
          </section>
        )}

        {(activeTab === 'all' || activeTab === '2x5') && (
          <section className="w-full max-w-[540px] flex flex-col items-center">
            <div className="w-full flex items-center justify-between mb-2 text-xs text-zinc-500 px-2 font-sans">
              <span className="font-semibold text-purple-700">
                2×5 standing banner
              </span>
              <button
                onClick={() => downloadPoster('2x5')}
                disabled={downloading === '2x5'}
                className="hover:text-purple-700 font-medium cursor-pointer inline-flex items-center gap-1.5 disabled:opacity-60"
              >
                <Download className="w-3.5 h-3.5" />
                {downloading === '2x5' ? 'Exporting...' : 'Download 2×5 PNG'}
              </button>
            </div>
            <Poster2x5 ref={poster2x5Ref} verifyUrl={verifyUrl} />
          </section>
        )}
      </main>
    </div>
  );
}

function AttestifyLogo({ size = 'default' }) {
  const isLarge = size === 'large';
  return (
    <div className="flex items-center gap-3">
      <AttestifyLogoMark className={`${isLarge ? 'w-8 h-8 sm:w-10 sm:h-10' : 'w-6 h-6'} shrink-0`} />
      <div className="flex flex-col">
        <span
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          className={`font-bold tracking-tight lowercase text-zinc-900 ${
            isLarge ? 'text-3xl sm:text-4xl' : 'text-2xl'
          }`}
        >
          attestify
        </span>
        <span className="text-[10px] text-zinc-500 tracking-wide font-sans">
          Academic credential verification
        </span>
      </div>
    </div>
  );
}

function TopPartnerLogos({ size = 'large' }) {
  const heightClass = size === 'large'
    ? 'h-16 sm:h-20 max-w-[130px] sm:max-w-[180px]'
    : 'h-12 sm:h-16 max-w-[100px] sm:max-w-[140px]';

  return (
    <div className="flex items-center justify-center gap-6 sm:gap-12 w-full select-none">
      {PARTNERS.map((partner) => (
        <img
          key={partner.name}
          src={partner.src}
          alt={partner.name}
          className={`${heightClass} w-auto object-contain`}
        />
      ))}
    </div>
  );
}

const Poster3x3 = forwardRef(function Poster3x3({ verifyUrl }, ref) {
  return (
    <article
      ref={ref}
      style={{ fontFamily: POSTER_FONT }}
      className="w-full aspect-square bg-white border border-zinc-200 rounded-3xl p-6 sm:p-10 relative overflow-hidden flex flex-col justify-between select-none shadow-xl"
    >
      <header className="relative z-10 flex flex-col items-center border-b border-zinc-200 pb-5 gap-4">
        <TopPartnerLogos size="large" />
        <div className="pt-1">
          <AttestifyLogo size="large" />
        </div>
      </header>

      <section className="relative z-10 my-auto py-5 space-y-5">
        <div className="max-w-xl">
          <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-zinc-900 leading-tight">
            Zero fake degrees.
          </h2>
          <p className="text-xs sm:text-sm text-zinc-600 mt-2 leading-relaxed">
            Instant academic verification for universities, employers, and graduates.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200">
            <div className="text-2xl sm:text-3xl font-extrabold text-purple-600">1s</div>
            <div className="text-xs font-semibold text-zinc-900 mt-1">Verification speed</div>
            <p className="text-[11px] text-zinc-500 mt-1 leading-relaxed">
              Confirm validity with any smartphone camera.
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200">
            <div className="text-2xl sm:text-3xl font-extrabold text-purple-600">100%</div>
            <div className="text-xs font-semibold text-zinc-900 mt-1">Tamper proof</div>
            <p className="text-[11px] text-zinc-500 mt-1 leading-relaxed">
              Impossible to alter or duplicate on-chain records.
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200">
            <div className="text-2xl sm:text-3xl font-extrabold text-purple-600">Free</div>
            <div className="text-xs font-semibold text-zinc-900 mt-1">Public access</div>
            <p className="text-[11px] text-zinc-500 mt-1 leading-relaxed">
              No subscription, login, or fees required.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200">
            <div className="text-xs font-semibold text-zinc-900">Universities</div>
            <p className="text-[10px] text-zinc-600 mt-0.5">Issue credentials without paperwork</p>
          </div>
          <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200">
            <div className="text-xs font-semibold text-zinc-900">Employers</div>
            <p className="text-[10px] text-zinc-600 mt-0.5">Confirm candidate degrees on the spot</p>
          </div>
          <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200">
            <div className="text-xs font-semibold text-zinc-900">Graduates</div>
            <p className="text-[10px] text-zinc-600 mt-0.5">Own verifiable proof forever</p>
          </div>
        </div>
      </section>

      <footer className="relative z-10 border-t border-zinc-200 pt-4 flex items-center justify-between gap-6">
        <div>
          <div className="text-xs font-semibold text-zinc-800">Ethereum Sepolia smart contract</div>
          <div className="text-xs font-mono text-zinc-500 mt-0.5">
            {CONTRACT_ADDRESS}
          </div>
        </div>

        <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-zinc-50 border border-zinc-200">
          <div className="bg-white p-1.5 rounded-xl border border-zinc-200 shadow-2xs">
            <QRCodeSVG value={verifyUrl} size={54} bgColor="#ffffff" fgColor="#08090d" level="M" />
          </div>
          <div>
            <div className="text-xs font-semibold text-zinc-900">Scan to verify</div>
            <p className="text-[10px] text-zinc-500">Test with your phone camera</p>
          </div>
        </div>
      </footer>
    </article>
  );
});

const Poster3x8 = forwardRef(function Poster3x8({ verifyUrl }, ref) {
  return (
    <article
      ref={ref}
      style={{ fontFamily: POSTER_FONT }}
      className="w-full aspect-[3/8] bg-white border border-zinc-200 rounded-3xl p-8 sm:p-10 relative overflow-hidden flex flex-col justify-between select-none shadow-xl"
    >
      <header className="relative z-10 text-center border-b border-zinc-200 pb-6 flex flex-col items-center gap-5">
        <TopPartnerLogos size="medium" />
        <div className="pt-1">
          <AttestifyLogo />
        </div>
      </header>

      <section className="relative z-10 my-auto py-6 space-y-6">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-zinc-900 leading-tight">
            Zero fake degrees.
          </h2>
          <p className="text-xs text-zinc-600 mt-2 leading-relaxed">
            Replacing fragile paper documents with tamper-proof blockchain verification.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200">
            <div className="text-3xl font-extrabold text-purple-600">1s</div>
            <div className="text-xs font-semibold text-zinc-900 mt-1">Verification</div>
            <div className="text-[11px] text-zinc-500">Camera scan</div>
          </div>
          <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200">
            <div className="text-3xl font-extrabold text-purple-600">Free</div>
            <div className="text-xs font-semibold text-zinc-900 mt-1">Access</div>
            <div className="text-[11px] text-zinc-500">No fees</div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-xs font-semibold text-zinc-800">Stakeholder impact</div>
          <div className="p-3 rounded-2xl bg-zinc-50 border border-zinc-200 text-xs">
            <span className="font-semibold text-purple-700">Universities:</span>
            <span className="text-zinc-600"> Issue without manual paperwork.</span>
          </div>
          <div className="p-3 rounded-2xl bg-zinc-50 border border-zinc-200 text-xs">
            <span className="font-semibold text-purple-700">Employers:</span>
            <span className="text-zinc-600"> Confirm qualifications instantly.</span>
          </div>
          <div className="p-3 rounded-2xl bg-zinc-50 border border-zinc-200 text-xs">
            <span className="font-semibold text-purple-700">Graduates:</span>
            <span className="text-zinc-600"> Own verifiable proof forever.</span>
          </div>
        </div>
      </section>

      <footer className="relative z-10 border-t border-zinc-200 pt-6 text-center">
        <div className="bg-white p-2.5 rounded-2xl w-fit mx-auto mb-2.5 border border-zinc-200 shadow-xs">
          <QRCodeSVG
            value={verifyUrl}
            size={90}
            bgColor="#ffffff"
            fgColor="#08090d"
            level="M"
          />
        </div>
        <div className="text-xs font-semibold text-zinc-900">Scan to verify</div>
        <p className="text-[11px] text-zinc-500 mt-0.5">
          Open your phone camera to test live
        </p>
      </footer>
    </article>
  );
});

const Poster2x5 = forwardRef(function Poster2x5({ verifyUrl }, ref) {
  return (
    <article
      ref={ref}
      style={{ fontFamily: POSTER_FONT }}
      className="w-full aspect-[2/5] bg-white border border-zinc-200 rounded-3xl p-8 sm:p-10 relative overflow-hidden flex flex-col justify-between select-none shadow-xl"
    >
      <header className="relative z-10 text-center border-b border-zinc-200 pb-6 flex flex-col items-center gap-5">
        <TopPartnerLogos size="medium" />
        <div className="pt-1">
          <AttestifyLogo />
        </div>
      </header>

      <section className="relative z-10 my-auto py-6 space-y-6">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-zinc-900 leading-tight">
            Zero fake degrees.
          </h2>
          <p className="text-xs text-zinc-600 mt-2 leading-relaxed">
            Permanent academic credentials verified in 1 second with a smartphone camera.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200">
            <div className="text-3xl font-extrabold text-purple-600">1s</div>
            <div className="text-xs font-semibold text-zinc-900 mt-1">Verification speed</div>
            <p className="text-[11px] text-zinc-500 mt-1 leading-relaxed">
              Camera scan
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200">
            <div className="text-3xl font-extrabold text-purple-600">Free</div>
            <div className="text-xs font-semibold text-zinc-900 mt-1">Public access</div>
            <p className="text-[11px] text-zinc-500 mt-1 leading-relaxed">
              Zero fees
            </p>
          </div>
        </div>

        <div className="space-y-2.5">
          <div className="text-xs font-semibold text-zinc-800">Stakeholder impact</div>
          <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200">
            <div className="text-xs font-semibold text-zinc-900">For universities</div>
            <p className="text-[11px] text-zinc-600 mt-0.5">
              Issue credentials individually or in bulk without manual paperwork.
            </p>
          </div>
          <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200">
            <div className="text-xs font-semibold text-zinc-900">For employers</div>
            <p className="text-[11px] text-zinc-600 mt-0.5">
              Confirm an applicant degree instantly without calling registrars.
            </p>
          </div>
          <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200">
            <div className="text-xs font-semibold text-zinc-900">For students</div>
            <p className="text-[11px] text-zinc-600 mt-0.5">
              Keep permanent digital proof of graduation in your own custody.
            </p>
          </div>
        </div>
      </section>

      <footer className="relative z-10 border-t border-zinc-200 pt-6 text-center">
        <div className="bg-white p-2.5 rounded-2xl w-fit mx-auto mb-2.5 border border-zinc-200 shadow-xs">
          <QRCodeSVG
            value={verifyUrl}
            size={90}
            bgColor="#ffffff"
            fgColor="#08090d"
            level="M"
          />
        </div>
        <div className="text-xs font-semibold text-zinc-900">Scan to verify</div>
        <p className="text-[11px] text-zinc-500 mt-0.5">
          Point your camera to verify a sample certificate
        </p>
      </footer>
    </article>
  );
});
