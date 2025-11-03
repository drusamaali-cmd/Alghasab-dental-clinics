import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import axios from 'axios';
import { Send, Users, Calendar, Star, Sparkles, Gift, TrendingUp, Bell } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const CampaignTemplates = [
  {
    id: 'whitening',
    icon: <Sparkles className="w-5 h-5" />,
    name: 'عرض تبييض الأسنان',
    title: 'عرض خاص - تبييض الأسنان ✨',
    message: '🎉 عرض محدود!\n\nتبييض الأسنان بالليزر الآن بخصم 30%\n\nالسعر: 700 ريال بدلاً من 1000 ريال\n\n⏰ العرض ساري حتى نهاية الشهر\n\n📱 احجز الآن عبر التطبيق',
    color: 'from-yellow-400 to-yellow-600'
  },
  {
    id: 'cleaning',
    icon: <Sparkles className="w-5 h-5" />,
    name: 'عرض التنظيف',
    title: 'موسم التنظيف - خصم خاص 🦷',
    message: '✨ نظف أسنانك الآن!\n\nتنظيف شامل + فحص مجاني\n\nالسعر: 150 ريال فقط\n\n✅ إزالة الجير\n✅ تلميع الأسنان\n✅ فحص شامل مجاني\n\n📅 احجز موعدك الآن',
    color: 'from-blue-400 to-blue-600'
  },
  {
    id: 'first_visit',
    icon: <Gift className="w-5 h-5" />,
    name: 'عرض الزيارة الأولى',
    title: 'مرحباً بك في عيادات الغصاب 🎁',
    message: '🌟 عرض الزيارة الأولى!\n\nخصم 50% على الكشف والاستشارة\n\nالسعر: 50 ريال فقط\n\n✅ كشف شامل\n✅ استشارة مجانية\n✅ خطة علاج مفصلة\n\nنتطلع لخدمتك! 💙',
    color: 'from-green-400 to-green-600'
  },
  {
    id: 'reminder',
    icon: <Calendar className="w-5 h-5" />,
    name: 'تذكير بالزيارة',
    title: 'حان وقت فحصك الدوري 📅',
    message: '👋 نتمنى أن تكون بخير!\n\nلاحظنا أنك لم تزرنا منذ فترة\n\n🦷 ننصح بالفحص الدوري كل 6 أشهر\n\n💙 نقدم لك خصم 20% على زيارتك القادمة\n\n📱 احجز الآن بسهولة',
    color: 'from-purple-400 to-purple-600'
  },
  {
    id: 'loyalty',
    icon: <Star className="w-5 h-5" />,
    name: 'عرض الولاء',
    title: 'شكراً لولائك 🌟',
    message: '💙 عميلنا المميز!\n\nشكراً لثقتك بنا\n\n🎁 نقدم لك:\n• خصم 25% على أي خدمة\n• استشارة مجانية\n• أولوية في المواعيد\n\n✨ عرض حصري للعملاء المميزين',
    color: 'from-pink-400 to-pink-600'
  }
];

const EnhancedCampaignDialog = ({ open, onOpenChange, onSuccess }) => {
  const [step, setStep] = useState(1); // 1: template, 2: customize, 3: audience
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    target_audience: 'all',
    scheduled_for: null,
    max_recipients: null // عدد المستلمين المحدد
  });
  const [loading, setLoading] = useState(false);
  const [estimatedReach, setEstimatedReach] = useState(0);
  const [recipientMode, setRecipientMode] = useState('all'); // 'all' or 'limited'

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    setFormData({
      ...formData,
      title: template.title,
      message: template.message
    });
    setStep(2);
  };

  const handleCustomStart = () => {
    setSelectedTemplate(null);
    setFormData({
      title: '',
      message: '',
      target_audience: 'all',
      scheduled_for: null
    });
    setStep(2);
  };

  const handleAudienceChange = (value) => {
    setFormData({...formData, target_audience: value});
    // Simulate estimated reach
    const reaches = {
      'all': 1000,
      'active': 650,
      'inactive': 350,
      'new': 200
    };
    setEstimatedReach(reaches[value] || 0);
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.message) {
      toast.error('الرجاء ملء جميع الحقول');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API}/campaigns`, formData);
      
      // Send campaign with optional max_recipients
      const sendUrl = formData.max_recipients 
        ? `${API}/campaigns/${response.data.id}/send?max_recipients=${formData.max_recipients}`
        : `${API}/campaigns/${response.data.id}/send`;
      
      const sendResponse = await axios.post(sendUrl);
      
      toast.success(sendResponse.data.message || 'تم إرسال الحملة بنجاح! 🎉');
      onOpenChange(false);
      setStep(1);
      setFormData({ title: '', message: '', target_audience: 'all', scheduled_for: null, max_recipients: null });
      setRecipientMode('all');
      onSuccess();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'خطأ في إرسال الحملة');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button size="lg" className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800">
          <Send className="w-5 h-5 ml-2" />
          إرسال عرض جديد
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {step === 1 && '📢 إرسال عرض للمراجعين'}
            {step === 2 && '✏️ تخصيص العرض'}
            {step === 3 && '👥 اختيار الجمهور'}
          </DialogTitle>
          <DialogDescription>
            {step === 1 && 'اختر قالب جاهز أو ابدأ من الصفر'}
            {step === 2 && 'عدّل النص حسب رغبتك'}
            {step === 3 && 'حدد من سيستقبل العرض'}
          </DialogDescription>
        </DialogHeader>

        {/* Step 1: Template Selection */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {CampaignTemplates.map((template) => (
                <Card 
                  key={template.id}
                  className="cursor-pointer hover:shadow-lg transition-all card-hover"
                  onClick={() => handleTemplateSelect(template)}
                >
                  <CardContent className="p-4">
                    <div className={`w-12 h-12 bg-gradient-to-br ${template.color} rounded-xl flex items-center justify-center text-white mb-3`}>
                      {template.icon}
                    </div>
                    <h3 className="font-bold text-lg mb-2">{template.name}</h3>
                    <p className="text-sm text-gray-600 line-clamp-2">{template.message}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <div className="text-center pt-4 border-t">
              <Button variant="outline" onClick={handleCustomStart} className="w-full">
                أو ابدأ من الصفر
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Customize Message */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>عنوان العرض</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder="مثال: عرض خاص - خصم 30%"
                className="text-lg"
              />
            </div>

            <div className="space-y-2">
              <Label>نص الرسالة</Label>
              <Textarea
                value={formData.message}
                onChange={(e) => setFormData({...formData, message: e.target.value})}
                placeholder="اكتب تفاصيل العرض هنا..."
                rows={8}
                className="text-base"
              />
              <p className="text-sm text-gray-500">
                عدد الأحرف: {formData.message.length} / 500
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">💡 نصائح للرسالة الجيدة:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• اجعلها قصيرة وواضحة</li>
                <li>• اذكر السعر أو نسبة الخصم</li>
                <li>• حدد مدة العرض</li>
                <li>• أضف رابط الحجز</li>
              </ul>
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setStep(1)}>
                رجوع
              </Button>
              <Button onClick={() => setStep(3)}>
                التالي: اختيار الجمهور
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Audience Selection */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="space-y-4">
              <Label className="text-lg">من سيستقبل هذا العرض؟</Label>
              
              {/* عدد المستلمين */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
                <h4 className="font-bold text-blue-900 flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  عدد المستلمين
                </h4>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      id="all-users"
                      name="recipient-mode"
                      checked={recipientMode === 'all'}
                      onChange={() => {
                        setRecipientMode('all');
                        setFormData({...formData, max_recipients: null});
                      }}
                      className="w-4 h-4"
                    />
                    <Label htmlFor="all-users" className="cursor-pointer">
                      إرسال لجميع المراجعين المسجلين
                    </Label>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        id="limited-users"
                        name="recipient-mode"
                        checked={recipientMode === 'limited'}
                        onChange={() => setRecipientMode('limited')}
                        className="w-4 h-4"
                      />
                      <Label htmlFor="limited-users" className="cursor-pointer">
                        إرسال لعدد محدد (عشوائي)
                      </Label>
                    </div>
                    
                    {recipientMode === 'limited' && (
                      <div className="mr-6 space-y-2">
                        <Label>عدد المستلمين:</Label>
                        <Input
                          type="number"
                          min="1"
                          max="100000"
                          placeholder="مثال: 5000"
                          value={formData.max_recipients || ''}
                          onChange={(e) => setFormData({...formData, max_recipients: parseInt(e.target.value)})}
                          className="max-w-xs"
                        />
                        <p className="text-sm text-gray-600">
                          💡 سيتم اختيار المستلمين بشكل عشوائي بدون تكرار
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="grid gap-3">
                <AudienceOption
                  value="all"
                  selected={formData.target_audience === 'all'}
                  onClick={() => handleAudienceChange('all')}
                  icon={<Users className="w-5 h-5" />}
                  title="جميع المراجعين"
                  description="إرسال لجميع المستخدمين المسجلين"
                  count="~30,000 مراجع"
                />
                
                <AudienceOption
                  value="active"
                  selected={formData.target_audience === 'active'}
                  onClick={() => handleAudienceChange('active')}
                  icon={<TrendingUp className="w-5 h-5" />}
                  title="المراجعين النشطين"
                  description="من زاروا العيادة خلال آخر 6 أشهر"
                  count="~15,000 مراجع"
                />
                
                <AudienceOption
                  value="inactive"
                  selected={formData.target_audience === 'inactive'}
                  onClick={() => handleAudienceChange('inactive')}
                  icon={<Calendar className="w-5 h-5" />}
                  title="المراجعين غير النشطين"
                  description="لم يزوروا العيادة منذ أكثر من 6 أشهر"
                  count="~10,000 مراجع"
                />
                
                <AudienceOption
                  value="new"
                  selected={formData.target_audience === 'new'}
                  onClick={() => handleAudienceChange('new')}
                  icon={<Gift className="w-5 h-5" />}
                  title="المراجعين الجدد"
                  description="سجلوا خلال آخر شهر"
                  count="~2,000 مراجع"
                />
              </div>
            </div>

            {estimatedReach > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-5 h-5 text-green-600" />
                  <h4 className="font-bold text-green-900">الوصول المتوقع</h4>
                </div>
                <p className="text-2xl font-bold text-green-700">
                  {recipientMode === 'limited' && formData.max_recipients 
                    ? formData.max_recipients 
                    : estimatedReach} مراجع
                </p>
                <p className="text-sm text-green-600 mt-1">سيستلمون هذا العرض فوراً</p>
              </div>
            )}

            <div className="border-t pt-4">
              <h4 className="font-medium mb-3">معاينة الرسالة:</h4>
              <div className="bg-gray-50 rounded-lg p-4 border-2 border-gray-200">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white flex-shrink-0">
                    <Bell className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h5 className="font-bold text-gray-900 mb-1">{formData.title}</h5>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{formData.message}</p>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(2)}>
                رجوع
              </Button>
              <Button 
                onClick={handleSubmit} 
                disabled={loading}
                className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
              >
                {loading ? 'جاري الإرسال...' : `إرسال إلى ${estimatedReach} مراجع`}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

const AudienceOption = ({ value, selected, onClick, icon, title, description, count }) => (
  <div
    onClick={onClick}
    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
      selected 
        ? 'border-blue-600 bg-blue-50' 
        : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
    }`}
  >
    <div className="flex items-start gap-3">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
        selected ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
      }`}>
        {icon}
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <h4 className="font-bold text-gray-900">{title}</h4>
          <Badge variant={selected ? "default" : "secondary"}>{count}</Badge>
        </div>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
    </div>
  </div>
);

export default EnhancedCampaignDialog;
