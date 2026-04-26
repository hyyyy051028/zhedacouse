import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Carousel } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import type { CarouselRef } from 'antd/es/carousel';
import { bannerSlides } from '../../../../data';
import './Banner.css';

export default function Banner() {
  const carouselRef = useRef<CarouselRef>(null);
  const [activeSlide, setActiveSlide] = useState(0);

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
        beforeChange={(_, next) => setActiveSlide(next)}
      >
        {bannerSlides.map((slide, index) => {
          const isCurrent = index === activeSlide;
          const isNext = index === (activeSlide + 1) % bannerSlides.length;
          const isPrev = index === (activeSlide - 1 + bannerSlides.length) % bannerSlides.length;
          const shouldLoadImage = isCurrent || isNext || isPrev;
          return (
            <div key={slide.bgImage} className="carousel-slide">
              <div className="carousel-item">
                {shouldLoadImage && (
                  <img
                    src={slide.bgImage}
                    alt={slide.title}
                    className="carousel-bg-img"
                    fetchPriority={index === 0 ? "high" : "auto"}
                  />
                )}
                <div className="carousel-overlay" />
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
                        <Link to="/#courses" className="btn" onClick={scrollToSection('courses')}>
                          精品课程
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
          );
        })}
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
      
      <div className="banner-wave">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" preserveAspectRatio="none">
          <path fill="#f8fafc" fillOpacity="1" d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,112C672,96,768,96,864,112C960,128,1056,160,1152,160C1248,160,1344,128,1392,112L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
        </svg>
      </div>
    </section>
  );
}
