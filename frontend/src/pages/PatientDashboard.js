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
import { Calendar, Bell, Clock, Star, LogOut, User, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const PatientDashboard = ({ user, onLogout }) => {
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [services, setServices] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBookDialog, setShowBookDialog] = useState(false);
  const [newAppointment, setNewAppointment] = useState({
    doctor_id: '',
    service_id: '',
    appointment_date: '',
    notes: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [appointmentsRes, doctorsRes, servicesRes, notificationsRes] = await Promise.all([
        axios.get(`${API}/appointments?patient_id=${user.id}`),
        axios.get(`${API}/doctors`),
        axios.get(`${API}/services`),
        axios.get(`${API}/notifications?user_id=${user.id}`)
      ]);
      setAppointments(appointmentsRes.data);
      setDoctors(doctorsRes.data);
      setServices(servicesRes.data);
      setNotifications(notificationsRes.data);
    } catch (error) {
      toast.error('خطأ في تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  const handleBookAppointment = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/appointments`, {
        patient_id: user.id,
        patient_name: user.name || user.phone,
        patient_phone: user.phone,
        ...newAppointment,
        created_by: 'patient'
      });
      toast.success('تم حجز الموعد بنجاح');
      setShowBookDialog(false);
      setNewAppointment({ doctor_id: '', service_id: '', appointment_date: '', notes: '' });
      fetchData();
    } catch (error) {
      toast.error('خطأ في حجز الموعد');
    }
  };

  const upcomingAppointments = appointments.filter(apt => 
    new Date(apt.appointment_date) > new Date() && apt.status !== 'cancelled'
  );
  
  const pastAppointments = appointments.filter(apt => 
    new Date(apt.appointment_date) <= new Date() || apt.status === 'cancelled'
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50" data-testid="patient-dashboard">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">عيادات الغصاب</h1>
              <p className="text-sm text-gray-600">مرحباً {user.name || user.phone}</p>
            </div>
          </div>
          <Button variant="ghost" onClick={onLogout} data-testid="logout-btn">
            <LogOut className="w-4 h-4 ml-2" />
            تسجيل الخروج
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Quick Actions */}
        <div className="mb-8">
          <Dialog open={showBookDialog} onOpenChange={setShowBookDialog}>
            <DialogTrigger asChild>
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800" data-testid="book-appointment-btn">
                <Plus className="w-5 h-5 ml-2" />
                حجز موعد جديد
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>حجز موعد جديد</DialogTitle>
                <DialogDescription>
                  اختر الخدمة والطبيب والوقت المناسب
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleBookAppointment} className="space-y-4">
                <div className="space-y-2">
                  <Label>الخدمة</Label>
                  <Select value={newAppointment.service_id} onValueChange={(value) => setNewAppointment({...newAppointment, service_id: value})} required>
                    <SelectTrigger data-testid="service-select">
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
                  <Select value={newAppointment.doctor_id} onValueChange={(value) => setNewAppointment({...newAppointment, doctor_id: value})} required>
                    <SelectTrigger data-testid="doctor-select">
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
                  <Input 
                    type="datetime-local" 
                    value={newAppointment.appointment_date}
                    onChange={(e) => setNewAppointment({...newAppointment, appointment_date: e.target.value})}
                    required
                    data-testid="datetime-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label>ملاحظات (اختياري)</Label>
                  <Textarea 
                    value={newAppointment.notes}
                    onChange={(e) => setNewAppointment({...newAppointment, notes: e.target.value})}
                    placeholder="أي ملاحظات أو طلبات خاصة"
                    data-testid="notes-input"
                  />
                </div>
                <DialogFooter>
                  <Button type="submit" data-testid="submit-booking-btn">تأكيد الحجز</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="upcoming" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="upcoming" data-testid="upcoming-tab">
              <Calendar className="w-4 h-4 ml-2" />
              القادمة
            </TabsTrigger>
            <TabsTrigger value="past" data-testid="past-tab">
              <Clock className="w-4 h-4 ml-2" />
              السابقة
            </TabsTrigger>
            <TabsTrigger value="notifications" data-testid="notifications-tab">
              <Bell className="w-4 h-4 ml-2" />
              الإشعارات
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="space-y-4">
            {upcomingAppointments.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Calendar className="w-12 h-12 text-gray-400 mb-4" />
                  <p className="text-gray-600">لا توجد مواعيد قادمة</p>
                </CardContent>
              </Card>
            ) : (
              upcomingAppointments.map(apt => (
                <AppointmentCard key={apt.id} appointment={apt} />
              ))
            )}
          </TabsContent>

          <TabsContent value="past" className="space-y-4">
            {pastAppointments.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Clock className="w-12 h-12 text-gray-400 mb-4" />
                  <p className="text-gray-600">لا توجد مواعيد سابقة</p>
                </CardContent>
              </Card>
            ) : (
              pastAppointments.map(apt => (
                <AppointmentCard key={apt.id} appointment={apt} isPast />
              ))
            )}
          </TabsContent>

          <TabsContent value="notifications" className="space-y-4">
            {notifications.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Bell className="w-12 h-12 text-gray-400 mb-4" />
                  <p className="text-gray-600">لا توجد إشعارات</p>
                </CardContent>
              </Card>
            ) : (
              notifications.map(notif => (
                <Card key={notif.id} className={notif.read ? 'opacity-60' : ''}>
                  <CardHeader>
                    <CardTitle className="text-lg">{notif.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">{notif.message}</p>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

const AppointmentCard = ({ appointment, isPast }) => {
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
    <Card className="card-hover" data-testid="appointment-card">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{appointment.service_name}</CardTitle>
            <CardDescription>د. {appointment.doctor_name}</CardDescription>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[appointment.status]}`}>
            {statusLabels[appointment.status]}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 text-gray-600">
          <Calendar className="w-4 h-4" />
          <span>{format(new Date(appointment.appointment_date), 'PPP', { locale: ar })}</span>
          <Clock className="w-4 h-4 mr-4" />
          <span>{format(new Date(appointment.appointment_date), 'p', { locale: ar })}</span>
        </div>
        {appointment.notes && (
          <p className="text-sm text-gray-600 mt-2">{appointment.notes}</p>
        )}
      </CardContent>
    </Card>
  );
};

export default PatientDashboard;