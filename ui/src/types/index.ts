import type {
  Comment,
  Reply,
} from "@halo-dev/api-client";
import type { Component } from "vue";

export interface MigrationOption {
  attachmentFolderPath?: string;
}

export interface Provider {
  name: string;
  icon: string;
  description: string;
  importComponent?: string | Component;
  options?: MigrationOption;
}
export interface MigrateData {
  comments?: (MigrateComment | MigrateReply)[];
}

export interface MigrateComment extends Comment {
  refType: "Post" | "SinglePage" | "Moment" | "Plugin" ;
}

export interface MigrateReply extends Reply {
  refType: "Post" | "SinglePage" | "Moment" | "Plugin";
}
