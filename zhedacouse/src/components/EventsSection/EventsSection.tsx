import { useState, useRef, useEffect } from 'react';
import { CalendarOutlined, UserOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { events, teachers, defaultTeacher } from '../../data';
import './EventsSection.css';

export default function EventsSection() {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [activeDot, setActiveDot] = useState(0);
  const [scrolledStart, setScrolledStart] = useState(false);
  const [scrolledEnd, setScrolledEnd] = useState(true);
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const slider = sliderRef.current;
    if (!slider) return;

    const updateScrollIndicators = () => {
      const scrollPosition = slider.scrollLeft;
      const maxScroll = slider.scrollWidth - slider.clientWidth;
      
      setScrolledStart(scrollPosition > 10);
      setScrolledEnd(scrollPosition >= maxScroll - 10);

      const section = slider.querySelector('.month-section') as HTMLElement;
      const sectionWidth = section?.offsetWidth || 0;
      if (sectionWidth > 0) {
        const currentSection = Math.round(scrollPosition / (sectionWidth + 20));
        setActiveDot(currentSection);
      }
    };

    slider.addEventListener('scroll', updateScrollIndicators);
    updateScrollIndicators();

    return () => slider.removeEventListener('scroll', updateScrollIndicators);
  }, []);

  const handleDotClick = (index: number) => {
    const slider = sliderRef.current;
    const section = slider?.querySelector('.month-section') as HTMLElement;
    if (slider && section) {
      const sectionWidth = section.offsetWidth + 20;
      slider.scrollTo({ left: index * sectionWidth, behavior: 'smooth' });
    }
  };

  const teacherKey = 'zhanglu';
  const teacher = teachers[teacherKey] || defaultTeacher;

  return (
    <section id="events" className="section events">
      <div className="section-decoration">
        <div className="decoration-circle decoration-1"></div>
        <div className="decoration-circle decoration-2"></div>
      </div>
      
      <div className="container">
        <div className="section-header">
          <div className="section-badge">
            <span className="badge-icon">✦</span>
            近期活动
          </div>
          <h2 className="section-title">精彩活动预告</h2>
          <p className="section-subtitle">参与我们的精品活动，与行业领袖面对面交流，拓展商业视野</p>
        </div>
        
        <div 
          ref={sliderRef}
          className={`month-slider ${scrolledStart ? 'scrolled-start' : ''} ${scrolledEnd ? 'scrolled-end' : ''}`}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          {!scrolledStart && (
            <div className="gradient-fade-left"></div>
          )}
          
          <div className="scroll-indicator">
            {events.map((_, index) => (
              <button
                key={index}
                className={`scroll-dot ${index === activeDot ? 'active' : ''}`}
                onClick={() => handleDotClick(index)}
                aria-label={`跳转到${events[index].month}`}
              />
            ))}
          </div>
          
          <div className="month-container">
            {events.map((monthData, monthIndex) => (
              <div 
                key={monthIndex} 
                className="month-section"
                style={{ animationDelay: `${monthIndex * 0.1}s` }}
              >
                <div className="month-header">
                  <div className="month-icon">
                    <CalendarOutlined style={{ fontSize: 20 }} />
                  </div>
                  <h3>{monthData.month}</h3>
                  <div className="month-line"></div>
                </div>
                <div className="event-list">
                  {monthData.events.map((event, eventIndex) => (
                    <div 
                      key={eventIndex} 
                      className="event-item"
                      style={{ animationDelay: `${(monthIndex * 5 + eventIndex) * 0.05}s` }}
                    >
                      <div className="event-date-badge">
                        <span className="date-month">{event.date.split('-')[1]}月</span>
                        <span className="date-day">{event.date.split('-')[2]}</span>
                        <span className="date-week">{event.day}</span>
                      </div>
                      <div className="event-content">
                        <div className="event-tag">{event.topic.split('·')[0] || '浙江大学'}</div>
                        <h4>{event.title}</h4>
                        {event.speaker && (
                          <p className="event-speaker">
                            <UserOutlined style={{ fontSize: 14 }} />
                            {event.speaker}
                          </p>
                        )}
                        {teacher.signupUrl && (
                          <a 
                            href={teacher.signupUrl} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="btn btn-event"
                          >
                            立即报名
                            <ArrowRightOutlined style={{ fontSize: 14 }} />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          
          {!scrolledEnd && isHovering && (
            <div className="gradient-fade-right"></div>
          )}
        </div>
      </div>
    </section>
  );
}
