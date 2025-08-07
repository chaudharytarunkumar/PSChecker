import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, Shield, AlertTriangle, CheckCircle, AlertCircle, Copy, RefreshCw, Loader2, LogOut, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { PasswordAnalysisResponse } from '@shared/api';

export default function Index() {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [analysis, setAnalysis] = useState<PasswordAnalysisResponse | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const { user, logout, isAuthenticated, isAdmin, token } = useAuth();

  const analyzePassword = async (pwd: string) => {
    if (!pwd) {
      setAnalysis({
        score: 0,
        strength: 'Very Weak',
        color: '#ef4444',
        suggestions: ['Enter a password to get started'],
        entropy: 0,
        crackTime: 'Instantly',
        timeToCrack: { seconds: 0, display: 'Instantly' },
        checks: {
          hasLength: false,
          hasUppercase: false,
          hasLowercase: false,
          hasNumbers: false,
          hasSpecialChars: false,
          isCommon: false
        }
      });
      return;
    }

    try {
      setIsChecking(true);
      const headers: any = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch('/api/password-analysis', {
        method: 'POST',
        headers,
        body: JSON.stringify({ password: pwd, saveToHistory: isAuthenticated }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze password');
      }

      const result: PasswordAnalysisResponse = await response.json();
      setAnalysis(result);
    } catch (error) {
      console.error('Error analyzing password:', error);
      // Fallback to local analysis if API fails
      setAnalysis({
        score: 0,
        strength: 'Very Weak',
        color: '#ef4444',
        suggestions: ['Unable to analyze password. Please try again.'],
        entropy: 0,
        crackTime: 'Unknown',
        timeToCrack: { seconds: 0, display: 'Unknown' },
        checks: {
          hasLength: false,
          hasUppercase: false,
          hasLowercase: false,
          hasNumbers: false,
          hasSpecialChars: false,
          isCommon: false
        }
      });
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      analyzePassword(password);
    }, 500); // Debounce API calls

    return () => clearTimeout(timer);
  }, [password]);

  const generatePassword = () => {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
    let result = '';
    for (let i = 0; i < 16; i++) {
      result += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    setPassword(result);
  };

  const copyPassword = () => {
    navigator.clipboard.writeText(password);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm dark:bg-slate-900/80">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">SecurePass</h1>
            </div>
            <nav className="flex items-center gap-4">
              <Button variant="ghost">Features</Button>
              <Button variant="ghost">About</Button>

              {isAuthenticated ? (
                <>
                  {isAdmin && (
                    <Button variant="outline" asChild>
                      <Link to="/admin">Admin Panel</Link>
                    </Button>
                  )}
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" asChild>
                      <Link to="/profile" className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span className="text-sm">{user?.email}</span>
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={logout}
                    >
                      <LogOut className="h-4 w-4" />
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <Button variant="outline" asChild>
                    <Link to="/login">Sign In</Link>
                  </Button>
                  <Button asChild>
                    <Link to="/register">Get Started</Link>
                  </Button>
                </>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-6xl font-bold text-slate-900 dark:text-white mb-4">
              Create <span className="text-blue-600">Unbreakable</span> Passwords
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 mb-8 max-w-3xl mx-auto">
              Advanced password strength analysis with real-time feedback, breach detection, 
              and entropy-based security insights to keep your accounts safe.
            </p>
          </div>

          {/* Password Checker Card */}
          <Card className="mb-8 shadow-xl border-0 bg-white/90 backdrop-blur-sm dark:bg-slate-800/90">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Password Strength Checker</CardTitle>
              <CardDescription>
                Enter a password to see real-time security analysis and get personalized recommendations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Password Input */}
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password here..."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pr-20 text-lg py-6"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowPassword(!showPassword)}
                    className="h-8 w-8 p-0"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  {password && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={copyPassword}
                      className="h-8 w-8 p-0"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>

              {/* Generate Password Button */}
              <div className="flex justify-center">
                <Button onClick={generatePassword} variant="outline" className="gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Generate Secure Password
                </Button>
              </div>

              {/* Analysis Results */}
              {(analysis || isChecking) && (
                <div className="space-y-6">
                  {isChecking ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin mr-2" />
                      <span className="text-sm text-slate-600">Analyzing password security...</span>
                    </div>
                  ) : analysis && (
                    <>
                      {/* Strength Header */}
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Password Strength:</span>
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant="secondary"
                            style={{
                              backgroundColor: analysis.color,
                              color: 'white'
                            }}
                            className="font-semibold"
                          >
                            {analysis.strength}
                          </Badge>
                          {analysis.isBreached && (
                            <Badge variant="destructive" className="text-xs">
                              BREACHED
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      {/* Progress Bar */}
                      <div className="relative">
                        <Progress 
                          value={analysis.score} 
                          className="h-3"
                        />
                        <div 
                          className="absolute top-0 left-0 h-3 rounded-full transition-all duration-300"
                          style={{
                            width: `${analysis.score}%`,
                            backgroundColor: analysis.color
                          }}
                        />
                      </div>

                      {/* Breach Warning */}
                      {analysis.isBreached && (
                        <Alert variant="destructive">
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription>
                            <strong>Security Alert:</strong> This password has been found in {analysis.breachCount?.toLocaleString()} data breaches. 
                            Choose a different password immediately.
                          </AlertDescription>
                        </Alert>
                      )}

                      {/* Security Metrics */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card>
                          <CardContent className="pt-4">
                            <div className="text-center">
                              <div className="text-2xl font-bold text-blue-600">{analysis.entropy}</div>
                              <div className="text-sm text-slate-600">Entropy Bits</div>
                            </div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="pt-4">
                            <div className="text-center">
                              <div className="text-2xl font-bold text-green-600">{analysis.crackTime}</div>
                              <div className="text-sm text-slate-600">To Crack</div>
                            </div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="pt-4">
                            <div className="text-center">
                              <div className="text-2xl font-bold text-purple-600">{analysis.score}%</div>
                              <div className="text-sm text-slate-600">Security Score</div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      {/* Requirements Checklist */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {[
                          { check: analysis.checks.hasLength, label: 'At least 8 characters' },
                          { check: analysis.checks.hasUppercase, label: 'Uppercase letters' },
                          { check: analysis.checks.hasLowercase, label: 'Lowercase letters' },
                          { check: analysis.checks.hasNumbers, label: 'Numbers' },
                          { check: analysis.checks.hasSpecialChars, label: 'Special characters' },
                          { check: !analysis.checks.isCommon, label: 'Not a common password' }
                        ].map((item, index) => (
                          <div key={index} className="flex items-center gap-2">
                            {item.check ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <AlertCircle className="h-4 w-4 text-red-500" />
                            )}
                            <span className={cn(
                              "text-sm",
                              item.check ? "text-green-700" : "text-red-700"
                            )}>
                              {item.label}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Suggestions */}
                      {analysis.suggestions.length > 0 && (
                        <Alert>
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription>
                            <strong>Suggestions to improve your password:</strong>
                            <ul className="mt-2 list-disc list-inside space-y-1">
                              {analysis.suggestions.map((suggestion, index) => (
                                <li key={index} className="text-sm">{suggestion}</li>
                              ))}
                            </ul>
                          </AlertDescription>
                        </Alert>
                      )}
                    </>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="text-center p-6">
              <Shield className="h-12 w-12 mx-auto mb-4 text-blue-600" />
              <h3 className="text-xl font-semibold mb-2">Real-time Analysis</h3>
              <p className="text-slate-600">Get instant feedback as you type with advanced entropy calculations</p>
            </Card>
            <Card className="text-center p-6">
              <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-orange-600" />
              <h3 className="text-xl font-semibold mb-2">Breach Detection</h3>
              <p className="text-slate-600">Check against millions of compromised passwords using Have I Been Pwned</p>
            </Card>
            <Card className="text-center p-6">
              <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-600" />
              <h3 className="text-xl font-semibold mb-2">Smart Suggestions</h3>
              <p className="text-slate-600">Personalized recommendations to make your passwords uncrackable</p>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
