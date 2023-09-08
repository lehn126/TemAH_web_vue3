<template>
  <div class="create-container">
    <TaskEdit ref="taskEditCom" :is-create="true" @submit-edit="submitCreate"></TaskEdit>
  </div>
</template>
<script>
export default {
  name: 'TaskCreate'
}
</script>
<script setup>
import taskApi from '../../api/task-api'
import TaskEdit from '../../components/task/TaskEdit.vue'
import { useNotification } from 'naive-ui'
import { ref, onMounted } from 'vue'

const notification = useNotification()

const taskEditCom = ref(null)

function submitCreate(task) {
  if (task) {
    taskApi.createTask(notification, task, () => {
      taskEditCom.value.resetForm()
      taskEditCom.value.enable()
    })
  }
}

onMounted(() => {
  taskEditCom.value.enable()
})
</script>
<style scoped>
.create-container {
  margin-top: 16px;
}
</style>
