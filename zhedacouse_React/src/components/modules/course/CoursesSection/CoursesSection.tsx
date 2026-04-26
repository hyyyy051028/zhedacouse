import { useState, useRef, useEffect, type JSX } from 'react';
import { Link } from 'react-router-dom';
import { courses, type Course } from '../../../../data/index';
import './CoursesSection.css';

const iconSvgs: Record<string, JSX.Element> = {
  business: (
    <svg width="28" height="28" viewBox="0 0 48 48" fill="none">
      <path d="M10 10H38V38H10V10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M10 18H38" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M16 10V38" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M24 10V38" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M32 10V38" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  finance: (
    <svg width="28" height="28" viewBox="0 0 48 48" fill="none">
      <path d="M14 14L34 14C36.2091 14 38 15.7909 38 18L38 30C38 32.2091 36.2091 34 34 34L14 34C11.7909 34 10 32.2091 10 30L10 18C10 15.7909 11.7909 14 14 14Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M18 14V34" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M24 14V34" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M30 14V34" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M14 20H34" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M14 28H34" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  book: (
    <svg width="28" height="28" viewBox="0 0 48 48" fill="none">
      <path d="M16 10L32 10C33.1046 10 34 10.8954 34 12L34 36C34 37.1046 33.1046 38 32 38L16 38C14.8954 38 14 37.1046 14 36L14 12C14 10.8954 14.8954 10 16 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M24 10V38" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M14 18L34 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M14 24L34 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M14 30L34 30" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  star: (
    <svg width="28" height="28" viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M16 24L20 28L12 36L28 20L24 16L36 32L28 28L32 24L24 12L20 20L16 24Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  ai: (
    <svg width="28" height="28" viewBox="0 0 48 48" fill="none">
      <rect x="12" y="12" width="24" height="24" rx="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M16 20H32" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M16 24H32" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M16 28H32" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="20" cy="16" r="1" fill="currentColor"/>
      <circle cx="24" cy="16" r="1" fill="currentColor"/>
      <circle cx="28" cy="16" r="1" fill="currentColor"/>
    </svg>
  ),
  tech: (
    <svg width="28" height="28" viewBox="0 0 48 48" fill="none">
      <path d="M24 8C16.268 8 10 14.268 10 22C10 31.9411 18.0589 40 28 40H34C35.1046 40 36 39.1046 36 38V32C36 30.8954 35.1046 30 34 30H28C23.5817 30 20 26.4183 20 22C20 17.5817 23.5817 14 28 14H34C35.1046 14 36 13.1046 36 12V6C36 4.89543 35.1046 4 34 4H28C18.0589 4 10 12.0589 10 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  travel: (
    <svg width="28" height="28" viewBox="0 0 48 48" fill="none">
      <path d="M12 24L36 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12 24L28 36" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M28 36L36 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12 24C12 24 18 20 24 20C30 20 36 24 36 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M24 20V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  island: (
    <svg width="28" height="28" viewBox="0 0 48 48" fill="none">
      <path d="M16 12L32 12C34.2091 12 36 13.7909 36 16L36 32C36 34.2091 34.2091 36 32 36L16 36C13.7909 36 12 34.2091 12 32L12 16C12 13.7909 13.7909 12 16 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M16 20H32" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M24 12V36" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
};

const categoryColors: Record<string, { bg: string; gradient: string; border: string }> = {
  '企业管理': { bg: 'rgba(0, 85, 162, 0.08)', gradient: 'linear-gradient(135deg, #0055A2, #0077CC)', border: '#0055A2' },
  '人文智慧': { bg: 'rgba(230, 161, 0, 0.08)', gradient: 'linear-gradient(135deg, #E6A100, #FFB820)', border: '#E6A100' },
  'AI创新': { bg: 'rgba(85, 0, 162, 0.08)', gradient: 'linear-gradient(135deg, #5500A2, #7700CC)', border: '#5500A2' },
  '企业家校友游学': { bg: 'rgba(0, 162, 85, 0.08)', gradient: 'linear-gradient(135deg, #00A255, #00CC77)', border: '#00A255' },
};

export default function CoursesSection() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const sectionRef = useRef<HTMLElement>(null);

  const groupedCourses = courses.reduce((acc, course) => {
    if (!acc[course.category]) {
      acc[course.category] = [];
    }
    acc[course.category].push(course);
    return acc;
  }, {} as Record<string, Course[]>);

  const categories = Object.keys(groupedCourses);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1 }
    );
    const elements = sectionRef.current?.querySelectorAll('.course-card');
    elements?.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <section id="courses" className="section courses" ref={sectionRef}>
      <div className="courses-bg-pattern">
        <div className="pattern-grid"></div>
      </div>
      
      <div className="container">
        <div className="section-header">
          <div className="section-badge">
            <span className="badge-icon">✦</span>
            精品课程
          </div>
          <h2 className="section-title">培养具有全球视野的企业家领袖</h2>
          <p className="section-subtitle">立足浙江大学优质资源，汇聚顶尖师资，为企业家提供高质量的培训服务</p>
        </div>

        <div className="category-tabs">
          {categories.map((category) => (
            <button
              key={category}
              className={`category-tab ${activeCategory === category || activeCategory === null ? 'active' : ''}`}
              onClick={() => setActiveCategory(activeCategory === category ? null : category)}
              style={activeCategory === category || activeCategory === null ? { 
                background: categoryColors[category]?.gradient || '#0055A2',
                borderColor: categoryColors[category]?.border || '#0055A2'
              } : {}}
            >
              {category}
            </button>
          ))}
        </div>
        
        <div className="courses-grid">
          {courses.map((course, index) => (
            <div 
              key={course.id} 
              className={`course-card ${activeCategory === null || activeCategory === course.category ? 'show' : 'hide'}`}
              style={{ 
                animationDelay: `${index * 0.1}s`,
                '--category-color': categoryColors[course.category]?.border || '#0055A2'
              } as React.CSSProperties}
            >
              <div className="course-card-inner">
                {course.image ? (
                  <div className="course-image-wrapper">
                    <div className="course-image-skeleton" />
                    <img 
                      src={course.image} 
                      alt={course.title} 
                      loading="lazy" 
                      decoding="async"
                      onLoad={(e) => {
                        (e.target as HTMLImageElement).classList.add('loaded');
                      }}
                    />
                    <div className="course-category-badge" style={{ background: categoryColors[course.category]?.gradient }}>
                      {course.category}
                    </div>
                  </div>
                ) : (
                  <>
                    <div 
                      className="course-icon-wrapper"
                      style={{ background: categoryColors[course.category]?.gradient || '#0055A2' }}
                    >
                      <div className="course-icon">
                        {iconSvgs[course.icon]}
                      </div>
                      <div className="course-icon-glow"></div>
                    </div>
                    
                    <div className="course-category-tag" style={{ color: categoryColors[course.category]?.border }}>
                      {course.category}
                    </div>
                  </>
                )}
                
                <h3>{course.title}</h3>
                <p>{course.description}</p>
                
                <ul className="course-features">
                  {course.features.map((feature, idx) => (
                    <li key={idx}>
                      <span className="feature-check" style={{ background: categoryColors[course.category]?.gradient }}>
                        ✓
                      </span>
                      {feature}
                    </li>
                  ))}
                </ul>
                
                <div className="course-meta">
                  <div className="meta-item">
                    <span className="meta-label">学制</span>
                    <span className="meta-value">{course.duration}</span>
                  </div>
                  <div className="meta-divider"></div>
                  <div className="meta-item">
                    <span className="meta-label">学费</span>
                    <span className="meta-value" style={{ color: categoryColors[course.category]?.border }}>
                      {course.fee}
                    </span>
                  </div>
                </div>
                
                {course.detailUrl ? (
                  <a
                    href={course.detailUrl}
                    className="btn btn-course"
                    style={{ background: categoryColors[course.category]?.gradient }}
                  >
                    查看详情
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </a>
                ) : (
                  <Link to="/register" className="btn btn-course" style={{ background: categoryColors[course.category]?.gradient }}>
                    立即咨询
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
