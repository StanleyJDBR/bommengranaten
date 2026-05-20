<!-- src/routes/+layout.svelte -->
<script lang="ts">
  import '../app.css';
  import { page } from '$app/stores';
</script>

<svelte:head>
  <title>Bommen & Granaten</title>
</svelte:head>

<main class="max-w-[580px] mx-auto px-4 pb-6">
  <slot />
</main>

<style lang="css">
    title {
        font-size: 32px;
    }
</style>
