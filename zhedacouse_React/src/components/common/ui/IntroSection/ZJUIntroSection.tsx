import { useEffect, useRef } from 'react';
import { withBasePath } from '../../../../utils/basePath';
import './ZJUIntroSection.css';

export default function ZJUIntroSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.2 }
    );

    const elements = sectionRef.current?.querySelectorAll('.fade-in');
    elements?.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <section id="zju-intro" className="section zju-intro" ref={sectionRef}>
      <div className="container">
        <div className="section-title">
          <h2>关于浙江大学</h2>
          <p>百年学府，学术殿堂，为企业家培训提供强大的智力支持</p>
        </div>
        <div className="intro-content">
          <div className="intro-image fade-in">
            <img src={withBasePath('/image/资料夹/5.jpg')} alt="浙江大学校园" loading="lazy" decoding="async" />
          </div>
          <div className="intro-text fade-in delay-1">
            <h3>百年学府，引领创新</h3>
            <p>浙江大学创建于1897年，是中国著名的高等学府，位列国家"双一流"建设高校、"985工程"和"211工程"重点建设大学。学校拥有雄厚的师资力量和一流的科研平台，在管理学、经济学等领域具有显著优势。</p>
            <p>浙江大学企业家培训项目依托学校的学科优势和社会资源，整合全球顶尖师资，为企业家提供高质量的培训服务，助力企业转型升级和可持续发展。</p>
            <div className="intro-stats">
              <div className="stat-item">
                <div className="stat-number">127+</div>
                <div className="stat-label">办学年限</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">5000+</div>
                <div className="stat-label">合作企业</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">10万+</div>
                <div className="stat-label">培训学员</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">98%</div>
                <div className="stat-label">满意度</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
