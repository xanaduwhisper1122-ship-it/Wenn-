const el = (id) => document.getElementById(id);

const state = {
  brief: null,
  questionnaire: null,
  analysis: null,
  reportMarkdown: "",
};

const thresholds = {
  effectiveRate: 70,
  targetRate: 30,
  painRate: 40,
  severityRate: 35,
  interestRate: 60,
  purchaseRate: 40,
  premiumRate: 30,
};

const knownCategories = [
  { test: /塑身衣|shapewear|bodysuit/i, cn: "塑身衣", en: "shapewear", product: "shapewear bodysuit" },
  { test: /文胸|内衣|bra/i, cn: "文胸", en: "bra", product: "bra" },
  { test: /leggings|瑜伽裤|打底裤/i, cn: "打底裤", en: "leggings", product: "leggings" },
  { test: /泳衣|swim/i, cn: "泳衣", en: "swimwear", product: "swimwear" },
  { test: /睡衣|pajama|sleep/i, cn: "睡衣", en: "sleepwear", product: "sleepwear" },
  { test: /连衣裙|dress/i, cn: "连衣裙", en: "dress", product: "dress" },
];

const exampleBrief = {
  projectName: "后拉式易穿脱塑身衣",
  direction: "面向美国站女性塑身衣用户，验证连体塑身衣在如厕场景下的不便，以及后拉式易穿脱结构是否值得进入样衣开发。",
  concept:
    "这款连体塑身衣采用后拉式易如厕结构。用户如厕时无需脱肩带，也无需脱掉整件塑身衣，可以从后腰/后背位置下拉，完成后快速复位。",
  audience: "品牌现有海外社群用户；购买过或考虑购买塑身衣的用户",
  channel: "Google Form + 社群发帖",
  validation:
    "目标塑身衣用户是否存在\n连体塑身衣如厕不便是否为高频痛点\n后拉式易穿脱结构是否容易被理解并产生兴趣\n用户是否愿意购买并为结构多付 $5-$10\n主要担忧是否集中在可通过产品开发解决的问题",
};

document.addEventListener("DOMContentLoaded", () => {
  bindTabs();
  bindActions();
  renderEmptyMetrics();
});

function bindTabs() {
  document.querySelectorAll(".tab").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelectorAll(".tab").forEach((tab) => tab.classList.remove("active"));
      document.querySelectorAll(".tab-panel").forEach((panel) => panel.classList.remove("active"));
      button.classList.add("active");
      el(`${button.dataset.tab}Tab`).classList.add("active");
    });
  });
}

function bindActions() {
  el("generateBtn").addEventListener("click", generateQuestionnaire);
  el("loadExampleBtn").addEventListener("click", loadExample);
  el("resetBtn").addEventListener("click", resetAll);
  el("briefFile").addEventListener("change", handleBriefUpload);
  el("resultsFile").addEventListener("change", handleResultsUpload);
  el("copyTsvBtn").addEventListener("click", () => copyText(el("tsvOutput").value, "TSV 已复制"));
  el("downloadTsvBtn").addEventListener("click", () => downloadText("questionnaire.tsv", el("tsvOutput").value));
  el("downloadBriefBtn").addEventListener("click", () => downloadText("questionnaire.md", buildQuestionnaireMarkdown()));
  el("copyReportBtn").addEventListener("click", () => copyText(state.reportMarkdown, "报告已复制"));
  el("downloadReportBtn").addEventListener("click", () => downloadText("research-report.md", state.reportMarkdown));
  el("downloadHtmlReportBtn").addEventListener("click", () => downloadText("research-report.html", buildReportHtml()));
}

function loadExample() {
  Object.entries(exampleBrief).forEach(([key, value]) => {
    el(key).value = value;
  });
  generateQuestionnaire();
}

function resetAll() {
  ["projectName", "direction", "concept", "audience", "channel", "validation", "postOutput", "tsvOutput"].forEach((id) => {
    el(id).value = "";
  });
  state.brief = null;
  state.questionnaire = null;
  state.analysis = null;
  state.reportMarkdown = "";
  el("logicOutput").className = "rich-output empty-state";
  el("logicOutput").textContent = "暂无内容";
  el("formMetaOutput").className = "rich-output empty-state";
  el("formMetaOutput").textContent = "暂无内容";
  el("questionnaireStatus").textContent = "填写新品方向后生成。";
  el("decisionOutput").className = "rich-output empty-state";
  el("decisionOutput").textContent = "等待上传结果";
  el("likesOutput").className = "rich-output empty-state";
  el("likesOutput").textContent = "等待上传结果";
  el("concernsOutput").className = "rich-output empty-state";
  el("concernsOutput").textContent = "等待上传结果";
  el("vocOutput").className = "rich-output empty-state";
  el("vocOutput").textContent = "等待上传结果";
  el("reportOutput").className = "report-output empty-state";
  el("reportOutput").textContent = "暂无报告";
  renderEmptyMetrics();
}

function getBrief() {
  const projectName = clean(el("projectName").value) || "新品概念验证";
  const direction = clean(el("direction").value);
  const concept = clean(el("concept").value);
  const audience = clean(el("audience").value) || "品牌现有海外社群用户";
  const channel = clean(el("channel").value) || "Google Form + 社群发帖";
  const validation = splitLines(el("validation").value);
  const category = inferCategory(`${projectName}\n${direction}\n${concept}`);
  const isBathroom = /如厕|厕所|卫生间|bathroom|toilet|restroom|穿脱|易穿脱|pull[-\s]?down/i.test(
    `${projectName}\n${direction}\n${concept}\n${validation.join("\n")}`
  );

  return { projectName, direction, concept, audience, channel, validation, category, isBathroom };
}

function inferCategory(text) {
  const found = knownCategories.find((item) => item.test.test(text));
  return found || { cn: "目标品类", en: "this product category", product: "this product" };
}

function generateQuestionnaire() {
  const brief = getBrief();
  if (!brief.direction && !brief.concept) {
    showToast("请先填写新品方向或产品概念");
    return;
  }

  state.brief = brief;
  const questionnaire = buildQuestionnaire(brief);
  state.questionnaire = questionnaire;
  renderQuestionnaire(questionnaire);
  showTab("questionnaire");
}

function buildQuestionnaire(brief) {
  const title = brief.isBathroom
    ? `Quick Survey: Bathroom-Friendly ${titleCase(brief.category.product)} Concept`
    : `Quick Survey: ${titleCase(brief.category.product)} Concept`;

  const conceptEn = brief.isBathroom
    ? `This ${brief.category.product} is designed with a bathroom-friendly structure. It aims to make real-life wear easier while keeping the key benefits users expect from ${brief.category.en}.`
    : `This ${brief.category.product} concept is designed to solve a real user problem with improved comfort, convenience, and everyday usability.`;

  const rows = brief.isBathroom ? bathroomQuestionRows(brief) : genericQuestionRows(brief);
  const hypotheses = brief.validation.length
    ? brief.validation
    : [
        "目标品类用户是否足够集中，样本是否可用于判断新品机会。",
        "目标使用场景是否真实存在，是否能触发明确痛点。",
        "新品概念是否容易理解，并能形成兴趣、购买意向和溢价意愿。",
        "用户担忧是否能转化为明确的产品开发要求。",
      ];

  return {
    title,
    intro: `Hi! We’re developing a new ${brief.category.product} concept and would love to hear your thoughts.\n\nThis survey takes about 3 minutes. Your feedback will help us understand what customers really need in everyday use, special occasions, work, travel, or long-time wear.\n\nNo personal information is required.`,
    conceptEn,
    rows,
    hypotheses,
    post: buildCommunityPost(brief),
    tsv: toTsv(rows),
  };
}

function bathroomQuestionRows(brief) {
  const category = brief.category;
  const productUsageOptions =
    category.en === "shapewear"
      ? "Shapewear bodysuit|Shapewear shorts|Waist trainer / waist cincher|Shaping panties|Shaping leggings|Strapless shapewear|I’m not sure|Other (please specify below)"
      : `${titleCase(category.product)} with one-piece design|Regular ${category.product}|High-compression ${category.product}|Light-control ${category.product}|I’m not sure|Other (please specify below)`;

  return [
    row("User Screening", `Have you ever worn or purchased ${category.en}?`, "single", `Yes, I use ${category.en} often|Yes, I use it sometimes|I have purchased it before but rarely use it|No, but I’m interested in trying ${category.en}|No, and I’m not interested`, true),
    row("Product Usage", `What type of ${category.en} do you usually wear or consider buying?`, "multiple", productUsageOptions, true, "Select all that apply."),
    row("Product Usage", "If you selected Other, please specify:", "short", "", false),
    row("Usage Scenario", `When do you usually wear or consider wearing ${category.en}?`, "multiple", "Daily outfits|Work / office|Wedding / party / special events|Travel|Date night|Postpartum / body recovery|Under dresses|Under tight clothes|Other (please specify below)", true, "Select all that apply."),
    row("Usage Scenario", "If you selected Other, please specify:", "short", "", false),
    row("Pain Point", `What problems have you experienced when wearing a ${category.product}?`, "multiple", "Difficult to take off when using the bathroom|Need to remove straps or take off the whole product|Hard to put it back on after using the bathroom|Hooks / snaps feel uncomfortable|The opening is not convenient or hygienic|The product rolls down or shifts after bathroom use|It feels too tight or uncomfortable for long wear|I have not experienced these problems|Other (please specify below)", true, "Select all that apply."),
    row("Pain Point", "If you selected Other, please specify:", "short", "", false),
    row("Pain Point", `How frustrating is it to use the bathroom while wearing a ${category.product}?`, "scale", "1-5", true, "1 = Not a problem at all, 5 = Extremely frustrating."),
    row("Concept Test", `How interested are you in this bathroom-friendly ${category.en} design?`, "single", "Very interested|Somewhat interested|Not sure|Not very interested|Not interested at all", true),
    row("Concept Test", "What do you like most about this design?", "multiple", "Easier bathroom access|No need to remove the whole product|More convenient for weddings or events|Better for long-time wear outside|Looks more hygienic than hooks/snaps|Saves time and effort|I don’t see much benefit|Other (please specify below)", true, "Select all that apply."),
    row("Concept Test", "If you selected Other, please specify:", "short", "", false),
    row("Concern Test", "What concerns would you have about this design?", "multiple", "I worry it may not shape or support well|I worry the opening may show under clothes|I worry it may roll down or shift|I worry it may be hard to pull back up|I worry it may feel uncomfortable|I worry it may not be hygienic enough|I have no major concerns|Other (please specify below)", true, "Select all that apply."),
    row("Concern Test", "If you selected Other, please specify:", "short", "", false),
    row("Purchase Intent", `If this ${category.product} works as described, would you consider buying it?`, "single", "Yes, definitely|Maybe, if the fit and shaping are good|Maybe, if the price is reasonable|Not sure|No", true),
    row("Purchase Intent", "Compared with regular products, would you pay a little more for this improved feature?", "single", "Yes, I would pay $5-$10 more|Yes, I would pay $10-$15 more|Maybe, depending on the quality|No, I would not pay more|Not sure", true),
    row("Purchase Intent", `What price range feels acceptable for this type of ${category.en}?`, "single", "Under $25|$25-$35|$36-$45|$46-$55|$56+|Not sure", true),
    row("Open Feedback", "What would make you more likely to buy this product?", "paragraph", "", false, "Please share anything that would make you more likely to buy this product."),
  ];
}

function genericQuestionRows(brief) {
  const category = brief.category;
  return [
    row("User Screening", `Have you ever worn or purchased ${category.en}?`, "single", `Yes, I use ${category.en} often|Yes, I use it sometimes|I have purchased it before but rarely use it|No, but I’m interested in trying ${category.en}|No, and I’m not interested`, true),
    row("Usage Scenario", `When do you usually use or consider using ${category.en}?`, "multiple", "Daily use|Work / office|Travel|Special events|Under dresses|Under tight clothes|Long-time wear|Other (please specify below)", true, "Select all that apply."),
    row("Usage Scenario", "If you selected Other, please specify:", "short", "", false),
    row("Pain Point", `What problems have you experienced with ${category.en}?`, "multiple", "It is uncomfortable|It is hard to put on or take off|It does not stay in place|It shows under clothes|It does not work as expected|The fabric or structure does not feel premium|I have not experienced these problems|Other (please specify below)", true, "Select all that apply."),
    row("Pain Point", "If you selected Other, please specify:", "short", "", false),
    row("Pain Point", "How frustrating is this problem for you?", "scale", "1-5", true, "1 = Not a problem at all, 5 = Extremely frustrating."),
    row("Concept Test", `How interested are you in this new ${category.en} concept?`, "single", "Very interested|Somewhat interested|Not sure|Not very interested|Not interested at all", true),
    row("Concept Test", "What do you like most about this concept?", "multiple", "It solves a real problem|It feels more convenient|It may be more comfortable|It seems useful for real-life situations|It feels more premium or differentiated|I don’t see much benefit|Other (please specify below)", true, "Select all that apply."),
    row("Concept Test", "If you selected Other, please specify:", "short", "", false),
    row("Concern Test", "What concerns would you have about this concept?", "multiple", "I worry it may not work well|I worry it may be uncomfortable|I worry it may show under clothes|I worry the price may be too high|I worry the quality may not match the claim|I have no major concerns|Other (please specify below)", true, "Select all that apply."),
    row("Concern Test", "If you selected Other, please specify:", "short", "", false),
    row("Purchase Intent", "Would you consider buying this product if it works as described?", "single", "Yes, definitely|Maybe, if the quality is good|Maybe, if the price is reasonable|Not sure|No", true),
    row("Purchase Intent", "Would you pay a little more for this improved feature?", "single", "Yes, I would pay $5-$10 more|Yes, I would pay $10-$15 more|Maybe, depending on the quality|No, I would not pay more|Not sure", true),
    row("Open Feedback", "What would make you more likely to buy this product?", "paragraph", "", false, "Please share anything that would make you more likely to buy this product."),
  ];
}

function row(section, question, type, options, required, description = "") {
  return { section, question, type, options, required: required ? "TRUE" : "FALSE", description };
}

function buildCommunityPost(brief) {
  const product = brief.isBathroom ? `bathroom-friendly ${brief.category.product}` : `new ${brief.category.product}`;
  return `We’re working on a ${product} concept and would love your feedback!\n\nIf you wear ${brief.category.en} or are interested in trying it, please take this quick 3-minute survey.\n\nYour opinion will help us design products that are more comfortable, useful, and convenient for real-life situations like work, travel, events, and daily outfits.\n\nSurvey link: [Google Form Link]\n\nThank you so much for helping us create better products!`;
}

function renderQuestionnaire(questionnaire) {
  el("questionnaireStatus").textContent = "已生成问卷、Google Sheet TSV 和社群发帖文案。";
  el("logicOutput").className = "rich-output";
  el("logicOutput").innerHTML = `
    <p><strong>调研定位：</strong>验证新品方向是否具备真实痛点、明确兴趣、购买意向和溢价基础，并识别后续产品开发风险。</p>
    <p><strong>核心研究假设：</strong></p>
    ${listHtml(questionnaire.hypotheses)}
    <p><strong>图片/概念展示建议：</strong>建议放入 1 张正常穿着/使用场景图，以及 1 张结构或功能示意图。概念文字应说明解决什么问题、如何使用、不会牺牲哪些核心体验。</p>
  `;
  el("formMetaOutput").className = "rich-output";
  el("formMetaOutput").innerHTML = `
    <p><strong>标题：</strong>${escapeHtml(questionnaire.title)}</p>
    <p><strong>开头文案：</strong></p>
    <p>${escapeHtml(questionnaire.intro).replace(/\n/g, "<br>")}</p>
    <p><strong>概念说明：</strong>${escapeHtml(questionnaire.conceptEn)}</p>
  `;
  el("postOutput").value = questionnaire.post;
  el("tsvOutput").value = questionnaire.tsv;
}

function toTsv(rows) {
  const headers = ["section", "question", "type", "options", "required", "description"];
  return [headers.join("\t"), ...rows.map((item) => headers.map((header) => item[header] || "").join("\t"))].join("\n");
}

async function handleBriefUpload(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  const text = await file.text();
  parseBriefText(text);
  showToast("新品方向已导入");
}

function parseBriefText(text) {
  const mapping = [
    ["projectName", /项目名称[:：]\s*([\s\S]*?)(?=\n\S+[:：]|$)/],
    ["direction", /新品方向[:：]\s*([\s\S]*?)(?=\n\S+[:：]|$)/],
    ["concept", /产品概念[:：]\s*([\s\S]*?)(?=\n\S+[:：]|$)/],
    ["audience", /调研对象[:：]\s*([\s\S]*?)(?=\n\S+[:：]|$)/],
    ["channel", /调研渠道[:：]\s*([\s\S]*?)(?=\n\S+[:：]|$)/],
    ["validation", /本次想验证[:：]\s*([\s\S]*?)(?=\n\S+[:：]|$)/],
  ];

  let matched = false;
  mapping.forEach(([id, pattern]) => {
    const hit = text.match(pattern);
    if (hit?.[1]) {
      el(id).value = hit[1].trim().replace(/^\d+[.、]\s*/gm, "");
      matched = true;
    }
  });

  if (!matched) {
    el("direction").value = text.trim();
  }
}

async function handleResultsUpload(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  const text = await file.text();
  const parsed = parseDelimited(text);
  if (!parsed.rows.length) {
    showToast("没有识别到结果数据");
    return;
  }
  if (!state.questionnaire && el("tsvOutput").value.trim()) {
    state.questionnaire = { rows: parseQuestionTsv(el("tsvOutput").value) };
  }
  state.analysis = analyzeResults(parsed);
  renderAnalysis(state.analysis);
  buildAndRenderReport();
  showTab("analysis");
}

function parseDelimited(text) {
  const delimiter = detectDelimiter(text);
  const rows = [];
  let cell = "";
  let rowItems = [];
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];
    if (char === '"' && inQuotes && next === '"') {
      cell += '"';
      i += 1;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === delimiter && !inQuotes) {
      rowItems.push(cell);
      cell = "";
    } else if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") i += 1;
      rowItems.push(cell);
      if (rowItems.some((value) => clean(value))) rows.push(rowItems);
      rowItems = [];
      cell = "";
    } else {
      cell += char;
    }
  }
  rowItems.push(cell);
  if (rowItems.some((value) => clean(value))) rows.push(rowItems);

  const headers = rows.shift()?.map(clean) || [];
  return {
    headers,
    rows: rows.map((values) => Object.fromEntries(headers.map((header, index) => [header, clean(values[index] || "")]))),
  };
}

function detectDelimiter(text) {
  const firstLine = text.split(/\r?\n/).find(Boolean) || "";
  const tabs = (firstLine.match(/\t/g) || []).length;
  const commas = (firstLine.match(/,/g) || []).length;
  return tabs > commas ? "\t" : ",";
}

function analyzeResults(parsed) {
  const rows = parsed.rows;
  const total = rows.length;
  const questions = state.questionnaire?.rows?.length ? state.questionnaire.rows : parseQuestionTsv(el("tsvOutput").value);
  const findQuestion = (...needles) => {
    const question = questions.find((item) => needles.every((needle) => item.question.toLowerCase().includes(needle)));
    if (question && parsed.headers.includes(question.question)) return question.question;
    return parsed.headers.find((header) => needles.every((needle) => header.toLowerCase().includes(needle)));
  };

  const qCategory = findQuestion("ever", "worn") || findQuestion("purchased");
  const qUsage = findQuestion("what type") || findQuestion("usually use");
  const qPain = findQuestion("problems", "experienced") || findQuestion("problems");
  const qSeverity = findQuestion("frustrating");
  const qInterest = findQuestion("interested", "concept") || findQuestion("interested", "design");
  const qLike = findQuestion("like most");
  const qConcern = findQuestion("concerns");
  const qPurchase = findQuestion("consider buying");
  const qPremium = findQuestion("pay a little more");
  const qOpen = findQuestion("more likely to buy");

  const effectiveRows = qCategory
    ? rows.filter((item) => !/no,\s*and i.?m not interested/i.test(item[qCategory] || ""))
    : rows;
  const denominator = effectiveRows.length || total || 1;
  const targetRows = qUsage
    ? effectiveRows.filter((item) => {
        const value = item[qUsage] || "";
        return value && !/not sure|no,\s*and|none/i.test(value);
      })
    : effectiveRows;
  const painRows = qPain
    ? effectiveRows.filter((item) => {
        const value = item[qPain] || "";
        return value && !/not experienced|no major|none/i.test(value);
      })
    : [];
  const severeRows = qSeverity
    ? effectiveRows.filter((item) => Number.parseFloat(item[qSeverity]) >= 4)
    : [];
  const interestRows = qInterest
    ? effectiveRows.filter((item) => /very interested|somewhat interested/i.test(item[qInterest] || ""))
    : [];
  const purchaseRows = qPurchase
    ? effectiveRows.filter((item) => /yes,\s*definitely|maybe,\s*if (the )?(fit|quality|shaping|it truly|it works)/i.test(item[qPurchase] || ""))
    : [];
  const premiumRows = qPremium
    ? effectiveRows.filter((item) => /yes,\s*i would pay/i.test(item[qPremium] || ""))
    : [];

  const metrics = {
    total,
    effectiveCount: effectiveRows.length,
    effectiveRate: pct(effectiveRows.length, total),
    targetRate: pct(targetRows.length, denominator),
    painRate: pct(painRows.length, denominator),
    severityRate: pct(severeRows.length, denominator),
    interestRate: pct(interestRows.length, denominator),
    purchaseRate: pct(purchaseRows.length, denominator),
    premiumRate: pct(premiumRows.length, denominator),
  };

  const likes = topOptions(rows, qLike);
  const concerns = topOptions(rows, qConcern);
  const voc = topText(rows, qOpen);
  const decision = decide(metrics);

  return { metrics, likes, concerns, voc, decision, headers: { qCategory, qUsage, qPain, qSeverity, qInterest, qPurchase, qPremium } };
}

function decide(metrics) {
  const passCount = Object.entries(thresholds).filter(([key, value]) => metrics[key] >= value).length;
  if (passCount === Object.keys(thresholds).length) {
    return {
      type: "go",
      label: "建议推进",
      sentence: "用户痛点真实存在，概念接受度较好，并具备购买和溢价基础，建议进入样衣开发与深访验证。",
    };
  }
  if (metrics.effectiveRate < 50 || (metrics.painRate < 25 && metrics.interestRate < 40 && metrics.purchaseRate < 25)) {
    return {
      type: "pause",
      label: "建议暂缓",
      sentence: "当前数据未能证明该方向具备强需求基础，建议回到更高频、更强感知的用户痛点重新定义机会点。",
    };
  }
  return {
    type: "iterate",
    label: "建议优化后再验证",
    sentence: "痛点或兴趣有一定基础，但概念信任、购买驱动力或溢价能力仍需加强，建议优化概念图和卖点表达后做二次验证。",
  };
}

function renderAnalysis(analysis) {
  renderMetrics(analysis.metrics);
  el("decisionOutput").className = "rich-output";
  el("decisionOutput").innerHTML = `<p><span class="decision-pill ${analysis.decision.type}">${analysis.decision.label}</span></p><p>${analysis.decision.sentence}</p>`;
  el("likesOutput").className = "rich-output";
  el("likesOutput").innerHTML = listHtml(formatTopList(analysis.likes));
  el("concernsOutput").className = "rich-output";
  el("concernsOutput").innerHTML = listHtml(formatTopList(analysis.concerns));
  el("vocOutput").className = "rich-output";
  el("vocOutput").innerHTML = listHtml(analysis.voc.length ? analysis.voc : ["暂无开放题文本，建议补充 VOC 或访谈记录。"]);
}

function renderEmptyMetrics() {
  renderMetrics({
    total: 0,
    effectiveRate: 0,
    targetRate: 0,
    painRate: 0,
    severityRate: 0,
    interestRate: 0,
    purchaseRate: 0,
    premiumRate: 0,
  });
}

function renderMetrics(metrics) {
  const items = [
    ["样本量", `${metrics.total || 0}`, "建议 ≥30", metrics.total >= 30 ? "pass" : metrics.total ? "warn" : ""],
    ["有效品类用户", `${metrics.effectiveRate}%`, "通过 ≥70%", status(metrics.effectiveRate, thresholds.effectiveRate)],
    ["目标相关用户", `${metrics.targetRate}%`, "通过 ≥30%", status(metrics.targetRate, thresholds.targetRate)],
    ["核心痛点选择", `${metrics.painRate}%`, "通过 ≥40%", status(metrics.painRate, thresholds.painRate)],
    ["痛点 4-5 分", `${metrics.severityRate}%`, "通过 ≥35%", status(metrics.severityRate, thresholds.severityRate)],
    ["概念兴趣 A+B", `${metrics.interestRate}%`, "通过 ≥60%", status(metrics.interestRate, thresholds.interestRate)],
    ["强购买兴趣", `${metrics.purchaseRate}%`, "通过 ≥40%", status(metrics.purchaseRate, thresholds.purchaseRate)],
    ["愿意溢价", `${metrics.premiumRate}%`, "通过 ≥30%", status(metrics.premiumRate, thresholds.premiumRate)],
  ];
  const container = el("metricStrip");
  container.innerHTML = "";
  const template = el("metricTemplate");
  items.forEach(([label, value, threshold, stateName]) => {
    const node = template.content.cloneNode(true);
    node.querySelector(".metric").classList.add(stateName || "warn");
    node.querySelector(".metric-label").textContent = label;
    node.querySelector(".metric-value").textContent = value;
    node.querySelector(".metric-threshold").textContent = threshold;
    container.appendChild(node);
  });
}

function status(value, threshold) {
  if (value >= threshold) return "pass";
  if (value >= threshold * 0.72) return "warn";
  return "fail";
}

function buildAndRenderReport() {
  const brief = state.brief || getBrief();
  const analysis = state.analysis;
  if (!analysis) return;
  const m = analysis.metrics;
  const decision = analysis.decision;
  const likes = formatTopList(analysis.likes).join("；") || "暂无集中喜欢点";
  const concerns = formatTopList(analysis.concerns).join("；") || "暂无集中担忧点";
  const voc = analysis.voc.join("；") || "暂无开放题 VOC";

  const pages = [
    page(1, "项目背景与调研目的", `本次调研围绕「${brief.projectName}」展开，核心目的是判断该新品方向是否存在真实用户痛点、是否能被目标用户理解并产生购买意向。`, "项目背景 + 验证问题清单"),
    page(2, "调研方式与样本说明", `调研方式为 ${brief.channel}，样本来源为 ${brief.audience}。本次共回收 ${m.total} 份，其中有效品类用户占比 ${m.effectiveRate}%。`, "样本来源表 + 有效样本占比"),
    page(3, "样本有效性分析", `有效品类用户占比为 ${m.effectiveRate}%，目标产品相关用户占比为 ${m.targetRate}%。该指标用于判断后续数据是否能代表目标用户。`, "漏斗图：总样本 → 有效样本 → 目标相关用户"),
    page(4, "用户场景分析", `场景数据用于判断新品功能是否发生在真实使用环境中。若高频场景集中在日常、工作、旅行或特殊活动，说明产品概念需要围绕真实穿着/使用压力表达。`, "高频场景条形图"),
    page(5, "核心痛点验证", `核心痛点选择率为 ${m.painRate}%。按照 skill 判断标准，≥40% 代表痛点真实存在；低于该标准则需要重新确认痛点定义或样本精准度。`, "痛点选择率排行"),
    page(6, "痛点严重度分析", `痛点严重度 4-5 分占比为 ${m.severityRate}%。该指标判断用户是否只是“觉得有点问题”，还是已经形成足够强的新品机会。`, "1-5 分分布图"),
    page(7, "新品概念兴趣度", `概念兴趣 A+B 占比为 ${m.interestRate}%。如果该指标不足，优先优化概念图、结构说明和核心卖点表达。`, "概念兴趣五档分布"),
    page(8, "购买意向与溢价能力", `强购买兴趣占比为 ${m.purchaseRate}%，明确愿意溢价占比为 ${m.premiumRate}%。这两个指标共同判断新品是否有商业转化基础。`, "购买意向 + 溢价能力组合图"),
    page(9, "喜欢点与担忧点", `主要喜欢点：${likes}。主要担忧点：${concerns}。这些反馈应转化为 Listing 卖点、A+ 页面表达、样衣测试重点和产品开发要求。`, "喜欢点/担忧点对照表"),
    page(10, "综合结论与下一步建议", `${decision.sentence} 开放题高频反馈：${voc}`, "决策矩阵 + 下一步行动清单"),
  ];

  state.reportMarkdown = [
    `# ${brief.projectName}｜新品调研老板汇报`,
    "",
    `## 一句话结论`,
    `${decision.label}：${decision.sentence}`,
    "",
    ...pages.flatMap((item) => [
      `## 第${item.no}页｜${item.title}`,
      item.body,
      "",
      `图表建议：${item.chart}`,
      "",
    ]),
  ].join("\n");

  el("reportStatus").textContent = "已生成 10 页老板汇报结构。";
  el("reportOutput").className = "report-output";
  el("reportOutput").innerHTML = `
    <p><span class="decision-pill ${decision.type}">${decision.label}</span> ${escapeHtml(decision.sentence)}</p>
    ${pages
      .map(
        (item) => `
          <section class="report-page">
            <h3>第${item.no}页｜${escapeHtml(item.title)}</h3>
            <p>${escapeHtml(item.body)}</p>
            <p><strong>图表建议：</strong>${escapeHtml(item.chart)}</p>
          </section>
        `
      )
      .join("")}
  `;
}

function page(no, title, body, chart) {
  return { no, title, body, chart };
}

function buildQuestionnaireMarkdown() {
  if (!state.questionnaire) return "";
  const brief = state.brief || getBrief();
  return [
    `# ${brief.projectName}｜新品用户调研问卷`,
    "",
    "## 调研定位",
    "验证新品方向是否具备真实痛点、明确兴趣、购买意向和溢价基础，并识别后续产品开发风险。",
    "",
    "## 核心研究假设",
    ...state.questionnaire.hypotheses.map((item) => `- ${item}`),
    "",
    "## Google Form 标题",
    state.questionnaire.title,
    "",
    "## 问卷开头英文文案",
    state.questionnaire.intro,
    "",
    "## Google Sheet 可粘贴版",
    "```text",
    state.questionnaire.tsv,
    "```",
    "",
    "## 社群发帖英文文案",
    state.questionnaire.post,
  ].join("\n");
}

function buildReportHtml() {
  const title = state.brief?.projectName || "新品调研老板汇报";
  const body = el("reportOutput").innerHTML || "<p>暂无报告</p>";
  return `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><title>${escapeHtml(title)}</title><style>body{font-family:Arial,"Microsoft YaHei",sans-serif;line-height:1.65;color:#1d2428;margin:36px}.report-page{border:1px solid #d9e0e4;border-radius:8px;padding:16px;margin:16px 0}.decision-pill{font-weight:700}</style></head><body><h1>${escapeHtml(title)}｜新品调研老板汇报</h1>${body}</body></html>`;
}

function parseQuestionTsv(text) {
  const parsed = parseDelimited(text);
  return parsed.rows.map((item) => ({
    section: item.section || "",
    question: item.question || "",
    type: item.type || "",
    options: item.options || "",
    required: item.required || "",
    description: item.description || "",
  }));
}

function topOptions(rows, question) {
  if (!question) return [];
  const counts = new Map();
  rows.forEach((rowItem) => {
    splitMulti(rowItem[question]).forEach((value) => {
      if (!value || /other \(please specify below\)/i.test(value)) return;
      counts.set(value, (counts.get(value) || 0) + 1);
    });
  });
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
}

function topText(rows, question) {
  if (!question) return [];
  return rows
    .map((rowItem) => clean(rowItem[question]))
    .filter((value) => value && value.length > 4)
    .slice(0, 8);
}

function splitMulti(value) {
  return clean(value)
    .split(/\s*(?:,|;|\|)\s*/)
    .map(clean)
    .filter(Boolean);
}

function formatTopList(items) {
  return items.length ? items.map(([name, count]) => `${name}（${count}）`) : ["暂无集中选项"];
}

function showTab(name) {
  document.querySelector(`.tab[data-tab="${name}"]`)?.click();
}

function pct(part, whole) {
  if (!whole) return 0;
  return Math.round((part / whole) * 100);
}

function clean(value) {
  return String(value || "").trim();
}

function splitLines(value) {
  return clean(value)
    .split(/\r?\n/)
    .map((item) => item.replace(/^\d+[.、]\s*/, "").trim())
    .filter(Boolean);
}

function titleCase(value) {
  return clean(value).replace(/\b\w/g, (char) => char.toUpperCase());
}

function escapeHtml(value) {
  return clean(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function listHtml(items) {
  return `<ul>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
}

async function copyText(text, message) {
  if (!text) {
    showToast("暂无可复制内容");
    return;
  }
  await navigator.clipboard.writeText(text);
  showToast(message);
}

function downloadText(filename, text) {
  if (!text) {
    showToast("暂无可下载内容");
    return;
  }
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function showToast(message) {
  const toast = document.createElement("div");
  toast.textContent = message;
  toast.style.cssText =
    "position:fixed;right:18px;bottom:18px;z-index:20;background:#1d2428;color:#fff;padding:10px 13px;border-radius:6px;box-shadow:0 10px 24px rgba(0,0,0,.18);font-size:13px;";
  document.body.appendChild(toast);
  window.setTimeout(() => toast.remove(), 1900);
}
