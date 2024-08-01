<script lang="ts" setup>
import FileSelector from "@/components/FileSelector.vue";
import type { MigrateData } from "@/types";
import { VAlert, VButton } from "@halo-dev/components";
import { useWalineDataParser } from "./use-waline-data-parser";
import type {Ref} from "vue";
import {ref} from "vue";

defineProps<{
  data: MigrateData;
}>();

const emit = defineEmits<{
  (event: "update:data", value: MigrateData): void;
}>();

/**
 * `Init` -> `Parsing` -> `Configure` -> `Parsing` -> `Parsed`
 */
enum State {
  Init,
  Parsing,
  Configure,
  Parsed,
}

const state: Ref<State> = ref(State.Init);
const errorMessage: Ref<string | null> = ref(null);
const errorModal = ref(false);


const handleFileChange = (files: FileList) => {
  const file = files.item(0);
  if (!file) {
    return;
  }
  useWalineDataParser(file)
    .parse()
    .then((data) => {
      onErrorModalClose()
      emit("update:data", data);
    })
    .catch((error) => {
      setErrorState(error);
      errorModal.value = true;
    });
};

function openDocument() {
  window.open(
    "https://docs.kunkunyu.com/docs/plugin-comment-migrate/waline",
    "_blank"
  );
}

function setErrorState(e: unknown) {
  state.value = State.Init;
  if (e instanceof Error) {
    errorMessage.value = e.message;
  } else {
    errorMessage.value = `${e}`;
  }
}

const onErrorModalClose = () => {
  errorMessage.value = null;
  errorModal.value = false;
};
</script>

<template>
  <div class="migrate-space-y-4 sm:migrate-w-1/2">
    <VAlert title="注意事项" type="info" :closable="false" class="sheet">
      <template #description>
        <ul
          class="migrate-ml-2 migrate-list-inside migrate-list-disc migrate-space-y-1"
        >
          <li>在开始迁移前，建议先阅读关于 Waline 迁移的文档。</li>
          <li>
            导入前需要先关闭 <b>通知设置</b>，不然就会收到通知轰炸，前往
            <b><a href="/console/settings?tab=notification">通知设置</a></b>
          </li>
          <li>
            目前仅支持根据 Waline 导出的 JSON
            文件自动迁移数据。
          </li>
          <li>
            迁移完成后，不建议立即删除 Waline
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
    <VAlert
      v-if="errorModal"
      class="sheet"
      title="错误"
      type="error"
      :description="errorMessage"
      @close="onErrorModalClose"
    />
    <FileSelector
      :options="{ accept: '.json', multiple: false }"
      @file-change="handleFileChange"
    ></FileSelector>
  </div>
</template>
