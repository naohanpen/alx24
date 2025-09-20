import { Course, loadCourses } from "@/models/course";
import {
  CourseViewItemTag,
  CourseViewTab,
  getCourseViewTabs,
  findCourseTabPath,
} from "@/models/courseView";
import { CourseList } from "@/components/CourseList";
import { CourseSearch } from "@/components/CourseSearch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TabsContent } from "@radix-ui/react-tabs";
import { Summary } from "@/components/Summary";
import { FC, JSX, useState, useEffect } from "react";
import { SelectedCourses, setSelectedCourse } from "@/models/selectedCourse";

export const CourseView: FC<{
  selectedCourses: SelectedCourses;
  setSelectedCourses: (courses: SelectedCourses) => void;
}> = ({ selectedCourses, setSelectedCourses }) => {
  const courses = loadCourses();
  const tabs = getCourseViewTabs(courses, selectedCourses);
  const [activeTab, setActiveTab] = useState<string>("");
  const [activeTabPath, setActiveTabPath] = useState<string[]>([]);
  const [highlightedCourse, setHighlightedCourse] = useState<string | null>(null);

  const onCourseClick = (course: Course, newTag: CourseViewItemTag) => {
    if (newTag === "ineligible") return;
    setSelectedCourses(setSelectedCourse(selectedCourses, course, newTag));
  };

  const onCourseSearch = (course: Course) => {
    const tabPath = findCourseTabPath(course.code, tabs);
    if (tabPath && tabPath.length > 0) {
      // Switch to the main tab and store the full path
      setActiveTab(tabPath[0]);
      setActiveTabPath(tabPath);
      setHighlightedCourse(course.code);
      
      // Clear highlight after a few seconds
      setTimeout(() => {
        setHighlightedCourse(null);
      }, 3000);
    }
  };

  // Clear highlight when active tab changes
  useEffect(() => {
    if (highlightedCourse) {
      const tabPath = findCourseTabPath(highlightedCourse, tabs);
      if (!tabPath || tabPath[0] !== activeTab) {
        setHighlightedCourse(null);
      }
    }
  }, [activeTab, highlightedCourse, tabs]);

  // Clear active tab path when active tab changes manually
  useEffect(() => {
    if (activeTabPath.length > 0 && activeTabPath[0] !== activeTab) {
      setActiveTabPath([]);
    }
  }, [activeTab, activeTabPath]);

  const tabViews = [];
  const contents = [];
  for (const tab of tabs) {
    const [tabView, content] = genInnerCourseView(tab, onCourseClick, highlightedCourse, activeTabPath.slice(1));
    tabViews.push(tabView);
    contents.push(content);
  }

  const defaultTab = tabViews.find((tabView) => !tabView.props.disabled)?.props
    .value;
  
  const currentActiveTab = activeTab || defaultTab;

  return (
    <div>
      {/* Search Section */}
      <div className="mb-6">
        <CourseSearch
          courses={courses}
          onCourseSelect={onCourseSearch}
          className="mx-auto"
        />
      </div>

      <Tabs value={currentActiveTab} onValueChange={setActiveTab} className="mb-16 text-start">
        <TabsList>{tabViews}</TabsList>
        {contents}
      </Tabs>
      <Summary selectedCourses={selectedCourses} />
    </div>
  );
};

function genInnerCourseView(
  tab: CourseViewTab,
  onCourseClick: (course: Course, tag: CourseViewItemTag) => void,
  highlightedCourse?: string | null,
  activeSubTabPath?: string[],
): [JSX.Element, JSX.Element] {
  const tabView = (
    <TabsTrigger key={tab.name} value={tab.name} disabled={tab.isDisabled}>
      {tab.name}
    </TabsTrigger>
  );

  if (tab.children.length === 0) {
    const content = (
      <TabsContent key={tab.name} value={tab.name}>
        <div className="mt-4">
          <CourseList 
            items={tab.items} 
            onCourseClick={onCourseClick}
            highlightedCourse={highlightedCourse}
          />
        </div>
      </TabsContent>
    );
    return [tabView, content];
  }

  const tabViews = [];
  const contents = [];
  for (const childItem of tab.children) {
    const [tabView, content] = genInnerCourseView(
      childItem, 
      onCourseClick, 
      highlightedCourse, 
      activeSubTabPath && activeSubTabPath.length > 0 ? activeSubTabPath.slice(1) : undefined
    );
    tabViews.push(tabView);
    contents.push(content);
  }

  const defaultTab = tabViews.find((tabView) => !tabView.props.disabled)?.props
    .value;
  
  // Use activeSubTabPath to determine which tab should be active
  const currentActiveTab = activeSubTabPath && activeSubTabPath.length > 0 
    ? activeSubTabPath[0] 
    : defaultTab;

  const content = (
    <TabsContent key={tab.name} value={tab.name}>
      <Tabs value={currentActiveTab}>
        <TabsList className="w-full justify-start overflow-x-scroll">
          {tabViews}
        </TabsList>
        {contents}
      </Tabs>
    </TabsContent>
  );

  return [tabView, content];
}
