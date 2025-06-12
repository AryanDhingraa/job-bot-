'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import axios from 'axios';

interface UserProfile {
  id: number;
  username: string;
  email: string;
  role: 'candidate' | 'lecturer' | 'admin';
  date_joined: string;
  avatar_url?: string;
  bio?: string;
  skills?: string[];
  current_level?: string;
  gpa?: string;
}

declare global {
  interface Window {
    localStorage: Storage;
  }
}

export default function ProfilePage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    bio: '',
    skills: '',
    current_level: '',
    gpa: '',
  });
  const router = useRouter();

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const getToken = () => {
    if (typeof window !== 'undefined') {
      return window.localStorage?.getItem('token');
    }
    return null;
  };

  const fetchUserProfile = async () => {
    setLoading(true);
    let cachedUser = null;
    if (typeof window !== 'undefined') {
      const storedUser = window.localStorage.getItem('user');
      if (storedUser) {
        cachedUser = JSON.parse(storedUser);
        setUser(cachedUser);
        setFormData({
          bio: cachedUser.bio || '',
          skills: cachedUser.skills?.join(', ') || '',
          current_level: cachedUser.current_level || '',
          gpa: cachedUser.gpa || '',
        });
        setLoading(false); // Display cached data immediately
      }
    }

    try {
      const token = getToken();
      if (!token) {
        toast.error('Authentication required. Please sign in.');
        router.push('/sign-in');
        return;
      }

      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const fetchedUser: UserProfile = response.data;
      setUser(fetchedUser);
      setFormData({
        bio: fetchedUser.bio || '',
        skills: fetchedUser.skills?.join(', ') || '',
        current_level: fetchedUser.current_level || '',
        gpa: fetchedUser.gpa || '',
      });
      // Update localStorage with fresh data
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('user', JSON.stringify(fetchedUser));
      }
    } catch (error: any) {
      // Only show error and redirect if no cached user was available
      if (!cachedUser) {
        toast.error(error.response?.data?.message || 'Failed to fetch user profile.');
        router.push('/sign-in');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [id]: value }));
  };

  const handleUpdateProfile = async () => {
    setLoading(true);
    try {
      const token = getToken();
      if (!token) {
        toast.error('Authentication required. Please sign in.');
        router.push('/sign-in');
        return;
      }

      // Prepare data for API call
      const updateData: Partial<UserProfile> = {
        bio: formData.bio,
        skills: formData.skills.split(',').map(s => s.trim()).filter(s => s !== ''),
        current_level: formData.current_level,
        gpa: formData.gpa,
      };

      const response = await axios.put(`${process.env.NEXT_PUBLIC_API_BASE_URL}/users/profile`, updateData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setUser(response.data.user);
      // Update localStorage with updated user data
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      toast.success(response.data.message);
      setIsEditing(false); // Exit editing mode after successful update
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p>Loading profile...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p>User profile not found. Please sign in.</p>
        <Button onClick={() => router.push('/sign-in')} className="mt-4">Sign In</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>User Profile</CardTitle>
          <CardDescription>View and manage your personal and academic details.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input id="username" value={user.username} readOnly />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={user.email} readOnly />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Input id="role" value={user.role.charAt(0).toUpperCase() + user.role.slice(1)} readOnly />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dateJoined">Date Joined</Label>
              <Input id="dateJoined" value={new Date(user.date_joined).toLocaleDateString()} readOnly />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Input
              id="bio"
              value={isEditing ? formData.bio : user.bio || ''}
              onChange={handleInputChange}
              readOnly={!isEditing}
              placeholder="Tell us about yourself..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="skills">Skills (comma-separated)</Label>
            <Input
              id="skills"
              value={isEditing ? formData.skills : user.skills?.join(', ') || ''}
              onChange={handleInputChange}
              readOnly={!isEditing}
              placeholder="e.g., Python, Java, Data Structures"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="current_level">Current Level</Label>
            <Input
              id="current_level"
              value={isEditing ? formData.current_level : user.current_level || ''}
              onChange={handleInputChange}
              readOnly={!isEditing}
              placeholder="e.g., Masters Student, PhD Candidate"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="gpa">GPA</Label>
            <Input
              id="gpa"
              value={isEditing ? formData.gpa : user.gpa || ''}
              onChange={handleInputChange}
              readOnly={!isEditing}
              placeholder="e.g., 6.5"
            />
          </div>

          <div className="flex justify-end gap-2">
            {isEditing ? (
              <>
                <Button variant="outline" onClick={() => {
                  setIsEditing(false);
                  // Reset form data to current user values if canceling
                  setFormData({
                    bio: user.bio || '',
                    skills: user.skills?.join(', ') || '',
                    current_level: user.current_level || '',
                    gpa: user.gpa || '',
                  });
                }}>
                  Cancel
                </Button>
                <Button onClick={handleUpdateProfile} disabled={loading}>
                  {loading ? 'Saving...' : 'Save Changes'}
                </Button>
              </>
            ) : (
              <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 