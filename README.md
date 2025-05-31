# markdown-it-git-graph

一个`markdown-it`插件，用于在 markdown 文档中插入 `git graph`

## 安装

```bash
npm install markdown-it-git-graph
```

## 使用

```ts
import MarkdownIt from 'markdown-it'
import { gitGraphPlugin } from '../plugin'

const md = new MarkdownIt()
  .use(gitGraphPlugin)

const svg = md.render(`\`\`\`git-graph
[main]
abc sonmething
bbc<kqj 'do something'
kqi 'merge dev to main'
[dev]
kqj 'do something' 2
bai 'do something2'
\`\`\``)
```

使用` ```git-graph `标注代码块，然后再代码块中，上面的结果示例：

![merge](docs/images/merge.svg)

### 分支

使用中括号指定分支名称，若不指定默认名称为 `main`，分支名称占一行，commit信息需要另起一行。

```git-graph
[main]
commit1 something
[dev]
commit2 something
```

### 提交

提交信息分三段，以空格分隔。第一段为提交hash值，或者唯一id，第二段为提交信息，第三段为提交时间，时间可以不添加，默认为0。

- hash: 提交的hash值，或者当前代码块内唯一id，字符串类型，如果需要包含空格需要将整个hash段用单引号包裹。

- message: 提交的信息，字符串类型，如果需要包含空格需要将整个message段用引号包裹。

- time: 提交的时间，毫秒值，整数，或者可以通过`Date.parse('2025-05-24')`解析的时间格式，默认为0。

```git-graph
commit1 'this is a commit message' 78968
commit2 'this is a commit message' 2025-05-24
```

### 合并记录

在`hash`段指定合并记录，格式为`hash1<hash2`，表示`hash1`所在的分支合并了`hash2`。 例如：下面的示例中，`main`分支合并了`dev`分支的代码，创建了`bbc`这个合并记录。同时也表示`bbc`是由`kqi`和`kqj`两个提交合并而来的。结果展示如图所示。

```git-graph
[main]
abc sonmething
bbc<kqj 'do something'
kqi 'merge dev to main'
[dev]
kqj 'do something' 2
bai 'do something2'
```

![merge](docs/images/merge.svg)

### 新建分支

新建分支，并在新分支上提交一个提交记录，那么这个提交记录我们可以看作是上游分支与空分支的合并的结果，所以格式和合并记录一样，`hash1<hash2`。例如：下面的示例中`dev`分支从`main`分支的`bbc`提交记录创建。

```git-graph
[main]
abc sonmething 3
bbc 'do something'
kqi 'merge dev to main'
[dev]
kqj 'do something' 2
bai<bbc 'do something2'
```

![merge](./docs/images/checkout.svg)

## 配置

| 参数 | 类型 | 描述 |
| --- | --- | --- |
| defaultBranchName | string | 默认分支名称 |
| colors | string[] | 颜色列表,用于自定义分支颜色 |
