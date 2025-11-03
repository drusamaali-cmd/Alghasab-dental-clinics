import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, Bell, Award, Users, Star } from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center">
              <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">عيادات الغصاب</h1>
              <p className="text-sm text-gray-600">لطب الأسنان</p>
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
              className="text-lg px-8 py-6 rounded-full border-2 border-blue-600 text-blue-600 hover:bg-blue-50"
            >
              تعرف أكثر
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
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
            <StatItem number="10,000+" label="مراجع سعيد" />
            <StatItem number="15+" label="طبيب متخصص" />
            <StatItem number="20+" label="خدمة طبية" />
            <StatItem number="4.9" label="تقييم العملاء" />
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