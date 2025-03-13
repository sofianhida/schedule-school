
import React from 'react';
import { cn } from "@/lib/utils";

export interface Classroom {
  id: string;
  name: string;
  capacity: number;
  building?: string;
  floor?: number;
  usagePercentage?: number;
}

interface ClassroomCardProps {
  classroom: Classroom;
  onClick?: () => void;
  selected?: boolean;
  className?: string;
}

const ClassroomCard: React.FC<ClassroomCardProps> = ({ 
  classroom, 
  onClick, 
  selected = false,
  className
}) => {
  return (
    <div 
      className={cn(
        "glass-card rounded-lg p-4 transition-all duration-300 hover:shadow-md cursor-pointer animate-scale-in",
        selected ? "ring-2 ring-primary" : "hover:translate-y-[-2px]",
        className
      )}
      onClick={onClick}
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-medium text-lg">{classroom.name}</h3>
        <span className="text-xs px-2 py-1 bg-secondary rounded-full">
          {classroom.capacity} seats
        </span>
      </div>
      
      {(classroom.building || classroom.floor !== undefined) && (
        <div className="text-sm text-muted-foreground mb-3">
          {classroom.building && `${classroom.building}`}
          {classroom.building && classroom.floor !== undefined && ', '}
          {classroom.floor !== undefined && `Floor ${classroom.floor}`}
        </div>
      )}
      
      {classroom.usagePercentage !== undefined && (
        <div className="mt-2">
          <div className="flex justify-between text-xs mb-1">
            <span>Usage</span>
            <span className={cn(
              classroom.usagePercentage > 80 ? "text-green-500" :
              classroom.usagePercentage > 50 ? "text-amber-500" : 
              "text-muted-foreground"
            )}>
              {classroom.usagePercentage}%
            </span>
          </div>
          <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
            <div 
              className={cn(
                "h-full rounded-full transition-all duration-500",
                classroom.usagePercentage > 80 ? "bg-green-500" :
                classroom.usagePercentage > 50 ? "bg-amber-500" : 
                "bg-primary/50"
              )} 
              style={{ width: `${classroom.usagePercentage}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassroomCard;
