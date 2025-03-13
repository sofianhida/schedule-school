
import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusIcon, MinusIcon, Loader2Icon, XIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Teacher {
  id: string;
  name: string;
  subjects: string[];
  availability: string[];
}

export interface Class {
  id: string;
  name: string;
  subject: string;
  teacherId: string;
  hours: number;
  students: number;
}

interface ScheduleFormProps {
  onGenerateSchedule: (teachers: Teacher[], classes: Class[]) => Promise<void>;
  isGenerating: boolean;
  className?: string;
}

const ScheduleForm: React.FC<ScheduleFormProps> = ({ 
  onGenerateSchedule, 
  isGenerating,
  className 
}) => {
  const [teachers, setTeachers] = useState<Teacher[]>([
    { id: '1', name: '', subjects: [''], availability: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] }
  ]);
  
  const [classes, setClasses] = useState<Class[]>([
    { id: '1', name: '', subject: '', teacherId: '1', hours: 2, students: 25 }
  ]);

  const addTeacher = () => {
    setTeachers([
      ...teachers,
      { 
        id: String(teachers.length + 1), 
        name: '', 
        subjects: [''], 
        availability: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] 
      }
    ]);
  };

  const removeTeacher = (index: number) => {
    if (teachers.length <= 1) return;
    const updatedTeachers = [...teachers];
    updatedTeachers.splice(index, 1);
    setTeachers(updatedTeachers);
  };

  const updateTeacher = (index: number, field: keyof Teacher, value: any) => {
    const updatedTeachers = [...teachers];
    updatedTeachers[index] = { ...updatedTeachers[index], [field]: value };
    setTeachers(updatedTeachers);
  };

  const updateTeacherSubject = (teacherIndex: number, subjectIndex: number, value: string) => {
    const updatedTeachers = [...teachers];
    const updatedSubjects = [...updatedTeachers[teacherIndex].subjects];
    updatedSubjects[subjectIndex] = value;
    updatedTeachers[teacherIndex].subjects = updatedSubjects;
    setTeachers(updatedTeachers);
  };

  const addSubjectToTeacher = (teacherIndex: number) => {
    const updatedTeachers = [...teachers];
    updatedTeachers[teacherIndex].subjects.push('');
    setTeachers(updatedTeachers);
  };

  const removeSubjectFromTeacher = (teacherIndex: number, subjectIndex: number) => {
    if (teachers[teacherIndex].subjects.length <= 1) return;
    
    const updatedTeachers = [...teachers];
    updatedTeachers[teacherIndex].subjects.splice(subjectIndex, 1);
    setTeachers(updatedTeachers);
  };

  const addClass = () => {
    setClasses([
      ...classes,
      { 
        id: String(classes.length + 1), 
        name: '', 
        subject: '', 
        teacherId: teachers[0]?.id || '1', 
        hours: 2, 
        students: 25 
      }
    ]);
  };

  const removeClass = (index: number) => {
    if (classes.length <= 1) return;
    const updatedClasses = [...classes];
    updatedClasses.splice(index, 1);
    setClasses(updatedClasses);
  };

  const updateClass = (index: number, field: keyof Class, value: any) => {
    const updatedClasses = [...classes];
    updatedClasses[index] = { ...updatedClasses[index], [field]: value };
    setClasses(updatedClasses);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onGenerateSchedule(teachers, classes);
  };

  return (
    <Card className={cn("w-full overflow-hidden animate-fade-in", className)}>
      <Tabs defaultValue="teachers" className="w-full">
        <TabsList className="w-full grid grid-cols-2">
          <TabsTrigger value="teachers">Teachers</TabsTrigger>
          <TabsTrigger value="classes">Classes</TabsTrigger>
        </TabsList>
        
        <form onSubmit={handleSubmit}>
          <TabsContent value="teachers" className="p-6 space-y-6">
            <div className="grid gap-6">
              {teachers.map((teacher, index) => (
                <div key={teacher.id} className="space-y-4 glass-card p-4 rounded-lg animate-slide-up" style={{ animationDelay: `${index * 0.05}s` }}>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium">Teacher {index + 1}</h3>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeTeacher(index)}
                      className="h-8 w-8 p-0 text-destructive"
                      disabled={teachers.length <= 1}
                    >
                      <XIcon className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor={`teacher-name-${index}`}>Teacher Name</Label>
                      <Input
                        id={`teacher-name-${index}`}
                        value={teacher.name}
                        onChange={(e) => updateTeacher(index, 'name', e.target.value)}
                        placeholder="Enter teacher name"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Availability</Label>
                      <div className="flex flex-wrap gap-2">
                        {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((day) => (
                          <Button
                            key={day}
                            type="button"
                            variant={teacher.availability.includes(day) ? "default" : "outline"}
                            size="sm"
                            onClick={() => {
                              const availability = teacher.availability.includes(day)
                                ? teacher.availability.filter(d => d !== day)
                                : [...teacher.availability, day];
                              updateTeacher(index, 'availability', availability);
                            }}
                            className="text-xs"
                          >
                            {day.substring(0, 3)}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Subjects</Label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => addSubjectToTeacher(index)}
                        className="h-8 w-8 p-0"
                      >
                        <PlusIcon className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    {teacher.subjects.map((subject, subjectIndex) => (
                      <div key={subjectIndex} className="flex gap-2 items-center">
                        <Input
                          value={subject}
                          onChange={(e) => updateTeacherSubject(index, subjectIndex, e.target.value)}
                          placeholder="Enter subject"
                          required
                        />
                        {teacher.subjects.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeSubjectFromTeacher(index, subjectIndex)}
                            className="h-8 w-8 p-0 text-destructive"
                          >
                            <MinusIcon className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              
              <Button
                type="button"
                variant="outline"
                onClick={addTeacher}
                className="w-full"
              >
                <PlusIcon className="mr-2 h-4 w-4" />
                Add Teacher
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="classes" className="p-6 space-y-6">
            <div className="grid gap-6">
              {classes.map((cls, index) => (
                <div key={cls.id} className="space-y-4 glass-card p-4 rounded-lg animate-slide-up" style={{ animationDelay: `${index * 0.05}s` }}>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium">Class {index + 1}</h3>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeClass(index)}
                      className="h-8 w-8 p-0 text-destructive"
                      disabled={classes.length <= 1}
                    >
                      <XIcon className="h-4 w-4" />
                    </Button>
                  </div>
                
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor={`class-name-${index}`}>Class Name</Label>
                      <Input
                        id={`class-name-${index}`}
                        value={cls.name}
                        onChange={(e) => updateClass(index, 'name', e.target.value)}
                        placeholder="Enter class name"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor={`class-subject-${index}`}>Subject</Label>
                      <Input
                        id={`class-subject-${index}`}
                        value={cls.subject}
                        onChange={(e) => updateClass(index, 'subject', e.target.value)}
                        placeholder="Enter subject"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor={`class-teacher-${index}`}>Teacher</Label>
                      <select
                        id={`class-teacher-${index}`}
                        value={cls.teacherId}
                        onChange={(e) => updateClass(index, 'teacherId', e.target.value)}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        required
                      >
                        {teachers.map((teacher) => (
                          <option key={teacher.id} value={teacher.id}>
                            {teacher.name || `Teacher ${teacher.id}`}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor={`class-hours-${index}`}>Hours per week</Label>
                      <Input
                        id={`class-hours-${index}`}
                        type="number"
                        min="1"
                        max="20"
                        value={cls.hours}
                        onChange={(e) => updateClass(index, 'hours', parseInt(e.target.value) || 1)}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor={`class-students-${index}`}>Students</Label>
                      <Input
                        id={`class-students-${index}`}
                        type="number"
                        min="1"
                        max="100"
                        value={cls.students}
                        onChange={(e) => updateClass(index, 'students', parseInt(e.target.value) || 1)}
                        required
                      />
                    </div>
                  </div>
                </div>
              ))}
              
              <Button
                type="button"
                variant="outline"
                onClick={addClass}
                className="w-full"
              >
                <PlusIcon className="mr-2 h-4 w-4" />
                Add Class
              </Button>
            </div>
          </TabsContent>
          
          <Separator />
          
          <div className="p-6">
            <Button
              type="submit"
              className="w-full"
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                  Generating Schedule...
                </>
              ) : (
                "Generate Optimized Schedule"
              )}
            </Button>
          </div>
        </form>
      </Tabs>
    </Card>
  );
};

export default ScheduleForm;
