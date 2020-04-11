import { IUser, IConfig, Ip } from "../interfaces/index";

const commentHeader = "/**\n";
const commentFooter: string = "*/\n";
const commentQueryTitle: string = " * Query参数\n";
const commentPathHeader: string = " * 路径参数\n";

const user: IUser = {
  email: "email",
  password: "pass",
};

const Ip: Ip = {
  host: "host",
  port: "port", // path为域名时，不加port
}

const config: IConfig = {
  user: user,
  Ip: Ip,
  commentHeader: commentHeader,
  commentFooter: commentFooter,
  commentQueryTitle: commentQueryTitle,
  commentPathHeader: commentPathHeader,
  isUseLodash: true, // 是否使用lodash
};

export default config;
