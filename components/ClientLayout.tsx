'use client';

import useWheelNavigation from '@/hooks/useWheelNavigation';
import navigationConfig from '@/nav-config';
import { ReactNode } from 'react';

interface ClientLayoutProps {
	children: ReactNode;
}

const ClientLayout = ({ children }: ClientLayoutProps) => {
	useWheelNavigation(navigationConfig);

	return <>{children}</>;
};

export default ClientLayout;
