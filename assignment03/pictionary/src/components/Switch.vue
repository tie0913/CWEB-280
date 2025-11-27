<template>
  <label class="nes-switch" :class="{ 'is-disabled': disabled }">
    <span
      class="nes-text is-primary switch-label"
    >
      {{ label }}
    </span>

    <input
      type="checkbox"
      :checked="checked"
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
  labelPosition: {
    type: String,
    default: 'right' 
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

const modeStore = useModeStore()

const label = computed(() => modeStore.mode)
const emit = defineEmits(['update:modelValue'])
const onChange = (event) => {
  modeStore.toggle()
  const target = event.target
  emit('update:modelValue', target.checked)
}

const checked = computed(() => modeStore.isAdminMode)

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
