<script setup>
import { ref, reactive, computed, onMounted } from "vue";
import { apiRequest } from "../network/Request";

import SearchBarModel from "./SearchBarModel.vue";
import EditPageModel from "./EditPageModel.vue";

const rawRooms = ref([]);

const loading = ref(false);
const errorMsg = ref("");

const viewMode = ref("list");
const editingRoomId = ref(null);

const pageInfo = ref({
  no: 1,
  size: 8,
});

const search = reactive({
  ownerId: "",
  name: "",
  maxPlayers: "",
  visibility: "any",
  state: "any",
});
const roomSearchFields = [
  { key: "ownerId", label: "Owner", type: "text", width: "20%" },
  { key: "name", label: "Name", type: "text", width: "25%" },
  { key: "maxPlayers", label: "Max Players", type: "text", width: "15%" },
  {
    key: "visibility",
    label: "Visibility",
    type: "select",
    options: [
      { value: "any", label: "Any" },
      { value: "1", label: "True" },
      { value: "0", label: "False" },
    ],
  },
  {
    key: "state",
    label: "State",
    type: "select",
    options: [
      { value: "any", label: "Any" },
      { value: "0", label: "Closed" },
      { value: "1", label: "OnGoing" },
      { value: "2", label: "Waiting" },
    ],
  },
];

const roomFormFields = [
  {
    key: "name",
    label: "Name",
    type: "text",
    required: true,
  },
  {
    key: "ownerId",
    label: "Owner ID",
    type: "text",
    editableOnEdit: false,
    editableOnCreate: false,
  },
  {
    key: "maxPlayers",
    label: "Max Players",
    type: "number",
    required: true,
  },
  {
    key: "visibility",
    label: "Visibility",
    type: "checkbox",
  },
  {
    key: "state",
    label: "Room State",
    type: "select",
    options: [
      { value: 0, label: "Closed" },
      { value: 1, label: "On Going" },
      { value: 2, label: "Waiting" },
    ],
  },
];
const formRoom = ref({
  name: "",
  ownerId: "",
  maxPlayers: "",
  visibility: false,
  state: "",
});
const roomStateText = (state) => {
  switch (Number(state)) {
    case 0:
      return "Closed";
    case 1:
      return "OnGoing";
    case 2:
      return "Waiting";
    default:
      return state;
  }
};

const formatDate = (value) => {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleString();
  } catch {
    return String(value);
  }
};

const filteredRooms = computed(() => {
  const ownerSearch = search.ownerId.trim().toLowerCase();
  const nameSearch = search.name.trim().toLowerCase();
  const maxPlayersSearch = search.maxPlayers.trim();

  return rawRooms.value.filter((r) => {
    if (ownerSearch) {
      const ownerName = (r.owner?.name || "").toLowerCase();
      const ownerIdStr = String(r.ownerId || "").toLowerCase();

      if (
        !ownerName.includes(ownerSearch) &&
        !ownerIdStr.includes(ownerSearch)
      ) {
        return false;
      }
    }

    if (
      nameSearch &&
      String(r.name || "")
        .toLowerCase()
        .includes(nameSearch) === false
    )
      return false;

    if (maxPlayersSearch) {
      if (String(r.maxPlayers ?? "").includes(maxPlayersSearch) === false)
        return false;
    }

    if (search.visibility !== "any") {
      const wantVisible = search.visibility === "1";
      if (!!r.visibility !== wantVisible) return false;
    }

    if (search.state !== "any") {
      if (String(r.state) !== search.state) return false;
    }

    return true;
  });
});

const totalPages = computed(() => {
  return Math.max(
    1,
    Math.ceil(filteredRooms.value.length / pageInfo.value.size)
  );
});

const loadData = async (pageNo = 1) => {
  loading.value = true;
  errorMsg.value = "";
  try {
    const res = await apiRequest(`/rooms`, { method: "GET" });

    console.log("DEBUG roomRes:", res);
    console.log("DEBUG body:", res.body);

    if (res.code === 0) {
      rawRooms.value = res.body.list;
      pageInfo.value.no = 1;
    } else {
      errorMsg.value = res.message;
    }
    console.log("DEBUG rawRooms:", rawRooms.value);
  } catch (e) {
    console.error(e);
    errorMsg.value = "Failed to load rooms.";
  } finally {
    loading.value = false;
  }
};

onMounted(loadData);

const openEdit = (room) => {
  formRoom.value = {
    name: room.name,
    ownerId: room.ownerId,
    maxPlayers: room.maxPlayers,
    visibility: !!room.visibility,
    state: room.state,
  };
  editingRoomId.value = room._id;
  viewMode.value = "edit";
};

const cancelForm = () => {
  viewMode.value = "list";
};

const submitForm = async () => {
  try {
    if (!editingRoomId.value) return;

    const payload = {
      name: formRoom.value.name,
      maxPlayers: Number(formRoom.value.maxPlayers),
      visibility: formRoom.value.visibility ? 1 : 0,
      state: Number(formRoom.value.state),
    };

    await apiRequest(`/rooms/${editingRoomId.value}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });

    await loadData();
    viewMode.value = "list";
  } catch (e) {
    console.error("Failed to save room", e);
    alert("Failed to save room");
  }
};


const goToPage = (page) => {
  if (page < 1 || page > pageInfo.value.totalPages) return;
  loadData(page);
};

const nextPage = () => {
  goToPage(pageInfo.value.no + 1);
};

const prevPage = () => {
  goToPage(pageInfo.value.no - 1);
};

const onSearch = () => {
  console.log("SEARCH NOW:", { ...search });
  loadData(1);
};

const onSearchModelChange = (val) => {
  Object.assign(search, val);
  pageInfo.value.no = 1;
};
</script>

<template>
  <div class="admin-page">
    <section class="content">
      <SearchBarModel
        :fields="roomSearchFields"
        v-model="search"
        @update:modelValue="onSearchModelChange"
        @search="onSearch"
      />

      <p v-if="errorMsg" class="nes-text is-error">{{ errorMsg }}</p>
      <p v-else-if="loading">Loading...</p>

      <table v-else class="nes-table is-bordered is-centered room-table">
        <thead>
          <tr>
            <th>Owner</th>
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
            <td>{{ r.owner?.name || r.ownerId }}</td>
            <td>{{ r.name }}</td>
            <td>{{ r.maxPlayers }}</td>
            <td>{{ r.visibility ? "True" : "False" }}</td>
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
      <div v-if="totalPages > 1" class="pagination">
        <button
          class="nes-btn"
          :disabled="pageInfo.no === 1"
          @click="pageInfo.no--"
        >
          Prev
        </button>

        <span class="page-label">
          Page {{ pageInfo.no }} / {{ totalPages }}
        </span>

        <button
          class="nes-btn"
          :disabled="pageInfo.no >= totalPages"
          @click="pageInfo.no++"
        >
          Next
        </button>
      </div>
    </section>

    <EditPageModel
      v-if="viewMode !== 'list'"
      title="Room"
      mode="edit"
      :fields="roomFormFields"
      v-model="formRoom"
      @cancel="cancelForm"
      @submit="submitForm"
    />
    <div v-if="viewMode !== 'list'" class="modal-overlay">
      <div class="modal-dialog">
        <EditPageModel
          title="Room"
          mode="edit"
          :fields="roomFormFields"
          v-model="formRoom"
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

.hint {
  font-size: 11px;
  margin-top: 4px;
  margin-bottom: 10px;
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
