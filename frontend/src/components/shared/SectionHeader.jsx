const SectionHeader = ({
  prefix,
  highlight,
  suffix,
  subtitle,
  gradient = 'from-indigo-400 via-emerald-300 to-indigo-400',
  mb = 'mb-20',
  children,
}) => (
  <div className={`text-center ${mb}`}>
    {children ? (
      children
    ) : (
      <h2 className="text-5xl sm:text-6xl md:text-8xl font-bold text-white mb-6 tracking-tighter">
        {prefix && `${prefix} `}
        {highlight && (
          <span
            className={`text-transparent bg-clip-text bg-gradient-to-r ${gradient}`}
          >
            {highlight}
          </span>
        )}
        {suffix && ` ${suffix}`}
      </h2>
    )}
    {subtitle && (
      <p className="text-gray-400 max-w-2xl mx-auto text-xl">{subtitle}</p>
    )}
  </div>
);

export default SectionHeader;
