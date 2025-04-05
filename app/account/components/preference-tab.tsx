'use client';

import { useCallback, useEffect, useState } from 'react';

import {
	getCurrentUserProfile,
	updateUserPreference,
} from '@/app/actions/user/user-actions';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { UserPreference } from '@/prisma/types/user-types';

export function PreferenceTab() {
	const { toast } = useToast();
	const [userPreference, setUserPreference] = useState<UserPreference | null>(
		null
	);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);

	// 获取用户偏好
	const fetchUserPreference = useCallback(async () => {
		setLoading(true);
		try {
			const userProfile = await getCurrentUserProfile();
			if (userProfile && userProfile.preference) {
				setUserPreference(userProfile.preference);
			}
		} catch (error) {
			console.error('获取用户偏好出错:', error);
			toast({
				title: '错误',
				description: '获取用户偏好失败',
				variant: 'destructive',
			});
		} finally {
			setLoading(false);
		}
	}, [toast]);

	// 初始加载
	useEffect(() => {
		fetchUserPreference();
	}, [fetchUserPreference]);

	// 更新主题
	const handleThemeChange = async (checked: boolean) => {
		const newTheme = checked ? 'dark' : 'light';

		try {
			setSaving(true);
			await updateUserPreference({ theme: newTheme });
			setUserPreference((prev) =>
				prev ? { ...prev, theme: newTheme } : null
			);
			toast({
				title: '成功',
				description: '主题更新成功',
			});
		} catch (error) {
			console.error('更新主题出错:', error);
			toast({
				title: '错误',
				description: '更新主题失败',
				variant: 'destructive',
			});
		} finally {
			setSaving(false);
		}
	};

	// 更新语言
	const handleLanguageChange = async (value: string) => {
		const newLanguage = value as 'EN' | 'CN';

		try {
			setSaving(true);
			await updateUserPreference({ language: newLanguage });
			setUserPreference((prev) =>
				prev ? { ...prev, language: newLanguage } : null
			);
			toast({
				title: '成功',
				description: '语言更新成功',
			});
		} catch (error) {
			console.error('更新语言出错:', error);
			toast({
				title: '错误',
				description: '更新语言失败',
				variant: 'destructive',
			});
		} finally {
			setSaving(false);
		}
	};

	// 更新技术指标偏好
	const handleTechnicalIndicatorChange = async (
		indicator: keyof UserPreference['technicalIndicators'],
		checked: boolean
	) => {
		if (!userPreference) return;

		try {
			setSaving(true);

			// 创建完整的技术指标对象
			const updatedTechnicalIndicators = {
				...userPreference.technicalIndicators,
				[indicator]: checked,
			};

			await updateUserPreference({
				technicalIndicators: updatedTechnicalIndicators,
			});

			setUserPreference((prev) =>
				prev
					? {
							...prev,
							technicalIndicators: {
								...prev.technicalIndicators,
								[indicator]: checked,
							},
						}
					: null
			);

			toast({
				title: '成功',
				description: '技术指标偏好更新成功',
			});
		} catch (error) {
			console.error('更新技术指标偏好出错:', error);
			toast({
				title: '错误',
				description: '更新技术指标偏好失败',
				variant: 'destructive',
			});
		} finally {
			setSaving(false);
		}
	};

	// 定义技术指标组
	const technicalIndicatorGroups = [
		{
			title: '移动平均线',
			indicators: [
				{ key: 'sma' as const, name: '简单移动平均线 (SMA)' },
				{ key: 'ema' as const, name: '指数移动平均线 (EMA)' },
				{ key: 'wma' as const, name: '加权移动平均线 (WMA)' },
			],
		},
		{
			title: '震荡指标',
			indicators: [
				{ key: 'rsi' as const, name: '相对强弱指数 (RSI)' },
				{ key: 'macd' as const, name: '移动平均收敛/发散 (MACD)' },
				{ key: 'stochastic' as const, name: '随机指标 (Stochastic)' },
				{
					key: 'stochasticRSI' as const,
					name: '随机相对强弱指数 (Stochastic RSI)',
				},
				{ key: 'cci' as const, name: '顺势指标 (CCI)' },
			],
		},
		{
			title: '波动性指标',
			indicators: [
				{
					key: 'bollingerBands' as const,
					name: '布林带 (Bollinger Bands)',
				},
				{ key: 'atr' as const, name: '真实波幅 (ATR)' },
				{ key: 'volatility' as const, name: '波动率 (Volatility)' },
				{ key: 'stdDev' as const, name: '标准差 (Standard Deviation)' },
			],
		},
		{
			title: '趋势指标',
			indicators: [
				{ key: 'dmi' as const, name: '方向运动指标 (DMI)' },
				{ key: 'adx' as const, name: '平均方向指数 (ADX)' },
				{ key: 'sar' as const, name: '抛物线指标 (SAR)' },
				{ key: 'slope' as const, name: '斜率指标 (Slope)' },
			],
		},
		{
			title: '其他指标',
			indicators: [
				{ key: 'beta' as const, name: '贝塔系数 (Beta)' },
				{
					key: 'averageVolume' as const,
					name: '平均成交量 (Avg Volume)',
				},
				{
					key: 'averageVolumeByPrice' as const,
					name: '价格加权平均成交量 (Avg Volume by Price)',
				},
				{
					key: 'splitAdjusted' as const,
					name: '股票拆分调整数据 (Split Adjusted)',
				},
			],
		},
	];

	if (loading) {
		return <div className='flex justify-center py-10'>加载中...</div>;
	}

	return (
		<div className='space-y-6'>
			<div className='text-xl font-semibold'>偏好设置</div>

			{/* 基本设置 */}
			<Card>
				<CardContent className='pt-6'>
					<h3 className='text-lg font-medium mb-4'>基本设置</h3>

					<div className='space-y-4'>
						<div className='flex items-center justify-between'>
							<div className='space-y-0.5'>
								<Label htmlFor='dark-mode'>深色模式</Label>
								<p className='text-sm text-muted-foreground'>
									在亮色和深色模式之间切换
								</p>
							</div>
							<Switch
								id='dark-mode'
								checked={userPreference?.theme === 'dark'}
								onCheckedChange={handleThemeChange}
								disabled={saving}
							/>
						</div>

						<Separator />

						<div className='flex items-center justify-between'>
							<div className='space-y-0.5'>
								<Label htmlFor='language'>语言</Label>
								<p className='text-sm text-muted-foreground'>
									设置界面显示语言
								</p>
							</div>
							<Select
								value={userPreference?.language || 'CN'}
								onValueChange={handleLanguageChange}
								disabled={saving}
							>
								<SelectTrigger className='w-[100px]'>
									<SelectValue placeholder='选择语言' />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value='CN'>中文</SelectItem>
									<SelectItem value='EN'>English</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* 技术指标设置 */}
			<Card>
				<CardContent className='pt-6'>
					<h3 className='text-lg font-medium mb-4'>技术指标偏好</h3>
					<p className='text-sm text-muted-foreground mb-6'>
						选择您想在分析中显示的技术指标。启用的指标将在股票详情页面中显示。
					</p>

					<div className='space-y-6'>
						{technicalIndicatorGroups.map((group) => (
							<div key={group.title} className='space-y-3'>
								<h4 className='font-medium'>{group.title}</h4>

								<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
									{group.indicators.map((indicator) => (
										<div
											key={indicator.key}
											className='flex items-center justify-between space-x-2'
										>
											<Label
												htmlFor={indicator.key}
												className='cursor-pointer'
											>
												{indicator.name}
											</Label>
											<Switch
												id={indicator.key}
												checked={
													userPreference
														?.technicalIndicators?.[
														indicator.key
													] || false
												}
												onCheckedChange={(checked) =>
													handleTechnicalIndicatorChange(
														indicator.key,
														checked
													)
												}
												disabled={saving}
											/>
										</div>
									))}
								</div>

								{group !==
									technicalIndicatorGroups[
										technicalIndicatorGroups.length - 1
									] && <Separator className='my-2' />}
							</div>
						))}
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
