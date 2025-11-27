<template>
  <!-- 这个 div 就是“父容器的占位”，尺寸由外面控制 -->
  <div class="fabric-board" ref="wrapperEl">
    <canvas ref="canvasEl"></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { Canvas, PencilBrush } from 'fabric'

const wrapperEl = ref(null)
const canvasEl = ref(null)
let fabricCanvas = null

const resizeCanvas = () => {
  if (!wrapperEl.value || !fabricCanvas) return

  // 以外层 wrapper 的实际尺寸为准
  const rect = wrapperEl.value.getBoundingClientRect()
  const width = rect.width
  const height = rect.height

  if (width === 0 || height === 0) return

  fabricCanvas.setWidth(width)
  fabricCanvas.setHeight(height)
  fabricCanvas.renderAll()
}

onMounted(async () => {
  await nextTick()

  fabricCanvas = new Canvas(canvasEl.value, {
    isDrawingMode: true,
    backgroundColor: '#ffffff',
  })

  // 明确设一个画笔
  fabricCanvas.freeDrawingBrush = new PencilBrush(fabricCanvas)
  fabricCanvas.freeDrawingBrush.color = '#000000'
  fabricCanvas.freeDrawingBrush.width = 4

  resizeCanvas()
  window.addEventListener('resize', resizeCanvas)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', resizeCanvas)
  fabricCanvas?.dispose()
})
</script>

<style scoped>
/* 关键点：这里不再写死高度，只是说“占满父容器” */
.fabric-board {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  /* 边框你可以保留也可以删 */
  border: 1px solid #ccc;
}

canvas {
  width: 100%;
  height: 100%;
  display: block;
}
</style>
