'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

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

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState<UserProfile | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUser = window.localStorage.getItem('user');
      if (storedUser) {
        setLoggedInUser(JSON.parse(storedUser));
      }
    }
  }, []);

  const handleSignOut = () => {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('token');
      window.localStorage.removeItem('user');
      setLoggedInUser(null);
      router.push('/sign-in');
    }
  };

  const getInitials = (username: string) => {
    const parts = username.split(' ');
    if (parts.length > 1) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    } else if (username.length > 0) {
      return username.substring(0, 2).toUpperCase();
    } else {
      return 'U'; // Default for unknown user
    }
  };

  return (
    <header className="border-b">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold">
            TeachTeam
          </Link>

          <div className="hidden md:flex items-center space-x-4">
            <Link href="/courses" className="hover:text-primary">
              Courses
            </Link>
            <Link href="/tutors" className="hover:text-primary">
              Tutor
            </Link>
            <Link href="/lecturer" className="hover:text-primary">
              Lecturer
            </Link>
            {loggedInUser ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      {loggedInUser.avatar_url ? (
                        <AvatarImage src={loggedInUser.avatar_url} alt="User Avatar" />
                      ) : (
                        <AvatarFallback>{getInitials(loggedInUser.username)}</AvatarFallback>
                      )}
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{loggedInUser.username}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {loggedInUser.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push('/profile')}>
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSignOut}>
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Link href="/sign-in" className="hover:text-primary">
                  Sign In
                </Link>
                <Link href="/sign-up" className="hover:text-primary">
                  Sign Up
                </Link>
              </>
            )}
          </div>

          <div className="md:hidden flex items-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden mt-4 space-y-2">
            <Link href="/courses" className="block hover:text-primary" onClick={() => setIsMenuOpen(false)}>
              Courses
            </Link>
            <Link href="/tutors" className="block hover:text-primary" onClick={() => setIsMenuOpen(false)}>
              Tutor
            </Link>
            <Link href="/lecturer" className="block hover:text-primary" onClick={() => setIsMenuOpen(false)}>
              Lecturer
            </Link>
            {loggedInUser ? (
              <>
                <Link href="/profile" className="block hover:text-primary" onClick={() => setIsMenuOpen(false)}>
                  Profile
                </Link>
                <Button variant="ghost" className="w-full justify-start" onClick={() => { handleSignOut(); setIsMenuOpen(false); }}>
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Link href="/sign-in" className="block hover:text-primary" onClick={() => setIsMenuOpen(false)}>
                  Sign In
                </Link>
                <Link href="/sign-up" className="block hover:text-primary" onClick={() => setIsMenuOpen(false)}>
                  Sign Up
                </Link>
              </>
            )}
          </div>
        )}
      </nav>
    </header>
  );
}