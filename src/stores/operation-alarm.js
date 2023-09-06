import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useOperationAlarmStore = defineStore('operationAlarm', () => {
    const operationAlarm = ref(null);
    function setOperationAlarm(alarmData) {
        operationAlarm.value = alarmData;
    };
    return { operationAlarm, setOperationAlarm, }
});