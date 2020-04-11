import http, { ClientRequestArgs } from "http";
import config from "./utils/config";
import { LoginRes } from "./interfaces";
import { output } from "./comments";

const { host, port } = config.Ip
/**
 * 登录参数
 */
const loginOptions: http.RequestOptions = {
  host,
  port, // path为域名时，不加port
  method: "POST",
  path: `http://${host}:${port}/api/user/login`,
  headers: {
    "Content-Type": "application/json",
    Connection: "keep-alive",
  },
};

/**
 * 返回对应api的请求信息
 */
const returnOptions = (id: string, cookie: string): http.RequestOptions => {
  return {
    host,
    port, // path为域名时，不加port
    method: "GET",
    path: `http://${host}:${port}/api/interface/get?id=${id}`,
    headers: {
      "Content-Type": "application/json",
      Cookie: cookie,
    },
  };
};

/**
 * 登录
 */
const login = (id: string) => {
  const { user } = config;
  const userStr = JSON.stringify(user);
  const req = http.request(loginOptions, (res: http.IncomingMessage) => {
    res.setEncoding("utf8");
    const setCookies = res.headers["set-cookie"] as [string];
    const cookie = setCookies[0];
    const tokens = cookie.split(";")[0];
    let loginBody: string = "";
    res.on("data", (chunk: any) => {
      loginBody = chunk;
    });
    res.on("end", () => {
      const resBody: LoginRes = JSON.parse(loginBody);
      const uid = `_yapi_uid=${resBody.data.uid}`;
      // 获取登录信息后 请求api数据
      fetchApi(tokens, uid, id);
    });
    res.on("error", (error: Error) => {
      return new Error(error.message);
    });
  });
  req.on("error", (e: Error) => {
    return new Error(e.message);
  });
  req.write(userStr);
  req.end();
};

/**
 * 请求api数据
 */
const fetchApi = (token: string, uid: string, id: string) => {
  const cookie: string = `${token};${uid}`;
  //获取请求参数
  const options = returnOptions(id, cookie);
  const req = http.request(options, (res: http.IncomingMessage) => {
    let body = "";
    res.on("data", (data: any) => {
      body = data;
    });
    res.on("end", () => {
      const apiBody = JSON.parse(body);
      // 请求成功 解析api
      output(apiBody)
    });
  });
  req.write("");
  req.end();
};

/**
 * 导出请求api接口的方法
 */
export const request = (id: string) => {
  login(id);
};
