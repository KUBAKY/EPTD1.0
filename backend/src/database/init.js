const sqlite3 = require('sqlite3').verbose()
const path = require('path')
const bcrypt = require('bcryptjs')

// 数据库文件路径
const dbPath = path.join(__dirname, '../../database/wellmotion.db')

// 创建数据库连接
const db = new sqlite3.Database(dbPath)

console.log('🗄️ 正在初始化数据库...')

// 创建用户表
db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role TEXT CHECK(role IN ('admin', 'coach')) NOT NULL DEFAULT 'coach',
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(11),
    status INTEGER DEFAULT 1,
    last_login_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`, (err) => {
  if (err) {
    console.error('创建用户表错误:', err)
  } else {
    console.log('✅ 用户表创建成功')
  }
})

// 创建会员表
db.run(`
  CREATE TABLE IF NOT EXISTS members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(11) UNIQUE NOT NULL,
    gender TEXT CHECK(gender IN ('male', 'female')) NOT NULL,
    age INTEGER NOT NULL,
    height REAL,
    weight REAL,
    bmi REAL,
    health_history TEXT,
    medical_restrictions TEXT,
    emergency_contact VARCHAR(100),
    emergency_phone VARCHAR(11),
    notes TEXT,
    coach_id INTEGER,
    access_mode TEXT CHECK(access_mode IN ('shared', 'exclusive')) DEFAULT 'shared',
    status INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (coach_id) REFERENCES users(id)
  )
`, (err) => {
  if (err) {
    console.error('创建会员表错误:', err)
  } else {
    console.log('✅ 会员表创建成功')
  }
})

// 创建会员教练权限关联表
db.run(`
  CREATE TABLE IF NOT EXISTS member_coach_permissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    member_id INTEGER NOT NULL,
    coach_id INTEGER NOT NULL,
    permission_type TEXT CHECK(permission_type IN ('view', 'train', 'full')) DEFAULT 'full',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE,
    FOREIGN KEY (coach_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(member_id, coach_id)
  )
`, (err) => {
  if (err) {
    console.error('创建会员教练权限表错误:', err)
  } else {
    console.log('✅ 会员教练权限表创建成功')
  }
})

// 创建训练模板表
db.run(`
  CREATE TABLE IF NOT EXISTS training_templates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(200) NOT NULL,
    category TEXT CHECK(category IN ('strength', 'comprehensive', 'functional')) NOT NULL,
    description TEXT,
    restrictions TEXT,
    creator_id INTEGER NOT NULL,
    template_content TEXT NOT NULL,
    use_count INTEGER DEFAULT 0,
    is_active INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (creator_id) REFERENCES users(id)
  )
`, (err) => {
  if (err) {
    console.error('创建训练模板表错误:', err)
  } else {
    console.log('✅ 训练模板表创建成功')
  }
})

// 创建训练日志表
db.run(`
  CREATE TABLE IF NOT EXISTS training_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    member_id INTEGER NOT NULL,
    coach_id INTEGER NOT NULL,
    training_date TEXT NOT NULL,
    template_id INTEGER,
    pre_training_status TEXT,
    completion_rate INTEGER DEFAULT 0,
    member_intensity_feeling INTEGER,
    member_difficulty_feeling INTEGER,
    member_performance_score INTEGER,
    coach_summary TEXT,
    member_rating INTEGER,
    member_feedback TEXT,
    coach_signature_data TEXT,
    member_signature_data TEXT,
    total_duration INTEGER,
    training_start_time TEXT,
    training_end_time TEXT,
    status TEXT CHECK(status IN ('draft', 'completed')) DEFAULT 'draft',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (member_id) REFERENCES members(id),
    FOREIGN KEY (coach_id) REFERENCES users(id),
    FOREIGN KEY (template_id) REFERENCES training_templates(id)
  )
`, (err) => {
  if (err) {
    console.error('创建训练日志表错误:', err)
  } else {
    console.log('✅ 训练日志表创建成功')
  }
})

// 创建训练详情表
db.run(`
  CREATE TABLE IF NOT EXISTS training_details (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    log_id INTEGER NOT NULL,
    phase TEXT CHECK(phase IN ('warmup', 'main', 'stretch')) NOT NULL,
    exercise_name VARCHAR(200) NOT NULL,
    exercise_order INTEGER NOT NULL,
    set_number INTEGER NOT NULL,
    weight_or_intensity REAL,
    weight_unit TEXT CHECK(weight_unit IN ('kg', 'percent')) DEFAULT 'kg',
    reps_or_duration INTEGER,
    duration_unit TEXT CHECK(duration_unit IN ('reps', 'seconds')) DEFAULT 'reps',
    rest_time INTEGER,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (log_id) REFERENCES training_logs(id)
  )
`, (err) => {
  if (err) {
    console.error('创建训练详情表错误:', err)
  } else {
    console.log('✅ 训练详情表创建成功')
  }
})

// 创建课程安排表
db.run(`
  CREATE TABLE IF NOT EXISTS course_schedules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    member_id INTEGER NOT NULL,
    coach_id INTEGER NOT NULL,
    schedule_date TEXT NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT,
    course_type VARCHAR(100) NOT NULL,
    template_id INTEGER,
    status TEXT CHECK(status IN ('pending', 'in_progress', 'completed', 'cancelled')) DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (member_id) REFERENCES members(id),
    FOREIGN KEY (coach_id) REFERENCES users(id),
    FOREIGN KEY (template_id) REFERENCES training_templates(id)
  )
`, (err) => {
  if (err) {
    console.error('创建课程安排表错误:', err)
  } else {
    console.log('✅ 课程安排表创建成功')
  }
})

// 创建动作表
db.run(`
  CREATE TABLE IF NOT EXISTS exercises (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(200) UNIQUE NOT NULL,
    category TEXT CHECK(category IN ('strength', 'cardio', 'flexibility', 'functional')) NOT NULL,
    description TEXT,
    target_muscles TEXT,
    difficulty_level TEXT CHECK(difficulty_level IN ('beginner', 'intermediate', 'advanced')) DEFAULT 'intermediate',
    notes TEXT,
    variable1_type TEXT CHECK(variable1_type IN ('weight', 'intensity', 'difficulty')) DEFAULT 'weight',
    variable2_type TEXT CHECK(variable2_type IN ('reps', 'duration')) DEFAULT 'reps',
    is_active INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`, (err) => {
  if (err) {
    console.error('创建动作表错误:', err)
  } else {
    console.log('✅ 动作表创建成功')
  }
})

// 插入真实用户数据
const adminPassword = bcrypt.hashSync('123liyawei', 10)
db.run(`
  INSERT OR IGNORE INTO users (username, password_hash, role, name, phone)
  VALUES (?, ?, ?, ?, ?)
`, ['liyawei123', adminPassword, 'admin', '李亚伟', '13800138000'])

// 插入真实教练用户
const coachPassword = bcrypt.hashSync('123456', 10)
const coaches = [
  ['coach001', coachPassword, 'coach', '王教练', '13800138001'],
  ['coach002', coachPassword, 'coach', '张教练', '13800138002'],
  ['coach003', coachPassword, 'coach', '刘教练', '13800138003'],
  ['coach004', coachPassword, 'coach', '陈教练', '13800138004'],
  ['coach005', coachPassword, 'coach', '赵教练', '13800138005']
]

coaches.forEach(coach => {
  db.run(`
    INSERT OR IGNORE INTO users (username, password_hash, role, name, phone)
    VALUES (?, ?, ?, ?, ?)
  `, coach)
})

// 插入真实会员数据
const realMembers = [
  ['陈志强', '13800138006', 'male', 28, 175.5, 70.2, 22.8, '无特殊病史', '无运动禁忌', '陈父', '13900139001', '健身爱好者，目标增肌'],
  ['李美玲', '13800138007', 'female', 32, 165.0, 58.5, 21.5, '无特殊病史', '无运动禁忌', '李母', '13900139002', '产后恢复，目标减脂塑形'],
  ['王建国', '13800138008', 'male', 35, 180.0, 75.0, 23.1, '高血压病史，需注意', '避免高强度运动', '王妻', '13900139003', '高血压患者，目标控制体重'],
  ['赵雅琴', '13800138009', 'female', 26, 168.0, 55.0, 19.5, '无特殊病史', '无运动禁忌', '赵父', '13900139004', '办公室白领，目标改善体态'],
  ['孙志明', '13800138010', 'male', 40, 172.0, 80.0, 27.0, '糖尿病史', '避免剧烈运动', '孙妻', '13900139005', '糖尿病患者，目标控制血糖'],
  ['周丽华', '13800138011', 'female', 29, 162.0, 52.0, 19.8, '无特殊病史', '无运动禁忌', '周母', '13900139006', '瑜伽爱好者，目标提升柔韧性'],
  ['吴建华', '13800138012', 'male', 33, 178.0, 72.0, 22.7, '无特殊病史', '无运动禁忌', '吴父', '13900139007', '篮球运动员，目标提升爆发力'],
  ['郑雅芳', '13800138013', 'female', 31, 166.0, 60.0, 21.8, '无特殊病史', '无运动禁忌', '郑母', '13900139008', '舞蹈老师，目标保持身材'],
  ['陈志豪', '13800138014', 'male', 27, 176.0, 68.0, 22.0, '无特殊病史', '无运动禁忌', '陈父', '13900139009', '学生，目标增肌减脂'],
  ['林雅婷', '13800138015', 'female', 34, 164.0, 56.0, 20.8, '无特殊病史', '无运动禁忌', '林母', '13900139010', '护士，目标缓解工作压力'],
  ['刘志强', '13800138016', 'male', 36, 179.0, 78.0, 24.3, '无特殊病史', '无运动禁忌', '刘父', '13900139011', '工程师，目标改善久坐问题'],
  ['张雅琪', '13800138017', 'female', 25, 167.0, 54.0, 19.4, '无特殊病史', '无运动禁忌', '张母', '13900139012', '设计师，目标改善颈椎问题'],
  ['王志明', '13800138018', 'male', 42, 173.0, 82.0, 27.4, '轻度脂肪肝', '避免高脂饮食', '王妻', '13900139013', '中年男性，目标改善脂肪肝'],
  ['李雅琴', '13800138019', 'female', 30, 165.0, 59.0, 21.7, '无特殊病史', '无运动禁忌', '李母', '13900139014', '教师，目标改善肩颈问题'],
  ['陈志华', '13800138020', 'male', 38, 177.0, 76.0, 24.2, '无特殊病史', '无运动禁忌', '陈父', '13900139015', '销售经理，目标提升体能']
]

realMembers.forEach((member, index) => {
  const coachId = (index % 5) + 2 // 分配给5个教练
  db.run(`
    INSERT OR IGNORE INTO members (name, phone, gender, age, height, weight, bmi, health_history, medical_restrictions, emergency_contact, emergency_phone, coach_id, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [...member, coachId])
})

// 插入真实训练动作数据
const realExercises = [
  ['深蹲', 'strength', '经典的下肢力量训练动作，主要锻炼大腿前侧肌群', '股四头肌、臀大肌、核心肌群', 'intermediate', '注意膝盖不要超过脚尖', 'weight', 'reps'],
  ['卧推', 'strength', '上肢推举动作，主要锻炼胸部肌群', '胸大肌、三角肌前束、肱三头肌', 'intermediate', '注意肩胛骨收紧', 'weight', 'reps'],
  ['硬拉', 'strength', '全身性力量训练动作，主要锻炼后链肌群', '臀大肌、腘绳肌、竖脊肌', 'advanced', '注意保持脊柱中立', 'weight', 'reps'],
  ['引体向上', 'strength', '上肢拉力动作，主要锻炼背部肌群', '背阔肌、菱形肌、肱二头肌', 'intermediate', '注意肩胛骨下沉', 'weight', 'reps'],
  ['俯卧撑', 'strength', '自重推举动作，主要锻炼胸部肌群', '胸大肌、三角肌前束、肱三头肌', 'beginner', '注意身体成一条直线', 'weight', 'reps'],
  ['平板支撑', 'functional', '核心稳定性训练动作', '腹直肌、腹外斜肌、核心肌群', 'beginner', '注意保持身体稳定', 'intensity', 'duration'],
  ['卷腹', 'strength', '腹部肌群训练动作', '腹直肌、腹外斜肌', 'beginner', '注意颈部不要用力', 'weight', 'reps'],
  ['俄罗斯转体', 'functional', '核心旋转训练动作', '腹外斜肌、腹内斜肌', 'intermediate', '注意控制旋转速度', 'intensity', 'duration'],
  ['侧平板', 'functional', '侧核心稳定性训练', '腹外斜肌、腹内斜肌', 'intermediate', '注意保持身体稳定', 'intensity', 'duration'],
  ['腿举', 'strength', '下肢推举器械训练', '股四头肌、臀大肌', 'intermediate', '注意膝盖对齐脚尖', 'weight', 'reps'],
  ['腿弯举', 'strength', '下肢拉力器械训练', '腘绳肌、腓肠肌', 'intermediate', '注意控制动作速度', 'weight', 'reps'],
  ['肩推', 'strength', '上肢推举动作，主要锻炼肩部肌群', '三角肌、肱三头肌', 'intermediate', '注意避免耸肩', 'weight', 'reps'],
  ['哑铃飞鸟', 'strength', '胸部孤立训练动作', '胸大肌、三角肌前束', 'intermediate', '注意控制动作幅度', 'weight', 'reps'],
  ['哑铃弯举', 'strength', '上肢拉力动作，主要锻炼手臂肌群', '肱二头肌、肱肌', 'beginner', '注意避免身体摆动', 'weight', 'reps'],
  ['三头肌下压', 'strength', '上肢推举动作，主要锻炼手臂后侧', '肱三头肌', 'beginner', '注意肘部固定', 'weight', 'reps'],
  ['跑步', 'cardio', '有氧运动，提升心肺功能', '全身肌群', 'beginner', '注意运动强度，循序渐进', 'intensity', 'duration'],
  ['椭圆机', 'cardio', '低冲击有氧运动', '全身肌群', 'beginner', '注意保持正确姿势', 'intensity', 'duration'],
  ['动感单车', 'cardio', '室内有氧运动', '下肢肌群', 'beginner', '注意调整座椅高度', 'intensity', 'duration'],
  ['划船机', 'cardio', '全身性有氧运动', '全身肌群', 'intermediate', '注意保持背部挺直', 'intensity', 'duration'],
  ['跳绳', 'cardio', '高效有氧运动', '下肢肌群', 'intermediate', '注意控制跳跃高度', 'intensity', 'duration'],
  ['静态拉伸', 'flexibility', '改善肌肉柔韧性', '全身肌群', 'beginner', '注意不要过度拉伸', 'intensity', 'duration'],
  ['动态拉伸', 'flexibility', '运动前热身拉伸', '全身肌群', 'beginner', '注意动作流畅', 'intensity', 'duration'],
  ['瑜伽', 'flexibility', '提升身体柔韧性', '全身肌群', 'beginner', '注意呼吸配合', 'intensity', 'duration'],
  ['普拉提', 'functional', '核心控制和身体协调训练', '核心肌群', 'intermediate', '注意控制动作质量', 'intensity', 'duration'],
  ['壶铃摆动', 'functional', '全身性功能性训练', '全身肌群', 'advanced', '注意髋关节发力', 'weight', 'reps'],
  ['TRX训练', 'functional', '悬吊训练，提升核心稳定性', '全身肌群', 'intermediate', '注意保持身体稳定', 'intensity', 'duration'],
  ['波比跳', 'functional', '全身性高强度训练', '全身肌群', 'advanced', '注意动作连贯性', 'intensity', 'duration'],
  ['开合跳', 'cardio', '简单有效的有氧运动', '全身肌群', 'beginner', '注意落地缓冲', 'intensity', 'duration'],
  ['高抬腿', 'cardio', '提升心肺功能的有氧运动', '下肢肌群', 'beginner', '注意保持上身稳定', 'intensity', 'duration'],
  ['深蹲跳', 'functional', '下肢爆发力训练', '下肢肌群', 'intermediate', '注意落地缓冲', 'weight', 'reps'],
  ['箭步蹲', 'strength', '下肢单侧力量训练', '股四头肌、臀大肌', 'intermediate', '注意前后腿角度', 'weight', 'reps']
]

realExercises.forEach(exercise => {
  db.run(`
    INSERT OR IGNORE INTO exercises (name, category, description, target_muscles, difficulty_level, notes, variable1_type, variable2_type)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `, exercise)
})

// 插入真实训练模板数据
const realTemplates = [
  {
    name: '初级力量训练',
    category: 'strength',
    description: '适合初学者的基础力量训练计划，重点培养正确的动作模式',
    restrictions: '无特殊禁忌，建议在教练指导下进行',
    creator_id: 2,
    content: {
      warmup: [
        { name: '关节活动', description: '全身关节活动，提高关节灵活性', variable1: 'intensity', variable2: 'duration' },
        { name: '轻度有氧', description: '5-10分钟轻度有氧运动', variable1: 'intensity', variable2: 'duration' }
      ],
      main: [
        { name: '深蹲', description: '基础下肢力量训练', variable1: 'weight', variable2: 'reps' },
        { name: '俯卧撑', description: '基础上肢推举训练', variable1: 'weight', variable2: 'reps' },
        { name: '平板支撑', description: '核心稳定性训练', variable1: 'intensity', variable2: 'duration' }
      ],
      stretch: [
        { name: '静态拉伸', description: '全身肌肉拉伸放松', variable1: 'intensity', variable2: 'duration' }
      ]
    }
  },
  {
    name: '中级力量训练',
    category: 'strength',
    description: '适合有一定基础的训练者，重点提升肌肉力量和体积',
    restrictions: '需要良好的动作基础，避免过度训练',
    creator_id: 3,
    content: {
      warmup: [
        { name: '动态拉伸', description: '全身动态拉伸热身', variable1: 'intensity', variable2: 'duration' },
        { name: '轻度有氧', description: '10分钟轻度有氧运动', variable1: 'intensity', variable2: 'duration' }
      ],
      main: [
        { name: '卧推', description: '上肢推举力量训练', variable1: 'weight', variable2: 'reps' },
        { name: '深蹲', description: '下肢力量训练', variable1: 'weight', variable2: 'reps' },
        { name: '硬拉', description: '全身性力量训练', variable1: 'weight', variable2: 'reps' },
        { name: '引体向上', description: '上肢拉力训练', variable1: 'weight', variable2: 'reps' }
      ],
      stretch: [
        { name: '静态拉伸', description: '重点拉伸训练肌群', variable1: 'intensity', variable2: 'duration' }
      ]
    }
  },
  {
    name: '高级力量训练',
    category: 'strength',
    description: '适合有丰富训练经验的训练者，重点提升最大力量',
    restrictions: '需要扎实的训练基础，注意安全防护',
    creator_id: 4,
    content: {
      warmup: [
        { name: '关节活动', description: '全身关节活动', variable1: 'intensity', variable2: 'duration' },
        { name: '轻度有氧', description: '15分钟轻度有氧运动', variable1: 'intensity', variable2: 'duration' },
        { name: '动态拉伸', description: '全身动态拉伸', variable1: 'intensity', variable2: 'duration' }
      ],
      main: [
        { name: '深蹲', description: '下肢最大力量训练', variable1: 'weight', variable2: 'reps' },
        { name: '卧推', description: '上肢最大力量训练', variable1: 'weight', variable2: 'reps' },
        { name: '硬拉', description: '全身最大力量训练', variable1: 'weight', variable2: 'reps' },
        { name: '肩推', description: '肩部力量训练', variable1: 'weight', variable2: 'reps' },
        { name: '腿举', description: '下肢器械训练', variable1: 'weight', variable2: 'reps' }
      ],
      stretch: [
        { name: '静态拉伸', description: '全身肌肉拉伸', variable1: 'intensity', variable2: 'duration' }
      ]
    }
  },
  {
    name: '全身综合训练',
    category: 'comprehensive',
    description: '全身性综合训练，提升整体体能和功能性',
    restrictions: '适合大多数健康人群，注意循序渐进',
    creator_id: 2,
    content: {
      warmup: [
        { name: '关节活动', description: '全身关节活动', variable1: 'intensity', variable2: 'duration' },
        { name: '轻度有氧', description: '10分钟轻度有氧运动', variable1: 'intensity', variable2: 'duration' }
      ],
      main: [
        { name: '深蹲', description: '下肢力量训练', variable1: 'weight', variable2: 'reps' },
        { name: '俯卧撑', description: '上肢推举训练', variable1: 'weight', variable2: 'reps' },
        { name: '引体向上', description: '上肢拉力训练', variable1: 'weight', variable2: 'reps' },
        { name: '平板支撑', description: '核心稳定性训练', variable1: 'intensity', variable2: 'duration' },
        { name: '跳跃深蹲', description: '爆发力训练', variable1: 'weight', variable2: 'reps' }
      ],
      stretch: [
        { name: '静态拉伸', description: '全身肌肉拉伸', variable1: 'intensity', variable2: 'duration' }
      ]
    }
  },
  {
    name: '核心力量训练',
    category: 'functional',
    description: '专注于核心肌群的训练，提升身体稳定性和控制能力',
    restrictions: '适合所有人群，注意动作质量',
    creator_id: 3,
    content: {
      warmup: [
        { name: '核心激活', description: '核心肌群激活训练', variable1: 'intensity', variable2: 'duration' },
        { name: '轻度有氧', description: '5分钟轻度有氧运动', variable1: 'intensity', variable2: 'duration' }
      ],
      main: [
        { name: '平板支撑', description: '核心稳定性训练', variable1: 'intensity', variable2: 'duration' },
        { name: '卷腹', description: '腹部肌群训练', variable1: 'weight', variable2: 'reps' },
        { name: '俄罗斯转体', description: '核心旋转训练', variable1: 'weight', variable2: 'reps' },
        { name: '侧平板', description: '侧核心稳定性训练', variable1: 'intensity', variable2: 'duration' },
        { name: '死虫式', description: '核心控制训练', variable1: 'intensity', variable2: 'duration' }
      ],
      stretch: [
        { name: '核心拉伸', description: '核心肌群拉伸', variable1: 'intensity', variable2: 'duration' }
      ]
    }
  },
  {
    name: '有氧耐力训练',
    category: 'comprehensive',
    description: '提升心肺功能和有氧耐力',
    restrictions: '适合大多数人群，注意运动强度',
    creator_id: 4,
    content: {
      warmup: [
        { name: '关节活动', description: '全身关节活动', variable1: 'intensity', variable2: 'duration' },
        { name: '轻度有氧', description: '5分钟轻度有氧运动', variable1: 'intensity', variable2: 'duration' }
      ],
      main: [
        { name: '跑步', description: '有氧耐力训练', variable1: 'intensity', variable2: 'duration' },
        { name: '椭圆机', description: '低冲击有氧训练', variable1: 'intensity', variable2: 'duration' },
        { name: '动感单车', description: '室内有氧训练', variable1: 'intensity', variable2: 'duration' },
        { name: '划船机', description: '全身有氧训练', variable1: 'intensity', variable2: 'duration' }
      ],
      stretch: [
        { name: '静态拉伸', description: '全身肌肉拉伸', variable1: 'intensity', variable2: 'duration' }
      ]
    }
  },
  {
    name: '功能性训练',
    category: 'functional',
    description: '提升日常生活和运动中的功能性动作能力',
    restrictions: '适合所有人群，注意动作质量',
    creator_id: 5,
    content: {
      warmup: [
        { name: '关节活动', description: '全身关节活动', variable1: 'intensity', variable2: 'duration' },
        { name: '动态拉伸', description: '全身动态拉伸', variable1: 'intensity', variable2: 'duration' }
      ],
      main: [
        { name: '壶铃摆动', description: '全身功能性训练', variable1: 'weight', variable2: 'reps' },
        { name: 'TRX训练', description: '悬吊功能性训练', variable1: 'intensity', variable2: 'duration' },
        { name: '波比跳', description: '高强度间歇训练', variable1: 'weight', variable2: 'reps' },
        { name: '登山者', description: '有氧核心训练', variable1: 'intensity', variable2: 'duration' },
        { name: '开合跳', description: '有氧热身训练', variable1: 'intensity', variable2: 'duration' }
      ],
      stretch: [
        { name: '静态拉伸', description: '全身肌肉拉伸', variable1: 'intensity', variable2: 'duration' }
      ]
    }
  },
  {
    name: '柔韧性训练',
    category: 'functional',
    description: '提升身体柔韧性和关节活动度',
    restrictions: '适合所有人群，注意拉伸强度',
    creator_id: 2,
    content: {
      warmup: [
        { name: '轻度有氧', description: '5分钟轻度有氧运动', variable1: 'intensity', variable2: 'duration' },
        { name: '关节活动', description: '全身关节活动', variable1: 'intensity', variable2: 'duration' }
      ],
      main: [
        { name: '静态拉伸', description: '全身静态拉伸', variable1: 'intensity', variable2: 'duration' },
        { name: '动态拉伸', description: '全身动态拉伸', variable1: 'intensity', variable2: 'duration' },
        { name: '瑜伽', description: '柔韧性训练', variable1: 'intensity', variable2: 'duration' },
        { name: '普拉提', description: '核心控制训练', variable1: 'intensity', variable2: 'duration' }
      ],
      stretch: [
        { name: '放松拉伸', description: '全身放松拉伸', variable1: 'intensity', variable2: 'duration' }
      ]
    }
  }
]

realTemplates.forEach(template => {
  db.run(`
    INSERT OR IGNORE INTO training_templates (name, category, description, restrictions, creator_id, template_content)
    VALUES (?, ?, ?, ?, ?, ?)
  `, [template.name, template.category, template.description, template.restrictions, template.creator_id, JSON.stringify(template.content)])
})

// 插入真实训练记录数据
const today = new Date().toISOString().split('T')[0]
const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0]
const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]

const realTrainingLogs = [
  [1, 2, today, 1, '状态良好，准备充分', 85, 7, 6, 8, '会员表现良好，动作标准，完成度较高', 4, '训练强度适中，感觉不错', '', '', 3600, '09:00', '10:00', 'completed'],
  [2, 3, today, 2, '略有疲劳，但状态可接受', 75, 6, 7, 7, '会员动作基本标准，需要继续改进', 3, '训练有点累，但能坚持', '', '', 3300, '14:30', '15:30', 'completed'],
  [3, 2, yesterday, 3, '状态良好，精力充沛', 90, 8, 5, 9, '会员表现优秀，动作标准，完成度很高', 5, '训练很有效果，感觉很好', '', '', 3900, '10:00', '11:00', 'completed'],
  [4, 3, yesterday, 4, '状态一般，需要调整', 70, 5, 8, 6, '会员动作需要改进，建议加强基础训练', 3, '训练有点困难，需要更多练习', '', '', 3000, '16:00', '17:00', 'completed'],
  [5, 4, twoDaysAgo, 5, '状态良好，准备充分', 80, 7, 6, 8, '会员表现稳定，动作标准', 4, '训练效果不错，继续努力', '', '', 3600, '09:30', '10:30', 'completed'],
  [6, 5, twoDaysAgo, 6, '略有疲劳，但状态可接受', 75, 6, 7, 7, '会员动作基本标准，需要继续改进', 3, '训练有点累，但能坚持', '', '', 3300, '15:00', '16:00', 'completed'],
  [7, 2, twoDaysAgo, 7, '状态良好，精力充沛', 85, 8, 5, 8, '会员表现良好，动作标准', 4, '训练很有效果，感觉不错', '', '', 3600, '11:00', '12:00', 'completed'],
  [8, 3, twoDaysAgo, 8, '状态一般，需要调整', 70, 5, 8, 6, '会员动作需要改进，建议加强基础训练', 3, '训练有点困难，需要更多练习', '', '', 3000, '17:00', '18:00', 'completed']
]

realTrainingLogs.forEach(log => {
  db.run(`
    INSERT OR IGNORE INTO training_logs (member_id, coach_id, training_date, template_id, pre_training_status, completion_rate, member_intensity_feeling, member_difficulty_feeling, member_performance_score, coach_summary, member_rating, member_feedback, coach_signature_data, member_signature_data, total_duration, training_start_time, training_end_time, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, log)
})

// 插入真实课程安排数据
const realCourseSchedules = [
  [1, 2, today, '09:00', '10:00', '力量训练', 1, 'completed', '会员表现良好，完成度90%'],
  [2, 3, today, '14:30', '15:30', '有氧训练', 2, 'pending', '新会员首次训练'],
  [3, 2, tomorrow, '10:00', '11:00', '综合训练', 5, 'pending', '常规训练'],
  [4, 3, tomorrow, '16:00', '17:00', '核心训练', 4, 'pending', '核心力量提升'],
  [5, 4, tomorrow, '09:30', '10:30', '柔韧性训练', 8, 'pending', '改善身体柔韧性'],
  [6, 5, tomorrow, '15:00', '16:00', '功能性训练', 7, 'pending', '提升功能性动作能力'],
  [7, 2, '2025-01-27', '11:00', '12:00', '力量训练', 3, 'pending', '高级力量训练'],
  [8, 3, '2025-01-27', '17:00', '18:00', '有氧训练', 6, 'pending', '有氧耐力训练']
]

realCourseSchedules.forEach(schedule => {
  db.run(`
    INSERT OR IGNORE INTO course_schedules (member_id, coach_id, schedule_date, start_time, end_time, course_type, template_id, status, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, schedule)
})

console.log('✅ 数据库初始化完成！')
console.log('👤 默认管理员账户：liyawei123 / 123liyawei')
console.log('👨‍🏫 教练账户：')
console.log('   - coach001 / 123456 (王教练)')
console.log('   - coach002 / 123456 (张教练)')
console.log('   - coach003 / 123456 (刘教练)')
console.log('   - coach004 / 123456 (陈教练)')
console.log('   - coach005 / 123456 (赵教练)')
console.log('📊 已创建15个真实会员数据')
console.log('🏋️ 已创建30个真实训练动作')
console.log('📋 已创建8个真实训练模板')
console.log('📝 已创建8条真实训练记录')
console.log('📅 已创建8个真实课程安排')

// 关闭数据库连接
db.close((err) => {
  if (err) {
    console.error('关闭数据库连接错误:', err)
  } else {
    console.log('��️ 数据库连接已关闭')
  }
}) 