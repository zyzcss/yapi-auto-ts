/**
 * query数据
 */
export interface IRequery {
  required: string, // 是否必填 1为必填
  _id: string, 
  name: string, // 参数名
  desc?: string, // 描述
  example?: string, // 例子
}

/**
 * 必填参数
 */
export interface IProperties {
  [key: string]: { // 必填参数名
    type: string, // 必填参数的类型
    description: string, // 描述
  }
}

/**
 * api接口获取的数据
 */
export interface IApiresData {
  username: string, // 用户名
  query_path?: { // quer地址
    path: string, // 路径
    params?: [], // 参数
  },
  edit_uid: string, // 当前编辑的用户
  status: string, // 状态
  type: string, // 类型
  req_body_is_json_schema: boolean,
  res_body_is_json_schema: boolean,
  api_opened: boolean,
  index: number,
  tag?: [],
  _id: number, // api id
  method: string, // 请求类型
  catid: number,
  title: string, // api标题
  path: string, // api路径
  project_id: number,
  req_params?: [],
  res_body_type: string, // 相应的类型
  req_query: IRequery[], // 请求参数
  req_headers?: [],
  req_body_form?: [],
  desc: string, // 描述
  markdown: string,
  uid: number,
  add_time: number, // 添加时间
  up_time: number, // 更新时间
  __v: number,
  res_body: any,
  req_body_other?: any,
}


export interface IApires {
  errcode: string, // 错误码
  errmsg: string, // 错误信息
  data: IApiresData, // 数据
}