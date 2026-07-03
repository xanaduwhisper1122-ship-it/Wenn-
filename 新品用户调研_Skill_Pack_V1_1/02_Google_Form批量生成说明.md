# 02_Google_Form批量生成说明.md  
## 用 Google Sheet + Apps Script 一键生成 Google Form

---

## 一、为什么需要这个流程

如果直接在 Google Forms 里建问卷，每道题都要手动复制题目、选项和题型，效率很低。

本流程的目标是：

```text
AI 生成结构化题库
↓
一次性粘贴到 Google Sheet
↓
Apps Script 一键生成 Google Form
```

适合每周/每月持续做新品方向调研的团队。

---

## 二、Google Sheet 表头

在 Google Sheet 的 A1 单元格开始，第一行放以下表头：

```text
section	question	type	options	required	description
```

字段说明：

| 字段 | 含义 |
|---|---|
| section | 问卷模块名，例如 User Screening / Pain Point |
| question | 英文题目 |
| type | 题型 |
| options | 选项，多个选项用英文竖线 `|` 分隔 |
| required | 是否必答，TRUE/FALSE |
| description | 题目说明，可为空 |

---

## 三、支持的题型

| type | Google Form 题型 |
|---|---|
| single | Multiple choice 单选 |
| multiple | Checkbox 多选 |
| dropdown | Dropdown 下拉 |
| scale | Linear scale 量表 |
| short | Short answer 短文本 |
| paragraph | Paragraph 长文本 |

---

## 四、粘贴示例

复制以下内容到 Google Sheet 的 A1 单元格：

```text
section	question	type	options	required	description
User Screening	Have you ever worn or purchased shapewear?	single	Yes, I wear shapewear often|Yes, I wear it sometimes|No, but I’m interested	TRUE	
Pain Point	How frustrating is it to use the bathroom while wearing shapewear?	scale	1-5	TRUE	1 = Not a problem, 5 = Extremely frustrating.
Open Feedback	What would make you more likely to buy this product?	paragraph		FALSE	Please share your thoughts.
```

---

## 五、Apps Script 使用步骤

1. 打开 Google Sheet；
2. 点击 `Extensions / 扩展程序`；
3. 点击 `Apps Script`；
4. 删除默认代码；
5. 粘贴 `scripts/google_form_apps_script.js` 中的代码；
6. 保存；
7. 运行 `createGoogleFormFromSheet`；
8. 第一次运行需要授权；
9. 运行成功后会弹出 Google Form 编辑链接和发布链接。

---

## 六、英文 Other 选项注意事项

不要使用 Google Forms 自带的 Other 选项。  
因为如果编辑器语言是中文，系统可能显示为：

```text
其他：_____
```

英文问卷建议用普通选项：

```text
Other (please specify below)
```

并增加下一题：

```text
If you selected Other, please specify:
```

该题设置为非必答。

---

## 七、常见问题

### Q1：粘贴后没有自动分列怎么办？

确认复制的是用 Tab 分隔的内容。  
如果没有自动分列，可以在 Google Sheet 中使用“数据 → 拆分文本到列”。

### Q2：多选题选项太长怎么办？

建议每个选项控制在 8-12 个英文单词以内，避免移动端阅读困难。

### Q3：是否支持图片题？

脚本默认不支持自动插入图片。  
建议先用脚本生成表单，再手动在概念展示题前插入产品图或结构示意图。

### Q4：是否支持跳题逻辑？

V1.1 脚本不支持复杂跳题逻辑。  
早期概念验证建议先不用复杂跳题，保证填写流畅。

### Q5：是否支持自动收集邮箱？

V1.1 脚本默认不收集邮箱。  
如果需要，可在 Google Form 设置中手动开启。
