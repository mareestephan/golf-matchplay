export interface Course {
  id: string;
  name: string;
  location: string;
  par: number;
  holes: CourseHole[];
  tees?: {
    male?: number;
    female?: number;
    senior?: number;
  };
  teeBoxes?: TeeBox[];
}

export interface TeeBox {
  gender: string;
  teeName: string;
  courseRating?: number;
  slopeRating?: number;
  bogeyRating?: number;
  totalYards?: number;
  totalMeters?: number;
  parTotal?: number;
  numberOfHoles?: number;
  holes: CourseHole[];
}

export interface CourseHole {
  holeNumber: number;
  par: number;
  handicap: number;
  yardage?: number;
}

// Hardcoded popular South African courses
// TODO: Replace with GolfCourseAPI integration
export const COURSES: Course[] = [
  {
    id: 'cp-estates',
    name: 'Constantia Nek Golf Club',
    location: 'Constantia, Cape Town',
    par: 72,
    holes: Array.from({ length: 18 }, (_, i) => ({
      holeNumber: i + 1,
      par: [4, 4, 3, 4, 5, 4, 4, 3, 4, 4, 4, 3, 4, 5, 4, 4, 3, 4][i],
      handicap: [11, 9, 17, 13, 1, 15, 7, 18, 5, 3, 10, 16, 12, 2, 8, 6, 14, 4][i],
    })),
  },
  {
    id: 'de-zalze',
    name: 'De Zalze Golf Estate',
    location: 'Strand, Western Cape',
    par: 72,
    holes: Array.from({ length: 18 }, (_, i) => ({
      holeNumber: i + 1,
      par: [4, 4, 4, 3, 5, 4, 4, 3, 4, 4, 5, 4, 3, 4, 4, 4, 3, 5][i],
      handicap: [12, 10, 6, 16, 2, 8, 14, 18, 4, 11, 1, 9, 17, 5, 13, 7, 15, 3][i],
    })),
  },
  {
    id: 'westerford',
    name: 'Westerford Golf Club',
    location: 'Retreat, Cape Town',
    par: 71,
    holes: Array.from({ length: 18 }, (_, i) => ({
      holeNumber: i + 1,
      par: [4, 4, 4, 3, 4, 5, 4, 3, 4, 4, 4, 5, 3, 4, 4, 4, 3, 4][i],
      handicap: [9, 11, 7, 15, 13, 1, 5, 17, 3, 10, 8, 2, 18, 6, 12, 14, 16, 4][i],
    })),
  },
  {
    id: 'steenberg',
    name: 'Steenberg Golf Club',
    location: 'Tokai, Cape Town',
    par: 73,
    holes: Array.from({ length: 18 }, (_, i) => ({
      holeNumber: i + 1,
      par: [4, 4, 3, 5, 4, 4, 3, 4, 4, 5, 4, 4, 3, 4, 4, 3, 5, 4][i],
      handicap: [10, 8, 16, 2, 12, 6, 18, 4, 11, 1, 9, 7, 17, 5, 13, 15, 3, 14][i],
    })),
  },
  {
    id: 'mowbray',
    name: 'Mowbray Golf Club',
    location: 'Mowbray, Cape Town',
    par: 72,
    holes: Array.from({ length: 18 }, (_, i) => ({
      holeNumber: i + 1,
      par: [4, 5, 4, 3, 4, 4, 3, 4, 4, 4, 3, 4, 5, 4, 4, 3, 4, 4][i],
      handicap: [11, 1, 9, 15, 7, 13, 17, 5, 10, 12, 18, 6, 2, 8, 14, 16, 3, 4][i],
    })),
  },
  {
    id: 'royal-cape',
    name: 'Royal Cape Golf Club',
    location: 'Green Point, Cape Town',
    par: 70,
    holes: Array.from({ length: 18 }, (_, i) => ({
      holeNumber: i + 1,
      par: [4, 4, 4, 3, 4, 4, 3, 4, 4, 4, 3, 4, 4, 5, 4, 3, 4, 4][i],
      handicap: [10, 8, 12, 16, 6, 14, 18, 4, 9, 11, 17, 5, 13, 1, 7, 15, 3, 2][i],
    })),
  },
];

export function getCourseById(id: string): Course | undefined {
  return COURSES.find(c => c.id === id);
}
