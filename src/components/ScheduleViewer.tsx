import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { 
  CalendarIcon, 
  DownloadIcon, 
  HomeIcon, 
  FileIcon, 
  FileSpreadsheetIcon,
  FileText,
  CheckIcon
} from "lucide-react";
import { cn } from "@/lib/utils";
import ClassroomCard, { Classroom } from './ClassroomCard';
import { toast } from "sonner";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

export interface ScheduleItem {
  id: string;
  classId: string;
  className: string;
  subject: string;
  teacherName: string;
  day: string;
  startTime: string;
  endTime: string;
  classroomId: string;
  classroomName: string;
}

interface ScheduleViewerProps {
  scheduleItems: ScheduleItem[];
  classrooms: Classroom[];
  className?: string;
}

const ScheduleViewer: React.FC<ScheduleViewerProps> = ({ 
  scheduleItems,
  classrooms,
  className
}) => {
  const [view, setView] = useState<'weekly' | 'classroom'>('weekly');
  const [selectedDay, setSelectedDay] = useState<string>('Monday');
  const [selectedClassroom, setSelectedClassroom] = useState<string | null>(classrooms[0]?.id || null);
  const [exporting, setExporting] = useState(false);
  
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const hours = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];
  
  const filteredByDay = scheduleItems.filter(item => item.day === selectedDay);
  const filteredByClassroom = scheduleItems.filter(item => item.classroomId === selectedClassroom);
  
  const classroomGroups = filteredByDay.reduce((groups, item) => {
    if (!groups[item.classroomId]) {
      groups[item.classroomId] = [];
    }
    groups[item.classroomId].push(item);
    return groups;
  }, {} as Record<string, ScheduleItem[]>);
  
  const dayGroups = filteredByClassroom.reduce((groups, item) => {
    if (!groups[item.day]) {
      groups[item.day] = [];
    }
    groups[item.day].push(item);
    return groups;
  }, {} as Record<string, ScheduleItem[]>);

  const exportToCSV = () => {
    setExporting(true);
    try {
      const headers = ['Class Name', 'Subject', 'Teacher', 'Day', 'Start Time', 'End Time', 'Classroom'];
      const csvContent = [
        headers.join(','),
        ...scheduleItems.map(item => [
          `"${item.className}"`,
          `"${item.subject}"`,
          `"${item.teacherName}"`,
          `"${item.day}"`,
          `"${item.startTime}"`,
          `"${item.endTime}"`,
          `"${item.classroomName}"`
        ].join(','))
      ].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', 'schedule.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Schedule exported as CSV');
    } catch (error) {
      toast.error('Failed to export schedule');
      console.error('Export error:', error);
    } finally {
      setExporting(false);
    }
  };

  const exportToExcel = () => {
    setExporting(true);
    try {
      const headers = ['Class Name', 'Subject', 'Teacher', 'Day', 'Start Time', 'End Time', 'Classroom'];
      const csvContent = [
        headers.join('\t'),
        ...scheduleItems.map(item => [
          item.className,
          item.subject,
          item.teacherName,
          item.day,
          item.startTime,
          item.endTime,
          item.classroomName
        ].join('\t'))
      ].join('\n');
      
      const blob = new Blob([csvContent], { type: 'application/vnd.ms-excel' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', 'schedule.xls');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Schedule exported as Excel');
    } catch (error) {
      toast.error('Failed to export schedule');
      console.error('Export error:', error);
    } finally {
      setExporting(false);
    }
  };

  const printSchedule = () => {
    setExporting(true);
    try {
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        toast.error('Pop-up blocked. Please allow pop-ups and try again.');
        return;
      }
      
      printWindow.document.write(`
        <html>
          <head>
            <title>Class Schedule</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f2f2f2; }
              h1, h2 { margin-bottom: 10px; }
              .info { margin-bottom: 5px; font-size: 14px; }
              @media print {
                button { display: none; }
              }
            </style>
          </head>
          <body>
            <button onclick="window.print();window.close();" style="padding: 10px; margin-bottom: 20px; background: #0f172a; color: white; border: none; border-radius: 4px; cursor: pointer;">
              Print PDF
            </button>
            <h1>Class Schedule</h1>
            <div class="info">Total Classes: ${scheduleItems.length}</div>
            <div class="info">Total Classrooms: ${classrooms.length}</div>
            
            <h2>Schedule by Day</h2>
            ${days.map(day => `
              <h3>${day}</h3>
              <table>
                <thead>
                  <tr>
                    <th>Class</th>
                    <th>Subject</th>
                    <th>Teacher</th>
                    <th>Time</th>
                    <th>Classroom</th>
                  </tr>
                </thead>
                <tbody>
                  ${scheduleItems.filter(item => item.day === day).length > 0 
                    ? scheduleItems.filter(item => item.day === day).map(item => `
                      <tr>
                        <td>${item.className}</td>
                        <td>${item.subject}</td>
                        <td>${item.teacherName}</td>
                        <td>${item.startTime} - ${item.endTime}</td>
                        <td>${item.classroomName}</td>
                      </tr>
                    `).join('')
                    : '<tr><td colspan="5">No classes scheduled</td></tr>'
                  }
                </tbody>
              </table>
            `).join('')}

            <h2>Schedule by Classroom</h2>
            ${classrooms.map(classroom => `
              <h3>${classroom.name}</h3>
              <table>
                <thead>
                  <tr>
                    <th>Day</th>
                    <th>Class</th>
                    <th>Subject</th>
                    <th>Teacher</th>
                    <th>Time</th>
                  </tr>
                </thead>
                <tbody>
                  ${scheduleItems.filter(item => item.classroomId === classroom.id).length > 0 
                    ? scheduleItems.filter(item => item.classroomId === classroom.id).map(item => `
                      <tr>
                        <td>${item.day}</td>
                        <td>${item.className}</td>
                        <td>${item.subject}</td>
                        <td>${item.teacherName}</td>
                        <td>${item.startTime} - ${item.endTime}</td>
                      </tr>
                    `).join('')
                    : '<tr><td colspan="5">No classes scheduled</td></tr>'
                  }
                </tbody>
              </table>
            `).join('')}
          </body>
        </html>
      `);
      
      printWindow.document.close();
      toast.success('PDF view opened in new tab');
    } catch (error) {
      toast.error('Failed to generate PDF view');
      console.error('PDF error:', error);
    } finally {
      setExporting(false);
    }
  };
  
  return (
    <Card className={cn("w-full overflow-hidden animate-fade-in", className)}>
      <CardHeader className="p-6 pb-0">
        <CardTitle className="flex justify-between items-center">
          <span>Schedule Viewer</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setView('weekly')}>
              <CalendarIcon className="h-4 w-4 mr-2" />
              Weekly
            </Button>
            <Button variant="outline" size="sm" onClick={() => setView('classroom')}>
              <HomeIcon className="h-4 w-4 mr-2" />
              Classroom
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" disabled={exporting || scheduleItems.length === 0}>
                  {exporting ? (
                    <>
                      <CheckIcon className="h-4 w-4 mr-2 animate-pulse" />
                      Exporting...
                    </>
                  ) : (
                    <>
                      <DownloadIcon className="h-4 w-4 mr-2" />
                      Export
                    </>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={exportToCSV}>
                  <FileIcon className="h-4 w-4 mr-2" />
                  Export as CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={exportToExcel}>
                  <FileSpreadsheetIcon className="h-4 w-4 mr-2" />
                  Export as Excel
                </DropdownMenuItem>
                <DropdownMenuItem onClick={printSchedule}>
                  <FileText className="h-4 w-4 mr-2" />
                  Export as PDF
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-6">
        {view === 'weekly' ? (
          <div className="space-y-6">
            <div className="flex flex-wrap gap-2">
              {days.map(day => (
                <Button
                  key={day}
                  variant={day === selectedDay ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedDay(day)}
                >
                  {day}
                </Button>
              ))}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {classrooms.map(classroom => {
                const items = classroomGroups[classroom.id] || [];
                return (
                  <div key={classroom.id} className="space-y-4">
                    <ClassroomCard classroom={classroom} />
                    
                    {items.length > 0 ? (
                      <div className="space-y-2">
                        {items.map(item => (
                          <div
                            key={item.id}
                            className="p-3 glass-card rounded-md animate-slide-up overflow-hidden"
                          >
                            <div className="text-sm font-medium">{item.className}</div>
                            <div className="text-xs text-muted-foreground mb-1">{item.subject}</div>
                            <div className="flex justify-between text-xs">
                              <span>{item.teacherName}</span>
                              <span>{item.startTime} - {item.endTime}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-3 border rounded-md bg-muted/20 text-center text-sm text-muted-foreground">
                        No classes scheduled
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <div>
                <h3 className="font-medium mb-3 text-sm">Select Classroom</h3>
                <div className="space-y-2 max-h-[500px] overflow-auto pr-2">
                  {classrooms.map(classroom => (
                    <ClassroomCard
                      key={classroom.id}
                      classroom={classroom}
                      selected={classroom.id === selectedClassroom}
                      onClick={() => setSelectedClassroom(classroom.id)}
                    />
                  ))}
                </div>
              </div>
              
              <div className="md:col-span-2 lg:col-span-3">
                <h3 className="font-medium mb-3 text-sm">Weekly Schedule</h3>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr>
                        <th className="p-2 text-left bg-secondary text-sm font-medium">Day</th>
                        <th className="p-2 text-left bg-secondary text-sm font-medium">Classes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {days.map(day => (
                        <tr key={day} className="border-t">
                          <td className="p-2 text-sm font-medium">{day}</td>
                          <td className="p-2">
                            {dayGroups[day] && dayGroups[day].length > 0 ? (
                              <div className="space-y-2">
                                {dayGroups[day].map(item => (
                                  <div
                                    key={item.id}
                                    className="p-3 glass-card rounded-md"
                                  >
                                    <div className="text-sm font-medium">{item.className}</div>
                                    <div className="text-xs text-muted-foreground mb-1">{item.subject}</div>
                                    <div className="flex justify-between text-xs">
                                      <span>{item.teacherName}</span>
                                      <span>{item.startTime} - {item.endTime}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="p-2 text-sm text-muted-foreground">No classes scheduled</div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ScheduleViewer;
