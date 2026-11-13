'use strict';

const env = process.env;

function str(v, fallback = '') {
  return (v === undefined || v === null || String(v).trim() === '') ? fallback : String(v).trim();
}

// 空串表示「按候选名自动探测」，非空表示强制使用该字段名
function opt(v) {
  return str(v, '');
}

function reportFields(env) {
  return {
    name: opt(env.FIELD_REPORT_NAME),
    gender: opt(env.FIELD_REPORT_GENDER),
    idType: opt(env.FIELD_REPORT_ID_TYPE),
    idNumber: opt(env.FIELD_REPORT_ID_NUMBER),
    company: opt(env.FIELD_REPORT_COMPANY),
    phone: opt(env.FIELD_REPORT_PHONE),
    plate: opt(env.FIELD_REPORT_PLATE),
    plateColor: opt(env.FIELD_REPORT_PLATE_COLOR),
    status: opt(env.FIELD_REPORT_STATUS),
    submittedAt: opt(env.FIELD_REPORT_TIME),
    klass: opt(env.FIELD_REPORT_CLASS),
    session: opt(env.FIELD_REPORT_SESSION),
    trial: opt(env.FIELD_REPORT_TRIAL),
    day: opt(env.FIELD_REPORT_DAY),
  };
}

const appId = str(env.FEISHU_APP_ID);
const appSecret = str(env.FEISHU_APP_SECRET);

const mode = str(env.FEISHU_MODE, appId && appSecret ? 'live' : 'mock').toLowerCase();

module.exports = {
  port: Number(str(env.PORT, '3000')),
  mode: mode === 'live' ? 'live' : 'mock',

  // 部署在子路径时设置，例如 BASE_PATH=/sign → 访问 https://域名/sign/
  basePath: str(env.BASE_PATH, ''),

  feishu: {
    baseUrl: 'https://open.feishu.cn',
    appId,
    appSecret,
    baseToken: str(env.FEISHU_BASE_TOKEN, 'I3ErbIGs7ayB7LsR11NcaZ9an9c'),
  },

  // 表名与飞书完全一致；匹配时允许带「表N｜」前缀
  tables: {
    student: str(env.TABLE_STUDENT, '学员表'),
    checkin: str(env.TABLE_CHECKIN, '签到表'),
    period: str(env.TABLE_PERIOD, '期次表'),
    klass: str(env.TABLE_CLASS, '班级表'),
    session: str(env.TABLE_SESSION, '课次表'),
    trial: str(env.TABLE_TRIAL, '新客户试听'),
    survey: str(env.TABLE_SURVEY, '答卷表'),
    confirm: str(env.TABLE_CONFIRM, '确认表'),
    guest: str(env.TABLE_GUEST, '临时登记表'),
    questionnaire: str(env.TABLE_QUESTIONNAIRE, '场次问卷表'),
    // 三张报备表：在读 / 新客 / 往期补课
    report: str(env.TABLE_REPORT, '入校报备表'),
    newReport: str(env.TABLE_NEW_REPORT, '新客入校报备表'),
    makeupReport: str(env.TABLE_MAKEUP_REPORT, '补课学员入校报备表'),
    teacher: str(env.TABLE_TEACHER, '讲师表'),
  },

  // 空串的项会在启动时按 candidates 自动探测
  fields: {
    student: {
      name: opt(env.FIELD_STUDENT_NAME),
      phone: opt(env.FIELD_STUDENT_PHONE),
      l4: opt(env.FIELD_STUDENT_L4),
      company: opt(env.FIELD_STUDENT_COMPANY),
      idcard: opt(env.FIELD_STUDENT_IDCARD),
      plate: opt(env.FIELD_STUDENT_PLATE),
      status: opt(env.FIELD_STUDENT_STATUS),
      period: opt(env.FIELD_STUDENT_PERIOD),
      class: opt(env.FIELD_STUDENT_CLASS),
      reportStatus: opt(env.FIELD_STUDENT_REPORT_STATUS),
      reportDate: opt(env.FIELD_STUDENT_REPORT_DATE),
    },
    checkin: {
      student: opt(env.FIELD_CHECKIN_STUDENT),
      trial: opt(env.FIELD_CHECKIN_TRIAL),
      session: opt(env.FIELD_CHECKIN_SESSION),
      name: opt(env.FIELD_CHECKIN_NAME),
      time: opt(env.FIELD_CHECKIN_TIME),
      date: opt(env.FIELD_CHECKIN_DATE),
      status: opt(env.FIELD_CHECKIN_STATUS),
      way: opt(env.FIELD_CHECKIN_WAY),
    },
    trial: {
      company: opt(env.FIELD_TRIAL_COMPANY),
      name: opt(env.FIELD_TRIAL_NAME),
      position: opt(env.FIELD_TRIAL_POSITION),
      idcard: opt(env.FIELD_TRIAL_IDCARD),
      phone: opt(env.FIELD_TRIAL_PHONE),
      plate: opt(env.FIELD_TRIAL_PLATE),
      inviter: opt(env.FIELD_TRIAL_INVITER),
      reportLink: opt(env.FIELD_TRIAL_REPORT_LINK),
      day: opt(env.FIELD_TRIAL_DAY),
    },
    confirm: {
      student: opt(env.FIELD_CONFIRM_STUDENT),
      session: opt(env.FIELD_CONFIRM_SESSION),
      status: opt(env.FIELD_CONFIRM_STATUS),
      reason: opt(env.FIELD_CONFIRM_REASON),
      source: opt(env.FIELD_CONFIRM_SOURCE),
      time: opt(env.FIELD_CONFIRM_TIME),
    },
    survey: {
      student: opt(env.FIELD_SURVEY_STUDENT),
      trial: opt(env.FIELD_SURVEY_TRIAL),
      session: opt(env.FIELD_SURVEY_SESSION),
      q1: opt(env.FIELD_SURVEY_Q1),
      q2: opt(env.FIELD_SURVEY_Q2),
      q3: opt(env.FIELD_SURVEY_Q3),
      q4: opt(env.FIELD_SURVEY_Q4),
      q5: opt(env.FIELD_SURVEY_Q5),
      time: opt(env.FIELD_SURVEY_TIME),
    },
    guest: {
      session: opt(env.FIELD_GUEST_SESSION),
      name: opt(env.FIELD_GUEST_NAME),
      company: opt(env.FIELD_GUEST_COMPANY),
      phone: opt(env.FIELD_GUEST_PHONE),
      status: opt(env.FIELD_GUEST_STATUS),
      time: opt(env.FIELD_GUEST_TIME),
    },
    // 三张报备表字段基本一致，复用同一份映射定义（三张表各自解析）
    report: reportFields(env),
    newReport: reportFields(env),
    makeupReport: reportFields(env),
  },

  // 自动探测的候选字段名（按优先级）
  candidates: {
    studentName: ['姓名'],
    studentPhone: ['手机号', '手机号码', '电话', '联系电话'],
    studentL4: ['手机后四位', '手机号后四位', '后四位'],
    studentCompany: ['单位名称', '企业名称', '公司名称', '公司'],
studentIdcard: ['身份证号码', '身份证号'],
    studentPlate: ['车牌号', '入校车牌号', '车牌', '机动车车牌号码'],
studentStatus: ['学员状态'],
studentPeriod: ['所属期次'],
studentClass: ['所属班级'],
studentReportStatus: ['报备状态'],
studentReportDate: ['报备提交日期'],

    checkinStudent: ['学员'],
    checkinTrial: ['试听记录', '试听学员'],
    checkinSession: ['所属课次'],
    checkinName: ['提交姓名'],
    checkinTime: ['签到时间'],
    checkinDate: ['签到日期'],
    checkinStatus: ['签到状态'],
    checkinWay: ['签到方式'],

    trialCompany: ['企业名称'],
    trialName: ['姓名'],
    trialPosition: ['职务'],
    trialIdcard: ['身份证号'],
    trialPhone: ['电话号码', '手机号', '手机号码'],
    trialPlate: ['车牌号'],
    trialInviter: ['邀请人姓名', '邀请人', '推荐人'],
    trialReportLink: ['新客入校报备', '入校报备'],
    trialDay: ['试听第几天', '试听天次', '第几天'],

    confirmStudent: ['学员'],
    confirmSession: ['所属课次'],
    confirmStatus: ['确认状态'],
    confirmReason: ['请假原因'],
    confirmSource: ['来源'],
    confirmTime: ['变更时间'],

    surveyStudent: ['学员'],
    surveyTrial: ['试听记录'],
    surveySession: ['所属课次'],
    surveyQuestionnaire: ['问卷'],
    surveyQ1: ['Q1 整体满意度', '整体满意度'],
    surveyQ2: ['Q2 内容帮助', '内容帮助'],
    surveyQ3: ['Q3 讲师专业度', '讲师专业度'],
    surveyQ4: ['Q4 场地服务', '场地服务'],
    surveyQ5: ['Q5 收获或建议', '收获或建议'],
    surveyTime: ['提交时间'],

    guestSession: ['所属课次'],
    guestName: ['姓名'],
    guestCompany: ['公司'],
    guestPhone: ['手机号'],
    guestStatus: ['登记状态'],
    guestTime: ['登记时间'],

    // 报备表（表7 / 表10 / 表16 同构，字段名带 * 前缀）
    reportName: ['*访客姓名', '访客姓名'],
    reportGender: ['性别'],
    reportIdType: ['*身份证件类型', '身份证件类型'],
    reportIdNumber: ['*访客证件号码', '访客证件号码', '证件号码'],
    reportCompany: ['*工作单位', '工作单位'],
    reportPhone: ['*访客手机号码', '访客手机号码'],
    reportPlate: ['机动车车牌号码', '车牌号码'],
    reportPlateColor: ['车牌颜色'],
    reportStatus: ['报备状态'],
    reportSubmittedAt: ['报备提交日期'],
    reportClass: ['所属班级'],
    reportSession: ['所属课次'],
    reportTrial: ['试听记录'],
    reportDay: ['试听第几天', '试听天次'],
  },

  // 每期名册表：表名模板，{period} 会替换成「期次表.期次名称」
  // 例：金融26期 → 金融26期学员表
  rosterTable: str(env.TABLE_ROSTER_PATTERN, '{period}学员表'),
  period: {
    nameField: str(env.PERIOD_NAME_FIELD, '期次名称'),
  },

  // 课次：用于把签到/确认/答卷关联到具体场次
  session: {
    recordId: str(env.SESSION_RECORD_ID),
    nameField: str(env.SESSION_NAME_FIELD, '课次名称'),
    dateField: str(env.SESSION_DATE_FIELD, '上课日期'),
    teacherField: str(env.SESSION_TEACHER_FIELD, '讲师及嘉宾'),
  },

  course: {
    title: str(env.COURSE_TITLE, '增长战略与组织能力'),
    period: str(env.COURSE_PERIOD, '第 12 期'),
    date: str(env.COURSE_DATE, '11 月 21 日 周六 · 09:00–17:00'),
    place: str(env.COURSE_PLACE, '上海 · 静安洲际酒店 3F 宴会厅'),
    speaker: str(env.COURSE_SPEAKER, '王 XX　某咨询合伙人'),
    deadline: str(env.COURSE_DEADLINE, '11-19 18:00'),
    window: str(env.COURSE_WINDOW, '08:30 — 17:30'),
    // 课表触发自动流转：课前→报名确认，签到窗口内→现场签到，结束后→课后评价
    day: str(env.COURSE_DAY),
    windowStart: str(env.COURSE_WINDOW_START, '08:30'),
    windowEnd: str(env.COURSE_WINDOW_END, '17:30'),
    surveyEnd: str(env.COURSE_SURVEY_END, '23:59'),
    surveyEndDay: str(env.COURSE_SURVEY_END_DAY),
  },

  // 工作人员入口：设置后访问 /staff 需要输入口令；留空则本机可直接使用
  adminToken: str(env.ADMIN_TOKEN),
};
