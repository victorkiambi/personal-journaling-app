import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';

interface UserProfile {
  id: string;
  email: string;
  name: string;
  settings: {
    id: string;
    theme: string;
    emailNotifications: boolean;
  };
  profile?: {
    bio?: string;
    location?: string;
  };
}

interface FormData {
  name: string;
  bio: string;
  location: string;
  theme: string;
  emailNotifications: boolean;
}

export function useProfile() {
  const { status } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    bio: '',
    location: '',
    theme: 'light',
    emailNotifications: true
  });
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch('/api/v1/users/me');
        
        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }

        const result = await response.json();
        if (result.success) {
          setProfile(result.data);
          setFormData({
            name: result.data.name || '',
            bio: result.data.profile?.bio || '',
            location: result.data.profile?.location || '',
            theme: result.data.settings?.theme || 'light',
            emailNotifications: result.data.settings?.emailNotifications ?? true
          });
        } else {
          throw new Error(result.error || 'Failed to fetch user data');
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Failed to load user data');
        toast.error('Failed to load user data');
      } finally {
        setIsLoading(false);
      }
    };

    if (status === 'authenticated') {
      fetchUserData();
    }
  }, [status]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setIsDirty(true);
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/v1/users/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const result = await response.json();
      if (result.success) {
        setProfile(result.data);
        setIsDirty(false);
        toast.success('Profile updated successfully');
      } else {
        throw new Error(result.error || 'Failed to update profile');
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile');
      toast.error('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    profile,
    formData,
    isLoading,
    error,
    isDirty,
    handleSave,
    handleInputChange
  };
} 