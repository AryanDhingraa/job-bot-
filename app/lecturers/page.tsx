'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Search, SortAsc, SortDesc } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

// Sample applicant data - in a real app, this would come from a database
const applicants = [
  {
    id: 1,
    name: 'John Doe',
    course: 'COSC1001',
    courseName: 'Introduction to Programming',
    availability: 'Full Time',
    position: 'Tutor',
    skills: ['Python', 'Java', 'JavaScript'],
    credentials: {
      degree: 'Bachelor of Computer Science',
      gpa: '6.5',
      currentLevel: 'Masters Student',
    },
    ranking: 1,
    comments: '',
    selected: false,
    selectionCount: 15, //prepopulated data
  },
  {
    id: 2,
    name: 'Jane Smith',
    course: 'COSC1001',
    courseName: 'Introduction to Programming',
    availability: 'Part Time',
    position: 'Lab Assistant',
    skills: ['Python', 'C++', 'Data Structures'],
    credentials: {
      degree: 'Bachelor of Software Engineering',
      gpa: '6.8',
      currentLevel: 'PhD Candidate',
    },
    ranking: 2,
    comments: '',
    selected: false,
    selectionCount: 8,
  },
  {
    id: 3,
    name: 'Mike Johnson',
    course: 'COSC2002',
    courseName: 'Data Structures and Algorithms',
    availability: 'Part Time',
    position: 'Tutor',
    skills: ['Java', 'Algorithms', 'Data Structures'],
    credentials: {
      degree: 'Master of Computer Science',
      gpa: '6.2',
      currentLevel: 'PhD Candidate',
    },
    ranking: 3,
    comments: '',
    selected: false,
    selectionCount: 0,
  },
];

const courses = [
  { code: 'COSC1001', name: 'Introduction to Programming' },
  { code: 'COSC2002', name: 'Data Structures and Algorithms' },
  { code: 'COSC3003', name: 'Full Stack Development' },
  { code: 'COSC4004', name: 'Artificial Intelligence' },
];

export default function LecturerPortal() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [selectedAvailability, setSelectedAvailability] = useState('all');
  const [selectedSkill, setSelectedSkill] = useState('all');
  const [sortField, setSortField] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [applicantsList, setApplicantsList] = useState(applicants);

  // Calculate statistics for visualization
  const statistics = useMemo(() => {
    const selectedCount = applicantsList.filter(a => a.selected).length;
    const notSelectedCount = applicantsList.length - selectedCount;
    
    const sortedBySelection = [...applicantsList].sort((a, b) => b.selectionCount - a.selectionCount);
    const mostChosen = sortedBySelection[0];
    const leastChosen = sortedBySelection[sortedBySelection.length - 1];

    const chartData = applicantsList.map(applicant => ({
      name: applicant.name,
      selections: applicant.selectionCount,
      status: applicant.selected ? 'Selected' : 'Not Selected',
    }));

    return {
      selectedCount,
      notSelectedCount,
      mostChosen,
      leastChosen,
      chartData,
    };
  }, [applicantsList]);

  // Filter and sort applicants
  const filteredApplicants = applicantsList.filter(applicant => {
    const matchesSearch = 
      applicant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      applicant.courseName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCourse = selectedCourse === 'all' || applicant.course === selectedCourse;
    const matchesAvailability = selectedAvailability === 'all' || applicant.availability === selectedAvailability;
    const matchesSkill = selectedSkill === 'all' || applicant.skills.includes(selectedSkill);
    
    return matchesSearch && matchesCourse && matchesAvailability && matchesSkill;
  }).sort((a, b) => {
    if (sortField === 'courseName') {
      return sortOrder === 'asc' 
        ? a.courseName.localeCompare(b.courseName)
        : b.courseName.localeCompare(a.courseName);
    }
    if (sortField === 'availability') {
      return sortOrder === 'asc'
        ? a.availability.localeCompare(b.availability)
        : b.availability.localeCompare(a.availability);
    }
    return 0;
  });

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleSelect = (id: number) => {
    setApplicantsList(applicantsList.map(applicant => 
      applicant.id === id 
        ? { ...applicant, selected: !applicant.selected }
        : applicant
    ));
  };

  const handleRankChange = (id: number, newRanking: number) => {
    setApplicantsList(applicantsList.map(applicant =>
      applicant.id === id
        ? { ...applicant, ranking: newRanking }
        : applicant
    ));
  };

  const handleCommentChange = (id: number, comment: string) => {
    setApplicantsList(applicantsList.map(applicant =>
      applicant.id === id
        ? { ...applicant, comments: comment }
        : applicant
    ));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Lecturer Portal</h1>

      {/* Statistics Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Selection Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Most Selected Applicant:</h4>
                <p className="text-lg">{statistics.mostChosen.name}</p>
                <p className="text-sm text-muted-foreground">
                  {statistics.mostChosen.selectionCount} selections
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Least Selected Applicant:</h4>
                <p className="text-lg">{statistics.leastChosen.name}</p>
                <p className="text-sm text-muted-foreground">
                  {statistics.leastChosen.selectionCount} selections
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Selection Status:</h4>
                <p>Selected: {statistics.selectedCount}</p>
                <p>Not Selected: {statistics.notSelectedCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Selection Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statistics.chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="selections">
                    {statistics.chartData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`}
                        fill={entry.status === 'Selected' ? 'hsl(var(--primary))' : 'hsl(var(--muted))'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Search and Filter Applicants</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Search</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or course..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Course</Label>
              <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                <SelectTrigger>
                  <SelectValue placeholder="Select course" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Courses</SelectItem>
                  {courses.map((course) => (
                    <SelectItem key={course.code} value={course.code}>
                      {course.code} - {course.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Availability</Label>
              <Select value={selectedAvailability} onValueChange={setSelectedAvailability}>
                <SelectTrigger>
                  <SelectValue placeholder="Select availability" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="Full Time">Full Time</SelectItem>
                  <SelectItem value="Part Time">Part Time</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Skill</Label>
              <Select value={selectedSkill} onValueChange={setSelectedSkill}>
                <SelectTrigger>
                  <SelectValue placeholder="Select skill" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Skills</SelectItem>
                  <SelectItem value="Python">Python</SelectItem>
                  <SelectItem value="Java">Java</SelectItem>
                  <SelectItem value="JavaScript">JavaScript</SelectItem>
                  <SelectItem value="C++">C++</SelectItem>
                  <SelectItem value="Data Structures">Data Structures</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-4 mt-4">
            <Button
              variant="outline"
              onClick={() => handleSort('courseName')}
              className="flex items-center gap-2"
            >
              Sort by Course
              {sortField === 'courseName' && (
                sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => handleSort('availability')}
              className="flex items-center gap-2"
            >
              Sort by Availability
              {sortField === 'availability' && (
                sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6">
        {filteredApplicants.map((applicant) => (
          <Card key={applicant.id} className={applicant.selected ? 'border-primary' : ''}>
            <CardHeader className="flex flex-row items-start justify-between">
              <div>
                <CardTitle>{applicant.name}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {applicant.course} - {applicant.courseName}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <Badge variant={applicant.availability === 'Full Time' ? 'default' : 'secondary'}>
                  {applicant.availability}
                </Badge>
                <Badge variant="outline">{applicant.position}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Skills:</h4>
                    <div className="flex flex-wrap gap-2">
                      {applicant.skills.map((skill) => (
                        <Badge key={skill} variant="secondary">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Academic Credentials:</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>Degree: {applicant.credentials.degree}</li>
                      <li>GPA: {applicant.credentials.gpa}</li>
                      <li>Current Level: {applicant.credentials.currentLevel}</li>
                    </ul>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Button
                      variant={applicant.selected ? "default" : "outline"}
                      onClick={() => handleSelect(applicant.id)}
                    >
                      {applicant.selected ? 'Selected' : 'Select Candidate'}
                    </Button>
                    <div className="flex items-center gap-2">
                      <Label>Ranking:</Label>
                      <Select
                        value={applicant.ranking.toString()}
                        onValueChange={(value) => handleRankChange(applicant.id, parseInt(value))}
                      >
                        <SelectTrigger className="w-20">
                          <SelectValue placeholder="Rank" />
                        </SelectTrigger>
                        <SelectContent>
                          {[1, 2, 3, 4, 5].map((rank) => (
                            <SelectItem key={rank} value={rank.toString()}>
                              {rank}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label>Comments</Label>
                    <Textarea
                      placeholder="Add comments about this candidate..."
                      value={applicant.comments}
                      onChange={(e) => handleCommentChange(applicant.id, e.target.value)}
                      className="mt-2"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}