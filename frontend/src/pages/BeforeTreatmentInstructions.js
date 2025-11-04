import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Home } from 'lucide-react';

const BeforeTreatmentInstructions = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 space-x-reverse">
              <img 
                src="https://i.postimg.cc/sDf8Y5gq/New-Project.png" 
                alt="Alghasab Dental Clinics" 
                className="h-12 w-12 rounded-full border-2 border-white shadow-md"
              />
              <div>
                <h1 className="text-2xl font-bold text-white">عيادات الغصاب لطب الأسنان</h1>
                <p className="text-green-100 text-sm">Alghasab Dental Clinics</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/')}
              className="flex items-center space-x-2 space-x-reverse bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-all duration-200"
            >
              <Home size={20} />
              <span>الرئيسية</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Title Section */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-block bg-gradient-to-r from-green-600 to-green-700 text-white px-8 py-4 rounded-2xl shadow-lg mb-6">
            <h2 className="text-3xl font-bold mb-2">ماذا يجب أن تفعل قبل البدء بعلاج الأسنان؟</h2>
            <p className="text-green-100 text-lg">What Should You Do Before Starting Dental Treatment?</p>
          </div>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            للحصول على تعليمات مفصلة قبل بدء علاج الأسنان، الرجاء مسح رمز الاستجابة السريعة أدناه
          </p>
        </div>

        {/* QR Code Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 hover:shadow-3xl transition-all duration-300">
          <div className="flex flex-col items-center">
            <div className="bg-gradient-to-br from-blue-100 to-green-100 p-8 rounded-3xl mb-6">
              <img 
                src="https://customer-assets.emergentagent.com/job_dental-booking-16/artifacts/o727fz0b_Screenshot_20251104_101919_WhatsApp.jpg"
                alt="تعليمات قبل البدء بالعلاج"
                className="w-full max-w-2xl rounded-2xl shadow-lg"
              />
            </div>
            
            <div className="text-center mt-4">
              <p className="text-gray-700 font-medium text-lg mb-2">
                📱 امسح الرمز للحصول على التعليمات الكاملة
              </p>
              <p className="text-gray-500 text-sm">
                Scan the QR code for complete instructions
              </p>
            </div>
          </div>
        </div>

        {/* Important Notice */}
        <div className="mt-8 bg-green-50 border-r-4 border-green-600 p-6 rounded-lg">
          <div className="flex items-start space-x-3 space-x-reverse">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                <span className="text-white text-xl">⚕️</span>
              </div>
            </div>
            <div>
              <h3 className="text-green-800 font-bold text-lg mb-2">ملاحظة مهمة</h3>
              <p className="text-green-700">
                يرجى قراءة التعليمات بعناية قبل موعدك لضمان الحصول على أفضل نتائج العلاج. إذا كان لديك أي استفسارات، لا تتردد في الاتصال بنا.
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate('/after-treatment')}
            className="flex items-center justify-center space-x-2 space-x-reverse bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl shadow-lg transition-all duration-200 transform hover:scale-105"
          >
            <span>تعليمات ما بعد العلاج</span>
            <ArrowRight size={20} />
          </button>
          <button
            onClick={() => navigate('/')}
            className="flex items-center justify-center space-x-2 space-x-reverse bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-xl transition-all duration-200"
          >
            <Home size={20} />
            <span>العودة للصفحة الرئيسية</span>
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-900 text-white py-8 mt-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="flex justify-center space-x-6 space-x-reverse mb-4">
            <a href="https://www.tiktok.com/@gdental.sa" target="_blank" rel="noopener noreferrer" className="hover:text-green-400 transition-colors">
              <span className="text-2xl">📱</span> TikTok
            </a>
            <a href="https://x.com/gdental_sa" target="_blank" rel="noopener noreferrer" className="hover:text-green-400 transition-colors">
              <span className="text-2xl">✖️</span> X (Twitter)
            </a>
            <a href="https://www.instagram.com/gdental.sa/" target="_blank" rel="noopener noreferrer" className="hover:text-green-400 transition-colors">
              <span className="text-2xl">📷</span> Instagram
            </a>
            <a href="https://www.snapchat.com/add/gdental" target="_blank" rel="noopener noreferrer" className="hover:text-green-400 transition-colors">
              <span className="text-2xl">👻</span> Snapchat
            </a>
          </div>
          <p className="text-gray-400">© 2024 عيادات الغصاب لطب الأسنان. جميع الحقوق محفوظة.</p>
        </div>
      </div>
    </div>
  );
};

export default BeforeTreatmentInstructions;