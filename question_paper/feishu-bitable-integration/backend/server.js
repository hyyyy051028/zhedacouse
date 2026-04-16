const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json());

// 飞书配置
const FEISHU_CONFIG = {
    appId: process.env.FEISHU_APP_ID,
    appSecret: process.env.FEISHU_APP_SECRET,
    baseUrl: process.env.FEISHU_BASE_URL,
    tableName: process.env.FEISHU_TABLE_NAME || '综合报名信息'
};

// 从URL解析 base_id 和 table_id
function parseBaseUrl(url) {
    const baseMatch = url.match(/\/base\/([a-zA-Z0-9]+)/);
    const tableMatch = url.match(/[?&]table=([a-zA-Z0-9]+)/);
    
    return {
        appToken: baseMatch ? baseMatch[1] : null,
        tableId: tableMatch ? tableMatch[1] : null
    };
}

// 获取飞书访问令牌
async function getAccessToken() {
    try {
        const response = await axios.post('https://open.feishu.cn/open-apis/auth/v3/app_access_token/internal', {
            app_id: FEISHU_CONFIG.appId,
            app_secret: FEISHU_CONFIG.appSecret
        });
        
        if (response.data.code === 0) {
            return response.data.app_access_token;
        }
        throw new Error(`获取Token失败: ${response.data.msg}`);
    } catch (error) {
        console.error('获取飞书Token失败:', error.message);
        throw error;
    }
}

// 获取表格元数据（字段信息）
async function getTableMeta(appToken, tableId, accessToken) {
    try {
        const response = await axios.get(
            `https://open.feishu.cn/open-apis/bitable/v1/apps/${appToken}/tables/${tableId}/fields`,
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            }
        );
        
        if (response.data.code === 0) {
            return response.data.data.items;
        }
        throw new Error(`获取表格元数据失败: ${response.data.msg}`);
    } catch (error) {
        console.error('获取表格元数据失败:', error.message);
        throw error;
    }
}

// 将表单数据转换为飞书多维表格格式
function convertToFeishuFormat(formData, fields) {
    const record = {
        fields: {}
    };
    
    // 字段类型映射处理
    const fieldTypeMap = {};
    fields.forEach(field => {
        fieldTypeMap[field.field_name] = field.type;
    });
    
    // 遍历表单数据
    for (const [key, value] of Object.entries(formData)) {
        const fieldType = fieldTypeMap[key];
        
        if (!fieldType) {
            console.warn(`字段 ${key} 在表格中不存在，跳过`);
            continue;
        }
        
        // 根据字段类型转换数据格式
        switch (fieldType) {
            case 1: // 多行文本
            case 3: // 单行文本
                record.fields[key] = value;
                break;
                
            case 2: // 数字
                record.fields[key] = Number(value) || 0;
                break;
                
            case 4: // 单选
                record.fields[key] = value;
                break;
                
            case 5: // 多选
                record.fields[key] = Array.isArray(value) ? value : [value];
                break;
                
            case 7: // 复选框
                record.fields[key] = Boolean(value);
                break;
                
            case 13: // 电话
                record.fields[key] = value;
                break;
                
            case 20: // 日期
                record.fields[key] = value;
                break;
                
            default:
                record.fields[key] = value;
        }
    }
    
    return record;
}

// 创建记录到飞书多维表格
async function createRecord(appToken, tableId, record, accessToken) {
    try {
        const response = await axios.post(
            `https://open.feishu.cn/open-apis/bitable/v1/apps/${appToken}/tables/${tableId}/records`,
            record,
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        
        if (response.data.code === 0) {
            return response.data.data;
        }
        throw new Error(`创建记录失败: ${response.data.msg}`);
    } catch (error) {
        console.error('创建记录失败:', error.response?.data || error.message);
        throw error;
    }
}

// 健康检查接口
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: '服务正常运行',
        timestamp: new Date().toISOString()
    });
});

// 提交报名接口
app.post('/api/submit', async (req, res) => {
    try {
        const formData = req.body;
        
        // 验证必填字段
        const requiredFields = ['姓名', '招生老师', '职务', '手机号', '最高学历', 
                               '单位名称', '身份证号码', '所属行业', '企业规模', 
                               '管理年限', '年销售额', '报名项目'];
        
        const missingFields = requiredFields.filter(field => !formData[field]);
        
        if (missingFields.length > 0) {
            return res.status(400).json({
                success: false,
                message: `缺少必填字段: ${missingFields.join(', ')}`
            });
        }
        
        // 解析base信息
        const { appToken, tableId } = parseBaseUrl(FEISHU_CONFIG.baseUrl);
        
        if (!appToken || !tableId) {
            return res.status(500).json({
                success: false,
                message: '飞书多维表格配置错误'
            });
        }
        
        // 获取访问令牌
        const accessToken = await getAccessToken();
        
        // 获取表格字段信息
        const fields = await getTableMeta(appToken, tableId, accessToken);
        
        // 转换数据格式
        const record = convertToFeishuFormat(formData, fields);
        
        // 创建记录
        const result = await createRecord(appToken, tableId, record, accessToken);
        
        res.json({
            success: true,
            message: '报名成功',
            data: {
                recordId: result.record.record_id
            }
        });
        
    } catch (error) {
        console.error('提交报名失败:', error);
        res.status(500).json({
            success: false,
            message: error.message || '提交失败，请稍后重试'
        });
    }
});

// 获取表格字段信息接口（用于调试）
app.get('/api/fields', async (req, res) => {
    try {
        const { appToken, tableId } = parseBaseUrl(FEISHU_CONFIG.baseUrl);
        const accessToken = await getAccessToken();
        const fields = await getTableMeta(appToken, tableId, accessToken);
        
        res.json({
            success: true,
            data: fields
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// 启动服务器
app.listen(PORT, () => {
    console.log(`服务器运行在 http://localhost:${PORT}`);
    console.log(`飞书多维表格: ${FEISHU_CONFIG.baseUrl}`);
});
