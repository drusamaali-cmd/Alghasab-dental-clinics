import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, Bell, Award, Users, Star } from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();
  const featuresRef = useRef(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white">
              <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 2C5.58 2 2 5.58 2 10s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6zm-1-9h2v5h-2zm0 6h2v2h-2z"/>
              </svg>
            </div>
            <div className="text-right">
              <h1 className="text-2xl font-bold text-gray-900">عيادات الغصاب</h1>
              <p className="text-sm text-gray-600">Alghasab Dental Clinics</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={() => navigate('/patient/login')}
              data-testid="patient-login-btn"
              className="hover:bg-blue-50"
            >
              دخول المراجعين
            </Button>
            <Button 
              onClick={() => navigate('/admin/login')}
              data-testid="admin-login-btn"
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
            >
              دخول الإدارة
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
          <h2 className="text-5xl sm:text-6xl font-bold text-gray-900 leading-tight">
            ابتسامتك الصحية
            <span className="block mt-2 bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
              تبدأ من هنا
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            نظام ذكي ومتكامل لإدارة مواعيدك في عيادات الغصاب لطب الأسنان.
            احجز، استلم التذكيرات، وقيّم تجربتك بكل سهولة.
          </p>
          <div className="flex gap-4 justify-center mt-8">
            <Button 
              size="lg"
              onClick={() => navigate('/patient/login')}
              data-testid="get-started-btn"
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-lg px-8 py-6 rounded-full shadow-lg hover:shadow-xl"
            >
              ابدأ الآن
            </Button>
            <Button 
              size="lg"
              variant="outline"
              onClick={() => {
                if (featuresRef.current) {
                  featuresRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
              }}
              className="text-lg px-8 py-6 rounded-full border-2 border-blue-600 text-blue-600 hover:bg-blue-50"
            >
              تعرف أكثر
            </Button>
          </div>
        </div>
      </section>

      {/* Medical Instructions Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-700 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h3 className="text-4xl font-bold text-center text-white mb-12">
              تعليمات طبية مهمة
            </h3>
            <div className="grid md:grid-cols-2 gap-8">
              {/* Before Treatment Card */}
              <div className="bg-white rounded-2xl p-8 shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105">
                <div className="flex items-center justify-center mb-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-4xl">
                    📋
                  </div>
                </div>
                <h4 className="text-2xl font-bold text-gray-900 mb-4 text-center">
                  قبل البدء بالعلاج
                </h4>
                <p className="text-gray-600 text-center mb-6 leading-relaxed">
                  تعليمات مهمة يجب قراءتها قبل حضورك للعيادة لضمان أفضل نتائج العلاج
                </p>
                <div className="flex justify-center">
                  <Button 
                    onClick={() => navigate('/before-treatment')}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl shadow-lg"
                  >
                    اعرض التعليمات
                  </Button>
                </div>
              </div>

              {/* After Treatment Card */}
              <div className="bg-white rounded-2xl p-8 shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105">
                <div className="flex items-center justify-center mb-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-4xl">
                    ✅
                  </div>
                </div>
                <h4 className="text-2xl font-bold text-gray-900 mb-4 text-center">
                  تعليمات ما بعد العلاج
                </h4>
                <p className="text-gray-600 text-center mb-6 leading-relaxed">
                  تعليمات مفصلة حسب نوع العلاج للعناية بأسنانك بعد الإجراء الطبي
                </p>
                <div className="flex justify-center">
                  <Button 
                    onClick={() => navigate('/after-treatment')}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl shadow-lg"
                  >
                    اعرض التعليمات
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section ref={featuresRef} className="container mx-auto px-4 py-20">
        <h3 className="text-4xl font-bold text-center text-gray-900 mb-16">
          لماذا تختار <span className="text-blue-600">عيادات الغصاب</span>؟
        </h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <FeatureCard 
            icon={<Calendar className="w-8 h-8" />}
            title="حجز سهل وسريع"
            description="احجز موعدك مع الطبيب المفضل في أي وقت ومن أي مكان"
            color="blue"
          />
          <FeatureCard 
            icon={<Bell className="w-8 h-8" />}
            title="تذكيرات ذكية"
            description="استلم إشعارات قبل موعدك بـ 24 ساعة و3 ساعات"
            color="sky"
          />
          <FeatureCard 
            icon={<Clock className="w-8 h-8" />}
            title="إدارة مرنة"
            description="عدّل أو ألغي موعدك بكل سهولة من التطبيق"
            color="indigo"
          />
          <FeatureCard 
            icon={<Star className="w-8 h-8" />}
            title="تقييم الخدمة"
            description="شارك تجربتك وساعدنا في تحسين خدماتنا"
            color="amber"
          />
          <FeatureCard 
            icon={<Award className="w-8 h-8" />}
            title="عروض حصرية"
            description="احصل على عروض وخصومات خاصة للمستخدمين"
            color="emerald"
          />
          <FeatureCard 
            icon={<Users className="w-8 h-8" />}
            title="أطباء متخصصون"
            description="فريق من أفضل أطباء الأسنان المتخصصين"
            color="violet"
          />
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-700 py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
            <StatItem number="30,000+" label="مراجع سعيد" />
            <StatItem number="15+" label="طبيب متخصص" />
            <StatItem number="20+" label="خدمة طبية" />
            <StatItem number="4.7" label="تقييم العملاء" />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-3xl mx-auto bg-gradient-to-br from-blue-50 to-gray-50 rounded-3xl p-12 shadow-xl">
          <h3 className="text-4xl font-bold text-gray-900 mb-4">
            جاهز لتحسين تجربتك الطبية؟
          </h3>
          <p className="text-xl text-gray-600 mb-8">
            انضم إلى آلاف المراجعين الذين اختاروا الراحة والسهولة
          </p>
          <Button 
            size="lg"
            onClick={() => navigate('/patient/login')}
            data-testid="cta-register-btn"
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-lg px-10 py-6 rounded-full shadow-lg hover:shadow-xl"
          >
            سجل الآن مجاناً
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-400">© 2025 عيادات الغصاب لطب الأسنان. جميع الحقوق محفوظة.</p>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, description, color }) => {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    sky: 'from-sky-500 to-sky-600',
    indigo: 'from-indigo-500 to-indigo-600',
    amber: 'from-amber-500 to-amber-600',
    emerald: 'from-emerald-500 to-emerald-600',
    violet: 'from-violet-500 to-violet-600'
  };

  return (
    <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl card-hover border border-gray-100">
      <div className={`w-16 h-16 bg-gradient-to-br ${colorClasses[color]} rounded-xl flex items-center justify-center text-white mb-4 mx-auto`}>
        {icon}
      </div>
      <h4 className="text-xl font-bold text-gray-900 mb-2 text-center">{title}</h4>
      <p className="text-gray-600 text-center leading-relaxed">{description}</p>
    </div>
  );
};

const StatItem = ({ number, label }) => (
  <div className="space-y-2">
    <div className="text-4xl md:text-5xl font-bold">{number}</div>
    <div className="text-blue-100 text-lg">{label}</div>
  </div>
);

export default LandingPage;