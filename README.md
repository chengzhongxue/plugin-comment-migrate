# plugin-comment-migrate

支持从其他平台的评论迁移数据到 Halo 的插件。

![comment-migrate.png](https://api.minio.yyds.pink/halo-docs/2024/08/comment-migrate.png)

目前已支持以下平台：

1. [Artalk](https://artalk.js.org/)
2. [Twikoo](https://twikoo.js.org/)
3. [Waline](https://waline.js.org/)

## 使用方式

1. 下载，目前提供以下两个下载方式：
    - GitHub Releases：访问 [Releases](https://github.com/chengzhongxue/plugin-comment-migrate/releases) 下载 Assets 中的 JAR 文件。
2. 安装，插件安装和更新方式可参考：<https://docs.halo.run/user-guide/plugins>
3. 启动插件之后，即可在 Console 的左侧菜单栏看到 **工具** 的里的 **评论迁移**。

> 详细的评论迁移文档请查阅 <https://docs.kunkunyu.com/docs/plugin-comment-migrate>

## 交流群
* 添加企业微信 （备注进群）
<img width="360" src="https://api.minio.yyds.pink/kunkunyu/files/2025/02/%E5%BE%AE%E4%BF%A1%E5%9B%BE%E7%89%87_20250212142105-pbceif.jpg" />

* QQ群
<img width="360" src="https://api.minio.yyds.pink/kunkunyu/files/2025/05/qq-708998089-iqowsh.webp" />

## 开发环境

插件开发的详细文档请查阅：<https://docs.halo.run/developer-guide/plugin/introduction>

所需环境：

1. Java 17
2. Node 20
3. pnpm 9
4. Docker (可选)

克隆项目：

```bash
git clone git@github.com:chengzhongxue/plugin-comment-migrate.git

# 或者当你 fork 之后

git clone git@github.com:{your_github_id}/plugin-comment-migrate.git
```

```bash
cd path/to/plugin-comment-migrate
```

### 运行方式 1（推荐）

> 此方式需要本地安装 Docker

```bash
# macOS / Linux
./gradlew pnpmInstall

# Windows
./gradlew.bat pnpmInstall
```

```bash
# macOS / Linux
./gradlew haloServer

# Windows
./gradlew.bat haloServer
```

执行此命令后，会自动创建一个 Halo 的 Docker 容器并加载当前的插件，更多文档可查阅：<https://docs.halo.run/developer-guide/plugin/basics/devtools>

### 运行方式 2

> 此方式需要使用源码运行 Halo

编译插件：

```bash
# macOS / Linux
./gradlew build

# Windows
./gradlew.bat build
```

修改 Halo 配置文件：

```yaml
halo:
  plugin:
    runtime-mode: development
    fixedPluginPath:
      - "/path/to/plugin-comment-migrate"
```

最后重启 Halo 项目即可。
