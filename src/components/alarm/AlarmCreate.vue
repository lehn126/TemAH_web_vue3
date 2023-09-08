<template>
  <div class="create-container">
    <AlarmEdit ref="alarmEditCom" :is-create="true" @submit-edit="submitCreate"></AlarmEdit>
  </div>
</template>
<script>
export default {
  name: 'AlarmCreate'
}
</script>
<script setup>
import alarmApi from '../../api/alarm-api'
import AlarmEdit from './AlarmEdit.vue'
import { useNotification } from 'naive-ui'
import { ref, onMounted } from 'vue'

const notification = useNotification()

const alarmEditCom = ref(null);

function submitCreate(alarm) {
  if (alarm) {
    alarmApi.createAlarms(notification, [alarm], () => {
      alarmEditCom.value.resetForm()
      alarmEditCom.value.enable()
    })
  }
}

onMounted(() => {
    alarmEditCom.value.enable();
})
</script>
<style scoped>
.create-container {
  margin-top: 16px;
}
</style>
