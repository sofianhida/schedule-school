import { Teacher, Class } from '@/components/ScheduleForm';
import { ScheduleItem } from '@/components/ScheduleViewer';
import { Classroom } from '@/components/ClassroomCard';
import { generateSchedule } from './geminiService';
import { toast } from "sonner";

// Default classrooms if none provided
const DEFAULT_CLASSROOMS: Classroom[] = [
  { id: '1', name: 'Room 101', capacity: 30, building: 'Main Building', floor: 1, usagePercentage: 0 },
  { id: '2', name: 'Room 102', capacity: 25, building: 'Main Building', floor: 1, usagePercentage: 0 },
  { id: '3', name: 'Room 201', capacity: 40, building: 'Main Building', floor: 2, usagePercentage: 0 },
  { id: '4', name: 'Room 202', capacity: 35, building: 'Main Building', floor: 2, usagePercentage: 0 },
  { id: '5', name: 'Lab 301', capacity: 20, building: 'Science Wing', floor: 3, usagePercentage: 0 },
  { id: '6', name: 'Lecture Hall', capacity: 100, building: 'Main Building', floor: 1, usagePercentage: 0 },
];

// Validate teacher data
function validateTeachers(teachers: Teacher[]): string | null {
  if (teachers.length === 0) {
    return "No teachers provided";
  }
  
  for (const teacher of teachers) {
    if (!teacher.name.trim()) {
      return "All teachers must have names";
    }
    
    if (teacher.subjects.some(s => !s.trim())) {
      return "All teachers must have at least one valid subject";
    }
    
    if (teacher.availability.length === 0) {
      return `Teacher ${teacher.name} has no available days`;
    }
  }
  
  return null;
}

// Validate class data
function validateClasses(classes: Class[], teachers: Teacher[]): string | null {
  if (classes.length === 0) {
    return "No classes provided";
  }
  
  for (const cls of classes) {
    if (!cls.name.trim()) {
      return "All classes must have names";
    }
    
    if (!cls.subject.trim()) {
      return "All classes must have subjects";
    }
    
    if (cls.hours <= 0) {
      return `Class ${cls.name} has invalid hours: ${cls.hours}`;
    }
    
    if (cls.students <= 0) {
      return `Class ${cls.name} has invalid student count: ${cls.students}`;
    }
    
    // Verify teacher exists
    const teacher = teachers.find(t => t.id === cls.teacherId);
    if (!teacher) {
      return `Class ${cls.name} references non-existent teacher ID: ${cls.teacherId}`;
    }
  }
  
  return null;
}

// Main function to generate schedule
export async function createOptimizedSchedule(
  teachers: Teacher[],
  classes: Class[],
  existingClassrooms?: Classroom[]
): Promise<{ scheduleItems: ScheduleItem[], classrooms: Classroom[] }> {
  // Validate input data
  const teacherError = validateTeachers(teachers);
  if (teacherError) {
    toast.error(teacherError);
    throw new Error(teacherError);
  }
  
  const classError = validateClasses(classes, teachers);
  if (classError) {
    toast.error(classError);
    throw new Error(classError);
  }
  
  // Use default classrooms if none provided
  const classrooms = existingClassrooms || DEFAULT_CLASSROOMS;
  
  try {
    // Call the AI service to generate the schedule
    const { scheduleItems, updatedClassrooms } = await generateSchedule(
      teachers,
      classes,
      classrooms
    );
    
    // Double-check results for obvious conflicts
    const conflicts = findScheduleConflicts(scheduleItems);
    
    if (conflicts.length > 0) {
      console.warn("Schedule contains conflicts:", conflicts);
      toast.warning("Generated schedule contains some conflicts that were automatically resolved");
      
      // Remove conflicting items
      const cleanedItems = removeConflictingItems(scheduleItems, conflicts);
      return { scheduleItems: cleanedItems, classrooms: updatedClassrooms };
    }
    
    return { scheduleItems, classrooms: updatedClassrooms };
  } catch (error) {
    console.error("Error in schedule generation:", error);
    throw error;
  }
}

// Helper function to find conflicts in the schedule
function findScheduleConflicts(scheduleItems: ScheduleItem[]): Array<{ type: string, items: ScheduleItem[] }> {
  const conflicts = [];
  
  // Check for teacher conflicts (same teacher, same time)
  const teacherTimeMap: Record<string, Record<string, ScheduleItem[]>> = {};
  
  scheduleItems.forEach(item => {
    const timeKey = `${item.day}-${item.startTime}`;
    
    if (!teacherTimeMap[item.teacherName]) {
      teacherTimeMap[item.teacherName] = {};
    }
    
    if (!teacherTimeMap[item.teacherName][timeKey]) {
      teacherTimeMap[item.teacherName][timeKey] = [];
    }
    
    teacherTimeMap[item.teacherName][timeKey].push(item);
  });
  
  // Find any teacher scheduled in multiple places at once
  for (const teacherName in teacherTimeMap) {
    for (const timeKey in teacherTimeMap[teacherName]) {
      const items = teacherTimeMap[teacherName][timeKey];
      if (items.length > 1) {
        conflicts.push({
          type: 'teacher',
          items
        });
      }
    }
  }
  
  // Check for classroom conflicts (same room, same time)
  const roomTimeMap: Record<string, Record<string, ScheduleItem[]>> = {};
  
  scheduleItems.forEach(item => {
    const timeKey = `${item.day}-${item.startTime}`;
    
    if (!roomTimeMap[item.classroomId]) {
      roomTimeMap[item.classroomId] = {};
    }
    
    if (!roomTimeMap[item.classroomId][timeKey]) {
      roomTimeMap[item.classroomId][timeKey] = [];
    }
    
    roomTimeMap[item.classroomId][timeKey].push(item);
  });
  
  // Find any room with multiple classes at once
  for (const roomId in roomTimeMap) {
    for (const timeKey in roomTimeMap[roomId]) {
      const items = roomTimeMap[roomId][timeKey];
      if (items.length > 1) {
        conflicts.push({
          type: 'classroom',
          items
        });
      }
    }
  }
  
  return conflicts;
}

// Remove conflicting items, keeping the first one
function removeConflictingItems(
  scheduleItems: ScheduleItem[],
  conflicts: Array<{ type: string, items: ScheduleItem[] }>
): ScheduleItem[] {
  const itemsToRemove = new Set<string>();
  
  conflicts.forEach(conflict => {
    // Keep the first item, mark the others for removal
    for (let i = 1; i < conflict.items.length; i++) {
      itemsToRemove.add(conflict.items[i].id);
    }
  });
  
  return scheduleItems.filter(item => !itemsToRemove.has(item.id));
}
