<template>
  <div class="create-voting">
    <h1>创建新投票</h1>

    <div v-if="!isConnected" class="connect-wallet">
      <p>请先连接钱包</p>
      <button @click="connectWallet" class="connect-btn">
        {{ isConnected ? `Connected: ${account}` : '连接MetaMask' }}
      </button>
    </div>

    <form v-else @submit.prevent="submitForm" class="voting-form">
      <div class="form-group">
        <label>投票标题</label>
        <input v-model="form.title" required />
      </div>

      <div class="form-group">
        <label>投票描述</label>
        <textarea v-model="form.description" required></textarea>
      </div>

      <div class="form-group">
        <label>投票持续时间（天）</label>
        <input v-model.number="form.durationDays" type="number" min="1" required />
      </div>

      <div class="candidates">
        <label>候选人</label>
        <div v-for="(_, index) in form.candidates" :key="index" class="candidate-input">
          <input
              v-model="form.candidates[index]"
              :placeholder="`候选人 ${index + 1}`"
              required
          />
          <button
              v-if="index > 1"
              @click="removeCandidate(index)"
              type="button"
              class="remove-btn"
          >
            删除
          </button>
        </div>
        <button @click="addCandidate" type="button" class="add-btn">添加候选人</button>
      </div>

      <button type="submit" :disabled="submitting" class="submit-btn">
        {{ submitting ? '提交中...' : '创建投票' }}
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import { API } from "../api/config.ts";
import useWeb3 from "../composables/useWeb3.ts";

console.log('CreateVotingView.vue');

const { account, isConnected, connectWallet } = useWeb3();
const router = useRouter();
const submitting = ref(false);

const form = ref({
  title: '',
  description: '',
  durationDays: 1,
  candidates: ['', '']
});

const addCandidate = () => {
  form.value.candidates.push('');
};

const removeCandidate = (index: number) => {
  if (form.value.candidates.length > 2) {
    form.value.candidates.splice(index, 1);
  }
};

const submitForm = async () => {
  if (!isConnected.value) {
    alert('请先连接钱包');
    return;
  }

  submitting.value = true;
  try {
    const durationSeconds = form.value.durationDays * 24 * 60 * 60;

    const activeVotingsResponse = await axios.get(API.VOTINGS.ACTIVE);
    if (activeVotingsResponse.data.length > 0) {
      alert('当前已有投票正在进行，请先结束当前投票。');
    } else {
      const data = {
        title: form.value.title,
        description: form.value.description,
        duration: durationSeconds,
        candidateNames: form.value.candidates
      };

      await axios.post(API.VOTINGS.CREATE, data);
      alert('投票创建成功');
      await router.push('/');
    }
  } catch (error: any) {
    console.error('创建投票失败:', error);
    alert(`创建失败: ${error.message}`);
  } finally {
    submitting.value = false;
  }
};

onMounted(async () => {
  if (window.ethereum) {
    const accounts = await window.ethereum.request({ method: 'eth_accounts' });
    if (accounts.length > 0) {
      account.value = accounts[0];
      isConnected.value = true;
    }
  }
});
</script>

<style scoped>
.create-voting {
  max-width: 600px;
  margin: 0 auto;
  padding: 2rem;
}

.connect-wallet {
  text-align: center;
  padding: 2rem;
}

.connect-btn {
  background: #f6851b;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
}

.voting-form {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.form-group {
  margin-bottom: 1.5rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: bold;
}

input, textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

textarea {
  min-height: 100px;
}

.candidates {
  margin-bottom: 1.5rem;
}

.candidate-input {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.candidate-input input {
  flex: 1;
}

.remove-btn {
  background: #ff4757;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0 0.75rem;
  cursor: pointer;
}

.add-btn {
  background: #3498db;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 0.5rem;
}

.submit-btn {
  background: #42b983;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  width: 100%;
}

.submit-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}
</style>