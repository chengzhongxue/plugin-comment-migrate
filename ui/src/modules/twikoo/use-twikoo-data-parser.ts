import type {
  MigrateComment,
  MigrateReply,
  MigrateData
} from "@/types";
import type { Data } from "./types";

interface useTwikooDataParserReturn {
  parse: () => Promise<MigrateData>;
}

export function useTwikooDataParser(file: File): useTwikooDataParserReturn {
  const parse = (): Promise<MigrateData> => {
    return new Promise<MigrateData>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const twikooRawData = JSON.parse(event.target?.result as string) as Data[];

        if (!twikooRawData) {
          reject("Failed to parse data. No data found");
        }

        try {
           
          resolve({
            comments: parseComments(twikooRawData),
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
  const parseComments = (items: Data[]): (MigrateComment | MigrateReply)[] => {
    const comments: (MigrateComment | MigrateReply)[] = [];
    items?.forEach((item) => {
      const refType = item.url.includes("archives") ? "Post" : item.url == '/links' ? "Plugin" : "SinglePage";
      if (item.rid != null && item.rid != "") {
        comments.push(createReply(item, refType));
      } else {
        comments.push(createComment(item, refType));
      }
    });
    
    return comments;
  };
  
  const createComment = (
    comment: Data,
    refType: "Post" | "SinglePage" | "Plugin",
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
            website: comment.link,
          },
        },
        userAgent: comment.ua,
        ipAddress: comment.ip,
        priority: 0,
        top: false,
        allowNotification: true,
        approved: true,
        approvedTime: new Date(comment.created).toISOString(),
        creationTime: new Date(comment.created).toISOString(),
        hidden: false,
        subjectRef: {
          kind: refType,
          group: refType == "Plugin" ? "plugin.halo.run" : "content.halo.run",
          version: "v1alpha1",
          name: refType == "Plugin" ? 'PluginLinks' : comment.url,
        },
        lastReadTime: undefined,
      },
      metadata: {
        name: comment.id,
      },
    };
  };

  const createReply = (
    reply: Data,
    refType: "Post" | "SinglePage" | "Plugin",
  ): MigrateReply => {
    const migrateReply: MigrateReply = {
      refType: refType,
      kind: "Reply",
      apiVersion: "content.halo.run/v1alpha1",
      metadata: {
        name: reply.id,
      },
      spec: {
        raw: reply.comment,
        content: reply.comment,
        owner: {
          kind: "Email",
          name: reply.mail,
          displayName: reply.nick,
          annotations: {
            website: reply.link,
          },
        },
        userAgent: reply.ua,
        ipAddress: reply.ip,
        priority: 0,
        top: false,
        allowNotification: true,
        approved: true,
        approvedTime: new Date(reply.created).toISOString(),
        creationTime: new Date(reply.created).toISOString(),
        hidden: false,
        commentName: reply.rid == null ? "" : reply.rid,
      },
      status:{}
    };
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
