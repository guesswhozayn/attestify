/**
 * SectionHeader
 * Centered large heading + subtitle for marketing page sections.
 *
 * Props:
 *   prefix    {string}  Plain text before the gradient highlight. Optional.
 *   highlight {string}  The gradient-coloured word/phrase.
 *   suffix    {string}  Plain text after the highlight. Optional.
 *   subtitle  {string}  Smaller grey paragraph below heading.
 *   gradient  {string}  Tailwind gradient classes for the highlight span.
 *                       Defaults to indigo→emerald→indigo.
 *   mb        {string}  Bottom margin class on wrapper. Defaults to 'mb-20'.
 *   children  {React.ReactNode}  Rendered instead of the default h-tag when
 *                       full custom heading markup is needed.
 */
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
