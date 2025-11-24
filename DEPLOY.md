# 部署说明

## 问题原因

找到了 403 错误的根本原因：**所有控制器中使用了错误的用户 ID 字段名**

- JWT Strategy 返回的是完整的 User 对象，其中用户 ID 字段是 `user.id`
- 但控制器中错误地使用了 `req.user.userId`（不存在的字段）
- 导致传递给 service 的 userId 是 `undefined`，权限检查失败

## 已修复的文件

1. **server/src/work-orders/work-orders.controller.ts** - 7 处修改
2. **server/src/work-orders/work-orders.service.ts** - 添加了 checkWorkerAssigned 方法
3. **server/src/auth/auth.controller.ts** - 1 处修改
4. **server/src/photos/photos.controller.ts** - 1 处修改
5. **server/src/notifications/notifications.controller.ts** - 2 处修改

## 前端修改

1. **miniapp/miniprogram/pages/dashboard/dashboard.wxml** - 将"待处理"改为"已分配"
2. **miniapp/miniprogram/pages/dashboard/dashboard.js** - 修复工单统计逻辑

## 部署步骤

### 方式 1: 使用腾讯云开发 CLI

```bash
# 1. 安装 cloudbase CLI（如果还没安装）
npm install -g @cloudbase/cli

# 2. 登录
cloudbase login

# 3. 部署云函数
cd server
npm run build
# 然后根据你的云函数配置部署 dist 目录
```

### 方式 2: 手动上传

1. 进入腾讯云开发控制台
2. 找到你的云函数管理
3. 上传 `server/dist` 目录中的所有文件
4. 重启云函数

### 方式 3: 如果使用本地开发环境

```bash
cd server
npm run start:dev
```

## 验证修复

修复后，员工应该能够：

1. ✅ 在首页看到正确的"已分配"工单数量
2. ✅ 成功完成分配给他的工单（不再出现 403 错误）

测试步骤：
1. 用员工账号登录（用户 ID: 17）
2. 查看工单 45
3. 点击"完成工单"按钮
4. 应该能成功完成，不再出现 403 错误
