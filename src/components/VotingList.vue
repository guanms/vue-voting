<template>
  <div>
    <h2>Active Votings</h2>
    <div v-for="voting in votings" :key="voting.id" class="voting-item">
      <h3>{{ voting.title }}</h3>
      <p>{{ voting.description }}</p>
      <router-link :to="`/voting/${voting.id}`">View Details</router-link>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import axios from 'axios';

export default {
  setup() {
    const votings = ref([]);

    const fetchVotings = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/votings/active');
        votings.value = response.data;
      } catch (error) {
        console.error('Error fetching votings:', error);
      }
    };

    onMounted(fetchVotings);

    return { votings };
  }
};
</script>
