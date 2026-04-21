// yml and yaml 文件定义
declare module '*.yml' {
    const value: any;
    export default value;
  }
  
  declare module '*.yaml' {
    const value: any;
    export default value;
  }