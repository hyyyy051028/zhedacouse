import express, { type Request, type Response } from 'express'
import dotenv from 'dotenv'

dotenv.config()

const router = express.Router()

// Feishu App Credentials
const FEISHU_APP_ID = process.env.FEISHU_APP_ID || 'cli_a951df4d48781bc2'
const FEISHU_APP_SECRET = process.env.FEISHU_APP_SECRET || 'Pm28WU1Tl4j2TxyifGO1Lg7r0a0sigVK'

// The provided Feishu Base App Token for the Survey
const APP_TOKEN = 'YFcZb5WqYa0kuusbLrYc7hAangh'

router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const payload = req.body

    console.log('Received survey payload:', payload)

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
    
    // IMPORTANT: Here we select the table. If you have multiple tables in this base, 
    // you might need to find the specific one for "课前调研". For now we use the first one.
    const tableId = tablesData.data.items[0].table_id

    // 3. Map exactly to the 18 fields specified by the user
    // Note: The keys here MUST exactly match the field names in your Feishu Bitable!
    const recordData: any = {
      fields: {
        // 一、企业基本情况
        '1. 所属行业是什么？': payload.industry,
        '2. 年营收规模大致是多少？': payload.revenue,
        '3. 员工人数有多少？': payload.employees,
        '4. 主要业务模式是什么（如B2B、B2C、制造型、服务型等）？': payload.businessModel,
        '5. 主要销售渠道是什么？': payload.salesChannel,
        '6. 当前使用了哪些数字化系统（如ERP、CRM、MES、OA等）？': payload.digitalSystems,
        
        // 二、业务经营痛点
        '7. 当前业务中最困扰您的1-3个问题是什么？': payload.painPoints,
        '8. 这些问题已经持续多久？之前尝试过哪些解决方法？': payload.painDuration,
        '9. 在营销、销售、客服、研发、供应链、行政等环节中，哪些环节让您感觉重复、耗时、难以标准化？': payload.timeConsumingLinks,
        
        // 三、对AI的掌握程度
        '10. 您或您的团队是否使用过对话类、图像生成类或办公提效类的AI工具？具体用过哪些？': payload.aiToolsUsed,
        '11. 企业内部是否有专门研究或试用AI的人员或小组？': payload.aiTeam,
        '12. 是否已经尝试将AI应用到真实业务中？效果如何？': payload.aiApplication,
        
        // 四、对AI的期望
        '13. 您最希望了解AI的哪些内容，是案例/功能/费用/使用技巧？': payload.aiExpectation,
        '14. 您更希望AI去帮你解决业务中的什么问题？': payload.aiSolveProblem,
        '15. 您认为企业内部推进AI落地的最大阻力可能是什么？': payload.aiObstacle,
        
        // 五、对课程的期望
        '16. 您最希望从本次研修班带走的是什么？': payload.courseTakeaway,
        '17. 您希望课程增加哪些内容（如行业案例、动手工作坊、1v1诊断、合规安全等）？': payload.courseAddition,
        '18. 关于AI或本次课程，您还有哪些特别想了解或希望解决的问题？': payload.otherQuestions
      }
    }

    // Clean up empty fields to prevent Feishu validation errors
    Object.keys(recordData.fields).forEach(key => {
      if (recordData.fields[key] === '' || recordData.fields[key] === null || recordData.fields[key] === undefined) {
        delete recordData.fields[key]
      }
    })

    console.log('Sending survey data to Feishu OpenAPI:', JSON.stringify(recordData, null, 2))
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

    res.status(200).json({ success: true, message: '问卷提交成功' })
  } catch (error) {
    console.error('Survey Error:', error)
    res.status(500).json({ success: false, message: '服务器内部错误' })
  }
})

export default router
