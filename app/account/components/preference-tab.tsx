'use client';

import { useCallback, useEffect, useState } from 'react';

import { useTheme } from 'next-themes';

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
	const { setTheme } = useTheme();
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
				title: 'Error',
				description: 'Failed to load user preferences',
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
			// 更新数据库中的主题偏好
			await updateUserPreference({ theme: newTheme });
			// 更新本地状态
			setUserPreference((prev) =>
				prev ? { ...prev, theme: newTheme } : null
			);
			// 同步更新应用主题
			setTheme(newTheme);
			toast({
				title: 'Success',
				description: 'Theme updated successfully',
			});
		} catch (error) {
			console.error('更新主题出错:', error);
			toast({
				title: 'Error',
				description: 'Failed to update theme',
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
				title: 'Success',
				description: 'Language updated successfully',
			});
		} catch (error) {
			console.error('更新语言出错:', error);
			toast({
				title: 'Error',
				description: 'Failed to update language',
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
				title: 'Success',
				description:
					'Technical indicator preferences updated successfully',
			});
		} catch (error) {
			console.error('更新技术指标偏好出错:', error);
			toast({
				title: 'Error',
				description: 'Failed to update technical indicator preferences',
				variant: 'destructive',
			});
		} finally {
			setSaving(false);
		}
	};

	// 定义技术指标组
	const technicalIndicatorGroups = [
		{
			title: 'Moving Averages',
			indicators: [
				{ key: 'sma' as const, name: 'Simple Moving Average (SMA)' },
				{
					key: 'ema' as const,
					name: 'Exponential Moving Average (EMA)',
				},
				{ key: 'wma' as const, name: 'Weighted Moving Average (WMA)' },
			],
		},
		{
			title: 'Oscillators',
			indicators: [
				{ key: 'rsi' as const, name: 'Relative Strength Index (RSI)' },
				{
					key: 'macd' as const,
					name: 'Moving Average Convergence Divergence (MACD)',
				},
				{ key: 'stochastic' as const, name: 'Stochastic Oscillator' },
				{
					key: 'stochasticRSI' as const,
					name: 'Stochastic RSI',
				},
				{ key: 'cci' as const, name: 'Commodity Channel Index (CCI)' },
			],
		},
		{
			title: 'Volatility Indicators',
			indicators: [
				{
					key: 'bollingerBands' as const,
					name: 'Bollinger Bands',
				},
				{ key: 'atr' as const, name: 'Average True Range (ATR)' },
				{ key: 'volatility' as const, name: 'Volatility' },
				{ key: 'stdDev' as const, name: 'Standard Deviation' },
			],
		},
		{
			title: 'Trend Indicators',
			indicators: [
				{
					key: 'dmi' as const,
					name: 'Directional Movement Index (DMI)',
				},
				{
					key: 'adx' as const,
					name: 'Average Directional Index (ADX)',
				},
				{ key: 'sar' as const, name: 'Parabolic SAR' },
				{ key: 'slope' as const, name: 'Slope' },
			],
		},
		{
			title: 'Other Indicators',
			indicators: [
				{ key: 'beta' as const, name: 'Beta' },
				{
					key: 'averageVolume' as const,
					name: 'Average Volume',
				},
				{
					key: 'averageVolumeByPrice' as const,
					name: 'Price-weighted Average Volume',
				},
				{
					key: 'splitAdjusted' as const,
					name: 'Split Adjusted Data',
				},
			],
		},
	];

	if (loading) {
		// 创建默认的用户偏好作为占位符
		const defaultPreference: UserPreference = {
			theme: 'light',
			language: 'CN',
			technicalIndicators: {
				sma: false,
				ema: false,
				wma: false,
				rsi: false,
				macd: false,
				stochastic: false,
				stochasticRSI: false,
				cci: false,
				bollingerBands: false,
				atr: false,
				volatility: false,
				stdDev: false,
				dmi: false,
				adx: false,
				sar: false,
				slope: false,
				beta: false,
				averageVolume: false,
				averageVolumeByPrice: false,
				splitAdjusted: false,
			},
		};

		return (
			<div className='space-y-6'>
				<div className='text-xl font-semibold'>Preferences</div>

				{/* 基本设置 - 加载状态 */}
				<Card>
					<CardContent className='pt-6'>
						<h3 className='text-lg font-medium mb-4'>
							Basic Settings
						</h3>

						<div className='space-y-4'>
							<div className='flex items-center justify-between'>
								<div className='space-y-0.5'>
									<Label htmlFor='dark-mode'>Dark Mode</Label>
									<p className='text-sm text-muted-foreground'>
										Toggle between light and dark modes
									</p>
								</div>
								<Switch
									id='dark-mode'
									checked={defaultPreference.theme === 'dark'}
									onCheckedChange={() => {}}
									disabled={true}
								/>
							</div>

							<Separator />

							<div className='flex items-center justify-between'>
								<div className='space-y-0.5'>
									<Label htmlFor='language'>Language</Label>
									<p className='text-sm text-muted-foreground'>
										Set interface display language
									</p>
								</div>
								<Select
									value={defaultPreference.language}
									onValueChange={() => {}}
									disabled={true}
								>
									<SelectTrigger className='w-[100px]'>
										<SelectValue placeholder='Select language' />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value='CN'>
											Chinese
										</SelectItem>
										<SelectItem value='EN'>
											English
										</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* 技术指标设置 - 加载状态 */}
				<Card>
					<CardContent className='pt-6'>
						<h3 className='text-lg font-medium mb-4'>
							Technical Indicator Preferences
						</h3>
						<p className='text-sm text-muted-foreground mb-6'>
							Select which technical indicators you want to
							display in your analysis. Enabled indicators will be
							shown on the stock detail page.
						</p>

						<div className='space-y-6'>
							{technicalIndicatorGroups.map((group) => (
								<div key={group.title} className='space-y-3'>
									<h4 className='font-medium'>
										{group.title}
									</h4>

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
													checked={false}
													onCheckedChange={() => {}}
													disabled={true}
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

	return (
		<div className='space-y-6'>
			<div className='text-xl font-semibold'>Preferences</div>

			{/* 基本设置 */}
			<Card>
				<CardContent className='pt-6'>
					<h3 className='text-lg font-medium mb-4'>Basic Settings</h3>

					<div className='space-y-4'>
						<div className='flex items-center justify-between'>
							<div className='space-y-0.5'>
								<Label htmlFor='dark-mode'>Dark Mode</Label>
								<p className='text-sm text-muted-foreground'>
									Toggle between light and dark modes
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
								<Label htmlFor='language'>Language</Label>
								<p className='text-sm text-muted-foreground'>
									Set interface display language
								</p>
							</div>
							<Select
								value={userPreference?.language || 'CN'}
								onValueChange={handleLanguageChange}
								disabled={saving}
							>
								<SelectTrigger className='w-[100px]'>
									<SelectValue placeholder='Select language' />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value='CN'>Chinese</SelectItem>
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
					<h3 className='text-lg font-medium mb-4'>
						Technical Indicator Preferences
					</h3>
					<p className='text-sm text-muted-foreground mb-6'>
						Select which technical indicators you want to display in
						your analysis. Enabled indicators will be shown on the
						stock detail page.
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
