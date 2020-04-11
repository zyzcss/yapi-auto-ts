import { IRequery, IApiresData } from "../interfaces/apires";
import utils from "../utils";
import config from "../utils/config";

// 避免模板字符串嵌套
// 模板标识左侧  ${
const tempLeft = "${";
// 模板标识右侧  }
const tempRight = "}";
// 模板字符串的符号
const tempSymbol = "`";

/**
 * 根据路径生成函数名
 * @param {string} path 路径
 */
const generatorFuncName = (path: string) => {
  const pathArr = path.split("/");
  const length = pathArr.length;
  if (length >= 4) {
    const funcName = pathArr.join("").split("{")[0];
    return funcName;
  } else {
    return "funcName";
  }
};

const normalFunc = (data: IApiresData) => {
  const {
    method, // 请求类型
    path, // 路径
    req_query, // query参数
    req_body_other, // body参数
    req_body_form, // body form参数
    res_body, // 相应的body
  } = data
  const interfaces: any = []
  // 是否有？之后的参数
  const isReqQuery = req_query && req_query.length > 0;
  // 获取路径中的路径参数
  const pathParams = utils.normalPath(path);
  // 转成请求中的路径参数 形式
  const newPathParams = pathParams ? pathParams.map((p) => {
    return `${tempLeft}params.${p}${tempRight}`;
  }).join("/") : "";
  // omit函数需要的路径参数
  const omitParams = pathParams ? pathParams.map((p) => {
    return `'${p}'`
  }) : "";
  const methodLine = normalMethod(method, req_body_other, req_body_form);
  // 带路径参数的路径
  const newPath = path.split("{")[0] + newPathParams;
  // 移除了路径参数之后的query参数
  const funcQuery = config.isUseLodash && pathParams && isReqQuery ? ` const query = _.omit(params, [${omitParams.toString()}]);\n` : "";
  const isQuery = funcQuery ? "query" : "params";
  // return的 ？之前部分
  const returnHeader = ` return request(${tempSymbol}${tempLeft}config.MPS_URL${tempRight}${newPath}`;
  // return的 ？之后部分
  const returnFooter = isReqQuery ? `?${tempLeft}stringify(${isQuery})${tempRight}${tempSymbol}` : "`";
  // return 的内容
  const funcContent = !methodLine
    ? returnHeader + returnFooter + ");\n"
    : returnHeader + returnFooter + ", {\n";
  // 函数体最后的闭合括号
  const contentFooter = !methodLine ? "" : " });\n";
  const funcFooter = "}\n";
  // 函数名，暂定为路径最后一个 / 之后的字符串
  // const splitPath = path.split("/");
  const funcName = generatorFuncName(path);
  // 函数定义行
  const funcHeader = getFunctionHeader(funcName, data, pathParams, interfaces)
  if (res_body) {
    // res的响应
    const reqBody = JSON.parse(res_body)
    analysisReqBody(funcName + 'Response', reqBody, interfaces, 'response Body参数')
  }
  return {
    body: funcHeader + funcQuery + funcContent + methodLine + contentFooter + funcFooter,
    interfaces: interfaces.join('\r') + '\r'
  }
};

/**
 * 处理请求方法
 * @param {string} method 请求方法
 * @param {string} body 请求的body参数
 * @param {any} bodyForm 请求的body form参数
 */
function normalMethod(method: string, body: string, bodyForm: any) {
  // GET请求不需要传请求方法、body参数
  if (method === "GET") return "";
  const lineMethod = `   method: '${method}',\n`;
  const lineBody = body ? `   data,\n   body: data,\n` : "";
  const lineBodyForm = bodyForm && bodyForm.length > 0 ? `   data,\n   body: data,\n` : "";
  return lineMethod + (lineBody || lineBodyForm);
}

/**
 * 构造函数的头
 * @param {string} funcName 函数名
 * @param {string} req_query 是否有query参数
 * @param {any} req_body_other body内容
 * @param {any} req_body_form body form内容
 */
function getFunctionHeader(
  funcName: string = 'funcName',
  data: IApiresData,
  pathParams: any[],
  interfaces: any[],
) {
  const { req_query, req_body_other, req_body_form } = data
  let newFuncName = toUpperCaseFirst(funcName.indexOf('?') !== -1 ? funcName.slice(0, funcName.indexOf('?') - 1) : funcName)
  const querList: String[] = []
  if (req_query) {
    const newQuery: any[] = [...req_query]
    if (pathParams && pathParams.length > 0) {
      newQuery.push(...pathParams.map(d => ({
        name: d,
        required: '1',
        type: 'text',
      })))
    }
    // 存在query参数
    querList.push('params' + analysisReqQuery(newFuncName + 'Query', newQuery, interfaces, 'query参数接口'))
  }
  if (req_body_form && req_body_form.length > 0) {
    // 存在form的参数
    querList.push('data' + analysisReqQuery(newFuncName + 'Form', req_body_form, interfaces, 'form参数接口'))
  } else if (req_body_other) {
    // 存在request body参数
    const reqBody = JSON.parse(req_body_other)
    querList.push('data' + analysisReqBody(newFuncName, reqBody, interfaces, 'request Body参数'))
  }
  return `export async function ${newFuncName}(${querList.join(', ')}) {\n`
}

/**
 * 解析request query/bodyForm
 * @param funcName 
 * @param req_query 
 * @param interfaces 
 * @param remarks 
 */
function analysisReqQuery(funcName: string, req_query: any, interfaces: any[], remarks: string) {
  if (req_query && req_query.length > 0) {
    // 有query数据
    let str = `// ${remarks}\rinterface ${funcName} {\r`
    for (let i = 0; i < req_query.length; i++) {
      const { name, required, type } = req_query[i]
      let { desc = '' } = req_query[i]
      // 遍历数据 form类型的type有text和any  query类型的type为any
      let newType = type === 'text' ? 'string' : 'any'
      str += `  ${name}${required === '0' ? '?' : ''}: ${newType};`
      if (type === 'file') {
        desc = '文件类型 ' + desc
      }
      if (desc !== '') {
        // 存在描述
        str += ` // ${desc}`
      }
      str += '\r'
    }
    str += '}\r'
    interfaces.push(str)
    return `: ${funcName}`
  }
  return ''
}

/**
 * 解析request body
 * @param funcName 
 * @param req_body_other 
 * @param interfaces 
 */
function analysisReqBody(funcName: string, req_body_other: any, interfaces: any[], remarks: string) {
  const {
    type,
  } = req_body_other
  if (['object', 'array'].includes(type)) {
    // 是对象或数组类型的 递归更新interface
    return dpCreateInterface(funcName, req_body_other, interfaces, 0, remarks)
  } else {
    return `: ${type}`
  }
}

/**
 * 递归遍历
 * @param funcName 函数名
 * @param req_body_other body
 * @param index dp下标
 */
function dpCreateInterface(funcName: string, req_body_other: any, interfaces: any[], index: number, remarks?: string) {
  const {
    type,
    description,
    properties,
    items,
  } = req_body_other
  let interfaceName = toUpperCaseFirst(funcName)
  let isBasic = false
  let maxIndex: any = index
  let str = ''
  if (remarks) {
    str += `// ${remarks}\r`
  }
  if (description) {
    str += `// ${description}\r`
  }
  str += `interface ${interfaceName} {\r`
  if (type === 'object') {
    // 对象类型 { "properties": { "key": { "type": "number", "description": "属地id" } } }
    const keys = Object.keys(properties)
    // 遍历对象
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i]
      const { type, description } = properties[key]
      // 对象和数组类型继续递归
      if (type === 'object') {
        let nextName = toUpperCaseFirst(funcName) + toUpperCaseFirst(key)
        dpCreateInterface(nextName, properties[key], interfaces, index + 1)
        str += `  ${key}: ${nextName};`
        // 添加描述
      } else if (type === 'array') {
        let nextName = toUpperCaseFirst(funcName) + toUpperCaseFirst(key)
        let { index: max, interfaceName: newName }: any = dpCreateInterface(nextName, properties[key], interfaces, index + 1)
        const list = new Array(Number(max) - index).fill(1)
        maxIndex = max
        str += `  ${key}: ${newName}${list.reduce(pre => pre + '[]', '')};`
      } else {
        str += `  ${key}: ${type};`
        isBasic = true
        interfaceName = type
      }
      if (description) {
        str += ` // ${description}`
      }
      str += '\r'
    }
  } else if (type === 'array') {
    // 数组类型  { "items": { type: "number" } }
    const { type } = items
    if (type === 'object') {
      let nextName = toUpperCaseFirst(funcName)
      dpCreateInterface(nextName, items, interfaces, index + 1) as any
    } else if (type === 'array') {
      let nextName = interfaceName + 'Array'
      const { index: max, interfaceName: newName, isBasic: basic } = (dpCreateInterface(nextName, items, interfaces, index + 1) as any)
      interfaceName = newName
      maxIndex = max
      if (basic) {
        isBasic = true
      }
    } else {
      interfaceName = type
      isBasic = true
    }
  } else {
    // 其他
    interfaceName = type
    isBasic = true
  }
  // 不是空的interface
  if (str.lastIndexOf('{') !== str.length - 2) {
    str += '}\r'
    interfaces.push(str)
  }

  if (index === 0) {
    // 第一层需要返回定义的类型字符
    const list = new Array(Number(maxIndex) - index).fill(1)
    const arrsString: string = list.reduce(pre => pre + '[]', '[]')
    const basicType = `${toUpperCaseFirst(funcName)}`
    return `: ${type === 'array' ? interfaceName + arrsString : basicType}`
  }
  return {
    index: maxIndex,
    interfaceName,
    isBasic,
  }
}

/**
 * 首字母大写
 * @param str 
 */
function toUpperCaseFirst(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export default normalFunc;
