import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

// Sample course data - in a real app, this would come from an API or database
const courses = [
  {
    code: 'COSC1001',
    name: 'Introduction to Programming',
    description: 'Fundamental concepts of programming using Python.',
    positions: ['Tutor', 'Lab Assistant'],
    requirements: ['Strong Python knowledge', 'Good communication skills'],
  },
  {
    code: 'COSC2002',
    name: 'Data Structures and Algorithms',
    description: 'Advanced programming concepts and algorithm analysis.',
    positions: ['Tutor', 'Lab Assistant'],
    requirements: ['Java proficiency', 'Algorithm analysis experience'],
  },
  {
    code: 'COSC3003',
    name: 'Full Stack Development',
    description: 'Modern web development using React and Node.js.',
    positions: ['Tutor'],
    requirements: ['React/Node.js experience', 'Database knowledge'],
  },
  {
    code: 'COSC4004',
    name: 'Artificial Intelligence',
    description: 'Introduction to AI concepts and machine learning.',
    positions: ['Lab Assistant'],
    requirements: ['Python/TensorFlow knowledge', 'Statistics background'],
  },
];

export default function CoursesPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Available Courses</h1>
        <p className="text-muted-foreground">
          Browse through the current semester courses and available teaching positions.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <Card key={course.code}>
            <CardHeader>
              <CardTitle>{course.code}</CardTitle>
              <CardDescription>{course.name}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-muted-foreground">{course.description}</p>
                
                <div>
                  <h4 className="font-semibold mb-2">Open Positions:</h4>
                  <div className="flex flex-wrap gap-2">
                    {course.positions.map((position) => (
                      <span
                        key={position}
                        className="bg-secondary text-secondary-foreground px-2 py-1 rounded-md text-sm"
                      >
                        {position}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Requirements:</h4>
                  <ul className="list-disc list-inside text-muted-foreground">
                    {course.requirements.map((req) => (
                      <li key={req}>{req}</li>
                    ))}
                  </ul>
                </div>

                <Button className="w-full">Apply Now</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}