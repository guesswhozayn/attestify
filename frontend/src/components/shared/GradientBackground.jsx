/**
 * GradientBackground
 * Renders the three ambient gradient orbs used on every page.
 *
 * Props:
 *   fixed  {boolean}  Use position:fixed (good for interactive mouse-tracking pages).
 *                     Defaults to false (absolute positioning).
 */
const GradientBackground = ({ fixed = false }) => {
  const posClass = fixed ? 'fixed' : 'absolute';

  return (
    <div className={`${posClass} inset-0 z-0 pointer-events-none overflow-hidden`}>
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] mix-blend-screen" />
      <div className="absolute top-[20%] right-[-5%] w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[120px] mix-blend-screen" />
      <div className="absolute bottom-[-10%] left-[20%] w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-[100px] mix-blend-screen" />
    </div>
  );
};

export default GradientBackground;
