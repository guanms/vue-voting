<template>
  <form @submit.prevent="submitForm">
    <div>
      <label>Title:</label>
      <input v-model="form.title" required />
    </div>
    <div>
      <label>Description:</label>
      <textarea v-model="form.description" required></textarea>
    </div>
    <div>
      <label>Duration (seconds):</label>
      <input v-model.number="form.duration" type="number" required />
    </div>
    <div>
      <label>Candidates:</label>
      <div v-for="(candidate, index) in form.candidateNames" :key="index">
        <input v-model="form.candidateNames[index]" required />
        <button @click="removeCandidate(index)" type="button">Remove</button>
      </div>
      <button @click="addCandidate" type="button">Add Candidate</button>
    </div>
    <button type="submit">Create Voting</button>
  </form>
</template>

<script>
import { reactive } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';

export default {
  setup() {
    const form = reactive({
      title: '',
      description: '',
      duration: 86400, // 1 day default
      candidateNames: ['', '']
    });

    const router = useRouter();

    const addCandidate = () => {
      form.candidateNames.push('');
    };

    const removeCandidate = (index) => {
      form.candidateNames.splice(index, 1);
    };

    const submitForm = async () => {
      try {
        await axios.post('http://localhost:8080/api/votings', form);
        router.push('/');
      } catch (error) {
        console.error('Error creating voting:', error);
      }
    };

    return { form, addCandidate, removeCandidate, submitForm };
  }
};
</script>
