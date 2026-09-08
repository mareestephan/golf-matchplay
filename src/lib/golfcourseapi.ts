import { Course, CourseHole, TeeBox } from '@/data/courses';

const API_KEY = process.env.NEXT_PUBLIC_GOLFCOURSE_API_KEY;
const API_BASE = 'https://api.golfcourseapi.com';

/** Thrown for user-surfaceable problems talking to the golf course API. */
export class CourseApiError extends Error {}

// Club/course names are often identical; avoid "X — X" duplication.
function formatCourseName(clubName?: string, courseName?: string): string {
  if (clubName && courseName && clubName !== courseName) {
    return `${clubName} — ${courseName}`;
  }
  return clubName || courseName || 'Unknown Course';
}

function formatCourseLocation(location?: {
  city?: string;
  state?: string;
  country?: string;
}): string {
  const parts = [location?.city, location?.state, location?.country].filter(
    (part) => part && part.toLowerCase() !== 'unknown'
  );
  return parts.length ? parts.join(', ') : 'Location unavailable';
}

function messageForStatus(status: number, fallback: string): string {
  if (status === 401 || status === 403) return 'Course search rejected the API key.';
  if (status === 429) return 'Too many searches — please wait a moment.';
  if (status >= 500) return 'The course directory is temporarily unavailable.';
  return fallback;
}

async function request(path: string): Promise<unknown> {
  if (!API_KEY) {
    throw new CourseApiError(
      'Course search is not configured. Set NEXT_PUBLIC_GOLFCOURSE_API_KEY.'
    );
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      headers: { Authorization: `Bearer ${API_KEY}` },
    });
  } catch {
    throw new CourseApiError(
      'Could not reach the course directory. Check your connection.'
    );
  }

  if (!response.ok) {
    throw new CourseApiError(
      messageForStatus(response.status, 'Course search failed. Try again.')
    );
  }

  return response.json();
}

// Search for golf courses by name/location.
export async function searchCourses(query: string): Promise<Course[]> {
  if (!query.trim()) return [];

  const params = new URLSearchParams({
    search_query: query,
    fuzzy_match: 'true',
  });

  const data = (await request(`/v1/search?${params.toString()}`)) as {
    courses?: Array<Record<string, unknown>>;
  };

  if (!data.courses) return [];

  return data.courses.map((course) => ({
    id: `gca-${course.id}`,
    name: formatCourseName(
      course.club_name as string,
      course.course_name as string
    ),
    location: formatCourseLocation(
      course.location as { city?: string; state?: string; country?: string }
    ),
    par: 72,
    holes: Array.from({ length: 18 }, (_, i) => ({
      holeNumber: i + 1,
      par: 4,
      handicap: i + 1,
    })),
  }));
}

// Get full course details (tee boxes + hole data) for a searched course.
export async function getCourseDetails(courseId: string): Promise<Course> {
  const cleanId = courseId.replace('gca-', '');
  const data = (await request(`/v1/courses/${cleanId}`)) as Record<string, unknown>;

  const course = (data.course as Record<string, unknown>) || data;
  if (!course || !course.id) {
    throw new CourseApiError('This course could not be loaded.');
  }

  const teeBoxes: TeeBox[] = [];
  const tees = course.tees as Record<string, unknown> | undefined;
  if (tees && typeof tees === 'object') {
    for (const gender of Object.keys(tees)) {
      const boxes = tees[gender];
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
            ? box.holes.map((hole: Record<string, unknown>, i: number) => ({
                holeNumber: i + 1,
                par: (hole?.par as number) || 4,
                handicap: (hole?.handicap as number) || i + 1,
                yardage: hole?.yardage as number | undefined,
              }))
            : [],
        });
      }
    }
  }

  const defaultHoles: CourseHole[] = teeBoxes[0]?.holes?.length
    ? teeBoxes[0].holes
    : Array.from({ length: 18 }, (_, i) => ({
        holeNumber: i + 1,
        par: 4,
        handicap: i + 1,
      }));

  return {
    id: `gca-${course.id}`,
    name: formatCourseName(
      course.club_name as string,
      course.course_name as string
    ),
    location: formatCourseLocation(
      course.location as { city?: string; state?: string; country?: string }
    ),
    par: teeBoxes[0]?.parTotal || 72,
    teeBoxes,
    holes: defaultHoles,
  };
}
