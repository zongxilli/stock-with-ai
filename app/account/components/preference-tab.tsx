'use client';

import { useState, useEffect } from 'react';

import { useTheme } from 'next-themes';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
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
import useLanguage from '@/hooks/useLanguage';
import { UserPreference } from '@/prisma/types/user-types';

export function PreferenceTab() {
	const { toast } = useToast();
	const { setTheme } = useTheme();
	const { t } = useTranslation('accountPreferenceTab');
	const { changeLanguage } = useLanguage();

	// 使用 useProfile hook 获取用户偏好和更新方法
	const {
		profile,
		preference,
		isLoading,
		isUpdatingPreference,
		updatePreference,
	} = useProfile();

	// 本地状态管理颜色输入
	const [upColorInput, setUpColorInput] = useState('');
	const [downColorInput, setDownColorInput] = useState('');

	// 当偏好设置加载完成后，初始化本地颜色状态
	useEffect(() => {
		if (preference?.chart) {
			setUpColorInput(preference.chart.upColor || '');
			setDownColorInput(preference.chart.downColor || '');
		}
	}, [preference]);

	// 检查颜色值是否有效并确保带有#前缀
	const normalizeColorValue = (color: string) => {
		// 如果颜色为空，返回默认颜色
		if (!color) return '#00C805';

		// 确保颜色值以#开头
		if (!color.startsWith('#')) {
			return `#${color}`;
		}

		return color;
	};

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
				title: t('error'),
				description: t('failedToUpdateTheme'),
				variant: 'destructive',
			});
		}
	};

	// 更新语言
	const handleLanguageChange = async (value: string) => {
		const newLanguage = value as 'EN' | 'CN';

		try {
			// 更新数据库中的语言偏好
			updatePreference({ language: newLanguage });

			// 同步更新应用语言
			changeLanguage(newLanguage);
		} catch (error) {
			console.error('update language error:', error);
			toast({
				title: t('error'),
				description: t('failedToUpdateLanguage'),
				variant: 'destructive',
			});
		}
	};

	// 确认上涨颜色更新
	const handleUpColorConfirm = async () => {
		if (!preference) return;

		try {
			// 规范化颜色值
			const normalizedColor = normalizeColorValue(upColorInput);

			// 创建更新后的图表设置对象
			const updatedChart = {
				...preference.chart,
				upColor: normalizedColor,
			};

			updatePreference({
				chart: updatedChart,
			});

			// 更新本地输入值为规范化的颜色
			setUpColorInput(normalizedColor);
		} catch (error) {
			console.error('update chart up color error:', error);
			toast({
				title: t('error'),
				description: t('failedToUpdateChart'),
				variant: 'destructive',
			});
		}
	};

	// 重置上涨颜色输入
	const handleUpColorReset = () => {
		if (preference?.chart) {
			setUpColorInput(preference.chart.upColor || '');
		}
	};

	// 确认下跌颜色更新
	const handleDownColorConfirm = async () => {
		if (!preference) return;

		try {
			// 规范化颜色值
			const normalizedColor = normalizeColorValue(downColorInput);

			// 创建更新后的图表设置对象
			const updatedChart = {
				...preference.chart,
				downColor: normalizedColor,
			};

			updatePreference({
				chart: updatedChart,
			});

			// 更新本地输入值为规范化的颜色
			setDownColorInput(normalizedColor);
		} catch (error) {
			console.error('update chart down color error:', error);
			toast({
				title: t('error'),
				description: t('failedToUpdateChart'),
				variant: 'destructive',
			});
		}
	};

	// 重置下跌颜色输入
	const handleDownColorReset = () => {
		if (preference?.chart) {
			setDownColorInput(preference.chart.downColor || '');
		}
	};

	// 更新图表周期
	const handleChartPeriodChange = async (value: string) => {
		if (!preference) return;

		try {
			// 创建更新后的图表设置对象
			const updatedChart = {
				...preference.chart,
				period: value as 'd' | 'w' | 'm',
			};

			updatePreference({
				chart: updatedChart,
			});
		} catch (error) {
			console.error('update chart period error:', error);
			toast({
				title: t('error'),
				description: t('failedToUpdateChart'),
				variant: 'destructive',
			});
		}
	};

	// 更新高级视图设置
	const handleAdvancedViewChange = async (checked: boolean) => {
		if (!preference) return;

		try {
			updatePreference({
				advancedView: checked,
			});
		} catch (error) {
			console.error('update advanced view error:', error);
			toast({
				title: t('error'),
				description: t('failedToUpdateChart'),
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
				title: t('error'),
				description: t('failedToUpdateIndicators'),
				variant: 'destructive',
			});
		}
	};

	// 定义技术指标组
	const technicalIndicatorGroups = [
		{
			title: t('movingAverages'),
			indicators: [
				{ key: 'sma' as const, name: t('sma') },
				{
					key: 'ema' as const,
					name: t('ema'),
				},
				{ key: 'wma' as const, name: t('wma') },
			],
		},
		{
			title: t('oscillators'),
			indicators: [
				{ key: 'rsi' as const, name: t('rsi') },
				{
					key: 'macd' as const,
					name: t('macd'),
				},
				{ key: 'stochastic' as const, name: t('stochastic') },
				{
					key: 'stochasticRSI' as const,
					name: t('stochasticRSI'),
				},
				{ key: 'cci' as const, name: t('cci') },
			],
		},
		{
			title: t('volatilityIndicators'),
			indicators: [
				{
					key: 'bollingerBands' as const,
					name: t('bollingerBands'),
				},
				{ key: 'atr' as const, name: t('atr') },
				{ key: 'volatility' as const, name: t('volatility') },
				{ key: 'stdDev' as const, name: t('stdDev') },
			],
		},
		{
			title: t('trendIndicators'),
			indicators: [
				{
					key: 'adx' as const,
					name: t('adx'),
				},
				{
					key: 'dmi' as const,
					name: t('dmi'),
				},
				{ key: 'slope' as const, name: t('slope') },
				{
					key: 'sar' as const,
					name: t('sar'),
				},
			],
		},
		{
			title: t('volumeIndicators'),
			indicators: [
				{ key: 'averageVolume' as const, name: t('averageVolume') },
				{
					key: 'averageVolumeByPrice' as const,
					name: t('averageVolumeByPrice'),
				},
			],
		},
		{
			title: t('otherIndicators'),
			indicators: [
				{ key: 'beta' as const, name: t('beta') },
				{
					key: 'splitAdjusted' as const,
					name: t('splitAdjusted'),
				},
			],
		},
	];

	// 如果加载中，显示加载状态
	if (isLoading) {
		return <div className='text-center py-10'>{t('loading')}</div>;
	}

	// 如果没有用户或偏好设置，显示错误信息
	if (!profile || !preference) {
		return (
			<div className='text-center py-10 text-red-500'>
				{t('failedToLoad')}
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
									{t('darkMode')}
								</Label>
								<Switch
									id='theme-toggle'
									checked={preference.theme === 'dark'}
									onCheckedChange={handleThemeChange}
									disabled={isUpdatingPreference}
								/>
							</div>
							<p className='text-muted-foreground text-sm mt-1'>
								{t('darkModeDescription')}
							</p>
						</div>

						<Separator />

						{/* 语言设置 */}
						<div>
							<Label htmlFor='language' className='font-medium'>
								{t('interfaceLanguage')}
							</Label>
							<p className='text-muted-foreground text-sm mt-1 mb-2'>
								{t('languageDescription')}
							</p>
							<Select
								disabled={isUpdatingPreference}
								value={preference.language}
								onValueChange={handleLanguageChange}
							>
								<SelectTrigger className='w-full sm:w-[180px]'>
									<SelectValue
										placeholder={t('selectLanguage')}
									/>
								</SelectTrigger>
								<SelectContent>
									<SelectItem value='EN'>
										{t('english')}
									</SelectItem>
									<SelectItem value='CN'>
										{t('chinese')}
									</SelectItem>
								</SelectContent>
							</Select>
						</div>

						<Separator />

						{/* 图表设置 */}
						<div>
							<h3 className='font-medium'>
								{t('chartSettings')}
							</h3>
							<p className='text-muted-foreground text-sm mt-1 mb-4'>
								{t('chartSettingsDescription')}
							</p>

							<div className='space-y-4'>
								{/* 上涨颜色 */}
								<div>
									<Label
										htmlFor='up-color'
										className='font-medium'
									>
										{t('upColor')}
									</Label>
									<p className='text-muted-foreground text-sm mt-1 mb-2'>
										{t('upColorDescription')}
									</p>
									<div className='flex items-center space-x-2'>
										<div
											className='w-10 h-8 border rounded-md flex-shrink-0'
											style={{
												backgroundColor:
													normalizeColorValue(
														upColorInput
													),
											}}
										/>
										<Input
											id='up-color'
											type='text'
											value={upColorInput}
											onChange={(e) =>
												setUpColorInput(e.target.value)
											}
											disabled={isUpdatingPreference}
											className='w-32'
										/>
										<Button
											size='sm'
											variant={
												upColorInput ===
												preference.chart.upColor
													? 'outline'
													: 'default'
											}
											onClick={
												upColorInput ===
												preference.chart.upColor
													? handleUpColorReset
													: handleUpColorConfirm
											}
											disabled={
												isUpdatingPreference ||
												upColorInput ===
													preference.chart.upColor
											}
										>
											{upColorInput ===
											preference.chart.upColor
												? t('reset')
												: t('confirm')}
										</Button>
									</div>
								</div>

								{/* 下跌颜色 */}
								<div>
									<Label
										htmlFor='down-color'
										className='font-medium'
									>
										{t('downColor')}
									</Label>
									<p className='text-muted-foreground text-sm mt-1 mb-2'>
										{t('downColorDescription')}
									</p>
									<div className='flex items-center space-x-2'>
										<div
											className='w-10 h-8 border rounded-md flex-shrink-0'
											style={{
												backgroundColor:
													normalizeColorValue(
														downColorInput
													),
											}}
										/>
										<Input
											id='down-color'
											type='text'
											value={downColorInput}
											onChange={(e) =>
												setDownColorInput(
													e.target.value
												)
											}
											disabled={isUpdatingPreference}
											className='w-32'
										/>
										<Button
											size='sm'
											variant={
												downColorInput ===
												preference.chart.downColor
													? 'outline'
													: 'default'
											}
											onClick={
												downColorInput ===
												preference.chart.downColor
													? handleDownColorReset
													: handleDownColorConfirm
											}
											disabled={
												isUpdatingPreference ||
												downColorInput ===
													preference.chart.downColor
											}
										>
											{downColorInput ===
											preference.chart.downColor
												? t('reset')
												: t('confirm')}
										</Button>
									</div>
								</div>

								{/* 图表周期 */}
								<div>
									<Label
										htmlFor='chart-period'
										className='font-medium'
									>
										{t('chartPeriod')}
									</Label>
									<p className='text-muted-foreground text-sm mt-1 mb-2'>
										{t('chartPeriodDescription')}
									</p>
									<Select
										disabled={isUpdatingPreference}
										value={preference.chart.period}
										onValueChange={handleChartPeriodChange}
									>
										<SelectTrigger className='w-full sm:w-[180px]'>
											<SelectValue
												placeholder={t('chartPeriod')}
											/>
										</SelectTrigger>
										<SelectContent>
											<SelectItem value='d'>
												{t('daily')}
											</SelectItem>
											<SelectItem value='w'>
												{t('weekly')}
											</SelectItem>
											<SelectItem value='m'>
												{t('monthly')}
											</SelectItem>
										</SelectContent>
									</Select>
								</div>

								{/* 高级视图开关 */}
								<div>
									<div className='flex items-center justify-between'>
										<Label
											htmlFor='advanced-view-toggle'
											className='font-medium'
										>
											{t('advancedView')}
										</Label>
										<Switch
											id='advanced-view-toggle'
											checked={preference.advancedView}
											onCheckedChange={
												handleAdvancedViewChange
											}
											disabled={isUpdatingPreference}
										/>
									</div>
									<p className='text-muted-foreground text-sm mt-1'>
										{t('advancedViewDescription')}
									</p>
								</div>
							</div>
						</div>

						<Separator />

						{/* 技术指标偏好设置 */}
						<div>
							<h3 className='font-medium'>
								{t('technicalIndicators')}
							</h3>
							<p className='text-muted-foreground text-sm mt-1 mb-4'>
								{t('technicalIndicatorsDescription')}
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
