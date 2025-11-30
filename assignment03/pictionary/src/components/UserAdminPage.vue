<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { apiRequest } from '@/network/Request'

import AdminHeader from './AdminHeader.vue'
import SearchBarModel from './SearchBarModel.vue'
import EditPageModel from './EditPageModel.vue'

const rawUsers = ref([])
const rawRooms = ref([])

const loading = ref(false)
const errorMsg = ref('')

const viewMode = ref('list')
const editingUserId = ref(null)    

const search = reactive({
  name: '',
  email: '',
  admin: 'any',
  online: 'any',
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
  },
  {
    key: 'online',
    label: 'IsOnline',
    type: 'select',
    options: [
      { value: 'any', label: 'Any' },
      { value: '1', label: 'Online' },
      { value: '0', label: 'Offline' },
    ],
  },
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

const usersWithStatus = computed(() => {
  return rawUsers.value.map((user) => {
    const activeRoom = rawRooms.value.find((room) => {
      if (!room.isOnGoing) return false
      if (!Array.isArray(room.members)) return false
      return room.members.some((m) => m._id === user._id)
    })

    const playingAt = activeRoom ? activeRoom.name || activeRoom._id : null
    const isOnline = !!playingAt

    return { ...user, playingAt, isOnline }
  })
})

const filteredUsers = computed(() => {
  const nameSearch = search.name.trim().toLowerCase()
  const emailSearch = search.email.trim().toLowerCase()

  return usersWithStatus.value.filter((u) => {
    if (nameSearch && !u.name.toLowerCase().includes(nameSearch)) return false
    if (emailSearch && !u.email.toLowerCase().includes(emailSearch)) return false

    if (search.admin !== 'any') {
      const wantAdmin = search.admin === '1'
      if (!!u.admin !== wantAdmin) return false
    }

    if (search.online !== 'any') {
      const wantOnline = search.online === '1'
      if (!!u.isOnline !== wantOnline) return false
    }

    return true
  })
})

const loadData = async () => {
  loading.value = true
  errorMsg.value = ''
  try {
    const [usersRes, roomsRes] = await Promise.all([
      apiRequest('/admin/users'),
      apiRequest('/admin/rooms'),
    ])

    rawUsers.value = usersRes.data || []
    rawRooms.value = roomsRes.data || []
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
      await apiRequest('/admin/users', {
        method: 'POST',
        data: formUser.value,
      })
    } else if (viewMode.value === 'edit' && editingUserId.value) {
      await apiRequest(`/admin/users/${editingUserId.value}`, {
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
</script>


<template>
  <div class="admin-page">
    <AdminHeader active-tab="user"/>

    <section v-if="viewMode === 'list'" class="content">
      <div class="nes-container is-rounded search-wrapper">
        <div class="search-row">
          <SearchBarModel
            :fields="userSearchFields"
            v-model="search"
          />
          <button
            type="button"
            class="nes-btn is-success add-btn"
            @click="openCreate"
            aria-label="Create user"
          >
            <i class="nes-icon plus is-small"></i>
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
            <th>Playing At</th>
            <th>Edit</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="u in filteredUsers" :key="u._id">
            <td>{{ u._id }}</td>
            <td>{{ u.name }}</td>
            <td>{{ u.email }}</td>
            <td>{{ u.admin ? 'Yes' : 'No' }}</td>
            <td>{{ u.playingAt || '—' }}</td>
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

</style>