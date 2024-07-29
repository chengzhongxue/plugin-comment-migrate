import type {
  MigrateComment,
  MigrateReply,
  MigrateData
} from "@/types";
import type { Comment, MyData } from "./types";

interface useWalineDataParserReturn {
  parse: () => Promise<MigrateData>;
}

export function useWalineDataParser(file: File): useWalineDataParserReturn {
  const parse = (): Promise<MigrateData> => {
    return new Promise<MigrateData>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const walineData = JSON.parse(event.target?.result as string) as MyData;
        const data = walineData.data;

        if (!data) {
          reject("Failed to parse data. No data found");
        }

        try {
          const { Comment } = data;
          resolve({
            comments: parseComments(Comment),
          });
        } catch (error) {
          reject("Failed to parse data. error -> " + error);
        }
      };
      reader.onerror = () => {
        reject("Failed to fetch data");
      };
      reader.readAsText(file);
    });
  };

  // 函数来处理评论数据
  const parseComments = (myComment: Comment[]): (MigrateComment | MigrateReply)[] => {
    const comments: (MigrateComment | MigrateReply)[] = [];
    
    myComment?.forEach((item:Comment) => {
      const refType = item.url?.includes("archives") ? "Post" : item.url == '/links' ? "Plugin" :
        item.url?.includes("moments") ? "Moment" : "SinglePage";
      if (item.pid != "" && item.pid != null) {
        comments.push(createReply(item, refType));
      } else {
        comments.push(createComment(item, refType));
      }
    });
    
    return comments;
  };

  function extractMomentId(url: string): string | "" {
    // 找到最后一个斜杠的位置
    const lastSlashIndex = url.lastIndexOf('/');
    // 如果找不到斜杠，则返回 null
    if (lastSlashIndex === -1) {
      return "/";
    }
    // 使用 slice 方法截取字符串，从最后一个斜杠位置的下一个字符开始到末尾
    const momentId = url.slice(lastSlashIndex + 1);
    return momentId;
  }


  const createComment = (
    comment: Comment,
    refType: "Post" | "SinglePage" | "Plugin" | "Moment",
  ): MigrateComment => {
    const url = comment.url == null ? "/" : comment.url;
    return {
      refType: refType,
      kind: "Comment",
      apiVersion: "content.halo.run/v1alpha1",
      spec: {
        raw: comment.comment,
        content: comment.comment,
        owner: {
          kind: "Email",
          name: comment.mail,
          displayName: comment.nick,
          annotations: {
            website: comment.link == null ? "" : comment.link,
          },
        },
        userAgent: comment.ua,
        ipAddress: comment.ip,
        priority: 0,
        top: false,
        allowNotification: true,
        approved: true,
        approvedTime: new Date(comment.createdAt).toISOString(),
        creationTime: new Date(comment.createdAt).toISOString(),
        hidden: false,
        subjectRef: {
          kind: refType,
          group: refType == "Plugin" ? "plugin.halo.run" :  refType == "Moment" ? "moment.halo.run" : "content.halo.run",
          version: "v1alpha1",
          name: refType == "Plugin" ? 'PluginLinks' :  refType == "Moment" ? extractMomentId(url) : url,
        },
        lastReadTime: undefined,
      },
      metadata: {
        name: comment.objectId,
      },
    };
  };

  const createReply = (
    reply: Comment,
    refType: "Post" | "SinglePage" | "Plugin" | "Moment",
  ): MigrateReply => {
    const migrateReply: MigrateReply = {
      refType: refType,
      kind: "Reply",
      apiVersion: "content.halo.run/v1alpha1",
      metadata: {
        name: reply.objectId,
      },
      spec: {
        raw: reply.comment,
        content: reply.comment,
        owner: {
          kind: "Email",
          name: reply.mail,
          displayName: reply.nick,
          annotations: {
            website: reply.link == null ? "" : reply.link,
          },
        },
        userAgent: reply.ua,
        ipAddress: reply.ip,
        priority: 0,
        top: false,
        allowNotification: true,
        approved: true,
        approvedTime: new Date(reply.createdAt).toISOString(),
        creationTime: new Date(reply.createdAt).toISOString(),
        hidden: false,
        commentName: reply.rid,
      },
      status:{}
    }
    if (reply.pid === reply.rid || !reply.pid) {
    } else {
      migrateReply.spec.quoteReply = reply.pid;
    }
    return migrateReply;
  };
  
  return {
    parse,
  };
}
