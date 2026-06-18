Langfuse 汉化架构说明                                                                                                    
                                                                                                                          
 ### 核心文件                                                                                                             
                                                                                                                          
 翻译数据：web/src/features/i18n/zh.ts                                                                                    
                                                                                                                          
 所有中文翻译集中在这个单文件，使用嵌套对象结构：                                                                         
                                                                                                                          
 ```ts                                                                                                                    
   export const zhMessages = {                                                                                            
     common: {                                                                                                            
       loading: "加载中",                                                                                                 
       save: "保存",                                                                                                      
       delete: "删除",                                                                                                    
       noData: "暂无数据",                                                                                                
     },                                                                                                                   
     navigation: {                                                                                                        
       traces: "追踪",                                                                                                    
       users: "用户",                                                                                                     
       scores: "评分",                                                                                                    
       settings: "设置",                                                                                                  
     },                                                                                                                   
     // ... 每个功能模块一个顶级键                                                                                        
     tracing: { ... },                                                                                                    
     scores: { ... },                                                                                                     
     evals: { ... },                                                                                                      
     annotationQueues: { ... },                                                                                           
     datasets: { ... },                                                                                                   
     settings: { ... },                                                                                                   
   } as const;                                                                                                            
                                                                                                                          
   export type ZhMessages = typeof zhMessages;                                                                            
 ```                                                                                                                      
                                                                                                                          
 每个功能模块对应一个顶级键（scores、evals、annotationQueues、datasets、settings 等），内部按组件/页面继续拆分。          
                                                                                                                          
 ### 运行时机制                                                                                                           
                                                                                                                          
 I18nProvider — web/src/features/i18n/I18nProvider.tsx                                                                   
                                                                                                                          
 轻量自研方案，无第三方依赖。三个核心：                                                                                   
                                                                                                                          
 ┌─────────────────┬────────────────────────────────────────   
 │ 模块            │ 作用                                               │                                              
 ├─────────────────┼────────────────────────────────────────   
 │ I18nProvider    │ React Context Provider，在 _app.tsx 中包裹整个应用 │                                              
 ├─────────────────┼────────────────────────────────────────   
 │ useI18n()       │ hook，返回 { locale: "zh-CN", t }                  │                                              
 ├─────────────────┼────────────────────────────────────────   
 │ t(key, values?) │ 翻译函数，点分隔路径取值 + {placeholder} 插值      │                                              
 └─────────────────┴────────────────────────────────────────   
                                                                                                                          
 组件中使用：                                                                                                             
                                                                                                                          
 ```tsx                                                                                                                   
   import { useI18n } from "@/src/features/i18n/I18nProvider";                                                            
                                                                                                                          
   function MyComponent() {                                                                                               
     const { t } = useI18n();                                                                                             
     return <Button>{t("common.save")}</Button>;                                                                          
     // 带参数插值:                                                                                                       
     // t("tracing.detail.title", { traceId: "abc" })                                                                     
   }                                                                                                                      
 ```                                                                                                                      
                                                                                                                          
 关键行为：                                                                                                               
 - 点分隔路径："common.loading" → zhMessages.common.loading                                                              
 - {placeholder} 插值：t("hello", { name: "世界" }) → "你好，世界！"                                                     
 - 找不到 key 时 fallback 回 key 本身                                                                                     
 - as const 推导类型安全                                                                                                  
                                                                                                                          
 ### 集成位置                                                                                                             
                                                                                                                          
 web/src/pages/_app.tsx 中：                                                                                              
                                                                                                                          
 ```tsx                                                                                                                   
   <I18nProvider>                                                                                                         
     <TooltipProvider>                                                                                                    
       {...}                                                                                                              
     </TooltipProvider>                                                                                                   
   </I18nProvider>                                                                                                        
 ```                                                                                                                      
                                                                                                                          
 ### 如何添加新翻译                                                                                                       
                                                                                                                          
 1. 在 zh.ts 添加条目：                                                                                                   
                                                                                                                          
 ```ts                                                                                                                    
   // 找到对应功能模块，例如 tracing:                                                                                     
   tracing: {                                                                                                             
     page: {                                                                                                              
       title: "追踪",                                                                                                     
       setupTitle: "配置追踪",                                                                                            
       setupDescription: "设置完成后即可开始追踪。",                                                                      
     },                                                                                                                   
   },                                                                                                                     
 ```                                                                                                                      
                                                                                                                          
 2. 在组件中使用 t()：                                                                                                    
                                                                                                                          
 ```tsx                                                                                                                   
   const { t } = useI18n();                                                                                               
   <Page title={t("tracing.page.title")} />                                                                               
 ```                                                                                                                      
                                                                                                                          
 ### 目录结构                                                                                                             
                                                                                                                          
 ```                                                                                                                      
   web/src/features/i18n/                                                                                                 
   ├── zh.ts              ← 所有中文翻译（唯一文件）                                                                  
   └── I18nProvider.tsx   ← Provider + useI18n hook                                                                   
 ```                                                                                                                      
                                                                                                                          
 ### 全局配置                                                                                                             
                                                                                                                          
 web/next.config.mjs 中设置 Next.js 默认语言：                                                                            
                                                                                                                          
 ```mjs                                                                                                                   
   i18n: {                                                                                                                
     locales: ["zh-CN"],                                                                                                  
     defaultLocale: "zh-CN",                                                                                              
   },                                                                                                                     
 ```                                                                                                                      
                                                                                                                          
 此配置仅用于 URL 路由。文本翻译完全由 I18nProvider 处理。
