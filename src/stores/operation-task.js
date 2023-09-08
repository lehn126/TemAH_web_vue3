import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useOperationTaskStore = defineStore('operationTask', () => {
  const operationTask = ref(null)
  function setOperationTask(taskData) {
    operationTask.value = taskData
  }
  return { operationTask, setOperationTask }
})
