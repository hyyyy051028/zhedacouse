import { useState, useEffect, useMemo } from "react";
import { Modal, Image, Button } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import { useSearchParams } from "react-router-dom";
import { teachers, type Teacher } from '../../../../data';
import './FloatingTeacherBtn.css';

export default function FloatingTeacherBtn() {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [searchParams] = useSearchParams();
  const teacherKey = (searchParams.get("teacher") || "").trim().toLowerCase();

  const teacherList = useMemo(() => Object.values(teachers), []);
  
  useEffect(() => {
    // 默认选中URL参数里的老师，如果没找到则默认0
    if (teacherKey) {
      const index = teacherList.findIndex((t) => t.key === teacherKey);
      if (index !== -1) {
        setCurrentIndex(index);
        return;
      }
      setCurrentIndex(0);
    }
  }, [teacherKey, teacherList]);

  const handleOpen = () => setIsModalVisible(true);
  const handleClose = () => setIsModalVisible(false);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + teacherList.length) % teacherList.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % teacherList.length);
  };

  const currentTeacher: Teacher = teacherList[currentIndex] || teacherList[0];

  return (
    <>
      {/* 悬浮按钮 */}
      <button className="floating-teacher-btn auto-light" onClick={handleOpen}>
        联系老师
      </button>

      {/* 老师信息模态框 */}
      <Modal
        open={isModalVisible}
        onCancel={handleClose}
        footer={null}
        centered
        width={400}
        className="teacher-info-modal"
      >
        <div className="teacher-modal-content">
          <Button 
            type="text" 
            icon={<LeftOutlined />} 
            className="teacher-nav-btn prev-btn" 
            onClick={handlePrev} 
          />
          
          <div className="teacher-card">
            <div className="teacher-qr-wrapper">
              <Image
                src={currentTeacher.file}
                alt={`${currentTeacher.name} 老师二维码`}
                width={200}
                height={200}
                className="teacher-qr"
              />
            </div>
            <h3 className="teacher-name">{currentTeacher.name} 老师</h3>
            <p className="teacher-phone">电话：{currentTeacher.phoneNumber}</p>
            <Button 
              type="primary" 
              className="teacher-signup-btn"
              href={currentTeacher.signupUrl} 
              target="_blank"
            >
              立即报名
            </Button>
          </div>

          <Button 
            type="text" 
            icon={<RightOutlined />} 
            className="teacher-nav-btn next-btn" 
            onClick={handleNext} 
          />
        </div>
      </Modal>
    </>
  );
}
