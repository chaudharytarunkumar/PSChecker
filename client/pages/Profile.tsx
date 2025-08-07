import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, User, LogOut, History, AlertTriangle, CheckCircle, Settings } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface PasswordHistoryItem {
  id: string;
  strength: string;
  score: number;
  entropy: number;
  isBreached: boolean;
  breachCount: number;
  createdAt: string;
}

interface UserProfile {
  id: string;
  email: string;
  role: string;
  createdAt: string;
  lastLogin: string | null;
  twoFactorEnabled: boolean;
  passwordHistory: PasswordHistoryItem[];
}

export default function Profile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const { user, logout, isAuthenticated, token } = useAuth();
  const navigate = useNavigate();

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // Fetch user profile
  useEffect(() => {
    if (!token || !isAuthenticated) return;

    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/auth/profile', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setProfile(data.user);
        } else {
          setError('Failed to load profile');
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        setError('Failed to load profile');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [token, isAuthenticated]);

  const getStrengthColor = (strength: string) => {
    switch (strength) {
      case 'Very Strong': return 'bg-emerald-500';
      case 'Strong': return 'bg-green-500';
      case 'Good': return 'bg-blue-500';
      case 'Fair': return 'bg-yellow-500';
      case 'Weak': return 'bg-orange-500';
      case 'Very Weak': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading profile...</p>
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
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">SecurePass</h1>
            </Link>
            <nav className="flex items-center gap-4">
              <Button variant="ghost" asChild>
                <Link to="/">Password Checker</Link>
              </Button>
              {user?.role === 'admin' && (
                <Button variant="outline" asChild>
                  <Link to="/admin">Admin Panel</Link>
                </Button>
              )}
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
        <div className="max-w-4xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
              User Profile
            </h2>
            <p className="text-slate-600 dark:text-slate-300">
              Manage your account settings and view your password security history
            </p>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-8">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {profile && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Profile Info */}
              <div className="lg:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Account Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-slate-600">Email</label>
                      <p className="text-lg">{profile.email}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-600">Role</label>
                      <div className="mt-1">
                        <Badge variant={profile.role === 'admin' ? 'default' : 'secondary'}>
                          {profile.role}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-600">Member Since</label>
                      <p>{new Date(profile.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-600">Last Login</label>
                      <p>{profile.lastLogin ? new Date(profile.lastLogin).toLocaleDateString() : 'Never'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-600">Two-Factor Auth</label>
                      <div className="mt-1">
                        <Badge variant={profile.twoFactorEnabled ? 'default' : 'secondary'}>
                          {profile.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="h-5 w-5" />
                      Security Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button variant="outline" className="w-full" disabled>
                      Change Password
                    </Button>
                    <Button variant="outline" className="w-full" disabled>
                      Enable 2FA
                    </Button>
                    <Button variant="outline" className="w-full" disabled>
                      Download Data
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Password History */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <History className="h-5 w-5" />
                      Password History
                    </CardTitle>
                    <CardDescription>
                      Your recent password strength analyses and security checks
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {profile.passwordHistory.length > 0 ? (
                      <div className="space-y-4">
                        {profile.passwordHistory.map((item, index) => (
                          <div key={item.id} className="border rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <Badge 
                                  className="text-white"
                                  style={{ backgroundColor: getStrengthColor(item.strength).replace('bg-', '#') }}
                                >
                                  {item.strength}
                                </Badge>
                                {item.isBreached && (
                                  <Badge variant="destructive">
                                    BREACHED
                                  </Badge>
                                )}
                              </div>
                              <span className="text-sm text-slate-600">
                                {new Date(item.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            
                            <div className="grid grid-cols-3 gap-4 text-sm">
                              <div>
                                <span className="text-slate-600">Score:</span>
                                <span className="ml-1 font-medium">{item.score}%</span>
                              </div>
                              <div>
                                <span className="text-slate-600">Entropy:</span>
                                <span className="ml-1 font-medium">{item.entropy} bits</span>
                              </div>
                              <div>
                                <span className="text-slate-600">Breaches:</span>
                                <span className="ml-1 font-medium">
                                  {item.isBreached ? item.breachCount.toLocaleString() : '0'}
                                </span>
                              </div>
                            </div>

                            {item.isBreached && (
                              <Alert variant="destructive" className="mt-3">
                                <AlertTriangle className="h-4 w-4" />
                                <AlertDescription>
                                  This password was found in {item.breachCount.toLocaleString()} data breaches
                                </AlertDescription>
                              </Alert>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-slate-500">
                        <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p className="text-lg font-medium mb-2">No Password History</p>
                        <p className="text-sm">
                          Use the password checker to analyze passwords and they'll appear here
                        </p>
                        <Button asChild className="mt-4">
                          <Link to="/">Check Password Strength</Link>
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
