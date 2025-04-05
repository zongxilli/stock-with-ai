'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';

export function AuthenticationTab() {
  return (
    <div className="space-y-6">
      <div className="text-xl font-semibold">Authentication</div>
      
      <Card className="border-none shadow-none">
        <CardHeader className="p-0 pb-4">
          <CardTitle className="text-base font-medium">Email</CardTitle>
          <CardDescription>zongxi2014@gmail.com</CardDescription>
        </CardHeader>
        <CardContent className="p-0 flex justify-between items-center">
          <div></div>
          <Button variant="outline" size="sm">
            Manage
          </Button>
        </CardContent>
      </Card>
      
      <Card className="border-none shadow-none">
        <CardHeader className="p-0 pb-4">
          <CardTitle className="text-base font-medium">Passkeys</CardTitle>
          <CardDescription>1 passkey registered</CardDescription>
        </CardHeader>
        <CardContent className="p-0 flex justify-between items-center">
          <div></div>
          <Button variant="outline" size="sm">
            Add
          </Button>
        </CardContent>
      </Card>

      <Card className="border-none shadow-none">
        <CardHeader className="p-0 pb-4">
          <CardTitle className="text-base font-medium">Github</CardTitle>
          <CardDescription>Connected Mar 27</CardDescription>
        </CardHeader>
        <CardContent className="p-0 flex justify-between items-center">
          <div>zongxilli</div>
          <Button variant="ghost" size="sm">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
          </Button>
        </CardContent>
      </Card>

      <Card className="border-none shadow-none">
        <CardHeader className="p-0 pb-4">
          <CardTitle className="text-base font-medium">Gitlab</CardTitle>
          <CardDescription>Connect your Gitlab account</CardDescription>
        </CardHeader>
        <CardContent className="p-0 flex justify-between items-center">
          <div></div>
          <Button variant="outline" size="sm">
            Connect
          </Button>
        </CardContent>
      </Card>

      <Card className="border-none shadow-none">
        <CardHeader className="p-0 pb-4">
          <CardTitle className="text-base font-medium">Bitbucket</CardTitle>
          <CardDescription>Connect your Bitbucket account</CardDescription>
        </CardHeader>
        <CardContent className="p-0 flex justify-between items-center">
          <div></div>
          <Button variant="outline" size="sm">
            Connect
          </Button>
        </CardContent>
      </Card>

      <div className="pt-4 border-t border-border mt-4">
        <div className="text-xl font-semibold mb-4">Two-factor Authentication</div>
        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium">Add an additional layer of security</div>
            <div className="text-sm text-muted-foreground">Require at least two methods of authentication to sign in.</div>
          </div>
          <Switch />
        </div>
      </div>
    </div>
  );
}
