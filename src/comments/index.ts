import { IApires } from "../interfaces/apires";
import utils from "../utils";
import commentUtils from "./comments";
import normalFunc from "./functions";
import config from "../utils/config";

export const output = (res: IApires) => {
  const { data, errmsg } = res;
  if (!data) {
    console.log(errmsg);
    return
  }
  const { title, path, req_query, req_body_other, res_body } = data;
  const { commentHeader, commentFooter } = config
  const commentTitle = utils.normalCommentTitle(title);
  const querys = commentUtils.normalResquery(req_query);
  const pathParams = commentUtils.normalPathParam(path);
  const bodyParams = commentUtils.normalBodyData(req_body_other)
  const commentReponse = commentUtils.normalReponse(res_body);
  // 拼接数据 注释开始+标题+query参数+路径参数+body参数+注释结束
  const comments = commentHeader
    + commentTitle
    + querys
    + pathParams
    + bodyParams
    + commentReponse
    + commentFooter
  // 主体代码
  const { body, interfaces } = normalFunc(data)
  utils.clipFunction(interfaces + comments + body)
};
