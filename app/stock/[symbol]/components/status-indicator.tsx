'use client';

import { RefreshCw } from 'lucide-react';

import { Button } from '@/components/ui/button';

interface StatusIndicatorProps {
	lastUpdated: string;
	lastChartUpdated: string;
	stopAutoRefresh: boolean;
	error: string | null;
	loading: boolean;
	range: string;
	realTimeData: any | null;
	onRefresh: () => void;
}

export default function StatusIndicator({
	lastUpdated,
	lastChartUpdated,
	stopAutoRefresh,
	error,
	loading,
	range,
	realTimeData,
	onRefresh,
}: StatusIndicatorProps) {
	return (
		<>
			{/* 显示最后更新时间 */}
			{lastUpdated && !stopAutoRefresh && (
				<div className='text-xs text-right text-gray-500 mt-4'>
					{range === '1d' &&
					realTimeData?.marketState === 'REGULAR' ? (
						<>
							Prices updated: {lastUpdated}
							{lastChartUpdated &&
								` • Chart updated: ${lastChartUpdated}`}
							{realTimeData?.marketState === 'REGULAR' && (
								<span className='ml-1 text-green-500'>
									• Live
								</span>
							)}
						</>
					) : (
						<>Last updated: {lastUpdated}</>
					)}
				</div>
			)}

			{/* 如果自动刷新被停止但界面未完全切换到错误页面，显示错误状态 */}
			{stopAutoRefresh && error && !loading && (
				<div className='flex justify-end items-center mt-4 gap-2'>
					<span className='text-sm text-destructive'>{error}</span>
					<Button onClick={onRefresh} variant='outline' size='sm'>
						<RefreshCw className='mr-2 h-4 w-4' />
						Retry
					</Button>
				</div>
			)}
		</>
	);
}
