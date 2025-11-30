<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { apiRequest } from '@/network/Request'

import AdminHeader from './AdminHeader.vue'
import SearchBarModel from './SearchBarModel.vue'
import EditPageModel from './EditPageModel.vue'

const rawRooms = ref([])
const loading = ref(false)
const errorMsg = ref('')

const viewMode = ref('list')
const editingRoomId = ref(null)

const search = reactive({
  ownerId: '',
  name: '',
  maxPlayers: '',
  visibility: 'any',
  state: 'any',
})
const roomSearchFields = [
  { key: 'ownerId', label: 'Owner ID', type: 'text', width: '20%' },
  { key: 'name', label: 'Name', type: 'text', width: '25%' },
  { key: 'maxPlayers', label: 'Max Players', type: 'text', width: '15%' },
  {
    key: 'visibility',
    label: 'Visibility',
    type: 'select',
    options: [
      { value: 'any', label: 'Any' },
      { value: '1', label: 'True' },
      { value: '0', label: 'False' },
    ],
  },
  {
    key: 'state',
    label: 'State',
    type: 'select',
    options: [
      { value: 'any', label: 'Any' },
      { value: '0', label: 'Closed' },
      { value: '1', label: 'OnGoing' },
      { value: '2', label: 'Waiting' },
    ],
  },
]

const roomFormFields = [
  {
    key: 'name',
    label: 'Name',
    type: 'text',
    required: true,
  },
  {
    key: 'ownerId',
    label: 'Owner ID',
    type: 'text',
    editableOnEdit: false,
    editableOnCreate: false,
  },
  {
    key: 'maxPlayers',
    label: 'Max Players',
    type: 'number',
    required: true,
  },
  {
    key: 'visibility',
    label: 'Visibility',
    type: 'checkbox',
  },
  {
    key: 'state',
    label: 'Room State',
    type: 'select',
    options: [
      { value: 0, label: 'Closed' },
      { value: 1, label: 'On Going' },
      { value: 2, label: 'Waiting' },
    ],
  },
]

const roomStateText = (state) => {
  switch (Number(state)) {
    case 0:
      return '0 → Closed'
    case 1:
      return '1 → OnGoing'
    case 2:
      return '2 → Waiting'
    default:
      return state
  }
}

const formatDate = (value) => {
  if (!value) return '—'
  try {
    return new Date(value).toLocaleString()
  } catch {
    return String(value)
  }
}

const filteredRooms = computed(() => {
  const ownerSearch = search.ownerId.trim().toLowerCase()
  const nameSearch = search.name.trim().toLowerCase()
  const maxPlayersSearch = search.maxPlayers.trim()

  return rawRooms.value.filter((r) => {
    if (ownerSearch && String(r.ownerId || '').toLowerCase().includes(ownerSearch) === false)
      return false

    if (nameSearch && String(r.name || '').toLowerCase().includes(nameSearch) === false)
      return false

    if (maxPlayersSearch) {
      if (String(r.maxPlayers ?? '').includes(maxPlayersSearch) === false) return false
    }

    if (search.visibility !== 'any') {
      const wantVisible = search.visibility === '1'
      if (!!r.visibility !== wantVisible) return false
    }

    if (search.state !== 'any') {
      if (String(r.state) !== search.state) return false
    }

    return true
  })
})

const loadData = async () => {
  loading.value = true
  errorMsg.value = ''
  try {
    const res = await apiRequest('/admin/rooms', { method: 'GET' })
    rawRooms.value = res.data || []
  } catch (e) {
    console.error(e)
    errorMsg.value = 'Failed to load rooms.'
  } finally {
    loading.value = false
  }
}

onMounted(loadData)

const openEdit = (room) => {
  formRoom.value = {
    name: room.name,
    ownerId: room.ownerId,
    maxPlayers: room.maxPlayers,
    visibility: !!room.visibility,
    state: room.state,
  }
  editingRoomId.value = room._id
  viewMode.value = 'edit'
}

const cancelForm = () => {
  viewMode.value = 'list'
}

const submitForm = async () => {
  try {
    if (!editingRoomId.value) return

    await apiRequest(`/admin/rooms/${editingRoomId.value}`, {
      method: 'PUT',
      data: formRoom.value,
    })

    await loadData()
    viewMode.value = 'list'
  } catch (e) {
    console.error('Failed to save room', e)
    alert('Failed to save room')
  }
}
</script>

<template>
  <div class="admin-page">
    <AdminHeader active-tab="room" />

    <section v-if="viewMode === 'list'" class="content">
      <div class="nes-container is-rounded search-wrapper">
        <SearchBarModel :fields="roomSearchFields" v-model="search" />
      </div>

      <p v-if="errorMsg" class="nes-text is-error">{{ errorMsg }}</p>
      <p v-else-if="loading">Loading...</p>

      <table v-else class="nes-table is-bordered is-centered room-table">
        <thead>
          <tr>
            <th>Room ID</th>
            <th>Owner ID</th>
            <th>Name</th>
            <th>Max Players</th>
            <th>Visibility</th>
            <th>State</th>
            <th>Create At</th>
            <th>Update At</th>
            <th>Edit</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in filteredRooms" :key="r._id">
            <td>{{ r._id }}</td>
            <td>{{ r.ownerId }}</td>
            <td>{{ r.name }}</td>
            <td>{{ r.maxPlayers }}</td>
            <td>{{ r.visibility ? 'True' : 'False' }}</td>
            <td>{{ roomStateText(r.state) }}</td>
            <td>{{ formatDate(r.createdAt) }}</td>
            <td>{{ formatDate(r.updatedAt) }}</td>
            <td class="edit-cell">
              <button
                class="nes-btn is-primary edit-btn"
                type="button"
                @click="openEdit(r)"
              >
                <i class="nes-icon pen is-small"></i>
              </button>
            </td>
          </tr>

          <tr v-if="!filteredRooms.length">
            <td colspan="9" class="empty-row">
              No rooms match current filters.
            </td>
          </tr>
        </tbody>
      </table>
    </section>

    <section v-else class="content">
      <EditPageModel
        title="Room"
        mode="edit"
        :fields="roomFormFields"
        v-model="formRoom"
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

.room-table {
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