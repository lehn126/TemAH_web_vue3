<template>
  <div>
    <BaseTabs :tabs="tabs" v-model:current-tab="currentTab">
      <transition name="slide-right" mode="out-in" appear>
        <component :is="currentTabCom" class="tag-views"></component>
      </transition>
    </BaseTabs>
  </div>
</template>
<script>
export default {
  name: 'AlarmView'
}
</script>
<script setup>
import { ref, computed } from 'vue'
import BaseTabs from '../../components/base/BaseTabs.vue'
import AlarmList from '../../components/alarm/AlarmList.vue'
import AlarmCreate from '../../components/alarm/AlarmCreate.vue'

const tabs = ref([
  { id: 'alarm-list', name: '告警列表' },
  { id: 'alarm-create', name: '创建告警' }
])
const currentTab = ref('alarm-list')

const tabComponents = {
  'alarm-list': AlarmList,
  'alarm-create': AlarmCreate
}

const currentTabCom = computed(() => {
  return tabComponents[currentTab.value]
})
</script>
<style scoped>
.tag-views {
  transition: all 0.4s ease;
}
</style>
