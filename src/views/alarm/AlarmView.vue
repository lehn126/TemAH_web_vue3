<template>
  <div>
    <AlarmTabs :tabs="tabs" v-model:current-tab="currentTab">
      <transition name="slide-right" mode="out-in" appear>
        <component
          :is="currentTabCom"
          @alarm-dblclick="handleRowDblclick"
          class="tag-views"
        ></component>
      </transition>
    </AlarmTabs>
  </div>
</template>
<script>
export default {
  name: 'AlarmView'
}
</script>
<script setup>
import { ref, computed } from 'vue'
import AlarmTabs from '../../components/alarm/AlarmTabs.vue'
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

function handleRowDblclick(row) {
  console.log(row)
  //this.$store.dispatch('setOperationAlarm', row);
  //this.$router.push({ name: 'alarmEdit', params: { id: row.id } });
}
</script>
<style scoped>
.tag-views {
  padding: 8px 8px 8px 0;
  transition: all 0.4s ease;
}
</style>
