'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useProfile } from '@/hooks/use-profile';
import PersonalInfoCard from '@/components/settings/PersonalInfoCard';
import PreferencesCard from '@/components/settings/PreferencesCard';
import AccountCard from '@/components/settings/AccountCard';

export default function ProfilePage() {
  const { status } = useSession();
  const router = useRouter();
  const { 
    profile, 
    formData, 
    isLoading, 
    error, 
    isDirty,
    handleSave,
    handleInputChange 
  } = useProfile();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  if (status === 'loading' || !profile) {
    return (
      <div className="container mx-auto py-10 flex justify-center">
        <Card className="w-full max-w-2xl p-6">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
            <p className="text-muted-foreground">Loading your profile...</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Profile Settings</h1>
        <Button
          onClick={handleSave}
          disabled={isLoading || !isDirty}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Changes'
          )}
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6">
        <PersonalInfoCard 
          formData={formData} 
          onInputChange={handleInputChange} 
        />
        
        <PreferencesCard 
          formData={formData} 
          onInputChange={handleInputChange} 
        />
        
        <AccountCard 
          email={profile.email} 
        />
      </div>
    </div>
  );
} 