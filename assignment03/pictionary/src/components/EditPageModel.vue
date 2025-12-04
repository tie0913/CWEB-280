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
        {{ title }} - {{ isEditMode ? 'Edit' : 'Create' }}
      </div>

      <form @submit="onSubmit">
        <div
          v-for="field in fields"
          :key="field.key"
          class="form-row"
          :class="{ 'checkbox-row': field.type === 'checkbox' }"
        >
          <!-- LABEL -->
          <label class="label">
            {{ field.label }}:
            <span v-if="field.required" class="required">*</span>
          </label>

          <!-- TEXT / EMAIL / PASSWORD / NUMBER -->
          <input
            v-if="['text', 'email', 'password', 'number'].includes(field.type)"
            :type="field.type"
            :required="field.required"
            :disabled="isDisabled(field)"
            :value="modelValue[field.key] ?? ''"
            @input="updateField(field.key, $event.target.value)"
            class="nes-input"
          />

          <!-- CHECKBOX (NES) -->
          <div
            v-else-if="field.type === 'checkbox'"
            class="checkbox-wrapper"
          >
            <label>
              <input
                type="checkbox"
                class="nes-checkbox"
                :disabled="isDisabled(field)"
                :checked="!!modelValue[field.key]"
                @change="updateField(field.key, $event.target.checked)"
              />
              <!-- NES cần span, không nhất thiết có text -->
              <span></span>
            </label>
          </div>

          <!-- SELECT (NES) -->
          <div
            v-else-if="field.type === 'select'"
            class="nes-select select-wrapper"
          >
            <select
              :disabled="isDisabled(field)"
              :required="field.required"
              :value="modelValue[field.key] ?? ''"
              @change="updateField(field.key, $event.target.value)"
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
        </div>

        <div class="button-row">
          <button
            type="button"
            class="nes-btn is-error"
            @click="$emit('cancel')"
          >
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
  padding: 40px 48px 32px;
  min-width: 460px;
  max-width: 640px;
  max-height: 90vh;
  background: #fff8dc;
  overflow-y: visible;
}

.tab-label {
  position: absolute;
  top: -24px;
  left: 24px;
  padding: 4px 16px;
  border: 2px solid #000;
  background: #fff8dc;
  font-weight: 600;
  font-size: 14px;
}

.form-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 14px;
}

.checkbox-row {
  align-items: center;
}

.label {
  width: 130px;
  font-size: 13px;
}

.required {
  color: #e53935;
  margin-left: 4px;
}

.checkbox-wrapper {
  flex: 1;
  display: flex;
  align-items: center;
}

.checkbox-wrapper .nes-checkbox {
  width: 18px;
  height: 18px;
  transform: scale(1.4);
  transform-origin: left center;
}

.select-wrapper {
  width: 100%;
}

.button-row {
  display: flex;
  justify-content: center;
  gap: 24px;
  margin-top: 20px;
}

</style>