
import { toast } from "sonner";
import { Teacher, Class } from "@/components/ScheduleForm";
import { ScheduleItem } from "@/components/ScheduleViewer";
import { Classroom } from "@/components/ClassroomCard";

// Updated API key and model for Gemini 1.5 Flash
const GEMINI_API_KEY = "AIzaSyAPYkHtL0wY8nTkqZs8reqBvSX3OWzYQvA";

interface ScheduleGenerationRequest {
  teachers: Teacher[];
  classes: Class[];
  classrooms: Classroom[];
}

export async function generateSchedule(
  teachers: Teacher[],
  classes: Class[],
  classrooms: Classroom[]
): Promise<{ scheduleItems: ScheduleItem[], updatedClassrooms: Classroom[] }> {
  try {
    // Create a structured prompt for Gemini
    const prompt = createSchedulePrompt({ teachers, classes, classrooms });
    
    try {
      // Try to call Gemini API
      const response = await callGeminiAPI(prompt);
      // Parse and format the response
      return parseGeminiResponse(response, teachers, classes, classrooms);
    } catch (error) {
      console.error("Error calling Gemini API:", error);
      
      // Fallback to local generation if Gemini fails
      console.log("Falling back to local schedule generation");
      return generateFallbackSchedule(teachers, classes, classrooms);
    }
  } catch (error) {
    console.error("Error generating schedule:", error);
    toast.error("Failed to generate schedule. Please try again.");
    throw error;
  }
}

function createSchedulePrompt(data: ScheduleGenerationRequest): string {
  return `
    I need to create an optimized classroom schedule based on the following data:
    
    TEACHERS:
    ${JSON.stringify(data.teachers, null, 2)}
    
    CLASSES:
    ${JSON.stringify(data.classes, null, 2)}
    
    CLASSROOMS:
    ${JSON.stringify(data.classrooms, null, 2)}
    
    Please generate a schedule that:
    1. Avoids scheduling conflicts for teachers (same teacher cannot be in two places at once)
    2. Assigns classrooms with appropriate capacity for each class
    3. Respects teacher availability
    4. Maximizes classroom usage efficiency
    5. Distributes classes throughout the week
    
    Return the data in a JSON format with two sections:
    1. "scheduleItems": An array of schedule items, each with the following properties:
       - id: A unique identifier
       - classId: The ID of the class
       - className: The name of the class
       - subject: The subject being taught
       - teacherName: The name of the teacher
       - day: The day of the week (Monday, Tuesday, etc.)
       - startTime: The start time (e.g., "09:00")
       - endTime: The end time (e.g., "10:00")
       - classroomId: The ID of the assigned classroom
       - classroomName: The name of the assigned classroom
    
    2. "classroomUsage": An array of classrooms with updated usage percentages
    
    Ensure the schedule is realistic and efficiently utilizes the available resources.
  `;
}

async function callGeminiAPI(prompt: string) {
  try {
    // Update to use the Gemini 1.5 Flash model
    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + GEMINI_API_KEY, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.2, // Lower temperature for more deterministic results
          topP: 0.95,
          topK: 64,
          maxOutputTokens: 8192,
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Gemini API error:", errorData);
      throw new Error(`API call failed with status: ${response.status}`);
    }

    const data = await response.json();
    
    // Extract the text from the Gemini response
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      const textParts = data.candidates[0].content.parts.map((part: any) => part.text).join("");
      return textParts;
    }
    
    throw new Error("Invalid response format from Gemini API");
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw error;
  }
}

function parseGeminiResponse(
  response: string, 
  teachers: Teacher[], 
  classes: Class[], 
  existingClassrooms: Classroom[]
): { scheduleItems: ScheduleItem[], updatedClassrooms: Classroom[] } {
  try {
    // Extract JSON from the response (Gemini might wrap it in text)
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    
    if (!jsonMatch) {
      // If no JSON is found, simulate a basic schedule
      return generateFallbackSchedule(teachers, classes, existingClassrooms);
    }
    
    const jsonData = JSON.parse(jsonMatch[0]);
    
    // Validate and format the received data
    const scheduleItems: ScheduleItem[] = jsonData.scheduleItems || [];
    
    // Update classroom usage data
    const updatedClassrooms = [...existingClassrooms];
    
    if (jsonData.classroomUsage) {
      jsonData.classroomUsage.forEach((usage: any) => {
        const index = updatedClassrooms.findIndex(c => c.id === usage.id);
        if (index !== -1) {
          updatedClassrooms[index] = {
            ...updatedClassrooms[index],
            usagePercentage: usage.usagePercentage
          };
        }
      });
    } else {
      // Calculate usage if not provided
      updatedClassrooms.forEach((classroom, index) => {
        const usageCount = scheduleItems.filter(item => item.classroomId === classroom.id).length;
        // Rough calculation based on 25 possible slots per week (5 days * 5 hours)
        const usagePercentage = Math.round((usageCount / 25) * 100);
        updatedClassrooms[index] = {
          ...classroom,
          usagePercentage: usagePercentage
        };
      });
    }
    
    return { scheduleItems, updatedClassrooms };
  } catch (error) {
    console.error("Error parsing Gemini response:", error);
    // Fall back to a simple generated schedule
    return generateFallbackSchedule(teachers, classes, existingClassrooms);
  }
}

function generateFallbackSchedule(
  teachers: Teacher[], 
  classes: Class[], 
  classrooms: Classroom[]
): { scheduleItems: ScheduleItem[], updatedClassrooms: Classroom[] } {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const startTimes = ['08:00', '09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00'];
  const scheduleItems: ScheduleItem[] = [];
  
  // Track teacher and classroom availability
  const teacherSchedule: Record<string, Record<string, string[]>> = {};
  const classroomSchedule: Record<string, Record<string, string[]>> = {};
  
  // Initialize tracking
  teachers.forEach(teacher => {
    teacherSchedule[teacher.id] = {};
    days.forEach(day => {
      if (teacher.availability.includes(day)) {
        teacherSchedule[teacher.id][day] = [...startTimes];
      } else {
        teacherSchedule[teacher.id][day] = [];
      }
    });
  });
  
  classrooms.forEach(classroom => {
    classroomSchedule[classroom.id] = {};
    days.forEach(day => {
      classroomSchedule[classroom.id][day] = [...startTimes];
    });
  });
  
  // Schedule each class
  classes.forEach(cls => {
    const teacher = teachers.find(t => t.id === cls.teacherId);
    if (!teacher) return;
    
    // Find suitable classroom (simple matching based on student count)
    const suitableClassrooms = classrooms
      .filter(c => c.capacity >= cls.students)
      .sort((a, b) => a.capacity - b.capacity);
    
    if (suitableClassrooms.length === 0) return;
    
    // Schedule hours for this class
    let scheduled = 0;
    
    // Try to distribute across days
    for (const day of days) {
      if (scheduled >= cls.hours) break;
      
      if (teacherSchedule[teacher.id][day]?.length > 0) {
        // Find classroom with available slots
        for (const classroom of suitableClassrooms) {
          if (classroomSchedule[classroom.id][day]?.length > 0) {
            // Find common available time
            const teacherAvailable = teacherSchedule[teacher.id][day];
            const classroomAvailable = classroomSchedule[classroom.id][day];
            
            const commonTimes = teacherAvailable.filter(time => 
              classroomAvailable.includes(time)
            ).sort();
            
            if (commonTimes.length > 0) {
              // Schedule this slot
              const startTime = commonTimes[0];
              const timeIndex = startTimes.indexOf(startTime);
              let endTime = startTimes[timeIndex + 1] || '17:00';
              
              // Create schedule item
              scheduleItems.push({
                id: `${cls.id}-${day}-${startTime}`,
                classId: cls.id,
                className: cls.name,
                subject: cls.subject,
                teacherName: teacher.name,
                day,
                startTime,
                endTime,
                classroomId: classroom.id,
                classroomName: classroom.name
              });
              
              // Remove used time slot
              teacherSchedule[teacher.id][day] = teacherAvailable.filter(t => t !== startTime);
              classroomSchedule[classroom.id][day] = classroomAvailable.filter(t => t !== startTime);
              
              scheduled++;
              break;
            }
          }
        }
      }
    }
  });
  
  // Calculate classroom usage
  const updatedClassrooms = classrooms.map(classroom => {
    // Count how many slots are used for this classroom
    const totalPossibleSlots = days.length * startTimes.length;
    const usedSlots = scheduleItems.filter(item => item.classroomId === classroom.id).length;
    const usagePercentage = Math.round((usedSlots / totalPossibleSlots) * 100);
    
    return {
      ...classroom,
      usagePercentage
    };
  });
  
  return { scheduleItems, updatedClassrooms };
}
