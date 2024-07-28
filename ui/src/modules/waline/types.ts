
export interface MyData {
  data: Data;
}


export interface Data {
  Comment: Comment[];
}

export interface Comment {
  nick: string;
  ip: string;
  like: string;
  mail: string;
  ua: string;
  insertedAt: string,
  pid?:string,
  status: string,
  link?: string,
  comment: string,
  url?: string,
  rid:string,
  objectId: string,
  createdAt: string,
  updatedAt: string,
}
