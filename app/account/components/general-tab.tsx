'use client';

import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { useProfile } from '@/hooks/use-profile';

/**
 * 用户账户的通用标签页组件
 */
export function GeneralTab() {
  const { t } = useTranslation('accountGeneralTab');
  const {
    profile,
    formData,
    isLoading,
    isUpdating,
    isFormChanged,
    error,
    handleChange,
    handleSubmit,
  } = useProfile();

  // 处理加载状态 - 使用 Skeleton 组件
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-xl font-semibold">
          <Skeleton className="h-8 w-36" />
        </div>
        <div className='space-y-6'>
          <div className='space-y-2'>
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-3 w-40" />
          </div>
          <div className='space-y-2'>
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className='space-y-2'>
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className='space-y-2'>
            <Skeleton className="h-4 w-10" />
            <Skeleton className="h-32 w-full" />
          </div>
          <div className='flex justify-end'>
            <Skeleton className="h-10 w-28" />
          </div>
        </div>
      </div>
    );
  }

  // 处理错误状态
  if (error || !profile) {
    return (
      <div>
        <div className='p-4 border rounded-md bg-destructive/10 text-destructive'>
          {t('errorLoadingProfile')}
        </div>
        <Button
          className='mt-4'
          onClick={() => window.location.reload()}
        >
          {t('refreshPage')}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-xl font-semibold">{t('profile')}</div>
      <form onSubmit={handleSubmit} className='space-y-6'>
        {/* Email */}
        <div className='space-y-2'>
          <Label htmlFor='email'>{t('email')}</Label>
          <Input
            id='email'
            value={profile.email || t('noEmailProvided')}
            disabled
            readOnly
          />
          <p className='text-xs text-muted-foreground'>
            {t('emailCannotBeChanged')}
          </p>
        </div>

        {/* Username */}
        <div className='space-y-2'>
          <Label htmlFor='username'>{t('username')}</Label>
          <Input
            id='username'
            name='username'
            value={formData.username}
            onChange={handleChange}
            placeholder={t('chooseUsername')}
            disabled={isUpdating}
          />
        </div>

        {/* Full Name */}
        <div className='space-y-2'>
          <Label htmlFor='fullName'>{t('fullName')}</Label>
          <Input
            id='fullName'
            name='fullName'
            value={formData.fullName}
            onChange={handleChange}
            placeholder={t('yourFullName')}
            disabled={isUpdating}
          />
        </div>

        {/* Bio */}
        <div className='space-y-2'>
          <Label htmlFor='bio'>{t('bio')}</Label>
          <Textarea
            id='bio'
            name='bio'
            value={formData.bio}
            onChange={handleChange}
            placeholder={t('tellUsAboutYourself')}
            rows={4}
            disabled={isUpdating}
          />
        </div>

        <div className='flex gap-4 justify-end'>
          <Button 
            type='submit' 
            disabled={isUpdating || !isFormChanged}
          >
            {isUpdating ? t('saving') : t('saveProfile')}
          </Button>
        </div>
      </form>
    </div>
  );
}
