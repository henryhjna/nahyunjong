import { siteConfig } from '../metadata';

export interface Course {
  id: number;
  title: string;
  code?: string;
  description?: string;
  semester?: string;
  thumbnail_url?: string;
}

export function generateCourseSchema(course: Course) {
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: course.title,
    provider: {
      '@type': 'CollegeOrUniversity',
      name: '한양대학교',
    },
    instructor: {
      '@type': 'Person',
      name: siteConfig.name,
    },
  };

  if (course.description) {
    schema.description = course.description;
  }

  if (course.code) {
    schema.courseCode = course.code;
  }

  return schema;
}

export function generateCourseListSchema(courses: Course[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${siteConfig.name} 강의`,
    description: `${siteConfig.name} 교수의 강의 목록`,
    numberOfItems: courses.length,
    itemListElement: courses.map((course, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: generateCourseSchema(course),
    })),
  };
}
