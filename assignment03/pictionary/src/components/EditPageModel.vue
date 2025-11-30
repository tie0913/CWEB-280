<script setup>
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
  <div class="page-wrapper">
    <div class="form-card">
      <div class="tab-label">
        {{ title }}
      </div>

      <form @submit="onSubmit">
        <div
          v-for="field in fields"
          :key="field.key"
          class="form-row"
        >
          <label class="label">
            {{ field.label }}:
          </label>

          <!-- TEXT / EMAIL / PASSWORD / NUMBER -->
          <input
            v-if="['text', 'email', 'password', 'number'].includes(field.type)"
            :type="field.type"
            :required="field.required"
            :disabled="isDisabled(field)"
            :value="modelValue[field.key] ?? ''"
            @input="updateField(field.key, $event.target.value)"
            class="input"
          />

          <!-- CHECKBOX -->
          <input
            v-else-if="field.type === 'checkbox'"
            type="checkbox"
            :disabled="isDisabled(field)"
            :checked="!!modelValue[field.key]"
            @change="updateField(field.key, $event.target.checked)"
          />

          <!-- SELECT -->
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
          <button type="button" class="btn" @click="$emit('cancel')">
            Cancel
          </button>
          <button type="submit" class="btn primary">
            {{ isEditMode ? 'Save' : 'Create' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.page-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 40px;
}
.form-card {
  position: relative;
  border: 1px solid #000;
  padding: 24px 40px 32px;
  min-width: 420px;
  background: #fff;
}
.tab-label {
  position: absolute;
  top: -18px;
  left: 16px;
  padding: 4px 16px;
  border: 1px solid #000;
  background: #fff;
  font-weight: 600;
}
.form-row {
  display: flex;
  align-items: center;
  margin-bottom: 14px;
}
.label {
  width: 110px;
}
.input {
  flex: 1;
  padding: 4px 6px;
  border: 1px solid #666;
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
  border: 1px solid #999;
  background: #e0e0e0;
  cursor: pointer;
}
.btn.primary {
  background: #d0d0d0;
  font-weight: 600;
}
</style>