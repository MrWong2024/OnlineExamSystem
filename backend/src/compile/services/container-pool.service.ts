// container-pool.service.ts
import { Injectable } from '@nestjs/common';
import { exec } from 'child_process';
import { promisify } from 'util';
import { Mutex } from 'async-mutex';

const execAsync = promisify(exec);

@Injectable()
export class ContainerPoolService {
  private cppContainerCount = 4; // C++容器数量
  private javaContainerCount = 4; // Java容器数量
  private pythonContainerCount = 4; // Python容器数量

  private containerPools: { [key: string]: string[] } = {};

  // 用于保护容器池的并发操作
  private mutex = new Mutex();

  // 根据容器数量动态生成容器名称
  private generateContainerNames(
    language: string,
    containerCount: number,
  ): string[] {
    const containers = [];
    for (let i = 1; i <= containerCount; i++) {
      containers.push(`${language}-container-${i}`);
    }
    return containers;
  }

  // 检查容器是否已经存在
  private async containerExists(containerName: string): Promise<boolean> {
    try {
      const { stdout } = await execAsync(
        `docker ps -a --filter "name=${containerName}" --format "{{.Names}}"`,
      );
      return stdout.trim() === containerName; // 如果返回的容器名与检查的名称匹配，表示容器存在
    } catch (error) {
      console.error(`Error checking if container exists: ${error.message}`);
      return false;
    }
  }

  // 初始化时启动容器并填充容器池
  private async startContainers(language: string, containerNames: string[]) {
    const imageName = this.getImageNameForLanguage(language);

    for (const containerName of containerNames) {
      try {
        const exists = await this.containerExists(containerName);
        if (!exists) {
          // 启动容器并保持运行
          await execAsync(
            `docker run -d --name ${containerName} ${imageName} tail -f /dev/null`,
          );
          console.log(`Started container ${containerName}`);
        } else {
          // 容器已存在，检查是否已启动
          /*
           await execAsync(`docker inspect -f "{{.State.Running}}" ${containerName}`,)输出的是
           { stdout: "'true'\n", stderr: '' }
           而不是
           { stdout: 'true\n', stderr: '' }
          */
          const { stdout } = await execAsync(
            `docker inspect -f "{{.State.Running}}" ${containerName}`,
          );

          if (stdout.trim() !== 'true') {
            // 如果容器未运行，则启动它
            await execAsync(`docker start ${containerName}`);
            console.log(
              `Container ${containerName} was stopped. Started it again.`,
            );
          } else {
            console.log(`Container ${containerName} is already running.`);
          }
        }
      } catch (error) {
        console.error(
          `Failed to start container ${containerName}: ${error.message}`,
        );
      }
    }
  }

  // 根据语言选择对应的镜像名称
  private getImageNameForLanguage(language: string): string {
    switch (language) {
      case 'cpp':
        return 'my-cpp-image';
      case 'java':
        return 'my-java-image';
      case 'python':
        return 'my-python-image';
      default:
        throw new Error(`Unsupported language: ${language}`);
    }
  }

  // 初始化容器池，启动所需容器
  async initialize() {
    this.containerPools = {
      cpp: this.generateContainerNames('cpp', this.cppContainerCount),
      java: this.generateContainerNames('java', this.javaContainerCount),
      python: this.generateContainerNames('python', this.pythonContainerCount),
    };

    // 启动并填充容器池
    for (const language of Object.keys(this.containerPools)) {
      await this.startContainers(language, this.containerPools[language]);
    }
  }

  // 获取容器（并发安全，检查容器状态并尝试启动未运行的容器）
  async getContainer(language: string): Promise<string> {
    return await this.mutex.runExclusive(async () => {
      const pool = this.containerPools[language];
      if (pool && pool.length > 0) {
        const container = pool.pop()!;
        try {
          const { stdout } = await execAsync(
            `docker inspect -f "{{.State.Running}}" ${container}`,
          );

          if (stdout.trim() !== 'true') {
            await execAsync(`docker start ${container}`);
          }
        } catch (error: any) {
          console.error(
            `Error checking container ${container}: ${error.message}`,
          );
          throw new Error(`Container ${container} is not available`);
        }
        return container;
      }
      throw new Error(`No available container for language: ${language}`);
    });
  }

  // 归还容器（并发安全）
  async returnContainer(language: string, container: string) {
    await this.mutex.runExclusive(async () => {
      const pool = this.containerPools[language];
      if (pool) {
        pool.push(container);
      }
    });
  }

  // 执行容器中的命令
  async runCommandInContainer(
    container: string,
    command: string,
  ): Promise<{ stdout: string; stderr: string }> {
    const { stdout, stderr } = await execAsync(
      `docker exec ${container} ${command}`,
    );
    return { stdout, stderr };
  }
}
