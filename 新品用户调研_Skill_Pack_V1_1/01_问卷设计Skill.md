# 01_问卷设计Skill.md  
## 新品用户调研问卷设计 Skill V1.1

---

## 一、Skill 目标

将一个新品方向、产品概念或功能创新，快速转化为可执行的用户问卷，用于验证：

1. 目标用户是否存在；
2. 使用场景是否成立；
3. 痛点是否真实；
4. 痛点强度是否足够；
5. 用户是否理解并喜欢新品概念；
6. 用户是否愿意购买；
7. 用户是否愿意溢价；
8. 用户主要担忧点是什么；
9. 后续是否值得继续投入开发。

---

## 二、适用场景

适用于以下类型调研：

| 类型 | 示例 |
|---|---|
| 新品概念初筛 | 后拉式易穿脱塑身衣 |
| 结构创新验证 | 无五金弹力偏移式裆片 |
| 面料卖点验证 | Cooling / Modal / Lyocell |
| 功能卖点验证 | Sweatproof / No rolling / Seamless |
| 场景需求验证 | Wedding / Travel / Work / Long-time wear |
| 价格接受度验证 | 是否愿意为结构多付 $5-$10 |
| 用户担忧收集 | 是否显痕、是否卷边、是否影响塑形 |

---

## 三、用户输入模板

使用者复制以下模板，填入具体信息后发给 AI：

```text
启动【新品用户调研问卷设计 Skill】

新品方向：
【填写新品方向】

产品概念：
【用1-3句话说明产品是什么、解决什么问题、有什么差异化】

调研对象：
【例如：品牌现有海外社群用户；TikTok用户；SurveyMonkey筛选用户；Amazon用户】

调研渠道：
【Google Form + 社群发帖 / SurveyMonkey / 私域社群 / 邮件】

本次想验证：
1. 【验证点1】
2. 【验证点2】
3. 【验证点3】
4. 【验证点4】

请输出：
1. 中文调研逻辑说明
2. 英文问卷题目
3. Google Sheet 可粘贴版
4. 社群发帖英文文案
5. 数据判断标准
6. 结果解读方法
```

---

## 四、AI 输出结构

AI 每次必须按以下结构输出：

```text
一、调研定位
二、核心研究假设
三、Google Form 标题
四、问卷开头英文文案
五、正式问卷题目：中文解释版
六、正式问卷题目：英文可复制版
七、Google Sheet 可粘贴版
八、图片/概念展示建议
九、社群发帖英文文案
十、数据判断标准
十一、结果解读方法
十二、后续建议
```

---

## 五、标准问卷结构

| 模块 | 题目目的 | 推荐题型 |
|---|---|---|
| A. 用户筛选 | 判断是不是目标品类用户 | single |
| B. 使用习惯 | 判断是否有相关使用经验 | single / multiple |
| C. 场景验证 | 判断新品对应场景是否存在 | multiple |
| D. 痛点验证 | 判断痛点是否真实存在 | multiple |
| E. 痛点强度 | 判断是不是强痛点 | scale |
| F. 概念展示 | 让用户理解新品方案 | 图片 + 说明 |
| G. 概念兴趣 | 判断用户是否喜欢 | single |
| H. 喜欢点 | 挖可转化卖点 | multiple |
| I. 担忧点 | 挖产品开发风险 | multiple |
| J. 购买意向 | 判断是否有转化潜力 | single |
| K. 溢价能力 | 判断是否值得做差异化结构 | single |
| L. 开放反馈 | 挖真实 VOC | paragraph |

---

## 六、Google Sheet 可粘贴版格式

AI 输出必须包含以下字段：

```text
section	question	type	options	required	description
```

### 字段规则

| 字段 | 规则 |
|---|---|
| section | 模块名，例如 User Screening / Pain Point / Concept Test |
| question | 英文题目 |
| type | single / multiple / dropdown / scale / short / paragraph |
| options | 多个选项用英文竖线 `|` 分隔 |
| required | TRUE 或 FALSE |
| description | 题目说明，可为空 |

### 示例

```text
section	question	type	options	required	description
User Screening	Have you ever worn or purchased shapewear?	single	Yes, I wear shapewear often|Yes, I wear it sometimes|I have purchased it before but rarely wear it|No, but I’m interested in trying shapewear|No, and I’m not interested	TRUE	
Pain Point	How frustrating is it to use the bathroom while wearing a shapewear bodysuit?	scale	1-5	TRUE	1 = Not a problem at all, 5 = Extremely frustrating.
Open Feedback	What would make you more likely to buy this product?	paragraph		FALSE	Please share anything that would make you more likely to buy this product.
```

---

## 七、英文 Other 选项规则

不要使用 Google Forms 原生 Other。  
统一使用普通选项：

```text
Other (please specify below)
```

然后在后面加一个非必答开放题：

```text
If you selected Other, please specify:
```

### 示例

```text
Concept Test	What do you like most about this design?	multiple	Easier bathroom access|No need to remove the whole bodysuit|Saves time and effort|Other (please specify below)	TRUE	Select all that apply.
Concept Test	If you selected Other, please specify:	short		FALSE	
```

---

## 八、问卷设计质量检查清单

生成问卷后，检查以下问题：

| 检查项 | 是否通过 |
|---|---|
| 是否先筛选品类用户 | 是/否 |
| 是否验证使用场景 | 是/否 |
| 是否验证核心痛点 | 是/否 |
| 是否有痛点严重度量表 | 是/否 |
| 是否有概念说明和图片建议 | 是/否 |
| 是否验证概念兴趣 | 是/否 |
| 是否收集喜欢点 | 是/否 |
| 是否收集担忧点 | 是/否 |
| 是否验证购买意向 | 是/否 |
| 是否验证溢价能力 | 是/否 |
| 是否有开放题收集 VOC | 是/否 |
| 是否输出 Google Sheet 可粘贴版 | 是/否 |
| 是否避免使用 Google 原生 Other | 是/否 |

---

## 九、常用判断标准

| 指标 | 建议通过标准 | 说明 |
|---|---:|---|
| 有效品类用户占比 | ≥70% | 样本基本可用 |
| 目标产品相关用户占比 | ≥30% | 与新品方向相关 |
| 核心痛点选择率 | ≥40% | 痛点真实存在 |
| 痛点严重度4-5分 | ≥35% | 痛点足够强 |
| 概念兴趣 A+B | ≥60% | 用户理解并感兴趣 |
| 强购买兴趣 | ≥40% | 有转化潜力 |
| 愿意溢价 | ≥30% | 有差异化价值 |
| 主要担忧可解决 | 是 | 能继续推进开发 |
