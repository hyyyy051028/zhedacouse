import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Layout, Menu, Button, Drawer } from 'antd';
import { MenuOutlined, CloseOutlined } from '@ant-design/icons';
import './Header.css';

const { Header: AntHeader } = Layout;

const navLinks = [
  { path: '/', label: '首页', hash: 'banner' },
  { path: '/', label: '活动', hash: 'events' },
  { path: '/', label: '课程', hash: 'courses' },
  { path: '/', label: '关于浙大', hash: 'zju-intro' },
  { path: '/', label: '精彩故事', hash: 'stories' },
  { path: '/', label: '联系我们', hash: 'contact' },
];

export default function Header() {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const isHomeTop = location.pathname === '/' && !scrolled;

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, hash: string) => {
    if (location.pathname !== '/') {
      return;
    }
    e.preventDefault();
    const element = document.getElementById(hash);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setDrawerOpen(false);
  };

  return (
    <AntHeader className={`header ${scrolled ? 'scrolled' : ''} ${isHomeTop ? 'home-top' : ''}`}>
      <div className="header-container">
        <div className="header-content">
          <Link to="/" className="logo">
            <div className="logo-icon">
              <img src="/image/资料夹/1.jpg" alt="浙江大学" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
            </div>
            <div className="logo-text">
              <h1>浙江大学</h1>
              <span>企业家培训</span>
            </div>
          </Link>

          <div className="desktop-nav">
            <Menu
              mode="horizontal"
              selectedKeys={[]}
              className="nav-menu"
              items={navLinks.map((link) => ({
                key: link.hash,
                label: (
                  <Link 
                    to={link.path}
                    onClick={(e) => handleNavClick(e, link.hash)}
                  >
                    {link.label}
                  </Link>
                ),
              }))}
            />
            <Link to="/register" className="btn-cta">
              立即报名
            </Link>
          </div>

          <Button
            className="mobile-menu-btn"
            type="text"
            icon={drawerOpen ? <CloseOutlined /> : <MenuOutlined />}
            onClick={() => setDrawerOpen(!drawerOpen)}
          />

          <Drawer
            title="菜单"
            placement="right"
            onClose={() => setDrawerOpen(false)}
            open={drawerOpen}
            className="mobile-drawer"
          >
            <Menu
              mode="vertical"
              selectedKeys={[]}
              items={[
                ...navLinks.map((link) => ({
                  key: link.hash,
                  label: (
                    <Link 
                      to={link.path}
                      onClick={(e) => handleNavClick(e, link.hash)}
                    >
                      {link.label}
                    </Link>
                  ),
                })),
                {
                  key: 'register',
                  label: (
                    <Link to="/register" className="drawer-cta">
                      立即报名
                    </Link>
                  ),
                },
              ]}
            />
          </Drawer>
        </div>
      </div>
    </AntHeader>
  );
}
