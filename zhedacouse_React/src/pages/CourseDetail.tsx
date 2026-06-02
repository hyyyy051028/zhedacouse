import { useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { courses, teachers, defaultTeacher } from '../data';
import './CourseDetail.css';

export default function CourseDetail() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const teacherKey = (searchParams.get('teacher') || '').trim().toLowerCase();
  const teacher = teacherKey && teachers[teacherKey] ? teachers[teacherKey] : defaultTeacher;
  const teacherSuffix = teacherKey ? `?teacher=${encodeURIComponent(teacherKey)}` : '';
  const homePath = `/${teacherSuffix}`;

  const course = courses.find((c) => c.id === id);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  if (!course) {
    return (
      <main className="course-detail-page">
        <div className="course-not-found">
          <h1>课程未找到</h1>
          <p>您访问的课程不存在或已下架。</p>
          <Link to={homePath} className="btn-back-home">返回首页</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="course-detail-page">
      {course.detailImages?.map((img, i) => (
        <div key={i} className="poster-wrapper">
          <img
            src={img}
            alt={`${course.title} - 海报 ${i + 1}`}
            className="poster-image"
            loading="lazy"
            decoding="async"
          />
        </div>
      ))}

      <a
        href={teacher.signupUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="detail-floating-btn"
      >
        立即报名
      </a>
    </main>
  );
}
