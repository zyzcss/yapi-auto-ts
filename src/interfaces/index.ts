import { IncomingHttpHeaders, ClientRequestArgs } from "http";

export interface IUser {
  email: string;
  password: string;
}

interface LoginResData {
  username: string,
  role: string,
  uid: number,
  email: string,
  add_time: number,
  up_time: number,
  type: string,
  study: boolean,
}

export interface LoginRes {
  errcode: number,
  errmsg: string,
  data: LoginResData,
}

export interface Ip {
  host: string;
  port: string;
}

export interface IConfig {
  user: IUser;
  Ip: Ip;
  commentHeader: string,
  commentFooter: string,
  commentQueryTitle: string,
  commentPathHeader: string,
  isUseLodash: boolean;
}
