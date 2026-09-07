import { Course, CourseHole } from '@/data/courses';

const API_KEY = process.env.NEXT_PUBLIC_GOLFCOURSE_API_KEY || 
                process.env.GOLFCOURSE_API_KEY;
const API_BASE = 'https://api.golfcourseapi.com';

export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Search for golf courses by location/name
export async function searchCourses(query: string): Promise<Course[]> {
  if (!query.trim()) return [];

  try {
    const params = new URLSearchParams({
      key: API_KEY || '',
      q: query,
      limit: '20',
    });

    const response = await fetch(
      `${API_BASE}/v2/courses?${params.toString()}`,
      { next: { revalidate: 3600 } } // Cache for 1 hour
    );

    if (!response.ok) {
      console.error('GolfCourseAPI error:', response.statusText);
      return [];
    }

    const data: any = await response.json();
    
    if (!data.courses) return [];

    return data.courses.map((course: any) => ({
      id: `gca-${course.id}`,
      name: course.name,
      location: `${course.city}, ${course.state}`,
      par: course.holes?.length === 18 ? course.par || 72 : 72,
      holes: (course.holes || Array(18).fill(null)).map((hole: any, i: number) => ({
        holeNumber: i + 1,
        par: hole?.par || 4,
        handicap: hole?.handicap || i + 1,
      })),
    }));
  } catch (error) {
    console.error('Failed to fetch courses from GolfCourseAPI:', error);
    return [];
  }
}

// Get course details
export async function getCourseDetails(courseId: string): Promise<Course | null> {
  try {
    const params = new URLSearchParams({
      key: API_KEY || '',
    });

    const response = await fetch(
      `${API_BASE}/v2/courses/${courseId.replace('gca-', '')}?${params.toString()}`,
      { next: { revalidate: 3600 } }
    );

    if (!response.ok) return null;

    const data: any = await response.json();
    const course = data.course;

    if (!course) return null;

    return {
      id: `gca-${course.id}`,
      name: course.name,
      location: `${course.city}, ${course.state}`,
      par: course.par || 72,
      holes: (course.holes || Array(18).fill(null)).map((hole: any, i: number) => ({
        holeNumber: i + 1,
        par: hole?.par || 4,
        handicap: hole?.handicap || i + 1,
      })),
    };
  } catch (error) {
    console.error('Failed to fetch course details:', error);
    return null;
  }
}

// Get nearby courses (requires location coordinates)
export async function getNearByCourses(
  latitude: number,
  longitude: number,
  radius: number = 50
): Promise<Course[]> {
  try {
    const params = new URLSearchParams({
      key: API_KEY || '',
      lat: latitude.toString(),
      lng: longitude.toString(),
      radius: radius.toString(),
    });

    const response = await fetch(
      `${API_BASE}/v2/courses/nearby?${params.toString()}`,
      { next: { revalidate: 3600 } }
    );

    if (!response.ok) return [];

    const data: any = await response.json();
    
    if (!data.courses) return [];

    return data.courses.map((course: any) => ({
      id: `gca-${course.id}`,
      name: course.name,
      location: `${course.city}, ${course.state}`,
      par: course.par || 72,
      holes: (course.holes || Array(18).fill(null)).map((hole: any, i: number) => ({
        holeNumber: i + 1,
        par: hole?.par || 4,
        handicap: hole?.handicap || i + 1,
      })),
    }));
  } catch (error) {
    console.error('Failed to fetch nearby courses:', error);
    return [];
  }
}
