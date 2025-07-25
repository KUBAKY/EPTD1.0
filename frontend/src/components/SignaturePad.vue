<template>
  <div class="signature-pad-container">
    <canvas 
      ref="canvasRef" 
      class="signature-canvas"
      :width="canvasWidth"
      :height="canvasHeight"
      @touchstart="handleTouchStart"
      @touchmove="handleTouchMove"
      @touchend="handleTouchEnd"
      @mousedown="handleMouseDown"
      @mousemove="handleMouseMove"
      @mouseup="handleMouseUp"
      @mouseleave="handleMouseLeave"
    ></canvas>
    <div class="signature-controls">
      <el-button size="small" @click="clear">清除</el-button>
      <el-button size="small" @click="undo" :disabled="!canUndo">撤销</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import SignaturePad from 'signature_pad'

interface Props {
  width?: number
  height?: number
  penColor?: string
  backgroundColor?: string
  minWidth?: number
  maxWidth?: number
}

const props = withDefaults(defineProps<Props>(), {
  width: 300,
  height: 150,
  penColor: '#000000',
  backgroundColor: '#ffffff',
  minWidth: 0.5,
  maxWidth: 2.5
})

const emit = defineEmits<{
  (e: 'change', isEmpty: boolean): void
  (e: 'data', data: string): void
}>()

const canvasRef = ref<HTMLCanvasElement>()
const signaturePad = ref<SignaturePad | null>(null)
const canvasWidth = ref(props.width)
const canvasHeight = ref(props.height)
const canUndo = ref(false)

// 触摸事件处理
const handleTouchStart = (event: TouchEvent) => {
  event.preventDefault()
  if (signaturePad.value) {
    signaturePad.value.onTouchStart(event)
  }
}

const handleTouchMove = (event: TouchEvent) => {
  event.preventDefault()
  if (signaturePad.value) {
    signaturePad.value.onTouchMove(event)
  }
}

const handleTouchEnd = (event: TouchEvent) => {
  event.preventDefault()
  if (signaturePad.value) {
    signaturePad.value.onTouchEnd(event)
    updateUndoState()
    emitChange()
  }
}

// 鼠标事件处理
const handleMouseDown = (event: MouseEvent) => {
  if (signaturePad.value) {
    signaturePad.value.onMouseDown(event)
  }
}

const handleMouseMove = (event: MouseEvent) => {
  if (signaturePad.value) {
    signaturePad.value.onMouseMove(event)
  }
}

const handleMouseUp = (event: MouseEvent) => {
  if (signaturePad.value) {
    signaturePad.value.onMouseUp(event)
    updateUndoState()
    emitChange()
  }
}

const handleMouseLeave = (event: MouseEvent) => {
  if (signaturePad.value) {
    signaturePad.value.onMouseLeave(event)
  }
}

// 清除签字
const clear = () => {
  if (signaturePad.value) {
    signaturePad.value.clear()
    updateUndoState()
    emitChange()
  }
}

// 撤销
const undo = () => {
  if (signaturePad.value) {
    signaturePad.value.undo()
    updateUndoState()
    emitChange()
  }
}

// 获取签字数据
const getData = () => {
  if (signaturePad.value) {
    return signaturePad.value.toDataURL()
  }
  return ''
}

// 设置签字数据
const setData = (data: string) => {
  if (signaturePad.value) {
    signaturePad.value.fromDataURL(data)
    updateUndoState()
    emitChange()
  }
}

// 检查是否为空
const isEmpty = () => {
  if (signaturePad.value) {
    return signaturePad.value.isEmpty()
  }
  return true
}

// 更新撤销状态
const updateUndoState = () => {
  if (signaturePad.value) {
    canUndo.value = signaturePad.value.toData().length > 0
  }
}

// 发送变化事件
const emitChange = () => {
  const isEmptyState = isEmpty()
  emit('change', isEmptyState)
  if (!isEmptyState) {
    emit('data', getData())
  }
}

// 暴露方法给父组件
defineExpose({
  clear,
  undo,
  getData,
  setData,
  isEmpty
})

onMounted(async () => {
  await nextTick()
  
  if (canvasRef.value) {
    // 设置canvas的实际尺寸
    const canvas = canvasRef.value
    const ctx = canvas.getContext('2d')
    
    if (ctx) {
      // 获取设备像素比
      const dpr = window.devicePixelRatio || 1
      const rect = canvas.getBoundingClientRect()
      
      // 设置canvas的实际尺寸
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      
      // 缩放绘图上下文
      ctx.scale(dpr, dpr)
      
      // 设置canvas的CSS尺寸
      canvas.style.width = rect.width + 'px'
      canvas.style.height = rect.height + 'px'
    }
    
    // 初始化SignaturePad
    signaturePad.value = new SignaturePad(canvas, {
      backgroundColor: props.backgroundColor,
      penColor: props.penColor,
      minWidth: props.minWidth,
      maxWidth: props.maxWidth,
      throttle: 16, // 60fps
      velocityFilterWeight: 0.7
    })
    
    // 监听签字变化
    signaturePad.value.addEventListener('beginStroke', () => {
      updateUndoState()
    })
    
    signaturePad.value.addEventListener('endStroke', () => {
      updateUndoState()
      emitChange()
    })
  }
})

onUnmounted(() => {
  if (signaturePad.value) {
    signaturePad.value.removeEventListener('beginStroke', () => {})
    signaturePad.value.removeEventListener('endStroke', () => {})
  }
})
</script>

<style scoped>
.signature-pad-container {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.signature-canvas {
  width: 100%;
  height: 120px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  background: white;
  /* 优化触摸精度 */
  touch-action: none;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  cursor: crosshair;
  /* 提升触摸精准度 */
  -webkit-tap-highlight-color: transparent;
  outline: none;
  /* 添加硬件加速 */
  -webkit-transform: translateZ(0);
  transform: translateZ(0);
  /* 优化像素密度 */
  image-rendering: -webkit-optimize-contrast;
  image-rendering: crisp-edges;
  /* 防止缩放 */
  -webkit-text-size-adjust: none;
  -moz-text-size-adjust: none;
  -ms-text-size-adjust: none;
  text-size-adjust: none;
  /* 提升触摸响应 */
  -webkit-overflow-scrolling: touch;
  overflow-scrolling: touch;
}

.signature-controls {
  display: flex;
  gap: 8px;
  justify-content: flex-start;
}

/* 平板适配 */
@media (max-width: 768px) {
  .signature-canvas {
    height: 100px;
  }
  
  .signature-controls {
    flex-direction: column;
  }
}
</style> 