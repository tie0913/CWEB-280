<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { apiRequest } from '../network/Request'

import SearchBarModel from './SearchBarModel.vue'
import EditPageModel from './EditPageModel.vue'

const rawWords = ref([])
const loading = ref(false)
const errorMsg = ref('')

const viewMode = ref('list')
const editingWordId = ref(null)

const pageInfo = ref({
  no: 1,
  size: 4,
})

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
      { value: 'easy', label: 'EASY' },
      { value: 'medium', label: 'MEDIUM' },
      { value: 'hard', label: 'HARD' },
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
      { value: 'easy', label: 'EASY' },
      { value: 'medium', label: 'MEDIUM' },
      { value: 'hard', label: 'HARD' },
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

const totalPages = computed(() => {
  return Math.max(
    1,
    Math.ceil(filteredWords.value.length / pageInfo.value.size)
  )
})

const pagedWords = computed(() => {
  const start = (pageInfo.value.no - 1) * pageInfo.value.size
  const end = start + pageInfo.value.size
  return filteredWords.value.slice(start, end)
})

const loadData = async (pageNo = 1) => {
  loading.value = true
  errorMsg.value = ''
  try {

    const res = await apiRequest(`/words`, { method: 'GET' })

    console.log("DEBUG wordRes:", res)
    console.log("DEBUG body:", res.body)

 if (res.code === 0) {
      rawWords.value = res.body.list || []
      pageInfo.value.no = 1
    } else {
      errorMsg.value = res.message
    }
    console.log("DEBUG rawWord:", rawWords.value)
    console.log("DEBUG pageInfo:", pageInfo.value)
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
    difficulty: 'easy',
  }
  editingWordId.value = null
  viewMode.value = 'create'
}

const openEdit = (word) => {
  formWord.value = {
    text: word.word,
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
    const payload = {
      word: formWord.value.text,
      difficulty: formWord.value.difficulty,
    }

    if (viewMode.value === 'create') {
      await apiRequest('/words', {
        method: 'POST',
        body: JSON.stringify(payload),
      })
    } else if (viewMode.value === 'edit' && editingWordId.value) {
      await apiRequest(`/words/${editingWordId.value}`, {
        method: 'POST',
        body: JSON.stringify(payload),
      })
    }

    await loadData()
    viewMode.value = 'list'
  } catch (e) {
    console.error('Failed to save word', e)
    alert('Failed to save word')
  }
}
const nextPage = () => {
  if (pageInfo.value.no < totalPages.value) {
    pageInfo.value.no++
  }
}

const prevPage = () => {
  if (pageInfo.value.no > 1) {
    pageInfo.value.no--
  }
}
const onSearch = () =>{
  console.log('SEARCH NOW:', { ...search })
  loadData(1)
}

const onSearchModelChange = (val) => {
  Object.assign(search, val)
  pageInfo.value.no = 1
}
</script>

<template>
  <div class="admin-page">
    <section class="content">
      <div class="nes-container is-rounded search-wrapper">
        <div class="search-row">
          <SearchBarModel
            :fields="wordSearchFields"
            v-model="search"
            @update:modelValue="onSearchModelChange"
            @search="onSearch"
          />
          <button
            type="button"
            class="nes-btn is-success add-btn"
            @click="openCreate"
            aria-label="Create word"
          >
            Create
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
          <tr v-for="w in pagedWords" :key="w._id">
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

      <div v-if="totalPages > 1" class="pagination">
        <button
          class="nes-btn"
          :disabled="pageInfo.no === 1"
          @click="prevPage"
        >
          Prev
        </button>

        <span class="page-label">
          Page {{ pageInfo.no }} / {{ totalPages }}
        </span>

        <button
          class="nes-btn"
          :disabled="pageInfo.no >= totalPages"
          @click="nextPage"
        >
          Next
        </button>
      </div>
    </section>

    <div v-if="viewMode !== 'list'" class="modal-overlay">
      <div class="modal-dialog">
        <EditPageModel
          title="Word"
          :mode="viewMode === 'edit' ? 'edit' : 'create'"
          :fields="wordFormFields"
          v-model="formWord"
          @cancel="cancelForm"
          @submit="submitForm"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.admin-page {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  background: rgba(0, 0, 0, 0.35);
}

.modal-dialog {
  pointer-events: auto;
  max-width: 480px;
  width: 90%;
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

.pagination {
  margin-top: 12px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
}

.page-label {
  font-size: 12px;
}
</style>