import { useState, useMemo } from "react";
import { Course } from "@/models/course";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export interface CourseSearchProps {
  courses: Array<Course>;
  onCourseSelect: (course: Course) => void;
  placeholder?: string;
  className?: string;
}

export function CourseSearch({
  courses,
  onCourseSelect,
  placeholder = "科目番号で検索...",
  className,
}: CourseSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const filteredCourses = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.trim().toLowerCase();
    return courses
      .filter((course) => course.code.toLowerCase().includes(query))
      .slice(0, 10); // Limit to 10 results for performance
  }, [courses, searchQuery]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    setIsOpen(value.trim().length > 0);
  };

  const handleCourseSelect = (course: Course) => {
    onCourseSelect(course);
    setSearchQuery("");
    setIsOpen(false);
  };

  const handleInputBlur = () => {
    // Delay closing to allow click on items
    setTimeout(() => setIsOpen(false), 150);
  };

  return (
    <div className={cn("relative w-full max-w-md", className)}>
      <Input
        value={searchQuery}
        onChange={handleInputChange}
        onFocus={() => searchQuery.trim() && setIsOpen(true)}
        onBlur={handleInputBlur}
        placeholder={placeholder}
        className="w-full"
      />
      
      {isOpen && filteredCourses.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
          {filteredCourses.map((course) => (
            <button
              key={course.code}
              onClick={() => handleCourseSelect(course)}
              className="w-full text-left px-3 py-2 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none border-b border-gray-100 last:border-b-0"
            >
              <div className="font-medium text-sm">{course.code}</div>
              <div className="text-xs text-gray-600 truncate">{course.name}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}