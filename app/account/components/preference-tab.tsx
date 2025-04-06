'use client';

import { useTheme } from 'next-themes';
import { useTranslation } from 'react-i18next';

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
									<SelectItem value='EN'>{t('english')}</SelectItem>
									<SelectItem value='CN'>{t('chinese')}</SelectItem>
								</SelectContent>
							</Select>
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
