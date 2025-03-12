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
