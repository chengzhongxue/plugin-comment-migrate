import type {
  MigrateComment,
  MigrateData,
  MigrateReply,
} from "@/types";
import {
  coreApiClient,
  type Comment,
  type Reply,
} from "@halo-dev/api-client";
import type { AxiosResponse } from "axios";

export interface MigrateRequestTask<T> {
  item: T;
  run: () => Promise<AxiosResponse<any, any>>;
}

interface useMigrateTaskReturn {
  createCommentAndReplyTasks: () => MigrateRequestTask<
    MigrateComment | MigrateReply
  >[];
}

class CommentTask implements MigrateRequestTask<MigrateComment> {
  item: MigrateComment;
  constructor(item: MigrateComment) {
    this.item = item;
  }

  async run() {
    return coreApiClient.content.comment.createComment({
      comment: this.item as Comment,
    });
  }
}

class ReplyTask implements MigrateRequestTask<MigrateReply> {
  item: MigrateReply;
  constructor(item: MigrateReply) {
    this.item = item;
  }

  async run() {
    return coreApiClient.content.reply.createReply({
      reply: this.item as Reply,
    });
  }
}

export function useMigrateTask(data: MigrateData): useMigrateTaskReturn {
  
  const createCommentAndReplyTasks = () => {
    const comments = data.comments || [];
    const commentTask: (CommentTask | ReplyTask)[] = [];

    comments.forEach((comment: MigrateComment | MigrateReply) => {
      if (comment instanceof Comment) {
        commentTask.push(new CommentTask(comment as MigrateComment));
      } else {
        commentTask.push(new ReplyTask(comment as MigrateReply));
      }
    });
    return commentTask;
  };

  return {
    createCommentAndReplyTasks,
  };
}
