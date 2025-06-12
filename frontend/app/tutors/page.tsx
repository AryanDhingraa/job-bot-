'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import { useSearchParams } from 'next/navigation';

// Sample tutor data - in a real app, this would come from a database
const tutorProfile = {
  name: 'John Doe',
  email: 'john.doe@university.edu',
  previousRoles: [
    {
      courseCode: 'COSC1001',
      courseName: 'Introduction to Programming',
      role: 'Lab Assistant',
      semester: 'S1 2024',
    },
    {
      courseCode: 'COSC2002',
      courseName: 'Data Structures',
      role: 'Tutor',
      semester: 'S2 2023',
    },
  ],
  skills: ['Python', 'Java', 'JavaScript', 'React', 'Node.js'],
  credentials: {
    degree: 'Bachelor of Computer Science',
    gpa: '6.5',
    currentLevel: 'Masters Student',
  },
};

interface Course {
  id: number;
  code: string;
  name: string;
  semester: string;
  description?: string;
}

interface Application {
  id: number;
  course: Course;
  role_applied: 'tutor' | 'lab_assistant';
  status: 'pending' | 'accepted' | 'rejected';
  applied_at: string;
  availability: 'full_time' | 'part_time';
  relevant_skills?: string[];
}

declare global {
  interface Window {
    localStorage: Storage;
  }
}

export default function TutorPortal() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourse, setSelectedCourse] = useState<number | null>(null);
  const [selectedRole, setSelectedRole] = useState<'tutor' | 'lab_assistant'>('tutor');
  const [selectedAvailability, setSelectedAvailability] = useState<'full_time' | 'part_time'>('part_time');
  const [relevantSkills, setRelevantSkills] = useState('');
  const [errors, setErrors] = useState({
    course: '',
    role: '',
    availability: '',
    skills: '',
  });
  const searchParams = useSearchParams();

  console.log("Current searchTerm:", searchTerm); // Added for debugging

  useEffect(() => {
    const initialCourseId = searchParams.get('courseId');

    const fetchCoursesAndSetInitial = async () => {
      try {
        const token = getToken();
        if (!token) {
          toast.error('Authentication required');
          setLoading(false); // Stop loading if no token
          return;
        }
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/courses`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCourses(response.data);

        // If initialCourseId is present, try to pre-select the course
        if (initialCourseId) {
          const courseToSelect = response.data.find(
            (course: Course) => course.id === parseInt(initialCourseId)
          );
          if (courseToSelect) {
            setSelectedCourse(courseToSelect.id);
            setSearchTerm(courseToSelect.name); // Set search term to course name
          }
        }
      } catch (error) {
        toast.error('Failed to fetch courses');
      } finally {
        setLoading(false);
      }
    };

    fetchCoursesAndSetInitial();
    fetchApplications();
  }, [searchParams]); // Depend on searchParams to re-run when query changes

  const getToken = () => {
    if (typeof window !== 'undefined') {
      return window.localStorage?.getItem('token');
    }
    return null;
  };

  const fetchCourses = async () => {
    try {
      const token = getToken();
      if (!token) {
        toast.error('Authentication required');
        return;
      }
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/candidate/courses`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCourses(response.data);
    } catch (error) {
      toast.error('Failed to fetch courses');
    }
  };

  const fetchApplications = async () => {
    try {
      const token = getToken();
      if (!token) {
        toast.error('Authentication required');
        return;
      }
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/candidate/applications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setApplications(response.data);
    } catch (error) {
      toast.error('Failed to fetch applications');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    let valid = true;
    const newErrors = { course: '', role: '', availability: '', skills: '' };

    if (selectedCourse === null) {
      newErrors.course = 'Please select a course';
      valid = false;
    }

    if (!selectedRole || !['tutor', 'lab_assistant'].includes(selectedRole)) {
      newErrors.role = 'Please select a valid position';
      valid = false;
    }

    if (!selectedAvailability || !['full_time', 'part_time'].includes(selectedAvailability)) {
      newErrors.availability = 'Please select availability';
      valid = false;
    }

    if (relevantSkills.trim() && relevantSkills.split(',').some(skill => skill.trim() === '')) {
      newErrors.skills = 'Skills cannot be empty if provided, separate by commas';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleApply = async () => {
    if (!validateForm()) {
      toast.error('Please correct the errors in the form');
      return;
    }

    try {
      const token = getToken();
      if (!token) {
        toast.error('Authentication required');
        return;
      }
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/candidate/apply`,
        {
          courseId: selectedCourse,
          role: selectedRole,
          availability: selectedAvailability,
          relevant_skills: relevantSkills.split(',').map(skill => skill.trim())
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      toast.success('Application submitted successfully');
      fetchApplications();
      resetForm();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to submit application');
    }
  };

  const resetForm = () => {
    setSelectedCourse(null);
    setSelectedRole('tutor');
    setSelectedAvailability('part_time');
    setRelevantSkills('');
    setErrors({ course: '', role: '', availability: '', skills: '' }); // Clear errors on reset
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-500';
      case 'rejected':
        return 'bg-red-500';
      default:
        return 'bg-yellow-500';
    }
  };

  const filteredCourses = courses.filter(course =>
    course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Tutor Portal</h1>

      <Tabs defaultValue="apply" className="space-y-6">
        <TabsList>
          <TabsTrigger value="apply">Apply for Position</TabsTrigger>
          <TabsTrigger value="applications">My Applications</TabsTrigger>
        </TabsList>

        <TabsContent value="apply">
          <Card>
            <CardHeader>
              <CardTitle>Apply for a Position</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Search Courses</Label>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by course name or code..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Select Course</Label>
                  <Select
                    value={selectedCourse?.toString() || ''} // Use empty string for unselected
                    onValueChange={(value) => {
                      setSelectedCourse(parseInt(value));
                      setErrors((prevErrors) => ({ ...prevErrors, course: '' }));
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a course" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredCourses.map((course) => (
                        <SelectItem key={course.id} value={course.id.toString()}>
                          {course.code} - {course.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.course && <p className="text-red-500 text-sm">{errors.course}</p>}
                </div>

                <div className="space-y-2">
                  <Label>Position</Label>
                  <Select
                    value={selectedRole}
                    onValueChange={(value: 'tutor' | 'lab_assistant') => {
                      setSelectedRole(value);
                      setErrors((prevErrors) => ({ ...prevErrors, role: '' }));
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select position" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tutor">Tutor</SelectItem>
                      <SelectItem value="lab_assistant">Lab Assistant</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.role && <p className="text-red-500 text-sm">{errors.role}</p>}
                </div>

                <div className="space-y-2">
                  <Label>Availability</Label>
                  <Select
                    value={selectedAvailability}
                    onValueChange={(value: 'full_time' | 'part_time') => {
                      setSelectedAvailability(value);
                      setErrors((prevErrors) => ({ ...prevErrors, availability: '' }));
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select availability" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full_time">Full Time</SelectItem>
                      <SelectItem value="part_time">Part Time</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.availability && <p className="text-red-500 text-sm">{errors.availability}</p>}
                </div>

                <div className="space-y-2">
                  <Label>Relevant Skills (comma-separated)</Label>
                  <Input
                    placeholder="e.g., Python, Java, Data Structures"
                    value={relevantSkills}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      setRelevantSkills(e.target.value);
                      setErrors((prevErrors) => ({ ...prevErrors, skills: '' }));
                    }}
                  />
                  {errors.skills && <p className="text-red-500 text-sm">{errors.skills}</p>}
                </div>
              </div>

              <Button onClick={handleApply} className="w-full">
                Submit Application
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="applications">
          <Card>
            <CardHeader>
              <CardTitle>My Applications</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-4">Loading applications...</div>
              ) : applications.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  You haven't submitted any applications yet.
                </div>
              ) : (
                <div className="space-y-4">
                  {applications.map((application) => (
                    <Card key={application.id}>
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold">
                              {application.course.code} - {application.course.name}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              Position: {application.role_applied === 'tutor' ? 'Tutor' : 'Lab Assistant'}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Applied: {new Date(application.applied_at).toLocaleDateString()}
                            </p>
                            {application.relevant_skills && (
                              <div className="mt-2 flex flex-wrap gap-2">
                                {application.relevant_skills.map((skill, index) => (
                                  <Badge key={index} variant="secondary">
                                    {skill}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                          <Badge className={getStatusColor(application.status)}>
                            {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}