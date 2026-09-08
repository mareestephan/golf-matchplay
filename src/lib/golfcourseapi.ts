import { Course, CourseHole, TeeBox } from '@/data/courses';

// Use NEXT_PUBLIC_ prefix for client-side access
const API_KEY = typeof window !== 'undefined' 
  ? process.env.NEXT_PUBLIC_GOLFCOURSE_API_KEY 
  : (process.env.NEXT_PUBLIC_GOLFCOURSE_API_KEY || process.env.GOLFCOURSE_API_KEY);
const API_BASE = 'https://api.golfcourseapi.com';

export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Club/course names are often identical; avoid "X - X" duplication
function formatCourseName(clubName?: string, courseName?: string): string {
  if (clubName && courseName && clubName !== courseName) return `${clubName} - ${courseName}`;
  return clubName || courseName || 'Unknown Course';
}

function formatCourseLocation(location?: { city?: string; state?: string; country?: string }): string {
  const parts = [location?.city, location?.state, location?.country].filter(
    (part) => part && part.toLowerCase() !== 'unknown'
  );
  return parts.length ? parts.join(', ') : 'Unknown';
}

// Search for golf courses by location/name
export async function searchCourses(query: string): Promise<Course[]> {
  if (!query.trim()) return [];

  try {
    const params = new URLSearchParams({
      search_query: query,
      fuzzy_match: 'true',
    });

    const url = `${API_BASE}/v1/search?${params.toString()}`;

    const response = await fetch(
      url,
      {
        next: { revalidate: 3600 }, // Cache for 1 hour
        headers: {
          Authorization: `Bearer ${API_KEY || ''}`,
        },
      }
    );

    if (!response.ok) {
      console.error('GolfCourseAPI search error:', response.statusText, response.status);
      return [];
    }

    const data: any = await response.json();

    if (!data.courses) return [];

    return data.courses.map((course: any) => ({
      id: `gca-${course.id}`,
      name: formatCourseName(course.club_name, course.course_name),
      location: formatCourseLocation(course.location),
      par: 72,
      tees: course.tees || {},
      holes: Array(18).fill(null).map((_, i: number) => ({
        holeNumber: i + 1,
        par: 4,
        handicap: i + 1,
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
    const cleanId = courseId.replace('gca-', '');
    const url = `${API_BASE}/v1/courses/${cleanId}`;

    const response = await fetch(
      url,
      {
        next: { revalidate: 3600 },
        headers: {
          Authorization: `Bearer ${API_KEY || ''}`,
        },
      }
    );

    if (!response.ok) {
      console.error('Course details response not ok:', response.statusText, response.status);
      return null;
    }

    const data: any = await response.json();
    // Only requested log: raw response from the courses/{id} endpoint
    console.log('GolfCourseAPI getCourseDetails response:', data);

    // API wraps the course in a "course" key; fall back to unwrapped shape defensively
    const course = data.course || data;

    if (!course || !course.id) return null;

    // Flatten tee boxes across all genders (male/female/senior/etc.)
    const teeBoxes: TeeBox[] = [];
    if (course.tees && typeof course.tees === 'object') {
      for (const gender of Object.keys(course.tees)) {
        const boxes = course.tees[gender];
        if (!Array.isArray(boxes)) continue;
        for (const box of boxes) {
          teeBoxes.push({
            gender,
            teeName: box.tee_name || box.name || gender,
            courseRating: box.course_rating,
            slopeRating: box.slope_rating,
            bogeyRating: box.bogey_rating,
            totalYards: box.total_yards,
            totalMeters: box.total_meters,
            parTotal: box.par_total,
            numberOfHoles: box.number_of_holes,
            holes: Array.isArray(box.holes)
              ? box.holes.map((hole: any, i: number) => ({
                  holeNumber: i + 1,
                  par: hole?.par || 4,
                  handicap: hole?.handicap || i + 1,
                  yardage: hole?.yardage,
                }))
              : [],
          });
        }
      }
    }

    const defaultHoles = teeBoxes[0]?.holes?.length
      ? teeBoxes[0].holes
      : Array(18).fill(null).map((_, i: number) => ({
          holeNumber: i + 1,
          par: 4,
          handicap: i + 1,
        }));

    return {
      id: `gca-${course.id}`,
      name: formatCourseName(course.club_name, course.course_name),
      location: formatCourseLocation(course.location),
      par: teeBoxes[0]?.parTotal || 72,
      teeBoxes,
      holes: defaultHoles,
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
      name: formatCourseName(course.club_name, course.course_name) !== 'Unknown Course'
        ? formatCourseName(course.club_name, course.course_name)
        : course.name,
      location: formatCourseLocation(course.location),
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
