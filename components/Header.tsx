'use client';
import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MoonIcon, SunIcon, Menu, X } from 'lucide-react';
import { useTheme } from 'next-themes';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();

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
            <Link href="/lecturers" className="hover:text-primary">
              Lecturer
            </Link>
            <Link href="/sign-in" className="hover:text-primary">
              Sign In
            </Link>
            <Link href="/sign-up" className="hover:text-primary">
              Sign Up
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
}