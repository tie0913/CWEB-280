<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { apiRequest } from '@/network/Request'

import AdminHeader from './AdminHeader.vue'
import SearchBarModel from './SearchBarModel.vue'
import EditPageModel from './EditPageModel.vue'

const rawWords = ref([])
const loading = ref(false)
const errorMsg = ref('')

const viewMode = ref('list')
const editingWordId = ref(null)

const search = reactive({
  text: '',
  difficulty: 'any',
});

const wordSearchFields = [
  {
    key: 'text',
    label: 'Word',
    type: 'text',
    width: '40%',
  },
  {
    key: 'difficulty',
    label: 'Difficulty',
    type: 'select',
    options: [
      { value: 'any', label: 'Any' },
      { value: 'EASY', label: 'EASY' },
      { value: 'MEDIUM', label: 'MEDIUM' },
      { value: 'HARD', label: 'HARD' },
    ],
  },
]

const formWord = ref({
  text: '',
  difficulty: 'EASY',
});

const wordFormFields = [
  {
    key: 'text',
    label: 'Word',
    type: 'text',
    required: true,
  },
  {
    key: 'difficulty',
    label: 'Difficulty',
    type: 'select',
    options: [
      { value: 'EASY', label: 'EASY' },
      { value: 'MEDIUM', label: 'MEDIUM' },
      { value: 'HARD', label: 'HARD' },
    ],
  },
]

const filteredWords = computed(() => {
  const textSearch = search.text.trim().toLowerCase()

  return rawWords.value.filter((w) => {
    if (textSearch && !String(w.word || '').toLowerCase().includes(textSearch)) {
      return false
    }

    if (search.difficulty !== 'any') {
      if (w.difficulty !== search.difficulty) return false
    }

    return true
  })
})

const loadData = async () => {
  loading.value = true
  errorMsg.value = ''
  try {
    const res = await apiRequest('/admin/words', { method: 'GET' })
    rawWords.value = res.data || []
  } catch (e) {
    console.error(e)
    errorMsg.value = 'Failed to load words.'
  } finally {
    loading.value = false
  }
}

onMounted(loadData)

const openCreate = () => {
  formWord.value = {
    word: '',
    difficulty: 'EASY',
  }
  editingWordId.value = null
  viewMode.value = 'create'
}

const openEdit = (word) => {
  formWord.value = {
    word: word.word,
    difficulty: word.difficulty,
  }
  editingWordId.value = word._id
  viewMode.value = 'edit'
}

const cancelForm = () => {
  viewMode.value = 'list'
}

const submitForm = async () => {
  try {
    if (viewMode.value === 'create') {
      await apiRequest('/admin/words', {
        method: 'POST',
        data: formWord.value,
      })
    } else if (viewMode.value === 'edit' && editingWordId.value) {
      await apiRequest(`/admin/words/${editingWordId.value}`, {
        method: 'PUT',
        data: formWord.value,
      })
    }

    await loadData()
    viewMode.value = 'list'
  } catch (e) {
    console.error('Failed to save word', e)
    alert('Failed to save word')
  }
}
</script>

<template>
  <div class="admin-page">
    <AdminHeader active-tab="words" />

    <!-- LIST VIEW -->
    <section v-if="viewMode === 'list'" class="content">
      <div class="nes-container is-rounded search-wrapper">
        <div class="search-row">
          <SearchBarModel :fields="wordSearchFields" v-model="search" />

          <button
            type="button"
            class="nes-btn is-success add-btn"
            @click="openCreate"
            aria-label="Create word"
          >
            <i class="nes-icon plus is-small"></i>
          </button>
        </div>
      </div>

      <p v-if="errorMsg" class="nes-text is-error">{{ errorMsg }}</p>
      <p v-else-if="loading">Loading...</p>

      <table v-else class="nes-table is-bordered is-centered word-table">
        <thead>
          <tr>
            <th>Word ID</th>
            <th>Word</th>
            <th>Difficulty</th>
            <th>Edit</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="w in filteredWords" :key="w._id">
            <td>{{ w._id }}</td>
            <td>{{ w.word }}</td>
            <td>{{ w.difficulty }}</td>
            <td class="edit-cell">
              <button
                class="nes-btn is-primary edit-btn"
                type="button"
                @click="openEdit(w)"
              >
                <i class="nes-icon pen is-small"></i>
              </button>
            </td>
          </tr>

          <tr v-if="!filteredWords.length">
            <td colspan="4" class="empty-row">
              No words match current filters.
            </td>
          </tr>
        </tbody>
      </table>
    </section>

    <section v-else class="content">
      <EditPageModel
        title="Word"
        :mode="viewMode === 'edit' ? 'edit' : 'create'"
        :fields="wordFormFields"
        v-model="formWord"
        @cancel="cancelForm"
        @submit="submitForm"
      />
    </section>
  </div>
</template>

<style scoped>
.admin-page {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.content {
  padding: 16px;
}

.search-wrapper {
  margin-bottom: 8px;
}

.search-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.search-row > :first-child {
  flex: 1;
}

.add-btn {
  padding: 0 10px;
}

.word-table {
  width: 100%;
}

.edit-cell {
  text-align: center;
}

.edit-btn {
  padding: 0 8px;
}

.empty-row {
  text-align: center;
  font-style: italic;
}
</style>