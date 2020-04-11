import config from "../utils/config";
import { IRequery } from "../interfaces/apires";
import utils from "../utils";

/**
 * 路径参数形成注释
 * @param {string} path
 */
const normalPathParam = (path: string) => {
  if (!path) {
    return ''
  }
  const pathParam = utils.normalPath(path);
  const commentPathHeader = pathParam && pathParam.length > 0 ? config.commentPathHeader : "";
  const commentLines = pathParam ? pathParam.map((p) => {
    const line = ` * @param {string} params.${p} \n`;
    return line
  }) : [];
  return commentPathHeader + commentLines.join("");
};

/**
 * 处理query参数
 */
const normalResquery = (query: IRequery[]) => {
  if (!query) {
    return ''
  }
  const commentQueryHeader = query && query.length > 0 ? config.commentQueryTitle : "";
  const queryLine = query.map((q) => {
    const qr = q.required;
    const isRequierd = String(qr) === '1' ? " 必须" : " 非必须";
    const qn = q.name;
    const qe = q.example ? ` ${q.example} ` : '';
    const qd = q.example ? ` ${q.desc}` : '';
    return ` * @param{String} params.${qn} ${qd} ${qe}${isRequierd}\n`;
  });
  return commentQueryHeader + queryLine.join("");
};

/**
 * Body参数转为注释内容
 * @param {JSON} body
 */
const normalBodyData = (body: any) => {
  if (!body) {
    return ''
  }
  const bodyObj = JSON.parse(body);
  const { properties, required } = bodyObj;
  const isEmpty = utils.isEmptyJSON(body) && required && required.length > 0;
  if (utils.isEmptyJSON(properties) || !required || required.length <= 0) {
    return "";
  }
  const commentBodyHeader = !isEmpty ? ` * Body参数\n` : "";
  const commentBodyParams = utils.normalRequiredArray(properties, required);
  return commentBodyHeader + commentBodyParams;
};

/**
 * 返回数据转为注释内容
 * @param {JSON} reponse 
 */
const normalReponse = (reponse: string) => {
  if (!reponse) {
    return ''
  }
  const resObj = JSON.parse(reponse);
  const { properties, required } = resObj;
  const isEmpty = utils.isEmptyJSON(resObj);
  if (utils.isEmptyJSON(properties) || !required || required.length <= 0) {
    return "";
  }
  const data = properties['data'];
  if (!data) {
    return ''
  }
  const commentResHeader = !isEmpty ? ` * 返回数据\n` : "";
  const dataProperty = data.properties;
  const dataRequired = data.required;
  const commentData = utils.normalRequiredArray(dataProperty, dataRequired);
  return commentResHeader + commentData;
}

const commentUtils = {
  normalResquery,
  normalPathParam,
  normalBodyData,
  normalReponse,
};

export default commentUtils;
