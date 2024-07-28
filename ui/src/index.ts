import { definePlugin } from "@halo-dev/console-shared";
import { markRaw } from "vue";
import SolarTransferHorizontalBoldDuotone from "~icons/solar/transfer-horizontal-bold-duotone";
import "./styles/tailwind.css";
import MigrateView from "./views/MigrateView.vue";

export default definePlugin({
  components: {},
  routes: [
    {
      parentName: 'ToolsRoot',
      route: {
        path: "/tools/comment-migrate",
        name: 'CommentMigrate',
        component: MigrateView,
        meta: {
          title: '评论迁移',
          description: '支持多种平台的评论迁移插件',
          searchable: true,
          permissions: ["plugin:comment:migrate:manage"],
          menu: {
            name: '评论迁移',
            icon: markRaw(SolarTransferHorizontalBoldDuotone),
            priority: 0,
          },
        },
      },
    },
  ],
  extensionPoints: {},
});
