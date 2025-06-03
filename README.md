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

![merge](docs/public/merge.svg)

### 分支

使用中括号指定分支名称，若不指定默认名称为 `main`，分支名称占一行，commit信息需要另起一行。
````
```git-graph
[main]
commit1 something
[dev]
commit2 something
```
````

### 提交

提交信息分三段，以空格分隔。第一段为提交hash值，或者唯一id，第二段为提交信息，第三段为提交时间，时间可以不添加，默认为0。

- hash: 提交的hash值，或者当前代码块内唯一id，字符串类型，如果需要包含空格需要将整个hash段用单引号包裹。

- message: 提交的信息，字符串类型，如果需要包含空格需要将整个message段用引号包裹。

- time: 提交的时间，毫秒值，整数，或者可以通过`Date.parse('2025-05-24')`解析的时间格式，默认为0。

````
```git-graph
commit1 'this is a commit message' 78968
commit2 'this is a commit message' 2025-05-24
```
````

### 合并记录

在`hash`段指定合并记录，格式为`hash1<hash2`，表示`hash1`所在的分支合并了`hash2`。 例如：下面的示例中，`main`分支合并了`dev`分支的代码，创建了`bbc`这个合并记录。同时也表示`bbc`是由`kqi`和`kqj`两个提交合并而来的。结果展示如图所示。

````
```git-graph
[main]
abc sonmething
bbc<kqj 'do something'
kqi 'merge dev to main'
[dev]
kqj 'do something' 2
bai 'do something2'
```
````

![merge](docs/public/merge.svg)

### 新建分支

新建分支，并在新分支上提交一个提交记录，那么这个提交记录我们可以看作是上游分支与空分支的合并的结果，所以格式和合并记录一样，`hash1<hash2`。例如：下面的示例中`dev`分支从`main`分支的`bbc`提交记录创建。

````
```git-graph
[main]
abc sonmething 3
bbc 'do something'
kqi 'merge dev to main'
[dev]
kqj 'do something' 2
bai<bbc 'do something2'
```
````

![merge](./docs/public/checkout.svg)

## 配置

| 参数 | 类型 | 描述 |
| --- | --- | --- |
| defaultBranchName    | string                      | 默认分支名称                                          |
| theme                | SvgTheme                    | Svg主题设置                                          |
| theme.colors         | string[]                    | 颜色列表，优先使用的颜色列表，分支数超出时，使用随机颜色  |
| theme.pointSpace     | number                      | 点间距，默认 25                                       |
| theme.pointRadius    | number                      | 点半径，默认 5                                        |
| theme.lineWidth      | number                      | 分支线间距，默认 20                                   |
| theme.showHash       | boolean                     | 是否显示 hash                                        |
| theme.showDate       | boolean                     | 是否显示日期                                          |
| theme.showBranchInfo | boolean                     | 是否显示分支信息                                      |
| theme.charWidth      | number                      | 字符宽度，默认 10, 用于非精确计算字符串长度             |
| theme.dateFormat     | Intl.DateTimeFormatOptions  | 日期格式                                             |

### 全局配置 

```ts
const md = MarkdownIt().use(GitGraphPlugin, {
  defaultBranchName: 'dev',
  theme: {
    colors: [
      '#008080',
      '#e6beff',
      'blue',
      'red'
    ],
    pointSpace: 30,
    lineSpace: 25,
    pointRadius: 7,
    showBranchInfo: true,
    showHash: true,
    showDate: true,
    dateFormat: {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    },
    charWidth: 12
  }
})
```

### 局部配置 

对于每个图块，可以在其内部添加配置项。配置项对于该图块有效，将覆盖全局配置。

````
```git-graph colors=#e6194b,#ffe119&showHash=false&showDate=false
[main]
8991ab29<ab315c05   'merge feature/dev_1'    2025-02-05
9091ab29            'add help.md'            2025-02-03
d920f7c1            'add README.md'          2025-02-01
[feature/dev_1]
ab315c05            'update index.md'        2025-02-03
910f0f0f            'something'              2025-02-03
0c5c0c05<d920f7c1   'add index.md'           2025-02-02
```
````

![config](docs/public/config.svg)
