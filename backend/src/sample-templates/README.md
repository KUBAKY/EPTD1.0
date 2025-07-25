# Excel导入模板说明

## 会员信息模板 (members_template_optimized.xlsx)

### 必填字段：
- 姓名：会员姓名
- 手机号：11位手机号码
- 性别：male(男) 或 female(女)
- 年龄：数字，1-120

### 可选字段：
- 身高(cm)：数字，50-250
- 体重(kg)：数字，20-300
- 健康历史：文本描述
- 运动禁忌：文本描述
- 紧急联系人：联系人姓名
- 紧急电话：联系电话
- 备注：其他备注信息
- 访问模式：shared(共享) 或 exclusive(专属)
- 教练用户名：已存在的教练用户名

### 示例数据：
- 张三，13800138001，male，28，175.5，70.2，无特殊病史，无运动禁忌，张父，13900139001，健身爱好者，shared，coach001

---

## 教练信息模板 (coaches_template_optimized.xlsx)

### 必填字段：
- 用户名：唯一用户名
- 姓名：教练姓名
- 密码：登录密码
- 角色：coach(教练) 或 admin(管理员)
- 手机号：11位手机号码
- 状态：1(活跃) 或 0(非活跃)

### 示例数据：
- coach001，王教练，123456，coach，13800138001，1

---

## 训练模板模板 (templates_template_optimized.xlsx)

### 必填字段：
- 模板名称：模板名称
- 模板分类：strength(力量) / comprehensive(综合) / functional(功能)
- 功能说明：模板功能描述
- 禁忌条件：使用禁忌
- 训练内容：JSON格式的训练内容

### 训练内容JSON格式：
```json
{
  "warmup": [
    {
      "name": "动作名称",
      "description": "动作描述",
      "variable1": "weight|intensity|difficulty",
      "variable2": "reps|duration"
    }
  ],
  "main": [...],
  "stretch": [...]
}
```

---

## 训练动作模板 (exercises_template_optimized.xlsx)

### 必填字段：
- 动作名称：动作名称
- 类别：strength(力量) / cardio(有氧) / flexibility(柔韧) / functional(功能)
- 描述：动作描述
- 目标肌群：主要锻炼的肌群
- 难度等级：beginner(初级) / intermediate(中级) / advanced(高级)
- 注意事项：动作注意事项
- 变量1类型：weight(重量) / intensity(强度) / difficulty(难度)
- 变量2类型：reps(次数) / duration(时长)

### 示例数据：
- 深蹲，strength，经典的下肢力量训练动作，股四头肌、臀大肌、核心肌群，intermediate，注意膝盖不要超过脚尖，weight，reps

---

## 使用说明

1. 下载对应的Excel模板
2. 按照模板格式填写数据
3. 保存为.xlsx格式
4. 在系统中上传文件进行批量导入
5. 查看导入结果，确认成功导入的数据

## 注意事项

- 请严格按照模板格式填写，不要修改表头
- 必填字段不能为空
- 数据格式要符合要求（如手机号11位、年龄数字等）
- 训练模板的训练内容必须是有效的JSON格式
- 教练用户名必须是系统中已存在的用户名
