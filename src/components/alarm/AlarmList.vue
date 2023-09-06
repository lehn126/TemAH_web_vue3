<template>
  <div style="width: 100%">
    <div style="text-align: left; margin-bottom: 8px">
      <NButton
        type="info"
        size="small"
        :disabled="selectedRows.length <= 0"
        @click="handleTerminate"
        >Terminate</NButton
      >
    </div>
    <NDataTable
      :remote="true"
      :columns="columns"
      :data="listData"
      :bordered="true"
      :striped="true"
      size="small"
      :row-key="(alarm) => alarm.id"
      :row-props="rowProps"
      :loading="isLoading"
      :pagination="pagination"
      @update:page="handlePageChange"
      @update:sorter="handleSortChange"
      @update:checked-row-keys="handleSelectionChange"
    />
    <NDropdown
      placement="bottom-start"
      trigger="manual"
      :x="x"
      :y="y"
      :options="dropdownOptions"
      :show="showDropdown"
      :on-clickoutside="handleDropDownClickOutside"
      @select="handleDropDownSelect"
    />
  </div>
</template>
<script>
const PAGE_SIZE = 10

export default {
  name: 'AlarmList'
}

const dropdownOptionsNoClear = [
  {
    label: '编辑',
    key: 'edit'
  },
  {
    label: () => h('span', { style: { color: 'red' } }, 'Clear'),
    key: 'clear',
    show: false
  }
]

const dropdownOptionsClear = [
  {
    label: '编辑',
    key: 'edit'
  },
  {
    label: () => h('span', { style: { color: 'red' } }, 'Clear'),
    key: 'clear',
    show: true
  }
]
</script>
<script setup>
import alarmApi from '../../api/alarm-api'
import { useOperationAlarmStore } from '../../stores/operation-alarm.js'
import { NDataTable, NDropdown, useDialog, useMessage, useNotification, NButton } from 'naive-ui'
import { h, nextTick, ref, reactive, onMounted } from 'vue'

// const emit = defineEmits(['alarm-dblclick']);

const dialog = useDialog()
const message = useMessage()
const notification = useNotification()
const operationAlarmStore = useOperationAlarmStore()

const listData = ref([])
const selectedRows = ref([])
const maxCount = ref(0)
const maxPage = ref(0)
const pageIndex = ref(0)
const pageSize = ref(PAGE_SIZE)
const sortBy = ref('')
const sortOrder = ref('')

const isLoading = ref(false)
const pagination = reactive({
  size: 'small',
  page: pageIndex,
  pageCount: maxPage,
  pageSize: pageSize,
  itemCount: maxCount,
  showQuickJumper: true,
  prefix({ itemCount }) {
    return `共 ${itemCount} 条`
  },
  suffix() {
    return '页'
  },
  goto() {
    return '前往'
  }
})

const idSelectColumn = {
  title: 'ID',
  key: 'id',
  type: 'selection'
}

const idColumn = {
  title: 'ID',
  key: 'id',
  sortOrder: false,
  sorter: true,
  resizable: true,
  ellipsis: {
    tooltip: true
  }
}

const moColumn = {
  title: 'ManagedObject',
  key: 'managedObject',
  sortOrder: false,
  sorter: true,
  resizable: true,
  ellipsis: {
    tooltip: true
  }
}

const eventTimeColumn = {
  title: 'EventTime',
  key: 'eventTime',
  sortOrder: false,
  sorter: true,
  resizable: true,
  ellipsis: {
    tooltip: true
  }
}

const alarmTypeColumn = {
  title: 'AlarmType',
  key: 'alarmType',
  sortOrder: false,
  sorter: true,
  resizable: true,
  ellipsis: {
    tooltip: true
  }
}

const perceivedSeverityColumn = {
  title: 'Severity',
  key: 'perceivedSeverity',
  sortOrder: false,
  sorter: true,
  resizable: true,
  ellipsis: {
    tooltip: true
  }
}

const clearColumn = {
  title: 'clear',
  key: 'clearFlag',
  sortOrder: false,
  sorter: true,
  resizable: true,
  ellipsis: {
    tooltip: true
  },
  render: (rowData) => {
    return rowData.clearFlag === 0
      ? h('span', { style: { color: 'green' } }, 'NOT_CLEARED')
      : h('span', { style: { color: 'red' } }, 'CLEARED')
  }
}

const terminateStateColumn = {
  title: 'Terminate',
  key: 'terminateState',
  sortOrder: false,
  sorter: true,
  resizable: true,
  ellipsis: {
    tooltip: true
  },
  render: (rowData) => {
    return rowData.terminateState === 0
      ? h('span', { style: { color: 'green' } }, 'NOT_TERMINATED')
      : h('span', { style: { color: 'red' } }, 'TERMINATED')
  }
}

const additionalTextColumn = {
  title: 'AdditionalText',
  key: 'additionalText',
  sorter: false,
  resizable: true,
  ellipsis: {
    tooltip: true
  }
}

const columns = ref([
  idSelectColumn,
  idColumn,
  moColumn,
  eventTimeColumn,
  alarmTypeColumn,
  perceivedSeverityColumn,
  clearColumn,
  terminateStateColumn,
  additionalTextColumn
])

const showDropdown = ref(false)
const x = ref(0)
const y = ref(0)
const dropdownRowData = ref(null)

let dropdownOptions = ref(dropdownOptionsClear)

function handleDropDownSelect(key, option) {
  showDropdown.value = false
  if (key === 'edit') {
    console.log('edit')
    operationAlarmStore.setOperationAlarm(dropdownRowData.value)
  } else {
    dialog.warning({
      title: option.label,
      content: key === 'clear' ? `确定Clear告警 [${dropdownRowData.value.id}]?` : '确定执行操作?',
      positiveText: '确定',
      negativeText: '取消',
      onPositiveClick: () => {
        alarmApi.clearAlarm(notification, dropdownRowData.value.id, () => {
          // message.success(`告警 [${dropdownRowData.value.id}] Clear操作成功`)
          dropdownRowData.value = null
          refreshCurrentPage()
        })
      },
      onNegativeClick: () => {
        message.info('已取消操作')
        dropdownRowData.value = null
      }
    })
  }
}
function handleDropDownClickOutside() {
  showDropdown.value = false
  dropdownRowData.value = null
}

function rowProps(rowData) {
  return {
    onContextmenu: (e) => {
      dropdownRowData.value = rowData
      e.preventDefault()
      showDropdown.value = false
      nextTick().then(() => {
        // 如果已经clear则去掉clear选项
        dropdownOptions.value =
          rowData.clearFlag === 0 ? dropdownOptionsClear : dropdownOptionsNoClear
        showDropdown.value = true
        x.value = e.clientX
        y.value = e.clientY
      })
    }
  }
}

function setLoading(val) {
  isLoading.value = val
}

function refreshPageData(respData) {
  listData.value = respData.data.pageData
  maxCount.value = respData.data.maxCount
  maxPage.value = respData.data.maxPage
  pageIndex.value = respData.data.pageIndex
  pageSize.value = respData.data.pageSize
  setLoading(false)
}

function gotoPage(val) {
  alarmApi.getAll(
    notification.value,
    val,
    pageSize.value,
    sortBy.value,
    sortOrder.value,
    refreshPageData
  )
}

function refreshCurrentPage() {
  alarmApi.getAll(
    notification,
    pageIndex.value,
    pageSize.value,
    sortBy.value,
    sortOrder.value,
    refreshPageData
  )
}

function handlePageChange(val) {
  setLoading(true)
  gotoPage(val)
}

function handleTerminate() {
  dialog.warning({
    title: '提示',
    content: `此操作将Terminate选定的告警, 是否继续?`,
    positiveText: '确定',
    negativeText: '取消',
    onPositiveClick: () => {
      alarmApi.terminateAlarms(notification, selectedRows.value.join(','), () => {
        // message.success('Terminate操作成功')
        refreshCurrentPage()
      })
    },
    onNegativeClick: () => {
      message.info('已取消操作')
    }
  })
}

function handleSortChange(sorter) {
  sortBy.value = sorter.columnKey
  sortOrder.value = sorter.order === 'ascend' ? 'asc' : 'desc'
  // NativeUI 要手动修改排序图标
  columns.value.forEach((column) => {
    if (!sorter) {
      column.sortOrder = false
      return
    }
    if (column.key === sorter.columnKey) {
      column.sortOrder = sorter.order
    } else {
      column.sortOrder = false
    }
  })
  refreshCurrentPage()
}

function handleSelectionChange(keys) {
  selectedRows.value = keys
}

onMounted(() => {
  setLoading(true)
  gotoPage(1)
})
</script>
<style></style>
