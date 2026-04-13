import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { Carousel } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import type { CarouselRef } from 'antd/es/carousel';
import { bannerSlides } from '../../data';
import './Banner.css';

export default function Banner() {
  const carouselRef = useRef<CarouselRef>(null);

  const scrollToSection = (hash: string) => (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const element = document.getElementById(hash);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="banner" className="banner">
      <Carousel
        ref={carouselRef}
        dots={{ className: 'carousel-indicators' }}
        autoplay
        autoplaySpeed={6000}
        effect="scrollx"
        draggable
      >
        {bannerSlides.map((slide, index) => (
          <div key={index} className="carousel-slide">
            <div 
              className="carousel-item"
              style={{
                backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.35), rgba(0, 0, 0, 0.45)), url('${slide.bgImage}')`,
              }}
            >
              <div className="carousel-content">
                <h2>{slide.title}</h2>
                {slide.subtitle && (
                  <h3>{slide.subtitle}</h3>
                )}
                <p className={index === 0 ? 'highlight-text' : ''}>
                  {slide.description}
                </p>
                <div className="banner-actions">
                  {index === 0 ? (
                    <>
                      <Link to="/#courses" className="btn" onClick={scrollToSection('courses')}>
                        了解课程
                      </Link>
                      <Link to="/#contact" className="btn btn-secondary" onClick={scrollToSection('contact')}>
                        立即咨询
                      </Link>
                    </>
                  ) : index === 1 ? (
                    <>
                      <Link to="/#events" className="btn" onClick={scrollToSection('events')}>
                        最新活动
                      </Link>
                      <Link to="/#stories" className="btn btn-secondary" onClick={scrollToSection('stories')}>
                        精彩故事
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link to="/register" className="btn">
                        申请加入
                      </Link>
                      <Link to="/#zju-intro" className="btn btn-secondary" onClick={scrollToSection('zju-intro')}>
                        关于我们
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </Carousel>
      <button
        type="button"
        className="banner-arrow banner-arrow-prev"
        aria-label="上一张"
        onClick={() => carouselRef.current?.prev()}
      >
        <LeftOutlined />
      </button>
      <button
        type="button"
        className="banner-arrow banner-arrow-next"
        aria-label="下一张"
        onClick={() => carouselRef.current?.next()}
      >
        <RightOutlined />
      </button>
    </section>
  );
}
