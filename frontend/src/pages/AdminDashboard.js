import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import axios from 'axios';
import { 
  Calendar, Bell, Clock, Star, LogOut, User, Plus, 
  Users, Activity, CheckCircle, XCircle, AlertCircle,
  TrendingUp, BarChart3, Send, Edit, Trash2, UserPlus, Stethoscope
} from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import ChangePasswordDialog from '@/components/ChangePasswordDialog';
import EnhancedCampaignDialog from '@/components/EnhancedCampaignDialog';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AdminDashboard = ({ user, onLogout }) => {
  const [stats, setStats] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [services, setServices] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  // Dialogs
  const [showAddAppointment, setShowAddAppointment] = useState(false);
  const [showAddDoctor, setShowAddDoctor] = useState(false);
  const [showAddService, setShowAddService] = useState(false);
  const [showAddCampaign, setShowAddCampaign] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, appointmentsRes, doctorsRes, servicesRes, campaignsRes] = await Promise.all([
        axios.get(`${API}/stats`),
        axios.get(`${API}/appointments`),
        axios.get(`${API}/doctors`),
        axios.get(`${API}/services`),
        axios.get(`${API}/campaigns`)
      ]);
      setStats(statsRes.data);
      setAppointments(appointmentsRes.data);
      setDoctors(doctorsRes.data);
      setServices(servicesRes.data);
      setCampaigns(campaignsRes.data);
    } catch (error) {
      toast.error('خطأ في تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50" data-testid="admin-dashboard">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <img src="/logo.png" alt="عيادات الغصاب" className="h-12 w-auto bg-white rounded-lg p-1" />
              <div>
                <h1 className="text-2xl font-bold">لوحة تحكم عيادات الغصاب</h1>
                <p className="text-blue-100">مرحباً {user.name}</p>
              </div>
            </div>
            <div className="flex gap-3 items-center">
              <ChangePasswordDialog userId={user.id} />
              <Button variant="ghost" className="text-white hover:bg-blue-700" onClick={onLogout} data-testid="logout-btn">
                <LogOut className="w-4 h-4 ml-2" />
                تسجيل الخروج
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard 
            icon={<Calendar className="w-6 h-6" />}
            title="إجمالي المواعيد"
            value={stats?.total_appointments || 0}
            color="blue"
          />
          <StatsCard 
            icon={<CheckCircle className="w-6 h-6" />}
            title="المواعيد المؤكدة"
            value={stats?.confirmed_appointments || 0}
            color="green"
          />
          <StatsCard 
            icon={<Users className="w-6 h-6" />}
            title="إجمالي المراجعين"
            value={stats?.total_patients || 0}
            color="purple"
          />
          <StatsCard 
            icon={<Star className="w-6 h-6" />}
            title="التقييم"
            value={stats?.avg_rating || 0}
            color="amber"
          />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="appointments" className="space-y-6">
          <TabsList className="grid w-full max-w-4xl grid-cols-4">
            <TabsTrigger value="appointments" data-testid="appointments-tab">
              <Calendar className="w-4 h-4 ml-2" />
              المواعيد
            </TabsTrigger>
            <TabsTrigger value="doctors" data-testid="doctors-tab">
              <Stethoscope className="w-4 h-4 ml-2" />
              الأطباء
            </TabsTrigger>
            <TabsTrigger value="services" data-testid="services-tab">
              <Activity className="w-4 h-4 ml-2" />
              الخدمات
            </TabsTrigger>
            <TabsTrigger value="campaigns" data-testid="campaigns-tab">
              <Send className="w-4 h-4 ml-2" />
              الحملات
            </TabsTrigger>
          </TabsList>

          {/* Appointments Tab */}
          <TabsContent value="appointments" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">المواعيد</h2>
              <AddAppointmentDialog 
                open={showAddAppointment} 
                onOpenChange={setShowAddAppointment}
                doctors={doctors}
                services={services}
                onSuccess={fetchData}
              />
            </div>
            <AppointmentsTable appointments={appointments} onUpdate={fetchData} />
          </TabsContent>

          {/* Doctors Tab */}
          <TabsContent value="doctors" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">الأطباء</h2>
              <AddDoctorDialog 
                open={showAddDoctor} 
                onOpenChange={setShowAddDoctor}
                onSuccess={fetchData}
              />
            </div>
            <DoctorsTable doctors={doctors} onUpdate={fetchData} />
          </TabsContent>

          {/* Services Tab */}
          <TabsContent value="services" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">الخدمات</h2>
              <AddServiceDialog 
                open={showAddService} 
                onOpenChange={setShowAddService}
                onSuccess={fetchData}
              />
            </div>
            <ServicesTable services={services} onUpdate={fetchData} />
          </TabsContent>

          {/* Campaigns Tab */}
          <TabsContent value="campaigns" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">الحملات التسويقية</h2>
              <EnhancedCampaignDialog 
                open={showAddCampaign} 
                onOpenChange={setShowAddCampaign}
                onSuccess={fetchData}
              />
            </div>
            <CampaignsTable campaigns={campaigns} onUpdate={fetchData} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

// Stats Card Component
const StatsCard = ({ icon, title, value, color }) => {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600',
    amber: 'from-amber-500 to-amber-600'
  };

  return (
    <Card className="card-hover">
      <CardContent className="flex items-center gap-4 p-6">
        <div className={`w-14 h-14 bg-gradient-to-br ${colorClasses[color]} rounded-xl flex items-center justify-center text-white`}>
          {icon}
        </div>
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
};

// Appointments Table
const AppointmentsTable = ({ appointments, onUpdate }) => {
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [editForm, setEditForm] = useState({
    appointment_date: '',
    appointment_time: ''
  });
  
  const handleStatusChange = async (id, status) => {
    try {
      await axios.put(`${API}/appointments/${id}`, { status });
      toast.success('تم تحديث حالة الموعد');
      onUpdate();
    } catch (error) {
      toast.error('خطأ في تحديث حالة الموعد');
    }
  };

  const handleEditClick = (apt) => {
    setEditingAppointment(apt);
    const date = new Date(apt.appointment_date);
    setEditForm({
      appointment_date: date.toISOString().split('T')[0],
      appointment_time: date.toTimeString().slice(0, 5)
    });
  };

  const handleSaveEdit = async () => {
    try {
      const dateTime = new Date(`${editForm.appointment_date}T${editForm.appointment_time}`);
      await axios.put(`${API}/appointments/${editingAppointment.id}`, {
        appointment_date: dateTime.toISOString()
      });
      toast.success('تم تحديث الموعد بنجاح');
      setEditingAppointment(null);
      onUpdate();
    } catch (error) {
      toast.error('خطأ في تحديث الموعد');
    }
  };

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
    completed: 'bg-blue-100 text-blue-800'
  };

  const statusLabels = {
    pending: 'قيد الانتظار',
    confirmed: 'مؤكد',
    cancelled: 'ملغى',
    completed: 'مكتمل'
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">المراجع</th>
              <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">الطبيب</th>
              <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">الخدمة</th>
              <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">التاريخ</th>
              <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">الملاحظات</th>
              <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">الحالة</th>
              <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {appointments.map(apt => (
              <tr key={apt.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div>
                    <p className="font-medium text-gray-900">{apt.patient_name}</p>
                    <p className="text-sm text-gray-600">{apt.patient_phone}</p>
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-900">د. {apt.doctor_name}</td>
                <td className="px-6 py-4 text-gray-900">{apt.service_name}</td>
                <td className="px-6 py-4 text-gray-900">
                  {format(new Date(apt.appointment_date), 'PPp', { locale: ar })}
                </td>
                <td className="px-6 py-4">
                  {apt.notes ? (
                    <div>
                      <p className="text-sm text-gray-700 line-clamp-2 mb-1">
                        {apt.notes}
                      </p>
                      <Button 
                        variant="link" 
                        size="sm" 
                        className="h-auto p-0 text-blue-600"
                        onClick={() => setSelectedAppointment(apt)}
                      >
                        عرض الكل
                      </Button>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-400">-</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <Select value={apt.status} onValueChange={(value) => handleStatusChange(apt.id, value)}>
                    <SelectTrigger className={`w-32 ${statusColors[apt.status]}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">قيد الانتظار</SelectItem>
                      <SelectItem value="confirmed">مؤكد</SelectItem>
                      <SelectItem value="cancelled">ملغى</SelectItem>
                      <SelectItem value="completed">مكتمل</SelectItem>
                    </SelectContent>
                  </Select>
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      onClick={() => handleEditClick(apt)}
                      title="تعديل الموعد"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      title="حذف"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Dialog for full appointment details */}
      {selectedAppointment && (
        <Dialog open={!!selectedAppointment} onOpenChange={() => setSelectedAppointment(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>تفاصيل الموعد</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-600">المراجع</Label>
                  <p className="font-medium text-lg">{selectedAppointment.patient_name}</p>
                  <p className="text-sm text-gray-600">{selectedAppointment.patient_phone}</p>
                </div>
                <div>
                  <Label className="text-gray-600">الطبيب</Label>
                  <p className="font-medium text-lg">د. {selectedAppointment.doctor_name}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-600">الخدمة</Label>
                  <p className="font-medium">{selectedAppointment.service_name}</p>
                </div>
                <div>
                  <Label className="text-gray-600">التاريخ والوقت</Label>
                  <p className="font-medium">
                    {format(new Date(selectedAppointment.appointment_date), 'PPPp', { locale: ar })}
                  </p>
                </div>
              </div>
              
              <div>
                <Label className="text-gray-600">الحالة</Label>
                <p>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${statusColors[selectedAppointment.status]}`}>
                    {statusLabels[selectedAppointment.status]}
                  </span>
                </p>
              </div>
              
              {selectedAppointment.notes && (
                <div>
                  <Label className="text-gray-600">الملاحظات</Label>
                  <div className="mt-2 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-gray-800 whitespace-pre-wrap">{selectedAppointment.notes}</p>
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedAppointment(null)}>
                إغلاق
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

// Add Appointment Dialog
const AddAppointmentDialog = ({ open, onOpenChange, doctors, services, onSuccess }) => {
  const [formData, setFormData] = useState({
    patient_name: '',
    patient_phone: '',
    doctor_id: '',
    service_id: '',
    appointment_date: '',
    notes: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/appointments`, { ...formData, created_by: 'admin' });
      toast.success('تم إضافة الموعد بنجاح');
      onOpenChange(false);
      setFormData({ patient_name: '', patient_phone: '', doctor_id: '', service_id: '', appointment_date: '', notes: '' });
      onSuccess();
    } catch (error) {
      toast.error('خطأ في إضافة الموعد');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button data-testid="add-appointment-btn">
          <Plus className="w-4 h-4 ml-2" />
          إضافة موعد
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>إضافة موعد جديد</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>اسم المراجع</Label>
            <Input value={formData.patient_name} onChange={(e) => setFormData({...formData, patient_name: e.target.value})} required />
          </div>
          <div className="space-y-2">
            <Label>رقم الجوال</Label>
            <Input value={formData.patient_phone} onChange={(e) => setFormData({...formData, patient_phone: e.target.value})} required />
          </div>
          <div className="space-y-2">
            <Label>الخدمة</Label>
            <Select value={formData.service_id} onValueChange={(value) => setFormData({...formData, service_id: value})} required>
              <SelectTrigger>
                <SelectValue placeholder="اختر الخدمة" />
              </SelectTrigger>
              <SelectContent>
                {services.map(service => (
                  <SelectItem key={service.id} value={service.id}>{service.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>الطبيب</Label>
            <Select value={formData.doctor_id} onValueChange={(value) => setFormData({...formData, doctor_id: value})} required>
              <SelectTrigger>
                <SelectValue placeholder="اختر الطبيب" />
              </SelectTrigger>
              <SelectContent>
                {doctors.map(doctor => (
                  <SelectItem key={doctor.id} value={doctor.id}>د. {doctor.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>التاريخ والوقت</Label>
            <Input type="datetime-local" value={formData.appointment_date} onChange={(e) => setFormData({...formData, appointment_date: e.target.value})} required />
          </div>
          <div className="space-y-2">
            <Label>ملاحظات</Label>
            <Textarea value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} />
          </div>
          <DialogFooter>
            <Button type="submit">إضافة الموعد</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// Doctors Table
const DoctorsTable = ({ doctors, onUpdate }) => {
  const handleDelete = async (id) => {
    if (window.confirm('هل أنت متأكد من حذف هذا الطبيب؟')) {
      try {
        await axios.delete(`${API}/doctors/${id}`);
        toast.success('تم حذف الطبيب');
        onUpdate();
      } catch (error) {
        toast.error('خطأ في حذف الطبيب');
      }
    }
  };

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
      {doctors.map(doctor => (
        <Card key={doctor.id} className="card-hover">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>د. {doctor.name}</CardTitle>
                <CardDescription>{doctor.specialization}</CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={() => handleDelete(doctor.id)} className="text-red-600 hover:text-red-700">
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {doctor.phone && <p className="text-sm text-gray-600">{doctor.phone}</p>}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

// Add Doctor Dialog
const AddDoctorDialog = ({ open, onOpenChange, onSuccess }) => {
  const [formData, setFormData] = useState({ name: '', specialization: '', phone: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/doctors`, formData);
      toast.success('تم إضافة الطبيب بنجاح');
      onOpenChange(false);
      setFormData({ name: '', specialization: '', phone: '' });
      onSuccess();
    } catch (error) {
      toast.error('خطأ في إضافة الطبيب');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button data-testid="add-doctor-btn">
          <Plus className="w-4 h-4 ml-2" />
          إضافة طبيب
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>إضافة طبيب جديد</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>الاسم</Label>
            <Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
          </div>
          <div className="space-y-2">
            <Label>التخصص</Label>
            <Input value={formData.specialization} onChange={(e) => setFormData({...formData, specialization: e.target.value})} required />
          </div>
          <div className="space-y-2">
            <Label>رقم الجوال</Label>
            <Input value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
          </div>
          <DialogFooter>
            <Button type="submit">إضافة الطبيب</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// Services Table
const ServicesTable = ({ services, onUpdate }) => {
  const handleDelete = async (id) => {
    if (window.confirm('هل أنت متأكد من حذف هذه الخدمة؟')) {
      try {
        await axios.delete(`${API}/services/${id}`);
        toast.success('تم حذف الخدمة');
        onUpdate();
      } catch (error) {
        toast.error('خطأ في حذف الخدمة');
      }
    }
  };

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
      {services.map(service => (
        <Card key={service.id} className="card-hover">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>{service.name}</CardTitle>
                <CardDescription>{service.name_en}</CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={() => handleDelete(service.id)} className="text-red-600 hover:text-red-700">
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {service.description && <p className="text-sm text-gray-600 mb-2">{service.description}</p>}
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">المدة: {service.duration_minutes} دقيقة</span>
              {service.price && <span className="font-medium">{service.price} ريال</span>}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

// Add Service Dialog
const AddServiceDialog = ({ open, onOpenChange, onSuccess }) => {
  const [formData, setFormData] = useState({ name: '', name_en: '', description: '', duration_minutes: 30, price: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/services`, formData);
      toast.success('تم إضافة الخدمة بنجاح');
      onOpenChange(false);
      setFormData({ name: '', name_en: '', description: '', duration_minutes: 30, price: '' });
      onSuccess();
    } catch (error) {
      toast.error('خطأ في إضافة الخدمة');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button data-testid="add-service-btn">
          <Plus className="w-4 h-4 ml-2" />
          إضافة خدمة
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>إضافة خدمة جديدة</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>الاسم بالعربي</Label>
            <Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
          </div>
          <div className="space-y-2">
            <Label>الاسم بالإنجليزي</Label>
            <Input value={formData.name_en} onChange={(e) => setFormData({...formData, name_en: e.target.value})} required />
          </div>
          <div className="space-y-2">
            <Label>الوصف</Label>
            <Textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>المدة (دقيقة)</Label>
              <Input type="number" value={formData.duration_minutes} onChange={(e) => setFormData({...formData, duration_minutes: parseInt(e.target.value)})} required />
            </div>
            <div className="space-y-2">
              <Label>السعر (ريال)</Label>
              <Input type="number" value={formData.price} onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value)})} />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">إضافة الخدمة</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// Campaigns Table
const CampaignsTable = ({ campaigns, onUpdate }) => {
  const handleSend = async (id) => {
    try {
      await axios.post(`${API}/campaigns/${id}/send`);
      toast.success('تم إرسال الحملة بنجاح');
      onUpdate();
    } catch (error) {
      toast.error('خطأ في إرسال الحملة');
    }
  };

  return (
    <div className="space-y-4">
      {campaigns.map(campaign => (
        <Card key={campaign.id} className="card-hover">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>{campaign.title}</CardTitle>
                <CardDescription>{campaign.message}</CardDescription>
              </div>
              <div className="flex gap-2">
                {campaign.status === 'draft' && (
                  <Button size="sm" onClick={() => handleSend(campaign.id)}>
                    <Send className="w-4 h-4 ml-2" />
                    إرسال
                  </Button>
                )}
                <span className={`px-3 py-1 rounded-full text-sm ${campaign.status === 'sent' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                  {campaign.status === 'sent' ? 'مرسلة' : 'مسودة'}
                </span>
              </div>
            </div>
          </CardHeader>
          {campaign.status === 'sent' && (
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">تم الإرسال</p>
                  <p className="font-medium">{campaign.sent_count}</p>
                </div>
                <div>
                  <p className="text-gray-600">تم الفتح</p>
                  <p className="font-medium">{campaign.opened_count}</p>
                </div>
                <div>
                  <p className="text-gray-600">تم الحجز</p>
                  <p className="font-medium">{campaign.booked_count}</p>
                </div>
              </div>
            </CardContent>
          )}
        </Card>
      ))}
    </div>
  );
};

// Add Campaign Dialog
const AddCampaignDialog = ({ open, onOpenChange, onSuccess }) => {
  const [formData, setFormData] = useState({ title: '', message: '', target_audience: 'all' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/campaigns`, formData);
      toast.success('تم إنشاء الحملة بنجاح');
      onOpenChange(false);
      setFormData({ title: '', message: '', target_audience: 'all' });
      onSuccess();
    } catch (error) {
      toast.error('خطأ في إنشاء الحملة');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button data-testid="add-campaign-btn">
          <Plus className="w-4 h-4 ml-2" />
          حملة جديدة
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>إنشاء حملة تسويقية</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>العنوان</Label>
            <Input value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} required />
          </div>
          <div className="space-y-2">
            <Label>الرسالة</Label>
            <Textarea value={formData.message} onChange={(e) => setFormData({...formData, message: e.target.value})} required />
          </div>
          <div className="space-y-2">
            <Label>الجمهور المستهدف</Label>
            <Select value={formData.target_audience} onValueChange={(value) => setFormData({...formData, target_audience: value})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع المراجعين</SelectItem>
                <SelectItem value="active">المراجعين النشطين</SelectItem>
                <SelectItem value="inactive">المراجعين غير النشطين</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="submit">إنشاء الحملة</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AdminDashboard;
