// container-pool.service.ts
import { Injectable } from '@nestjs/common';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

@Injectable()
export class ContainerPoolService {
  private cppContainerCount = 4; // C++容器数量
  private javaContainerCount = 4; // Java容器数量
  private pythonContainerCount = 4; // Python容器数量

  private containerPools: { [key: string]: string[] } = {};

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
          const { stdout } = await execAsync(
            `docker inspect -f '{{.State.Running}}' ${containerName}`,
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
        return 'quinceywong/onlineexamsystem:my-cpp-image'; // 完整的镜像名称
      case 'java':
        return 'quinceywong/onlineexamsystem:my-java-image'; // 完整的镜像名称
      case 'python':
        return 'quinceywong/onlineexamsystem:my-python-image'; // 完整的镜像名称
      default:
        throw new Error(`Unsupported language: ${language}`);
    }
  }

  // 初始化容器池，启动所需容器
  async initialize() {
    this.containerPools = {
      cpp: this.generateContainerNames('gcc', this.cppContainerCount),
      java: this.generateContainerNames('java', this.javaContainerCount),
      python: this.generateContainerNames('python', this.pythonContainerCount),
    };

    // 启动并填充容器池
    for (const language of Object.keys(this.containerPools)) {
      await this.startContainers(language, this.containerPools[language]);
    }
  }

  // 获取容器
  async getContainer(language: string): Promise<string> {
    const pool = this.containerPools[language]; // 从容器池中获取对应语言的容器池
    if (pool && pool.length > 0) {
      return pool.pop(); // 从池中取出一个容器
    }
    throw new Error(`No available container for language: ${language}`);
  }

  // 归还容器
  async returnContainer(language: string, container: string) {
    const pool = this.containerPools[language]; // 从容器池中获取对应语言的容器池
    if (pool) {
      pool.push(container); // 将容器归还到池中
    }
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
