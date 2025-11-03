import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import axios from 'axios';
import { ArrowRight, Phone, Lock } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const PatientLogin = ({ onLogin }) => {
  const navigate = useNavigate();
  const [step, setStep] = useState('phone'); // phone or otp
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [sentOtp, setSentOtp] = useState('');

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!phone || phone.length < 9) {
      toast.error('الرجاء إدخال رقم جوال صحيح');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API}/auth/send-otp`, { phone });
      setSentOtp(response.data.otp); // For development only
      setStep('otp');
      toast.success(`تم إرسال رمز التحقق (${response.data.otp})`);
    } catch (error) {
      toast.error('حدث خطأ في إرسال رمز التحقق');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      toast.error('الرجاء إدخال رمز التحقق المكون من 6 أرقام');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API}/auth/verify-otp`, { phone, otp });
      toast.success('تم تسجيل الدخول بنجاح');
      onLogin(response.data.user, response.data.token);
      navigate('/patient/dashboard');
    } catch (error) {
      toast.error('رمز التحقق غير صحيح أو منتهي الصلاحية');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center">
              <svg className="w-9 h-9 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">عيادات الغصاب</h1>
          <p className="text-gray-600">لطب الأسنان</p>
        </div>

        <Card className="shadow-2xl border-0">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl text-center font-bold">
              {step === 'phone' ? 'تسجيل الدخول' : 'رمز التحقق'}
            </CardTitle>
            <CardDescription className="text-center text-base">
              {step === 'phone' 
                ? 'أدخل رقم جوالك للحصول على رمز التحقق'
                : `أدخل الرمز المرسل إلى ${phone}`
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {step === 'phone' ? (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">رقم الجوال</label>
                  <div className="relative">
                    <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      type="tel"
                      placeholder="05xxxxxxxx"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="pr-12 text-lg py-6"
                      data-testid="phone-input"
                      dir="ltr"
                    />
                  </div>
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 py-6 text-lg"
                  disabled={loading}
                  data-testid="send-otp-btn"
                >
                  {loading ? 'جاري الإرسال...' : 'إرسال رمز التحقق'}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">رمز التحقق</label>
                  <div className="relative">
                    <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="000000"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      className="pr-12 text-lg py-6 tracking-widest"
                      data-testid="otp-input"
                      dir="ltr"
                      maxLength={6}
                    />
                  </div>
                  {sentOtp && (
                    <p className="text-sm text-blue-600 text-center mt-2">
                      رمز التحقق للتطوير: {sentOtp}
                    </p>
                  )}
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 py-6 text-lg"
                  disabled={loading}
                  data-testid="verify-otp-btn"
                >
                  {loading ? 'جاري التحقق...' : 'تحقق وتسجيل الدخول'}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  onClick={() => setStep('phone')}
                  data-testid="back-to-phone-btn"
                >
                  العودة لإدخال رقم الجوال
                </Button>
              </form>
            )}

            <div className="mt-6 text-center">
              <Button
                variant="link"
                onClick={() => navigate('/')}
                className="text-gray-600 hover:text-gray-900"
                data-testid="back-to-home-btn"
              >
                <ArrowRight className="w-4 h-4 ml-2" />
                العودة للرئيسية
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PatientLogin;