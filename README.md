```markdown
# 在线考试系统

在线考试系统是一个基于Web的平台，旨在提供在线考试功能，用户管理和题库管理。该系统的前端使用Next.js构建，后端使用NestJS开发，数据存储使用MongoDB，并采用JWT进行身份验证。

## 功能

- **用户管理**：管理员可以创建、更新和删除用户账户。用户可以注册、登录并更新个人信息。
- **基于角色的访问控制**：管理员、教师和学生具有不同的访问权限。管理员具有完全控制权限，教师可以查看和管理特定资源，学生可以参与考试。
- **身份验证**：使用JWT进行安全登录和访问控制。
- **题库管理**：参考LeetCode平台的题库，支持题目的添加、搜索和更新。

## 技术栈

- **前端**：
  - Next.js（版本14+）
  - TypeScript
  - Tailwind CSS
  - Monaco Editor（用于代码编辑）

- **后端**：
  - NestJS（版本10+）
  - TypeScript
  - MongoDB
  - JWT用于身份验证
  - 基于角色的访问控制

- **数据库**：
  - MongoDB（版本8.0）

- **部署**：
  - EC2（AWS）
  - Docker Desktop（本地开发）

## 设置与安装

### 1. 克隆仓库

首先，克隆项目仓库到本地：

```bash
git clone https://github.com/yourusername/OnlineExamSystem.git
cd OnlineExamSystem
```

### 2. 安装依赖

#### 后端

进入后端目录并安装依赖：

```bash
cd backend
npm install
```

#### 前端

进入前端目录并安装依赖：

```bash
cd frontend
npm install
```

### 3. 配置环境变量

创建`.env`文件，配置后端和前端所需的环境变量。

#### 后端 `.env` 示例：

```env
MONGO_URI=mongodb://localhost:27017/online-exam
JWT_SECRET=your-secret-key
```

### 4. 构建并启动应用

#### 后端

构建并启动后端：

```bash
cd backend
npm run build
npm run start:prod
```

#### 前端

构建并启动前端：

```bash
cd frontend
npm run build
npm run start
```

### 5. 部署到EC2

将后端和前端文件上传到EC2实例：

1. 使用`scp`命令将代码上传到EC2实例：
   ```bash
   scp -r /path/to/your-next-app username@ec2-ip-address:/path/to/target/directory
   ```
2. 登录到EC2实例，并进入项目目录：
   ```bash
   ssh username@ec2-ip-address
   cd /path/to/target/directory/your-next-app
   ```
3. 安装生产依赖：
   ```bash
   npm install --production
   ```

4. 启动后端和前端应用：
   ```bash
   npm run start
   ```

5. 配置Nginx反向代理（如果需要）：
   - 编辑Nginx配置文件：
     ```bash
     sudo nano /etc/nginx/sites-available/online-exam-frontend
     ```
   - 配置Nginx反向代理：
     ```nginx
     server {
         listen 80;
         server_name your-ec2-ip-or-domain;

         location / {
             proxy_pass http://localhost:3000;  # 将请求代理到Next.js应用
             proxy_http_version 1.1;
             proxy_set_header Upgrade $http_upgrade;
             proxy_set_header Connection 'upgrade';
             proxy_set_header Host $host;
             proxy_cache_bypass $http_upgrade;
         }
     }
     ```
   - 启用该配置并重启Nginx：
     ```bash
     sudo ln -s /etc/nginx/sites-available/online-exam-frontend /etc/nginx/sites-enabled/
     sudo systemctl reload nginx
     ```

### 6. 测试

使用Postman或`curl`等工具测试API：

- **注册用户**：
  ```bash
  POST http://localhost:4000/auth/register
  ```
- **登录**：
  ```bash
  POST http://localhost:4000/auth/login
  ```
- **创建新用户**（仅管理员）：
  ```bash
  POST http://localhost:4000/users
  ```

有关题库模块的测试，请参考提供的PowerShell脚本。

## 文件结构

```
/backend               # 后端代码（NestJS）
  /controllers
  /dto
  /schemas
  /services
/frontend              # 前端代码（Next.js）
  /components
  /pages
  /public
  /styles
/.gitignore            # Git忽略文件
README.md              # 项目文档
```

## 贡献

欢迎贡献！如果您想贡献代码，请 fork 仓库，进行修改后提交Pull Request。

### 贡献步骤：
1. Fork 仓库。
2. 创建新的分支 (`git checkout -b feature/your-feature`)。
3. 提交你的更改 (`git commit -m 'Add new feature'`)。
4. 推送到你的分支 (`git push origin feature/your-feature`)。
5. 创建一个Pull Request。

## 许可证

该项目采用MIT许可证，具体内容请参见 [LICENSE](LICENSE) 文件。
```

### 如何使用此`README`：

1. **项目概述**：详细描述了在线考试系统的功能，技术栈以及如何进行安装、配置和部署。
2. **安装与配置**：包括如何安装依赖、配置环境变量等必要步骤。
3. **部署到EC2**：说明了如何将应用部署到EC2并配置反向代理。
4. **测试**：提供了测试API的基本方法。
5. **贡献指南**：鼓励开发者参与贡献，提供了详细的贡献步骤。

你可以根据实际情况调整其中的内容，例如修改EC2的配置或添加特定的部署说明。如果有更多需求或需要进一步的帮助，随时告诉我！
