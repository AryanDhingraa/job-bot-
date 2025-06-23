'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Search } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

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
  user: {
    id: number;
    username: string;
    email: string;
  };
  role_applied: 'tutor' | 'lab_assistant';
  status: 'pending' | 'accepted' | 'rejected';
  applied_at: string;
  availability: 'full_time' | 'part_time';
  relevant_skills?: string[];
}

interface DashboardStats {
  totalApplications: number;
  pendingApplications: number;
  acceptedApplications: number;
  rejectedApplications: number;
  applicationsByRole: { name: string; count: number }[];
  applicationsByCourse: { name: string; count: number }[];
}

declare global {
  interface Window {
    localStorage: Storage;
  }
}

export default function LecturerPortal() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'accepted' | 'rejected'>('all');
  const [roleFilter, setRoleFilter] = useState<'all' | 'tutor' | 'lab_assistant'>('all');
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);

  const getToken = () => {
    if (typeof window !== 'undefined') {
      return window.localStorage?.getItem('token');
    }
    return null;
  };

  const fetchApplications = useCallback(async () => {
    try {
      const token = getToken();
      if (!token) {
        toast.error('Authentication required');
        return;
      }
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/lecturer/applications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setApplications(response.data);
    } catch (error) {
      toast.error('Failed to fetch applications');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchDashboardStats = useCallback(async () => {
    try {
      const token = getToken();
      if (!token) {
        toast.error('Authentication required');
        return;
      }
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/lecturer/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDashboardStats(response.data);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      toast.error('Failed to fetch dashboard statistics');
    }
  }, []);

  useEffect(() => {
    fetchApplications();
    fetchDashboardStats();
  }, [fetchApplications, fetchDashboardStats]);

  const handleStatusUpdate = async (applicationId: number, newStatus: 'accepted' | 'rejected') => {
    try {
      const token = getToken();
      if (!token) {
        toast.error('Authentication required');
        return;
      }

      await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/lecturer/applications/${applicationId}/${newStatus}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      toast.success(`Application ${newStatus}`);
      fetchApplications();
      fetchDashboardStats(); // Refresh stats after status update
    } catch (error: any) {
      toast.error(error.response?.data?.message || `Failed to ${newStatus} application`);
    }
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

  const filteredApplications = applications.filter(application => {
    const matchesSearch = 
      application.course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      application.course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      application.user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      application.user.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || application.status === statusFilter;
    const matchesRole = roleFilter === 'all' || application.role_applied === roleFilter;

    return matchesSearch && matchesStatus && matchesRole;
  });

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042']; // Colors for charts

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Lecturer Portal</h1>

      <Tabs defaultValue="applications" className="space-y-6">
        <TabsList>
          <TabsTrigger value="applications">Applications</TabsTrigger>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Overview Statistics</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardStats?.totalApplications || 0}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardStats?.pendingApplications || 0}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Accepted</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardStats?.acceptedApplications || 0}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Rejected</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardStats?.rejectedApplications || 0}</div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Applications by Role</CardTitle>
              </CardHeader>
              <CardContent>
                {dashboardStats && dashboardStats.applicationsByRole.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={dashboardStats.applicationsByRole}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                        nameKey="name"
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      >
                        {dashboardStats.applicationsByRole.map((entry, index) => (
                          <Cell key={`cell-role-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center py-4 text-muted-foreground">No data for roles.</div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Applications by Course</CardTitle>
              </CardHeader>
              <CardContent>
                {dashboardStats && dashboardStats.applicationsByCourse.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={dashboardStats.applicationsByCourse}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="count" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center py-4 text-muted-foreground">No data for courses.</div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="applications">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Application Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Search</Label>
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by course or applicant..."
                      className="pl-8"
                      value={searchTerm}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={statusFilter}
                    onValueChange={(value: 'all' | 'pending' | 'accepted' | 'rejected') => setStatusFilter(value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="accepted">Accepted</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Role</Label>
                  <Select
                    value={roleFilter}
                    onValueChange={(value: 'all' | 'tutor' | 'lab_assistant') => setRoleFilter(value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      <SelectItem value="tutor">Tutor</SelectItem>
                      <SelectItem value="lab_assistant">Lab Assistant</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {loading ? (
            <div className="text-center py-4">Loading applications...</div>
          ) : filteredApplications.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              No applications found.
            </div>
          ) : (
            <div className="space-y-4">
              {filteredApplications.map((application) => (
                <Card key={application.id}>
                  <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">
                            {application.course.code} - {application.course.name}
                          </h3>
                          <Badge variant="outline">
                            {application.role_applied === 'tutor' ? 'Tutor' : 'Lab Assistant'}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          <p>Applicant: {application.user.username}</p>
                          <p>Email: {application.user.email}</p>
                          <p>Applied: {new Date(application.applied_at).toLocaleDateString()}</p>
                          <p>Availability: {application.availability === 'full_time' ? 'Full Time' : 'Part Time'}</p>
                        </div>
                        {application.relevant_skills && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {application.relevant_skills.map((skill, index) => (
                              <Badge key={index} variant="secondary">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        <Badge className={getStatusColor(application.status)}>
                          {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                        </Badge>
                        {application.status === 'pending' && (
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              className="text-red-500 hover:text-red-600"
                              onClick={() => handleStatusUpdate(application.id, 'rejected')}
                            >
                              Reject
                            </Button>
                            <Button
                              variant="outline"
                              className="text-green-500 hover:text-green-600"
                              onClick={() => handleStatusUpdate(application.id, 'accepted')}
                            >
                              Accept
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
} 