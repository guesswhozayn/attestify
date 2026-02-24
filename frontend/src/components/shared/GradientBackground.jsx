const GradientBackground = ({ className = '' }) => {
  return (
    <div className={`fixed inset-0 overflow-hidden pointer-events-none -z-10 ${className}`}>
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-600/10 rounded-full blur-[120px]" />
      <div className="absolute top-[40%] right-[20%] w-[30%] h-[30%] bg-emerald-500/10 rounded-full blur-[100px]" />
    </div>
  );
};

export default GradientBackground;
