<script setup>
import { ref, reactive, computed, onMounted } from "vue";
import { apiRequest } from "../network/Request";

import SearchBarModel from "./SearchBarModel.vue";
import EditPageModel from "./EditPageModel.vue";

const rawUsers = ref([]);

const loading = ref(false);
const errorMsg = ref("");

const viewMode = ref("list");
const editingUserId = ref(null);

const pageInfo = ref({
  no: 1,
  size: 8,
});

const search = reactive({
  name: "",
  email: "",
  admin: "any",
});

const userSearchFields = [
  { key: "name", label: "Name", type: "text", width: "30%" },
  { key: "email", label: "Email", type: "text", width: "30%" },
  {
    key: "admin",
    label: "IsAdmin",
    type: "select",
    options: [
      { value: "any", label: "Any" },
      { value: "1", label: "True" },
      { value: "0", label: "False" },
    ],
  },
];

const formUser = ref({
  name: "",
  email: "",
  password: "",
  admin: false,
});

const userFormFields = [
  {
    key: "name",
    label: "Name",
    type: "text",
    required: true,
  },
  {
    key: "email",
    label: "Email",
    type: "email",
    required: true,
    editableOnEdit: false,
  },
  {
    key: "password",
    label: "Password",
    type: "password",
    required: false,
  },
  {
    key: "admin",
    label: "Admin Permit",
    type: "checkbox",
  },
];

const filteredUsers = computed(() => {
  const nameSearch = search.name.trim().toLowerCase();
  const emailSearch = search.email.trim().toLowerCase();

  return rawUsers.value.filter((u) => {
    if (nameSearch && !u.name.toLowerCase().includes(nameSearch)) return false;
    if (emailSearch && !u.email.toLowerCase().includes(emailSearch))
      return false;

    if (search.admin !== "any") {
      const wantAdmin = search.admin === "1";
      if (!!u.admin !== wantAdmin) return false;
    }

    return true;
  });
});

const totalPages = computed(() => {
  return Math.max(
    1,
    Math.ceil(filteredUsers.value.length / pageInfo.value.size)
  );
});

const pagedUsers = computed(() => {
  const start = (pageInfo.value.no - 1) * pageInfo.value.size;
  const end = start + pageInfo.value.size;
  return filteredUsers.value.slice(start, end);
});

const loadData = async (pageNo = 1) => {
  loading.value = true;
  errorMsg.value = "";
  try {
    const usersRes = await apiRequest(
      "/users/list?page[mp]=1&page[size]=9999",
      {
        method: "GET",
      }
    );

    // console.log('DEBUG usersRes:', usersRes)
    // console.log("DEBUG body:", usersRes.body)

    if (usersRes.code === 0) {
      rawUsers.value = usersRes.body.list;
      pageInfo.value.no = 1;
    } else {
      errorMsg.value = usersRes.message;
    }
    console.log("DEBUG rawUsers:", rawUsers.value);
    console.log("DEBUG pageInfo:", pageInfo.value);
  } catch (e) {
    console.error(e);
    errorMsg.value = "Failed to load users or rooms.";
  } finally {
    loading.value = false;
  }
};

onMounted(loadData);

const openCreate = () => {
  formUser.value = {
    name: "",
    email: "",
    password: "",
    admin: false,
  };
  editingUserId.value = null;
  viewMode.value = "create";
};

const openEdit = (user) => {
  formUser.value = {
    _id: user._id,
    name: user.name,
    email: user.email,
    admin: !!user.admin,
    status: user.status,
    password: "",
  };
  editingUserId.value = user._id;
  viewMode.value = "edit";
};

const cancelForm = () => {
  viewMode.value = "list";
};

const submitForm = async () => {
  try {
    if (viewMode.value === "create") {
      const payload = {
        name: formUser.value.name,
        email: formUser.value.email,
        password: formUser.value.password,
      };

      console.log("DEBUG CREATE payload:", payload);

      await apiRequest("/auth/signup", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    } else if (viewMode.value === "edit" && editingUserId.value) {
      const payload = {
        _id: editingUserId.value,
        name: formUser.value.name,
        email: formUser.value.email,
        admin: !!formUser.value.admin,
        password: formUser.value.password,
        status: Number(formUser.value.status),
      };
      await apiRequest(`/users/patch`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
    }

    await loadData();
    viewMode.value = "list";
  } catch (e) {
    console.error("Failed to save user", e);
    alert("Failed to save user");
  }
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
      <div class="nes-container is-rounded search-wrapper">
        <div class="search-row">
          <SearchBarModel
            :fields="userSearchFields"
            v-model="search"
            @update:modelValue="onSearchModelChange"
            @search="onSearch"
          />
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
          <tr v-for="u in pagedUsers" :key="u._id">
            <td>{{ u._id }}</td>
            <td>{{ u.name }}</td>
            <td>{{ u.email }}</td>
            <td>{{ u.admin ? "Yes" : "No" }}</td>
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

    <div v-if="viewMode !== 'list'" class="modal-overlay">
      <div class="modal-dialog">
        <EditPageModel
          title="User"
          :mode="viewMode === 'edit' ? 'edit' : 'create'"
          :fields="userFormFields"
          v-model="formUser"
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
