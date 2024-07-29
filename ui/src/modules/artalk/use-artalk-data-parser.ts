import type {
  MigrateComment,
  MigrateReply,
  MigrateData
} from "@/types";
import type { Data } from "./types";

interface useArtalkDataParserReturn {
  parse: () => Promise<MigrateData>;
}

export function useArtalkDataParser(file: File): useArtalkDataParserReturn {
  const parse = (): Promise<MigrateData> => {
    return new Promise<MigrateData>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const artalkRawData = JSON.parse(event.target?.result as string) as Data[];

        if (!artalkRawData) {
          reject("Failed to parse data. No data found");
        }

        try {
           
          resolve({
            comments: parseComments(artalkRawData),
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
      const refType = item.page_key.includes("archives") ? "Post" : item.page_key == '/links' ? "Plugin" : "SinglePage";
      if (item.rid === "0") {
        comments.push(createComment(item, refType));
      } else {
        const commentName = findTopLevelId(items,item.id);
        const quoteReply = item.rid;
        comments.push(createReply(item, refType,commentName as string,quoteReply as string));
      }
    });
    return comments;
  };


  function findTopLevelId(elements: Data[], idToFind: string): string | null {
    // 构建一个映射，便于快速查找每个元素的父元素
    const parentMap: Record<string, string> = {};
    for (const element of elements) {
      parentMap[element.id] = element.rid;
    }

    // 从指定的 id 开始，追溯到顶级 id
    let currentId = idToFind;
    while (parentMap[currentId] !== "0") {
      currentId = parentMap[currentId];
    }

    // 返回顶级 id
    return currentId;
  }
  
  
  const createComment = (
    comment: Data,
    refType: "Post" | "SinglePage" | "Plugin",
  ): MigrateComment => {
    const created_at =  comment.created_at;
    return {
      refType: refType,
      kind: "Comment",
      apiVersion: "content.halo.run/v1alpha1",
      spec: {
        raw: comment.content,
        content: comment.content,
        owner: {
          kind: "Email",
          name: comment.email,
          displayName: comment.nick,
          annotations: {
            website: comment.link,
          },
        },
        userAgent: comment.ua,
        ipAddress: comment.ip,
        priority: 0,
        top: false,
        allowNotification: false,
        approved: true,
        approvedTime: new Date(created_at.substring(0, 19)).toISOString(),
        creationTime: new Date(created_at.substring(0, 19)).toISOString(),
        hidden: false,
        subjectRef: {
          kind: refType,
          group: refType == "Plugin" ? "plugin.halo.run" : "content.halo.run",
          version: "v1alpha1",
          name: refType == "Plugin" ? 'PluginLinks' : comment.page_key,
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
    commentName: string,
    quoteReply: string,
  ): MigrateReply => {
    const created_at =  reply.created_at;
    const migrateReply: MigrateReply = {
      refType: refType,
      kind: "Reply",
      apiVersion: "content.halo.run/v1alpha1",
      metadata: {
        name: reply.id,
      },
      spec: {
        raw: reply.content,
        content: reply.content,
        owner: {
          kind: "Email",
          name: reply.email,
          displayName: reply.nick,
          annotations: {
            website: reply.link,
          },
        },
        userAgent: reply.ua,
        ipAddress: reply.ip,
        priority: 0,
        top: false,
        allowNotification: false,
        approved: true,
        approvedTime: new Date(created_at.substring(0, 19)).toISOString(),
        creationTime: new Date(created_at.substring(0, 19)).toISOString(),
        hidden: false,
        commentName: commentName,
      },
      status:{}
    };
    if (quoteReply === commentName || !quoteReply) {
    } else {
      migrateReply.spec.quoteReply = quoteReply;
    }
    return migrateReply;
  };
  return {
    parse,
  };
}
