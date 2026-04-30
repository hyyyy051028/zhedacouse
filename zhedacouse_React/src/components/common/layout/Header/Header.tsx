import {
  Link,
  useLocation,
  useSearchParams,
  useNavigate,
} from "react-router-dom";
import { useState, useEffect } from "react";
import { Layout, Menu, Button, Drawer } from "antd";
import { MenuOutlined, CloseOutlined } from "@ant-design/icons";
import { withBasePath } from "../../../../utils/basePath";
import { teachers, defaultTeacher } from "../../../../data";
import "./Header.css";

const { Header: AntHeader } = Layout;

const navLinks = [
  { label: "首页", hash: "banner" },
  { label: "课程", hash: "courses" },
  { label: "关于浙大", hash: "zju-intro" },
  { label: "精彩故事", hash: "stories" },
  { label: "联系我们", hash: "contact" },
];

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const teacherKey = (searchParams.get("teacher") || "").trim().toLowerCase();
  const [scrolled, setScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const teacher = teacherKey && teachers[teacherKey] ? teachers[teacherKey] : defaultTeacher;
  const teacherSuffix = teacherKey
    ? `?teacher=${encodeURIComponent(teacherKey)}`
    : "";
  const homePath = `/${teacherSuffix}`;
  const isHomeTop = location.pathname === "/" && !scrolled;

  useEffect(() => {
    if (teacherKey && !teachers[teacherKey]) {
      navigate("/", { replace: true });
    }
  }, [navigate, teacherKey]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    hash: string,
  ) => {
    if (location.pathname !== "/") {
      return;
    }
    e.preventDefault();
    const element = document.getElementById(hash);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    setDrawerOpen(false);
  };

  return (
    <AntHeader
      className={`header ${scrolled ? "scrolled" : ""} ${isHomeTop ? "home-top" : ""}`}
    >
      <div className="header-container">
        <div className="header-content">
          <Link to={homePath} className="logo">
            <div className="logo-icon">
              <img
                src={withBasePath("/image/资料夹/1.jpg")}
                alt="浙江大学"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  borderRadius: "50%",
                }}
              />
            </div>
            <div className="logo-text">
              <h1>浙江大学</h1>
              <span>企业家培训</span>
            </div>
          </Link>

          <div className="desktop-nav">
            <Menu
              mode="horizontal"
              disabledOverflow={true}
              selectedKeys={[]}
              className="nav-menu"
              items={navLinks.map((link) => ({
                key: link.hash,
                label: (
                  <Link
                    to={`${homePath}#${link.hash}`}
                    onClick={(e) => handleNavClick(e, link.hash)}
                  >
                    {link.label}
                  </Link>
                ),
              }))}
            />
            <a href={teacher.signupUrl} target="_blank" className="btn-cta">
              立即报名
            </a>
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
              items={navLinks.map((link) => ({
                key: link.hash,
                label: (
                  <Link
                    to={`${homePath}#${link.hash}`}
                    onClick={(e) => handleNavClick(e, link.hash)}
                  >
                    {link.label}
                  </Link>
                ),
              }))}
            />
            <div className="mobile-drawer-footer">
              <a
                href={teacher.signupUrl}
                target="_blank"
                className="drawer-cta"
                onClick={() => setDrawerOpen(false)}
              >
                立即报名
              </a>
            </div>
          </Drawer>
        </div>
      </div>
    </AntHeader>
  );
}
