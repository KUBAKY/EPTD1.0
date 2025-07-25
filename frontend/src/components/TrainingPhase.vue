<template>
  <div class="training-phase">
    <div class="phase-header">
      <h4>{{ getPhaseTitle() }}</h4>
      <el-button type="primary" size="small" @click="addExercise">
        <el-icon><Plus /></el-icon>
        添加动作
      </el-button>
    </div>

    <div class="exercises-container">
      <div 
        v-for="(exercise, index) in exercises" 
        :key="index"
        class="exercise-item"
      >
        <div class="exercise-header">
          <div class="exercise-name">
            <el-input 
              v-model="exercise.name" 
              placeholder="动作名称"
              size="small"
            />
          </div>
          <div class="exercise-actions">
            <el-button 
              type="danger" 
              size="small" 
              @click="removeExercise(index)"
              :icon="Delete"
            />
          </div>
        </div>

        <div class="exercise-sets">
          <div class="sets-header">
            <span>组数</span>
            <el-button 
              type="primary" 
              size="small" 
              @click="addSet(index)"
              :icon="Plus"
            />
          </div>
          
          <div class="sets-container">
            <div 
              v-for="(set, setIndex) in exercise.sets" 
              :key="setIndex"
              class="set-item"
            >
              <div class="set-number">{{ setIndex + 1 }}</div>
              
              <div class="set-inputs">
                <div class="input-group">
                  <label>重量/强度</label>
                  <div class="input-row">
                    <el-radio-group v-model="set.weightType" size="small">
                      <el-radio-button label="weight">重量</el-radio-button>
                      <el-radio-button label="intensity">强度</el-radio-button>
                    </el-radio-group>
                    <el-input-number 
                      v-model="set.weightValue" 
                      :min="0"
                      :max="set.weightType === 'weight' ? 500 : 100"
                      size="small"
                      style="width: 80px"
                    />
                    <span class="unit">{{ set.weightType === 'weight' ? 'kg' : '%' }}</span>
                  </div>
                </div>

                <div class="input-group">
                  <label>次数/时长</label>
                  <div class="input-row">
                    <el-radio-group v-model="set.repsType" size="small">
                      <el-radio-button label="reps">次数</el-radio-button>
                      <el-radio-button label="duration">时长</el-radio-button>
                    </el-radio-group>
                    <el-input-number 
                      v-model="set.repsValue" 
                      :min="0"
                      :max="set.repsType === 'reps' ? 100 : 300"
                      size="small"
                      style="width: 80px"
                    />
                    <span class="unit">{{ set.repsType === 'reps' ? '次' : '秒' }}</span>
                  </div>
                </div>

                <div class="input-group" v-if="phase === 'main'">
                  <label>休息时间</label>
                  <div class="input-row">
                    <el-input-number 
                      v-model="set.restTime" 
                      :min="0"
                      :max="300"
                      size="small"
                      style="width: 80px"
                    />
                    <span class="unit">秒</span>
                  </div>
                </div>
              </div>

              <div class="set-actions">
                <el-button 
                  type="danger" 
                  size="small" 
                  @click="removeSet(index, setIndex)"
                  :icon="Delete"
                />
              </div>
            </div>
          </div>
        </div>

        <div class="exercise-notes">
          <el-input 
            v-model="exercise.notes" 
            placeholder="备注"
            type="textarea"
            :rows="2"
            size="small"
          />
        </div>
      </div>
    </div>

    <div v-if="exercises.length === 0" class="empty-state">
      <el-empty description="暂无训练动作">
        <el-button type="primary" @click="addExercise">添加第一个动作</el-button>
      </el-empty>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { Plus, Delete } from '@element-plus/icons-vue'

interface ExerciseSet {
  weightType: 'weight' | 'intensity'
  weightValue: number
  repsType: 'reps' | 'duration'
  repsValue: number
  restTime: number
}

interface Exercise {
  name: string
  sets: ExerciseSet[]
  notes: string
}

interface Props {
  phase: 'warmup' | 'main' | 'stretch'
  exercises: Exercise[]
}

interface Emits {
  (e: 'update', phase: string, exercises: Exercise[]): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const exercises = ref<Exercise[]>([...props.exercises])

const getPhaseTitle = () => {
  const titles = {
    warmup: '热身激活',
    main: '主体训练',
    stretch: '拉伸松解'
  }
  return titles[props.phase]
}

const createDefaultSet = (): ExerciseSet => ({
  weightType: 'weight',
  weightValue: 0,
  repsType: 'reps',
  repsValue: 0,
  restTime: 60
})

const createDefaultExercise = (): Exercise => ({
  name: '',
  sets: [createDefaultSet()],
  notes: ''
})

const addExercise = () => {
  exercises.value.push(createDefaultExercise())
  emitUpdate()
}

const removeExercise = (index: number) => {
  exercises.value.splice(index, 1)
  emitUpdate()
}

const addSet = (exerciseIndex: number) => {
  exercises.value[exerciseIndex].sets.push(createDefaultSet())
  emitUpdate()
}

const removeSet = (exerciseIndex: number, setIndex: number) => {
  exercises.value[exerciseIndex].sets.splice(setIndex, 1)
  emitUpdate()
}

const emitUpdate = () => {
  emit('update', props.phase, exercises.value)
}

// 监听外部数据变化
watch(() => props.exercises, (newExercises) => {
  exercises.value = [...newExercises]
}, { deep: true })

// 监听内部数据变化
watch(exercises, () => {
  emitUpdate()
}, { deep: true })
</script>

<style scoped>
.training-phase {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.phase-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e5e5e5;
}

.phase-header h4 {
  margin: 0;
  color: #2E4057;
}

.exercises-container {
  flex: 1;
  overflow-y: auto;
  padding-right: 8px;
}

.exercise-item {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
  border: 1px solid #e5e5e5;
}

.exercise-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.exercise-name {
  flex: 1;
  margin-right: 12px;
}

.exercise-sets {
  margin-bottom: 16px;
}

.sets-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  font-weight: 500;
  color: #2E4057;
}

.sets-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.set-item {
  background: #fff;
  border-radius: 6px;
  padding: 12px;
  border: 1px solid #e5e5e5;
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.set-number {
  background: #FF6B35;
  color: #fff;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
  flex-shrink: 0;
}

.set-inputs {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.input-group label {
  font-size: 12px;
  color: #6c757d;
  font-weight: 500;
}

.input-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.unit {
  font-size: 12px;
  color: #6c757d;
  min-width: 20px;
}

.set-actions {
  flex-shrink: 0;
}

.exercise-notes {
  margin-top: 12px;
}

.empty-state {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 滚动条样式 */
.exercises-container::-webkit-scrollbar {
  width: 6px;
}

.exercises-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.exercises-container::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.exercises-container::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .set-item {
    flex-direction: column;
    gap: 8px;
  }
  
  .input-row {
    flex-wrap: wrap;
  }
  
  .set-actions {
    align-self: flex-end;
  }
}
</style> 