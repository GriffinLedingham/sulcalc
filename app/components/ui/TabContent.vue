<template>
  <div>
    <ul class="nav nav-tabs" role="tablist">
      <li
        v-for="tab in tabs"
        :key="tab"
        role="presentation"
        class="nav-item nav-link clickable-control"
        :class="{ active: isActive(tab) }"
        @click="selectTab(tab)"
      >
        {{ tab }}
      </li>
    </ul>

    <div class="tab-content">
      <div
        v-for="tab in tabs"
        :key="tab"
        class="tab-pane"
        :class="{ active: isActive(tab) }"
      >
        <slot :name="tab"></slot>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    tabs: {
      required: true,
      type: Array,
      validator(value) {
        return value.every(item => typeof item === "string");
      }
    }
  },
  data() {
    return {
      activeTab: this.tabs[0]
    };
  },
  methods: {
    selectTab(tab) {
      this.activeTab = tab;
    },
    isActive(tab) {
      return this.activeTab === tab;
    }
  }
};
</script>

<style scoped>
.clickable-control {
  cursor: pointer;
  user-select: none;
}
</style>
