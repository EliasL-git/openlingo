import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const GITHUB_OWNER = 'EliasL-git';
const GITHUB_REPO = 'openlingo';
const LESSONS_BRANCH = 'Lessons';

type CourseMetadata = {
  id: string;
  sourceLanguage: string;
  targetLanguage: string;
  title: string;
  units: Array<{ id: string; title: string; description: string }>;
};

type CourseCard = {
  id: string;
  language: string;
  learners: string;
  badge?: string;
};

export default function App() {
  const [courses, setCourses] = useState<CourseCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        setError(null);

        const directoriesUrl = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/lessons/courses?ref=${LESSONS_BRANCH}`;
        const directoriesResponse = await fetch(directoriesUrl);

        if (!directoriesResponse.ok) {
          throw new Error(`GitHub API error: ${directoriesResponse.status}`);
        }

        const directories = (await directoriesResponse.json()) as Array<{ name: string; type: string }>;
        const courseDirs = directories.filter((item) => item.type === 'dir');

        const courseRequests: Array<Promise<CourseCard | null>> = courseDirs.map(async (dir) => {
          const courseUrl = `https://raw.githubusercontent.com/${GITHUB_OWNER}/${GITHUB_REPO}/${LESSONS_BRANCH}/lessons/courses/${dir.name}/course.json`;
          const courseResponse = await fetch(courseUrl);

          if (!courseResponse.ok) {
            return null;
          }

          const course = (await courseResponse.json()) as CourseMetadata;

          const card: CourseCard = {
            id: course.id,
            language: course.targetLanguage.toUpperCase(),
            learners: `${course.units.length} units`,
            badge: course.units.length >= 5 ? 'Popular' : undefined,
          };

          return card;
        });

        const fetchedCourses = (await Promise.all(courseRequests)).filter((course): course is CourseCard => {
          return course !== null;
        });

        setCourses(fetchedCourses);
      } catch {
        setError('Could not load courses from GitHub. Check branch/data and try again.');
      } finally {
        setLoading(false);
      }
    };

    void fetchCourses();
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.brand}>OpenLingo</Text>
        <Text style={styles.title}>I want to learn...</Text>
        <Text style={styles.subtitle}>Courses are pulled live from GitHub.</Text>

        {loading ? <Text style={styles.info}>Loading courses...</Text> : null}
        {error ? <Text style={styles.error}>{error}</Text> : null}
        {!loading && !error && courses.length === 0 ? (
          <Text style={styles.info}>No courses found in `Lessons` branch yet.</Text>
        ) : null}

        <View style={styles.list}>
          {courses.map((course) => (
            <TouchableOpacity key={course.id} style={styles.card} activeOpacity={0.85}>
              <View style={styles.avatar} />
              <View style={styles.cardBody}>
                <View style={styles.row}>
                  <Text style={styles.language}>{course.language}</Text>
                  {course.badge ? <Text style={styles.badge}>{course.badge}</Text> : null}
                </View>
                <Text style={styles.learners}>{course.learners}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8faf5',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
  },
  brand: {
    color: '#2b6c00',
    fontWeight: '800',
    fontSize: 28,
    marginBottom: 20,
  },
  title: {
    color: '#1f2937',
    fontWeight: '700',
    fontSize: 24,
  },
  subtitle: {
    color: '#4b5563',
    marginTop: 8,
    marginBottom: 14,
    fontSize: 15,
  },
  info: {
    color: '#334155',
    marginBottom: 12,
  },
  error: {
    color: '#b91c1c',
    marginBottom: 12,
    fontWeight: '600',
  },
  list: {
    gap: 12,
  },
  card: {
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#d9f99d',
    marginRight: 12,
  },
  cardBody: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  language: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  badge: {
    backgroundColor: '#dcfce7',
    color: '#166534',
    fontSize: 11,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    overflow: 'hidden',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  learners: {
    color: '#4b5563',
    marginTop: 4,
  },
});
