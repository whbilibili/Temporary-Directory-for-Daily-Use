<script lang="ts">
  import { invoke } from "@tauri-apps/api/core";
  import { onMount } from "svelte";

  let statusMsg = $state("");

  onMount(async () => {
    statusMsg = await invoke<string>("get_app_status");
  });
</script>

<main class="container">
  <h1>击刻 KeyDiary</h1>
  <p class="status">{statusMsg}</p>
</main>

<style>
  .container {
    margin: 0;
    padding-top: 20vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    min-height: 100vh;
  }

  h1 {
    font-size: 2rem;
    font-weight: 700;
    margin-bottom: 1rem;
  }

  .status {
    font-size: 1.2rem;
    color: #666;
  }

  @media (prefers-color-scheme: dark) {
    .status {
      color: #aaa;
    }
  }
</style>
