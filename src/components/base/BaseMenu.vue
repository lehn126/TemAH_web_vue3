<template>
  <div class="nav">
    <NLayout :has-sider="true">
      <NLayoutSider bordered show-trigger collapse-mode="width" :collapsed-width="60" :width="160">
        <NMenu :options="menuOptions"></NMenu>
      </NLayoutSider>
      <NLayoutContent>
        <div class="nav-container">
          <router-view v-slot="{ Component }">
            <transition name="slide-right" mode="out-in" appear>
              <component :is="Component" />
            </transition>
          </router-view>
        </div>
      </NLayoutContent>
    </NLayout>
  </div>
</template>
<script>
export default {
  name: 'BaseMenu'
}
</script>
<script setup>
import { NMenu, NIcon, NLayout, NLayoutSider, NLayoutContent } from 'naive-ui'
import { RouterLink } from 'vue-router'
import { ref, h } from 'vue'

const props = defineProps({
  menuItems: {
    type: Array,
    required: true
  }
})

function renderIcon(icon) {
  return () => h(NIcon, null, { default: () => h(icon) })
}

const menuOptions = props.menuItems
  ? ref(
      props.menuItems.map((menuItem) => {
        return {
          label: () =>
            h(
              RouterLink,
              {
                to: {
                  name: menuItem.routeName
                }
              },
              { default: () => menuItem.title }
            ),
          key: menuItem.index,
          icon: renderIcon(menuItem.icon)
        }
      })
    )
  : ref([])
</script>
<style scoped>
.nav {
  border: 1px solid #67c23a;
  border-radius: 3px;
  padding: 8px;
}
.nav-container {
  display: flex;
  width: 100%;
  justify-content: center;
  /* align-items: center; */
  margin-left: 8px;
}
</style>
