<template>
  <div>
    <NForm
      ref="ruleForm"
      size="small"
      :model="formData"
      :rules="rules"
      label-placement="left"
      label-width="auto"
      style="min-width: 400px;"
    >
      <NFormItem v-if="!isCreateModel" path="id" label="AlarmID">
        <NInput disabled v-model:value="formData.id" @keydown.enter.prevent></NInput>
      </NFormItem>
      <NFormItem path="managedObject" label="ManagedObject">
        <NInput v-model:value="formData.managedObject" @keydown.enter.prevent></NInput>
      </NFormItem>
      <NFormItem path="eventTime" label="EventTime">
        <NDatePicker v-model:value="formData.eventTime" type="datetime" clearable></NDatePicker>
      </NFormItem>
      <NFormItem path="alarmType" label="AlarmType">
        <NSelect
          v-model:value="formData.alarmType"
          :options="alarmTypeOptions"
          placeholder="请选择AlarmType"
        ></NSelect>
      </NFormItem>
      <NFormItem path="perceivedSeverity" label="Severity">
        <NSelect
          v-model:value="formData.perceivedSeverity"
          :options="perceivedSeverityOptions"
          placeholder="请选择Severity"
        ></NSelect>
      </NFormItem>
      <NFormItem path="probableCause" label="ProbableCause">
        <NInput v-model:value="formData.probableCause" @keydown.enter.prevent></NInput>
      </NFormItem>
      <NFormItem path="specificProblem" label="SpecificProblem">
        <NInput v-model:value="formData.specificProblem" @keydown.enter.prevent></NInput>
      </NFormItem>
      <NFormItem path="clearFlag" label="Cleared">
        <NSwitch v-model:value="formData.clearFlag"></NSwitch>
      </NFormItem>
      <NFormItem path="terminateState" label="Terminated">
        <NSwitch v-model:value="formData.terminateState"></NSwitch>
      </NFormItem>
      <NFormItem path="additionalText" label="AdditionalText">
        <NInput type="textarea" v-model:value="formData.additionalText"></NInput>
      </NFormItem>
    </NForm>
    <NSpace justify="center">
      <NButton :disabled="isDisabled" type="info" size="small" @click="submitForm">{{
        submitButtonValue
      }}</NButton>
      <NButton :disabled="isDisabled" type="default" size="small" @click="resetForm">重置</NButton>
    </NSpace>
  </div>
</template>
<script>
// 根据props传入的数据初始化form内的数据
function computeInitData(newData) {
  console.log(getFieldValue(newData, 'additionalText', ''))

  return {
    id: getFieldValue(newData, 'id', ''),
    managedObject: getFieldValue(newData, 'managedObject', ''),
    eventTime: new Date(getFieldValue(newData, 'eventTime', Date.now())).getTime(),
    alarmType: getFieldValue(newData, 'alarmType', ''),
    perceivedSeverity: getFieldValue(newData, 'perceivedSeverity', ''),
    probableCause: getFieldValue(newData, 'probableCause', ''),
    specificProblem: getFieldValue(newData, 'specificProblem', ''),
    clearFlag: getFieldValue(newData, 'clearFlag', false),
    terminateState: getFieldValue(newData, 'terminateState', false),
    additionalText: getFieldValue(newData, 'additionalText', '')
  }
}

// 转换form data为alarm dto使用的格式
function transformAlarmData(formData) {
  const alarmData = {
    id: formData.id === '' ? null : parseInt(formData.id, 10),
    managedObject: formData.managedObject,
    eventTime: formatRFC3339(new Date(formData.eventTime), { fractionDigits: 3 }),
    alarmType: formData.alarmType,
    perceivedSeverity: formData.perceivedSeverity,
    probableCause: formData.probableCause,
    specificProblem: formData.specificProblem,
    clearFlag: formData.clearFlag ? 1 : 0,
    terminateState: formData.terminateState ? 1 : 0,
    additionalText: formData.additionalText
  }
  return alarmData
}

export default {
  name: 'AlarmEdit'
}
</script>
<script setup>
import { formatRFC3339 } from 'date-fns'
import {
  NButton,
  NDatePicker,
  NForm,
  NFormItem,
  NInput,
  NSpace,
  NSelect,
  NSwitch,
  useMessage
} from 'naive-ui'
import { ref, watch } from 'vue'
import getFieldValue from '../../utils/object-utils'

const message = useMessage()
const ruleForm = ref(null)

const props = defineProps({
  isCreate: {
    required: true,
    type: Boolean
  },
  initData: {
    required: false,
    type: Object
  }
})

const emit = defineEmits(['submit-edit'])

const isCreateModel = ref(props.isCreate ? true : false)
const isDisabled = ref(false)
const submitButtonValue = ref(props.isCreate ? '立即创建' : '提交修改')

const formData = ref({
  id: getFieldValue(props.initData, 'id', ''),
  managedObject: getFieldValue(props.initData, 'managedObject', ''),
  eventTime: new Date(getFieldValue(props.initData, 'eventTime', Date.now())).getTime(),
  alarmType: getFieldValue(props.initData, 'alarmType', ''),
  perceivedSeverity: getFieldValue(props.initData, 'perceivedSeverity', ''),
  probableCause: getFieldValue(props.initData, 'probableCause', ''),
  specificProblem: getFieldValue(props.initData, 'specificProblem', ''),
  clearFlag: getFieldValue(props.initData, 'clearFlag', false),
  terminateState: getFieldValue(props.initData, 'terminateState', false),
  additionalText: getFieldValue(props.initData, 'additionalText', '')
})

const alarmTypeOptions = ref([
  {
    label: 'CommunicationsAlarm',
    value: 'CommunicationsAlarm'
  },
  {
    label: 'ProcessingErrorAlarm',
    value: 'ProcessingErrorAlarm'
  },
  {
    label: 'EnvironmentalAlarm',
    value: 'EnvironmentalAlarm'
  },
  {
    label: 'QualityOfServiceAlarm',
    value: 'QualityOfServiceAlarm'
  },
  {
    label: 'EquipmentAlarm',
    value: 'EquipmentAlarm'
  }
])

const perceivedSeverityOptions = ref([
  {
    label: 'Cleared',
    value: 'Cleared'
  },
  {
    label: 'Indeterminate',
    value: 'Indeterminate'
  },
  {
    label: 'Critical',
    value: 'Critical'
  },
  {
    label: 'Major',
    value: 'Major'
  },
  {
    label: 'Minor',
    value: 'Minor'
  },
  {
    label: 'Warning',
    value: 'Warning'
  }
])

const rules = {
  id: [{ required: !isCreateModel.value, message: 'ID不能为空', trigger: 'change' }],
  managedObject: [
    { required: true, message: '请输入ManagedObject', trigger: ['blur', 'change'] },
    {
      min: 3,
      max: 255,
      message: '长度在 3 到 255 个字符',
      trigger: ['blur', 'change']
    }
  ],
  eventTime: [
    {
      required: true,
      type: 'number',
      message: '请选择时间',
      trigger: ['blur', 'change']
    }
  ],
  alarmType: [{ required: true, message: '请选择AlarmType', trigger: ['blur', 'change'] }],
  perceivedSeverity: [{ required: true, message: '请选择Severity', trigger: ['blur', 'change'] }]
}

function submitForm() {
  ruleForm.value?.validate((errors) => {
    if (!errors) {
      message.success('Valid')
      disable()
      const alarmData = transformAlarmData(formData.value)
      emit('submit-edit', alarmData)
    } else {
      console.log(errors)
      message.error('Invalid')
    }
  })
}

function resetForm() {
  formData.value = computeInitData(props.initData)
}

function enable() {
  isDisabled.value = false
}

function disable() {
  isDisabled.value = true
}

watch(
  () => props.initData,
  () => {
    formData.value = computeInitData(props.initData)
  }
)

// 使用了 <script setup> 的组件是默认私有的：
// 一个父组件无法访问到一个使用了 <script setup> 的子组件中的任何东西，
// 除非子组件在其中通过 defineExpose 宏显式暴露：
defineExpose({
  resetForm,
  enable,
  disable
})
</script>
<style></style>
