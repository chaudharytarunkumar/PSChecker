import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Users, AlertTriangle, BarChart3, Eye, Settings, LogOut, User, Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

interface AdminStats {
  totalUsers: number;
  totalPasswordsChecked: number;
  breachedPasswordsFound: number;
  averagePasswordStrength: number;
  strengthDistribution: {
    'Very Weak': number;
    'Weak': number;
    'Fair': number;
    'Good': number;
    'Strong': number;
    'Very Strong': number;
  };
}

interface AdminUser {
  id: string;
  email: string;
  role: string;
  createdAt: string;
  lastLogin: string | null;
  isActive: boolean;
  passwordCount: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const { user, logout, isAdmin, token } = useAuth();
  const navigate = useNavigate();

  // Redirect non-admin users
  useEffect(() => {
    if (!isAdmin) {
      navigate('/');
    }
  }, [isAdmin, navigate]);

  // Fetch admin data
  useEffect(() => {
    if (!token || !isAdmin) return;

    const fetchAdminData = async () => {
      try {
        const headers = {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        };

        // Fetch stats
        const statsResponse = await fetch('/api/admin/stats', { headers });
        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          setStats(statsData.stats);
        }

        // Fetch users
        const usersResponse = await fetch('/api/admin/users', { headers });
        if (usersResponse.ok) {
          const usersData = await usersResponse.json();
          setUsers(usersData.users);
        }
      } catch (error) {
        console.error('Error fetching admin data:', error);
        setError('Failed to load admin data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdminData();
  }, [token, isAdmin]);

  const handleUserStatusToggle = async (userId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: !isActive }),
      });

      if (response.ok) {
        setUsers(users.map(u =>
          u.id === userId ? { ...u, isActive: !isActive } : u
        ));
      }
    } catch (error) {
      console.error('Error updating user status:', error);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setUsers(users.filter(u => u.id !== userId));
        if (stats) {
          setStats({ ...stats, totalUsers: stats.totalUsers - 1 });
        }
      }
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  if (!isAdmin) {
    return null; // Will redirect in useEffect
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm dark:bg-slate-900/80">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <Shield className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">SecurePass Admin</h1>
            </Link>
            <nav className="flex items-center gap-4">
              <Button variant="ghost" asChild>
                <Link to="/">Password Checker</Link>
              </Button>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span className="text-sm">{user?.email}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={logout}
                  className="ml-2"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
              Admin Dashboard
            </h2>
            <p className="text-slate-600 dark:text-slate-300">
              Monitor user activities, password strength trends, and security metrics
            </p>
          </div>

{error && (
            <Alert variant="destructive" className="mb-8">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Stats Grid */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">Active registered users</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Passwords Checked</CardTitle>
                  <Eye className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalPasswordsChecked.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">Total analysis requests</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Breached Passwords</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">{stats.breachedPasswordsFound}</div>
                  <p className="text-xs text-muted-foreground">Found in data breaches</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg. Strength</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{stats.averagePasswordStrength}%</div>
                  <p className="text-xs text-muted-foreground">Average security score</p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* User Management */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                User Management
              </CardTitle>
              <CardDescription>
                Manage user accounts, permissions, and activity
              </CardDescription>
            </CardHeader>
            <CardContent>
              {users.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2">Email</th>
                        <th className="text-left py-2">Role</th>
                        <th className="text-left py-2">Created</th>
                        <th className="text-left py-2">Last Login</th>
                        <th className="text-left py-2">Status</th>
                        <th className="text-left py-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user.id} className="border-b">
                          <td className="py-3">{user.email}</td>
                          <td className="py-3">
                            <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                              {user.role}
                            </Badge>
                          </td>
                          <td className="py-3 text-sm text-slate-600">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-3 text-sm text-slate-600">
                            {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                          </td>
                          <td className="py-3">
                            <Badge variant={user.isActive ? 'default' : 'destructive'}>
                              {user.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </td>
                          <td className="py-3">
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleUserStatusToggle(user.id, user.isActive)}
                                disabled={user.id === user?.id}
                              >
                                {user.isActive ? 'Deactivate' : 'Activate'}
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDeleteUser(user.id)}
                                disabled={user.id === user?.id}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-slate-500">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-2">No Users Found</p>
                  <p className="text-sm">Users will appear here once they register.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
