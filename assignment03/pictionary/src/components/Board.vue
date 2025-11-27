<template>
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
.fabric-board {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  border: 1px solid #ccc;
}

canvas {
  width: 100%;
  height: 100%;
  display: block;
}
</style>
