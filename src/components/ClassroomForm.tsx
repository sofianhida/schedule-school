
import React, { useState } from 'react';
import { Classroom } from '@/components/ClassroomCard';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { PlusIcon, XIcon, HomeIcon, Edit2Icon, SaveIcon } from "lucide-react";

interface ClassroomFormProps {
  classrooms: Classroom[];
  onUpdate: (classrooms: Classroom[]) => void;
}

const ClassroomForm: React.FC<ClassroomFormProps> = ({ classrooms = [], onUpdate }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Partial<Classroom>>({});

  const handleAddClassroom = () => {
    const newClassroom: Classroom = {
      id: String(Date.now()),
      name: `Room ${classrooms.length + 101}`,
      capacity: 30,
      building: 'Main Building',
      floor: 1,
      usagePercentage: 0
    };
    
    onUpdate([...classrooms, newClassroom]);
  };

  const handleRemoveClassroom = (id: string) => {
    onUpdate(classrooms.filter(classroom => classroom.id !== id));
  };

  const startEditing = (classroom: Classroom) => {
    setEditingId(classroom.id);
    setEditValues({ ...classroom });
  };

  const handleEditChange = (field: keyof Classroom, value: any) => {
    setEditValues(prev => ({ ...prev, [field]: value }));
  };

  const saveEdit = () => {
    if (!editingId) return;
    
    const updatedClassrooms = classrooms.map(classroom => 
      classroom.id === editingId ? { ...classroom, ...editValues } : classroom
    );
    
    onUpdate(updatedClassrooms);
    setEditingId(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  return (
    <Card className="w-full animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <HomeIcon className="h-5 w-5" />
          Manage Classrooms
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {classrooms.map(classroom => (
            <div key={classroom.id} className="glass-card p-4 rounded-lg space-y-3">
              {editingId === classroom.id ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor={`room-name-${classroom.id}`}>Room Name</Label>
                    <Input
                      id={`room-name-${classroom.id}`}
                      value={editValues.name || ''}
                      onChange={(e) => handleEditChange('name', e.target.value)}
                      placeholder="Room name"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor={`room-building-${classroom.id}`}>Building</Label>
                    <Input
                      id={`room-building-${classroom.id}`}
                      value={editValues.building || ''}
                      onChange={(e) => handleEditChange('building', e.target.value)}
                      placeholder="Building name"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor={`room-floor-${classroom.id}`}>Floor</Label>
                      <Input
                        id={`room-floor-${classroom.id}`}
                        type="number"
                        value={editValues.floor || 1}
                        onChange={(e) => handleEditChange('floor', parseInt(e.target.value) || 1)}
                        min="1"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor={`room-capacity-${classroom.id}`}>Capacity</Label>
                      <Input
                        id={`room-capacity-${classroom.id}`}
                        type="number"
                        value={editValues.capacity || 1}
                        onChange={(e) => handleEditChange('capacity', parseInt(e.target.value) || 1)}
                        min="1"
                      />
                    </div>
                  </div>
                  
                  <div className="flex gap-2 justify-end mt-3">
                    <Button type="button" variant="outline" size="sm" onClick={cancelEdit}>
                      Cancel
                    </Button>
                    
                    <Button type="button" size="sm" onClick={saveEdit}>
                      <SaveIcon className="h-4 w-4 mr-1" />
                      Save
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">{classroom.name}</h3>
                    <div className="flex gap-1">
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm" 
                        className="h-7 w-7 p-0"
                        onClick={() => startEditing(classroom)}
                      >
                        <Edit2Icon className="h-3.5 w-3.5" />
                      </Button>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm" 
                        className="h-7 w-7 p-0 text-destructive"
                        onClick={() => handleRemoveClassroom(classroom.id)}
                        disabled={classrooms.length <= 1}
                      >
                        <XIcon className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="text-sm text-muted-foreground">
                    <div>{classroom.building}, Floor {classroom.floor}</div>
                    <div>Capacity: {classroom.capacity} students</div>
                    {classroom.usagePercentage > 0 && (
                      <div className="mt-1">
                        Usage: {classroom.usagePercentage}%
                        <div className="w-full h-1.5 bg-muted mt-1 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full"
                            style={{ width: `${classroom.usagePercentage}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          ))}
          
          <button
            type="button"
            onClick={handleAddClassroom}
            className="border-2 border-dashed border-muted-foreground/20 rounded-lg flex flex-col items-center justify-center p-6 h-full hover:bg-accent/50 transition-colors"
          >
            <PlusIcon className="h-6 w-6 mb-2 text-muted-foreground" />
            <span className="text-muted-foreground font-medium">Add Classroom</span>
          </button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ClassroomForm;
