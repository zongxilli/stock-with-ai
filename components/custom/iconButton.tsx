'use client';

import React from 'react';

import { cn } from '@/lib/utils';

interface IconButtonProps
	extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	children: React.ReactNode;
}

const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
	({ className, children, ...props }, ref) => {
		return (
			<button
				className={cn(
					'w-10 h-10 m-auto rounded-full transition-colors hover:bg-muted flex items-center justify-center',
					className
				)}
				ref={ref}
				{...props}
			>
				{children}
			</button>
		);
	}
);

IconButton.displayName = 'IconButton';

export { IconButton };
