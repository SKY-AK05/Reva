'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Key, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const { toast } = useToast();
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        setName(user.user_metadata?.name || '');
        setEmail(user.email || '');
        setAvatarUrl(user.user_metadata?.avatar_url || null);
      } else {
        router.push('/login');
      }
      setLoading(false);
    };

    fetchUser();
  }, [supabase, router]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const { data, error } = await supabase.auth.updateUser({
      data: { name: name },
    });

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Error updating profile',
        description: error.message,
      });
    } else {
      if (data.user) {
        setUser(data.user);
        setAvatarUrl(data.user.user_metadata?.avatar_url || null);
        setName(data.user.user_metadata?.name || '');
      }
      toast({
        title: 'Profile updated',
        description: 'Your profile has been successfully updated.',
      });
    }
  };

  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.');
      }
      if (!user) {
        throw new Error('User not found.');
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        throw uploadError;
      }
      
      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      const publicUrl = data.publicUrl;

      const { data: { user: updatedUser }, error: updateUserError } = await supabase.auth.updateUser({
        data: { avatar_url: publicUrl },
      });

      if (updateUserError) {
        throw updateUserError;
      }
      
      if(updatedUser) {
        setAvatarUrl(updatedUser.user_metadata?.avatar_url || null);
      }

      toast({
        title: 'Avatar updated!',
        description: 'Your new avatar has been saved.',
      });

    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error uploading avatar',
        description: error.message,
      });
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Update your personal information.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdateProfile} className="space-y-6">
            <div className="flex items-center gap-6">
              <Avatar className="h-20 w-20">
                <AvatarImage src={avatarUrl || undefined} alt={name || 'User Avatar'} />
                <AvatarFallback>{name?.[0]?.toUpperCase() ?? 'U'}</AvatarFallback>
              </Avatar>
              <div className="grid gap-2">
                   <Button asChild variant="outline">
                      <Label htmlFor="avatar-upload" className="cursor-pointer">
                         {uploading ? 'Uploading...' : 'Upload new picture'}
                      </Label>
                  </Button>
                  <Input id="avatar-upload" type="file" accept="image/*" className="hidden" onChange={uploadAvatar} disabled={uploading}/>
                  <p className="text-xs text-muted-foreground">PNG, JPG, GIF up to 2MB.</p>
              </div>
            </div>
            <div className="grid gap-2 max-w-sm">
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="grid gap-2 max-w-sm">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} disabled />
            </div>
            <Button type="submit">Save Changes</Button>
          </form>
        </CardContent>
      </Card>
      
      <Card>
          <CardHeader>
              <CardTitle>Account</CardTitle>
              <CardDescription>Manage your account settings.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
               <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                      <h4 className="font-semibold">Change Password</h4>
                      <p className="text-sm text-muted-foreground">Update your password for better security.</p>
                  </div>
                  <Button variant="outline" disabled>
                      <Key className="mr-2 h-4 w-4" /> Change Password
                  </Button>
              </div>
               <div className="flex items-center justify-between p-4 border border-destructive/50 rounded-lg">
                  <div>
                      <h4 className="font-semibold text-destructive">Delete Account</h4>
                      <p className="text-sm text-muted-foreground">Permanently delete your account and all your data.</p>
                  </div>
                  <Button variant="destructive" disabled>
                      <Trash2 className="mr-2 h-4 w-4" /> Delete Account
                  </Button>
              </div>
          </CardContent>
      </Card>
    </div>
  );
}
