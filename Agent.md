## 项目概述 (Project Overview)

这是一个使用 **Expo** 构建的 **React Native** 每日消费流水记录App。它允许用户追踪他们的每日收/支出明细和查看统计数据。该应用使用 **Supabase** 进行认证，并使用 **Firestore** 作为数据库。它还包含收据图像上传和使用 `lingui` 进行国际化的功能。
(注意：该App的登录认证与数据存储可先使用Supabase和Firestore实现，但后期会对接私有后端服务，这部分在设计与开发实现时需要留出对应的扩展位)

### 关键技术 (Key Technologies)

* **框架:** React Native with Expo
* **认证:** Supabase Authentication(后期可扩展位私有服务)
* **数据库:** Firestore(后期可扩展为私有服务)
* **路由:** Expo Router (基于文件)
* **UI 组件:** React Native 组件, `expo-blur`, `expo-linear-gradient`, `react-native-gifted-charts`
* **国际化:** `lingui`
* **图像处理:** `expo-image-picker`, `expo-image`
* **状态管理:** React Context API (`authContext.tsx`)

### 架构 (Architecture)

应用遵循标准的 React Native 项目结构。

* `app/`: 包含屏幕和路由配置。
    * `(auth)/`: 认证相关的页面（登录、注册、欢迎）。
    * `(modals)/`: 用于创建/编辑收支流水等页面。
    * `(tabs)/`: 通过 Tab 导航器可访问的主页面（首页、统计、个人资料）。
* `components/`: 可复用的 UI 组件。
* `config/`: Supabase 配置。
* `constants/`: 主题颜色、数据和其他常量。
* `contexts/`: 用于认证的 React Context。
* `hooks/`: 自定义 Hook。
* `lib/`: 国际化设置。
* `locales/`: 翻译文件。
* `services/`: 用于与 Supabase 和其他 API 交互的服务。
* `utils/`: 工具函数。
* `notes/`: Markdown 格式的技术笔记。
    * 仅在必要时（例如，实现大功能或修复难题）才编写笔记。
    * 应使用 **Bash 脚本**获取当前日期。
    * 文件名应以日期格式 `yyyy-MM-dd` 开头。
    * 相关笔记应分组在同一个文件中。

## 构建与运行 (Building and Running)

### 1. 安装依赖

```bash
npm install
```

### 2. 启动App

```bash
npx expo start
```

这将会你的浏览器中打开 Expo 开发者工具。然后你可以在以下设备上运行应用：
- Android 模拟器
- iOS 模拟器
- 物理设备上的 Expo Go

### 3. 其他命令:

npm run android	在 Android 上运行
npm run ios	在 iOS 上运行
npm run web	在 Web 上运行
npm run test	运行测试
npm run lint	代码检查 (Lint)
npm run extract	提取翻译文本
npm run compile	编译翻译文件

### 开发约定 (Development Conventions)
* **路由:** 项目使用 Expo Router 的文件路由。可以通过在 app 目录中添加文件来创建新屏幕。

* **样式:** 项目使用 StyleSheet 和 constants/theme.ts 中定义的自定义主题相结合的方式。

* **国际化:** 项目使用 lingui 进行国际化。要添加新的翻译，请编辑 locales 目录中的文件，然后运行 npm run extract 和 npm run compile。

* **认证:** 认证由 Supabase Authentication 和 authContext.tsx context 处理。

* **数据库:** 项目使用 Firestore 作为其数据库。数据库逻辑位于 services 目录中。
