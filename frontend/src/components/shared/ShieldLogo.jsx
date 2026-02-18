import { Shield } from 'lucide-react';

const ShieldLogo = ({ 
    size = "md", 
    className = "",
    iconClassName = "text-indigo-400"
}) => {
    const sizeClasses = {
        sm: { container: "w-8 h-8 rounded-lg", icon: "w-4 h-4" },
        md: { container: "w-10 h-10 rounded-xl", icon: "w-5 h-5" },
        lg: { container: "w-20 h-20 rounded-2xl", icon: "w-10 h-10" }
    };

    const { container, icon } = sizeClasses[size] || sizeClasses.md;

    return (
        <div className={`relative ${container} bg-white/5 border border-white/10 flex items-center justify-center shadow-lg backdrop-blur-sm transition-transform duration-300 ${className}`}>
             <Shield className={`${icon} ${iconClassName}`} />
        </div>
    );
};

export default ShieldLogo;
