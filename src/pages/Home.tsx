import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Users, Award, ChevronRight } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#003F87] rounded flex items-center justify-center text-white font-bold text-xl tracking-wider">
              ZJU
            </div>
            <span className="text-xl font-medium tracking-wide text-[#003F87]">浙江大学企业家研修班</span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              to="/survey"
              className="px-6 py-2.5 bg-white text-[#003F87] border border-[#003F87]/20 hover:bg-slate-50 rounded-full transition-all duration-300 font-medium text-sm hidden sm:block"
            >
              课前调研
            </Link>
            <Link
              to="/register"
              className="px-6 py-2.5 bg-[#003F87] hover:bg-[#002f66] text-white rounded-full transition-all duration-300 font-medium text-sm flex items-center gap-2 group shadow-[0_4px_14px_0_rgba(0,63,135,0.39)]"
            >
              立即报名
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[#003F87]/5 backdrop-blur-3xl"></div>
          {/* Decorative Elements */}
          <div className="absolute top-20 left-10 w-72 h-72 bg-[#003F87]/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-[#D4AF37]/10 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <div className="inline-block mb-6 px-4 py-1.5 rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/10 text-[#B8962E] text-sm font-medium tracking-widest uppercase">
            2026 秋季班招生中
          </div>
          <h1 className="text-5xl lg:text-7xl font-bold mb-8 tracking-tight text-slate-900">
            重塑商业格局 <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#003F87] to-[#005bb5]">
              引领未来智造
            </span>
          </h1>
          <p className="text-lg lg:text-xl text-slate-600 mb-12 max-w-3xl mx-auto leading-relaxed">
            依托浙江大学百年名校底蕴，汇聚全球顶尖商业智慧。为新时代企业家量身定制的顶级研修课程，助您突破增长瓶颈，构建核心壁垒。
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/survey"
              className="px-8 py-4 bg-white text-[#003F87] border-2 border-[#003F87]/20 hover:border-[#003F87]/50 hover:bg-slate-50 rounded-full text-lg font-medium transition-all duration-300 w-full sm:w-auto justify-center text-center"
            >
              填写课前调研
            </Link>
            <Link
              to="/register"
              className="px-8 py-4 bg-[#003F87] text-white rounded-full text-lg font-medium hover:bg-[#002f66] transition-all duration-300 shadow-[0_8px_30px_rgb(0,63,135,0.3)] hover:shadow-[0_8px_30px_rgb(0,63,135,0.5)] flex items-center gap-2 w-full sm:w-auto justify-center"
            >
              获取招生简章及报名
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">为什么选择浙大研修班？</h2>
            <div className="w-16 h-1 bg-[#D4AF37] mx-auto rounded-full"></div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: BookOpen,
                title: '前沿课程体系',
                desc: '紧扣时代脉搏，涵盖宏观经济、数字化转型、组织管理、资本运作等核心模块。'
              },
              {
                icon: Users,
                title: '顶级师资阵容',
                desc: '浙大名师领衔，携手行业标杆企业掌舵人、实战派投资专家倾情授课。'
              },
              {
                icon: Award,
                title: '高端校友网络',
                desc: '与数千位优秀企业家同窗，加入终身学习的菁英圈层，共享商业资源。'
              }
            ].map((feature, idx) => (
              <div key={idx} className="p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                <div className="w-14 h-14 rounded-xl bg-white shadow-sm flex items-center justify-center mb-6 text-[#003F87] group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#001A3A] text-slate-300 py-12 border-t border-[#002f66]">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white/10 rounded flex items-center justify-center text-white font-bold text-sm tracking-wider">
              ZJU
            </div>
            <span className="font-medium text-white tracking-wide">浙江大学企业家研修班</span>
          </div>
          <p className="text-sm">© {new Date().getFullYear()} 浙江大学版权所有. 保留一切权利.</p>
        </div>
      </footer>
    </div>
  );
}
