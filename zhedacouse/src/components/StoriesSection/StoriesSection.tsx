import { stories } from '../../data/index';
import './StoriesSection.css';

const storyImages = ['/image/资料夹/精彩活动2.jpg', '/image/资料夹/精彩活动1.jpg', '/image/资料夹/精彩活动3.jpg'];

export default function StoriesSection() {
  return (
    <section id="stories" className="section stories">
      <div className="container">
        <div className="section-title">
          <h2>精彩故事</h2>
          <p>分享浙大企业家培训的精彩瞬间与学习感悟</p>
        </div>
        <div className="stories-grid">
          {stories.map((story, index) => (
            <div 
              key={story.id} 
              className={`stories-card fade-in ${index === 1 ? 'delay-1' : index === 2 ? 'delay-2' : ''}`}
            >
              <div 
                className="stories-image"
                style={{ backgroundImage: `url('${storyImages[story.imageIndex - 1]}')` }}
              />
              <div className="stories-content">
                <div className="stories-name">{story.title}</div>
                <p className="stories-quote">"{story.quote}"</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
