export interface Teacher {
  key: string;
  name: string;
  file: string;
  phoneNumber: string;
  signupUrl: string;
}

export interface EventItem {
  date: string;
  day: string;
  title: string;
  topic: string;
  speaker?: string;
  signupUrl?: string;
}

export interface MonthEvents {
  month: string;
  events: EventItem[];
}

export interface Course {
  id: string;
  title: string;
  description: string;
  features: string[];
  duration: string;
  fee: string;
  category: '企业管理' | '人文智慧' | 'AI创新' | '企业家校友游学';
  icon: string;
  image?: string;
  detailUrl?: string;
}

export interface Story {
  id: number;
  title: string;
  quote: string;
  imageIndex: number;
}

export const teachers: Record<string, Teacher> = {
  liuting: { key: 'liuting', name: '刘婷', file: '/assets/刘婷.jpg', phoneNumber: '18072752995', signupUrl: 'https://alidocs.dingtalk.com/notable/share/form/v01meonarb5pLmjpqXx_rfJ5zZQ_rnTssEd' },
  jinyiwen: { key: 'jinyiwen', name: '金逸雯', file: '/assets/金逸雯.jpg', phoneNumber: '19967471563', signupUrl: 'https://alidocs.dingtalk.com/notable/share/form/v01meonarb5pLmjpqXx_rFETvoX_ebAuave' },
  fanyihuan: { key: 'fanyihuan', name: '樊奕欢', file: '/assets/樊奕欢.jpeg', phoneNumber: '13757129152', signupUrl: 'https://alidocs.dingtalk.com/notable/share/form/v01meonarb5pLmjpqXx_3hrjlEx_qgkpa92' },
  xuguoping: { key: 'xuguoping', name: '徐国平', file: '/assets/徐国平.png', phoneNumber: '13757108269', signupUrl: 'https://alidocs.dingtalk.com/notable/share/form/v01meonarb5pLmjpqXx_MgllXoa_45roXnm' },
  liyazhen: { key: 'liyazhen', name: '李雅珍', file: '/assets/李雅珍.png', phoneNumber: '13805780645', signupUrl: 'https://alidocs.dingtalk.com/notable/share/form/v01meonarb5pLmjpqXx_4xp7aS0_HqXTpxz' },
  fengliangyong: { key: 'fengliangyong', name: '封良勇', file: '/assets/封良勇.jpg', phoneNumber: '13757108510', signupUrl: 'https://alidocs.dingtalk.com/notable/share/form/v01meonarb5pLmjpqXx_z0ZDJUQ_ERpfheG' },
  wangxiaojuan: { key: 'wangxiaojuan', name: '汪小娟', file: '/assets/汪小娟.jpg', phoneNumber: '13675878883', signupUrl: 'https://alidocs.dingtalk.com/notable/share/form/v01meonarb5pLmjpqXx_PJngsvx_NJg8u0h' },
  madaxiong: { key: 'madaxiong', name: '马达雄', file: '/assets/马达雄.png', phoneNumber: '13588429725', signupUrl: 'https://alidocs.dingtalk.com/notable/share/form/v01meonarb5pLmjpqXx_1y4Iben_9Ulmn8q' },
  wuliangzhou: { key: 'wuliangzhou', name: '武俍州', file: '/assets/武俍州.jpg', phoneNumber: '13283887052', signupUrl: 'https://alidocs.dingtalk.com/notable/share/form/v01meonarb5pLmjpqXx_oUHFMUW_iQPO5Fh' },
  pengsongsong: { key: 'pengsongsong', name: '彭松松', file: '/assets/彭松松.png', phoneNumber: '19858148227', signupUrl: 'https://alidocs.dingtalk.com/notable/share/form/v01meonarb5pLmjpqXx_zzzXDYm_AWBRwwI' },
  shenfei: { key: 'shenfei', name: '沈菲', file: '/assets/沈菲.png', phoneNumber: '18868846237', signupUrl: 'https://alidocs.dingtalk.com/notable/share/form/v01meonarb5pLmjpqXx_J4MGw83_rqBYji2' },
  hehaiyan: { key: 'hehaiyan', name: '贺海燕', file: '/assets/贺海燕.png', phoneNumber: '19967332809', signupUrl: 'https://alidocs.dingtalk.com/notable/share/form/v01meonarb5pLmjpqXx_dAZvcwU_5EsAV4a' },
  changxiajie: { key: 'changxiajie', name: '常夏洁', file: '/assets/常夏洁.jpg', phoneNumber: '16605810651', signupUrl: 'https://alidocs.dingtalk.com/notable/share/form/v01meonarb5pLmjpqXx_nsjbIZ8_8PHTVAL' },
  zhanglu: { key: 'zhanglu', name: '张露', file: '/assets/张露.jpg', phoneNumber: '15906618726', signupUrl: 'https://alidocs.dingtalk.com/notable/share/form/v01meonarb5pLmjpqXx_hERWDMS_Szs7A1h' },
  huse: { key: 'huse', name: '胡瑟', file: '/assets/胡瑟.jpg', phoneNumber: '', signupUrl: 'https://alidocs.dingtalk.com/notable/share/form/v01meonarb5pLmjpqXx_qDVibIq_xfa8fK0' },
  fengcaifeng: { key: 'fengcaifeng', name: '冯彩凤', file: '/assets/冯彩凤.jpg', phoneNumber: '', signupUrl: 'https://alidocs.dingtalk.com/notable/share/form/v01meonarb5pLmjpqXx_9Ax7Jjf_31C6ur4' },
  xudongying: { key: 'xudongying', name: '徐东英', file: '/assets/徐东英.jpg', phoneNumber: '18957111371', signupUrl: 'https://alidocs.dingtalk.com/notable/share/form/v01meonarb5pLmjpqXx_5lVgtzU_al7NkDP' },
};

export const defaultTeacher = teachers.zhanglu;

export const events: MonthEvents[] = [
  {
    month: '三月活动',
    events: [
      { date: '03-07', day: '周六', title: '《全球化新周期下的战略突围—科技企业的增长路径与资本布局》', topic: '浙江大学数智时代·金融投资运营实战高级研修班', speaker: '程立新 | 浙江大学传媒与国际文化学院专业学位研究生业界导师' },
      { date: '03-08', day: '周日', title: '《产业互联网的金融新基建》', topic: '浙江大学数智时代·金融投资运营实战高级研修班', speaker: '李明顺 | 数字经济与智能商业专家' },
      { date: '03-14', day: '周六', title: '《人力资源创新与组织效能提升》', topic: '浙江大学浙商企业家创新提升高级研修班', speaker: '陈慧 | 北京邮电大学经济管理学院教授' },
      { date: '03-21', day: '周六', title: '《曾国藩为人识人用人之道》', topic: '浙江大学文化与人文智慧高级研修班、浙江大学国学智慧与管理应用高级研修班', speaker: '张宏杰 | 清华大学历史系博士后' },
      { date: '03-22', day: '周日', title: '《经典中的情感世界》', topic: '浙江大学文化与人文智慧高级研修班、浙江大学国学智慧与管理应用高级研修班', speaker: '金利安 | 浙江大学传媒国际企业家校友联谊会会长' },
    ]
  },
  {
    month: '四月活动',
    events: [
      { date: '04-10', day: '周五', title: '香港游学考察', topic: '浙江大学数智时代·金融投资运营实战高级研修班' },
      { date: '04-11', day: '周六', title: '企业AI转型实战课', topic: '浙江大学人工智能与商业应用传播研修班' },
      { date: '04-18', day: '周六', title: '《冲突管理与领导力提升》', topic: '浙江大学浙商企业家创新提升高级研修班', speaker: '吴隆增 | 厦门大学管理学教授、博士生导师' },
      { date: '04-25', day: '周六', title: '《胡雪岩传记：政商关系与商业伦理反思》', topic: '浙江大学国学智慧与管理应用高级研修班', speaker: '屠博 | 中国人民大学历史学博士' },
    ]
  },
];

export const courses: Course[] = [
  {
    id: 'business-1',
    title: '浙江大学浙商企业家创新提升高级研修班',
    description: '传承浙商精神，赋能企业创新转型升级，助力新一代企业家成长成才。',
    features: ['浙商精神传承', '企业创新战略', '转型升级路径'],
    duration: '一年',
    fee: '38800元',
    category: '企业管理',
    icon: 'business',
    image: '/image/资料夹/精彩活动1.jpg',
    detailUrl: '/prototype/浙商企业家创新提升高级研修班.html'
  },
  {
    id: 'business-2',
    title: '浙江大学数智时代金融投资实战运营高级研修班',
    description: '深入解析资本市场运作规律，掌握投资决策核心技能，提升企业资本运营能力。',
    features: ['资本市场运作', '投资决策技能', '资本运营能力'],
    duration: '一年',
    fee: '48800元',
    category: '企业管理',
    icon: 'finance',
    image: '/image/资料夹/精彩活动2.jpg',
    detailUrl: '/prototype/金融投资实战运营高级研修班.html'
  },
  {
    id: 'culture-1',
    title: '浙江大学国学智慧与管理应用高级研修班',
    description: '提升领导智慧，强化文化底蕴，启发管理思维。',
    features: ['国学经典研读', '管理智慧应用', '个人修身养性'],
    duration: '一年',
    fee: '48800元',
    category: '人文智慧',
    icon: 'book',
    image: '/image/资料夹/精彩活动3.jpg',
    detailUrl: '/prototype/浙江大学国学智慧与管理应用高级研修班.html'
  },
  {
    id: 'culture-2',
    title: '浙江大学文化智慧与商业高级研修班',
    description: '拓展人文视野，提升审美品位，培养具有深厚文化底蕴的企业家精神。',
    features: ['人文视野拓展', '审美品位提升', '文化底蕴培养'],
    duration: '一年',
    fee: '68000元',
    category: '人文智慧',
    icon: 'star',
    image: '/image/资料夹/精彩活动4.jpg'
  },
  {
    id: 'ai-1',
    title: '浙江大学企业AI转型实战研修班',
    description: '系统学习AI技术应用，助力企业实现智能化转型升级，抢占AI时代发展先机。',
    features: ['AI技术应用', '智能化转型', '实战案例分析'],
    duration: '三天',
    fee: '9800元',
    category: 'AI创新',
    icon: 'ai',
    image: '/image/资料夹/精彩活动5.jpg',
    detailUrl: '/prototype/浙江大学企业AI转型实战研修班.html'
  },
  {
    id: 'ai-2',
    title: '浙江大学人工智能与企业家领导力高级研修班',
    description: '融合AI技术与领导力培养，打造面向未来的智能型企业家领袖。',
    features: ['AI技术前沿', '领导力提升', '未来战略规划'],
    duration: '一年',
    fee: '138000元',
    category: 'AI创新',
    icon: 'tech',
    image: '/image/资料夹/精彩活动6.jpg',
    detailUrl: '/prototype/浙江大学人工智能与企业家领导力高级研修班.html'
  },
  {
    id: 'travel-1',
    title: '人文行走·埃及游学',
    description: '在埃及，解码文明底蕴下的现代投资实战。',
    features: ['古文明探索', '跨文化交流', '洞察力提升'],
    duration: '10天',
    fee: '28800元',
    category: '企业家校友游学',
    icon: 'travel',
    image: '/image/埃及图片/头图.jpg',
    detailUrl: '/prototype/人文行走 - 埃及游学.html'
  },
  {
    id: 'travel-2',
    title: '海南自贸港游学',
    description: '深入了解海南自贸港政策，把握自贸区发展机遇，拓展商业合作空间。',
    features: ['自贸港政策解读', '商业机遇分析', '实地考察调研'],
    duration: '4天',
    fee: '待定',
    category: '企业家校友游学',
    icon: 'island',
    image: '/image/埃及图片/游学行程.jpg'
  },
];

export const stories: Story[] = [
  { id: 1, title: '学习之旅', quote: '在浙大课堂上，我学到了前沿管理知识，感受到了浓厚的学术氛围，这对我的企业发展产生了深远影响。', imageIndex: 2 },
  { id: 2, title: '同学情谊', quote: '通过浙大企业家培训，我结识了来自各行各业的精英同学，我们互相学习、共同成长，建立了深厚的友谊。', imageIndex: 1 },
  { id: 3, title: '实践应用', quote: '将课堂上学到的知识应用到企业管理中，取得了显著的成效，这让我更加坚信持续学习的重要性。', imageIndex: 3 },
];

export const bannerSlides = [
  {
    title: '浙江大学传媒国际文化经济高培中心',
    subtitle: '中国企业全球影响力构建的思想与战略中枢',
    description: '赋能中国故事，驱动全球品牌',
    bgColor: '#0055A2',
    bgImage: '/image/资料夹/2.jpg',
  },
  {
    title: '卓越领导力提升',
    subtitle: '',
    description: '汇聚全球顶尖师资，打造具有国际视野的企业领袖',
    bgColor: '#E6A100',
    bgImage: '/image/资料夹/3.jpg',
  },
  {
    title: '精英人脉网络',
    subtitle: '',
    description: '加入浙大企业家校友圈，共享资源与商机',
    bgColor: '#333333',
    bgImage: '/image/资料夹/4.jpg',
  },
];
