'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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

export default function TutorPortal() {
  const [availability, setAvailability] = useState('part-time');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

  const skillsList = [
    'Python', 'Java', 'JavaScript', 'C++', 'React', 
    'Node.js', 'SQL', 'Machine Learning', 'Web Development',
    'Data Structures', 'Algorithms', 'Software Engineering'
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Tutor Portal</h1>

      <Tabs defaultValue="applications" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
          <TabsTrigger value="applications">Applications</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="applications">
          <Card>
            <CardHeader>
              <CardTitle>Apply for Teaching Positions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="course">Select Course</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a course" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="COSC1001">COSC1001 - Introduction to Programming</SelectItem>
                      <SelectItem value="COSC2002">COSC2002 - Data Structures</SelectItem>
                      <SelectItem value="COSC3003">COSC3003 - Full Stack Development</SelectItem>
                      <SelectItem value="COSC4004">COSC4004 - Artificial Intelligence</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="role">Preferred Role</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tutor">Tutor</SelectItem>
                      <SelectItem value="lab-assistant">Lab Assistant</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Availability</Label>
                  <div className="flex space-x-4 mt-2">
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="part-time"
                        name="availability"
                        value="part-time"
                        checked={availability === 'part-time'}
                        onChange={(e) => setAvailability(e.target.value)}
                        className="rounded-full"
                      />
                      <Label htmlFor="part-time">Part Time</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="full-time"
                        name="availability"
                        value="full-time"
                        checked={availability === 'full-time'}
                        onChange={(e) => setAvailability(e.target.value)}
                        className="rounded-full"
                      />
                      <Label htmlFor="full-time">Full Time</Label>
                    </div>
                  </div>
                </div>

                <div>
                  <Label>Additional Comments</Label>
                  <Textarea
                    placeholder="Add any additional information about your application..."
                    className="mt-2"
                  />
                </div>

                <Button className="w-full">Submit Application</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Academic Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label>Current Degree</Label>
                  <Input defaultValue={tutorProfile.credentials.degree} />
                </div>

                <div>
                  <Label>GPA</Label>
                  <Input defaultValue={tutorProfile.credentials.gpa} />
                </div>

                <div>
                  <Label>Current Level</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder={tutorProfile.credentials.currentLevel} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="undergraduate">Undergraduate</SelectItem>
                      <SelectItem value="honours">Honours</SelectItem>
                      <SelectItem value="masters">Masters Student</SelectItem>
                      <SelectItem value="phd">PhD Candidate</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="mb-2 block">Skills</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {skillsList.map((skill) => (
                      <div key={skill} className="flex items-center space-x-2">
                        <Checkbox
                          id={skill}
                          checked={selectedSkills.includes(skill)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedSkills([...selectedSkills, skill]);
                            } else {
                              setSelectedSkills(selectedSkills.filter((s) => s !== skill));
                            }
                          }}
                        />
                        <Label htmlFor={skill}>{skill}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <Button className="w-full">Update Profile</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Teaching History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {tutorProfile.previousRoles.map((role, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold">{role.courseCode} - {role.courseName}</h3>
                        <p className="text-muted-foreground">{role.semester}</p>
                      </div>
                      <Badge>{role.role}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}