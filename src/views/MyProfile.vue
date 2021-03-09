<template>
  <div class="container">
    <b-card class="mt-3" header="My Profile">
      <h3>Welcome to your profile page</h3>
      <pre>loggedIn: {{ loggedIn }}</pre>
      <button @click="generate401">401</button>
    </b-card>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import ApiService from '../services/api.service';

export default {
    name: "myprofile",
    data() {
      return {        
      }
    },
    computed: {
      ...mapGetters('auth', ['loggedIn'])
    },
    methods: {
      async generate401() {
        const res = await ApiService.get('/api/unknown/23');
      }
    }
}
</script>