/* ============================================================================
 * 科學科獨立題庫 — 上半部 Part A (questions/questions-science.js - v7.0)
 * 教材：《科學新領域》單元二及單元三（共 120 題，100% 緊貼課文原字）
 * 內含：第4、5課 8幅專屬向量插畫 + 第4課《動植物與環境》(30題) + 第5課《大自然的平衡》(30題)
 * 升級：全面淘汰長字選項 short_qa，將簡答題與情境題改為短字 multi_mcq / classify / fill_blank
 * ============================================================================ */
window.Aetheria = window.Aetheria || {};
window.Aetheria.QuestionBank = window.Aetheria.QuestionBank || {};

(function() {
  const SCI_DIAGRAMS = {
    // 1. 第4課 #21：海象皮膚剖面示意圖
    sci_l4_walrus_skin: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 150">
      <rect width="280" height="150" rx="12" fill="#e1f5fe"/>
      <rect x="14" y="10" width="252" height="22" rx="5" fill="#0277bd"/>
      <text x="140" y="25" font-size="11.5" font-weight="bold" fill="#ffffff" text-anchor="middle">海象皮膚剖面示意圖</text>
      <rect x="26" y="44" width="160" height="26" rx="4" fill="#8d6e63" stroke="#4e342e" stroke-width="2"/>
      <text x="106" y="61" font-size="11" font-weight="bold" fill="#ffffff" text-anchor="middle">（甲）？</text>
      <rect x="26" y="70" width="160" height="58" rx="4" fill="#ffe082" stroke="#f57f17" stroke-width="2"/>
      <text x="106" y="103" font-size="11.5" font-weight="bold" fill="#e65100" text-anchor="middle">（乙）？</text>
      <line x1="186" y1="57" x2="204" y2="57" stroke="#37474f" stroke-width="2"/>
      <text x="208" y="61" font-size="10.5" font-weight="bold" fill="#37474f">最外層</text>
      <line x1="186" y1="99" x2="204" y2="99" stroke="#e65100" stroke-width="2"/>
      <text x="208" y="95" font-size="10" font-weight="bold" fill="#e65100">厚厚的一層</text>
      <text x="208" y="109" font-size="10" font-weight="bold" fill="#e65100">用來保溫</text>
    </svg>`,

    // 2. 第4課 #22：溫帶草原草類植物示意圖
    sci_l4_grassland_plant: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 150">
      <rect width="280" height="150" rx="12" fill="#f1f8e9"/>
      <rect x="14" y="8" width="252" height="22" rx="5" fill="#558b2f"/>
      <text x="140" y="23" font-size="11.5" font-weight="bold" fill="#ffffff" text-anchor="middle">溫帶草原草類植物示意圖</text>
      <rect x="14" y="86" width="252" height="54" rx="6" fill="#d7ccc8"/>
      <line x1="14" y1="86" x2="266" y2="86" stroke="#5d4037" stroke-width="2.5"/>
      <path d="M84,86 Q72,56 54,42 M84,86 Q84,54 84,38 M84,86 Q96,56 114,42" fill="none" stroke="#2e7d32" stroke-width="4" stroke-linecap="round"/>
      <path d="M84,86 Q64,104 38,128 M84,86 Q76,110 66,134 M84,86 Q92,110 102,134 M84,86 Q104,104 130,128" fill="none" stroke="#6d4c41" stroke-width="2.8" stroke-linecap="round"/>
      <rect x="134" y="42" width="126" height="36" rx="6" fill="#ffffff" stroke="#2e7d32" stroke-width="1.5"/>
      <text x="197" y="57" font-size="10" font-weight="bold" fill="#1b5e20" text-anchor="middle">特徵：窄長的葉</text>
      <text x="197" y="71" font-size="10" font-weight="bold" fill="#e65100" text-anchor="middle">作用：（甲）？</text>
      <rect x="134" y="96" width="126" height="36" rx="6" fill="#ffffff" stroke="#6d4c41" stroke-width="1.5"/>
      <text x="197" y="111" font-size="10" font-weight="bold" fill="#4e342e" text-anchor="middle">特徵：廣闊的根</text>
      <text x="197" y="125" font-size="10" font-weight="bold" fill="#e65100" text-anchor="middle">作用：（乙）？</text>
    </svg>`,

    // 3. 第4課 #23：沙漠植物（仙人掌）結構圖
    sci_l4_cactus: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 150">
      <rect width="280" height="150" rx="12" fill="#fff8e1"/>
      <rect x="14" y="8" width="252" height="22" rx="5" fill="#ef6c00"/>
      <text x="140" y="23" font-size="11.5" font-weight="bold" fill="#ffffff" text-anchor="middle">沙漠植物（仙人掌）結構圖</text>
      <rect x="64" y="42" width="32" height="92" rx="16" fill="#66bb6a" stroke="#2e7d32" stroke-width="2.5"/>
      <path d="M64,84 L46,84 Q40,84 40,76 L40,62 M96,74 L112,74 Q118,74 118,66 L118,54" fill="none" stroke="#2e7d32" stroke-width="10" stroke-linecap="round"/>
      <path d="M64,84 L46,84 Q40,84 40,76 L40,62 M96,74 L112,74 Q118,74 118,66 L118,54" fill="none" stroke="#66bb6a" stroke-width="6" stroke-linecap="round"/>
      <path d="M60,54 L54,50 M60,70 L54,68 M100,58 L106,54 M100,96 L106,94" stroke="#3e2723" stroke-width="2"/>
      <rect x="132" y="42" width="134" height="38" rx="6" fill="#ffffff" stroke="#2e7d32" stroke-width="1.5"/>
      <text x="199" y="57" font-size="10" font-weight="bold" fill="#1b5e20" text-anchor="middle">構造1：肥厚的莖</text>
      <text x="199" y="72" font-size="10" font-weight="bold" fill="#e65100" text-anchor="middle">作用：（甲）？</text>
      <rect x="132" y="92" width="134" height="38" rx="6" fill="#ffffff" stroke="#ef6c00" stroke-width="1.5"/>
      <text x="199" y="107" font-size="10" font-weight="bold" fill="#e65100" text-anchor="middle">構造2：（乙）？</text>
      <text x="199" y="122" font-size="10" font-weight="bold" fill="#4e342e" text-anchor="middle">作用：減少水分流失</text>
    </svg>`,

    // 4. 第4課 #24：熱帶雨林植物適應陽光示意圖
    sci_l4_rainforest: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 150">
      <rect width="280" height="150" rx="12" fill="#e8f5e9"/>
      <rect x="14" y="8" width="252" height="22" rx="5" fill="#1b5e20"/>
      <text x="140" y="23" font-size="11.5" font-weight="bold" fill="#ffffff" text-anchor="middle">熱帶雨林植物適應陽光示意圖</text>
      <rect x="14" y="38" width="144" height="28" rx="5" fill="#ffffff" stroke="#2e7d32" stroke-width="1.5"/>
      <text x="86" y="56" font-size="10" font-weight="bold" fill="#1b5e20" text-anchor="middle">樹木長得高大參天</text>
      <rect x="14" y="72" width="144" height="28" rx="5" fill="#ffffff" stroke="#2e7d32" stroke-width="1.5"/>
      <text x="86" y="90" font-size="10" font-weight="bold" fill="#1b5e20" text-anchor="middle">莖攀附大樹向上生長</text>
      <rect x="14" y="106" width="144" height="32" rx="5" fill="#fff9c4" stroke="#f9a825" stroke-width="1.5"/>
      <text x="86" y="120" font-size="9.5" font-weight="bold" fill="#e65100" text-anchor="middle">底層植物葉片（乙）？</text>
      <text x="86" y="133" font-size="9.5" font-weight="bold" fill="#1b5e20" text-anchor="middle">而呈深綠色</text>
      <path d="M162,52 L172,52 L172,122 L162,122 M172,87 L186,87" fill="none" stroke="#1b5e20" stroke-width="2.2"/>
      <rect x="188" y="56" width="80" height="62" rx="8" fill="#fff3e0" stroke="#ef6c00" stroke-width="2"/>
      <text x="228" y="76" font-size="10" font-weight="bold" fill="#4e342e" text-anchor="middle">共同作用：</text>
      <text x="228" y="92" font-size="10" font-weight="bold" fill="#e65100" text-anchor="middle">增加接觸</text>
      <text x="228" y="107" font-size="10.5" font-weight="bold" fill="#bf360c" text-anchor="middle">（甲）？機會</text>
    </svg>`,

    // 5. 第5課 #21：樹林食物鏈圖
    sci_l5_forest_chain: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 145">
      <rect width="280" height="145" rx="12" fill="#f1f8e9"/>
      <rect x="14" y="10" width="252" height="22" rx="5" fill="#33691e"/>
      <text x="140" y="25" font-size="11.5" font-weight="bold" fill="#ffffff" text-anchor="middle">樹林食物鏈示意圖</text>
      <rect x="12" y="52" width="64" height="36" rx="7" fill="#c8e6c9" stroke="#2e7d32" stroke-width="2"/>
      <text x="44" y="74" font-size="12" font-weight="bold" fill="#1b5e20" text-anchor="middle">草</text>
      <text x="44" y="108" font-size="10" font-weight="bold" fill="#2e7d32" text-anchor="middle">（生產者）</text>
      <path d="M78,70 L106,70 M100,65 L106,70 L100,75" fill="none" stroke="#ef6c00" stroke-width="2.5"/>
      <text x="92" y="62" font-size="9.5" font-weight="bold" fill="#e65100" text-anchor="middle">（甲）？</text>
      <rect x="108" y="52" width="64" height="36" rx="7" fill="#fff9c4" stroke="#f9a825" stroke-width="2"/>
      <text x="140" y="74" font-size="12" font-weight="bold" fill="#e65100" text-anchor="middle">鹿</text>
      <text x="140" y="108" font-size="10" font-weight="bold" fill="#e65100" text-anchor="middle">（乙）？</text>
      <path d="M174,70 L202,70 M196,65 L202,70 L196,75" fill="none" stroke="#c62828" stroke-width="2.5"/>
      <text x="188" y="62" font-size="9.5" font-weight="bold" fill="#b71c1c" text-anchor="middle">被吃</text>
      <rect x="204" y="52" width="64" height="36" rx="7" fill="#ffcdd2" stroke="#c62828" stroke-width="2"/>
      <text x="236" y="74" font-size="12" font-weight="bold" fill="#b71c1c" text-anchor="middle">老虎</text>
      <text x="236" y="108" font-size="10" font-weight="bold" fill="#b71c1c" text-anchor="middle">（丙）？</text>
    </svg>`,

    // 6. 第5課 #22：海洋食物鏈圖
    sci_l5_ocean_chain: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 140">
      <rect width="280" height="140" rx="12" fill="#e1f5fe"/>
      <rect x="14" y="10" width="252" height="22" rx="5" fill="#01579b"/>
      <text x="140" y="25" font-size="11.5" font-weight="bold" fill="#ffffff" text-anchor="middle">海洋食物鏈示意圖</text>
      <rect x="10" y="58" width="56" height="36" rx="6" fill="#b2dfdb" stroke="#00695c" stroke-width="2"/>
      <text x="38" y="80" font-size="10" font-weight="bold" fill="#004d40" text-anchor="middle">浮游植物</text>
      <text x="74" y="80" font-size="12" font-weight="bold" fill="#0277bd" text-anchor="middle">➔</text>
      <rect x="82" y="58" width="54" height="36" rx="6" fill="#fff9c4" stroke="#f57f17" stroke-width="2"/>
      <text x="109" y="80" font-size="10.5" font-weight="bold" fill="#e65100" text-anchor="middle">（甲）？</text>
      <text x="144" y="80" font-size="12" font-weight="bold" fill="#0277bd" text-anchor="middle">➔</text>
      <rect x="152" y="58" width="52" height="36" rx="6" fill="#bbdefb" stroke="#1565c0" stroke-width="2"/>
      <text x="178" y="80" font-size="11" font-weight="bold" fill="#0d47a1" text-anchor="middle">魷魚</text>
      <text x="212" y="80" font-size="12" font-weight="bold" fill="#0277bd" text-anchor="middle">➔</text>
      <rect x="220" y="58" width="52" height="36" rx="6" fill="#ffcdd2" stroke="#c62828" stroke-width="2"/>
      <text x="246" y="80" font-size="10.5" font-weight="bold" fill="#b71c1c" text-anchor="middle">（乙）？</text>
      <text x="140" y="118" font-size="10" font-weight="bold" fill="#01579b" text-anchor="middle">箭頭表示「被吃」與能量傳輸方向</text>
    </svg>`,

    // 7. 第5課 #23：食物鏈生物數量金字塔圖
    sci_l5_pyramid: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 150">
      <rect width="280" height="150" rx="12" fill="#fffde7"/>
      <polygon points="140,12 104,54 176,54" fill="#ffcdd2" stroke="#c62828" stroke-width="2"/>
      <polygon points="104,54 68,96 212,96 176,54" fill="#ffe0b2" stroke="#ef6c00" stroke-width="2"/>
      <polygon points="68,96 32,138 248,138 212,96" fill="#c8e6c9" stroke="#2e7d32" stroke-width="2"/>
      <text x="140" y="45" font-size="10" font-weight="bold" fill="#b71c1c" text-anchor="middle">數量最少：（甲）？</text>
      <text x="140" y="80" font-size="11" font-weight="bold" fill="#e65100" text-anchor="middle">數量居中：草食性動物</text>
      <text x="140" y="122" font-size="11" font-weight="bold" fill="#1b5e20" text-anchor="middle">數量最多：（乙）？</text>
    </svg>`,

    // 8. 第5課 #24：「生物之間的關係」概念圖
    sci_l5_concept_map: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 150">
      <rect width="280" height="150" rx="12" fill="#e8f5e9"/>
      <rect x="10" y="58" width="76" height="32" rx="6" fill="#2e7d32"/>
      <text x="48" y="78" font-size="10.5" font-weight="bold" fill="#ffffff" text-anchor="middle">生物的關係</text>
      <path d="M86,68 L104,44 M86,80 L104,112" stroke="#2e7d32" stroke-width="2"/>
      <rect x="104" y="28" width="66" height="28" rx="5" fill="#fff9c4" stroke="#f9a825" stroke-width="1.8"/>
      <text x="137" y="46" font-size="10.5" font-weight="bold" fill="#e65100" text-anchor="middle">相互競爭</text>
      <rect x="184" y="12" width="84" height="20" rx="4" fill="#ffffff" stroke="#8d6e63"/>
      <text x="226" y="26" font-size="10" font-weight="bold" fill="#4e342e" text-anchor="middle">食物</text>
      <rect x="184" y="36" width="84" height="20" rx="4" fill="#fff3e0" stroke="#ef6c00" stroke-width="1.8"/>
      <text x="226" y="50" font-size="10" font-weight="bold" fill="#e65100" text-anchor="middle">（甲）？</text>
      <rect x="184" y="60" width="84" height="20" rx="4" fill="#ffffff" stroke="#8d6e63"/>
      <text x="226" y="74" font-size="10" font-weight="bold" fill="#4e342e" text-anchor="middle">生存空間</text>
      <rect x="104" y="98" width="66" height="28" rx="5" fill="#bbdefb" stroke="#1565c0" stroke-width="1.8"/>
      <text x="137" y="116" font-size="10.5" font-weight="bold" fill="#0d47a1" text-anchor="middle">相互依存</text>
      <path d="M170,112 L184,112" stroke="#1565c0" stroke-width="2"/>
      <rect x="184" y="98" width="84" height="28" rx="5" fill="#fff3e0" stroke="#ef6c00" stroke-width="1.8"/>
      <text x="226" y="116" font-size="10.5" font-weight="bold" fill="#e65100" text-anchor="middle">（乙）？</text>
    </svg>`
  };

  window.Aetheria.QuestionBank.Science = {
    DIAGRAMS: SCI_DIAGRAMS,

    LESSONS: [
      { key: "sci_l4", name: "科學・第4課 動植物與環境 (30題)" },
      { key: "sci_l5", name: "科學・第5課 大自然的平衡 (30題)" },
      { key: "sci_l6", name: "科學・第6課 植物的繁殖與遺傳 (30題)" },
      { key: "sci_l7", name: "科學・第7課 動物的繁殖與遺傳 (30題)" }
    ],

    QUESTIONS: [
      // ==================== 第 4 課：《動植物與環境》（30題） ====================
      // 一、選擇題 (#01 ~ #08)
      {
        id: "sci_l4_01", unitKey: "sci_l4", qCategory: "sci_mcq", type: "mcq", typeLabel: "選擇題",
        prompt: "下列哪一項是「濕地」的自然環境特點？",
        options: ["A. 地勢平坦空曠，有明顯旱季和雨季", "B. 位於陸地與水的交界", "C. 炎熱多雨，陽光充足", "D. 日夜溫差大，乾燥少雨"],
        answer: "B. 位於陸地與水的交界"
      },
      {
        id: "sci_l4_02", unitKey: "sci_l4", qCategory: "sci_mcq", type: "mcq", typeLabel: "選擇題",
        prompt: "下列哪一種自然環境氣候嚴寒，終年結冰？",
        options: ["A. 溫帶草原", "B. 沙漠", "C. 極地", "D. 濕地"],
        answer: "C. 極地"
      },
      {
        id: "sci_l4_03", unitKey: "sci_l4", qCategory: "sci_mcq", type: "mcq", typeLabel: "選擇題",
        prompt: "哪一種自然環境雨水較多、氣候溫暖、植物較多，能為動物提供充足食物，因此動物種類較多？",
        options: ["A. 熱帶雨林", "B. 沙漠", "C. 極地", "D. 冰原"],
        answer: "A. 熱帶雨林"
      },
      {
        id: "sci_l4_04", unitKey: "sci_l4", qCategory: "sci_mcq", type: "mcq", typeLabel: "選擇題",
        prompt: "下列哪一項關於駱駝「駝峯」的說法是不正確的？",
        options: ["A. 駝峯是用來儲存脂肪的", "B. 缺乏食物時可提供能量", "C. 集中脂肪令身體其他部分加快散熱", "D. 駝峯是用來儲藏水的"],
        answer: "D. 駝峯是用來儲藏水的"
      },
      {
        id: "sci_l4_05", unitKey: "sci_l4", qCategory: "sci_mcq", type: "mcq", typeLabel: "選擇題",
        prompt: "刺蝟在冬眠時，身體會出現下列哪種變化，以減少能量消耗？",
        options: ["A. 提高體溫，增加呼吸和心跳頻率", "B. 降低體溫，增加呼吸和心跳頻率", "C. 降低體溫，減少呼吸和心跳頻率", "D. 體溫不變，停止呼吸和心跳"],
        answer: "C. 降低體溫，減少呼吸和心跳頻率"
      },
      {
        id: "sci_l4_06", unitKey: "sci_l4", qCategory: "sci_mcq", type: "mcq", typeLabel: "選擇題",
        prompt: "哪一種沙漠動物在炎熱時會把頭和四肢縮入堅硬和防水的外殼內，以減少水分流失？",
        options: ["A. 非洲跳鼠", "B. 非洲盾臂龜", "C. 狐獴", "D. 駱駝"],
        answer: "B. 非洲盾臂龜"
      },
      {
        id: "sci_l4_07", unitKey: "sci_l4", qCategory: "sci_mcq", type: "mcq", typeLabel: "選擇題",
        prompt: "熱帶雨林中，大樹長出「巨大的板根」有甚麼作用？",
        options: ["A. 儲存水分", "B. 減少水分流失", "C. 固定樹幹", "D. 方便在沙土上行走"],
        answer: "C. 固定樹幹"
      },
      {
        id: "sci_l4_08", unitKey: "sci_l4", qCategory: "sci_mcq", type: "mcq", typeLabel: "選擇題",
        prompt: "下列哪一種鳥類會在春季和秋季來到香港，因為香港較北方溫暖，適宜停留休息？",
        options: ["A. 黑翅長腳鷸", "B. 赤頸鴨", "C. 黑臉琵鷺", "D. 白胸苦惡鳥"],
        answer: "A. 黑翅長腳鷸"
      },

      // 二、填充題 (#09 ~ #16)
      { id: "sci_l4_09", unitKey: "sci_l4", qCategory: "sci_fill", type: "fill_blank", typeLabel: "填充題", prompt: "地球上有各種自然環境和氣候，孕育出不同的 ________。", blanks: ["動植物"], distractors: ["礦物", "岩石", "季節"] },
      { id: "sci_l4_10", unitKey: "sci_l4", qCategory: "sci_fill", type: "fill_blank", typeLabel: "填充題", prompt: "溫帶草原地勢平坦空曠，有明顯的 ________ 和 ________。", blanks: ["旱季", "雨季"], allowSwapIndices: [0, 1], distractors: ["夏季", "冬季", "冰期"] },
      { id: "sci_l4_11", unitKey: "sci_l4", qCategory: "sci_fill", type: "fill_blank", typeLabel: "填充題", prompt: "極地動物需要 ________，所以北極熊長有濃密的毛，海象長有厚厚的 ________，以保存體溫。", blanks: ["保溫", "皮下脂肪"], distractors: ["散熱", "羽毛", "外殼"] },
      { id: "sci_l4_12", unitKey: "sci_l4", qCategory: "sci_fill", type: "fill_blank", typeLabel: "填充題", prompt: "刺蝟冬眠前會吃充足食物儲備皮下脂肪；冬眠時把自己緊緊裹成小刺球，以減少 ________。", blanks: ["散熱"], distractors: ["水分", "體重", "呼吸"] },
      { id: "sci_l4_13", unitKey: "sci_l4", qCategory: "sci_fill", type: "fill_blank", typeLabel: "填充題", prompt: "駱駝有長而濃密的 ________，可以抵擋風沙吹襲；還有寬闊而柔軟的 ________，方便在沙土上行走。", blanks: ["睫毛", "腳掌"], distractors: ["耳朵", "尾巴", "利爪"] },
      { id: "sci_l4_14", unitKey: "sci_l4", qCategory: "sci_fill", type: "fill_blank", typeLabel: "填充題", prompt: "非洲跳鼠在 ________ 躲藏在洞穴內，________ 才出來覓食，以避開日間的高溫。", blanks: ["日間", "晚上"], distractors: ["冬天", "春天", "正午"] },
      { id: "sci_l4_15", unitKey: "sci_l4", qCategory: "sci_fill", type: "fill_blank", typeLabel: "填充題", prompt: "沙漠裏的仙人掌有 ________，可以減少水分流失；它肥厚的莖則可以 ________。", blanks: ["刺狀葉", "儲存水分"], distractors: ["板根", "吸收陽光", "固定樹幹"] },
      { id: "sci_l4_16", unitKey: "sci_l4", qCategory: "sci_fill", type: "fill_blank", typeLabel: "填充題", prompt: "候鳥會從寒冷的 ________ 遷徙到溫暖的 ________ 過冬。", blanks: ["北方", "南方"], distractors: ["東方", "西方", "山頂"] },

      // 三、分類題 (#17 ~ #20)
      {
        id: "sci_l4_17", unitKey: "sci_l4", qCategory: "sci_classify", type: "classify", typeLabel: "分類題",
        prompt: "【自然環境植物多少分類】請把以下五種自然環境放入對應分類籃：",
        baskets: ["較多植物生長", "較少植物生長"],
        items: [
          { label: "濕地", basket: "較多植物生長" },
          { label: "溫帶草原", basket: "較多植物生長" },
          { label: "熱帶雨林", basket: "較多植物生長" },
          { label: "沙漠", basket: "較少植物生長" },
          { label: "極地", basket: "較少植物生長" }
        ],
        answer: "較多：濕地、溫帶草原、熱帶雨林 ｜ 較少：沙漠、極地"
      },
      {
        id: "sci_l4_18", unitKey: "sci_l4", qCategory: "sci_classify", type: "classify", typeLabel: "分類題",
        prompt: "【動物適應環境分類】請把以下動物按牠們適應的環境放入對應分類籃：",
        baskets: ["適應寒冷／冬天", "適應乾燥炎熱沙漠"],
        items: [
          { label: "北極熊", basket: "適應寒冷／冬天" },
          { label: "海象", basket: "適應寒冷／冬天" },
          { label: "刺蝟", basket: "適應寒冷／冬天" },
          { label: "駱駝", basket: "適應乾燥炎熱沙漠" },
          { label: "非洲盾臂龜", basket: "適應乾燥炎熱沙漠" },
          { label: "非洲跳鼠", basket: "適應乾燥炎熱沙漠" },
          { label: "狐獴", basket: "適應乾燥炎熱沙漠" }
        ],
        answer: "寒冷：北極熊、海象、刺蝟 ｜ 沙漠：駱駝、非洲盾臂龜、非洲跳鼠、狐獴"
      },
      {
        id: "sci_l4_19", unitKey: "sci_l4", qCategory: "sci_classify", type: "classify", typeLabel: "分類題",
        prompt: "【植物特徵與作用分類】請把以下植物特徵按其主要作用放入對應分類籃：",
        baskets: ["減少水分流失", "吸收或儲存水分", "有利吸收陽光"],
        items: [
          { label: "A. 草原草類窄長的葉", basket: "減少水分流失" },
          { label: "B. 仙人掌的刺狀葉", basket: "減少水分流失" },
          { label: "C. 草原草類廣闊的根", basket: "吸收或儲存水分" },
          { label: "D. 仙人掌肥厚的莖", basket: "吸收或儲存水分" },
          { label: "E. 雨林底層闊大深綠葉", basket: "有利吸收陽光" },
          { label: "F. 雨林樹木高大參天", basket: "有利吸收陽光" }
        ],
        answer: "減少流失：A、B ｜ 吸收儲存：C、D ｜ 吸收陽光：E、F"
      },
      {
        id: "sci_l4_20", unitKey: "sci_l4", qCategory: "sci_classify", type: "classify", typeLabel: "分類題",
        prompt: "【香港濕地鳥類配對】請把以下特點放入對應鳥類的分類籃：",
        baskets: ["黑臉琵鷺", "赤頸鴨", "白胸苦惡鳥"],
        items: [
          { label: "飛數千公里南下，中途歇息覓食補充能量", basket: "黑臉琵鷺" },
          { label: "泥灘提供魚蝦，每年冬天飛來過冬", basket: "赤頸鴨" },
          { label: "把濕地作為食物、棲息與繁殖的好地方", basket: "白胸苦惡鳥" }
        ],
        answer: "黑臉琵鷺(中途歇息) ｜ 赤頸鴨(泥灘魚蝦過冬) ｜ 白胸苦惡鳥(繁殖地)"
      },

      // 四、看圖填充題 (#21 ~ #24)
      {
        id: "sci_l4_21", unitKey: "sci_l4", qCategory: "sci_img_fill", type: "image_fill", typeLabel: "看圖填充題",
        svgKey: "sci_l4_walrus_skin",
        prompt: "根據「海象皮膚剖面示意圖」，最外層（甲）是 ________，厚厚一層用來保溫的（乙）是 ________。",
        blanks: ["表皮", "皮下脂肪"], distractors: ["鱗片", "外殼", "肌肉"]
      },
      {
        id: "sci_l4_22", unitKey: "sci_l4", qCategory: "sci_img_fill", type: "image_fill", typeLabel: "看圖填充題",
        svgKey: "sci_l4_grassland_plant",
        prompt: "根據「溫帶草原草類植物示意圖」，窄長的葉作用是（甲）________；廣闊的根作用是（乙）________。",
        blanks: ["減少水分流失", "增加水分吸收"], distractors: ["儲存水分", "固定樹幹", "吸收陽光"]
      },
      {
        id: "sci_l4_23", unitKey: "sci_l4", qCategory: "sci_img_fill", type: "image_fill", typeLabel: "看圖填充題",
        svgKey: "sci_l4_cactus",
        prompt: "根據「仙人掌結構圖」，肥厚的莖作用是（甲）________；減少水分流失的構造（乙）是 ________。",
        blanks: ["儲存水分", "刺狀葉"], distractors: ["吸收陽光", "板根", "闊大葉片"]
      },
      {
        id: "sci_l4_24", unitKey: "sci_l4", qCategory: "sci_img_fill", type: "image_fill", typeLabel: "看圖填充題",
        svgKey: "sci_l4_rainforest",
        prompt: "根據「熱帶雨林植物示意圖」，它們的共同作用是增加接觸（甲）________ 的機會；底層植物葉片（乙）________ 而呈深綠色。",
        blanks: ["陽光", "闊大"], distractors: ["雨水", "窄長", "刺狀"]
      },

      // 五、簡答題（#25 ~ #28 — 轉為短詞填空與多選，無長句）
      {
        id: "sci_l4_25", unitKey: "sci_l4", qCategory: "sci_short", type: "fill_blank", typeLabel: "簡答・重點填空",
        prompt: "沙漠因為 ________ 少雨且炎熱，極地因為氣候 ________、終年結冰，惡劣環境不適宜植物生長。",
        blanks: ["乾燥", "嚴寒"], distractors: ["潮濕", "溫暖", "空曠"]
      },
      {
        id: "sci_l4_26", unitKey: "sci_l4", qCategory: "sci_short", type: "multi_mcq", typeLabel: "簡答・多選題",
        prompt: "除了冬眠，動物還會用哪兩個方法應對寒冷的環境？（可選多於一項）",
        options: ["A. 匿藏在溫暖的地方", "B. 與同類緊擠在一起互相取暖", "C. 脫掉身上的濃密毛髮", "D. 到炎熱沙漠尋找水源"],
        answers: ["A. 匿藏在溫暖的地方", "B. 與同類緊擠在一起互相取暖"],
        answer: "A. 匿藏在溫暖的地方、B. 與同類緊擠在一起互相取暖"
      },
      {
        id: "sci_l4_27", unitKey: "sci_l4", qCategory: "sci_short", type: "fill_blank", typeLabel: "簡答・重點填空",
        prompt: "沙漠動物面對的主要挑戰是 ________ 和 ________；狐獴長有利爪挖掘 ________，躲在較清涼的地下。",
        blanks: ["高溫", "缺水", "洞穴"], allowSwapIndices: [0, 1], distractors: ["嚴寒", "鳥巢"]
      },
      {
        id: "sci_l4_28", unitKey: "sci_l4", qCategory: "sci_short", type: "multi_mcq", typeLabel: "簡答・多選題",
        prompt: "候鳥隨着季節變化在不同地區來回遷徙，主要是為了甚麼？（可選多於一項）",
        options: ["A. 逃避嚴寒", "B. 覓食", "C. 繁殖", "D. 進行冬眠"],
        answers: ["A. 逃避嚴寒", "B. 覓食", "C. 繁殖"],
        answer: "A. 逃避嚴寒、B. 覓食、C. 繁殖"
      },

      // 六、問答題／情境題（#29 ~ #30 — 轉為短詞分類籃與多選，無長句）
      {
        id: "sci_l4_29", unitKey: "sci_l4", qCategory: "sci_scenario", type: "classify", typeLabel: "情境・分類籃",
        prompt: "【情境：駱駝駝峯的真相】心怡以為駝峯裝滿水。請分辨關於駝峯的「正確作用」與「錯誤說法」：",
        baskets: ["駝峯真正作用", "錯誤說法"],
        items: [
          { label: "A. 儲存脂肪，缺食物時提供能量", basket: "駝峯真正作用" },
          { label: "B. 集中脂肪，令身體其他部分快散熱", basket: "駝峯真正作用" },
          { label: "C. 裏面裝滿水，口渴時可以喝", basket: "錯誤說法" }
        ],
        answer: "真正作用：A、B ｜ 錯誤說法：C"
      },
      {
        id: "sci_l4_30", unitKey: "sci_l4", qCategory: "sci_scenario", type: "multi_mcq", typeLabel: "情境・多選題",
        prompt: "【情境：米埔觀鳥】為甚麼香港的濕地環境能夠吸引遷徙候鳥或留鳥到來？（可選多於一項）",
        options: ["A. 香港冬季較北方溫暖", "B. 濕地物種豐富（如魚、蝦）提供食物", "C. 提供棲息地供休息和繁殖", "D. 香港終年結冰沒有天敵"],
        answers: ["A. 香港冬季較北方溫暖", "B. 濕地物種豐富（如魚、蝦）提供食物", "C. 提供棲息地供休息和繁殖"],
        answer: "A. 冬季較北方溫暖、B. 提供豐富食物、C. 提供棲息與繁殖地"
      },

      // ==================== 第 5 課：《大自然的平衡》（30題） ====================
      // 一、選擇題 (#01 ~ #08)
      {
        id: "sci_l5_01", unitKey: "sci_l5", qCategory: "sci_mcq", type: "mcq", typeLabel: "選擇題",
        prompt: "自然環境中，哪類生物能吸收陽光能量自行製造食物，不用吃另一種生物也能生存？",
        options: ["A. 草食性動物", "B. 肉食性動物", "C. 雜食性動物", "D. 生產者（植物）"],
        answer: "D. 生產者（植物）"
      },
      {
        id: "sci_l5_02", unitKey: "sci_l5", qCategory: "sci_mcq", type: "mcq", typeLabel: "選擇題",
        prompt: "下列哪一組動物全部屬於「雜食性動物」？",
        options: ["A. 兔、象", "B. 老鼠、野豬", "C. 鯊魚、獅子", "D. 毛蟲、犀牛"],
        answer: "B. 老鼠、野豬"
      },
      {
        id: "sci_l5_03", unitKey: "sci_l5", qCategory: "sci_mcq", type: "mcq", typeLabel: "選擇題",
        prompt: "在食物鏈中，甚麼是指「動物獲取食物的過程」？",
        options: ["A. 攝食", "B. 競爭", "C. 遷徙", "D. 繁殖"],
        answer: "A. 攝食"
      },
      {
        id: "sci_l5_04", unitKey: "sci_l5", qCategory: "sci_mcq", type: "mcq", typeLabel: "選擇題",
        prompt: "在海洋生態環境中，下列哪兩種動物都會捕食魷魚，令不同的食物鏈互相交錯？",
        options: ["A. 浮游植物和海草", "B. 小魚和小蝦", "C. 鯨魚和鯊魚", "D. 海豹和海豚"],
        answer: "C. 鯨魚和鯊魚"
      },
      {
        id: "sci_l5_05", unitKey: "sci_l5", qCategory: "sci_mcq", type: "mcq", typeLabel: "選擇題",
        prompt: "在食物鏈裏，哪一類生物佔的數量最少？",
        options: ["A. 生產者", "B. 草食性動物", "C. 肉食性動物", "D. 以上各類數量相同"],
        answer: "C. 肉食性動物"
      },
      {
        id: "sci_l5_06", unitKey: "sci_l5", qCategory: "sci_mcq", type: "mcq", typeLabel: "選擇題",
        prompt: "在「草 → 兔子 → 狼」中，如果狼被人類大量獵殺，兔子和植物的數量會怎樣變化？",
        options: ["A. 兔的數量減少，植物增加", "B. 兔的數量增加，植物減少", "C. 兔和植物的數量都增加", "D. 兔和植物的數量都減少"],
        answer: "B. 兔的數量增加，植物減少"
      },
      {
        id: "sci_l5_07", unitKey: "sci_l5", qCategory: "sci_mcq", type: "mcq", typeLabel: "選擇題",
        prompt: "樹木長出「支柱根」伸入泥土，支撐向外伸延的枝幹，主要是為了爭奪甚麼？",
        options: ["A. 食物", "B. 土壤／泥，以固定整棵樹", "C. 雨水", "D. 昆蟲"],
        answer: "B. 土壤／泥，以固定整棵樹"
      },
      {
        id: "sci_l5_08", unitKey: "sci_l5", qCategory: "sci_mcq", type: "mcq", typeLabel: "選擇題",
        prompt: "下列哪一項是我們應該做到的保護大自然和野生生物的行為？",
        options: ["A. 餵飼野生猴子讓牠們吃飽", "B. 購買象牙製成品作紀念品", "C. 把外來的生物放入自然環境", "D. 不餵飼野生生物，禁止捕獵"],
        answer: "D. 不餵飼野生生物，禁止捕獵"
      },

      // 二、填充題 (#09 ~ #16)
      { id: "sci_l5_09", unitKey: "sci_l5", qCategory: "sci_fill", type: "fill_blank", typeLabel: "填充題", prompt: "生物之間存在 ________ 關係，彼此構成「________」。", blanks: ["攝食", "食物鏈"], distractors: ["遷徙", "冬眠", "遺傳"] },
      { id: "sci_l5_10", unitKey: "sci_l5", qCategory: "sci_fill", type: "fill_blank", typeLabel: "填充題", prompt: "食物鏈同時表示 ________ 由生產者到 ________ 再到肉食性動物的傳輸過程。", blanks: ["能量", "草食性動物"], distractors: ["水分", "雜食性動物", "陽光"] },
      { id: "sci_l5_11", unitKey: "sci_l5", qCategory: "sci_fill", type: "fill_blank", typeLabel: "填充題", prompt: "肉食性動物是 ________，以其他動物為 ________。", blanks: ["捕食者", "獵物"], distractors: ["生產者", "植物", "同類"] },
      { id: "sci_l5_12", unitKey: "sci_l5", qCategory: "sci_fill", type: "fill_blank", typeLabel: "填充題", prompt: "在海洋中，________ 會吸收陽光能量自行製造食物；小魚和小蝦會吃 ________ 和浮游植物。", blanks: ["浮游植物", "海草"], distractors: ["魷魚", "鯊魚", "珊瑚"] },
      { id: "sci_l5_13", unitKey: "sci_l5", qCategory: "sci_fill", type: "fill_blank", typeLabel: "填充題", prompt: "生物之間相互 ________，也會為爭奪 ________、生存空間和陽光而互相競爭。", blanks: ["依存", "食物"], distractors: ["隔離", "溫度", "雨水"] },
      { id: "sci_l5_14", unitKey: "sci_l5", qCategory: "sci_fill", type: "fill_blank", typeLabel: "填充題", prompt: "有些植物有柔弱的莖部，可以借助其他樹木粗大的 ________ 向上生長，以爭取較多 ________。", blanks: ["樹幹", "陽光"], distractors: ["板根", "泥土", "花粉"] },
      { id: "sci_l5_15", unitKey: "sci_l5", qCategory: "sci_fill", type: "fill_blank", typeLabel: "填充題", prompt: "生物之間的攝食和 ________ 關係，令生物的種類和數量得以 ________，形成穩定的生態環境。", blanks: ["競爭", "平衡"], distractors: ["遷徙", "減少", "失控"] },
      { id: "sci_l5_16", unitKey: "sci_l5", qCategory: "sci_fill", type: "fill_blank", typeLabel: "填充題", prompt: "當自然環境中的生物因為人類 ________ 和 ________ 等原因而變化，生態就會失去平衡。", blanks: ["捕殺", "環境污染"], allowSwapIndices: [0, 1], distractors: ["觀鳥", "植樹", "節水"] },

      // 三、分類題 (#17 ~ #20)
      {
        id: "sci_l5_17", unitKey: "sci_l5", qCategory: "sci_classify", type: "classify", typeLabel: "分類題",
        prompt: "【生物角色分類】請把以下生物放入自然環境中對應的角色分類籃：",
        baskets: ["生產者", "草食性動物", "肉食性動物", "雜食性動物"],
        items: [
          { label: "花、草、樹", basket: "生產者" },
          { label: "毛蟲、犀牛、象", basket: "草食性動物" },
          { label: "鯊魚、蜘蛛、鱷魚、獅子", basket: "肉食性動物" },
          { label: "老鼠、野豬", basket: "雜食性動物" }
        ],
        answer: "生產者：花草樹 ｜ 草食：毛蟲犀牛象 ｜ 肉食：鯊魚蜘蛛鱷魚獅子 ｜ 雜食：老鼠野豬"
      },
      {
        id: "sci_l5_18", unitKey: "sci_l5", qCategory: "sci_classify", type: "classify", typeLabel: "分類題",
        prompt: "【樹林圖生物分類】請把課本樹林圖中的以下生物放入對應分類籃：",
        baskets: ["生產者", "草食性動物", "肉食性動物"],
        items: [
          { label: "草、樹、花", basket: "生產者" },
          { label: "鹿、蝴蝶、兔", basket: "草食性動物" },
          { label: "老虎、蛇、鷹", basket: "肉食性動物" }
        ],
        answer: "生產者：草、樹、花 ｜ 草食：鹿、蝴蝶、兔 ｜ 肉食：老虎、蛇、鷹"
      },
      {
        id: "sci_l5_19", unitKey: "sci_l5", qCategory: "sci_classify", type: "classify", typeLabel: "分類題",
        prompt: "【植物競爭方式分類】請把以下植物特徵按爭奪的資源放入對應分類籃：",
        baskets: ["爭奪生存空間和陽光", "爭奪土壤固定整棵樹"],
        items: [
          { label: "A. 柔弱莖部依附大樹向上長", basket: "爭奪生存空間和陽光" },
          { label: "B. 支柱根伸入泥土支撐枝幹", basket: "爭奪土壤固定整棵樹" },
          { label: "C. 整棵植物長在高大樹幹上", basket: "爭奪生存空間和陽光" },
          { label: "D. 廣闊根部抓緊泥土穩固樹", basket: "爭奪土壤固定整棵樹" }
        ],
        answer: "空間陽光：A、C ｜ 土壤固定：B、D"
      },
      {
        id: "sci_l5_20", unitKey: "sci_l5", qCategory: "sci_classify", type: "classify", typeLabel: "分類題",
        prompt: "【保護與破壞行為分類】請把以下行為放入對應分類籃：",
        baskets: ["保護環境和野生生物", "破壞環境影響平衡"],
        items: [
          { label: "A. 餵飼野生猴子", basket: "破壞環境影響平衡" },
          { label: "B. 不放外來生物入自然界", basket: "保護環境和野生生物" },
          { label: "C. 攜帶象牙進出境", basket: "破壞環境影響平衡" },
          { label: "D. 禁止販賣受保護野生生物", basket: "保護環境和野生生物" },
          { label: "E. 禁止捕獵野生動物", basket: "保護環境和野生生物" },
          { label: "F. 大量噴灑除蟲劑", basket: "破壞環境影響平衡" }
        ],
        answer: "保護：B、D、E ｜ 破壞：A、C、F"
      },

      // 四、看圖填充題 (#21 ~ #24)
      {
        id: "sci_l5_21", unitKey: "sci_l5", qCategory: "sci_img_fill", type: "image_fill", typeLabel: "看圖填充題",
        svgKey: "sci_l5_forest_chain",
        prompt: "根據「樹林食物鏈圖」，箭頭（甲）代表 ________；鹿是（乙）________；老虎是（丙）________。",
        blanks: ["被吃", "草食性動物", "肉食性動物"], distractors: ["捕食", "生產者", "雜食性動物"]
      },
      {
        id: "sci_l5_22", unitKey: "sci_l5", qCategory: "sci_img_fill", type: "image_fill", typeLabel: "看圖填充題",
        svgKey: "sci_l5_ocean_chain",
        prompt: "根據「海洋食物鏈圖」，吃浮游植物的（甲）是 ________；捕食魷魚的（乙）是 ________。",
        blanks: ["小魚", "鯊魚"], distractors: ["海草", "兔子", "老鷹"]
      },
      {
        id: "sci_l5_23", unitKey: "sci_l5", qCategory: "sci_img_fill", type: "image_fill", typeLabel: "看圖填充題",
        svgKey: "sci_l5_pyramid",
        prompt: "根據「生物數量金字塔圖」，數量最少的（甲）是 ________，數量最多的（乙）是 ________。",
        blanks: ["肉食性動物", "生產者"], distractors: ["草食性動物", "雜食性動物", "細菌"]
      },
      {
        id: "sci_l5_24", unitKey: "sci_l5", qCategory: "sci_img_fill", type: "image_fill", typeLabel: "看圖填充題",
        svgKey: "sci_l5_concept_map",
        prompt: "根據「生物之間的關係概念圖」，生物競爭食物、（甲）________ 和生存空間；相互依存構成（乙）________。",
        blanks: ["陽光", "食物鏈"], distractors: ["風力", "冬眠", "遷徙"]
      },

      // 五、簡答題（#25 ~ #28 — 轉為短詞填空與多選，無長句）
      {
        id: "sci_l5_25", unitKey: "sci_l5", qCategory: "sci_short", type: "fill_blank", typeLabel: "簡答・重點填空",
        prompt: "食物在食物鏈中傳送時，部分能量會被 ________，所以 ________ 佔的數量最少。",
        blanks: ["虛耗", "肉食性動物"], distractors: ["增加", "生產者", "草食性動物"]
      },
      {
        id: "sci_l5_26", unitKey: "sci_l5", qCategory: "sci_short", type: "fill_blank", typeLabel: "簡答・重點填空",
        prompt: "在草原上，獅子、獵豹和禿鷲之間會互相 ________，牠們共同爭奪的食物是 ________。",
        blanks: ["競爭", "兔子"], distractors: ["合作", "青草", "老虎"]
      },
      {
        id: "sci_l5_27", unitKey: "sci_l5", qCategory: "sci_short", type: "multi_mcq", typeLabel: "簡答・多選題",
        prompt: "整棵植物長在高大的樹幹上，怎樣幫助它在競爭中求存？（可選多於一項）",
        options: ["A. 避免與地面植物爭奪生存空間", "B. 可以吸收更多陽光", "C. 可以直接捕食昆蟲", "D. 可以減少風沙吹襲"],
        answers: ["A. 避免與地面植物爭奪生存空間", "B. 可以吸收更多陽光"],
        answer: "A. 避免與地面植物爭奪生存空間、B. 可以吸收更多陽光"
      },
      {
        id: "sci_l5_28", unitKey: "sci_l5", qCategory: "sci_short", type: "fill_blank", typeLabel: "簡答・重點填空",
        prompt: "如果人類持續破壞自然環境，生物數量會出現改變，生態就會失去 ________，導致部分生物數量大減或 ________。",
        blanks: ["平衡", "大增"], distractors: ["方向", "不變", "進化"]
      },

      // 六、問答題／情境題（#29 ~ #30 — 轉為分類籃與多選，無長句）
      {
        id: "sci_l5_29", unitKey: "sci_l5", qCategory: "sci_scenario", type: "classify", typeLabel: "情境・分類籃",
        prompt: "【情境：噴灑除蟲劑】在「植物 → 蟲 → 鳥 → 蛇」中，若恆常噴灑除蟲劑，請把各類生物的數量變化放入分類籃：",
        baskets: ["數量增加", "數量減少（且毒素累積）"],
        items: [
          { label: "植物", basket: "數量增加" },
          { label: "蟲", basket: "數量減少（且毒素累積）" },
          { label: "鳥", basket: "數量減少（且毒素累積）" },
          { label: "蛇（毒素沿食物鏈累積）", basket: "數量減少（且毒素累積）" }
        ],
        answer: "增加：植物 ｜ 減少：蟲、鳥、蛇（毒素會隨食物鏈向上累積影響蛇的健康）"
      },
      {
        id: "sci_l5_30", unitKey: "sci_l5", qCategory: "sci_scenario", type: "multi_mcq", typeLabel: "情境・多選題",
        prompt: "【情境：行山保護大自然】小明想餵野生猴子並買象牙，我們應勸阻他做到哪些保護行為？（可選多於一項）",
        options: ["A. 不餵飼野生猴子，天然覓食最穩妥", "B. 不購買或攜帶象牙等受保護製成品", "C. 禁止捕獵野生動物", "D. 不把外來生物放入自然環境"],
        answers: ["A. 不餵飼野生猴子，天然覓食最穩妥", "B. 不購買或攜帶象牙等受保護製成品", "C. 禁止捕獵野生動物", "D. 不把外來生物放入自然環境"],
        answer: "以上四項皆為保護環境和野生生物的正確做法"
      }
    ]
  };
})();
/* ============================================================================
 * 科學科獨立題庫 — 下半部 Part B (questions/questions-science.js - v7.0)
 * 內含：第6、7課 8幅專屬向量插畫 + 第6課《植物的繁殖與遺傳》(30題) + 第7課《動物的繁殖與遺傳》(30題)
 * 請直接緊接貼在 v7.0 Part A 代碼的最下方！
 * ============================================================================ */
(function() {
  if (!window.Aetheria || !window.Aetheria.QuestionBank || !window.Aetheria.QuestionBank.Science) return;

  const MORE_SCI_DIAGRAMS = {
    // 9. 第6課 #21：花的結構剖面示意圖
    sci_l6_flower_parts: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 155">
      <rect width="280" height="155" rx="12" fill="#fce4ec"/>
      <rect x="14" y="8" width="252" height="22" rx="5" fill="#c2185b"/>
      <text x="140" y="23" font-size="11.5" font-weight="bold" fill="#ffffff" text-anchor="middle">花的結構剖面示意圖</text>
      <!-- 花托與花萼 -->
      <rect x="135" y="118" width="10" height="28" fill="#2e7d32"/>
      <path d="M110,118 Q140,130 170,118 Q154,112 140,116 Q126,112 110,118 Z" fill="#43a047" stroke="#1b5e20" stroke-width="1.5"/>
      <!-- 花瓣 -->
      <path d="M132,114 C92,102 82,56 116,44 C128,60 132,88 134,114 Z" fill="#f48fb1" stroke="#ad1457" stroke-width="1.5"/>
      <path d="M148,114 C188,102 198,56 164,44 C152,60 148,88 146,114 Z" fill="#f48fb1" stroke="#ad1457" stroke-width="1.5"/>
      <!-- 雌蕊（中央） -->
      <ellipse cx="140" cy="102" rx="11" ry="14" fill="#c8e6c9" stroke="#2e7d32" stroke-width="2"/>
      <rect x="137" y="60" width="6" height="32" fill="#81c784" stroke="#2e7d32" stroke-width="1.2"/>
      <ellipse cx="140" cy="58" rx="7" ry="4" fill="#fdd835" stroke="#f57f17" stroke-width="1.2"/>
      <!-- 雄蕊（兩側） -->
      <line x1="126" y1="108" x2="116" y2="68" stroke="#66bb6a" stroke-width="2.2"/>
      <ellipse cx="115" cy="65" rx="5" ry="3.5" fill="#ff9800" stroke="#e65100" stroke-width="1.2"/>
      <line x1="154" y1="108" x2="164" y2="68" stroke="#66bb6a" stroke-width="2.2"/>
      <ellipse cx="165" cy="65" rx="5" ry="3.5" fill="#ff9800" stroke="#e65100" stroke-width="1.2"/>
      <!-- 標註線 -->
      <line x1="96" y1="62" x2="66" y2="54" stroke="#ad1457" stroke-width="1.5"/>
      <text x="62" y="57" font-size="10.5" font-weight="bold" fill="#880e4f" text-anchor="end">花瓣</text>
      <line x1="112" y1="68" x2="66" y2="86" stroke="#e65100" stroke-width="1.5"/>
      <text x="62" y="89" font-size="10.5" font-weight="bold" fill="#e65100" text-anchor="end">（甲）？</text>
      <line x1="147" y1="58" x2="210" y2="54" stroke="#1b5e20" stroke-width="1.5"/>
      <text x="214" y="57" font-size="10.5" font-weight="bold" fill="#1b5e20">（乙）？</text>
      <line x1="168" y1="118" x2="210" y2="120" stroke="#1b5e20" stroke-width="1.5"/>
      <text x="214" y="123" font-size="10.5" font-weight="bold" fill="#2e7d32">花萼</text>
    </svg>`,

    // 10. 第6課 #22：種子傳播方式示意圖
    sci_l6_seed_dispersal: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 150">
      <rect width="280" height="150" rx="12" fill="#e8f5e9"/>
      <rect x="14" y="8" width="252" height="22" rx="5" fill="#2e7d32"/>
      <text x="140" y="23" font-size="11.5" font-weight="bold" fill="#ffffff" text-anchor="middle">植物傳播種子的四種方式</text>
      <rect x="14" y="38" width="122" height="46" rx="6" fill="#ffffff" stroke="#66bb6a" stroke-width="1.8"/>
      <text x="75" y="55" font-size="10.5" font-weight="bold" fill="#1b5e20" text-anchor="middle">蒲公英（帶絨毛）</text>
      <text x="75" y="74" font-size="10.5" font-weight="bold" fill="#e65100" text-anchor="middle">方式：（甲）？</text>
      <rect x="144" y="38" width="122" height="46" rx="6" fill="#ffffff" stroke="#29b6f6" stroke-width="1.8"/>
      <text x="205" y="55" font-size="10.5" font-weight="bold" fill="#01579b" text-anchor="middle">椰子（能浮於水面）</text>
      <text x="205" y="74" font-size="10.5" font-weight="bold" fill="#0277bd" text-anchor="middle">方式：水力傳播</text>
      <rect x="14" y="92" width="122" height="46" rx="6" fill="#ffffff" stroke="#ffb74d" stroke-width="1.8"/>
      <text x="75" y="109" font-size="10.5" font-weight="bold" fill="#5d4037" text-anchor="middle">鬼針草（帶倒鉤）</text>
      <text x="75" y="128" font-size="10.5" font-weight="bold" fill="#e65100" text-anchor="middle">方式：動物傳播</text>
      <rect x="144" y="92" width="122" height="46" rx="6" fill="#ffffff" stroke="#ef5350" stroke-width="1.8"/>
      <text x="205" y="109" font-size="10.5" font-weight="bold" fill="#b71c1c" text-anchor="middle">鳳仙花（果莢爆裂）</text>
      <text x="205" y="128" font-size="10.5" font-weight="bold" fill="#e65100" text-anchor="middle">方式：（乙）？</text>
    </svg>`,

    // 11. 第6課 #23：種子發芽條件對照實驗圖
    sci_l6_germination: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 150">
      <rect width="280" height="150" rx="12" fill="#e3f2fd"/>
      <rect x="14" y="8" width="252" height="22" rx="5" fill="#1565c0"/>
      <text x="140" y="23" font-size="11.5" font-weight="bold" fill="#ffffff" text-anchor="middle">綠豆種子發芽條件對照實驗</text>
      <!-- 燒杯 A -->
      <rect x="16" y="42" width="76" height="94" rx="6" fill="#ffffff" stroke="#2e7d32" stroke-width="2"/>
      <text x="54" y="57" font-size="10.5" font-weight="bold" fill="#1b5e20" text-anchor="middle">裝置 A (發芽)</text>
      <text x="54" y="74" font-size="9.5" fill="#37474f" text-anchor="middle">濕棉花</text>
      <text x="54" y="90" font-size="9.5" fill="#37474f" text-anchor="middle">室溫 25°C</text>
      <text x="54" y="106" font-size="9.5" fill="#37474f" text-anchor="middle">有空氣</text>
      <text x="54" y="126" font-size="10" font-weight="bold" fill="#2e7d32" text-anchor="middle">✓ 成功發芽</text>
      <!-- 燒杯 B -->
      <rect x="102" y="42" width="76" height="94" rx="6" fill="#ffffff" stroke="#ef6c00" stroke-width="2"/>
      <text x="140" y="57" font-size="10.5" font-weight="bold" fill="#e65100" text-anchor="middle">裝置 B (不發芽)</text>
      <text x="140" y="74" font-size="9.5" font-weight="bold" fill="#c62828" text-anchor="middle">乾棉花</text>
      <text x="140" y="90" font-size="9.5" fill="#37474f" text-anchor="middle">室溫 25°C</text>
      <text x="140" y="106" font-size="9.5" fill="#37474f" text-anchor="middle">有空氣</text>
      <text x="140" y="126" font-size="9.5" font-weight="bold" fill="#c62828" text-anchor="middle">缺（甲）？</text>
      <!-- 燒杯 C -->
      <rect x="188" y="42" width="76" height="94" rx="6" fill="#ffffff" stroke="#1565c0" stroke-width="2"/>
      <text x="226" y="57" font-size="10.5" font-weight="bold" fill="#0d47a1" text-anchor="middle">裝置 C (不發芽)</text>
      <text x="226" y="74" font-size="9.5" fill="#37474f" text-anchor="middle">濕棉花</text>
      <text x="226" y="90" font-size="9.5" font-weight="bold" fill="#c62828" text-anchor="middle">雪櫃 4°C</text>
      <text x="226" y="106" font-size="9.5" fill="#37474f" text-anchor="middle">有空氣</text>
      <text x="226" y="126" font-size="9.5" font-weight="bold" fill="#c62828" text-anchor="middle">缺（乙）？</text>
    </svg>`,

    // 12. 第6課 #24：植物營養繁殖示意圖
    sci_l6_veg_repro: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 145">
      <rect width="280" height="145" rx="12" fill="#fff8e1"/>
      <rect x="14" y="8" width="252" height="22" rx="5" fill="#ef6c00"/>
      <text x="140" y="23" font-size="11.5" font-weight="bold" fill="#ffffff" text-anchor="middle">不用種子：植物營養繁殖例子</text>
      <rect x="12" y="42" width="80" height="88" rx="7" fill="#ffffff" stroke="#8d6e63" stroke-width="1.8"/>
      <text x="52" y="62" font-size="11" font-weight="bold" fill="#4e342e" text-anchor="middle">番薯</text>
      <ellipse cx="52" cy="84" rx="22" ry="11" fill="#d84315"/>
      <text x="52" y="116" font-size="10" font-weight="bold" fill="#e65100" text-anchor="middle">用（甲）？繁殖</text>
      <rect x="100" y="42" width="80" height="88" rx="7" fill="#ffffff" stroke="#f9a825" stroke-width="1.8"/>
      <text x="140" y="62" font-size="11" font-weight="bold" fill="#4e342e" text-anchor="middle">馬鈴薯</text>
      <ellipse cx="140" cy="84" rx="20" ry="13" fill="#ffe082" stroke="#f57f17" stroke-width="1.5"/>
      <text x="140" y="116" font-size="10" font-weight="bold" fill="#2e7d32" text-anchor="middle">用 莖 繁殖</text>
      <rect x="188" y="42" width="80" height="88" rx="7" fill="#ffffff" stroke="#2e7d32" stroke-width="1.8"/>
      <text x="228" y="62" font-size="11" font-weight="bold" fill="#1b5e20" text-anchor="middle">落地生根</text>
      <ellipse cx="228" cy="84" rx="22" ry="11" fill="#66bb6a" stroke="#1b5e20" stroke-width="1.5"/>
      <text x="228" y="116" font-size="10" font-weight="bold" fill="#e65100" text-anchor="middle">用（乙）？繁殖</text>
    </svg>`,

    // 13. 第7課 #21：雞蛋內部結構剖面圖
    sci_l7_egg_structure: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 150">
      <rect width="280" height="150" rx="12" fill="#fffde7"/>
      <rect x="14" y="8" width="252" height="22" rx="5" fill="#f57f17"/>
      <text x="140" y="23" font-size="11.5" font-weight="bold" fill="#ffffff" text-anchor="middle">鳥蛋（雞蛋）內部結構剖面圖</text>
      <!-- 蛋殼 -->
      <ellipse cx="128" cy="90" rx="68" ry="44" fill="#ffe0b2" stroke="#8d6e63" stroke-width="3"/>
      <!-- 氣室 -->
      <path d="M62,84 A66,42 0 0,0 62,96 Q74,90 62,84 Z" fill="#ffffff" stroke="#90a4ae" stroke-width="1.5"/>
      <!-- 蛋白 -->
      <ellipse cx="132" cy="90" rx="52" ry="34" fill="#fff8e1" stroke="#ffe082" stroke-width="1.5"/>
      <!-- 蛋黃 -->
      <circle cx="136" cy="90" r="21" fill="#ffb300" stroke="#ef6c00" stroke-width="2"/>
      <!-- 標註 -->
      <line x1="68" y1="90" x2="36" y2="58" stroke="#546e7a" stroke-width="1.5"/>
      <text x="34" y="54" font-size="10" font-weight="bold" fill="#37474f" text-anchor="middle">氣室</text>
      <line x1="156" y1="88" x2="210" y2="62" stroke="#ef6c00" stroke-width="1.5"/>
      <text x="214" y="66" font-size="10.5" font-weight="bold" fill="#e65100">（甲）？</text>
      <line x1="176" y1="106" x2="210" y2="106" stroke="#8d6e63" stroke-width="1.5"/>
      <text x="214" y="110" font-size="10.5" font-weight="bold" fill="#5d4037">（乙）？</text>
      <text x="214" y="126" font-size="9" fill="#5d4037">(保護內部)</text>
    </svg>`,

    // 14. 第7課 #22：蝴蝶生命週期圖
    sci_l7_butterfly_cycle: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 145">
      <rect width="280" height="145" rx="12" fill="#f3e5f5"/>
      <rect x="14" y="8" width="252" height="22" rx="5" fill="#7b1fa2"/>
      <text x="140" y="23" font-size="11.5" font-weight="bold" fill="#ffffff" text-anchor="middle">蝴蝶的生命週期（完全變態）</text>
      <rect x="12" y="58" width="54" height="36" rx="7" fill="#ffffff" stroke="#7b1fa2" stroke-width="2"/>
      <text x="39" y="80" font-size="11.5" font-weight="bold" fill="#4a148c" text-anchor="middle">卵</text>
      <text x="74" y="80" font-size="13" font-weight="bold" fill="#7b1fa2" text-anchor="middle">➔</text>
      <rect x="82" y="58" width="54" height="36" rx="7" fill="#fff9c4" stroke="#f57f17" stroke-width="2"/>
      <text x="109" y="80" font-size="10.5" font-weight="bold" fill="#e65100" text-anchor="middle">（甲）？</text>
      <text x="144" y="80" font-size="13" font-weight="bold" fill="#7b1fa2" text-anchor="middle">➔</text>
      <rect x="152" y="58" width="54" height="36" rx="7" fill="#fff9c4" stroke="#f57f17" stroke-width="2"/>
      <text x="179" y="80" font-size="10.5" font-weight="bold" fill="#e65100" text-anchor="middle">（乙）？</text>
      <text x="214" y="80" font-size="13" font-weight="bold" fill="#7b1fa2" text-anchor="middle">➔</text>
      <rect x="222" y="58" width="48" height="36" rx="7" fill="#e1bee7" stroke="#6a1b9a" stroke-width="2"/>
      <text x="246" y="80" font-size="11" font-weight="bold" fill="#4a148c" text-anchor="middle">成蟲</text>
      <text x="140" y="120" font-size="10" font-weight="bold" fill="#6a1b9a" text-anchor="middle">經歷四個不同形態階段</text>
    </svg>`,

    // 15. 第7課 #23：青蛙生命週期圖
    sci_l7_frog_cycle: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 145">
      <rect width="280" height="145" rx="12" fill="#e0f2f1"/>
      <rect x="14" y="8" width="252" height="22" rx="5" fill="#00695c"/>
      <text x="140" y="23" font-size="11.5" font-weight="bold" fill="#ffffff" text-anchor="middle">青蛙的成長變化（兩棲類）</text>
      <rect x="12" y="58" width="54" height="36" rx="7" fill="#ffffff" stroke="#00695c" stroke-width="2"/>
      <text x="39" y="80" font-size="11.5" font-weight="bold" fill="#004d40" text-anchor="middle">卵</text>
      <text x="74" y="80" font-size="13" font-weight="bold" fill="#00695c" text-anchor="middle">➔</text>
      <rect x="82" y="58" width="56" height="36" rx="7" fill="#fff9c4" stroke="#f57f17" stroke-width="2"/>
      <text x="110" y="80" font-size="10.5" font-weight="bold" fill="#e65100" text-anchor="middle">（甲）？</text>
      <text x="146" y="80" font-size="13" font-weight="bold" fill="#00695c" text-anchor="middle">➔</text>
      <rect x="154" y="58" width="52" height="36" rx="7" fill="#b2dfdb" stroke="#00695c" stroke-width="2"/>
      <text x="180" y="80" font-size="11" font-weight="bold" fill="#004d40" text-anchor="middle">幼蛙</text>
      <text x="214" y="80" font-size="13" font-weight="bold" fill="#00695c" text-anchor="middle">➔</text>
      <rect x="222" y="58" width="48" height="36" rx="7" fill="#80cbc4" stroke="#004d40" stroke-width="2"/>
      <text x="246" y="80" font-size="11" font-weight="bold" fill="#004d40" text-anchor="middle">成蛙</text>
      <text x="140" y="120" font-size="10" font-weight="bold" fill="#004d40" text-anchor="middle">（甲）在水中用（乙）？呼吸，長大後用肺和皮膚呼吸</text>
    </svg>`,

    // 16. 第7課 #24：人類遺傳與非遺傳特徵對照圖
    sci_l7_heredity_traits: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 150">
      <rect width="280" height="150" rx="12" fill="#e8eaf6"/>
      <rect x="14" y="8" width="252" height="22" rx="5" fill="#283593"/>
      <text x="140" y="23" font-size="11.5" font-weight="bold" fill="#ffffff" text-anchor="middle">人類的遺傳特徵 vs 後天特徵</text>
      <rect x="14" y="40" width="122" height="96" rx="7" fill="#ffffff" stroke="#2e7d32" stroke-width="2"/>
      <text x="75" y="58" font-size="11" font-weight="bold" fill="#1b5e20" text-anchor="middle">會（甲）？給下一代</text>
      <text x="75" y="78" font-size="10" fill="#37474f" text-anchor="middle">• 單眼皮 / 雙眼皮</text>
      <text x="75" y="96" font-size="10" fill="#37474f" text-anchor="middle">• 能否捲舌</text>
      <text x="75" y="114" font-size="10" fill="#37474f" text-anchor="middle">• 耳垂分離 / 相連</text>
      <rect x="144" y="40" width="122" height="96" rx="7" fill="#ffffff" stroke="#c62828" stroke-width="2"/>
      <text x="205" y="58" font-size="11" font-weight="bold" fill="#b71c1c" text-anchor="middle">（乙）？因素（不遺傳）</text>
      <text x="205" y="78" font-size="10" fill="#37474f" text-anchor="middle">• 跌倒留下的傷疤</text>
      <text x="205" y="96" font-size="10" fill="#37474f" text-anchor="middle">• 染髮或剪短髮</text>
      <text x="205" y="114" font-size="10" fill="#37474f" text-anchor="middle">• 學會游泳、彈琴</text>
    </svg>`
  };

  Object.assign(window.Aetheria.QuestionBank.Science.DIAGRAMS, MORE_SCI_DIAGRAMS);

  const MORE_SCI_QUESTIONS = [
    // ==================== 第 6 課：《植物的繁殖與遺傳》（30題） ====================
    // 一、選擇題 (#01 ~ #08)
    {
      id: "sci_l6_01", unitKey: "sci_l6", qCategory: "sci_mcq", type: "mcq", typeLabel: "選擇題",
      prompt: "一朵完整的花通常由哪四個主要部分組成？",
      options: ["A. 根、莖、葉、種子", "B. 花萼、花瓣、雄蕊、雌蕊", "C. 果皮、果肉、種子、葉片", "D. 樹幹、樹枝、花瓣、果實"],
      answer: "B. 花萼、花瓣、雄蕊、雌蕊"
    },
    {
      id: "sci_l6_02", unitKey: "sci_l6", qCategory: "sci_mcq", type: "mcq", typeLabel: "選擇題",
      prompt: "花的哪一個部分會產生花粉？",
      options: ["A. 花萼", "B. 花瓣", "C. 雄蕊", "D. 雌蕊"],
      answer: "C. 雄蕊"
    },
    {
      id: "sci_l6_03", unitKey: "sci_l6", qCategory: "sci_mcq", type: "mcq", typeLabel: "選擇題",
      prompt: "依靠昆蟲幫助傳粉的花（蟲媒花）通常具有甚麼特點？",
      options: ["A. 花瓣鮮豔、有香味和花蜜", "B. 花朵細小、沒有顏色和香味", "C. 花粉非常輕且沒有黏性", "D. 生長在水底不接觸空氣"],
      answer: "A. 花瓣鮮豔、有香味和花蜜"
    },
    {
      id: "sci_l6_04", unitKey: "sci_l6", qCategory: "sci_mcq", type: "mcq", typeLabel: "選擇題",
      prompt: "花朵完成傳粉和受精後，通常哪個部分會發育成為果實和種子？",
      options: ["A. 花瓣", "B. 花萼", "C. 雄蕊", "D. 雌蕊的子房與胚珠"],
      answer: "D. 雌蕊的子房與胚珠"
    },
    {
      id: "sci_l6_05", unitKey: "sci_l6", qCategory: "sci_mcq", type: "mcq", typeLabel: "選擇題",
      prompt: "下列哪一項不是種子發芽的「必須」條件？",
      options: ["A. 水分", "B. 空氣", "C. 適當的溫度", "D. 泥土和陽光"],
      answer: "D. 泥土和陽光"
    },
    {
      id: "sci_l6_06", unitKey: "sci_l6", qCategory: "sci_mcq", type: "mcq", typeLabel: "選擇題",
      prompt: "蒲公英的種子輕小且長有像降落傘般的絨毛，它主要依靠甚麼傳播種子？",
      options: ["A. 風力", "B. 水力", "C. 動物", "D. 彈力"],
      answer: "A. 風力"
    },
    {
      id: "sci_l6_07", unitKey: "sci_l6", qCategory: "sci_mcq", type: "mcq", typeLabel: "選擇題",
      prompt: "下列哪一種植物可以用「葉」來進行營養繁殖，在葉片邊緣長出新芽？",
      options: ["A. 番薯", "B. 馬鈴薯", "C. 落地生根", "D. 椰子"],
      answer: "C. 落地生根"
    },
    {
      id: "sci_l6_08", unitKey: "sci_l6", qCategory: "sci_mcq", type: "mcq", typeLabel: "選擇題",
      prompt: "關於植物的遺傳與變異，下列哪一項說法是正確的？",
      options: ["A. 子代與親代完全沒有相似之處", "B. 子代會遺傳親代的特徵，但也會有個別差異", "C. 同一棵樹結出的果實大小一定完全相同", "D. 植物沒有遺傳現象"],
      answer: "B. 子代會遺傳親代的特徵，但也會有個別差異"
    },

    // 二、填充題 (#09 ~ #16)
    { id: "sci_l6_09", unitKey: "sci_l6", qCategory: "sci_fill", type: "fill_blank", typeLabel: "填充題", prompt: "花粉從雄蕊傳到雌蕊柱頭上的過程，稱為 ________。", blanks: ["傳粉"], distractors: ["發芽", "受精", "遺傳"] },
    { id: "sci_l6_10", unitKey: "sci_l6", qCategory: "sci_fill", type: "fill_blank", typeLabel: "填充題", prompt: "花朵傳粉受精後，花瓣逐漸凋謝，雌蕊的子房會發育成 ________，裏面的胚珠會發育成 ________。", blanks: ["果實", "種子"], distractors: ["花萼", "葉片", "樹幹"] },
    { id: "sci_l6_11", unitKey: "sci_l6", qCategory: "sci_fill", type: "fill_blank", typeLabel: "填充題", prompt: "種子發芽必須具備三個條件：充足的 ________、________ 和適當的 ________。", blanks: ["水分", "空氣", "溫度"], allowSwapIndices: [0, 1], distractors: ["陽光", "泥土"] },
    { id: "sci_l6_12", unitKey: "sci_l6", qCategory: "sci_fill", type: "fill_blank", typeLabel: "填充題", prompt: "椰子的果實外殼防水且能浮在水面，主要靠 ________ 傳播種子。", blanks: ["水力"], distractors: ["風力", "彈力", "動物"] },
    { id: "sci_l6_13", unitKey: "sci_l6", qCategory: "sci_fill", type: "fill_blank", typeLabel: "填充題", prompt: "鳳仙花和豌豆的果莢成熟後會自動爆裂，把種子彈射出去，這屬於 ________ 傳播。", blanks: ["彈力"], distractors: ["水力", "風力", "動物"] },
    { id: "sci_l6_14", unitKey: "sci_l6", qCategory: "sci_fill", type: "fill_blank", typeLabel: "填充題", prompt: "有些植物不需要種子，直接用根、________ 或 ________ 也能繁殖出新植株，這稱為營養繁殖。", blanks: ["莖", "葉"], allowSwapIndices: [0, 1], distractors: ["花瓣", "果皮", "花粉"] },
    { id: "sci_l6_15", unitKey: "sci_l6", qCategory: "sci_fill", type: "fill_blank", typeLabel: "填充題", prompt: "親代植物把葉形、花色等特徵傳給子代的現象，稱為 ________。", blanks: ["遺傳"], distractors: ["變異", "傳粉", "競爭"] },
    { id: "sci_l6_16", unitKey: "sci_l6", qCategory: "sci_fill", type: "fill_blank", typeLabel: "填充題", prompt: "子代植物與親代或同類之間出現的細微差別（如花瓣大小略不同），稱為 ________。", blanks: ["變異"], distractors: ["遺傳", "發芽", "受精"] },

    // 三、分類題 (#17 ~ #20)
    {
      id: "sci_l6_17", unitKey: "sci_l6", qCategory: "sci_classify", type: "classify", typeLabel: "分類題",
      prompt: "【傳粉媒介分類】請把以下花朵特徵放入「蟲媒花」或「風媒花」分類籃：",
      baskets: ["蟲媒花（靠昆蟲）", "風媒花（靠風力）"],
      items: [
        { label: "A. 花瓣色彩鮮豔", basket: "蟲媒花（靠昆蟲）" },
        { label: "B. 帶有香味和花蜜", basket: "蟲媒花（靠昆蟲）" },
        { label: "C. 花朵細小不顯眼", basket: "風媒花（靠風力）" },
        { label: "D. 花粉輕小且數量極多", basket: "風媒花（靠風力）" }
      ],
      answer: "蟲媒花：A、B ｜ 風媒花：C、D"
    },
    {
      id: "sci_l6_18", unitKey: "sci_l6", qCategory: "sci_classify", type: "classify", typeLabel: "分類題",
      prompt: "【種子傳播方式分類】請把以下植物放入對應的傳播方式分類籃：",
      baskets: ["風力傳播", "水力傳播", "動物傳播", "彈力傳播"],
      items: [
        { label: "蒲公英、楓樹", basket: "風力傳播" },
        { label: "椰子、蓮子", basket: "水力傳播" },
        { label: "鬼針草、車厘子", basket: "動物傳播" },
        { label: "鳳仙花、豌豆", basket: "彈力傳播" }
      ],
      answer: "風力：蒲公英/楓樹 ｜ 水力：椰子/蓮子 ｜ 動物：鬼針草/車厘子 ｜ 彈力：鳳仙花/豌豆"
    },
    {
      id: "sci_l6_19", unitKey: "sci_l6", qCategory: "sci_classify", type: "classify", typeLabel: "分類題",
      prompt: "【營養繁殖部位分類】請把以下植物按其常用的繁殖部位放入對應分類籃：",
      baskets: ["用根繁殖", "用莖繁殖", "用葉繁殖"],
      items: [
        { label: "番薯、紅蘿蔔", basket: "用根繁殖" },
        { label: "馬鈴薯、薑、洋蔥", basket: "用莖繁殖" },
        { label: "落地生根、非洲紫羅蘭", basket: "用葉繁殖" }
      ],
      answer: "根：番薯/紅蘿蔔 ｜ 莖：馬鈴薯/薑/洋蔥 ｜ 葉：落地生根/非洲紫羅蘭"
    },
    {
      id: "sci_l6_20", unitKey: "sci_l6", qCategory: "sci_classify", type: "classify", typeLabel: "分類題",
      prompt: "【發芽條件分類】請分辨以下條件屬於種子發芽「必須條件」還是「非必須條件」：",
      baskets: ["發芽必須條件", "發芽非必須條件"],
      items: [
        { label: "水分", basket: "發芽必須條件" },
        { label: "空氣", basket: "發芽必須條件" },
        { label: "適當的溫度", basket: "發芽必須條件" },
        { label: "泥土", basket: "發芽非必須條件" },
        { label: "陽光", basket: "發芽非必須條件" }
      ],
      answer: "必須：水分、空氣、適當溫度 ｜ 非必須：泥土、陽光"
    },

    // 四、看圖填充題 (#21 ~ #24)
    {
      id: "sci_l6_21", unitKey: "sci_l6", qCategory: "sci_img_fill", type: "image_fill", typeLabel: "看圖填充題",
      svgKey: "sci_l6_flower_parts",
      prompt: "根據「花的結構剖面圖」，產生花粉的（甲）是 ________，位於中央的（乙）是 ________。",
      blanks: ["雄蕊", "雌蕊"], distractors: ["花萼", "花瓣", "種子"]
    },
    {
      id: "sci_l6_22", unitKey: "sci_l6", qCategory: "sci_img_fill", type: "image_fill", typeLabel: "看圖填充題",
      svgKey: "sci_l6_seed_dispersal",
      prompt: "根據「種子傳播方式圖」，蒲公英屬於（甲）________；鳳仙花果莢爆裂屬於（乙）________。",
      blanks: ["風力傳播", "彈力傳播"], distractors: ["水力傳播", "動物傳播", "人工傳播"]
    },
    {
      id: "sci_l6_23", unitKey: "sci_l6", qCategory: "sci_img_fill", type: "image_fill", typeLabel: "看圖填充題",
      svgKey: "sci_l6_germination",
      prompt: "根據「綠豆發芽對照實驗圖」，裝置 B 不發芽是因為缺少（甲）________；裝置 C 放雪櫃不發芽是因為缺少（乙）________。",
      blanks: ["水分", "適當的溫度"], distractors: ["空氣", "陽光", "泥土"]
    },
    {
      id: "sci_l6_24", unitKey: "sci_l6", qCategory: "sci_img_fill", type: "image_fill", typeLabel: "看圖填充題",
      svgKey: "sci_l6_veg_repro",
      prompt: "根據「營養繁殖例子圖」，番薯可用（甲）________ 繁殖，落地生根可用（乙）________ 繁殖。",
      blanks: ["根", "葉"], distractors: ["莖", "花", "種子"]
    },

    // 五、簡答題（#25 ~ #28 — 轉為短詞填空與多選，無長句）
    {
      id: "sci_l6_25", unitKey: "sci_l6", qCategory: "sci_short", type: "multi_mcq", typeLabel: "簡答・多選題",
      prompt: "植物要把種子傳播到遠離母株的地方，有甚麼好處？（可選多於一項）",
      options: ["A. 避免與母株爭奪陽光、水分和空間", "B. 擴大植物的生長範圍，增加存活機會", "C. 讓種子永遠不會發芽", "D. 減少空氣中的氧氣"],
      answers: ["A. 避免與母株爭奪陽光、水分和空間", "B. 擴大植物的生長範圍，增加存活機會"],
      answer: "A. 避免與母株爭奪資源、B. 擴大生長範圍增加存活機會"
    },
    {
      id: "sci_l6_26", unitKey: "sci_l6", qCategory: "sci_short", type: "multi_mcq", typeLabel: "簡答・多選題",
      prompt: "依靠「動物」傳播種子的果實或種子，通常具備哪兩種常見特徵？（可選多於一項）",
      options: ["A. 果肉鮮甜多汁，吸引動物吃下再排出種子", "B. 表面長有倒鉤或刺，黏附在動物皮毛上", "C. 外殼堅硬防水並能浮於水面", "D. 成熟時果莢會自動爆裂彈出"],
      answers: ["A. 果肉鮮甜多汁，吸引動物吃下再排出種子", "B. 表面長有倒鉤或刺，黏附在動物皮毛上"],
      answer: "A. 果肉鮮甜吸引進食排出、B. 長有倒鉤黏附皮毛"
    },
    {
      id: "sci_l6_27", unitKey: "sci_l6", qCategory: "sci_short", type: "fill_blank", typeLabel: "簡答・重點填空",
      prompt: "種子發芽時先由種子儲存的養分供給能量，所以不需要 ________；但長出綠葉後就需要 ________ 進行光合作用製造食物。",
      blanks: ["陽光", "陽光"], distractors: ["水分", "空氣", "溫度"]
    },
    {
      id: "sci_l6_28", unitKey: "sci_l6", qCategory: "sci_short", type: "fill_blank", typeLabel: "簡答・重點填空",
      prompt: "用營養繁殖培育出來的子代植物，通常會保留與 ________ 幾乎完全相同的 ________ 特徵。",
      blanks: ["親代", "遺傳"], distractors: ["昆蟲", "變異", "氣候"]
    },

    // 六、問答題／情境題（#29 ~ #30 — 轉為短詞填空與多選，無長句）
    {
      id: "sci_l6_29", unitKey: "sci_l6", qCategory: "sci_scenario", type: "fill_blank", typeLabel: "情境・重點填空",
      prompt: "【情境：綠豆發芽失敗】小明把綠豆完全浸沒在裝滿水的玻璃杯底，三天後綠豆沒有發芽，是因為種子被水完全覆蓋而缺少了 ________。",
      blanks: ["空氣"], distractors: ["水分", "陽光", "泥土"]
    },
    {
      id: "sci_l6_30", unitKey: "sci_l6", qCategory: "sci_scenario", type: "multi_mcq", typeLabel: "情境・多選題",
      prompt: "【情境：果園減產】果園今年噴了大量殺蟲劑令蜜蜂大減，結果果樹結果量大跌。以下哪些解釋是正確的？（可選多於一項）",
      options: ["A. 果樹花朵主要靠蜜蜂等昆蟲傳粉", "B. 蜜蜂減少導致花朵無法順利傳粉受精", "C. 沒有受精就難以結成果實和種子", "D. 因為果樹缺少了風力吹襲"],
      answers: ["A. 果樹花朵主要靠蜜蜂等昆蟲傳粉", "B. 蜜蜂減少導致花朵無法順利傳粉受精", "C. 沒有受精就難以結成果實和種子"],
      answer: "A、B、C 皆正確"
    },

    // ==================== 第 7 課：《動物的繁殖與遺傳》（30題） ====================
    // 一、選擇題 (#01 ~ #08)
    {
      id: "sci_l7_01", unitKey: "sci_l7", qCategory: "sci_mcq", type: "mcq", typeLabel: "選擇題",
      prompt: "動物透過產卵繁殖下一代的方式，稱為甚麼？",
      options: ["A. 胎生", "B. 卵生", "C. 營養繁殖", "D. 變態"],
      answer: "B. 卵生"
    },
    {
      id: "sci_l7_02", unitKey: "sci_l7", qCategory: "sci_mcq", type: "mcq", typeLabel: "選擇題",
      prompt: "下列哪一組動物全部屬於「胎生動物」？",
      options: ["A. 貓、鯨魚、海豚", "B. 雞、企鵝、海龜", "C. 青蛙、金魚、鱷魚", "D. 蝴蝶、蛇、鴨嘴獸"],
      answer: "A. 貓、鯨魚、海豚"
    },
    {
      id: "sci_l7_03", unitKey: "sci_l7", qCategory: "sci_mcq", type: "mcq", typeLabel: "選擇題",
      prompt: "在鳥蛋的內部結構中，哪一部分主要為發育中的胚胎提供養分？",
      options: ["A. 蛋殼", "B. 氣室", "C. 蛋黃和蛋白", "D. 羽毛"],
      answer: "C. 蛋黃和蛋白"
    },
    {
      id: "sci_l7_04", unitKey: "sci_l7", qCategory: "sci_mcq", type: "mcq", typeLabel: "選擇題",
      prompt: "蝴蝶的一生會經歷「卵 → 幼蟲 → 蛹 → 成蟲」四個階段，這屬於哪一種變態？",
      options: ["A. 完全變態", "B. 不完全變態", "C. 胎生發育", "D. 直接發育"],
      answer: "A. 完全變態"
    },
    {
      id: "sci_l7_05", unitKey: "sci_l7", qCategory: "sci_mcq", type: "mcq", typeLabel: "選擇題",
      prompt: "下列哪一種昆蟲的一生「不會」經歷「蛹」的階段（屬於不完全變態）？",
      options: ["A. 蝴蝶", "B. 蚊子", "C. 蜜蜂", "D. 蝗蟲（或蟑螂）"],
      answer: "D. 蝗蟲（或蟑螂）"
    },
    {
      id: "sci_l7_06", unitKey: "sci_l7", qCategory: "sci_mcq", type: "mcq", typeLabel: "選擇題",
      prompt: "青蛙的幼體（蝌蚪）與成蛙在身體結構上有明顯分別，蝌蚪在水中用甚麼呼吸？",
      options: ["A. 肺", "B. 鰓", "C. 氣管", "D. 翅膀"],
      answer: "B. 鰓"
    },
    {
      id: "sci_l7_07", unitKey: "sci_l7", qCategory: "sci_mcq", type: "mcq", typeLabel: "選擇題",
      prompt: "為甚麼魚類和海龜每次繁殖都要產下數百甚至數千顆卵？",
      options: ["A. 牠們會逐一孵蛋和哺乳", "B. 卵和幼體容易被天敵吃掉，多產卵可提高存活機會", "C. 牠們的卵比鳥蛋大很多", "D. 牠們屬於胎生動物"],
      answer: "B. 卵和幼體容易被天敵吃掉，多產卵可提高存活機會"
    },
    {
      id: "sci_l7_08", unitKey: "sci_l7", qCategory: "sci_mcq", type: "mcq", typeLabel: "選擇題",
      prompt: "下列哪一項人類特徵「不會」從父母遺傳給子女？",
      options: ["A. 雙眼皮或單眼皮", "B. 能否捲舌", "C. 耳垂分離或相連", "D. 跌倒留下的傷疤"],
      answer: "D. 跌倒留下的傷疤"
    },

    // 二、填充題 (#09 ~ #16)
    { id: "sci_l7_09", unitKey: "sci_l7", qCategory: "sci_fill", type: "fill_blank", typeLabel: "填充題", prompt: "胚胎在母體內發育成熟後直接產下幼體的繁殖方式，稱為 ________。", blanks: ["胎生"], distractors: ["卵生", "變態", "傳粉"] },
    { id: "sci_l7_10", unitKey: "sci_l7", qCategory: "sci_fill", type: "fill_blank", typeLabel: "填充題", prompt: "胎生動物（絕大部分哺乳類）產下幼代後，母體會分泌 ________ 哺育幼代。", blanks: ["乳汁"], distractors: ["花蜜", "蛋黃", "清水"] },
    { id: "sci_l7_11", unitKey: "sci_l7", qCategory: "sci_fill", type: "fill_blank", typeLabel: "填充題", prompt: "鳥蛋最外層堅硬的 ________ 可以保護內部結構；鈍端的 ________ 則儲存空氣供胚胎呼吸。", blanks: ["蛋殼", "氣室"], distractors: ["蛋白", "蛋黃", "羽毛"] },
    { id: "sci_l7_12", unitKey: "sci_l7", qCategory: "sci_fill", type: "fill_blank", typeLabel: "填充題", prompt: "蝴蝶的幼蟲（毛蟲）長大後會結成 ________，期間不吃不動，最後羽化成 ________。", blanks: ["蛹", "成蟲"], distractors: ["卵", "蝌蚪", "若蟲"] },
    { id: "sci_l7_13", unitKey: "sci_l7", qCategory: "sci_fill", type: "fill_blank", typeLabel: "填充題", prompt: "青蛙的卵在水中孵化成 ________，長出四肢且尾巴消失後，變成可在陸地生活的 ________。", blanks: ["蝌蚪", "成蛙"], distractors: ["幼蟲", "蛹", "小魚"] },
    { id: "sci_l7_14", unitKey: "sci_l7", qCategory: "sci_fill", type: "fill_blank", typeLabel: "填充題", prompt: "動物的幼代在成長過程中形態發生巨大改變的現象，稱為 ________。", blanks: ["變態"], distractors: ["遺傳", "冬眠", "遷徙"] },
    { id: "sci_l7_15", unitKey: "sci_l7", qCategory: "sci_fill", type: "fill_blank", typeLabel: "填充題", prompt: "胎生動物和部分鳥類會 ________ 和保護幼代，所以牠們每次產下的後代數量較少，但存活率較 ________。", blanks: ["撫育", "高"], distractors: ["放棄", "低", "不變"] },
    { id: "sci_l7_16", unitKey: "sci_l7", qCategory: "sci_fill", type: "fill_blank", typeLabel: "填充題", prompt: "子女的長相與父母相似是因為 ________；但即使是親生兄弟姊妹外貌也不完全相同，是因為存在 ________。", blanks: ["遺傳", "變異"], distractors: ["變態", "環境", "進化"] },

    // 三、分類題 (#17 ~ #20)
    {
      id: "sci_l7_17", unitKey: "sci_l7", qCategory: "sci_classify", type: "classify", typeLabel: "分類題",
      prompt: "【繁殖方式分類】請把以下動物放入「卵生動物」或「胎生動物」分類籃：",
      baskets: ["卵生動物", "胎生動物"],
      items: [
        { label: "雞、企鵝", basket: "卵生動物" },
        { label: "青蛙、海龜", basket: "卵生動物" },
        { label: "金魚、蝴蝶", basket: "卵生動物" },
        { label: "貓、狗", basket: "胎生動物" },
        { label: "鯨魚、海豚", basket: "胎生動物" }
      ],
      answer: "卵生：雞/企鵝/青蛙/海龜/金魚/蝴蝶 ｜ 胎生：貓/狗/鯨魚/海豚"
    },
    {
      id: "sci_l7_18", unitKey: "sci_l7", qCategory: "sci_classify", type: "classify", typeLabel: "分類題",
      prompt: "【昆蟲變態分類】請把以下昆蟲放入「完全變態（有蛹）」或「不完全變態（無蛹）」分類籃：",
      baskets: ["完全變態（有蛹）", "不完全變態（無蛹）"],
      items: [
        { label: "蝴蝶", basket: "完全變態（有蛹）" },
        { label: "蜜蜂", basket: "完全變態（有蛹）" },
        { label: "蚊子", basket: "完全變態（有蛹）" },
        { label: "蝗蟲", basket: "不完全變態（無蛹）" },
        { label: "蟑螂", basket: "不完全變態（無蛹）" }
      ],
      answer: "完全變態：蝴蝶、蜜蜂、蚊子 ｜ 不完全變態：蝗蟲、蟑螂"
    },
    {
      id: "sci_l7_19", unitKey: "sci_l7", qCategory: "sci_classify", type: "classify", typeLabel: "分類題",
      prompt: "【撫育方式分類】請把以下動物放入「會撫育幼代」或「不會撫育幼代」分類籃：",
      baskets: ["會撫育／保護幼代", "不會撫育幼代（產大量卵）"],
      items: [
        { label: "人類、貓、狗", basket: "會撫育／保護幼代" },
        { label: "麻雀、企鵝", basket: "會撫育／保護幼代" },
        { label: "海龜", basket: "不會撫育幼代（產大量卵）" },
        { label: "青蛙、大部分魚類", basket: "不會撫育幼代（產大量卵）" }
      ],
      answer: "會撫育：人/貓/狗/麻雀/企鵝 ｜ 不會撫育：海龜/青蛙/大部分魚類"
    },
    {
      id: "sci_l7_20", unitKey: "sci_l7", qCategory: "sci_classify", type: "classify", typeLabel: "分類題",
      prompt: "【遺傳特徵分類】請把以下特徵放入「可遺傳特徵」或「後天特徵（不會遺傳）」分類籃：",
      baskets: ["可遺傳特徵", "後天特徵（不遺傳）"],
      items: [
        { label: "眼皮單雙、酒窩", basket: "可遺傳特徵" },
        { label: "能否捲舌、耳垂形狀", basket: "可遺傳特徵" },
        { label: "染髮顏色、剪短髮", basket: "後天特徵（不遺傳）" },
        { label: "跌傷疤痕、游泳技能", basket: "後天特徵（不遺傳）" }
      ],
      answer: "可遺傳：眼皮/酒窩/捲舌/耳垂 ｜ 後天：染髮/短髮/疤痕/技能"
    },

    // 四、看圖填充題 (#21 ~ #24)
    {
      id: "sci_l7_21", unitKey: "sci_l7", qCategory: "sci_img_fill", type: "image_fill", typeLabel: "看圖填充題",
      svgKey: "sci_l7_egg_structure",
      prompt: "根據「鳥蛋內部結構圖」，提供主要養分的中央黃色部分（甲）是 ________；保護內部的最外層（乙）是 ________。",
      blanks: ["蛋黃", "蛋殼"], distractors: ["氣室", "蛋白", "羽毛"]
    },
    {
      id: "sci_l7_22", unitKey: "sci_l7", qCategory: "sci_img_fill", type: "image_fill", typeLabel: "看圖填充題",
      svgKey: "sci_l7_butterfly_cycle",
      prompt: "根據「蝴蝶生命週期圖」，卵孵化後變成（甲）________，長大後再變成不吃不動的（乙）________。",
      blanks: ["幼蟲", "蛹"], distractors: ["若蟲", "蝌蚪", "成蟲"]
    },
    {
      id: "sci_l7_23", unitKey: "sci_l7", qCategory: "sci_img_fill", type: "image_fill", typeLabel: "看圖填充題",
      svgKey: "sci_l7_frog_cycle",
      prompt: "根據「青蛙成長變化圖」，卵孵化後變成（甲）________，它在水中用（乙）________ 呼吸。",
      blanks: ["蝌蚪", "鰓"], distractors: ["幼蟲", "肺", "蛹"]
    },
    {
      id: "sci_l7_24", unitKey: "sci_l7", qCategory: "sci_img_fill", type: "image_fill", typeLabel: "看圖填充題",
      svgKey: "sci_l7_heredity_traits",
      prompt: "根據「人類特徵對照圖」，雙眼皮、捲舌等特徵會（甲）________ 給下一代；傷疤與髮型屬於（乙）________ 因素，不會遺傳。",
      blanks: ["遺傳", "後天"], distractors: ["變態", "先天", "競爭"]
    },

    // 五、簡答題（#25 ~ #28 — 轉為短詞填空與多選，無長句）
    {
      id: "sci_l7_25", unitKey: "sci_l7", qCategory: "sci_short", type: "multi_mcq", typeLabel: "簡答・多選題",
      prompt: "鳥類（例如母雞、企鵝）在繁殖期間通常會透過哪些行為照顧下一代？（可選多於一項）",
      options: ["A. 築巢和孵蛋，保持蛋的溫度", "B. 雛鳥孵出後餵飼食物和保護牠們", "C. 用母體的乳汁哺乳", "D. 產卵後立刻離開不再理會"],
      answers: ["A. 築巢和孵蛋，保持蛋的溫度", "B. 雛鳥孵出後餵飼食物和保護牠們"],
      answer: "A. 築巢孵蛋保溫、B. 餵飼食物與保護雛鳥"
    },
    {
      id: "sci_l7_26", unitKey: "sci_l7", qCategory: "sci_short", type: "fill_blank", typeLabel: "簡答・重點填空",
      prompt: "蝌蚪在水中用 ________ 呼吸並靠 ________ 游泳；長大成蛙後改用 ________ 和濕潤的皮膚呼吸。",
      blanks: ["鰓", "尾巴", "肺"], distractors: ["翅膀", "氣室", "鱗片"]
    },
    {
      id: "sci_l7_27", unitKey: "sci_l7", qCategory: "sci_short", type: "multi_mcq", typeLabel: "簡答・多選題",
      prompt: "胎生繁殖方式相比一般不撫育幼代的卵生動物，有甚麼優勢？（可選多於一項）",
      options: ["A. 胚胎在母體內較安全，不易被天敵吃掉", "B. 母體直接提供養分和乳汁，幼代存活率高", "C. 每次可以一次過產下數千個後代", "D. 幼代出生後完全不需要母體照顧"],
      answers: ["A. 胚胎在母體內較安全，不易被天敵吃掉", "B. 母體直接提供養分和乳汁，幼代存活率高"],
      answer: "A. 母體內發育較安全、B. 獲得養分與哺乳存活率高"
    },
    {
      id: "sci_l7_28", unitKey: "sci_l7", qCategory: "sci_short", type: "multi_mcq", typeLabel: "簡答・多選題",
      prompt: "動物界中，有哪些常見特徵會從親代遺傳給幼代？（可選多於一項）",
      options: ["A. 毛色與斑紋", "B. 體型與耳朵形狀", "C. 訓練後學會的雜技動作", "D. 意外受傷留下的疤痕"],
      answers: ["A. 毛色與斑紋", "B. 體型與耳朵形狀"],
      answer: "A. 毛色與斑紋、B. 體型與耳朵形狀"
    },

    // 六、問答題／情境題（#29 ~ #30 — 轉為分類籃與短詞填空，無長句）
    {
      id: "sci_l7_29", unitKey: "sci_l7", qCategory: "sci_scenario", type: "classify", typeLabel: "情境・分類籃",
      prompt: "【情境：海豚是魚嗎？】弟弟以為海豚住在海裏所以是卵生魚類。請把「海豚」與「金魚」的特徵放入對應分類籃：",
      baskets: ["海豚（胎生哺乳類）", "金魚（卵生魚類）"],
      items: [
        { label: "A. 胎生，直接產下幼豚", basket: "海豚（胎生哺乳類）" },
        { label: "B. 母體分泌乳汁哺育幼代", basket: "海豚（胎生哺乳類）" },
        { label: "C. 用肺呼吸，需浮上水面換氣", basket: "海豚（胎生哺乳類）" },
        { label: "D. 卵生，在水中產下大量魚卵", basket: "金魚（卵生魚類）" },
        { label: "E. 用鰓在水中呼吸", basket: "金魚（卵生魚類）" }
      ],
      answer: "海豚：A、B、C ｜ 金魚：D、E"
    },
    {
      id: "sci_l7_30", unitKey: "sci_l7", qCategory: "sci_scenario", type: "fill_blank", typeLabel: "情境・重點填空",
      prompt: "【情境：小貓的毛色】一對白色短毛貓生出三隻小貓，兩隻是白毛，一隻背部帶灰斑。白毛與父母相同屬於 ________ 現象；背部帶灰斑的差異則屬於 ________ 現象。",
      blanks: ["遺傳", "變異"], distractors: ["變態", "胎生", "競爭"]
    }
  ];

  Array.prototype.push.apply(window.Aetheria.QuestionBank.Science.QUESTIONS, MORE_SCI_QUESTIONS);
})();
