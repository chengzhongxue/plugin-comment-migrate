<script setup lang="ts">
import type { MigrateData, Provider } from "../types";
import MigratePreviewItem from "@/components/MigratePreviewItem.vue";
import { computed, ref } from "vue";

interface Item {
  name: string;
  dataList?: any[];
}

const props = defineProps<{
  data: MigrateData;
  provider?: Provider;
}>();

const items = computed<Item[]>(() => {
  return [
    {
      name: "评论及回复",
      dataList: props.data.comments,
    },
  ] as Item[];
});

// TODO: 可以在此处对要导入的数据进行过滤
const selectData = ref(props.data);

const emit = defineEmits<{
  (event: "import", value: MigrateData): void;
}>();

const handleImport = () => {
  // 触发导入事件
  emit("import", selectData.value);
};
</script>
<template>
  <div>
    <ul class="migrate-divide-y migrate-divide-gray-100">
      <MigratePreviewItem
        v-for="item in items"
        :key="item.name"
        :name="item.name"
        :dataList="item.dataList"
      ></MigratePreviewItem>
    </ul>
  </div>
</template>
