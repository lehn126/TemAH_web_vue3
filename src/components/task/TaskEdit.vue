<template>
  <div>
    <NForm
      ref="ruleForm"
      size="small"
      :model="formData"
      :rules="rules"
      label-placement="left"
      label-width="auto"
      style="min-width: 460px"
    >
      <NFormItem v-if="!isCreateModel" path="jobId" label="任务ID">
        <NInput disabled v-model:value="formData.jobId"></NInput>
      </NFormItem>
      <NFormItem path="beanName" label="设备类型">
        <NSelect
          v-model:value="formData.beanName"
          :options="beanNameOptions"
          placeholder="请选择设备类型"
        ></NSelect>
      </NFormItem>
      <NFormItem path="methodName" label="任务类型">
        <NSelect
          v-model:value="formData.methodName"
          :options="methodNameOptions"
          placeholder="请选择任务类型"
        ></NSelect>
      </NFormItem>
      <NFormItem path="methodParams" label="任务参数">
        <NInput
          type="textarea"
          v-model:value="formData.methodParams"
          @keydown.enter.prevent
        ></NInput>
      </NFormItem>
      <NFormItem path="cronExpression" label="Cron表达式">
        <NInput v-model:value="formData.cronExpression" @keydown.enter.prevent></NInput>
      </NFormItem>
      <NFormItem path="jobStatus" label="任务状态">
        <NSwitch v-model:value="formData.jobStatus"></NSwitch>
      </NFormItem>
      <NFormItem path="remark" label="备注">
        <NInput type="textarea" v-model:value="formData.remark" @keydown.enter.prevent></NInput>
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
  return {
    jobId: getFieldValue(newData, 'job_id', ''),
    beanName: getFieldValue(newData, 'bean_name', ''),
    methodName: getFieldValue(newData, 'method_name', ''),
    methodParams: getFieldValue(newData, 'method_params', ''),
    cronExpression: getFieldValue(newData, 'cron_expression', ''),
    remark: getFieldValue(newData, 'remark', ''),
    jobStatus: getFieldValue(newData, 'job_status', 0) === 1
  }
}

// 转换form data为API dto使用的格式
function transformFormData(formData) {
  const apiData = {
    jobId: formData.jobId === '' ? null : formData.jobId,
    beanName: formData.beanName,
    methodName: formData.methodName,
    methodParams: formData.methodParams,
    cronExpression: formData.cronExpression,
    remark: formData.remark,
    jobStatus: formData.jobStatus ? 1 : 0
  }
  return apiData
}

export default {
  name: 'TaskEdit'
}
</script>
<script setup>
import { NButton, NForm, NFormItem, NInput, NSpace, NSelect, NSwitch, useMessage } from 'naive-ui'
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
  },
  initDisabled: {
    required: false,
    type: Boolean
  }
})

const emit = defineEmits(['submit-edit'])

const isCreateModel = ref(props.isCreate ? true : false)
const isDisabled = ref(props.initDisabled)
const submitButtonValue = ref(props.isCreate ? '立即创建' : '提交修改')

const formData = ref({
  jobId: String(getFieldValue(props.initData, 'job_id', '')),
  beanName: getFieldValue(props.initData, 'bean_name', ''),
  methodName: getFieldValue(props.initData, 'method_name', ''),
  methodParams: getFieldValue(props.initData, 'method_params', ''),
  cronExpression: getFieldValue(props.initData, 'cron_expression', ''),
  remark: getFieldValue(props.initData, 'remark', ''),
  jobStatus: getFieldValue(props.initData, 'job_status', 0) === 1
})

const beanNameOptions = ref([
  {
    label: '本地设备',
    value: 'localPlatformStateTask'
  },
  {
    label: '远程设备',
    value: 'remotePlatformStateTask'
  }
])

const methodNameOptions = ref([
  {
    label: 'CPU负载监控',
    value: 'getUsedCpu'
  },
  {
    label: '内存占用监控',
    value: 'getUsedMemory'
  }
])

const rules = {
  jobId: [{ required: !isCreateModel.value, message: 'ID不能为空', trigger: 'change' }],
  beanName: [{ required: true, message: '请选择设备类型', trigger: ['blur', 'change'] }],
  methodName: [{ required: true, message: '请选择任务类型', trigger: ['blur', 'change'] }],
  methodParams: [
    { required: true, message: '请输入任务参数', trigger: ['blur', 'change'] },
    {
      min: 1,
      max: 255,
      message: '长度在 1 到 255 个字符',
      trigger: ['blur', 'change']
    }
  ],
  cronExpression: [
    { required: true, message: '请输入Cron表达式', trigger: ['blur', 'change'] },
    {
      min: 1,
      max: 255,
      message: '长度在 1 到 255 个字符',
      trigger: ['blur', 'change']
    }
  ],
  remark: [
    {
      min: 1,
      max: 255,
      message: '长度在 1 到 255 个字符',
      trigger: ['blur', 'change']
    }
  ]
}

function submitForm() {
  ruleForm.value?.validate((errors) => {
    if (!errors) {
      message.success('提交成功')
      disable()
      const alarmData = transformFormData(formData.value)
      emit('submit-edit', alarmData)
    } else {
      console.log(errors)
      message.error('提交失败')
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
