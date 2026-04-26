import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, AlertCircle, Loader2, Sparkles, Building2, Target, BrainCircuit, Lightbulb, GraduationCap } from 'lucide-react';

export default function Survey() {
  const [formData, setFormData] = useState({
    // 一、企业基本情况
    industry: '',
    revenue: '',
    employees: '',
    businessModel: '',
    salesChannel: '',
    digitalSystems: '',
    // 二、业务经营痛点
    painPoints: '',
    painDuration: '',
    timeConsumingLinks: '',
    // 三、对AI的掌握程度
    aiToolsUsed: '',
    aiTeam: '',
    aiApplication: '',
    // 四、对AI的期望
    aiExpectation: '',
    aiSolveProblem: '',
    aiObstacle: '',
    // 五、对课程的期望
    courseTakeaway: '',
    courseAddition: '',
    otherQuestions: ''
  });

  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    setErrorMessage('');

    try {
      // 提交到新的调查问卷后端路由 (稍后我们需要创建此路由)
      const response = await fetch('/api/survey', {
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
          <h2 className="text-2xl font-bold text-slate-800 mb-2">提交成功</h2>
          <p className="text-slate-600 mb-8">感谢您的反馈，您的意见将帮助我们为您提供更好的课程体验。</p>
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
          <div className="bg-gradient-to-br from-[#003F87] to-[#002244] p-8 md:p-12 relative overflow-hidden shrink-0">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#D4AF37]/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/4"></div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-[#D4AF37]" />
                </div>
                <span className="text-[#D4AF37] font-semibold tracking-wider text-sm">浙江大学企业家研修班</span>
              </div>
              
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">AI研修班课前调研</h1>
              <p className="text-slate-300 text-sm md:text-base max-w-2xl leading-relaxed">
                为了更好地贴合您的实际需求，我们希望在课前做一个简短访谈，了解您企业的现状与对AI的期待。您的反馈将直接影响课程案例、实战环节的设计。
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8 md:p-12 space-y-12">
            {status === 'error' && (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-start gap-3 border border-red-100">
                <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
                <p>{errorMessage}</p>
              </div>
            )}

            {/* 一、企业基本情况 */}
            <section className="bg-slate-50/50 p-6 md:p-8 rounded-2xl border border-slate-100">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-full bg-[#003F87]/10 flex items-center justify-center text-[#003F87]">
                  <Building2 className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-bold text-slate-800">一、企业基本情况</h2>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">1. 所属行业是什么？</label>
                  <input type="text" name="industry" value={formData.industry} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#003F87]/20 focus:border-[#003F87] outline-none transition-all bg-white" placeholder="请输入所属行业" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">2. 年营收规模大致是多少？</label>
                  <input type="text" name="revenue" value={formData.revenue} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#003F87]/20 focus:border-[#003F87] outline-none transition-all bg-white" placeholder="请输入大致营收规模" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">3. 员工人数有多少？</label>
                  <input type="text" name="employees" value={formData.employees} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#003F87]/20 focus:border-[#003F87] outline-none transition-all bg-white" placeholder="请输入大致员工人数" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">4. 主要业务模式是什么？<span className="text-slate-400 font-normal ml-2">（如B2B、B2C、制造型、服务型等）</span></label>
                  <input type="text" name="businessModel" value={formData.businessModel} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#003F87]/20 focus:border-[#003F87] outline-none transition-all bg-white" placeholder="请输入业务模式" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">5. 主要销售渠道是什么？</label>
                  <input type="text" name="salesChannel" value={formData.salesChannel} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#003F87]/20 focus:border-[#003F87] outline-none transition-all bg-white" placeholder="请输入主要销售渠道" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">6. 当前使用了哪些数字化系统？<span className="text-slate-400 font-normal ml-2">（如ERP、CRM、MES、OA等）</span></label>
                  <input type="text" name="digitalSystems" value={formData.digitalSystems} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#003F87]/20 focus:border-[#003F87] outline-none transition-all bg-white" placeholder="请输入正在使用的系统" />
                </div>
              </div>
            </section>

            {/* 二、业务经营痛点 */}
            <section className="bg-slate-50/50 p-6 md:p-8 rounded-2xl border border-slate-100">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                  <Target className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-bold text-slate-800">二、业务经营痛点</h2>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">7. 当前业务中最困扰您的1-3个问题是什么？</label>
                  <textarea name="painPoints" value={formData.painPoints} onChange={handleInputChange} rows={3} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#003F87]/20 focus:border-[#003F87] outline-none transition-all resize-none bg-white" placeholder="请详细描述困扰您的问题"></textarea>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">8. 这些问题已经持续多久？之前尝试过哪些解决方法？</label>
                  <textarea name="painDuration" value={formData.painDuration} onChange={handleInputChange} rows={3} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#003F87]/20 focus:border-[#003F87] outline-none transition-all resize-none bg-white" placeholder="请描述问题的持续时间及以往尝试"></textarea>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">9. 在营销、销售、客服、研发、供应链、行政等环节中，哪些环节让您感觉重复、耗时、难以标准化？</label>
                  <textarea name="timeConsumingLinks" value={formData.timeConsumingLinks} onChange={handleInputChange} rows={3} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#003F87]/20 focus:border-[#003F87] outline-none transition-all resize-none bg-white" placeholder="请指出低效环节"></textarea>
                </div>
              </div>
            </section>

            {/* 三、对AI的掌握程度 */}
            <section className="bg-slate-50/50 p-6 md:p-8 rounded-2xl border border-slate-100">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                  <BrainCircuit className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-bold text-slate-800">三、对AI的掌握程度</h2>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">10. 您或您的团队是否使用过对话类、图像生成类或办公提效类的AI工具？具体用过哪些？</label>
                  <textarea name="aiToolsUsed" value={formData.aiToolsUsed} onChange={handleInputChange} rows={3} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#003F87]/20 focus:border-[#003F87] outline-none transition-all resize-none bg-white" placeholder="请列举您使用过的AI工具"></textarea>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">11. 企业内部是否有专门研究或试用AI的人员或小组？</label>
                  <input type="text" name="aiTeam" value={formData.aiTeam} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#003F87]/20 focus:border-[#003F87] outline-none transition-all bg-white" placeholder="有 / 没有 / 计划组建等" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">12. 是否已经尝试将AI应用到真实业务中？效果如何？</label>
                  <textarea name="aiApplication" value={formData.aiApplication} onChange={handleInputChange} rows={3} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#003F87]/20 focus:border-[#003F87] outline-none transition-all resize-none bg-white" placeholder="请描述AI应用情况及效果"></textarea>
                </div>
              </div>
            </section>

            {/* 四、对AI的期望 */}
            <section className="bg-slate-50/50 p-6 md:p-8 rounded-2xl border border-slate-100">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                  <Lightbulb className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-bold text-slate-800">四、对AI的期望</h2>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">13. 您最希望了解AI的哪些内容，是案例/功能/费用/使用技巧？</label>
                  <input type="text" name="aiExpectation" value={formData.aiExpectation} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#003F87]/20 focus:border-[#003F87] outline-none transition-all bg-white" placeholder="请描述您希望了解的内容" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">14. 您更希望AI去帮你解决业务中的什么问题？</label>
                  <textarea name="aiSolveProblem" value={formData.aiSolveProblem} onChange={handleInputChange} rows={3} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#003F87]/20 focus:border-[#003F87] outline-none transition-all resize-none bg-white" placeholder="请描述期望AI解决的具体问题"></textarea>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">15. 您认为企业内部推进AI落地的最大阻力可能是什么？</label>
                  <textarea name="aiObstacle" value={formData.aiObstacle} onChange={handleInputChange} rows={3} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#003F87]/20 focus:border-[#003F87] outline-none transition-all resize-none bg-white" placeholder="请指出可能的阻力"></textarea>
                </div>
              </div>
            </section>

            {/* 五、对课程的期望 */}
            <section className="bg-slate-50/50 p-6 md:p-8 rounded-2xl border border-slate-100">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-bold text-slate-800">五、对课程的期望</h2>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">16. 您最希望从本次研修班带走的是什么？</label>
                  <textarea name="courseTakeaway" value={formData.courseTakeaway} onChange={handleInputChange} rows={3} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#003F87]/20 focus:border-[#003F87] outline-none transition-all resize-none bg-white" placeholder="请描述您的核心诉求"></textarea>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">17. 您希望课程增加哪些内容？<span className="text-slate-400 font-normal ml-2">（如行业案例、动手工作坊、1v1诊断、合规安全等）</span></label>
                  <textarea name="courseAddition" value={formData.courseAddition} onChange={handleInputChange} rows={3} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#003F87]/20 focus:border-[#003F87] outline-none transition-all resize-none bg-white" placeholder="请提出对课程内容的建议"></textarea>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">18. 关于AI或本次课程，您还有哪些特别想了解或希望解决的问题？</label>
                  <textarea name="otherQuestions" value={formData.otherQuestions} onChange={handleInputChange} rows={3} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#003F87]/20 focus:border-[#003F87] outline-none transition-all resize-none bg-white" placeholder="其他补充信息"></textarea>
                </div>
              </div>
            </section>

            {/* Submit Button */}
            <div className="pt-8 border-t border-slate-100">
              <button 
                type="submit" 
                disabled={status === 'submitting'}
                className="w-full md:w-auto md:min-w-[240px] px-8 py-4 bg-[#003F87] hover:bg-[#002f66] text-white rounded-xl font-bold text-lg shadow-lg shadow-[#003F87]/30 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mx-auto"
              >
                {status === 'submitting' ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    正在提交问卷...
                  </>
                ) : (
                  '提交问卷'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}