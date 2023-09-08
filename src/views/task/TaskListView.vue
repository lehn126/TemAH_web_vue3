<template>
  <div class="task-list-container">
    <NDataTable
      :remote="true"
      :columns="columns"
      :data="listData"
      :bordered="true"
      :striped="true"
      size="small"
      :row-key="(rowData) => rowData.job_id"
      :row-props="rowProps"
      :loading="isLoading"
      :pagination="pagination"
      @update:page="handlePageChange"
      @update:sorter="handleSortChange"
      @update:checked-row-keys="handleSelectionChange"
    >
    </NDataTable>
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
    <NModal v-model:show="showTaskEditModel" preset="dialog" style="width: auto">
      <template #header>
        <div>编辑</div>
      </template>
      <div>
        <TaskEdit
          ref="taskEditCom"
          :is-create="false"
          :init-disabled="taskEditComInitDisabled"
          :init-data="editTaskData"
          @submit-edit="handleSubmitEdit"
        ></TaskEdit>
      </div>
      <div></div>
    </NModal>
  </div>
</template>
<script>
export default {
  name: 'TaskList'
}

function computeDropdownOptions(rowData) {
  const isEnable = rowData.job_status === 1
  return [
    {
      label: '编辑',
      key: 'edit',
      show: true
    },
    {
      label: () =>
        h('span', { style: { color: isEnable ? 'orange' : 'green' } }, isEnable ? '停止' : '启动'),
      key: isEnable ? 'stop' : 'start',
      show: true
    },
    {
      label: () => h('span', { style: { color: 'red' } }, '删除'),
      key: 'delete',
      show: true
    }
  ]
}
</script>
<script setup>
import taskApi from '../../api/task-api'
import TaskEdit from '../../components/task/TaskEdit.vue'
import { NDataTable, NDropdown, NModal, useDialog, useMessage, useNotification } from 'naive-ui'
import { useOperationTaskStore } from '../../stores/operation-task'
import { h, nextTick, ref, reactive, onMounted } from 'vue'

const dialog = useDialog()
const message = useMessage()
const notification = useNotification()
const operationTaskStore = useOperationTaskStore()

// 分页相关开始
const PAGE_SIZE = 10
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
  taskApi.getAll(notification, val, pageSize.value, sortBy.value, sortOrder.value, refreshPageData)
}

function refreshCurrentPage() {
  gotoPage(pageIndex.value)
}

function handlePageChange(val) {
  setLoading(true)
  gotoPage(val)
}

function handleSelectionChange(keys) {
  selectedRows.value = keys
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
// 分页相关结束

const idSelectColumn = {
  title: 'ID',
  key: 'job_id',
  type: 'selection'
}

const idColumn = {
  title: 'ID',
  key: 'job_id',
  sortOrder: false,
  sorter: true,
  resizable: true,
  ellipsis: {
    tooltip: true
  }
}

const beanNameColumn = {
  title: '设备类型',
  key: 'bean_name',
  sortOrder: false,
  sorter: true,
  resizable: true,
  ellipsis: {
    tooltip: true
  }
}

const methodNameColumn = {
  title: '任务类型',
  key: 'method_name',
  sortOrder: false,
  sorter: true,
  resizable: true,
  ellipsis: {
    tooltip: true
  }
}

const methodParamsColumn = {
  title: '任务参数',
  key: 'method_params',
  sorter: false,
  resizable: true,
  ellipsis: {
    tooltip: true
  }
}

const cronColumn = {
  title: 'Cron表达式',
  key: 'cron_expression',
  sorter: false,
  resizable: true,
  ellipsis: {
    tooltip: true
  }
}

const jobStatusColumn = {
  title: '状态',
  key: 'job_status',
  sortOrder: false,
  sorter: true,
  resizable: true,
  ellipsis: {
    tooltip: true
  },
  render: (rowData) => {
    return rowData.job_status === 1
      ? h('span', { style: { color: 'green' } }, '正常')
      : h('span', { style: { color: 'orange' } }, '暂停')
  }
}

const createTimeColumn = {
  title: '创建时间',
  key: 'create_time',
  sortOrder: false,
  sorter: true,
  resizable: true,
  ellipsis: {
    tooltip: true
  }
}

const updateTimeColumn = {
  title: '修改时间',
  key: 'update_time',
  sortOrder: false,
  sorter: true,
  resizable: true,
  ellipsis: {
    tooltip: true
  }
}

const columns = ref([
  idSelectColumn,
  idColumn,
  beanNameColumn,
  methodNameColumn,
  methodParamsColumn,
  cronColumn,
  jobStatusColumn,
  createTimeColumn,
  updateTimeColumn
])

// 下拉菜单相关开始
const showDropdown = ref(false)
const x = ref(0)
const y = ref(0)
let dropdownRowData = null
let dropdownRowIndex = 0

let dropdownOptions = ref([])

// 右键点击后执行这里return的onContextmenu方法内容
function rowProps(rowData, rowIndex) {
  return {
    onContextmenu: (e) => {
      dropdownRowData = rowData
      dropdownRowIndex = rowIndex
      e.preventDefault()
      showDropdown.value = false
      nextTick().then(() => {
        dropdownOptions.value = computeDropdownOptions(rowData)
        showDropdown.value = true
        x.value = e.clientX
        y.value = e.clientY
      })
    }
  }
}

function deleteTask(row) {
  const taskId = row.job_id
  dialog.warning({
    title: '删除',
    content: `此操作将删除任务 [${taskId}], 是否继续?`,
    positiveText: '确定',
    negativeText: '取消',
    onPositiveClick: () => {
      taskApi.deleteTask(notification, taskId, () => {
        // message.success(`任务 [${taskId}] 删除操作成功`)
        dropdownRowData = null
        dropdownRowIndex = 0
        refreshCurrentPage()
      })
    },
    onNegativeClick: () => {
      message.info('已取消操作')
      dropdownRowData = null
      dropdownRowIndex = 0
    }
  })
}

function updateTaskStatus(index, row, newStatus) {
  const action = newStatus === 0 ? '停止' : '启动'
  const taskId = row.job_id
  dialog.warning({
    title: action,
    content: `此操作将${action}任务 [${taskId}], 是否继续?`,
    positiveText: '确定',
    negativeText: '取消',
    onPositiveClick: () => {
      taskApi.updateTaskStatus(notification, taskId, newStatus, () => {
        const rowData = listData.value[index]
        if (rowData && rowData.job_id === taskId) {
          rowData.job_status = newStatus
        } else {
          refreshCurrentPage()
        }

        dropdownRowData = null
        dropdownRowIndex = 0
      })
    },
    onNegativeClick: () => {
      message.info('已取消操作')
      dropdownRowData = null
      dropdownRowIndex = 0
    }
  })
}

function handleDropDownSelect(key) {
  showDropdown.value = false
  if (key === 'edit') {
    operationTaskStore.setOperationTask(dropdownRowData)
    editTask()
  } else if (key === 'start') {
    updateTaskStatus(dropdownRowIndex, dropdownRowData, 1)
  } else if (key === 'stop') {
    updateTaskStatus(dropdownRowIndex, dropdownRowData, 0)
  } else if (key === 'delete') {
    deleteTask(dropdownRowData)
  }
}

function handleDropDownClickOutside() {
  showDropdown.value = false
  dropdownRowData = null
  dropdownRowIndex = 0
}
// 下拉菜单相关结束

onMounted(() => {
  setLoading(true)
  closeTaskEditModel()
  gotoPage(1)
})

// 编辑界面相关开始
const showTaskEditModel = ref(false)
const taskEditCom = ref(null)
const editTaskData = ref(null)
const taskEditComInitDisabled = ref(true)
function openTaskEditModel(initEnabled) {
  taskEditComInitDisabled.value =
    initEnabled === undefined || initEnabled == null ? true : !initEnabled
  showTaskEditModel.value = true
}
function closeTaskEditModel() {
  taskEditComInitDisabled.value = true
  showTaskEditModel.value = false
}
function editTask() {
  const taskId = dropdownRowData?.job_id
  if (taskId) {
    // 如果store里有那么就拿来先填界面，然后请求restful API获取
    // 如果store中的id和请求的id不一样，请求restful API获取
    const operationTask = operationTaskStore.operationTask
    const storeTaskId = operationTask?.job_id
    if (taskId === storeTaskId) {
      editTaskData.value = operationTask
      openTaskEditModel(true)
    } else {
      editTaskData.value = null
      openTaskEditModel(false)
      taskApi.getTask(notification, taskId, (response) => {
        const respData = response.data
        operationTaskStore.setOperationTask(respData)
        editTaskData.value = respData
        taskEditCom.value.enable()
      })
    }
  } else {
    notification.error({
      title: '告警ID不能为空',
      message: '操作失败, 请求的告警ID不能为空',
      duration: 3000
    })
  }
}
function handleSubmitEdit(data) {
  if (data) {
    taskApi.updateTask(notification, data, () => {
      closeTaskEditModel()
      taskEditCom.value.enable()
      refreshCurrentPage()
    })
  }
}
// 编辑界面相关结束
</script>
<style>
.task-list-container {
  width: 100%;
  min-height: 540px;
}
</style>
