<template>
  <div class="print-shell">
    <slot />
  </div>
</template>

<style>
/* Reset for print layout — no sidebar, no nav */
body { background: #fff; margin: 0; }
.print-shell { min-height: 100vh; background: #fff; }
</style>
