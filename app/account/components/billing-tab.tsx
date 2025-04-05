'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function BillingTab() {
  return (
    <div className="space-y-6">
      <div className="text-xl font-semibold">Billing</div>
      
      <Card>
        <CardHeader>
          <CardTitle>Subscription Plan</CardTitle>
          <CardDescription>Manage your subscription and billing details</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            You are currently on the Free plan. Upgrade to access premium features.
          </p>
          <Button>
            Upgrade Plan
          </Button>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Payment Method</CardTitle>
          <CardDescription>Manage your payment methods</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            No payment methods added yet.
          </p>
          <Button variant="outline">
            Add Payment Method
          </Button>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Billing History</CardTitle>
          <CardDescription>View your past invoices</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            No billing history available.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
