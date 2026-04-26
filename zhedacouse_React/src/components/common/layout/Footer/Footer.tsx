import { Link } from 'react-router-dom';
import { EnvironmentOutlined, PhoneOutlined} from '@ant-design/icons';
import { teachers, defaultTeacher, type Teacher } from '../../../../data';
import { withBasePath } from '../../../../utils/basePath';
import './Footer.css';

interface FooterProps {
  teacherKey?: string;
}

export default function Footer({ teacherKey }: FooterProps) {
  const key = (teacherKey || '').trim().toLowerCase();
  const teacher = (key && teachers[key]) ? teachers[key] : defaultTeacher;
  const formatTeacherTitle = (t: Teacher) => {
    const phone = (t.phoneNumber || '').trim();
    return phone ? `${t.name} 老师 ${phone}` : `${t.name} 老师`;
  };

  return (
    <footer id="contact" className="footer">
      <div className="footer-wave">
        <svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" className="shape-fill"></path>
        </svg>
      </div>
      
      <div className="container">
        <div className="footer-content">
          <div className="footer-main">
            <div className="footer-brand">
              <div className="footer-logo">
                <img src={withBasePath('/image/资料夹/1.jpg')} alt="浙江大学" loading="lazy" decoding="async" style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: '50%', marginRight: 10 }} />
                <div>
                  <h3>浙江大学</h3>
                  <span>企业家培训</span>
                </div>
              </div>
              <p className="footer-desc">
                浙江大学传媒国际文化经济高培中心，致力于培养具有全球视野的企业家领袖，赋能中国故事，驱动全球品牌。
              </p>
            </div>
            
            <div className="footer-links">
              <div className="link-group">
                <h4>快速链接</h4>
                <ul>
                  <li><Link to="/#courses">精品课程</Link></li>
                  <li><Link to="/#zju-intro">关于浙大</Link></li>
                  <li><Link to="/#stories">精彩故事</Link></li>
                  <li><Link to="/register">立即报名</Link></li>
                </ul>
              </div>
              
              <div className="link-group contact-group">
                <h4>联系老师</h4>
                <ul>
                  <li>
                    <EnvironmentOutlined style={{ marginRight: 8 }} />
                    地址：浙江省杭州市浙江大学华家池校区中心二楼
                  </li>
                  <li>
                    <PhoneOutlined style={{ marginRight: 8 }} />
                    15906618726
                  </li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="footer-qr">
            <div className="qr-card">
              <div className="qr-image-wrapper">
                  <img 
                    src={teacher.file} 
                    alt={`${teacher.name} 二维码`}
                    className="qr-image"
                    loading="lazy"
                    decoding="async"
                  />
              </div>
              <p className="qr-title">扫码添加老师</p>
              <p className="qr-name">{formatTeacherTitle(teacher)}</p>
              <p className="qr-desc">获取最新课程信息和活动通知</p>
            </div>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; 2026 浙江大学传媒国际文化经济高培中心. 保留所有权利.</p>
        </div>
      </div>
    </footer>
  );
}
