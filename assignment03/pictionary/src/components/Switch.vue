<template>
  <label class="nes-switch" :class="{ 'is-disabled': disabled }">
    <span
      class="nes-text is-primary switch-label"
    >
      {{ label }}
    </span>

    <input
      type="checkbox"
      v-model="checked"
      :disabled="disabled"
      @change="onChange"
    />

    <span class="slider"></span>

  </label>
</template>

<script setup>
import {computed} from 'vue'
import { useModeStore } from '../stores/ModeStore'

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true
  },
  labelPosition: {
    type: String,
    default: 'right' 
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

const label = computed(() => useModeStore().get())
const isAdmin = computed(() => useModeStore().isAdminMode())

const emit = defineEmits(['update:modelValue'])

const onChange = (event) => {
  useModeStore().toggle()
  const target = event.target
  emit('update:modelValue', target.checked)
}

// ⭐ 核心！这个 checked 是 UI <-> store 的“桥梁”
const checked = computed({
  // 页面加载 / 刷新时，就根据 store 的 isAdminMode 来决定是否勾选
  // 如果你想：勾选 = admin，在右边，就这样：
  get: () => useModeStore().isAdminMode(),

  // 如果你想：勾选 = normal，admin 在左边，可以写成：
  // get: () => !modeStore.isAdminMode(),

  /*
  // 当用户手动点击切换时：更新 store + 通知父组件
  set: (value) => {
    // 设置 store 里的模式：value 为 true/false
    // 这里用 setMode 比 toggle 更安全，不会乱套
    useModeStore().setMode(value)

    // 同步给父组件（如果父组件用了 v-model）
    emit('update:modelValue', value)
  }*/
})

</script>

<style scoped>
.nes-switch {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  user-select: none;
}

.switch-label {
  font-size: 12px;
}

.nes-switch input {
  display: none;
}

.slider {
  position: relative;
  width: 60px;
  height: 28px;
  background: #d3d3d3;
  border: 3px solid #000;
  image-rendering: pixelated;
  transition: background 0.15s ease, box-shadow 0.15s ease;
}

.slider::before {
  content: "";
  position: absolute;
  width: 26px;
  height: 26px;
  left: -1px;
  bottom: -1px;
  background: #fff;
  border: 3px solid #000;
  image-rendering: pixelated;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.nes-switch input:checked + .slider {
  background: #92cc41;
}

.nes-switch input:checked + .slider::before {
  transform: translateX(32px);
}

</style>
