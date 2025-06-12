'use client';

import { useQuery, gql, useMutation, useSubscription } from '@apollo/client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface User {
  id: number;
  email: string;
  role: string;
  is_blocked: boolean;
  assignedCourses?: Course[];
}

interface Course {
  id: number;
  name: string;
  description: string;
  code: string;
  semester: string;
  lecturer?: User;
}

type Application = {
  id: number;
  status: string;
  user: {
    id: number;
    email: string;
    username: string;
  };
  course: {
    id: number;
    name: string;
    code: string;
    semester: string;
    lecturer?: {
      id: number;
      username: string;
      email: string;
    };
  };
};

const GET_USERS = gql`
  query Users {
    users {
      id
      email
      role
      is_blocked
    }
  }
`;

const GET_COURSES = gql`
  query Courses {
    courses {
      id
      name
      description
      code
      semester
      lecturer {
        id
        email
      }
    }
  }
`;

const GET_APPLICATIONS = gql`
  query Applications {
    applications {
      id
      user {
        email
      }
      course {
        name
        code
        semester
      }
      status
    }
  }
`;

const GET_APPROVED_APPLICATIONS_BY_COURSE = gql`
  query ApprovedApplicationsByCourse {
    approvedApplicationsByCourse {
      id
      user {
        id
        email
        username
      }
      course {
        id
        name
        code
        semester
        lecturer {
          id
          username
          email
        }
      }
      status
    }
  }
`;

const TOGGLE_BLOCK_USER = gql`
  mutation ToggleBlockUser($userId: Int!, $isBlocked: Boolean!) {
    toggleBlockUser(userId: $userId, isBlocked: $isBlocked) {
      id
      is_blocked
    }
  }
`;

const ADD_COURSE = gql`
  mutation CreateCourse($code: String!, $name: String!, $semester: String!, $description: String) {
    createCourse(code: $code, name: $name, semester: $semester, description: $description) {
      id
      name
      code
      semester
      description
    }
  }
`;

const UPDATE_COURSE = gql`
  mutation UpdateCourse($id: Int!, $code: String, $name: String, $semester: String, $description: String) {
    updateCourse(id: $id, code: $code, name: $name, semester: $semester, description: $description) {
      id
      name
      description
      code
      semester
    }
  }
`;

const DELETE_COURSE = gql`
  mutation DeleteCourse($id: Int!) {
    deleteCourse(id: $id)
  }
`;

const ASSIGN_LECTURER_TO_COURSE = gql`
  mutation AssignLecturerToCourse($courseId: Int!, $lecturerId: Int!) {
    assignLecturerToCourse(courseId: $courseId, lecturerId: $lecturerId) {
      id
      name
      lecturer {
        id
        email
      }
    }
  }
`;

const UPDATE_APPLICATION_STATUS = gql`
  mutation UpdateApplicationStatus($applicationId: Int!, $status: String!) {
    updateApplicationStatusGraphQL(applicationId: $applicationId, status: $status) {
      id
      status
    }
  }
`;

const CANDIDATE_AVAILABILITY_SUBSCRIPTION = gql`
  subscription CandidateAvailabilityChanged {
    candidateAvailabilityChanged {
      candidateId
      candidateUsername
      isAvailable
      message
    }
  }
`;

export default function AdminDashboard() {
  const router = useRouter();
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);
  const [newCourseTitle, setNewCourseTitle] = useState('');
  const [newCourseDescription, setNewCourseDescription] = useState('');
  const [newApplicationStatus, setNewApplicationStatus] = useState<string>('');
  const [selectedLecturerIdForAssignment, setSelectedLecturerIdForAssignment] = useState<string | null>(null);
  const [selectedCourseIdForAssignment, setSelectedCourseIdForAssignment] = useState<string | null>(null);
  const [newCourseCode, setNewCourseCode] = useState('');
  const [newCourseSemester, setNewCourseSemester] = useState('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentEditingCourse, setCurrentEditingCourse] = useState<Course | null>(null);
  const [editCourseCode, setEditCourseCode] = useState('');
  const [editCourseName, setEditCourseName] = useState('');
  const [editCourseSemester, setEditCourseSemester] = useState('');
  const [editCourseDescription, setEditCourseDescription] = useState('');
  const [chosenCandidatesByCourse, setChosenCandidatesByCourse] = useState<Record<string, string[]>>({});
  const [unavailableCandidates, setUnavailableCandidates] = useState<Array<{
    id: number;
    username: string;
    message?: string;
  }>>([]);

  const { data: subscriptionData } = useSubscription(CANDIDATE_AVAILABILITY_SUBSCRIPTION);

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      setCurrentUserRole(JSON.parse(user).role);
    } else {
      router.push('/sign-in');
    }
  }, [router]);

  const { loading, error, data: usersData, refetch: refetchUsers } = useQuery<{ users: User[] }>(GET_USERS, {
    skip: currentUserRole !== 'admin',
    fetchPolicy: 'network-only',
  });

  const { loading: coursesLoading, data: coursesData, refetch: refetchCourses } = useQuery<{ courses: Course[] }>(GET_COURSES, {
    skip: currentUserRole !== 'admin',
    fetchPolicy: 'network-only',
  });

  const { loading: applicationsLoading, data: applicationsData } = useQuery<{ applications: Application[] }>(GET_APPLICATIONS, {
    skip: currentUserRole !== 'admin',
    fetchPolicy: 'network-only',
  });

  const { data: approvedAppsData } = useQuery<{ approvedApplicationsByCourse: Application[] }>(GET_APPROVED_APPLICATIONS_BY_COURSE, {
    skip: currentUserRole !== 'admin',
    fetchPolicy: 'network-only',
  });

  useEffect(() => {
    if (approvedAppsData?.approvedApplicationsByCourse) {
      const chosenMap: Record<string, string[]> = {};
      approvedAppsData.approvedApplicationsByCourse.forEach(app => {
        const courseName = app.course.name;
        const candidateEmail = app.user.email;
        if (!chosenMap[courseName]) {
          chosenMap[courseName] = [];
        }
        chosenMap[courseName].push(candidateEmail);
      });
      setChosenCandidatesByCourse(chosenMap);
    }
  }, [approvedAppsData]);

  useEffect(() => {
    if (subscriptionData?.candidateAvailabilityChanged) {
      const { candidateId, candidateUsername, isAvailable, message } = subscriptionData.candidateAvailabilityChanged;
      if (!isAvailable) {
        setUnavailableCandidates(prev => [...prev, { id: candidateId, username: candidateUsername, message }]);
      } else {
        setUnavailableCandidates(prev => prev.filter(c => c.id !== candidateId));
      }
    }
  }, [subscriptionData]);

  const [toggleBlockMutation] = useMutation(TOGGLE_BLOCK_USER);
  const [addCourseMutation] = useMutation(ADD_COURSE);
  const [updateApplicationStatusMutation] = useMutation(UPDATE_APPLICATION_STATUS);
  const [updateCourseMutation] = useMutation(UPDATE_COURSE);
  const [deleteCourseMutation] = useMutation(DELETE_COURSE);
  const [assignLecturerToCourseMutation] = useMutation(ASSIGN_LECTURER_TO_COURSE);

  const handleToggleBlock = async (userId: string, currentBlockStatus: boolean) => {
    try {
      await toggleBlockMutation({ variables: { userId: Number(userId), isBlocked: !currentBlockStatus } });
      await refetchUsers();
    } catch (error) { console.error('Error toggling user block status:', error); }
  };

  const handleAddCourse = async () => {
    if (!newCourseCode || !newCourseTitle || !newCourseSemester) {
      toast.error('Please fill in all course fields (Code, Name, Semester).');
      return;
    }
    try {
      await addCourseMutation({ variables: { code: newCourseCode, name: newCourseTitle, semester: newCourseSemester, description: newCourseDescription } });
      refetchCourses();
      toast.success('Course added successfully!');
      setNewCourseCode('');
      setNewCourseTitle('');
      setNewCourseSemester('');
      setNewCourseDescription('');
    } catch (error: any) { toast.error(error.message || 'Failed to add course'); }
  };

  const handleEditCourse = (course: Course) => {
    setCurrentEditingCourse(course);
    setEditCourseCode(course.code);
    setEditCourseName(course.name);
    setEditCourseSemester(course.semester);
    setEditCourseDescription(course.description || '');
    setIsEditModalOpen(true);
  };

  const handleSaveEditedCourse = async () => {
    if (!currentEditingCourse) return;
    try {
      await updateCourseMutation({ variables: { id: currentEditingCourse.id, code: editCourseCode, name: editCourseName, semester: editCourseSemester, description: editCourseDescription } });
      refetchCourses();
      toast.success('Course updated successfully!');
      setIsEditModalOpen(false);
      setCurrentEditingCourse(null);
    } catch (error: any) { toast.error(error.message || 'Failed to update course'); }
  };

  const handleDeleteCourse = async (courseId: number) => {
    if (!confirm("Are you sure you want to delete this course?")) return;
    try {
      await deleteCourseMutation({ variables: { id: Number(courseId) } });
      await refetchCourses();
      toast.success('Course deleted successfully!');
    } catch (error: any) { toast.error(error.message || 'Failed to delete course'); }
  };

  const handleUpdateApplicationStatus = async (applicationId: string, status: string) => {
    if (!status || !['pending', 'accepted', 'rejected', 'approved'].includes(status)) {
      toast.error('Please select a valid status for the application.');
      return;
    }
    try {
      await updateApplicationStatusMutation({
        variables: { applicationId: Number(applicationId), status },
        refetchQueries: [{ query: GET_APPLICATIONS }, { query: GET_APPROVED_APPLICATIONS_BY_COURSE }]
      });
      toast.success('Application status updated successfully!');
    } catch (error) { console.error('Error updating application status:', error); toast.error('Failed to update application status'); }
  };

  const handleViewApplication = (applicationId: number) => {
    toast.info(`Viewing details for Application ID: ${applicationId}`);
  };

  const handleAssignLecturerToCourse = async () => {
    if (!selectedLecturerIdForAssignment || !selectedCourseIdForAssignment) {
      toast.error('Please select both a lecturer and a course to assign.');
      return;
    }
    try {
      await assignLecturerToCourseMutation({ variables: { courseId: parseInt(selectedCourseIdForAssignment), lecturerId: parseInt(selectedLecturerIdForAssignment) } });
      refetchCourses();
      toast.success('Lecturer assigned to course successfully!');
      setSelectedLecturerIdForAssignment(null);
      setSelectedCourseIdForAssignment(null);
    } catch (error: any) { toast.error(error.message || 'Failed to assign lecturer to course'); }
  };

  if (currentUserRole && currentUserRole !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-4">Access Denied</h2>
          <p className="text-center text-gray-600">You do not have permission to view this page.</p>
        </div>
      </div>
    );
  }

  if (loading || coursesLoading || applicationsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-red-50 p-8 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-2xl font-bold text-center text-red-900 mb-4">Error</h2>
        <p className="text-center text-red-600">{error.message}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen">
      <div className="container mx-auto py-10">
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h1 className="text-4xl font-bold pb-4">Admin Dashboard</h1>

          <div className="mb-12">
            <h2 className="text-3xl font-semibold pb-4">Users ({usersData?.users?.length || 0})</h2>
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Blocked</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usersData?.users?.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.id}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell><span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : user.role === 'lecturer' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>{user.role}</span></TableCell>
                      <TableCell><span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${user.is_blocked ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>{user.is_blocked ? 'Yes' : 'No'}</span></TableCell>
                      <TableCell><Button onClick={() => handleToggleBlock(String(user.id), user.is_blocked)} className={user.is_blocked ? "bg-green-600 hover:bg-green-700 text-white" : "bg-red-600 hover:bg-red-700 text-white"}>{user.is_blocked ? "Unblock" : "Block"}</Button></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          <div className="mb-12">
            <h2 className="text-3xl font-semibold pb-4">Add New Course</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2"><Label htmlFor="courseCode">Course Code</Label><Input id="courseCode" type="text" placeholder="e.g., COMP101" value={newCourseCode} onChange={(e) => setNewCourseCode(e.target.value)} /></div>
              <div className="space-y-2"><Label htmlFor="courseName">Course Name</Label><Input id="courseName" type="text" placeholder="Enter course name" value={newCourseTitle} onChange={(e) => setNewCourseTitle(e.target.value)} /></div>
              <div className="space-y-2"><Label htmlFor="courseSemester">Course Semester</Label><Input id="courseSemester" type="text" placeholder="e.g., Fall 2024" value={newCourseSemester} onChange={(e) => setNewCourseSemester(e.target.value)} /></div>
              <div className="space-y-2"><Label htmlFor="courseDescription">Course Description</Label><Input id="courseDescription" type="text" placeholder="Enter course description" value={newCourseDescription} onChange={(e) => setNewCourseDescription(e.target.value)} /></div>
            </div>
            <div className="mt-4"><Button onClick={handleAddCourse} className="w-fit">Add Course</Button></div>
          </div>

          <div className="mb-12">
            <h2 className="text-3xl font-semibold pb-4">Assign Lecturer to Course</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2"><Label htmlFor="selectLecturer">Select Lecturer</Label><Select onValueChange={setSelectedLecturerIdForAssignment} value={selectedLecturerIdForAssignment || ""}><SelectTrigger id="selectLecturer" className="w-full"><SelectValue placeholder="Choose a lecturer" /></SelectTrigger><SelectContent className="bg-white z-50 relative shadow-lg">{usersData?.users?.filter(user => user.role === 'lecturer').map(lecturer => (<SelectItem key={lecturer.id} value={String(lecturer.id)}>{lecturer.email}</SelectItem>))}</SelectContent></Select></div>
              <div className="space-y-2"><Label htmlFor="selectCourse">Select Course</Label><Select onValueChange={setSelectedCourseIdForAssignment} value={selectedCourseIdForAssignment || ""}><SelectTrigger id="selectCourse" className="w-full"><SelectValue placeholder="Choose a course" /></SelectTrigger><SelectContent className="bg-white z-50 relative shadow-lg">{coursesData?.courses?.map(course => (<SelectItem key={course.id} value={String(course.id)}>{course.name}</SelectItem>))}</SelectContent></Select></div>
            </div>
            <div className="mt-4"><Button onClick={handleAssignLecturerToCourse} className="w-fit">Assign Lecturer</Button></div>
          </div>

          <div className="mb-12">
            <h2 className="text-3xl font-semibold pb-4">Courses ({coursesData?.courses?.length || 0})</h2>
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <Table>
                <TableHeader><TableRow><TableHead>ID</TableHead><TableHead>Code</TableHead><TableHead>Name</TableHead><TableHead>Semester</TableHead><TableHead>Description</TableHead><TableHead>Assigned Lecturer</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
                <TableBody>
                  {coursesData?.courses?.map((course) => (<TableRow key={course.id}><TableCell className="font-medium">{course.id}</TableCell><TableCell>{course.code}</TableCell><TableCell className="font-medium">{course.name}</TableCell><TableCell>{course.semester}</TableCell><TableCell>{course.description}</TableCell><TableCell>{course.lecturer ? <span className="text-blue-600">{course.lecturer.email}</span> : <span className="text-gray-500">Not assigned</span>}</TableCell><TableCell><div className="flex space-x-2"><Button variant="outline" size="sm" onClick={() => handleEditCourse(course)}>Edit</Button><Button variant="destructive" size="sm" onClick={() => handleDeleteCourse(course.id)}>Delete</Button></div></TableCell></TableRow>))}
                </TableBody>
              </Table>
            </div>
          </div>

          <div className="mb-12">
            <h2 className="text-3xl font-semibold pb-4">Applications ({applicationsData?.applications?.length || 0})</h2>
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <Table>
                <TableHeader><TableRow><TableHead>ID</TableHead><TableHead>Applicant</TableHead><TableHead>Course</TableHead><TableHead>Status</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
                <TableBody>
                  {applicationsData?.applications.map((application) => (<TableRow key={application.id}><TableCell className="font-medium">{application.id}</TableCell><TableCell>{application.user.email}</TableCell><TableCell>{application.course.name}</TableCell><TableCell><span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${application.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : application.status === 'accepted' ? 'bg-green-100 text-green-800' : application.status === 'approved' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'}`}>{application.status}</span></TableCell><TableCell><div className="flex items-center space-x-2"><Select defaultValue={application.status} onValueChange={(value) => setNewApplicationStatus(value)}><SelectTrigger className="w-[180px]"><SelectValue placeholder="Update Status" /></SelectTrigger><SelectContent><SelectItem value="pending">Pending</SelectItem><SelectItem value="accepted">Accepted</SelectItem><SelectItem value="rejected">Rejected</SelectItem><SelectItem value="approved">Approved</SelectItem></SelectContent></Select><Button size="sm" onClick={() => handleUpdateApplicationStatus(String(application.id), newApplicationStatus)} className="bg-blue-600 hover:bg-blue-700 text-white">Update</Button><Button variant="outline" size="sm" onClick={() => handleViewApplication(application.id)}>View</Button></div></TableCell></TableRow>))}
                </TableBody>
              </Table>
            </div>
          </div>
          
          {currentUserRole === 'admin' && (
            <div className="mt-8">
              <h2 className="text-3xl font-bold pb-6">Admin Reports</h2>
              <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-4 text-gray-800">Candidates Chosen for Each Course</h3>
                  {Object.entries(chosenCandidatesByCourse).length > 0 ? (
                    <div className="space-y-6">
                      {Object.entries(chosenCandidatesByCourse).map(([courseName, candidates]) => (
                        <div key={courseName} className="border rounded-lg p-4 bg-gray-50">
                          <h4 className="text-lg font-medium text-gray-700 mb-3">{courseName}</h4>
                          <div className="overflow-x-auto">
                            <Table className="min-w-full divide-y divide-gray-200">
                              <TableHeader className="bg-gray-100">
                                <TableRow>
                                  <TableHead className="px-4 py-2 text-left text-sm font-medium text-gray-600">Candidate</TableHead>
                                  <TableHead className="px-4 py-2 text-left text-sm font-medium text-gray-600">Email</TableHead>
                                  <TableHead className="px-4 py-2 text-left text-sm font-medium text-gray-600">Assigned Lecturer</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody className="divide-y divide-gray-200">
                                {candidates.map((candidate, index) => {
                                  const app = approvedAppsData?.approvedApplicationsByCourse.find(a => a.user.email === candidate);
                                  return (
                                    <TableRow key={index}>
                                      <TableCell className="px-4 py-2 text-sm text-gray-700">{app?.user.username}</TableCell>
                                      <TableCell className="px-4 py-2 text-sm text-gray-700">{candidate}</TableCell>
                                      <TableCell className="px-4 py-2 text-sm text-gray-700">
                                        {app?.course.lecturer ? (
                                          <div><div className="font-medium">{app.course.lecturer.username}</div><div className="text-xs text-gray-500">{app.course.lecturer.email}</div></div>
                                        ) : (<span className="text-gray-400">Not assigned</span>)}
                                      </TableCell>
                                    </TableRow>
                                  );
                                })}
                              </TableBody>
                            </Table>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (<p className="text-gray-500 italic">No candidates have been approved for any courses yet.</p>)}
                </div>
              </div>
              {unavailableCandidates.length > 0 && (
                <div className="mb-8 p-6 bg-white rounded-lg shadow-md">
                  <h2 className="text-xl font-semibold mb-4">Unavailable Candidates</h2>
                  <div className="space-y-4">
                    {unavailableCandidates.map(candidate => (
                      <div key={candidate.id} className="p-4 bg-red-50 border border-red-200 rounded-md">
                        <p className="text-red-700 font-medium">{candidate.username}</p>
                        {candidate.message && (<p className="text-red-600 mt-1">{candidate.message}</p>)}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Course</DialogTitle>
            <DialogDescription>Edit the details of the selected course.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="editCode" className="text-right">Code</Label><Input id="editCode" value={editCourseCode} onChange={(e) => setEditCourseCode(e.target.value)} className="col-span-3" /></div>
            <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="editName" className="text-right">Name</Label><Input id="editName" value={editCourseName} onChange={(e) => setEditCourseName(e.target.value)} className="col-span-3" /></div>
            <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="editSemester" className="text-right">Semester</Label><Input id="editSemester" value={editCourseSemester} onChange={(e) => setEditCourseSemester(e.target.value)} className="col-span-3" /></div>
            <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="editDescription" className="text-right">Description</Label><Input id="editDescription" value={editCourseDescription} onChange={(e) => setEditCourseDescription(e.target.value)} className="col-span-3" /></div>
          </div>
          <DialogFooter><Button onClick={handleSaveEditedCourse} variant="default">Save changes</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}