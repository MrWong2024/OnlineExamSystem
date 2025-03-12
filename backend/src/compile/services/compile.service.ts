// compile.service.ts
import { Injectable } from '@nestjs/common';
import { ContainerPoolService } from './container-pool.service';
import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { v4 as uuidv4 } from 'uuid';

const execAsync = promisify(exec);

@Injectable()
export class CompileService {
  constructor(private readonly containerPoolService: ContainerPoolService) {}

  async compileAndRun(code: string): Promise<string> {
    // 主临时目录，用于存放各个编译任务的子目录或文件
    const tmpDir = path.join(__dirname, '../../tmp');
    if (!fs.existsSync(tmpDir)) {
      fs.mkdirSync(tmpDir, { recursive: true });
    }

    // 根据代码判断语言类型
    const language = this.detectLanguage(code);
    let fileExtension = '';
    let compileCmd = '';
    let runCmd = '';
    let container: string | undefined;
    let filePath = '';
    // 用于 Java 语言时，生成临时子目录，避免多个请求文件冲突
    let tmpFileDir = '';

    if (language === 'cpp') {
      // C++使用uuid生成唯一文件名
      fileExtension = '.cpp';
      const uniqueSuffix = uuidv4();
      const fileName = `main_${uniqueSuffix}`;
      filePath = path.join(tmpDir, `${fileName}${fileExtension}`);
      compileCmd = `g++ -o /workspace/${fileName} /workspace/${fileName}${fileExtension}`;
      runCmd = `/workspace/${fileName}`;
      fs.writeFileSync(filePath, code);
    } else if (language === 'python') {
      // Python使用uuid生成唯一文件名
      fileExtension = '.py';
      const uniqueSuffix = uuidv4();
      const fileName = `main_${uniqueSuffix}`;
      filePath = path.join(tmpDir, `${fileName}${fileExtension}`);
      runCmd = `python3 /workspace/${fileName}${fileExtension}`;
      fs.writeFileSync(filePath, code);
    } else if (language === 'java') {
      // Java需要保证文件名与public class名称一致
      fileExtension = '.java';
      const className = this.extractJavaClassName(code);
      if (!className) {
        return 'Cannot extract public class name from Java code';
      }
      // 为Java创建一个唯一的临时目录，该目录名使用uuid保证唯一性
      const uniqueDir = uuidv4();
      tmpFileDir = path.join(tmpDir, uniqueDir);
      if (!fs.existsSync(tmpFileDir)) {
        fs.mkdirSync(tmpFileDir, { recursive: true });
      }
      // 文件名保持与public class名称一致
      const fileName = className;
      filePath = path.join(tmpFileDir, `${fileName}${fileExtension}`);
      fs.writeFileSync(filePath, code);
      // 在容器中使用一个对应的目录（例如 /workspace/<uniqueDir>）作为工作区
      compileCmd = `javac /workspace/${uniqueDir}/${fileName}${fileExtension}`;
      runCmd = `java -cp /workspace/${uniqueDir} ${className}`;
    } else {
      return 'Unsupported language';
    }

    try {
      // 获取容器（并发安全）
      container = await this.containerPoolService.getContainer(language);

      if (language === 'java') {
        // Java：先在容器中创建对应目录，再复制文件
        const containerDir = path.basename(tmpFileDir);
        await this.containerPoolService.runCommandInContainer(
          container,
          `mkdir -p /workspace/${containerDir}`,
        );
        await execAsync(
          `docker cp ${filePath} ${container}:/workspace/${containerDir}/${path.basename(filePath)}`,
        );
      } else {
        // C++、Python：直接复制文件到容器 /workspace 下
        const fileNameInContainer = path.basename(filePath);
        await execAsync(
          `docker cp ${filePath} ${container}:/workspace/${fileNameInContainer}`,
        );
      }

      // 如果有编译步骤，先编译
      if (compileCmd) {
        await this.containerPoolService.runCommandInContainer(
          container,
          compileCmd,
        );
      }

      // 执行运行命令
      const { stdout, stderr } =
        await this.containerPoolService.runCommandInContainer(
          container,
          runCmd,
        );
      return stderr || stdout || 'No output';
    } catch (error: any) {
      return `Compilation/Execution error: ${error.message}`;
    } finally {
      // 无论成功或异常均归还容器
      if (container) {
        await this.containerPoolService.returnContainer(language, container);
      }
      // 清理临时文件或目录
      if (language === 'java' && tmpFileDir) {
        fs.rm(tmpFileDir, { recursive: true, force: true }, () => {});
      } else if (filePath) {
        fs.unlink(filePath, () => {});
      }
    }
  }

  // 提取 Java 代码中的 public class 名称
  private extractJavaClassName(code: string): string | null {
    const match = code.match(/public\s+class\s+(\w+)/);
    return match ? match[1] : null;
  }

  // 判断代码的语言类型
  private detectLanguage(code: string): string {
    if (
      (code.includes('int main') || code.includes('void main')) &&
      !code.includes('public static void main')
    ) {
      return 'cpp'; // C++ 代码通常包含 'int main' 或 'void main'
    } else if (code.includes('public static void main')) {
      return 'java'; // Java 代码通常包含 'public static void main'
    } else if (
      code.includes('import') ||
      code.includes('def ') ||
      code.includes('class ')
    ) {
      return 'python'; // Python 代码通常包含 'import', 'def ', 或 'class '
    }
    return 'unknown'; // 如果无法识别语言，返回 'unknown'
  }
}
