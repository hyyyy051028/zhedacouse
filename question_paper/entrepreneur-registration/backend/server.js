const express = require('express');
const axios = require('axios');
const cors = require('cors');
const dotenv = require('dotenv');

// 加载环境变量
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 飞书API配置
const APP_ID = process.env.APP_ID;
const APP_SECRET = process.env.APP_SECRET;
const BITABLE_APP_TOKEN = process.env.BITABLE_APP_TOKEN;
const BITABLE_TABLE_ID = process.env.BITABLE_TABLE_ID;

// 获取飞书访问令牌
async function getAccessToken() {
    try {
        const response = await axios.post('https://open.feishu.cn/open-apis/auth/v3/app_access_token/internal/', {
            app_id: APP_ID,
            app_secret: APP_SECRET
        });
        return response.data.app_access_token;
    } catch (error) {
        console.error('获取访问令牌失败:', error);
        throw error;
    }
}

// 提交表单数据到飞书多维表格
async function submitToBitable(data) {
    try {
        const token = await getAccessToken();
        
        // 构建飞书表格数据格式
        const records = [{
            fields: {
                "姓名": data.name,
                "招生老师": {
                    name: data.admissionTeacher,
                    color: "blue"
                },
                "职务": {
                    name: data.position,
                    color: "green"
                },
                "手机号": data.phone,
                "最高学历": {
                    name: data.education,
                    color: "yellow"
                },
                "毕业院校": data.graduationSchool,
                "单位名称": data.company,
                "身份证号码": data.idCard,
                "所属行业": {
                    name: data.industry,
                    color: "purple"
                },
                "企业规模": {
                    name: data.companySize,
                    color: "red"
                },
                "车牌号": data.licensePlate,
                "管理年限": {
                    name: data.managementYears,
                    color: "orange"
                },
                "年销售额": {
                    name: data.annualSales,
                    color: "gray"
                },
                "报名项目": {
                    name: data.program,
                    color: "cyan"
                },
                "学习期望": data.expectations,
                "居住城市": data.city,
                "是否缴费": data.isPaid
            }
        }];
        
        const response = await axios.post(`https://open.feishu.cn/open-apis/bitable/v1/apps/${BITABLE_APP_TOKEN}/tables/${BITABLE_TABLE_ID}/records`, {
            records: records
        }, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        return response.data;
    } catch (error) {
        console.error('提交到飞书表格失败:', error);
        throw error;
    }
}

// 健康检查接口
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
});

// 表单提交接口
app.post('/api/submit', async (req, res) => {
    try {
        const formData = req.body;
        console.log('收到表单数据:', formData);
        
        // 提交到飞书表格
        const result = await submitToBitable(formData);
        
        res.json({
            success: true,
            message: '报名成功',
            data: result
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: '提交失败',
            error: error.message
        });
    }
});

// 启动服务器
app.listen(port, () => {
    console.log(`服务器运行在 http://localhost:${port}`);
    console.log('API接口: http://localhost:${port}/api/submit');
});