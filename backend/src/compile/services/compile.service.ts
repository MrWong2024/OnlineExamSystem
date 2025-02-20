// compile.service.ts
import { Injectable } from '@nestjs/common';
import { ContainerPoolService } from './container-pool.service';
import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

@Injectable()
export class CompileService {
  constructor(private readonly containerPoolService: ContainerPoolService) {}

  async compileAndRun(code: string): Promise<string> {
    // 临时目录路径
    const tmpDir = path.join(__dirname, '../../tmp');
    if (!fs.existsSync(tmpDir)) {
      fs.mkdirSync(tmpDir);
    }

    // 根据代码内容动态判断语言类型，并添加相应的扩展名
    const language = this.detectLanguage(code);
    let fileExtension = '';
    let compileCmd = '';
    let runCmd = '';
    let fileName = 'main';

    const codeFilePath = path.join(tmpDir, fileName);

    if (language === 'cpp') {
      fileExtension = '.cpp';
      compileCmd = `g++ -o /workspace/main /workspace/main.cpp`; // 使用 /workspace 路径
      runCmd = `/workspace/main`;
    } else if (language === 'java') {
      fileExtension = '.java';

      // 提取 Java 代码中的 public class 名称
      const className = this.extractJavaClassName(code);
      if (className) {
        fileName = className; // 设置文件名为 public class 名称
      }

      compileCmd = `javac /workspace/${fileName}.java`; // 使用类名作为文件名
      runCmd = `java -cp /workspace ${fileName}`; // 使用类名作为运行命令
    } else if (language === 'python') {
      fileExtension = '.py';
      runCmd = `python3 /workspace/main.py`; // 使用 /workspace 路径
    } else {
      return 'Unsupported language';
    }

    // 根据语言类型生成文件并执行编译与运行
    const filePath = `${codeFilePath}${fileExtension}`;
    fs.writeFileSync(filePath, code);

    try {
      // 获取容器
      const container = await this.containerPoolService.getContainer(language);

      // 将代码文件复制到容器中
      await execAsync(
        `docker cp ${filePath} ${container}:/workspace/${fileName}${fileExtension}`,
      );

      // 执行编译命令
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

      // 归还容器到池中
      await this.containerPoolService.returnContainer(language, container);

      return stderr || stdout || 'No output';
    } catch (error: any) {
      return `Compilation/Execution error: ${error.message}`;
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
