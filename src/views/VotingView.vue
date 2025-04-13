<template>
  <div class="voting-detail">
    <div v-if="loading" class="loading">加载中...</div>

    <div v-else-if="error" class="error">
      {{ error }}
    </div>

    <div v-else>
      <div class="voting-header">
        <h1>{{ voting.title }}</h1>
        <p>{{ voting.description }}</p>
        <div class="meta">
          <span>状态: {{ voting.isActive ? '进行中' : '已结束' }}</span>
          <span>结束时间: {{ formatDate(voting.endTime) }}</span>
        </div>
      </div>

      <div v-if="hasVoted" class="already-voted">
        您已经投过票了
      </div>

      <div v-else-if="voting.isActive && !votingEnded" class="vote-form">
        <h3>请选择候选人</h3>
        <div class="candidates">
          <div
              v-for="(candidate, index) in voting.candidates"
              :key="index"
              class="candidate"
              :class="{ selected: selectedCandidate === index }"
              @click="selectCandidate(index)"
          >
            {{ candidate.name }}
          </div>
        </div>
        <button
            @click="submitVote"
            :disabled="selectedCandidate === null || submitting"
            class="vote-btn"
        >
          {{ submitting ? '提交中...' : '投票' }}
        </button>
      </div>

      <div class="results">
        <h3>当前结果</h3>
        <div v-for="(candidate, index) in voting.candidates" :key="index" class="result-item">
          <div class="candidate-name">{{ candidate.name }}</div>
          <div class="vote-bar">
            <div
                class="vote-progress"
                :style="{ width: calculatePercentage(candidate.voteCount) + '%' }"
            ></div>
            <span class="vote-count">{{ candidate.voteCount }}票</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'
import useWeb3 from "../composables/useWeb3.ts";

const { account, isConnected, connectWallet } = useWeb3()
const route = useRoute()
const votingId = route.params.id

// 响应式状态
const voting = ref(null)
const loading = ref(true)
const error = ref(null)
const selectedCandidate = ref(null)
const submitting = ref(false)
const hasVoted = ref(false)

// 计算属性
const votingEnded = computed(() => {
  return voting.value ? Date.now() > voting.value.endTime : false
})

// 方法
const fetchVotingDetails = async () => {
  try {
    const [detailsRes, votedRes] = await Promise.all([
      axios.get(`/api/votings/${votingId}`),
      axios.get(`/api/votings/${votingId}/hasVoted`, {
        params: { account: account.value }
      })
    ])

    voting.value = {
      id: votingId,
      ...detailsRes.data,
      startTime: detailsRes.data.startTime * 1000,
      endTime: detailsRes.data.endTime * 1000,
      candidates: detailsRes.data.candidates.map(c => ({
        ...c,
        voteCount: parseInt(c.voteCount)
      }))
    }

    hasVoted.value = votedRes.data
  } catch (err) {
    error.value = '获取投票详情失败'
    console.error(err)
  } finally {
    loading.value = false
  }
}

const formatDate = timestamp => new Date(timestamp).toLocaleString()

const selectCandidate = index => {
  selectedCandidate.value = index
}

const submitVote = async () => {
  if (!isConnected.value) {
    await connectWallet()
    return
  }

  if (selectedCandidate.value === null) return

  submitting.value = true
  try {
    await axios.post(`/api/votings/${votingId}/vote`, {
      candidateId: selectedCandidate.value,
      account: account.value
    })
    await fetchVotingDetails()
  } catch (err) {
    console.error('投票失败:', err)
    alert(`投票失败: ${err.message}`)
  } finally {
    submitting.value = false
  }
}

const calculatePercentage = votes => {
  if (!voting.value?.candidates?.length) return 0
  const total = voting.value.candidates.reduce((sum, c) => sum + c.voteCount, 0)
  return total > 0 ? Math.round((votes / total) * 100) : 0
}

// 生命周期钩子
onMounted(fetchVotingDetails)
</script>


<style scoped>
.voting-detail {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.loading, .error {
  text-align: center;
  padding: 2rem;
}

.error {
  color: #ff4757;
}

.voting-header {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.voting-header h1 {
  margin-top: 0;
}

.meta {
  display: flex;
  gap: 1rem;
  color: #666;
  margin-top: 1rem;
}

.already-voted {
  background: #ffeaa7;
  padding: 1rem;
  border-radius: 4px;
  text-align: center;
  margin-bottom: 2rem;
}

.vote-form {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.candidates {
  display: grid;
  gap: 0.75rem;
  margin: 1.5rem 0;
}

.candidate {
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.candidate:hover {
  background: #f1f1f1;
}

.candidate.selected {
  background: #42b983;
  color: white;
  border-color: #42b983;
}

.vote-btn {
  background: #42b983;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  width: 100%;
}

.vote-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.results {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.result-item {
  margin-bottom: 1rem;
}

.candidate-name {
  margin-bottom: 0.5rem;
  font-weight: bold;
}

.vote-bar {
  height: 24px;
  background: #f1f1f1;
  border-radius: 4px;
  position: relative;
  margin-bottom: 1rem;
}

.vote-progress {
  height: 100%;
  background: #42b983;
  border-radius: 4px;
  transition: width 0.5s;
}

.vote-count {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  color: white;
  text-shadow: 0 0 2px rgba(0,0,0,0.5);
}
</style>
