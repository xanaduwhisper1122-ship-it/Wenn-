function createGoogleFormFromSheet() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const data = sheet.getDataRange().getValues();

  if (data.length < 2) {
    SpreadsheetApp.getUi().alert("请先在表格中填写问卷题目。");
    return;
  }

  const headers = data[0].map(h => String(h).trim().toLowerCase());

  const getIndex = (name) => headers.indexOf(name);

  const sectionCol = getIndex("section");
  const questionCol = getIndex("question");
  const typeCol = getIndex("type");
  const optionsCol = getIndex("options");
  const requiredCol = getIndex("required");
  const descriptionCol = getIndex("description");

  if (questionCol === -1 || typeCol === -1) {
    SpreadsheetApp.getUi().alert("表头必须包含 question 和 type。");
    return;
  }

  const formTitle = "New Product Concept Survey";
  const form = FormApp.create(formTitle);

  form.setDescription(
    "Hi! We’re developing a new product concept and would love to hear your thoughts. This survey takes about 3 minutes. No personal information is required."
  );

  let lastSection = "";

  for (let i = 1; i < data.length; i++) {
    const row = data[i];

    const section = sectionCol !== -1 ? String(row[sectionCol] || "").trim() : "";
    const question = String(row[questionCol] || "").trim();
    const type = String(row[typeCol] || "").trim().toLowerCase();
    const optionsRaw = optionsCol !== -1 ? String(row[optionsCol] || "").trim() : "";
    const requiredRaw = requiredCol !== -1 ? String(row[requiredCol] || "").trim().toUpperCase() : "FALSE";
    const description = descriptionCol !== -1 ? String(row[descriptionCol] || "").trim() : "";

    if (!question) continue;

    if (section && section !== lastSection) {
      form.addSectionHeaderItem().setTitle(section);
      lastSection = section;
    }

    const options = optionsRaw
      ? optionsRaw.split("|").map(o => o.trim()).filter(o => o)
      : [];

    const isRequired = requiredRaw === "TRUE";

    let item;

    if (type === "single") {
      item = form.addMultipleChoiceItem();
      item.setTitle(question);
      item.setChoices(options.map(option => item.createChoice(option)));
      item.setRequired(isRequired);
    } else if (type === "multiple") {
      item = form.addCheckboxItem();
      item.setTitle(question);
      item.setChoices(options.map(option => item.createChoice(option)));
      item.setRequired(isRequired);
    } else if (type === "dropdown") {
      item = form.addListItem();
      item.setTitle(question);
      item.setChoices(options.map(option => item.createChoice(option)));
      item.setRequired(isRequired);
    } else if (type === "scale") {
      item = form.addScaleItem();
      item.setTitle(question);

      if (optionsRaw.includes("-")) {
        const parts = optionsRaw.split("-");
        const min = Number(parts[0]);
        const max = Number(parts[1]);
        item.setBounds(min, max);
      } else {
        item.setBounds(1, 5);
      }

      item.setRequired(isRequired);
    } else if (type === "short") {
      item = form.addTextItem();
      item.setTitle(question);
      item.setRequired(isRequired);
    } else if (type === "paragraph") {
      item = form.addParagraphTextItem();
      item.setTitle(question);
      item.setRequired(isRequired);
    } else {
      item = form.addParagraphTextItem();
      item.setTitle(question + " [Unsupported type: " + type + "]");
      item.setRequired(false);
    }

    if (description && item.setHelpText) {
      item.setHelpText(description);
    }
  }

  Logger.log("Edit URL: " + form.getEditUrl());
  Logger.log("Public URL: " + form.getPublishedUrl());

  SpreadsheetApp.getUi().alert(
    "Google Form 已生成！\n\n编辑链接：\n" + form.getEditUrl() + "\n\n发布链接：\n" + form.getPublishedUrl()
  );
}
