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
  
  const createComment = (
    comment: Comment,
    refType: "Post" | "SinglePage" | "Plugin" | "Moment",
  ): MigrateComment => {
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
          name: refType == "Plugin" ? 'PluginLinks' : comment.url == null ? "/" : comment.url,
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
    return {
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
        quoteReply: reply.pid,
      },
      status:{}
    };
  };
  
  

  return {
    parse,
  };
}
