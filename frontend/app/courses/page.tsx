'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import axios from 'axios';

interface Course {
  id: number;
  code: string;
  name: string;
  semester: string;
  description: string;
  // You might need to add other fields relevant for applications or display
  // e.g., 'positions', 'requirements' if they are fetched from the backend.
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchCourses();
  }, []);

  const getToken = () => {
    if (typeof window !== 'undefined') {
      return window.localStorage.getItem('token');
    }
    return null;
  };

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const token = getToken();
      if (!token) {
        // If no token, don't fetch courses, just set loading to false.
        // The user will be redirected to sign-in if they try to apply.
        setLoading(false);
        return;
      }

      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/courses`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCourses(response.data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to fetch courses.');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyNow = async (courseId: number) => {
    const token = getToken();
    if (!token) {
      toast.error('Please sign in to apply for a course.');
      router.push('/sign-in');
      return;
    }

    // Redirect to tutor portal with courseId as query parameter
    router.push(`/tutors?courseId=${courseId}`);
    toast.info('Redirecting to Tutor Portal to apply for the course.');
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p>Loading courses...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Available Courses</h1>
        <p className="text-muted-foreground">
          Browse through the current semester courses and available teaching positions.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.length === 0 ? (
          <p className="col-span-full text-center text-muted-foreground">No courses available at the moment.</p>
        ) : (
          courses.map((course) => (
            <Card key={course.id}>
              <CardHeader>
                <CardTitle>{course.code}</CardTitle>
                <CardDescription>{course.name}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-muted-foreground">{course.description}</p>
                  {/* You can add sections for positions and requirements here if your backend returns them */}
                  <Button className="w-full" onClick={() => handleApplyNow(course.id)}>
                    Apply Now
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}