'use client';

import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';

export function PreferenceTab() {
  return (
    <div className="space-y-6">
      <div className="text-xl font-semibold">Preferences</div>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="notifications">Email Notifications</Label>
            <p className="text-sm text-muted-foreground">
              Receive email notifications about account activities
            </p>
          </div>
          <Switch id="notifications" />
        </div>
        
        <Separator />
        
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="marketing">Marketing Emails</Label>
            <p className="text-sm text-muted-foreground">
              Receive emails about new features and offers
            </p>
          </div>
          <Switch id="marketing" />
        </div>
        
        <Separator />
        
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="dark-mode">Dark Mode</Label>
            <p className="text-sm text-muted-foreground">
              Toggle between light and dark mode
            </p>
          </div>
          <Switch id="dark-mode" />
        </div>
        
        <Separator />
        
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="language">Language</Label>
            <p className="text-sm text-muted-foreground">
              Set your preferred language for the interface
            </p>
          </div>
          <div className="text-sm">English</div>
        </div>
      </div>
    </div>
  );
}
