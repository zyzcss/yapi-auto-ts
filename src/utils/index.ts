const { exec } = require('child_process');
const iconv = require('iconv-lite');
import { IProperties } from "../interfaces/apires";

type TCommentTitle = (title: string) => string;

/**
 * 路径参数处理
 * @param {string} path
 * @return {array}
 */
const normalPath = (path: string) => {
  // 传入  /loadrateDetail/loadrateDetailId/{mpsRecordId}/{weekIndex}/{workcenterName}
  // 输出 [ 'mpsRecordId', 'weekIndex', 'workcenterName' ]
  const pathParams = path.match(/[^{]+(?=})/g);
  return pathParams || [];
};

/**
 * 判断一个json对象是否为空，即{}
 * @param {JSON} json 传入的json
 * @returns {boolean}
 */
const isEmptyJSON = (json: JSON) => {
  var isEmpty = true;
  for (const prop in json) {
    isEmpty = false;
    break;
  }
  return isEmpty;
};

/**
 * 拼接标题
 * @param {string} title 标题
 * @returns {string}
 */
const normalCommentTitle: TCommentTitle = (title: string): string => {
  const result = ` * ${title}\n`;
  return result;
};

/**
 * 处理以必须参数的数组生成的注释
 * @param {object} data
 * @param {array} required
 * @return {string}
 */
const normalRequiredArray = (data: any, required: Array<string>) => {
  const commentLines = Object.keys(data).map((d) => {
    const property: IProperties = data[d]
    const { type, description } = property;
    let line = ` * @param {${type}} ${d} ${description || ""} `;
    if (Array.isArray(required) && required.includes(d)) {
      line += "必须 \n";
    } else {
      line += "非必须\n";
    }
    return line;
  });
  return commentLines.join("");
};

/**
 * 复制进粘贴板
 * @param {string} str 需要被复制的信息
 * @returns {string}
 */
const clipFunction = (str: string) => {
  const result = exec('clip').stdin.end(iconv.encode(str, "gbk"));
  return result;
}

const utils = {
  normalPath,
  normalCommentTitle,
  isEmptyJSON,
  normalRequiredArray,
  clipFunction,
};

export default utils;
