import express, { type Request, type Response } from 'express'
import dotenv from 'dotenv'

dotenv.config()

const router = express.Router()

// Feishu App Credentials
const FEISHU_APP_ID = process.env.FEISHU_APP_ID || 'cli_a951df4d48781bc2'
const FEISHU_APP_SECRET = process.env.FEISHU_APP_SECRET || 'Pm28WU1Tl4j2TxyifGO1Lg7r0a0sigVK'

// The provided Feishu Base App Token
const APP_TOKEN = 'YFcZb5WqYa0kuusbLrYc7hAangh'

router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const payload = req.body

    console.log('Received registration payload:', payload)

    // Basic validation
    if (!payload.name || !payload.phone || !payload.idCard) {
      res.status(400).json({ success: false, message: '姓名、手机号和身份证号码为必填项' })
      return
    }

    // 1. Get tenant_access_token
    const tokenResponse = await fetch('https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        app_id: FEISHU_APP_ID,
        app_secret: FEISHU_APP_SECRET
      })
    })
    
    const tokenData = await tokenResponse.json()
    
    if (tokenData.code !== 0) {
      console.error('Failed to get Feishu token:', tokenData)
      res.status(500).json({ success: false, message: '无法连接到飞书服务', error: tokenData.msg })
      return
    }
    
    const accessToken = tokenData.tenant_access_token

    // 2. Get Table ID dynamically from the Base (using App Token)
    const tablesResponse = await fetch(`https://open.feishu.cn/open-apis/bitable/v1/apps/${APP_TOKEN}/tables`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    })
    
    const tablesData = await tablesResponse.json()
    
    if (tablesData.code !== 0 || !tablesData.data?.items?.length) {
      console.error('Failed to get Feishu tables:', tablesData)
      res.status(500).json({ success: false, message: '无法获取多维表格数据，请确认应用是否已被授权访问该表格', error: tablesData.msg })
      return
    }
    
    const tableId = tablesData.data.items[0].table_id

    // 3. Map exactly to the 17 fields specified by the user
    const recordData: any = {
      fields: {
        '姓名': payload.name,
        '招生老师': payload.teacher,
        '职务': payload.title,
        '手机号': payload.phone,
        '最高学历': payload.education,
        '毕业院校': payload.school,
        '单位名称': payload.company,
        '身份证号码': payload.idCard,
        '所属行业': payload.industry,
        '企业规模': payload.scale,
        '车牌号': payload.carPlate,
        '管理年限': payload.managementYears,
        '年销售额': payload.revenue,
        '报名项目': payload.program,
        '学习期望': payload.expectation,
        '居住城市': payload.city,
        '是否缴费': payload.isPaid === true || payload.isPaid === 'true'
      }
    }

    // Clean up empty fields to prevent Feishu validation errors on empty single_selects
    Object.keys(recordData.fields).forEach(key => {
      if (recordData.fields[key] === '' || recordData.fields[key] === null || recordData.fields[key] === undefined) {
        delete recordData.fields[key]
      }
    })

    console.log('Sending data to Feishu OpenAPI:', JSON.stringify(recordData, null, 2))
    console.log(`Target Table ID: ${tableId}`)

    // 4. Add record to Feishu Base
    const addRecordResponse = await fetch(`https://open.feishu.cn/open-apis/bitable/v1/apps/${APP_TOKEN}/tables/${tableId}/records`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(recordData)
    })

    const addRecordData = await addRecordResponse.json()

    if (addRecordData.code !== 0) {
      console.error('Failed to add record to Feishu:', addRecordData)
      res.status(500).json({ 
        success: false, 
        message: '保存数据到飞书表格失败。', 
        error: addRecordData.msg 
      })
      return
    }

    res.status(200).json({ success: true, message: '报名成功' })
  } catch (error) {
    console.error('Registration Error:', error)
    res.status(500).json({ success: false, message: '服务器内部错误' })
  }
})

export default router
