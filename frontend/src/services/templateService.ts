import { ref } from 'vue'
import { http } from '@/utils/http'

// 模板数据类型定义
export interface Template {
  id: number
  name: string
  category: string
  description: string
  creator: string
  exerciseCount: number
  useCount: number
  createdAt: string
  warmup: Exercise[]
  main: Exercise[]
  stretch: Exercise[]
}

export interface Exercise {
  name: string
  description: string
  variable1: 'weight' | 'intensity' | 'difficulty'
  variable2: 'reps' | 'duration'
}

// 全局模板数据
const templates = ref<Template[]>([])
const loading = ref(false)

// 加载模板数据
export const loadTemplates = async (): Promise<Template[]> => {
  if (templates.value.length > 0) {
    return templates.value
  }

  try {
    loading.value = true
    const response = await http.get('/api/templates?limit=100')
    const data = await response.json()
    
    if (data.success) {
      // 转换数据库格式为前端格式
      templates.value = data.data.map((template: any) => ({
        id: template.id,
        name: template.name,
        category: template.category,
        description: template.description,
        creator: template.creator_name === '李亚威' || template.creator_name === '未知' ? '管理员' : (template.creator_name || '管理员'),
        exerciseCount: template.template_content ? JSON.parse(template.template_content).main?.length || 0 : 0,
        useCount: template.use_count || 0,
        createdAt: template.created_at,
        // 解析模板内容
        ...parseTemplateContent(template.template_content)
      }))
      console.log('Templates loaded from API:', templates.value.length, 'templates')
    } else {
      console.error('Failed to load templates:', data.message)
      // 使用默认数据作为后备
      loadDefaultTemplates()
    }
  } catch (error) {
    console.error('加载模板数据失败:', error)
    // 使用默认数据作为后备
    loadDefaultTemplates()
  } finally {
    loading.value = false
  }

  return templates.value
}

// 解析模板内容
const parseTemplateContent = (content: string) => {
  try {
    if (!content) return { warmup: [], main: [], stretch: [] }
    const parsed = JSON.parse(content)
    return {
      warmup: parsed.warmup || [],
      main: parsed.main || [],
      stretch: parsed.stretch || []
    }
  } catch (error) {
    console.error('解析模板内容失败:', error)
    return { warmup: [], main: [], stretch: [] }
  }
}

// 加载默认模板数据（作为后备）
const loadDefaultTemplates = () => {
  console.log('Loading default templates...')
  templates.value = [
    {
      id: 1,
      name: '上肢力量训练',
      category: 'strength',
      description: '专注于胸、肩、臂部肌肉的力量训练计划',
      creator: '管理员',
      exerciseCount: 8,
      useCount: 15,
      createdAt: '2024-01-15',
      warmup: [
        { name: '肩部环绕', description: '双手自然下垂，缓慢做肩部前后环绕动作，激活肩部肌群', variable1: 'intensity', variable2: 'duration' },
        { name: '手臂摆动', description: '双臂自然摆动，配合呼吸节奏，逐渐增加幅度', variable1: 'intensity', variable2: 'duration' }
      ],
      main: [
        { name: '卧推', description: '平躺于卧推凳上，双手握杠铃，控制呼吸节奏，注意肩胛骨收紧', variable1: 'weight', variable2: 'reps' },
        { name: '哑铃飞鸟', description: '仰卧于凳上，双手持哑铃向两侧展开，感受胸部肌肉的拉伸和收缩', variable1: 'weight', variable2: 'reps' },
        { name: '肩推', description: '坐姿或站姿，双手持哑铃或杠铃，向上推举至手臂伸直，注意控制动作节奏', variable1: 'weight', variable2: 'reps' },
        { name: '哑铃弯举', description: '站姿，双手持哑铃，肘部贴近身体，向上弯举至哑铃接近肩部', variable1: 'weight', variable2: 'reps' },
        { name: '三头肌下压', description: '使用绳索器械，双手握绳，向下压至手臂伸直，感受三头肌收缩', variable1: 'weight', variable2: 'reps' }
      ],
      stretch: [
        { name: '胸部拉伸', description: '双手向后伸展，感受胸部肌肉的拉伸，保持15-30秒', variable1: 'intensity', variable2: 'duration' },
        { name: '肩部拉伸', description: '一手横过胸前，另一手辅助拉伸，感受肩部肌肉的放松', variable1: 'intensity', variable2: 'duration' }
      ]
    },
    {
      id: 2,
      name: '下肢力量训练',
      category: 'strength',
      description: '强化腿部肌肉,提升下肢力量',
      creator: '管理员',
      exerciseCount: 6,
      useCount: 12,
      createdAt: '2024-01-10',
      warmup: [
        { name: '腿部拉伸', description: '站立位，交替抬起膝盖，活动髋关节和膝关节', variable1: 'intensity', variable2: 'duration' },
        { name: '踝关节活动', description: '坐姿，双脚踝关节做环绕运动，激活小腿肌群', variable1: 'intensity', variable2: 'duration' }
      ],
      main: [
        { name: '深蹲', description: '双脚与肩同宽，下蹲时臀部向后，膝盖不超过脚尖', variable1: 'weight', variable2: 'reps' },
        { name: '硬拉', description: '双脚与肩同宽，弯腰时保持背部挺直，感受臀部和大腿后侧肌群', variable1: 'weight', variable2: 'reps' },
        { name: '腿举', description: '使用腿举器械，双脚踩踏板，向上推举至腿部伸直', variable1: 'weight', variable2: 'reps' },
        { name: '小腿提踵', description: '站立位，双脚前掌踩在台阶上，做提踵动作', variable1: 'weight', variable2: 'reps' }
      ],
      stretch: [
        { name: '大腿拉伸', description: '站立位，一手扶墙，另一手抓住脚踝向后拉伸', variable1: 'intensity', variable2: 'duration' },
        { name: '小腿拉伸', description: '面对墙壁，一脚前一脚后，感受小腿肌肉的拉伸', variable1: 'intensity', variable2: 'duration' }
      ]
    },
    {
      id: 3,
      name: '全身综合训练',
      category: 'comprehensive',
      description: '全身肌肉群的综合训练计划',
      creator: '管理员',
      exerciseCount: 10,
      useCount: 8,
      createdAt: '2024-01-08',
      warmup: [
        { name: '全身拉伸', description: '从头到脚的全身拉伸，激活所有肌群', variable1: 'intensity', variable2: 'duration' },
        { name: '关节活动', description: '各关节的环绕运动，提高关节灵活性', variable1: 'intensity', variable2: 'duration' }
      ],
      main: [
        { name: '俯卧撑', description: '双手撑地，身体成一条直线，做俯卧撑动作', variable1: 'weight', variable2: 'reps' },
        { name: '引体向上', description: '双手握杠，身体悬空，向上拉至下巴过杠', variable1: 'weight', variable2: 'reps' },
        { name: '仰卧起坐', description: '仰卧，双手抱头，腹部发力做仰卧起坐', variable1: 'weight', variable2: 'reps' },
        { name: '平板支撑', description: '肘部撑地，身体成一条直线，保持核心稳定', variable1: 'intensity', variable2: 'duration' },
        { name: '深蹲', description: '双脚与肩同宽，下蹲时臀部向后', variable1: 'weight', variable2: 'reps' }
      ],
      stretch: [
        { name: '全身放松', description: '全身各部位的放松拉伸', variable1: 'intensity', variable2: 'duration' },
        { name: '呼吸调节', description: '深呼吸，调节呼吸节奏', variable1: 'intensity', variable2: 'duration' }
      ]
    }
  ]
}

// 获取模板数据
export const getTemplates = () => templates.value

// 获取加载状态
export const getLoading = () => loading.value

// 刷新模板数据
export const refreshTemplates = async () => {
  templates.value = []
  return await loadTemplates()
}

// 根据ID获取模板
export const getTemplateById = (id: number): Template | undefined => {
  return templates.value.find(template => template.id === id)
}

// 根据分类筛选模板
export const getTemplatesByCategory = (category: string): Template[] => {
  if (!category) return templates.value
  return templates.value.filter(template => template.category === category)
}

// 搜索模板
export const searchTemplates = (keyword: string): Template[] => {
  if (!keyword) return templates.value
  const lowerKeyword = keyword.toLowerCase()
  return templates.value.filter(template => 
    template.name.toLowerCase().includes(lowerKeyword) ||
    template.description.toLowerCase().includes(lowerKeyword)
  )
} 