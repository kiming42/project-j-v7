/* ============================================================================
 * 英文科獨立題庫 (questions/questions-english.js)
 * 【日後新增/修改說明】：
 * 1. LESSONS 定義英文 Unit 清單（星象調頻會自動讀取）。
 * 2. VOCAB 只需填入：
 *    { unitKey: "eng_u1", word: "英文生字/片語", meaning: "中文解釋", sentence: "英文例句(用 _____ 代表空格)", options: ["選項A", "選項B", "選項C", "選項D"] }
 *    （註：若日後新增生字時不填寫 options，系統亦會自動從同 Unit 抽取 3 個生字組成四選一！）
 *    系統會自動為每個生字生成【字數空白位+字塊串字題 (如 __ ___ 2,3)】與【句子填充題】！
 * ============================================================================ */
window.Aetheria = window.Aetheria || {};
window.Aetheria.QuestionBank = window.Aetheria.QuestionBank || {};

window.Aetheria.QuestionBank.English = {
  // 1. 英文科單元清單
  LESSONS: [
    { key: "eng_u1", name: "English・Unit 1" },
    { key: "eng_u2", name: "English・Unit 2" },
    { key: "eng_u3", name: "English・Unit 3" }
  ],

  // 2. 英文生字與填充題庫 (共 46 個)
  VOCAB: [
    // --- Unit 1 (16個) ---
    { id: "ev_01", unitKey: "eng_u1", word: "arrive at school early", meaning: "提早返到學校", sentence: "Tom usually wakes up at 6 am, so he always _____.", options: ["dress untidily", "arrive at school early", "jump the queue", "push other passengers"] },
    { id: "ev_02", unitKey: "eng_u1", word: "arrive at school late", meaning: "遲到返學校", sentence: "If you miss the bus, you will _____.", options: ["rush to the seats", "offer your seat", "arrive at school late", "eat noisily"] },
    { id: "ev_03", unitKey: "eng_u1", word: "dress tidily", meaning: "穿著整齊", sentence: "The principal praised the students because they _____ for the ceremony.", options: ["dress tidily", "dress untidily", "rush to the seats", "wait patiently"] },
    { id: "ev_04", unitKey: "eng_u1", word: "dress untidily", meaning: "穿著不整齊", sentence: "His shirt is not tucked in. He tends to _____.", options: ["wait impatiently", "dress tidily", "dress untidily", "eat quietly"] },
    { id: "ev_05", unitKey: "eng_u1", word: "wait patiently", meaning: "耐心地等待", sentence: "Please _____ in the line until your number is called.", options: ["wait patiently", "dress tidily", "eat quietly", "jump the queue"] },
    { id: "ev_06", unitKey: "eng_u1", word: "wait impatiently", meaning: "不耐煩地等待", sentence: "The man started complaining because he had to _____ for the delayed flight.", options: ["wait impatiently", "jump the queue", "eat noisily", "wait patiently"] },
    { id: "ev_07", unitKey: "eng_u1", word: "eat quietly", meaning: "安靜地進食", sentence: "At a fancy restaurant, people usually chew with their mouths closed and _____.", options: ["speak rudely", "jump the queue", "eat quietly", "wait impatiently"] },
    { id: "ev_08", unitKey: "eng_u1", word: "eat noisily", meaning: "嘈吵地進食", sentence: "My little brother chews with his mouth open and tends to _____.", options: ["speak rudely", "eat noisily", "jump the queue", "dress untidily"] },
    { id: "ev_09", unitKey: "eng_u1", word: "speak politely", meaning: "有禮貌地說話", sentence: "Always remember to say 'please' and 'thank you' and _____ to your teachers.", options: ["speak politely", "jump the queue", "wait impatiently", "arrive at school late"] },
    { id: "ev_10", unitKey: "eng_u1", word: "speak rudely", meaning: "粗魯地說話", sentence: "It is bad manners to _____ to older people.", options: ["speak rudely", "offer your seat", "dress tidily", "arrive at school late"] },
    { id: "ev_11", unitKey: "eng_u1", word: "jump the queue", meaning: "打尖 / 插隊", sentence: "It is not fair to _____. You must wait at the back of the line.", options: ["jump the queue", "eat quietly", "rush to the seats", "speak politely"] },
    { id: "ev_12", unitKey: "eng_u1", word: "offer your seat", meaning: "讓座", sentence: "You should always _____ to the elderly on the MTR.", options: ["offer your seat", "wait impatiently", "arrive at school late", "dress untidily"] },
    { id: "ev_13", unitKey: "eng_u1", word: "push other passengers", meaning: "推撞其他乘客", sentence: "When the train is crowded, please do not _____.", options: ["push other passengers", "dress untidily", "rush to the seats", "talk on the phone loudly"] },
    { id: "ev_14", unitKey: "eng_u1", word: "rush to the seats", meaning: "衝去搶座位", sentence: "When the train doors open, some impolite people run and _____.", options: ["dress untidily", "talk on the phone softly", "rush to the seats", "push other passengers"] },
    { id: "ev_15", unitKey: "eng_u1", word: "talk on the phone softly", meaning: "細聲講電話", sentence: "If you need to make a call in the hospital, please _____.", options: ["talk on the phone softly", "talk on the phone loudly", "dress untidily", "wait patiently"] },
    { id: "ev_16", unitKey: "eng_u1", word: "talk on the phone loudly", meaning: "大聲講電話", sentence: "It is annoying when someone decides to _____ on a quiet bus.", options: ["speak politely", "talk on the phone loudly", "eat quietly", "rush to the seats"] },

    // --- Unit 2 (19個) ---
    { id: "ev_17", unitKey: "eng_u2", word: "be mean to", meaning: "對...刻薄/惡劣", sentence: "You shouldn't _____ your little sister. You should treat her kindly.", options: ["be mean to", "help with", "puzzled", "say sorry to"] },
    { id: "ev_18", unitKey: "eng_u2", word: "be nice to", meaning: "對...友善", sentence: "Parents teach their children to _____ everyone.", options: ["embarrassed", "be nice to", "share with", "disappointed"] },
    { id: "ev_19", unitKey: "eng_u2", word: "say sorry to", meaning: "向...道歉", sentence: "If you break someone's toy, you must _____ them.", options: ["share with", "take care of", "say sorry to", "help with"] },
    { id: "ev_20", unitKey: "eng_u2", word: "share with", meaning: "與...分享", sentence: "My friend brought some cookies and decided to _____ me.", options: ["discuss with", "share with", "get on with", "lie to"] },
    { id: "ev_21", unitKey: "eng_u2", word: "quarrel with", meaning: "與...吵架/爭論", sentence: "I don't want to _____ you over such a small matter.", options: ["disappointed", "take care of", "quarrel with", "say sorry to"] },
    { id: "ev_22", unitKey: "eng_u2", word: "discuss with", meaning: "與...討論", sentence: "I need to _____ my parents before making a decision.", options: ["disagree with", "disappointed", "discuss with", "get on with"] },
    { id: "ev_23", unitKey: "eng_u2", word: "agree with", meaning: "同意...", sentence: "I completely _____ your plan. It sounds perfect!", options: ["quarrel with", "agree with", "take care of", "annoyed"] },
    { id: "ev_24", unitKey: "eng_u2", word: "disagree with", meaning: "不同意...", sentence: "Even if you _____ him, you should still listen to his opinion.", options: ["disagree with", "help with", "be mean to", "annoyed"] },
    { id: "ev_25", unitKey: "eng_u2", word: "get on with", meaning: "與...融洽相處", sentence: "Does she _____ her new classmates well?", options: ["get on with", "quarrel with", "share with", "discuss with"] },
    { id: "ev_26", unitKey: "eng_u2", word: "help with", meaning: "幫...做(功課)", sentence: "Can you _____ my math homework?", options: ["get on with", "quarrel with", "help with", "disagree with"] },
    { id: "ev_27", unitKey: "eng_u2", word: "lie to", meaning: "對...講大話", sentence: "You should always tell the truth and never _____ your parents.", options: ["say sorry to", "help with", "lie to", "quarrel with"] },
    { id: "ev_28", unitKey: "eng_u2", word: "be jealous of", meaning: "妒忌...", sentence: "He seems to _____ his brother's success.", options: ["discuss with", "lie to", "be jealous of", "upset"] },
    { id: "ev_29", unitKey: "eng_u2", word: "take care of", meaning: "照顧...", sentence: "When my mom is sick, I will _____ her.", options: ["embarrassed", "annoyed", "take care of", "be mean to"] },
    { id: "ev_30", unitKey: "eng_u2", word: "shocked", meaning: "震驚的 (adj.)", sentence: "We were completely _____ by the sudden bad news.", options: ["quarrel with", "disappointed", "shocked", "get on with"] },
    { id: "ev_31", unitKey: "eng_u2", word: "puzzled", meaning: "困惑的 (adj.)", sentence: "He looked _____, as if he didn't understand the question at all.", options: ["quarrel with", "say sorry to", "puzzled", "disagree with"] },
    { id: "ev_32", unitKey: "eng_u2", word: "embarrassed", meaning: "尷尬的 (adj.)", sentence: "She felt _____ when she fell down in front of everyone.", options: ["embarrassed", "disagree with", "share with", "shocked"] },
    { id: "ev_33", unitKey: "eng_u2", word: "annoyed", meaning: "惱怒/煩躁的 (adj.)", sentence: "The teacher was _____ because the students kept talking.", options: ["be jealous of", "say sorry to", "annoyed", "disagree with"] },
    { id: "ev_34", unitKey: "eng_u2", word: "upset", meaning: "難過/心煩的 (adj.)", sentence: "Mary was very _____ when she lost her favorite watch.", options: ["upset", "annoyed", "discuss with", "take care of"] },
    { id: "ev_35", unitKey: "eng_u2", word: "disappointed", meaning: "失望的 (adj.)", sentence: "Dad was _____ that we didn't win the game.", options: ["say sorry to", "be jealous of", "disagree with", "disappointed"] },

    // --- Unit 3 (11個) ---
    { id: "ev_36", unitKey: "eng_u3", word: "a vest", meaning: "一件背心", sentence: "It's warm outside, so he is just wearing _____ and shorts.", options: ["mittens", "a suit", "a round face", "a vest"] },
    { id: "ev_37", unitKey: "eng_u3", word: "a suit", meaning: "一套西裝", sentence: "The businessman always wears _____ and a tie to work.", options: ["mittens", "glasses", "a suit", "a round face"] },
    { id: "ev_38", unitKey: "eng_u3", word: "sandals", meaning: "涼鞋", sentence: "We usually wear _____ when we go to the beach.", options: ["sandals", "glasses", "sunglasses", "gloves"] },
    { id: "ev_39", unitKey: "eng_u3", word: "gloves", meaning: "手套 (五指分開)", sentence: "In winter, you need to wear _____ to keep your fingers warm.", options: ["curly blonde hair", "sandals", "mittens", "gloves"] },
    { id: "ev_40", unitKey: "eng_u3", word: "mittens", meaning: "連指手套", sentence: "My grandmother knitted a pair of _____ for my baby sister.", options: ["mittens", "sandals", "a long face", "a round face"] },
    { id: "ev_41", unitKey: "eng_u3", word: "glasses", meaning: "眼鏡", sentence: "He cannot see the whiteboard clearly without his _____.", options: ["sunglasses", "a suit", "a long face", "glasses"] },
    { id: "ev_42", unitKey: "eng_u3", word: "sunglasses", meaning: "太陽眼鏡", sentence: "It is very sunny today, so I am wearing my _____.", options: ["a round face", "sunglasses", "a long face", "long straight hair"] },
    { id: "ev_43", unitKey: "eng_u3", word: "curly blonde hair", meaning: "捲曲的金髮", sentence: "The little girl from England has beautiful _____.", options: ["curly blonde hair", "mittens", "a suit", "a long face"] },
    { id: "ev_44", unitKey: "eng_u3", word: "long straight hair", meaning: "長直髮", sentence: "She went to the salon to get her _____ cut short.", options: ["long straight hair", "gloves", "sunglasses", "glasses"] },
    { id: "ev_45", unitKey: "eng_u3", word: "a round face", meaning: "圓臉", sentence: "The baby has chubby cheeks and _____.", options: ["sandals", "a round face", "gloves", "a suit"] },
    { id: "ev_46", unitKey: "eng_u3", word: "a long face", meaning: "長臉", sentence: "He has _____ with a sharp chin.", options: ["a long face", "a vest", "mittens", "a suit"] }
  ]
};
