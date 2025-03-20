import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from 'sonner';
import ChangePasswordModal from "@/components/ChangePasswordModal";

interface AccountCardProps {
  email: string;
}

export default function AccountCard({ email }: AccountCardProps) {
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Account</CardTitle>
        <CardDescription>
          Manage your account settings
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            value={email}
            disabled
            className="bg-muted"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value="••••••••"
            disabled
            className="bg-muted"
          />
        </div>
        <Button variant="outline" onClick={() => setShowPasswordModal(true)}>
          Change Password
        </Button>
      </CardContent>

      <ChangePasswordModal
        open={showPasswordModal}
        onOpenChange={setShowPasswordModal}
        onSuccess={() => {
          setShowPasswordModal(false);
          toast.success('Password updated successfully');
        }}
      />
    </Card>
  );
} 