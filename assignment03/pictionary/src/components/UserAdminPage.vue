<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { apiRequest } from '../network/Request'

import SearchBarModel from './SearchBarModel.vue'
import EditPageModel from './EditPageModel.vue'

const rawUsers = ref([])

const loading = ref(false)
const errorMsg = ref('')

const viewMode = ref('list')
const editingUserId = ref(null)    

const pageInfo = ref({
  no: 1,
  size: 20,
  totalPages: 1,
})

const search = reactive({
  name: '',
  email: '',
  admin: 'any',
})

const userSearchFields = [
  { key: 'name', label: 'Name', type: 'text', width: '30%' },
  { key: 'email', label: 'Email', type: 'text', width: '30%' },
  {
    key: 'admin',
    label: 'IsAdmin',
    type: 'select',
    options: [
      { value: 'any', label: 'Any' },
      { value: '1', label: 'True' },
      { value: '0', label: 'False' },
    ],
  }
]

const formUser = ref({
  name: '',
  email: '',
  password: '',
  admin: false,
})

const userFormFields = [
  {
    key: 'name',
    label: 'Name',
    type: 'text',
    required: true,
  },
  {
    key: 'email',
    label: 'Email',
    type: 'email',
    required: true,
    editableOnEdit: false,
  },
  {
    key: 'password',
    label: 'Password',
    type: 'password',
    required: false,
  },
  {
    key: 'admin',
    label: 'Admin Permit',
    type: 'checkbox',
    editableOnEdit: false,
  },
]

const filteredUsers = computed(() => {
  const nameSearch = search.name.trim().toLowerCase()
  const emailSearch = search.email.trim().toLowerCase()

  return rawUsers.value.filter((u) => {
    if (nameSearch && !u.name.toLowerCase().includes(nameSearch)) return false
    if (emailSearch && !u.email.toLowerCase().includes(emailSearch)) return false

    if (search.admin !== 'any') {
      const wantAdmin = search.admin === '1'
      if (!!u.admin !== wantAdmin) return false
    }

    return true
  })
})

const loadData = async (pageNo = 1) => {
  loading.value = true
  errorMsg.value = ''
  try {
    const params = new URLSearchParams()
    params.set('page[mp]', String(pageNo))                
    params.set('page[size]', String(pageInfo.value.size)) 

    if (search.name.trim()) {
      params.set('filter[name]', search.name.trim()) 
    }

    const usersRes = await apiRequest(`/users/list?${params.toString()}`, {
      method: 'GET',
    })
  

    console.log("DEBUG usersRes:", usersRes)
    console.log("DEBUG body:", usersRes.body)

    if(usersRes.code === 0){
      rawUsers.value = usersRes.body.list
      pageInfo.value = usersRes.body.page
    }else{
      errorMsg.value = usersRes.message
    }
    console.log("DEBUG rawUsers:", rawUsers.value)
    console.log("DEBUG pageInfo:", pageInfo.value)
    
  } catch (e) {
    console.error(e)
    errorMsg.value = 'Failed to load users or rooms.'
  } finally {
    loading.value = false
  }
}

onMounted(loadData)

const openCreate = () => {
  formUser.value = {
    name: '',
    email: '',
    password: '',
    admin: false,
  }
  editingUserId.value = null
  viewMode.value = 'create'
}

const openEdit = (user) => {
  formUser.value = {
    name: user.name,
    email: user.email,
    password: '',
    admin: user.admin,
  }
  editingUserId.value = user._id
  viewMode.value = 'edit'
}

const cancelForm = () => {
  viewMode.value = 'list'
}

const submitForm = async () => {
  try {
    if (viewMode.value === 'create') {
      await apiRequest('/auth/signup', {
        method: 'POST',
        data: formUser.value,
      })
    } else if (viewMode.value === 'edit' && editingUserId.value) {
      await apiRequest(`/users/${editingUserId.value}`, {
        method: 'PUT',
        data: formUser.value,
      })
    }

    await loadData()
    viewMode.value = 'list'
  } catch (e) {
    console.error('Failed to save user', e)
    alert('Failed to save user')
  }
}

const goToPage = (page) => {
  if (page < 1 || page > pageInfo.value.totalPages) return
  loadData(page)
}

const nextPage = () => {
  goToPage(pageInfo.value.no + 1)
}

const prevPage = () => {
  goToPage(pageInfo.value.no - 1)
}

const onSearch = () =>{
  console.log('SEARCH NOW:', { ...search })
  loadData(1)
}

const onSearchModelChange = (val) =>{
  Object.assign(search, val)
}
</script>


<template>
  <div class="admin-page">
    <section v-if="viewMode === 'list'" class="content">
      <div class="nes-container is-rounded search-wrapper">
        <div class="search-row">
          <SearchBarModel
            :fields="userSearchFields"
            v-model="search"
            @update:modelValue="onSearchModelChange"
            @search="onSearch"/>
          <button
            type="button"
            class="nes-btn is-success add-btn"
            @click="openCreate"
            aria-label="Create user"
          >
            Create
          </button>
        </div>
      </div>

      <p v-if="errorMsg" class="nes-text is-error">{{ errorMsg }}</p>
      <p v-else-if="loading">Loading...</p>

      <table v-else class="nes-table is-bordered is-centered user-table">
        <thead>
          <tr>
            <th>User ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>IsAdmin</th>
            <!-- <th>Playing At</th> -->
            <th>Edit</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="u in filteredUsers" :key="u._id">
            <td>{{ u._id }}</td>
            <td>{{ u.name }}</td>
            <td>{{ u.email }}</td>
            <td>{{ u.admin ? 'Yes' : 'No' }}</td>
            <!-- <td>{{ u.playingAt || '—' }}</td> -->
            <td class="edit-cell">
              <button
                class="nes-btn is-primary edit-btn"
                type="button"
                @click="openEdit(u)"
              >
                <i class="nes-icon pen is-small"></i>
              </button>
            </td>
          </tr>

          <tr v-if="!filteredUsers.length">
            <td colspan="6" class="empty-row">
              No users match current filters.
            </td>
          </tr>
        </tbody>
      </table>

      <div
        v-if="pageInfo.totalPages > 1"
        class="pagination"
      >
        <button
          class="nes-btn"
          :disabled="pageInfo.no === 1"
          @click="prevPage"
        >
          Prev
        </button>

        <span class="page-label">
          Page {{ pageInfo.no }} / {{ pageInfo.totalPages }}
        </span>

        <button
          class="nes-btn"
          :disabled="pageInfo.no === pageInfo.totalPages"
          @click="nextPage"
        >
          Next
        </button>
      </div>
    </section>

    <section v-else class="content">
      <EditPageModel
        title="User"
        :mode="viewMode === 'edit' ? 'edit' : 'create'"
        :fields="userFormFields"
        v-model="formUser"
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

.hint {
  font-size: 11px;
  margin-top: 4px;
  margin-bottom: 10px;
}

.user-table {
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