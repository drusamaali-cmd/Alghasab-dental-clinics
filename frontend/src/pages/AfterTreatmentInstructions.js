import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, ChevronLeft } from 'lucide-react';

const AfterTreatmentInstructions = () => {
  const navigate = useNavigate();
  const [selectedTreatment, setSelectedTreatment] = useState(null);

  const treatments = [
    {
      id: 1,
      nameAr: 'خلع الأسنان',
      nameEn: 'Dental Extraction',
      icon: '🦷',
      color: 'from-red-500 to-red-600'
    },
    {
      id: 2,
      nameAr: 'علاج عصب الأسنان',
      nameEn: 'Root Canal Treatment',
      icon: '🏥',
      color: 'from-purple-500 to-purple-600'
    },
    {
      id: 3,
      nameAr: 'حشوات الأسنان',
      nameEn: 'Teeth Fillings',
      icon: '🔧',
      color: 'from-blue-500 to-blue-600'
    },
    {
      id: 4,
      nameAr: 'تبييض الأسنان',
      nameEn: 'Teeth Whitening',
      icon: '✨',
      color: 'from-yellow-400 to-yellow-500'
    },
    {
      id: 5,
      nameAr: 'تنظيف الأسنان',
      nameEn: 'Dental Cleaning',
      icon: '🪥',
      color: 'from-green-500 to-green-600'
    },
    {
      id: 6,
      nameAr: 'علاج أسنان الأطفال',
      nameEn: 'Dental Treatment for Children',
      icon: '👶',
      color: 'from-pink-500 to-pink-600'
    },
    {
      id: 7,
      nameAr: 'التركيبات المتحركة',
      nameEn: 'Removable Prosthetics',
      icon: '🔄',
      color: 'from-indigo-500 to-indigo-600'
    },
    {
      id: 8,
      nameAr: 'التركيبات الثابتة',
      nameEn: 'Fixed Prosthetics',
      icon: '🔒',
      color: 'from-teal-500 to-teal-600'
    },
    {
      id: 9,
      nameAr: 'تقويم الأسنان',
      nameEn: 'Dental Braces',
      icon: '🦷',
      color: 'from-orange-500 to-orange-600'
    },
    {
      id: 10,
      nameAr: 'زراعة الأسنان',
      nameEn: 'Dental Implant',
      icon: '⚕️',
      color: 'from-cyan-500 to-cyan-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 shadow-lg">
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
                <p className="text-blue-100 text-sm">Alghasab Dental Clinics</p>
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
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Title Section */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-block bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-4 rounded-2xl shadow-lg mb-6">
            <h2 className="text-3xl font-bold mb-2">تعليمات ما بعد العلاج</h2>
            <p className="text-blue-100 text-lg">Instructions After Treatment</p>
          </div>
          <p className="text-gray-600 text-lg max-w-3xl mx-auto">
            للحصول على تعليمات مفصلة بعد كل نوع من العلاج، الرجاء اختيار العلاج الخاص بك أدناه ومسح رمز الاستجابة السريعة
          </p>
        </div>

        {selectedTreatment === null ? (
          // Treatment Selection Grid
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {treatments.map((treatment) => (
                <button
                  key={treatment.id}
                  onClick={() => setSelectedTreatment(treatment)}
                  className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 p-6 text-right group"
                >
                  <div className={`w-16 h-16 bg-gradient-to-br ${treatment.color} rounded-2xl flex items-center justify-center text-3xl mb-4 group-hover:rotate-12 transition-transform duration-300`}>
                    {treatment.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{treatment.nameAr}</h3>
                  <p className="text-gray-500 text-sm mb-4">{treatment.nameEn}</p>
                  <div className="flex items-center justify-end space-x-2 space-x-reverse text-blue-600 font-medium">
                    <span>عرض التعليمات</span>
                    <ChevronLeft size={20} />
                  </div>
                </button>
              ))}
            </div>

            {/* All Instructions QR Code Section */}
            <div className="mt-12 bg-white rounded-3xl shadow-2xl p-8">
              <h3 className="text-2xl font-bold text-center text-gray-800 mb-6">
                جميع التعليمات في صورة واحدة
              </h3>
              <div className="flex justify-center">
                <div className="bg-gradient-to-br from-blue-100 to-green-100 p-6 rounded-3xl">
                  <img 
                    src="https://customer-assets.emergentagent.com/job_dental-booking-16/artifacts/c963x0ou_Screenshot_20251104_101904_WhatsApp.jpg"
                    alt="جميع تعليمات ما بعد العلاج"
                    className="w-full max-w-4xl rounded-2xl shadow-lg"
                  />
                </div>
              </div>
              <p className="text-center text-gray-600 mt-6">
                📱 امسح أي رمز QR للحصول على التعليمات التفصيلية لكل نوع علاج
              </p>
            </div>
          </div>
        ) : (
          // Individual Treatment View
          <div>
            <button
              onClick={() => setSelectedTreatment(null)}
              className="flex items-center space-x-2 space-x-reverse text-green-600 hover:text-green-700 font-medium mb-6 transition-colors"
            >
              <ChevronLeft size={20} className="transform rotate-180" />
              <span>العودة لقائمة العلاجات</span>
            </button>

            <div className="bg-white rounded-3xl shadow-2xl p-8">
              <div className="text-center mb-8">
                <div className={`inline-block w-24 h-24 bg-gradient-to-br ${selectedTreatment.color} rounded-3xl flex items-center justify-center text-5xl mb-4`}>
                  {selectedTreatment.icon}
                </div>
                <h3 className="text-3xl font-bold text-gray-800 mb-2">{selectedTreatment.nameAr}</h3>
                <p className="text-gray-500 text-lg">{selectedTreatment.nameEn}</p>
              </div>

              <div className="flex justify-center">
                <div className="bg-gradient-to-br from-blue-100 to-green-100 p-6 rounded-3xl">
                  <img 
                    src="https://customer-assets.emergentagent.com/job_dental-booking-16/artifacts/c963x0ou_Screenshot_20251104_101904_WhatsApp.jpg"
                    alt={`تعليمات ${selectedTreatment.nameAr}`}
                    className="w-full max-w-3xl rounded-2xl shadow-lg"
                  />
                </div>
              </div>

              <div className="text-center mt-6">
                <p className="text-gray-700 font-medium text-lg mb-2">
                  📱 امسح رمز الـ QR الخاص بـ {selectedTreatment.nameAr} للحصول على التعليمات الكاملة
                </p>
                <p className="text-gray-500 text-sm">
                  Scan the QR code for {selectedTreatment.nameEn} complete instructions
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Important Notice */}
        <div className="mt-12 bg-blue-50 border-r-4 border-blue-600 p-6 rounded-lg">
          <div className="flex items-start space-x-3 space-x-reverse">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-xl">⚕️</span>
              </div>
            </div>
            <div>
              <h3 className="text-blue-800 font-bold text-lg mb-2">ملاحظة مهمة</h3>
              <p className="text-blue-700">
                يرجى اتباع التعليمات بعناية بعد العلاج لضمان الشفاء السريع والنتائج المثلى. في حالة وجود أي مضاعفات أو أسئلة، يرجى الاتصال بالعيادة فوراً.
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Button */}
        <div className="mt-8 flex justify-center">
          <button
            onClick={() => navigate('/before-treatment')}
            className="flex items-center space-x-2 space-x-reverse bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl shadow-lg transition-all duration-200 transform hover:scale-105"
          >
            <span>تعليمات قبل البدء بالعلاج</span>
            <ChevronLeft size={20} />
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

export default AfterTreatmentInstructions;