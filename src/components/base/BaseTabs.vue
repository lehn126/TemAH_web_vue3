<template>
  <div class="tab">
    <NTabs
      type="card"
      placement="left"
      size="small"
      v-model:value="selectedTab"
      v-on:update:value="handleTabClick"
      class="tabs"
    >
      <NTab v-for="tab in tabs" :key="tab.id" :name="tab.id" />
    </NTabs>
    <div class="tabContainer">
      <slot>Tag的内容显示在这里</slot>
    </div>
  </div>
</template>
<script>
export default {
  name: 'BaseTabs'
}
</script>
<script setup>
import { NTabs, NTab } from 'naive-ui'

const props = defineProps(['tabs', 'currentTab'])
const emit = defineEmits(['update:currentTab'])
const selectedTab = props.currentTab

function handleTabClick(value) {
  emit('update:currentTab', value)
}
</script>
<style scoped>
.tab {
  display: flex;
  border: 1px solid #67c23a;
  border-radius: 3px;
  padding: 8px;
}

.tabs {
  width: auto;
}

.tabContainer {
  display: flex;
  width: 100%;
  justify-content: center;
  /* align-items: center; */
  margin-left: 8px;
}
</style>
