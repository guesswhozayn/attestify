import BrandLogo from './BrandLogo';

const PoweredBy = ({ className = "" }) => {
    return (
        <div className={`flex items-center justify-center gap-2 opacity-50 hover:opacity-100 transition-opacity duration-300 py-8 ${className}`}>
            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Powered by</span>
            <BrandLogo textSize="text-lg" />
        </div>
    );
};

export default PoweredBy;
