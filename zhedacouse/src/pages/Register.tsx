import { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header/Header';
import './Register.css';

interface FormData {
  name: string;
  gender: string;
  company: string;
  position: string;
  phone: string;
}

interface FormErrors {
  name?: string;
  company?: string;
  position?: string;
  phone?: string;
}

export default function Register() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    gender: '男',
    company: '',
    position: '',
    phone: '',
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = '请输入姓名';
    }
    
    if (!formData.company.trim()) {
      newErrors.company = '请输入企业名称';
    }
    
    if (!formData.position.trim()) {
      newErrors.position = '请输入职位';
    }
    
    const phoneRegex = /^1[3-9]\d{9}$/;
    if (!formData.phone.trim()) {
      newErrors.phone = '请输入手机号';
    } else if (!phoneRegex.test(formData.phone.trim())) {
      newErrors.phone = '请输入正确的手机号';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleGenderChange = (gender: string) => {
    setFormData((prev) => ({ ...prev, gender }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    setSubmitStatus('idle');
    
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      setSubmitStatus('success');
      
      setTimeout(() => {
        window.location.href = 'https://my.feishu.cn/share/base/form/shrcntb2PbwNBaCn3oQ6CIhlX1e';
      }, 1500);
    } catch {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Header />
      <main className="register-page">
        <div className="register-container">
          <div className="register-header">
            <h1>活动报名</h1>
            <p>请填写以下信息完成报名</p>
          </div>
          
          <form className="register-form" onSubmit={handleSubmit}>
            <div className={`form-group ${errors.name ? 'has-error' : ''}`}>
              <label htmlFor="name">姓名 *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="请输入您的姓名"
              />
              {errors.name && <span className="error-message">{errors.name}</span>}
            </div>
            
            <div className="form-group">
              <label>性别 *</label>
              <div className="gender-options">
                {['男', '女', '其他'].map((gender) => (
                  <label key={gender} className="gender-option">
                    <input
                      type="radio"
                      name="gender"
                      value={gender}
                      checked={formData.gender === gender}
                      onChange={() => handleGenderChange(gender)}
                    />
                    <span>{gender}</span>
                  </label>
                ))}
              </div>
            </div>
            
            <div className={`form-group ${errors.company ? 'has-error' : ''}`}>
              <label htmlFor="company">企业名称 *</label>
              <input
                type="text"
                id="company"
                name="company"
                value={formData.company}
                onChange={handleChange}
                placeholder="请输入您的企业名称"
              />
              {errors.company && <span className="error-message">{errors.company}</span>}
            </div>
            
            <div className={`form-group ${errors.position ? 'has-error' : ''}`}>
              <label htmlFor="position">职位 *</label>
              <input
                type="text"
                id="position"
                name="position"
                value={formData.position}
                onChange={handleChange}
                placeholder="请输入您的职位"
              />
              {errors.position && <span className="error-message">{errors.position}</span>}
            </div>
            
            <div className={`form-group ${errors.phone ? 'has-error' : ''}`}>
              <label htmlFor="phone">手机号 *</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="请输入您的手机号"
              />
              {errors.phone && <span className="error-message">{errors.phone}</span>}
            </div>
            
            <button 
              type="submit" 
              className={`submit-btn ${isSubmitting ? 'loading' : ''}`}
              disabled={isSubmitting}
            >
              {isSubmitting ? '提交中...' : '立即提交'}
            </button>
            
            {submitStatus === 'success' && (
              <div className="feedback success">
                报名成功！正在跳转到飞书表单...
              </div>
            )}
            
            {submitStatus === 'error' && (
              <div className="feedback error">
                提交失败，请稍后重试
              </div>
            )}
          </form>
          
          <div className="register-footer">
            <p>&copy; 2026 浙江大学企业家培训 | 保留所有权利</p>
            <Link to="/" className="back-home">返回首页</Link>
          </div>
        </div>
      </main>
    </>
  );
}
