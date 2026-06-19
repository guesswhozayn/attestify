import React from 'react';
import { RefreshCw } from 'lucide-react';
import Button from './Button';

const RefreshButton = ({
    loading = false,
    onClick,
    title = 'Refresh',
    variant = 'secondary',
    rounded = 'full',
    size = 'sm',
    className = '',
    icon: Icon = RefreshCw,
    ...props
}) => {
    return (
        <Button
            onClick={onClick}
            disabled={loading}
            variant={variant}
            rounded={rounded}
            size={size}
            icon={Icon}
            iconClassName={loading ? 'animate-spin' : ''}
            className={`aspect-square !p-0 flex items-center justify-center w-10 h-10 ${className}`}
            title={title}
            loading={loading}
            {...props}
        />
    );
};

export default React.memo(RefreshButton);
