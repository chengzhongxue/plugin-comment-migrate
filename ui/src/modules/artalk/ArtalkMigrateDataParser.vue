<script lang="ts" setup>
import FileSelector from "@/components/FileSelector.vue";
import type { MigrateData } from "@/types";
import { VAlert, VButton } from "@halo-dev/components";
import { useArtalkDataParser } from "./use-artalk-data-parser";

defineProps<{
  data: MigrateData;
}>();

const emit = defineEmits<{
  (event: "update:data", value: MigrateData): void;
}>();

const handleFileChange = (files: FileList) => {
  const file = files.item(0);
  if (!file) {
    return;
  }
  useArtalkDataParser(file)
    .parse()
    .then((data) => {
      emit("update:data", data);
    })
    .catch((error) => {
      console.error(error);
    });
};

function openDocument() {
  window.open(
    "https://docs.kunkunyu.com/docs/plugin-comment-migrate/artalk",
    "_blank"
  );
}
</script>

<template>
  <div class="migrate-space-y-4 sm:migrate-w-1/2">
    <VAlert title="注意事项" type="info" :closable="false" class="sheet">
      <template #description>
        <ul
          class="migrate-ml-2 migrate-list-inside migrate-list-disc migrate-space-y-1"
        >
          <li>在开始迁移前，建议先阅读关于 Artalk 迁移的文档。</li>
          <li>
            目前仅支持根据 Artalk 导出的 artrans
            文件自动迁移数据。
          </li>
          <li>
            迁移完成后，不建议立即删除 Artalk
            的数据文件，可以先检查数据是否完整。
          </li>
        </ul>
      </template>
      <template #actions>
        <VButton size="sm" type="secondary" @click="openDocument">
          查阅文档
        </VButton>
      </template>
    </VAlert>
    <FileSelector
      :options="{ accept: '.artrans', multiple: false }"
      @file-change="handleFileChange"
    ></FileSelector>
  </div>
</template>
