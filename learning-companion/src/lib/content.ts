import curriculum from '../content/curriculum.json';
import plan from '../content/first-28-days.json';
import catalog from '../content/resources.json';
import courses from '../content/courses.json';
import videos from '../content/video-companions.json';
import guides from '../content/study-guides.json';
import type { Lesson, Module, Resource, StudyGuide } from './types';
export const studyGuides: StudyGuide[] = guides;
export const modules: Module[] = curriculum.modules;
export const lessons: Lesson[] = plan.days;
export const resources: Resource[] = [...catalog.map(r => ({ ...r, video: courses.find(c => c.id === r.id)?.video })), ...videos];
export const conceptCount = modules.reduce((n, m) => n + m.groups.reduce((s, g) => s + g.topics.length, 0), 0);
export const topicId = (m: string, group: number, topic: number) => `${m}.${String(group + 1).padStart(2, '0')}.${String(topic + 1).padStart(2, '0')}`;
export const allTopicIds = modules.flatMap(m => m.groups.flatMap((g, gi) => g.topics.map((_, ti) => topicId(m.id, gi, ti))));
export const phases = [
  { title: 'Start from zero', caption: 'The tools, language and maths', ids: ['M00', 'M01', 'M02', 'M03', 'M04', 'M05', 'M06'] },
  { title: 'Understand the models', caption: 'From prediction to transformers', ids: ['M07', 'M08', 'M09'] },
  { title: 'Build AI systems', caption: 'Applications, retrieval and agents', ids: ['M10', 'M11', 'M12', 'M13', 'M14', 'M15'] },
  { title: 'Ship & specialize', caption: 'Reliable systems and original work', ids: ['M16', 'M17', 'M18', 'M19', 'M20'] },
];
