import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    idCard: '',
    city: '',
    carPlate: '',
    education: '',
    school: '',
    company: '',
    title: '',
    industry: '',
    scale: '',
    managementYears: '',
    revenue: '',
    program: '',
    teacher: '',
    expectation: '',
    isPaid: false
  });

  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const validateForm = () => {
    if (!formData.name) return '请填写姓名';
    if (!/^1[3-9]\d{9}$/.test(formData.phone)) return '请填写有效的手机号码';
    if (!/(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/.test(formData.idCard)) return '请填写有效的身份证号码';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const error = validateForm();
    if (error) {
      setErrorMessage(error);
      setStatus('error');
      return;
    }

    setStatus('submitting');
    setErrorMessage('');

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        setStatus('success');
      } else {
        setStatus('error');
        setErrorMessage(data.message || '提交失败，请重试');
      }
    } catch (err) {
      setStatus('error');
      setErrorMessage('网络请求失败，请检查网络连接');
    }
  };

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-xl shadow-slate-200/50">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">报名成功</h2>
          <p className="text-slate-600 mb-8">感谢您的报名，我们的招生老师会尽快与您取得联系。</p>
          <Link 
            to="/" 
            className="inline-flex items-center justify-center w-full px-6 py-3 bg-[#003F87] text-white rounded-xl hover:bg-[#002f66] transition-colors font-medium"
          >
            返回首页
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 py-12 px-4 sm:px-6 flex flex-col">
      <div className="max-w-4xl mx-auto w-full flex-grow flex flex-col">
        <Link to="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-[#003F87] transition-colors mb-8 group w-max">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          返回首页
        </Link>

        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 overflow-hidden border border-slate-100 flex-grow relative flex flex-col">
          {/* Header */}
          <div className="bg-[#003F87] p-8 md:p-10 relative overflow-hidden shrink-0">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#0052b3]/50 rounded-full blur-2xl translate-y-1/2 -translate-x-1/4"></div>
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-3 relative z-10">综合报名信息</h1>
            <p className="text-[#80bfff] relative z-10 text-sm md:text-base max-w-xl leading-relaxed">请填写真实有效的个人及企业信息，带 * 号的为必填项。您的信息我们将严格保密，仅用于课程报名及相关服务。</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8 md:p-10 space-y-10">
            {status === 'error' && (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
                <p>{errorMessage}</p>
              </div>
            )}

            {/* 基本信息 */}
            <section>
              <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                <span className="w-1.5 h-6 bg-[#003F87] rounded-full inline-block"></span>
                基本信息
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">姓名 <span className="text-red-500">*</span></label>
                  <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#003F87]/20 focus:border-[#003F87] outline-none transition-all" placeholder="您的真实姓名" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">手机号 <span className="text-red-500">*</span></label>
                  <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#003F87]/20 focus:border-[#003F87] outline-none transition-all" placeholder="您的常用手机号" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">身份证号码 <span className="text-red-500">*</span></label>
                  <input type="text" name="idCard" value={formData.idCard} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#003F87]/20 focus:border-[#003F87] outline-none transition-all" placeholder="18位有效身份证号" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">居住城市</label>
                  <input type="text" name="city" value={formData.city} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#003F87]/20 focus:border-[#003F87] outline-none transition-all" placeholder="如：杭州市" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">车牌号</label>
                  <input type="text" name="carPlate" value={formData.carPlate} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#003F87]/20 focus:border-[#003F87] outline-none transition-all" placeholder="便于安排停车（如有）" />
                </div>
              </div>
            </section>

            <div className="h-px w-full bg-slate-100"></div>

            {/* 教育背景 */}
            <section>
              <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                <span className="w-1.5 h-6 bg-[#003F87] rounded-full inline-block"></span>
                教育背景
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">最高学历</label>
                  <select name="education" value={formData.education} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#003F87]/20 focus:border-[#003F87] outline-none transition-all bg-white">
                    <option value="">请选择最高学历</option>
                    <option value="高中及以下">高中及以下</option>
                    <option value="大专">大专</option>
                    <option value="本科">本科</option>
                    <option value="硕士">硕士</option>
                    <option value="博士">博士</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">毕业院校</label>
                  <input type="text" name="school" value={formData.school} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#003F87]/20 focus:border-[#003F87] outline-none transition-all" placeholder="您的毕业院校名称" />
                </div>
              </div>
            </section>

            <div className="h-px w-full bg-slate-100"></div>

            {/* 职业信息 */}
            <section>
              <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                <span className="w-1.5 h-6 bg-[#003F87] rounded-full inline-block"></span>
                职业信息
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">单位名称</label>
                  <input type="text" name="company" value={formData.company} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#003F87]/20 focus:border-[#003F87] outline-none transition-all" placeholder="您目前就职的单位全称" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">职务</label>
                  <select name="title" value={formData.title} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#003F87]/20 focus:border-[#003F87] outline-none transition-all bg-white">
                    <option value="">请选择职务</option>
                    <option value="董事长">董事长</option>
                    <option value="总经理">总经理</option>
                    <option value="CEO">CEO</option>
                    <option value="其他高管">其他高管</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">所属行业</label>
                  <select name="industry" value={formData.industry} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#003F87]/20 focus:border-[#003F87] outline-none transition-all bg-white">
                    <option value="">请选择所属行业</option>
                    <option value="制造业">制造业</option>
                    <option value="服务业">服务业</option>
                    <option value="互联网/科技">互联网/科技</option>
                    <option value="金融">金融</option>
                    <option value="房地产">房地产</option>
                    <option value="其他">其他</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">企业规模</label>
                  <select name="scale" value={formData.scale} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#003F87]/20 focus:border-[#003F87] outline-none transition-all bg-white">
                    <option value="">请选择企业规模</option>
                    <option value="50人以下">50人以下</option>
                    <option value="51-200人">51-200人</option>
                    <option value="201-500人">201-500人</option>
                    <option value="501-1000人">501-1000人</option>
                    <option value="1000人以上">1000人以上</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">管理年限</label>
                  <select name="managementYears" value={formData.managementYears} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#003F87]/20 focus:border-[#003F87] outline-none transition-all bg-white">
                    <option value="">请选择管理年限</option>
                    <option value="5年以内">5年以内</option>
                    <option value="5-10年">5-10年</option>
                    <option value="10-15年">10-15年</option>
                    <option value="15年以上">15年以上</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">年销售额</label>
                  <select name="revenue" value={formData.revenue} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#003F87]/20 focus:border-[#003F87] outline-none transition-all bg-white">
                    <option value="">请选择年销售额</option>
                    <option value="1000万以下">1000万以下</option>
                    <option value="1000万-5000万">1000万-5000万</option>
                    <option value="5000万-1亿">5000万-1亿</option>
                    <option value="1亿-5亿">1亿-5亿</option>
                    <option value="5亿以上">5亿以上</option>
                  </select>
                </div>
              </div>
            </section>

            <div className="h-px w-full bg-slate-100"></div>

            {/* 报名意向 */}
            <section>
              <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                <span className="w-1.5 h-6 bg-[#003F87] rounded-full inline-block"></span>
                报名意向
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">报名项目</label>
                  <select name="program" value={formData.program} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#003F87]/20 focus:border-[#003F87] outline-none transition-all bg-white">
                    <option value="">请选择报名项目</option>
                    <option value="AI实战研修班">AI实战研修班</option>
                    <option value="数字化转型研修班">数字化转型研修班</option>
                    <option value="领导力提升班">领导力提升班</option>
                    <option value="其他">其他</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">招生老师</label>
                  <select name="teacher" value={formData.teacher} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#003F87]/20 focus:border-[#003F87] outline-none transition-all bg-white">
                    <option value="">请选择招生老师</option>
                    <option value="贺海燕">贺海燕</option>
                    <option value="刘婷">刘婷</option>
                    <option value="其他">其他</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">学习期望</label>
                  <textarea name="expectation" value={formData.expectation} onChange={handleInputChange} rows={3} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#003F87]/20 focus:border-[#003F87] outline-none transition-all resize-none" placeholder="您希望通过本次学习收获什么？"></textarea>
                </div>
                <div className="md:col-span-2">
                  <label className="flex items-center gap-3 p-4 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
                    <input type="checkbox" name="isPaid" checked={formData.isPaid} onChange={handleInputChange} className="w-5 h-5 rounded border-slate-300 text-[#003F87] focus:ring-[#003F87]" />
                    <span className="text-slate-700 font-medium">是否已完成缴费</span>
                  </label>
                </div>
              </div>
            </section>

            {/* Submit Button */}
            <div className="pt-6">
              <button 
                type="submit" 
                disabled={status === 'submitting'}
                className="w-full md:w-auto md:min-w-[200px] px-8 py-4 bg-[#003F87] hover:bg-[#002f66] text-white rounded-xl font-bold text-lg shadow-lg shadow-[#003F87]/30 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mx-auto"
              >
                {status === 'submitting' ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    正在提交...
                  </>
                ) : (
                  '提交报名信息'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}