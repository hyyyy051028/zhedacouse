import { useState } from "react";
import { Modal, Image, Button } from "antd";
import { useSearchParams } from "react-router-dom";
import { defaultTeacher, teachers } from "../../../../data";
import "./FloatingTeacherBtn.css";

export default function FloatingTeacherBtn() {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [searchParams] = useSearchParams();
  const teacherKey = (searchParams.get("teacher") || "").trim().toLowerCase();
  const teacher = teacherKey && teachers[teacherKey] ? teachers[teacherKey] : defaultTeacher;

  const handleOpen = () => setIsModalVisible(true);
  const handleClose = () => setIsModalVisible(false);

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
          <div className="teacher-card">
            <div className="teacher-qr-wrapper">
              <Image
                src={teacher.file}
                alt={`${teacher.name} 老师二维码`}
                width={200}
                height={200}
                className="teacher-qr"
              />
            </div>
            <h3 className="teacher-name">{teacher.name} 老师</h3>
            <p className="teacher-phone">电话：{teacher.phoneNumber}</p>
            <Button
              type="primary"
              className="teacher-signup-btn"
              href={teacher.signupUrl}
              target="_blank"
            >
              立即报名
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
