import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Smartphone, Mail, ArrowLeft } from 'lucide-react';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const LoginPage = () => {
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [mobileData, setMobileData] = useState({ phone: '', otp: '', name: '' });
  const [otpSent, setOtpSent] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(loginData.email, loginData.password);
      toast({ title: 'Login successful', description: `Welcome back, ${user.name}!` });
      redirectBasedOnRole(user.role);
    } catch (error) {
      toast({ title: 'Login failed', description: error.response?.data?.detail || 'Invalid credentials', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleSendOTP = async () => {
    if (!mobileData.phone || mobileData.phone.length < 10) {
      toast({ title: 'Invalid phone', description: 'Please enter a valid 10-digit mobile number', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API}/auth/send-otp`, {
        phone: mobileData.phone
      });
      
      setOtpSent(true);
      setOtpTimer(300); // 5 minutes
      
      // Start countdown
      const interval = setInterval(() => {
        setOtpTimer(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      toast({ 
        title: 'OTP sent!', 
        description: response.data.otp ? `Your OTP: ${response.data.otp}` : 'Please check your phone for OTP'
      });
    } catch (error) {
      toast({ title: 'Failed to send OTP', description: error.response?.data?.detail || 'Please try again', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    
    if (!mobileData.otp || mobileData.otp.length !== 6) {
      toast({ title: 'Invalid OTP', description: 'Please enter 6-digit OTP', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API}/auth/verify-otp`, {
        phone: mobileData.phone,
        otp: mobileData.otp,
        name: mobileData.name || undefined
      });
      
      const { access_token, user } = response.data;
      
      // Store token
      localStorage.setItem('token', access_token);
      
      toast({ title: 'Login successful', description: `Welcome, ${user.name}!` });
      
      // Reload to trigger auth context
      window.location.href = '/';
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'Invalid OTP';
      
      // If name is required, show input
      if (errorMsg.includes('Name is required')) {
        toast({ title: 'Welcome!', description: 'Please enter your name to complete registration' });
      } else {
        toast({ title: 'Verification failed', description: errorMsg, variant: 'destructive' });
      }
    } finally {
      setLoading(false);
    }
  };

  const redirectBasedOnRole = (role) => {
    switch (role) {
      case 'admin':
        navigate('/admin');
        break;
      case 'branch_manager':
        navigate('/branch-manager');
        break;
      case 'waiter':
        navigate('/waiter');
        break;
      case 'kitchen_staff':
        navigate('/kitchen');
        break;
      case 'delivery_partner':
        navigate('/delivery');
        break;
      case 'customer':
        navigate('/my-orders');
        break;
      default:
        navigate('/');
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl border-red-100" data-testid="login-card">
        <CardHeader className="text-center border-b border-red-50 pb-6">
          <div className="flex justify-center mb-4">
            <img src="/altaj-logo.png" alt="Al Taj Restaurant" className="h-20 w-auto" />
          </div>
          <CardTitle className="text-3xl font-light">Welcome Back</CardTitle>
          <CardDescription className="text-base">Sign in to your Al Taj account</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <Tabs defaultValue="mobile" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="mobile" className="flex items-center gap-2" data-testid="mobile-tab">
                <Smartphone className="h-4 w-4" />
                Mobile
              </TabsTrigger>
              <TabsTrigger value="email" className="flex items-center gap-2" data-testid="email-tab">
                <Mail className="h-4 w-4" />
                Email
              </TabsTrigger>
            </TabsList>

            {/* Mobile OTP Login */}
            <TabsContent value="mobile">
              <form onSubmit={handleVerifyOTP} className="space-y-4" data-testid="mobile-form">
                <div>
                  <Label htmlFor="mobile-phone">Mobile Number</Label>
                  <div className="flex gap-2">
                    <Input
                      id="mobile-phone"
                      type="tel"
                      placeholder="9876543210"
                      value={mobileData.phone}
                      onChange={(e) => setMobileData({ ...mobileData, phone: e.target.value })}
                      disabled={otpSent}
                      className="flex-1"
                      data-testid="mobile-phone-input"
                      maxLength={10}
                    />
                    {!otpSent && (
                      <Button 
                        type="button" 
                        onClick={handleSendOTP} 
                        disabled={loading}
                        className="bg-red-600 hover:bg-red-700"
                        data-testid="send-otp-button"
                      >
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Send OTP'}
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Enter 10-digit mobile number</p>
                </div>

                {otpSent && (
                  <>
                    <div>
                      <Label htmlFor="mobile-otp">Enter OTP</Label>
                      <Input
                        id="mobile-otp"
                        type="text"
                        placeholder="6-digit OTP"
                        value={mobileData.otp}
                        onChange={(e) => setMobileData({ ...mobileData, otp: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                        maxLength={6}
                        className="text-center text-2xl tracking-widest"
                        data-testid="otp-input"
                      />
                      <div className="flex justify-between items-center mt-2">
                        <p className="text-xs text-gray-500">OTP sent to +91-{mobileData.phone}</p>
                        {otpTimer > 0 ? (
                          <p className="text-xs text-red-500 font-medium">{formatTime(otpTimer)}</p>
                        ) : (
                          <Button 
                            type="button" 
                            variant="link" 
                            onClick={() => { setOtpSent(false); handleSendOTP(); }}
                            className="text-xs p-0 h-auto"
                          >
                            Resend OTP
                          </Button>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="mobile-name">Your Name (for new users)</Label>
                      <Input
                        id="mobile-name"
                        type="text"
                        placeholder="Rajesh Kumar"
                        value={mobileData.name}
                        onChange={(e) => setMobileData({ ...mobileData, name: e.target.value })}
                        data-testid="mobile-name-input"
                      />
                      <p className="text-xs text-gray-500 mt-1">Required only for first-time login</p>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full h-12 bg-red-600 hover:bg-red-700" 
                      disabled={loading || !mobileData.otp || mobileData.otp.length !== 6}
                      data-testid="verify-otp-button"
                    >
                      {loading ? (
                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verifying...</>
                      ) : (
                        'Verify & Continue'
                      )}
                    </Button>

                    <Button 
                      type="button" 
                      variant="ghost" 
                      onClick={() => { setOtpSent(false); setMobileData({ phone: '', otp: '', name: '' }); }}
                      className="w-full"
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" /> Change Number
                    </Button>
                  </>
                )}
              </form>
            </TabsContent>

            {/* Email/Password Login */}
            <TabsContent value="email">
              <form onSubmit={handleLogin} className="space-y-4" data-testid="login-form">
                <div>
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={loginData.email}
                    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                    required
                    data-testid="login-email-input"
                  />
                </div>
                <div>
                  <Label htmlFor="login-password">Password</Label>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="••••••••"
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    required
                    data-testid="login-password-input"
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full h-12 bg-red-600 hover:bg-red-700" 
                  disabled={loading} 
                  data-testid="login-submit-button"
                >
                  {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Logging in...</> : 'Login'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          {/* Social Login Section */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">Or continue with</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-4">
              {/* Google Login Button */}
              <Button
                type="button"
                variant="outline"
                className="h-12 border-gray-300 hover:bg-gray-50"
                onClick={handleGoogleLogin}
                disabled={loading}
                data-testid="google-login-btn"
              >
                <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Google
              </Button>

              {/* Facebook Login Button */}
              <Button
                type="button"
                variant="outline"
                className="h-12 border-gray-300 hover:bg-blue-50 text-blue-600"
                onClick={handleFacebookLogin}
                disabled={loading}
                data-testid="facebook-login-btn"
              >
                <svg className="h-5 w-5 mr-2" fill="#1877F2" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                Facebook
              </Button>
            </div>
          </div>

          <div className="mt-6 text-center">
            <Button variant="link" onClick={() => navigate('/')} data-testid="back-to-home-button" className="text-red-600">
              Back to Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;