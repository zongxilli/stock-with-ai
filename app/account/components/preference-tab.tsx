'use client';

import { useTheme } from 'next-themes';

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
import { useProfile } from '@/hooks/use-profile';
import { useToast } from '@/hooks/use-toast';
import { UserPreference } from '@/prisma/types/user-types';

export function PreferenceTab() {
	const { toast } = useToast();
	const { setTheme } = useTheme();

	// 使用 useProfile hook 获取用户偏好和更新方法
	const {
		profile,
		preference,
		isLoading,
		isUpdatingPreference,
		updatePreference,
	} = useProfile();

	// 更新主题
	const handleThemeChange = async (checked: boolean) => {
		const newTheme = checked ? 'dark' : 'light';

		try {
			// 更新数据库中的主题偏好
			updatePreference({ theme: newTheme });

			// 同步更新应用主题
			setTheme(newTheme);
		} catch (error) {
			console.error('update theme error:', error);
			toast({
				title: 'Error',
				description: 'Failed to update theme',
				variant: 'destructive',
			});
		}
	};

	// 更新语言
	const handleLanguageChange = async (value: string) => {
		const newLanguage = value as 'EN' | 'CN';

		try {
			updatePreference({ language: newLanguage });
		} catch (error) {
			console.error('update language error:', error);
			toast({
				title: 'Error',
				description: 'Failed to update language',
				variant: 'destructive',
			});
		}
	};

	// 更新技术指标偏好
	const handleTechnicalIndicatorChange = async (
		indicator: keyof UserPreference['technicalIndicators'],
		checked: boolean
	) => {
		if (!preference) return;

		try {
			// 创建完整的技术指标对象
			const updatedTechnicalIndicators = {
				...preference.technicalIndicators,
				[indicator]: checked,
			};

			updatePreference({
				technicalIndicators: updatedTechnicalIndicators,
			});
		} catch (error) {
			console.error('update technical indicator error:', error);
			toast({
				title: 'Error',
				description: 'Failed to update technical indicator preferences',
				variant: 'destructive',
			});
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
					key: 'adx' as const,
					name: 'Average Directional Index (ADX)',
				},
				{
					key: 'dmi' as const,
					name: 'Directional Movement Index (DMI)',
				},
				{ key: 'slope' as const, name: 'Linear Regression Slope' },
				{
					key: 'sar' as const,
					name: 'Parabolic Stop and Reverse (SAR)',
				},
			],
		},
		{
			title: 'Volume Indicators',
			indicators: [
				{ key: 'averageVolume' as const, name: 'Average Volume' },
				{
					key: 'averageVolumeByPrice' as const,
					name: 'Volume by Price',
				},
			],
		},
		{
			title: 'Other',
			indicators: [
				{ key: 'beta' as const, name: 'Beta' },
				{
					key: 'splitAdjusted' as const,
					name: 'Split Adjusted Prices',
				},
			],
		},
	];

	// 如果加载中，显示加载状态
	if (isLoading) {
		return <div className='text-center py-10'>Loading...</div>;
	}

	// 如果没有用户或偏好设置，显示错误信息
	if (!profile || !preference) {
		return (
			<div className='text-center py-10 text-red-500'>
				Failed to load user preferences, please try again later
			</div>
		);
	}

	return (
		<div>
			<Card>
				<CardContent className='pt-6'>
					<div className='space-y-6'>
						{/* 界面主题设置 */}
						<div>
							<div className='flex items-center justify-between'>
								<Label
									htmlFor='theme-toggle'
									className='font-medium'
								>
									Dark Mode
								</Label>
								<Switch
									id='theme-toggle'
									checked={preference.theme === 'dark'}
									onCheckedChange={handleThemeChange}
									disabled={isUpdatingPreference}
								/>
							</div>
							<p className='text-muted-foreground text-sm mt-1'>
								Toggle between light and dark modes
							</p>
						</div>

						<Separator />

						{/* 语言设置 */}
						<div>
							<Label htmlFor='language' className='font-medium'>
								Interface Language
							</Label>
							<p className='text-muted-foreground text-sm mt-1 mb-2'>
								Select the language for the interface
							</p>
							<Select
								disabled={isUpdatingPreference}
								value={preference.language}
								onValueChange={handleLanguageChange}
							>
								<SelectTrigger className='w-full sm:w-[180px]'>
									<SelectValue placeholder='选择语言' />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value='EN'>English</SelectItem>
									<SelectItem value='CN'>中文</SelectItem>
								</SelectContent>
							</Select>
						</div>

						<Separator />

						{/* 技术指标偏好设置 */}
						<div>
							<h3 className='font-medium'>
								Technical Indicator Preferences
							</h3>
							<p className='text-muted-foreground text-sm mt-1 mb-4'>
								Select your preferred technical indicators for
								AI analysis. The selected indicators will be
								used to generate trading suggestions and other
								insights.
							</p>

							<div className='space-y-6'>
								{technicalIndicatorGroups.map((group) => (
									<div key={group.title}>
										<h4 className='text-sm font-medium mb-3'>
											{group.title}
										</h4>
										<div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
											{group.indicators.map(
												(indicator) => (
													<div
														key={indicator.key}
														className='flex items-center justify-between space-x-2'
													>
														<Label
															htmlFor={
																indicator.key
															}
															className='cursor-pointer text-sm'
														>
															{indicator.name}
														</Label>
														<Switch
															id={indicator.key}
															checked={
																preference
																	.technicalIndicators[
																	indicator
																		.key
																] || false
															}
															onCheckedChange={(
																checked
															) =>
																handleTechnicalIndicatorChange(
																	indicator.key,
																	checked
																)
															}
															disabled={
																isUpdatingPreference
															}
														/>
													</div>
												)
											)}
										</div>
									</div>
								))}
							</div>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
