import artalk from "@/assets/artalk.webp";
import twikoo from "@/assets/twikoo.png";
import waline from "@/assets/waline.webp";
import type { Provider } from "@/types";
import { defineAsyncComponent } from "vue";

// 新增的迁移数据来源，需要在此处进行注册
export const providerItems: Provider[] = [
  {
    name: "Artalk",
    icon: artalk,
    description: "从 Artalk 平台迁移",
    importComponent: defineAsyncComponent(
      () => import("./artalk/ArtalkMigrateDataParser.vue")
    ),
  },
  {
    name: "Twikoo",
    icon: twikoo,
    description: "从 Twikoo 平台迁移",
    importComponent: defineAsyncComponent(
      () => import("./twikoo/TwikooMigrateDataParser.vue")
    ),
  },
  {
    name: "Waline",
    icon: waline,
    description: "从 Waline 平台迁移",
    importComponent: defineAsyncComponent(
      () => import("./waline/WalineMigrateDataParser.vue")
    ),
  },
];
