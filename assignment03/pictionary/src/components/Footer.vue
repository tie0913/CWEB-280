<template>
  <footer class="footer nes-container is-rounded">
    
    <span>© {{ year }} {{ projectName }}</span>

    <span class="divider">|</span>

    <a class="nes-text is-primary" :href="departmentUrl" target="_blank">
      {{ departmentName }}
    </a>

    <span class="divider">|</span>

    <div class="contributors">
      Contributors:

      <div class="avatars">
        <a 
          v-for="(author, i) in authors" 
          :key="i" 
          :href="'https://github.com/' + author.username" 
          target="_blank"
          class="avatar-link"
        >
          <img 
            class="avatar"
            :src="'https://github.com/' + author.username + '.png'"
            :alt="author.username"
          />
        </a>
      </div>
    </div>
    
  </footer>
</template>

<script setup>
const year = new Date().getFullYear()

const projectName = "Pictionary"
const departmentName = "Computer Systems Technology"
const departmentUrl = "https://saskpolytech.ca/programs-and-courses/programs/Computer-Systems-Technology.aspx"

const authors = [
  { username: "tie0913" },
  { username: "tran3964" },
]
</script>

<style scoped>
.footer {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
  padding: 10px;
  font-size: 12px;
  margin-top: 20px;
  flex-wrap: wrap;
}

.divider {
  opacity: 0.6;
}

.contributors {
  display: flex;
  align-items: center;
  gap: 6px;
}


.avatar-link {
  display: inline-flex;
  align-items: center;
}


/* 这一段让头像美观散开 */
.avatars {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: center;
}

.avatar {
  width: 24px;
  height: 24px;
  border-radius: 4px; /* 更 NES 风 */
  transition: transform 0.15s;
  border: 1px solid #000;
}

/* 小交互效果，可选 */
.avatar:hover {
  transform: scale(1.2);
}
</style>
