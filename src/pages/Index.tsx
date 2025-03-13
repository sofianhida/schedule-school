
import React, { useState } from 'react';
import Header from '@/components/Header';
import ScheduleForm, { Teacher, Class } from '@/components/ScheduleForm';
import ScheduleViewer, { ScheduleItem } from '@/components/ScheduleViewer';
import { Classroom } from '@/components/ClassroomCard';
import ClassroomForm from '@/components/ClassroomForm';
import { createOptimizedSchedule } from '@/utils/scheduleGenerator';
import { toast } from "sonner";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const SECTION_ANIMATION = "opacity-0 transform translate-y-4 transition-all duration-500 ease-out";
const SECTION_VISIBLE = "opacity-100 transform translate-y-0";

// Default classrooms
const DEFAULT_CLASSROOMS: Classroom[] = [
  { id: '1', name: 'Ruang 101', capacity: 30, building: 'Gedung Utama', floor: 1, usagePercentage: 0 },
  { id: '2', name: 'Ruang 102', capacity: 25, building: 'Gedung Utama', floor: 1, usagePercentage: 0 },
  { id: '3', name: 'Ruang 201', capacity: 40, building: 'Gedung Utama', floor: 2, usagePercentage: 0 },
  { id: '4', name: 'Ruang 202', capacity: 35, building: 'Gedung Utama', floor: 2, usagePercentage: 0 },
];

const Index = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>([]);
  const [classrooms, setClassrooms] = useState<Classroom[]>(DEFAULT_CLASSROOMS);
  const [showResults, setShowResults] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeSettingsTab, setActiveSettingsTab] = useState<string>("data");
  
  const handleUpdateClassrooms = (updatedClassrooms: Classroom[]) => {
    setClassrooms(updatedClassrooms);
    toast.success("Ruangan berhasil diperbarui");
  };
  
  const handleGenerateSchedule = async (teachers: Teacher[], classes: Class[]) => {
    try {
      setIsGenerating(true);
      setError(null);
      
      if (teachers.some(t => !t.name.trim())) {
        toast.error("Semua guru harus memiliki nama");
        return;
      }
      
      if (classes.some(c => !c.name.trim() || !c.subject.trim())) {
        toast.error("Semua kelas harus memiliki nama dan mata pelajaran");
        return;
      }

      const teacherWithNoAvailability = teachers.find(t => t.availability.length === 0);
      if (teacherWithNoAvailability) {
        toast.error(`Guru ${teacherWithNoAvailability.name} tidak memiliki hari yang tersedia`);
        return;
      }
      
      const { scheduleItems, classrooms: updatedClassrooms } = await createOptimizedSchedule(teachers, classes, classrooms);
      
      if (scheduleItems.length === 0) {
        setError("Tidak dapat menghasilkan jadwal yang valid dengan batasan yang diberikan. Coba sesuaikan ketersediaan guru atau persyaratan kelas.");
        toast.error("Gagal membuat jadwal yang valid");
        return;
      }
      
      setScheduleItems(scheduleItems);
      setClassrooms(updatedClassrooms);
      
      toast.success("Jadwal berhasil dibuat");
      
      setShowResults(true);
      
      setTimeout(() => {
        document.getElementById('results-section')?.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
      }, 100);
    } catch (error) {
      console.error("Error generating schedule:", error);
      setError("Terjadi kesalahan saat membuat jadwal. Silakan coba lagi dengan input yang berbeda.");
      toast.error("Gagal membuat jadwal. Silakan periksa input Anda dan coba lagi.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <Header />
      
      <main className="flex-1 container max-w-6xl mx-auto px-4 py-8 space-y-12">
        <section className="text-center animate-fade-in">
          <div className="inline-block px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-medium mb-4">
            Solusi Berbasis AI
          </div>
          <h1 className="text-4xl font-bold mb-4 tracking-tight">Penjadwalan Ruang Kelas Cerdas</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Optimalkan penggunaan ruang kelas dan buat jadwal bebas konflik dengan teknologi AI kami. 
            Hemat waktu dan maksimalkan efisiensi sumber daya.
          </p>
        </section>
        
        {error && (
          <Alert variant="destructive" className="animate-bounce-in">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <Tabs defaultValue="data" value={activeSettingsTab} onValueChange={setActiveSettingsTab} className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
            <TabsTrigger value="data">Guru & Kelas</TabsTrigger>
            <TabsTrigger value="rooms">Ruang Kelas</TabsTrigger>
          </TabsList>
          
          <TabsContent value="data" className="mt-6">
            <ScheduleForm 
              onGenerateSchedule={handleGenerateSchedule}
              isGenerating={isGenerating}
            />
          </TabsContent>
          
          <TabsContent value="rooms" className="mt-6">
            <ClassroomForm 
              classrooms={classrooms}
              onUpdate={handleUpdateClassrooms}
            />
          </TabsContent>
        </Tabs>
        
        <section 
          id="results-section"
          className={`${SECTION_ANIMATION} ${showResults ? SECTION_VISIBLE : ''}`}
          style={{ transition: 'all 0.5s ease-out' }}
        >
          {showResults && scheduleItems.length > 0 && (
            <>
              <h2 className="text-2xl font-semibold mb-6">Jadwal yang Dihasilkan</h2>
              <ScheduleViewer 
                scheduleItems={scheduleItems}
                classrooms={classrooms}
              />
              
              <div className="mt-8 text-center">
                <div className="glass-card p-6 rounded-lg max-w-2xl mx-auto">
                  <h3 className="text-lg font-medium mb-2">Ringkasan Optimalisasi</h3>
                  <p className="text-muted-foreground mb-4">
                    AI telah menganalisis input Anda dan membuat jadwal yang dioptimalkan
                    yang meminimalkan konflik dan memaksimalkan penggunaan ruang kelas.
                  </p>
                  
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-primary">{scheduleItems.length}</div>
                      <div className="text-sm text-muted-foreground">Kelas Terjadwal</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-primary">{classrooms.length}</div>
                      <div className="text-sm text-muted-foreground">Ruangan Digunakan</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-primary">
                        {Math.round(classrooms.reduce((sum, c) => sum + (c.usagePercentage || 0), 0) / classrooms.length)}%
                      </div>
                      <div className="text-sm text-muted-foreground">Rata-rata Penggunaan</div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </section>
      </main>
      
      <footer className="py-6 border-t glass">
        <div className="container max-w-6xl mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>Optimalisasi Ruang Kelas • Sistem Penjadwalan Berbasis AI oleh WeversAI</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
