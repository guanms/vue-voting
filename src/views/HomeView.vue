<template>
  <div class="home">
    <h1>去中心化投票系统</h1>

    <div v-if="loading" class="loading">加载中...</div>

    <div v-else>
      <button @click="createNewVoting" class="create-btn">创建新投票</button>

      <div v-if="votings.length === 0" class="empty">
        暂无活跃投票
      </div>

      <div v-else class="voting-list">
        <div v-for="voting in votings" :key="voting.id" class="voting-card">
          <h3>{{ voting.title }}</h3>
          <p>{{ voting.description }}</p>
          <p>结束时间: {{ formatDate(voting.endTime) }}</p>
          <router-link
              :to="`/voting/${voting.id}`"
              class="view-link"
          >
            查看详情
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import { API } from "../api/config.ts";
import type { Voting } from "../types/voting.ts";

const votings = ref<Voting[]>([]);
const loading = ref(true);
const router = useRouter();

const getActiveVotings = async () => {
  try {
    const response = await axios.get(API.VOTINGS.ACTIVE);
    votings.value = response.data;
  } catch (error) {
    console.error('获取投票列表失败:', error);
  } finally {
    loading.value = false;
  }
};

const createNewVoting = () => {
  console.log('按钮点击事件触发');
  router.push('/create');
};

const formatDate = (timestamp: string | number) => {
  return new Date(timestamp).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

onMounted(getActiveVotings);
</script>

<style scoped>
.home {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.loading {
  text-align: center;
  padding: 2rem;
}

.create-btn {
  background: #42b983;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
  margin-bottom: 2rem;
  font-weight: bold;
}

.empty {
  text-align: center;
  padding: 2rem;
  color: #666;
}

.voting-list {
  display: grid;
  gap: 1.5rem;
}

.voting-card {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.view-link {
  display: inline-block;
  margin-top: 1rem;
  color: #42b983;
  text-decoration: none;
  font-weight: bold;
}
</style>