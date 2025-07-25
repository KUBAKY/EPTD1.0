<template>
  <div class="training-complete">
    <div class="complete-summary">
      <h3>训练总结</h3>
      <div class="summary-stats">
        <div class="stat-item">
          <span class="stat-label">训练时长</span>
          <span class="stat-value">{{ formatTime(trainingData.duration) }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">开始时间</span>
          <span class="stat-value">{{ trainingData.startTime }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">结束时间</span>
          <span class="stat-value">{{ trainingData.endTime }}</span>
        </div>
      </div>
    </div>

    <el-divider />

    <div class="evaluation-section">
      <h3>训练评价</h3>
      
      <el-form :model="evaluationForm" label-width="120px">
        <el-form-item label="技术完成度">
          <el-rate 
            v-model="evaluationForm.technicalCompletion" 
            :max="5"
            show-text
            :texts="['很差', '较差', '一般', '良好', '优秀']"
          />
        </el-form-item>
        
        <el-form-item label="训练强度">
          <el-rate 
            v-model="evaluationForm.trainingIntensity" 
            :max="5"
            show-text
            :texts="['很低', '较低', '适中', '较高', '很高']"
          />
        </el-form-item>
        
        <el-form-item label="会员感受">
          <el-rate 
            v-model="evaluationForm.memberIntensity" 
            :max="5"
            show-text
            :texts="['很轻松', '较轻松', '适中', '较累', '很累']"
          />
        </el-form-item>
        
        <el-form-item label="难度评价">
          <el-rate 
            v-model="evaluationForm.memberDifficulty" 
            :max="5"
            show-text
            :texts="['很简单', '较简单', '适中', '较难', '很难']"
          />
        </el-form-item>
        
        <el-form-item label="教练总结">
          <el-input 
            v-model="evaluationForm.coachSummary" 
            type="textarea" 
            :rows="3"
            placeholder="请输入训练总结和下次训练建议..."
          />
        </el-form-item>
        
        <el-form-item label="会员反馈">
          <el-input 
            v-model="evaluationForm.memberFeedback" 
            type="textarea" 
            :rows="3"
            placeholder="请输入会员反馈..."
          />
        </el-form-item>
      </el-form>
    </div>

    <el-divider />

    <div class="signature-section">
      <h3>签名确认</h3>
      <div class="signature-container">
        <div class="signature-item">
          <label>教练签名</label>
          <div class="signature-pad">
            <canvas 
              ref="coachSignatureCanvas"
              @mousedown="startDrawing"
              @mousemove="draw"
              @mouseup="stopDrawing"
              @mouseleave="stopDrawing"
              width="200"
              height="100"
              style="border: 1px solid #ddd; cursor: crosshair;"
            ></canvas>
            <el-button size="small" @click="clearSignature('coach')">清除</el-button>
          </div>
        </div>
        
        <div class="signature-item">
          <label>会员签名</label>
          <div class="signature-pad">
            <canvas 
              ref="memberSignatureCanvas"
              @mousedown="startDrawing"
              @mousemove="draw"
              @mouseup="stopDrawing"
              @mouseleave="stopDrawing"
              width="200"
              height="100"
              style="border: 1px solid #ddd; cursor: crosshair;"
            ></canvas>
            <el-button size="small" @click="clearSignature('member')">清除</el-button>
          </div>
        </div>
      </div>
    </div>

    <div class="action-buttons">
      <el-button @click="$emit('cancel')">取消</el-button>
      <el-button type="primary" @click="saveTraining">保存训练记录</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'

interface TrainingData {
  duration: number
  startTime: string
  endTime: string
  exercises: any
}

interface Props {
  trainingData: TrainingData
}

interface Emits {
  (e: 'save-training', data: any): void
  (e: 'cancel'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const evaluationForm = reactive({
  technicalCompletion: 3,
  trainingIntensity: 3,
  memberIntensity: 3,
  memberDifficulty: 3,
  coachSummary: '',
  memberFeedback: ''
})

const coachSignatureCanvas = ref<HTMLCanvasElement>()
const memberSignatureCanvas = ref<HTMLCanvasElement>()

let isDrawing = false
let currentCanvas: HTMLCanvasElement | null = null
let ctx: CanvasRenderingContext2D | null = null

const formatTime = (seconds: number) => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

const startDrawing = (event: MouseEvent) => {
  isDrawing = true
  currentCanvas = event.target as HTMLCanvasElement
  ctx = currentCanvas.getContext('2d')
  if (ctx) {
    ctx.beginPath()
    ctx.moveTo(event.offsetX, event.offsetY)
  }
}

const draw = (event: MouseEvent) => {
  if (!isDrawing || !ctx) return
  ctx.lineTo(event.offsetX, event.offsetY)
  ctx.stroke()
}

const stopDrawing = () => {
  isDrawing = false
}

const clearSignature = (type: 'coach' | 'member') => {
  const canvas = type === 'coach' ? coachSignatureCanvas.value : memberSignatureCanvas.value
  if (canvas) {
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
    }
  }
}

const saveTraining = () => {
  // 获取签名数据
  const coachSignature = coachSignatureCanvas.value?.toDataURL() || ''
  const memberSignature = memberSignatureCanvas.value?.toDataURL() || ''
  
  const trainingRecord = {
    ...evaluationForm,
    coachSignature,
    memberSignature
  }
  
  emit('save-training', trainingRecord)
}

onMounted(() => {
  // 初始化画布
  if (coachSignatureCanvas.value) {
    const ctx = coachSignatureCanvas.value.getContext('2d')
    if (ctx) {
      ctx.strokeStyle = '#000'
      ctx.lineWidth = 2
    }
  }
  
  if (memberSignatureCanvas.value) {
    const ctx = memberSignatureCanvas.value.getContext('2d')
    if (ctx) {
      ctx.strokeStyle = '#000'
      ctx.lineWidth = 2
    }
  }
})
</script>

<style scoped>
.training-complete {
  padding: 20px;
}

.complete-summary h3,
.evaluation-section h3,
.signature-section h3 {
  margin: 0 0 16px 0;
  color: #2E4057;
}

.summary-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.stat-item {
  text-align: center;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
}

.stat-label {
  display: block;
  font-size: 12px;
  color: #6c757d;
  margin-bottom: 4px;
}

.stat-value {
  display: block;
  font-size: 16px;
  font-weight: bold;
  color: #2E4057;
}

.evaluation-section {
  margin: 20px 0;
}

.signature-section {
  margin: 20px 0;
}

.signature-container {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.signature-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.signature-item label {
  font-size: 14px;
  color: #2E4057;
  font-weight: 500;
}

.signature-pad {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.action-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 20px;
}
</style> 