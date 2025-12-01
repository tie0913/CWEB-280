<script setup>
import {computed} from 'vue'
const props = defineProps({
  title: {
    type: String,
    default: "Edit",
  },
  mode: {
    type: String,
    default: "edit",
  },
  fields:{
    type: Array,
    required: true,
  },
  modelValue: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["update:modelValue", "cancel", "submit"]);

const isEditMode = computed(() => props.mode === "edit");

const updateField = (key, value) => {
  const newModel = { ...props.modelValue, [key]: value };
  emit("update:modelValue", newModel);
};

const isDisabled = (field) =>{
    if(props.mode === 'create'){
        return field.editableOnCreate === false;
    }
    if (field.editableOnEdit === false){
        return true;
    }
    return false;
}

const onSubmit = (e) => {
  e.preventDefault();
  emit("submit");
};
</script>

<template>
  <div class="page-wrapper" @click.self="$emit('cancel')">
    <div class="form-card nes-container is-rounded">
      <div class="tab-label nes-text is-primary">
        {{ title }} - {{isEditMode ? 'Edit' : 'Create'}}
      </div>

      <form @submit="onSubmit">
        <div
          v-for="field in fields"
          :key="field.key"
          class="form-row"
        >
          <label class="label">
            {{ field.label }}:
            <span v-if="field.required" class="required">*</span>
          </label>

          <input
            v-if="['text', 'email', 'password', 'number'].includes(field.type)"
            :type="field.type"
            :required="field.required"
            :disabled="isDisabled(field)"
            :value="modelValue[field.key] ?? ''"
            @input="updateField(field.key, $event.target.value)"
            class="input"
          />

          <input
            v-else-if="field.type === 'checkbox'"
            type="checkbox"
            :disabled="isDisabled(field)"
            :checked="!!modelValue[field.key]"
            @change="updateField(field.key, $event.target.checked)"
          />

          <select
            v-else-if="field.type === 'select'"
            :disabled="isDisabled(field)"
            :required="field.required"
            :value="modelValue[field.key] ?? ''"
            @change="updateField(field.key, $event.target.value)"
            class="input"
          >
            <option
              v-for="op in field.options || []"
              :key="op.value"
              :value="op.value"
            >
              {{ op.label }}
            </option>
          </select>
        </div>

        <div class="button-row">
          <button type="button" class="nes-btn is-cancel" @click="$emit('cancel')">
            Cancel
          </button>
          <button type="submit" class="nes-btn is-success">
            {{ isEditMode ? 'Save' : 'Create' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.page-wrapper {
  position: fixed;
  inset: 0; 
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999; 
}

.form-card {
  position: relative;
  border: 2px solid #000;
  padding: 24px 40px 32px;
  min-width: 420px;
  max-width: 560px;
  max-height: 90vh;
  background: #fff8dc;
  overflow-y: auto;
  box-shadow: 0 4px 0 #c0a96e;
}

.tab-label {
  position: absolute;
  top: -18px;
  left: 16px;
  padding: 4px 16px;
  border: 2px solid #000;
  background: #fff8dc;
  font-weight: 600;
  font-size: 12px;
}

.form-row {
  display: flex;
  align-items: center;
  margin-bottom: 14px;
  gap: 8px;
}

.label {
  width: 130px;
  font-size: 13px;
}

.required {
  color: #e53935;
  margin-left: 4px;
}

.input {
  flex: 1;
  padding: 4px 6px;
  border: 1px solid #666;
  font-size: 13px;
}

.button-row {
  display: flex;
  justify-content: center;
  gap: 24px;
  margin-top: 20px;
}

.btn {
  min-width: 120px;
  padding: 8px 16px;
  border: 2px solid #000;
  background: #e0e0e0;
  cursor: pointer;
  font-size: 13px;
}

.btn.primary {
  background: #ffd54f;
  font-weight: 600;
}
</style>