# IELTS 备考 App

纯前端的雅思备考 Web App，无需构建工具，直接用浏览器打开。

## 技术栈

- 纯 HTML + CSS + Vanilla JS（无框架、无打包）
- 数据存储：localStorage
- LLM：支持 Claude（Anthropic）、DeepSeek、b.ai，在设置页配置 API Key

## 启动

```bash
bash serve.sh        # 启动本地服务器
# 或
python3 server.py
# 打开 http://localhost:8080
```

## 功能模块

| 页面 | 文件 | 功能 |
|------|------|------|
| 首页 | `js/pages/home.js` | 学习统计、打卡入口 |
| 词汇 | `js/pages/vocab.js` | 雅思词汇练习 |
| 口语 | `js/pages/speaking.js` | 口语题练习（LLM 评分） |
| 写作 | `js/pages/writing.js` | 写作题练习（LLM 评分） |
| 打卡 | `js/pages/checkin.js` | 每日打卡记录 |

## 项目结构

```text
ielts_app/
├── index.html           # 入口，单页应用
├── css/
│   ├── main.css
│   └── components.css
├── js/
│   ├── app.js           # 初始化、注册页面
│   ├── router.js        # 客户端路由
│   ├── storage.js       # localStorage 封装
│   ├── pages/           # 各页面渲染逻辑
│   └── modules/         # 业务模块（vocab/speaking/writing/checkin）
└── data/
    ├── words.js         # 雅思词汇数据（分批，words2.js ~ words20.js）
    ├── speaking.js      # 口语题库
    ├── writing.js       # 写作题库
    └── speaking_passages.js
```

## 注意事项

- 所有状态存在 localStorage，刷新不丢失
- AI 功能需在设置页填入对应 API Key
- 词汇数据按批次分文件（words.js + words2~20.js），添加新词汇直接追加到对应文件
