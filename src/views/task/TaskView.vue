<template>
  <div>
    <BaseMenu :menuItems="menuItems"></BaseMenu>
  </div>
</template>
<script>
export default {
  name: 'TaskView'
}
</script>
<script setup>
import BaseMenu from '../../components/base/BaseMenu.vue'
import { FileMedical, Coins } from '@vicons/fa'

const menuItems = [
  {
    index: '1',
    routeName: 'task-list',
    icon: Coins,
    title: '任务列表'
  },
  {
    index: '2',
    routeName: 'task-create',
    icon: FileMedical,
    title: '创建任务'
  }
]
</script>
<style></style>
