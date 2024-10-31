<script setup lang="ts">
import { useLaserEyes } from '@omnisat/lasereyes-vue'

// import { useLaserEyes } from "../lib/index";

const { address, connect, connected, disconnect } = useLaserEyes()
</script>

<template>
  <p>Address: {{ address }}</p>
  <button @click="() => (connected ? disconnect() : connect('unisat'))">
    {{ connected ? 'dis' : '' }}connect
  </button>
</template>

<style scoped></style>
