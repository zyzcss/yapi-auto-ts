import process from "process";
import { request } from './request'

process.stdout.write("自动化生成接口\n");
process.stdout.write("请输入yapi接口id：");
process.stdin.on("data", (input: Buffer) => {
  const key = input.toString().trim();
  const reg = /^[+]{0,1}(\d+)$/;
  if (reg.test(key)) {
    request(key)
  } else {
    process.stdout.write("请输入数字");
    process.exit(0);
  }
});
