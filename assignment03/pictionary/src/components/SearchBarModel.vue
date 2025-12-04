<script setup>
const props = defineProps({
  fields: {
    type: Array,
    required: true,
  },
  modelValue: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["update:modelValue", "search"]);

const updateField = (key, value) => {
  const newModel = { ...props.modelValue, [key]: value };
  emit("update:modelValue", newModel);
};

const onSubmit = (e) => {
  e.preventDefault();
  emit("search");
};
</script>

<template>
  <form class="search-bar" @submit="onSubmit">
    <div
      v-for="field in fields"
      :key="field.key"
      class="nes-field is-inline search-field"
      :style="{ width: field.width || 'auto' }"
    >
      <label>{{ field.label }}</label>

      <input
        v-if="field.type === 'text'"
        type="text"
        :value="modelValue[field.key]"
        @input="updateField(field.key, $event.target.value)"
        class ="nes-input is-dark"
      />

      <select
        v-else-if="field.type === 'select'"
        :value="modelValue[field.key]"
        @change="updateField(field.key, $event.target.value)"
      >
        <option v-for="op in field.options" :key="op.value" :value="op.value">
          {{ op.label }}
        </option>
      </select>
    </div>
  </form>
</template>

<style scoped>
.search-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 8px;
  border: 1px solid #ccc;
}

.search-field {
  display: flex;
  flex-direction: column;
  font-size: 16px;
}

.search-btn {
  padding: 6px 16px;
}
</style>
