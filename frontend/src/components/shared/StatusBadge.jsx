/**
 * StatusBadge
 * The pulsing indigo pill badge used throughout hero and welcome sections.
 *
 * Props:
 *   label     {string}   Text displayed in the badge (uppercased via CSS).
 *   className {string}   Optional extra classes on the wrapper.
 */
const StatusBadge = ({ label, className = '' }) => (
  <div
    className={`inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 backdrop-blur-md ${className}`}
  >
    <span className="relative flex h-2 w-2">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
      <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500" />
    </span>
    <span className="text-xs font-semibold text-indigo-300 uppercase tracking-widest">
      {label}
    </span>
  </div>
);

export default StatusBadge;
