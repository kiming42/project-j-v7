/* ============================================================================
 * 人文科獨立題庫 — 上半部 Part A (questions/questions-humanities.js - v7.0)
 * 教材：《今日人文》四年級上學期（共 120 題，100% 緊貼課本原字）
 * 內含：8幅專屬教科書級向量插畫 + 第1課《小小考察隊》(30題) + 第2課《漫遊香港》(30題)
 * 升級：全面淘汰長字選項 short_qa，將簡答題與情境題改為短字 multi_mcq / classify / fill_blank
 * ============================================================================ */
window.Aetheria = window.Aetheria || {};
window.Aetheria.QuestionBank = window.Aetheria.QuestionBank || {};

(function() {
  const HUM_DIAGRAMS = {
    // 1. 第1課 #21–23：尖沙咀格網街道圖（A–C × 1–3）
    hum_4a_l1_tst_map: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 165">
      <rect width="280" height="165" rx="10" fill="#fffde7"/>
      <rect x="6" y="4" width="268" height="18" rx="4" fill="#1565c0"/>
      <text x="140" y="16" font-size="11" font-weight="bold" fill="#ffffff" text-anchor="middle">尖沙咀街道圖（格網座標）</text>
      <text x="64" y="34" font-size="11" font-weight="bold" fill="#0d47a1" text-anchor="middle">A</text>
      <text x="148" y="34" font-size="11" font-weight="bold" fill="#0d47a1" text-anchor="middle">B</text>
      <text x="232" y="34" font-size="11" font-weight="bold" fill="#0d47a1" text-anchor="middle">C</text>
      <text x="14" y="61" font-size="11" font-weight="bold" fill="#0d47a1" text-anchor="middle">3</text>
      <text x="14" y="101" font-size="11" font-weight="bold" fill="#0d47a1" text-anchor="middle">2</text>
      <text x="14" y="141" font-size="11" font-weight="bold" fill="#0d47a1" text-anchor="middle">1</text>
      <rect x="24" y="38" width="250" height="120" fill="#ffffff" stroke="#546e7a" stroke-width="2"/>
      <line x1="107" y1="38" x2="107" y2="158" stroke="#90a4ae" stroke-width="1.5"/>
      <line x1="191" y1="38" x2="191" y2="158" stroke="#90a4ae" stroke-width="1.5"/>
      <line x1="24" y1="78" x2="274" y2="78" stroke="#90a4ae" stroke-width="1.5"/>
      <line x1="24" y1="118" x2="274" y2="118" stroke="#90a4ae" stroke-width="1.5"/>
      <!-- B2 九龍公園綠底 -->
      <rect x="108" y="79" width="82" height="38" fill="#c8e6c9" opacity="0.65"/>
      <!-- Row 3 -->
      <text x="65" y="54" font-size="9" font-weight="bold" fill="#37474f" text-anchor="middle">尖沙咀消防局</text>
      <rect x="44" y="59" width="18" height="13" rx="2" fill="#e3f2fd" stroke="#1e88e5"/><text x="53" y="69" font-size="8.5" font-weight="bold" fill="#0d47a1" text-anchor="middle">中</text>
      <rect x="66" y="59" width="18" height="13" rx="2" fill="#e8f5e9" stroke="#2e7d32"/><text x="75" y="69" font-size="8.5" font-weight="bold" fill="#1b5e20" text-anchor="middle">小</text>
      <text x="149" y="59" font-size="9" font-weight="bold" fill="#37474f" text-anchor="middle">香港童軍中心</text>
      <text x="232" y="50" font-size="8.5" font-weight="bold" fill="#b71c1c" text-anchor="middle">尖沙咀警署</text>
      <text x="232" y="61" font-size="8.5" fill="#455a64" text-anchor="middle">聖安德烈堂</text>
      <text x="232" y="73" font-size="8.5" font-weight="bold" fill="#6a1b9a" text-anchor="middle">古物古蹟辦事處</text>
      <!-- Row 2 -->
      <text x="65" y="94" font-size="9" font-weight="bold" fill="#37474f" text-anchor="middle">中港城</text>
      <rect x="55" y="99" width="20" height="13" rx="2" fill="#fff3e0" stroke="#ef6c00"/><text x="65" y="109" font-size="9" font-weight="bold" fill="#e65100" text-anchor="middle">H</text>
      <text x="149" y="93" font-size="9.5" font-weight="bold" fill="#1b5e20" text-anchor="middle">九龍公園</text>
      <text x="149" y="109" font-size="8.5" font-weight="bold" fill="#004d40" text-anchor="middle">香港文物探知館</text>
      <text x="232" y="90" font-size="8.5" fill="#37474f" text-anchor="middle">美麗華大廈・彌敦道</text>
      <text x="232" y="103" font-size="8.5" font-weight="bold" fill="#00695c" text-anchor="middle">九龍清真寺暨</text>
      <text x="232" y="113" font-size="8.5" font-weight="bold" fill="#00695c" text-anchor="middle">伊斯蘭中心</text>
      <!-- Row 1 -->
      <text x="65" y="134" font-size="9" font-weight="bold" fill="#37474f" text-anchor="middle">海港城</text>
      <rect x="55" y="139" width="20" height="13" rx="2" fill="#fff3e0" stroke="#ef6c00"/><text x="65" y="149" font-size="9" font-weight="bold" fill="#e65100" text-anchor="middle">H</text>
      <text x="149" y="133" font-size="8.5" fill="#455a64" text-anchor="middle">新港中心</text>
      <text x="149" y="148" font-size="8.5" font-weight="bold" fill="#bf360c" text-anchor="middle">海防道臨時街市</text>
      <circle cx="206" cy="132" r="7" fill="#c62828"/><text x="206" y="135" font-size="8" font-weight="bold" fill="#ffffff" text-anchor="middle">鐵</text>
      <text x="241" y="135" font-size="9" font-weight="bold" fill="#b71c1c" text-anchor="middle">尖沙咀站</text>
      <text x="232" y="150" font-size="8.5" fill="#37474f" text-anchor="middle">國際廣場</text>
    </svg>`,

    // 2. 第1課 #24：街道圖圖例符號卡
    hum_4a_l1_map_legend: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 150">
      <rect width="280" height="150" rx="12" fill="#e3f2fd"/>
      <rect x="14" y="10" width="252" height="22" rx="5" fill="#1565c0"/>
      <text x="140" y="25" font-size="11.5" font-weight="bold" fill="#ffffff" text-anchor="middle">尖沙咀街道圖・常用圖例符號</text>
      <!-- 左欄 -->
      <rect x="16" y="42" width="120" height="28" rx="6" fill="#ffffff" stroke="#90caf9" stroke-width="1.5"/>
      <circle cx="34" cy="56" r="9" fill="#e53935" stroke="#b71c1c" stroke-width="1.5"/><line x1="26" y1="56" x2="42" y2="56" stroke="#ffffff" stroke-width="3"/>
      <text x="86" y="60" font-size="11" font-weight="bold" fill="#263238" text-anchor="middle">＝ 警署</text>
      <rect x="16" y="76" width="120" height="28" rx="6" fill="#ffffff" stroke="#90caf9" stroke-width="1.5"/>
      <rect x="24" y="82" width="20" height="16" rx="3" fill="#c62828"/><text x="34" y="94" font-size="10" font-weight="bold" fill="#ffffff" text-anchor="middle">鐵</text>
      <text x="86" y="94" font-size="11" font-weight="bold" fill="#263238" text-anchor="middle">＝ 港鐵站</text>
      <rect x="16" y="110" width="120" height="28" rx="6" fill="#ffffff" stroke="#90caf9" stroke-width="1.5"/>
      <polygon points="34,115 24,122 44,122" fill="#6a1b9a"/><rect x="26" y="122" width="16" height="10" fill="#ba68c8"/>
      <text x="86" y="128" font-size="11" font-weight="bold" fill="#263238" text-anchor="middle">＝ 博物館</text>
      <!-- 右欄（測驗符號） -->
      <rect x="144" y="42" width="120" height="44" rx="6" fill="#fff8e1" stroke="#fb8c00" stroke-width="2"/>
      <rect x="154" y="52" width="26" height="24" rx="4" fill="#ffe0b2" stroke="#e65100" stroke-width="2"/>
      <text x="167" y="69" font-size="14" font-weight="bold" fill="#e65100" text-anchor="middle">H</text>
      <text x="220" y="68" font-size="12" font-weight="bold" fill="#bf360c" text-anchor="middle">＝ ？</text>
      <rect x="144" y="94" width="120" height="44" rx="6" fill="#e8f5e9" stroke="#2e7d32" stroke-width="2"/>
      <path d="M154,104 L167,108 L180,104 L180,126 L167,130 L154,126 Z" fill="#ffffff" stroke="#2e7d32" stroke-width="2"/>
      <text x="167" y="122" font-size="11" font-weight="bold" fill="#1b5e20" text-anchor="middle">小</text>
      <text x="220" y="120" font-size="12" font-weight="bold" fill="#1b5e20" text-anchor="middle">＝ ？</text>
    </svg>`,

    // 3. 第2課 #21：香港地勢圖圖例
    hum_4a_l2_relief_legend: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 155">
      <rect width="280" height="155" rx="12" fill="#f1f8e9"/>
      <rect x="14" y="10" width="252" height="22" rx="5" fill="#2e7d32"/>
      <text x="140" y="25" font-size="11.5" font-weight="bold" fill="#ffffff" text-anchor="middle">香港地勢圖圖例（海拔高度分層設色）</text>
      <rect x="26" y="42" width="42" height="16" rx="3" fill="#e53935" stroke="#b71c1c"/>
      <text x="80" y="54" font-size="11" font-weight="bold" fill="#37474f">600米或以上（高山）</text>
      <rect x="26" y="63" width="42" height="16" rx="3" fill="#fb8c00" stroke="#e65100"/>
      <text x="80" y="75" font-size="11" font-weight="bold" fill="#37474f">300–600米（山地）</text>
      <rect x="26" y="84" width="42" height="16" rx="3" fill="#fdd835" stroke="#f57f17"/>
      <text x="80" y="96" font-size="11" font-weight="bold" fill="#37474f">100–300米（丘陵）</text>
      <rect x="26" y="105" width="42" height="16" rx="3" fill="#66bb6a" stroke="#1b5e20" stroke-width="2"/>
      <text x="80" y="117" font-size="11" font-weight="bold" fill="#1b5e20">0–100米（平地）</text>
      <polygon points="47,128 38,144 56,144" fill="#212121"/>
      <text x="80" y="140" font-size="11" font-weight="bold" fill="#212121">主要山峯（500米或以上）</text>
    </svg>`,

    // 4. 第2課 #22–24：啟德機場騰出土地用途規劃圖
    hum_4a_l2_kaitak_plan: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 155">
      <rect width="280" height="155" rx="12" fill="#e8eaf6"/>
      <rect x="14" y="10" width="252" height="22" rx="5" fill="#283593"/>
      <text x="140" y="25" font-size="11.5" font-weight="bold" fill="#ffffff" text-anchor="middle">啟德機場騰出土地的三大用途</text>
      <!-- Row 1 -->
      <rect x="18" y="42" width="112" height="28" rx="6" fill="#ffffff" stroke="#3949ab" stroke-width="2"/>
      <text x="74" y="60" font-size="10.5" font-weight="bold" fill="#1a237e" text-anchor="middle">公共和私人房屋</text>
      <path d="M134,56 L154,56 M148,51 L154,56 L148,61" fill="none" stroke="#3949ab" stroke-width="2.5"/>
      <rect x="158" y="42" width="104" height="28" rx="6" fill="#fff9c4" stroke="#f9a825" stroke-width="2"/>
      <text x="210" y="60" font-size="11" font-weight="bold" fill="#e65100" text-anchor="middle">滿足 ？</text>
      <!-- Row 2 -->
      <rect x="18" y="80" width="112" height="28" rx="6" fill="#fff9c4" stroke="#f9a825" stroke-width="2"/>
      <text x="74" y="98" font-size="11" font-weight="bold" fill="#e65100" text-anchor="middle">興建 ？</text>
      <path d="M134,94 L154,94 M148,89 L154,94 L148,99" fill="none" stroke="#3949ab" stroke-width="2.5"/>
      <rect x="158" y="80" width="104" height="28" rx="6" fill="#ffffff" stroke="#00897b" stroke-width="2"/>
      <text x="210" y="98" font-size="11" font-weight="bold" fill="#004d40" text-anchor="middle">吸引旅客</text>
      <!-- Row 3 -->
      <rect x="18" y="118" width="112" height="28" rx="6" fill="#ffffff" stroke="#c62828" stroke-width="2"/>
      <text x="74" y="136" font-size="11" font-weight="bold" fill="#b71c1c" text-anchor="middle">體育園</text>
      <path d="M134,132 L154,132 M148,127 L154,132 L148,137" fill="none" stroke="#3949ab" stroke-width="2.5"/>
      <rect x="158" y="118" width="104" height="28" rx="6" fill="#fff9c4" stroke="#f9a825" stroke-width="2"/>
      <text x="210" y="136" font-size="11" font-weight="bold" fill="#e65100" text-anchor="middle">有助 ？</text>
    </svg>`,

    // 5. 第3課 #21–22：紅色暴雨警告與山泥傾瀉警告卡
    hum_4a_l3_warn_rain: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 155">
      <rect width="280" height="155" rx="12" fill="#ffebee"/>
      <!-- 左卡：紅雨 -->
      <rect x="10" y="12" width="126" height="132" rx="8" fill="#ffffff" stroke="#c62828" stroke-width="2"/>
      <rect x="40" y="20" width="66" height="36" rx="6" fill="#d32f2f"/>
      <path d="M56,36 C56,28 68,26 72,30 C78,26 90,30 88,38 Z" fill="#ffffff"/>
      <path d="M62,42 L59,50 M72,42 L69,50 M82,42 L79,50" stroke="#ffcdd2" stroke-width="2.2" stroke-linecap="round"/>
      <text x="73" y="70" font-size="10.5" font-weight="bold" fill="#b71c1c" text-anchor="middle">紅色暴雨警告信號</text>
      <text x="73" y="88" font-size="9.5" fill="#455a64" text-anchor="middle">廣泛地區有大雨</text>
      <rect x="20" y="96" width="106" height="20" rx="4" fill="#fff8e1" stroke="#fb8c00"/>
      <text x="73" y="110" font-size="10" font-weight="bold" fill="#e65100" text-anchor="middle">措施：遠離 ？</text>
      <text x="73" y="134" font-size="9.5" font-weight="bold" fill="#c62828" text-anchor="middle">後果：被水流捲走</text>
      <!-- 右卡：山泥傾瀉 -->
      <rect x="144" y="12" width="126" height="132" rx="8" fill="#ffffff" stroke="#6d4c41" stroke-width="2"/>
      <rect x="174" y="20" width="66" height="36" rx="6" fill="#ffe0b2" stroke="#6d4c41" stroke-width="1.5"/>
      <polygon points="180,52 180,26 218,52" fill="#8d6e63"/>
      <circle cx="218" cy="36" r="4" fill="#5d4037"/><circle cx="228" cy="46" r="5" fill="#5d4037"/>
      <text x="207" y="70" font-size="10.5" font-weight="bold" fill="#4e342e" text-anchor="middle">山泥傾瀉警告</text>
      <text x="207" y="88" font-size="9.5" fill="#455a64" text-anchor="middle">持續大雨致山泥傾瀉</text>
      <rect x="154" y="96" width="106" height="20" rx="4" fill="#fff8e1" stroke="#fb8c00"/>
      <text x="207" y="110" font-size="10" font-weight="bold" fill="#e65100" text-anchor="middle">措施：遠離 ？</text>
      <text x="207" y="134" font-size="9.5" font-weight="bold" fill="#c62828" text-anchor="middle">後果：被山泥弄傷</text>
    </svg>`,

    // 6. 第3課 #23–24：酷熱天氣警告與雷暴警告卡
    hum_4a_l3_warn_hot: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 155">
      <rect width="280" height="155" rx="12" fill="#fff3e0"/>
      <!-- 左卡：酷熱 -->
      <rect x="10" y="12" width="126" height="132" rx="8" fill="#ffffff" stroke="#ef6c00" stroke-width="2"/>
      <rect x="40" y="20" width="66" height="36" rx="6" fill="#ff7043"/>
      <text x="73" y="42" font-size="15" font-weight="bold" fill="#ffffff" text-anchor="middle">熱 HOT</text>
      <text x="73" y="70" font-size="10.5" font-weight="bold" fill="#e65100" text-anchor="middle">酷熱天氣警告</text>
      <text x="73" y="88" font-size="9.5" fill="#455a64" text-anchor="middle">措施：多喝水消暑</text>
      <rect x="20" y="98" width="106" height="22" rx="4" fill="#ffebee" stroke="#e53935"/>
      <text x="73" y="113" font-size="10" font-weight="bold" fill="#b71c1c" text-anchor="middle">後果：？ 甚至中暑</text>
      <!-- 右卡：雷暴 -->
      <rect x="144" y="12" width="126" height="132" rx="8" fill="#ffffff" stroke="#1565c0" stroke-width="2"/>
      <rect x="174" y="20" width="66" height="36" rx="6" fill="#1976d2"/>
      <polygon points="210,24 198,40 207,40 201,53 218,36 208,36" fill="#ffd54f"/>
      <text x="207" y="70" font-size="10.5" font-weight="bold" fill="#0d47a1" text-anchor="middle">雷暴警告</text>
      <text x="207" y="88" font-size="9.5" fill="#455a64" text-anchor="middle">措施：停止水上活動</text>
      <rect x="154" y="98" width="106" height="22" rx="4" fill="#ffebee" stroke="#e53935"/>
      <text x="207" y="113" font-size="10" font-weight="bold" fill="#b71c1c" text-anchor="middle">後果：？</text>
    </svg>`,

    // 7. 第5課 #21：2022年國家水資源區域年降雨量圖表
    hum_4a_l5_rainfall: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 155">
      <rect width="280" height="155" rx="12" fill="#e1f5fe"/>
      <rect x="12" y="8" width="256" height="22" rx="5" fill="#0277bd"/>
      <text x="140" y="23" font-size="11" font-weight="bold" fill="#ffffff" text-anchor="middle">2022年國家水資源區域年降雨量（毫米）</text>
      <text x="48" y="50" font-size="10.5" font-weight="bold" fill="#01579b" text-anchor="end">珠江(南)</text>
      <rect x="54" y="38" width="173" height="16" rx="3" fill="#0288d1"/><text x="232" y="50" font-size="10" font-weight="bold" fill="#01579b">1729</text>
      <text x="48" y="72" font-size="10.5" font-weight="bold" fill="#01579b" text-anchor="end">長江(南)</text>
      <rect x="54" y="60" width="97" height="16" rx="3" fill="#29b6f6"/><text x="156" y="72" font-size="10" font-weight="bold" fill="#01579b">970</text>
      <text x="48" y="94" font-size="10.5" font-weight="bold" fill="#37474f" text-anchor="end">淮河</text>
      <rect x="54" y="82" width="78" height="16" rx="3" fill="#4fc3f7"/><text x="137" y="94" font-size="10" font-weight="bold" fill="#37474f">783</text>
      <text x="48" y="116" font-size="10.5" font-weight="bold" fill="#bf360c" text-anchor="end">海河(北)</text>
      <rect x="54" y="104" width="55" height="16" rx="3" fill="#ffb74d"/><text x="114" y="116" font-size="10" font-weight="bold" fill="#bf360c">554</text>
      <text x="48" y="138" font-size="10.5" font-weight="bold" fill="#bf360c" text-anchor="end">黃河(北)</text>
      <rect x="54" y="126" width="47" height="16" rx="3" fill="#ff8a65"/><text x="106" y="138" font-size="10" font-weight="bold" fill="#bf360c">466</text>
    </svg>`,

    // 8. 第5課 #22–24：香港天文台極端天氣趨勢圖
    hum_4a_l5_extreme_weather: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 160">
      <rect width="280" height="160" rx="12" fill="#fff8e1"/>
      <rect x="10" y="8" width="260" height="20" rx="5" fill="#d84315"/>
      <text x="140" y="22" font-size="10.5" font-weight="bold" fill="#ffffff" text-anchor="middle">香港極端天氣趨勢（香港天文台資料）</text>
      <!-- 上半：最高一小時雨量 -->
      <rect x="12" y="34" width="256" height="48" rx="6" fill="#ffffff" stroke="#ffb74d" stroke-width="1.5"/>
      <text x="140" y="48" font-size="10" font-weight="bold" fill="#01579b" text-anchor="middle">(A) 最高一小時雨量紀錄上升趨勢</text>
      <rect x="20" y="54" width="68" height="22" rx="4" fill="#e1f5fe"/><text x="54" y="68" font-size="9.5" font-weight="bold" fill="#0277bd" text-anchor="middle">1886: 88mm</text>
      <text x="97" y="68" font-size="11" font-weight="bold" fill="#e65100" text-anchor="middle">➔</text>
      <rect x="106" y="54" width="70" height="22" rx="4" fill="#b3e5fc"/><text x="141" y="68" font-size="9.5" font-weight="bold" fill="#01579b" text-anchor="middle">2008: 146mm</text>
      <text x="185" y="68" font-size="11" font-weight="bold" fill="#e65100" text-anchor="middle">➔</text>
      <rect x="194" y="54" width="68" height="22" rx="4" fill="#ffcdd2" stroke="#c62828"/><text x="228" y="68" font-size="9.5" font-weight="bold" fill="#b71c1c" text-anchor="middle">2023: 158mm</text>
      <!-- 下半：酷熱與寒冷日數 -->
      <rect x="12" y="88" width="256" height="64" rx="6" fill="#ffffff" stroke="#ffb74d" stroke-width="1.5"/>
      <text x="140" y="102" font-size="10" font-weight="bold" fill="#bf360c" text-anchor="middle">(B) 每年平均酷熱日(≥33°C) 與 寒冷日(≤12°C)</text>
      <text x="20" y="120" font-size="9.5" font-weight="bold" fill="#455a64">1884–1913年：</text>
      <text x="105" y="120" font-size="9.5" font-weight="bold" fill="#e65100">酷熱 約2日</text>
      <text x="178" y="120" font-size="9.5" font-weight="bold" fill="#1565c0">寒冷 約29日</text>
      <text x="20" y="140" font-size="9.5" font-weight="bold" fill="#455a64">1994–2023年：</text>
      <text x="105" y="140" font-size="9.5" font-weight="bold" fill="#c62828">酷熱 約21日▲</text>
      <text x="178" y="140" font-size="9.5" font-weight="bold" fill="#0277bd">寒冷 約15日▼</text>
    </svg>`
  };

  window.Aetheria.QuestionBank.Humanities = {
    DIAGRAMS: HUM_DIAGRAMS,

    LESSONS: [
      { key: "hum_4a_l1", name: "人文4上・第1課 小小考察隊 (30題)" },
      { key: "hum_4a_l2", name: "人文4上・第2課 漫遊香港 (30題)" },
      { key: "hum_4a_l3", name: "人文4上・第3課 香港的氣候 (30題)" },
      { key: "hum_4a_l5", name: "人文4上・第5課 地球生病了 (30題)" }
    ],

    QUESTIONS: [
      // ==================== 第 1 課：《小小考察隊》（30題） ====================
      // 一、選擇題 (#01 ~ #08)
      {
        id: "hum_4a_l1_01", unitKey: "hum_4a_l1", qCategory: "hum_mcq", type: "mcq", typeLabel: "選擇題",
        prompt: "從世界地圖和亞洲地圖中，我們知道中國位於哪一個大洲？",
        options: ["A. 歐洲", "B. 非洲", "C. 亞洲", "D. 大洋洲"],
        answer: "C. 亞洲"
      },
      {
        id: "hum_4a_l1_02", unitKey: "hum_4a_l1", qCategory: "hum_mcq", type: "mcq", typeLabel: "選擇題",
        prompt: "香港位於中國的哪一個方位？",
        options: ["A. 東北端", "B. 東南端", "C. 西北端", "D. 西南端"],
        answer: "B. 東南端"
      },
      {
        id: "hum_4a_l1_03", unitKey: "hum_4a_l1", qCategory: "hum_mcq", type: "mcq", typeLabel: "選擇題",
        prompt: "下列哪一類地圖主要提供「大洲和大洋」的資料，並顯示香港的面積很小？",
        options: ["A. 世界地圖", "B. 亞洲地圖", "C. 香港全境圖", "D. 香港街道圖"],
        answer: "A. 世界地圖"
      },
      {
        id: "hum_4a_l1_04", unitKey: "hum_4a_l1", qCategory: "hum_mcq", type: "mcq", typeLabel: "選擇題",
        prompt: "如果我們想查看「彌敦道」、「廣東道」和「美麗華大廈」的位置，應該查閱哪一類地圖？",
        options: ["A. 世界地圖", "B. 亞洲地圖", "C. 香港全境圖", "D. 香港街道圖"],
        answer: "D. 香港街道圖"
      },
      {
        id: "hum_4a_l1_05", unitKey: "hum_4a_l1", qCategory: "hum_mcq", type: "mcq", typeLabel: "選擇題",
        prompt: "地圖上的「比例尺」有甚麼用途？",
        options: ["A. 描述地圖的內容", "B. 指示地圖的方向", "C. 說明景物的實際大小和距離", "D. 解讀符號所代表的事物"],
        answer: "C. 說明景物的實際大小和距離"
      },
      {
        id: "hum_4a_l1_06", unitKey: "hum_4a_l1", qCategory: "hum_mcq", type: "mcq", typeLabel: "選擇題",
        prompt: "下列哪一項工具可以幫助我們解讀地圖上不同符號所代表的事物？",
        options: ["A. 圖例", "B. 標題", "C. 比例尺", "D. 方向標"],
        answer: "A. 圖例"
      },
      {
        id: "hum_4a_l1_07", unitKey: "hum_4a_l1", qCategory: "hum_mcq", type: "mcq", typeLabel: "選擇題",
        prompt: "在電子地圖輸入「所在的位置」時，下列哪一項不是課本提及的方法？",
        options: ["A. 直接輸入地點", "B. 使用自動定位功能", "C. 在地圖上點出所在位置", "D. 致電目的地職員查詢"],
        answer: "D. 致電目的地職員查詢"
      },
      {
        id: "hum_4a_l1_08", unitKey: "hum_4a_l1", qCategory: "hum_mcq", type: "mcq", typeLabel: "選擇題",
        prompt: "在電子地圖中按「路線」後，除了詳細看到路徑的方向外，還可以看到甚麼來確定行走方向是否正確？",
        options: ["A. 沿途的街景", "B. 地圖的比例尺", "C. 格網座標", "D. 建築物高度"],
        answer: "A. 沿途的街景"
      },

      // 二、填充題 (#09 ~ #16)
      { id: "hum_4a_l1_09", unitKey: "hum_4a_l1", qCategory: "hum_fill", type: "fill_blank", typeLabel: "填充題", prompt: "從香港全境圖，我們看到香港的三個主要區域，分別是香港島、________ 和新界。", blanks: ["九龍"], distractors: ["大嶼山", "尖沙咀", "沙田"] },
      { id: "hum_4a_l1_10", unitKey: "hum_4a_l1", qCategory: "hum_fill", type: "fill_blank", typeLabel: "填充題", prompt: "地圖有三個共同要素，包括描述地圖內容的 ________、指示方向的方向標，以及說明實際大小和距離的比例尺。", blanks: ["標題"], distractors: ["圖例", "座標", "街景"] },
      { id: "hum_4a_l1_11", unitKey: "hum_4a_l1", qCategory: "hum_fill", type: "fill_blank", typeLabel: "填充題", prompt: "在地圖上，不同的 ________ 代表不同的事物，閱讀圖例便能解讀它們。", blanks: ["符號"], distractors: ["標題", "比例尺", "方向標"] },
      { id: "hum_4a_l1_12", unitKey: "hum_4a_l1", qCategory: "hum_fill", type: "fill_blank", typeLabel: "填充題", prompt: "地圖上的 ________，有助我們找出景物在地圖上的位置。", blanks: ["格網座標"], distractors: ["比例尺", "街景", "標題"] },
      { id: "hum_4a_l1_13", unitKey: "hum_4a_l1", qCategory: "hum_fill", type: "fill_blank", typeLabel: "填充題", prompt: "繪畫簡單地圖展示考察路線時，第一步要參考公園地圖，繪畫簡單地圖，並標示 ________ 和終點。", blanks: ["起點"], distractors: ["比例尺", "山峯", "電話"] },
      { id: "hum_4a_l1_14", unitKey: "hum_4a_l1", qCategory: "hum_fill", type: "fill_blank", typeLabel: "填充題", prompt: "繪畫考察路線圖時，設計簡單符號代表地點和景物後，要加上標題、________ 和方向標，最後繪畫路線。", blanks: ["圖例"], distractors: ["街景", "大洋", "營業時間"] },
      { id: "hum_4a_l1_15", unitKey: "hum_4a_l1", qCategory: "hum_fill", type: "fill_blank", typeLabel: "填充題", prompt: "電子地圖有很多功能，例如可以快捷地搜尋 ________ 的位置和規劃路線，為生活帶來方便。", blanks: ["目的地"], distractors: ["大洲", "比例尺", "方向標"] },
      { id: "hum_4a_l1_16", unitKey: "hum_4a_l1", qCategory: "hum_fill", type: "fill_blank", typeLabel: "填充題", prompt: "電子地圖除了顯示步行路線和所需時間外，還提供乘搭 ________ 和駕車路線的資訊。", blanks: ["公共交通工具"], distractors: ["熱氣球", "太空船", "貨船"] },

      // 三、分類題 (#17 ~ #20)
      {
        id: "hum_4a_l1_17", unitKey: "hum_4a_l1", qCategory: "hum_classify", type: "mcq", typeLabel: "分類配對題",
        prompt: "【地圖分類】顯示太平洋、印度洋、北冰洋和大西洋的分佈，應配對哪類地圖？",
        options: ["A. 世界地圖", "B. 亞洲地圖", "C. 香港全境圖", "D. 香港街道圖"],
        answer: "A. 世界地圖"
      },
      {
        id: "hum_4a_l1_18", unitKey: "hum_4a_l1", qCategory: "hum_classify", type: "mcq", typeLabel: "分類配對題",
        prompt: "【地圖分類】顯示香港島、九龍和新界三個主要區域，應配對哪類地圖？",
        options: ["A. 世界地圖", "B. 亞洲地圖", "C. 香港全境圖", "D. 香港街道圖"],
        answer: "C. 香港全境圖"
      },
      {
        id: "hum_4a_l1_19", unitKey: "hum_4a_l1", qCategory: "hum_classify", type: "mcq", typeLabel: "分類配對題",
        prompt: "【地圖分類】顯示中國位於亞洲，以及香港位於中國的東南端，應配對哪類地圖？",
        options: ["A. 世界地圖", "B. 亞洲地圖", "C. 香港全境圖", "D. 香港街道圖"],
        answer: "B. 亞洲地圖"
      },
      {
        id: "hum_4a_l1_20", unitKey: "hum_4a_l1", qCategory: "hum_classify", type: "mcq", typeLabel: "分類配對題",
        prompt: "【地圖分類】顯示尖沙咀區的海防道、北京道、九龍公園及國際廣場，應配對哪類地圖？",
        options: ["A. 世界地圖", "B. 亞洲地圖", "C. 香港全境圖", "D. 香港街道圖"],
        answer: "D. 香港街道圖"
      },

      // 四、看圖填充題 (#21 ~ #24)
      {
        id: "hum_4a_l1_21", unitKey: "hum_4a_l1", qCategory: "hum_img_fill", type: "image_fill", typeLabel: "看圖填充題",
        svgKey: "hum_4a_l1_tst_map",
        prompt: "根據「尖沙咀街道圖」，古物古蹟辦事處的格網座標是 ________。",
        blanks: ["C3"], distractors: ["A3", "B3", "C2"]
      },
      {
        id: "hum_4a_l1_22", unitKey: "hum_4a_l1", qCategory: "hum_img_fill", type: "image_fill", typeLabel: "看圖填充題",
        svgKey: "hum_4a_l1_tst_map",
        prompt: "根據「尖沙咀街道圖」，香港文物探知館的格網座標是 ________。",
        blanks: ["B2"], distractors: ["A2", "B1", "C2"]
      },
      {
        id: "hum_4a_l1_23", unitKey: "hum_4a_l1", qCategory: "hum_img_fill", type: "image_fill", typeLabel: "看圖填充題",
        svgKey: "hum_4a_l1_tst_map",
        prompt: "根據「尖沙咀街道圖」，九龍清真寺暨伊斯蘭中心的座標是 ________，而海防道臨時街市的座標是 ________。",
        blanks: ["C2", "B1"], distractors: ["A1", "C1", "B3"]
      },
      {
        id: "hum_4a_l1_24", unitKey: "hum_4a_l1", qCategory: "hum_img_fill", type: "image_fill", typeLabel: "看圖填充題",
        svgKey: "hum_4a_l1_map_legend",
        prompt: "根據圖例符號卡，符號「H」代表 ________，而書本內寫有「小」字的符號代表 ________。",
        blanks: ["酒店", "小學"], distractors: ["醫院", "中學", "公園"]
      },

      // 五、簡答題（#25 ~ #27 — 轉為短詞 multi_mcq，無長句）
      {
        id: "hum_4a_l1_25", unitKey: "hum_4a_l1", qCategory: "hum_short", type: "multi_mcq", typeLabel: "簡答・多選題",
        prompt: "世界地圖上顯示了哪些「大洲」？（可選多於一項）",
        options: ["A. 亞洲", "B. 歐洲", "C. 非洲", "D. 太平洋"],
        answers: ["A. 亞洲", "B. 歐洲", "C. 非洲"],
        answer: "A. 亞洲、B. 歐洲、C. 非洲",
        explanation: "【課本重點】世界七大洲包括：亞洲、歐洲、非洲、北美洲、南美洲、大洋洲、南極洲；太平洋是大洋。"
      },
      {
        id: "hum_4a_l1_26", unitKey: "hum_4a_l1", qCategory: "hum_short", type: "multi_mcq", typeLabel: "簡答・多選題",
        prompt: "繪畫「九龍公園考察路線圖」時，圖例中出現了哪些公園內的景物？（可選多於一項）",
        options: ["A. 樹木研習徑", "B. 香港文物探知館", "C. 百鳥苑", "D. 郵輪碼頭"],
        answers: ["A. 樹木研習徑", "B. 香港文物探知館", "C. 百鳥苑"],
        answer: "A. 樹木研習徑、B. 香港文物探知館、C. 百鳥苑",
        explanation: "【課本重點】九龍公園圖例景物包括：樹木研習徑、香港文物探知館、鳥湖、百鳥苑、中國花園、荷花池、迷宮。"
      },
      {
        id: "hum_4a_l1_27", unitKey: "hum_4a_l1", qCategory: "hum_short", type: "multi_mcq", typeLabel: "簡答・多選題",
        prompt: "除了路線規劃外，電子地圖還提供目的地的哪些資訊？（可選多於一項）",
        options: ["A. 營業時間", "B. 聯絡電話", "C. 官方網站", "D. 降雨量紀錄"],
        answers: ["A. 營業時間", "B. 聯絡電話", "C. 官方網站"],
        answer: "A. 營業時間、B. 聯絡電話、C. 官方網站",
        explanation: "【課本重點】電子地圖亦會提供目的地的營業時間、聯絡電話及官方網站。"
      },

      // 六、問答／情境題（#28 ~ #30 — 轉為短詞步驟填空 fill_blank 與分類籃 classify）
      {
        id: "hum_4a_l1_28", unitKey: "hum_4a_l1", qCategory: "hum_scenario", type: "fill_blank", typeLabel: "情境・步驟填空",
        prompt: "【情境：考察路線設計】繪畫「九龍公園考察路線圖」四步驟：① 參考地圖畫簡圖，標示 ________ 和終點 ➔ ② 設計簡單 ________ ➔ ③ 加上標題、________ 和方向標 ➔ ④ 最後繪畫 ________。",
        blanks: ["起點", "符號", "圖例", "考察路線"],
        distractors: ["比例尺", "街景"]
      },
      {
        id: "hum_4a_l1_29", unitKey: "hum_4a_l1", qCategory: "hum_scenario", type: "fill_blank", typeLabel: "情境・步驟填空",
        prompt: "【情境：電子地圖引路】身處九龍公園步行去香港藝術館：① 先搜尋「________」並按搜尋路線 ➔ ② 輸入所在位置「________」 ➔ ③ 按「路線」查看路徑方向及沿途 ________ 以確定方向正確。",
        blanks: ["香港藝術館", "九龍公園", "街景"],
        distractors: ["格網座標", "比例尺"]
      },
      {
        id: "hum_4a_l1_30", unitKey: "hum_4a_l1", qCategory: "hum_scenario", type: "classify", typeLabel: "情境・分類籃",
        prompt: "【情境：地圖要素應用】小芬畫街道圖忘記加「方向標」和「比例尺」，請把對應的用途與困難放入分類籃：",
        baskets: ["缺少方向標", "缺少比例尺"],
        items: [
          { label: "A. 無法分辨方向", basket: "缺少方向標" },
          { label: "B. 欠缺指示方向的工具", basket: "缺少方向標" },
          { label: "C. 不知景物實際大小", basket: "缺少比例尺" },
          { label: "D. 不知景物實際距離", basket: "缺少比例尺" }
        ],
        answer: "缺少方向標：A、B ｜ 缺少比例尺：C、D"
      },

      // ==================== 第 2 課：《漫遊香港》（30題） ====================
      // 一、選擇題 (#01 ~ #08)
      {
        id: "hum_4a_l2_01", unitKey: "hum_4a_l2", qCategory: "hum_mcq", type: "mcq", typeLabel: "選擇題",
        prompt: "香港的地勢有甚麼特徵？",
        options: ["A. 平地多而山地少", "B. 山地多而平地少", "C. 全部都是平地", "D. 全部是600米以上高山"],
        answer: "B. 山地多而平地少"
      },
      {
        id: "hum_4a_l2_02", unitKey: "hum_4a_l2", qCategory: "hum_mcq", type: "mcq", typeLabel: "選擇題",
        prompt: "香港 100 米以下的平地分佈情況是怎樣的？",
        options: ["A. 非常集中", "B. 比較分散", "C. 只分佈在離島", "D. 只分佈在香港島"],
        answer: "B. 比較分散"
      },
      {
        id: "hum_4a_l2_03", unitKey: "hum_4a_l2", qCategory: "hum_mcq", type: "mcq", typeLabel: "選擇題",
        prompt: "香港較大片的平地大多集中在哪些地區？",
        options: ["A. 香港島北部和南部", "B. 九龍、新界北部和西北部", "C. 新界東部和南部", "D. 大嶼山和香港島"],
        answer: "B. 九龍、新界北部和西北部"
      },
      {
        id: "hum_4a_l2_04", unitKey: "hum_4a_l2", qCategory: "hum_mcq", type: "mcq", typeLabel: "選擇題",
        prompt: "香港的地勢特徵對城市發展帶來甚麼限制？",
        options: ["A. 可供發展的用地充足", "B. 城市土地非常集中", "C. 用地不足，城市土地分散", "D. 無法興建任何交通工具"],
        answer: "C. 用地不足，城市土地分散"
      },
      {
        id: "hum_4a_l2_05", unitKey: "hum_4a_l2", qCategory: "hum_mcq", type: "mcq", typeLabel: "選擇題",
        prompt: "政府使用不同方法增加土地供應，以下哪一項是課本提及的方法？",
        options: ["A. 移山填海和發展新市鎮", "B. 購買其他國家的島嶼", "C. 拆除所有郊野公園", "D. 把所有建築物建於水底"],
        answer: "A. 移山填海和發展新市鎮"
      },
      {
        id: "hum_4a_l2_06", unitKey: "hum_4a_l2", qCategory: "hum_mcq", type: "mcq", typeLabel: "選擇題",
        prompt: "政府利用啟德機場騰出的土地興建「體育園」，主要為了滿足哪方面的需要？",
        options: ["A. 住屋需要", "B. 吸引旅客", "C. 推動體育發展", "D. 保護海洋生態"],
        answer: "C. 推動體育發展"
      },
      {
        id: "hum_4a_l2_07", unitKey: "hum_4a_l2", qCategory: "hum_mcq", type: "mcq", typeLabel: "選擇題",
        prompt: "2010年代計劃擴建香港國際機場時，哪一界別認為未來航空運輸需求大增，需要未雨綢繆？",
        options: ["A. 商界代表", "B. 香港機場管理局代表", "C. 環保團體代表", "D. 機場附近居民"],
        answer: "B. 香港機場管理局代表"
      },
      {
        id: "hum_4a_l2_08", unitKey: "hum_4a_l2", qCategory: "hum_mcq", type: "mcq", typeLabel: "選擇題",
        prompt: "環保團體代表擔心擴建香港國際機場的工程會影響海洋生態，不利哪些生物棲息？",
        options: ["A. 珊瑚和中華白海豚", "B. 樹木和花朵", "C. 禽畜和鳥類", "D. 候鳥和昆蟲"],
        answer: "A. 珊瑚和中華白海豚"
      },

      // 二、填充題 (#09 ~ #16)
      { id: "hum_4a_l2_09", unitKey: "hum_4a_l2", qCategory: "hum_fill", type: "fill_blank", typeLabel: "填充題", prompt: "香港缺乏平地，可供發展的土地 ________。", blanks: ["有限"], distractors: ["充足", "集中", "無限"] },
      { id: "hum_4a_l2_10", unitKey: "hum_4a_l2", qCategory: "hum_fill", type: "fill_blank", typeLabel: "填充題", prompt: "政府使用不同方法增加土地供應，包括 ________、發展新市鎮，以滿足住屋和經濟發展需要。", blanks: ["移山填海"], distractors: ["退耕還林", "南水北調", "鋪設沙障"] },
      { id: "hum_4a_l2_11", unitKey: "hum_4a_l2", qCategory: "hum_fill", type: "fill_blank", typeLabel: "填充題", prompt: "除了增加土地供應外，政府又完善 ________，有助香港持續發展。", blanks: ["交通網絡"], distractors: ["氣象預報", "格網座標", "沙漠鎖邊"] },
      { id: "hum_4a_l2_12", unitKey: "hum_4a_l2", qCategory: "hum_fill", type: "fill_blank", typeLabel: "填充題", prompt: "政府在赤鱲角島興建香港國際機場時，削平赤鱲角島和大規模 ________，以克服自然環境限制。", blanks: ["填海"], distractors: ["開墾", "植樹", "挖河"] },
      { id: "hum_4a_l2_13", unitKey: "hum_4a_l2", qCategory: "hum_fill", type: "fill_blank", typeLabel: "填充題", prompt: "政府興建跨海大橋、公路和 ________，以連接市區和香港國際機場。", blanks: ["鐵路"], distractors: ["水塘", "運河", "碼頭"] },
      { id: "hum_4a_l2_14", unitKey: "hum_4a_l2", qCategory: "hum_fill", type: "fill_blank", typeLabel: "填充題", prompt: "城市發展能促進經濟和社會發展，並改善市民的 ________ 環境。", blanks: ["居住"], distractors: ["海洋", "沙漠", "高空"] },
      { id: "hum_4a_l2_15", unitKey: "hum_4a_l2", qCategory: "hum_fill", type: "fill_blank", typeLabel: "填充題", prompt: "在工程期間會產生 ________ 和噪音，影響附近的居民，也可能影響生態環境。", blanks: ["塵土"], distractors: ["氧氣", "雨水", "冷鋒"] },
      { id: "hum_4a_l2_16", unitKey: "hum_4a_l2", qCategory: "hum_fill", type: "fill_blank", typeLabel: "填充題", prompt: "進行城市發展時，要有良好的規劃，平衡 ________、經濟和環境的需要。", blanks: ["社會"], distractors: ["氣候", "娛樂", "海運"] },

      // 三、分類題 (#17 ~ #20)
      {
        id: "hum_4a_l2_17", unitKey: "hum_4a_l2", qCategory: "hum_classify", type: "mcq", typeLabel: "分類配對題",
        prompt: "【意見分類】「擴建工程會令塵土飛揚污染空氣，日後運作也可能造成噪音滋擾」是哪一界別的意見？",
        options: ["A. 商界代表", "B. 香港機場管理局代表", "C. 環保團體代表", "D. 機場附近居民"],
        answer: "D. 機場附近居民"
      },
      {
        id: "hum_4a_l2_18", unitKey: "hum_4a_l2", qCategory: "hum_classify", type: "mcq", typeLabel: "分類配對題",
        prompt: "【意見分類】「可以提升香港經濟的競爭力，並為建築工人、技術人員等帶來就業機會」是哪一界別的意見？",
        options: ["A. 商界代表", "B. 香港機場管理局代表", "C. 環保團體代表", "D. 機場附近居民"],
        answer: "A. 商界代表"
      },
      {
        id: "hum_4a_l2_19", unitKey: "hum_4a_l2", qCategory: "hum_classify", type: "mcq", typeLabel: "分類配對題",
        prompt: "【意見分類】「雖然政府採用新式填海減少污染海洋，但工程難免影響海洋生態」是哪一界別的意見？",
        options: ["A. 商界代表", "B. 香港機場管理局代表", "C. 環保團體代表", "D. 機場附近居民"],
        answer: "C. 環保團體代表"
      },
      {
        id: "hum_4a_l2_20", unitKey: "hum_4a_l2", qCategory: "hum_classify", type: "mcq", typeLabel: "分類配對題",
        prompt: "【意見分類】「隨着經濟發展，未來對機場航空運輸的需求大增，需要未雨綢繆」是哪一界別的意見？",
        options: ["A. 商界代表", "B. 香港機場管理局代表", "C. 環保團體代表", "D. 機場附近居民"],
        answer: "B. 香港機場管理局代表"
      },

      // 四、看圖填充題 (#21 ~ #24)
      {
        id: "hum_4a_l2_21", unitKey: "hum_4a_l2", qCategory: "hum_img_fill", type: "image_fill", typeLabel: "看圖填充題",
        svgKey: "hum_4a_l2_relief_legend",
        prompt: "根據「香港地勢圖圖例」，綠色代表海拔高度 ________ 的平地，而黑色三角形 ▲ 代表 ________（500米或以上）。",
        blanks: ["0–100米", "主要山峯"], distractors: ["600米或以上", "河流", "新市鎮"]
      },
      {
        id: "hum_4a_l2_22", unitKey: "hum_4a_l2", qCategory: "hum_img_fill", type: "image_fill", typeLabel: "看圖填充題",
        svgKey: "hum_4a_l2_kaitak_plan",
        prompt: "根據「啟德土地用途圖」，興建公共和私人房屋是為了滿足市民的 ________。",
        blanks: ["住屋需要"], distractors: ["航空運輸", "漁業發展", "避寒需要"]
      },
      {
        id: "hum_4a_l2_23", unitKey: "hum_4a_l2", qCategory: "hum_img_fill", type: "image_fill", typeLabel: "看圖填充題",
        svgKey: "hum_4a_l2_kaitak_plan",
        prompt: "根據「啟德土地用途圖」，為了吸引旅客，政府在啟德騰出的土地上興建了 ________。",
        blanks: ["郵輪碼頭"], distractors: ["跨海大橋", "海水化淡廠", "社區中心"]
      },
      {
        id: "hum_4a_l2_24", unitKey: "hum_4a_l2", qCategory: "hum_img_fill", type: "image_fill", typeLabel: "看圖填充題",
        svgKey: "hum_4a_l2_kaitak_plan",
        prompt: "根據「啟德土地用途圖」，興建體育園有助香港 ________。",
        blanks: ["推動體育發展"], distractors: ["保護海洋生態", "改善空氣污染", "收集雨水"]
      },

      // 五、簡答題（#25 ~ #27 — 轉為短詞填空與多選，無長句）
      {
        id: "hum_4a_l2_25", unitKey: "hum_4a_l2", qCategory: "hum_short", type: "fill_blank", typeLabel: "簡答・重點填空",
        prompt: "在赤鱲角島興建香港國際機場時，政府削平赤鱲角島和大規模 ________，並興建 ________、公路和 ________ 以連接市區和機場。",
        blanks: ["填海", "跨海大橋", "鐵路"],
        distractors: ["郵輪碼頭", "水塘"]
      },
      {
        id: "hum_4a_l2_26", unitKey: "hum_4a_l2", qCategory: "hum_short", type: "multi_mcq", typeLabel: "簡答・多選題",
        prompt: "商界代表認為擴建香港國際機場能帶來哪兩項好處？（可選多於一項）",
        options: ["A. 提升香港經濟競爭力", "B. 帶來工人與技術人員就業機會", "C. 減少空氣塵土與噪音", "D. 改善海洋生物棲息環境"],
        answers: ["A. 提升香港經濟競爭力", "B. 帶來工人與技術人員就業機會"],
        answer: "A. 提升香港經濟競爭力、B. 帶來工人與技術人員就業機會"
      },
      {
        id: "hum_4a_l2_27", unitKey: "hum_4a_l2", qCategory: "hum_short", type: "multi_mcq", typeLabel: "簡答・多選題",
        prompt: "機場附近居民對擴建香港國際機場提出了哪兩項憂慮？（可選多於一項）",
        options: ["A. 工程塵土飛揚，污染空氣", "B. 工程和日後運作造成噪音滋擾", "C. 缺乏公共和私人住宅房屋", "D. 航空運輸需求嚴重不足"],
        answers: ["A. 工程塵土飛揚，污染空氣", "B. 工程和日後運作造成噪音滋擾"],
        answer: "A. 工程塵土飛揚，污染空氣、B. 工程和日後運作造成噪音滋擾"
      },

      // 六、問答／情境題（#28 ~ #30 — 轉為分類籃 classify 與短詞填空 fill_blank）
      {
        id: "hum_4a_l2_28", unitKey: "hum_4a_l2", qCategory: "hum_scenario", type: "classify", typeLabel: "情境・分類籃",
        prompt: "【情境：小官員回應大會】面對擴建機場意見，請將政府三方面的回應放入對應分類籃：",
        baskets: ["社會方面", "經濟方面", "環境方面"],
        items: [
          { label: "A. 工程時管制塵埃和噪音", basket: "社會方面" },
          { label: "B. 減少對附近居民的影響", basket: "社會方面" },
          { label: "C. 滿足經濟持續發展需要", basket: "經濟方面" },
          { label: "D. 採取措施保護海洋生態", basket: "環境方面" },
          { label: "E. 避免危害海洋生物", basket: "環境方面" }
        ],
        answer: "社會：A、B ｜ 經濟：C ｜ 環境：D、E"
      },
      {
        id: "hum_4a_l2_29", unitKey: "hum_4a_l2", qCategory: "hum_scenario", type: "classify", typeLabel: "情境・分類籃",
        prompt: "【情境：啟德社區小導遊】啟德機場舊址規劃如何平衡各方需要？請將建設項目放入對應目的分類籃：",
        baskets: ["滿足住屋需要", "吸引旅客", "推動體育發展"],
        items: [
          { label: "A. 公共房屋", basket: "滿足住屋需要" },
          { label: "B. 私人房屋", basket: "滿足住屋需要" },
          { label: "C. 郵輪碼頭", basket: "吸引旅客" },
          { label: "D. 體育園", basket: "推動體育發展" }
        ],
        answer: "住屋需要：A、B ｜ 吸引旅客：C ｜ 推動體育發展：D"
      },
      {
        id: "hum_4a_l2_30", unitKey: "hum_4a_l2", qCategory: "hum_scenario", type: "fill_blank", typeLabel: "情境・重點填空",
        prompt: "【情境：城市發展反思】城市發展能改善市民 ________ 環境，但工程期間會產生 ________ 和噪音並影響生態，因此必須有良好規劃，平衡 ________、經濟和 ________ 的需要。",
        blanks: ["居住", "塵土", "社會", "環境"],
        distractors: ["氣候", "交通"]
      }
    ]
  };
})();
/* ============================================================================
 * 人文科獨立題庫 — 下半部 Part B (questions/questions-humanities.js - v7.0)
 * 內含：第3課《香港的氣候》(30題) + 第5課《地球生病了》(30題)
 * 請直接緊接貼在 v7.0 Part A 代碼的最下方！
 * ============================================================================ */
(function() {
  if (!window.Aetheria || !window.Aetheria.QuestionBank || !window.Aetheria.QuestionBank.Humanities) return;

  const MORE_HUM_QUESTIONS = [
    // ==================== 第 3 課：《香港的氣候》（30題） ====================
    // 一、選擇題 (#01 ~ #08)
    {
      id: "hum_4a_l3_01", unitKey: "hum_4a_l3", qCategory: "hum_mcq", type: "mcq", typeLabel: "選擇題",
      prompt: "香港在冬季氣溫一般較低，是因為香港位於中國東南端，受到哪個地區的氣候影響？",
      options: ["A. 華北地區", "B. 華南地區", "C. 西北地區", "D. 東北地區"],
      answer: "B. 華南地區"
    },
    {
      id: "hum_4a_l3_02", unitKey: "hum_4a_l3", qCategory: "hum_mcq", type: "mcq", typeLabel: "選擇題",
      prompt: "下列哪一項是春季潮濕多霧天氣帶來的不便？",
      options: ["A. 大霧令能見度提高", "B. 衣服很快乾透", "C. 牆壁容易發霉，影響衛生和健康", "D. 容易引起山火"],
      answer: "C. 牆壁容易發霉，影響衛生和健康"
    },
    {
      id: "hum_4a_l3_03", unitKey: "hum_4a_l3", qCategory: "hum_mcq", type: "mcq", typeLabel: "選擇題",
      prompt: "哪一個季節多雨潮濕，雨水滲入泥土成為養分，有利作物生長，是農夫播種耕作的好季節？",
      options: ["A. 春季", "B. 夏季", "C. 秋季", "D. 冬季"],
      answer: "A. 春季"
    },
    {
      id: "hum_4a_l3_04", unitKey: "hum_4a_l3", qCategory: "hum_mcq", type: "mcq", typeLabel: "選擇題",
      prompt: "下列哪一個警告信號代表「普遍地區受烈風或暴風吹襲，且風勢可能持續」？",
      options: ["A. 酷熱天氣警告", "B. 紅色暴雨警告信號", "C. 八號東北烈風或暴風信號", "D. 雷暴警告"],
      answer: "C. 八號東北烈風或暴風信號"
    },
    {
      id: "hum_4a_l3_05", unitKey: "hum_4a_l3", qCategory: "hum_mcq", type: "mcq", typeLabel: "選擇題",
      prompt: "當天氣發出「雷暴警告」時，正在海灘游泳的人應該立刻怎樣做？",
      options: ["A. 繼續在水中玩耍", "B. 立即停止水上活動", "C. 走到大樹下避雨", "D. 多喝暖開水"],
      answer: "B. 立即停止水上活動"
    },
    {
      id: "hum_4a_l3_06", unitKey: "hum_4a_l3", qCategory: "hum_mcq", type: "mcq", typeLabel: "選擇題",
      prompt: "下列哪一項不是課本提及秋季適合進行的戶外活動？",
      options: ["A. 遠足", "B. 放風箏", "C. 騎單車", "D. 室內浸浴"],
      answer: "D. 室內浸浴"
    },
    {
      id: "hum_4a_l3_07", unitKey: "hum_4a_l3", qCategory: "hum_mcq", type: "mcq", typeLabel: "選擇題",
      prompt: "重陽節當天若天文台發出紅色火災危險警告信號，漁農自然護理署會呼籲掃墓市民怎樣做？",
      options: ["A. 帶備雨具", "B. 不要留下火種", "C. 在玻璃窗貼上膠紙", "D. 遠離河流或溪澗"],
      answer: "B. 不要留下火種"
    },
    {
      id: "hum_4a_l3_08", unitKey: "hum_4a_l3", qCategory: "hum_mcq", type: "mcq", typeLabel: "選擇題",
      prompt: "根據課本的報章報道，長開電暖爐引致火警並令數十名居民疏散的主要原因是甚麼？",
      options: ["A. 插電拖板共用致電路負荷過重", "B. 房間內空氣太過潮濕", "C. 睡覺時沒有打開窗戶", "D. 同時使用了暖水袋保暖"],
      answer: "A. 插電拖板共用致電路負荷過重"
    },

    // 二、填充題 (#09 ~ #16)
    { id: "hum_4a_l3_09", unitKey: "hum_4a_l3", qCategory: "hum_fill", type: "fill_blank", typeLabel: "填充題", prompt: "天文台預料一道 ________ 會在下週後期抵達華南，本港氣溫將會下降。", blanks: ["冷鋒"], distractors: ["熱帶氣旋", "暴雨", "山火"] },
    { id: "hum_4a_l3_10", unitKey: "hum_4a_l3", qCategory: "hum_fill", type: "fill_blank", typeLabel: "填充題", prompt: "春季的大霧令 ________ 降低，視野不清，影響車輛、飛機、船隻行駛，損害安全。", blanks: ["能見度"], distractors: ["降雨量", "氣溫", "海拔"] },
    { id: "hum_4a_l3_11", unitKey: "hum_4a_l3", qCategory: "hum_fill", type: "fill_blank", typeLabel: "填充題", prompt: "春季細雨濛濛令地面變得 ________，要小心行走以免跌倒；外出要常常帶備 ________。", blanks: ["濕滑", "雨具"], distractors: ["乾燥", "風箏", "暖水袋"] },
    { id: "hum_4a_l3_12", unitKey: "hum_4a_l3", qCategory: "hum_fill", type: "fill_blank", typeLabel: "填充題", prompt: "夏季除了天氣酷熱外，也常有 ________ 和暴雨，可能導致人命傷亡。", blanks: ["熱帶氣旋"], distractors: ["冷鋒", "山火", "寒流"] },
    { id: "hum_4a_l3_13", unitKey: "hum_4a_l3", qCategory: "hum_fill", type: "fill_blank", typeLabel: "填充題", prompt: "在熱帶氣旋來臨前，我們應做好 ________ 措施，例如在玻璃窗上貼上膠紙，以免玻璃碎裂傷人。", blanks: ["防風"], distractors: ["消暑", "保暖", "節水"] },
    { id: "hum_4a_l3_14", unitKey: "hum_4a_l3", qCategory: "hum_fill", type: "fill_blank", typeLabel: "填充題", prompt: "秋季天氣 ________，適宜進行戶外活動，例如遠足、放風箏、騎單車、燒烤和 ________。", blanks: ["乾燥", "露營"], distractors: ["潮濕", "游泳", "滑冰"] },
    { id: "hum_4a_l3_15", unitKey: "hum_4a_l3", qCategory: "hum_fill", type: "fill_blank", typeLabel: "填充題", prompt: "冬季天氣寒冷，我們可以穿足夠衣物、多喝 ________ 和使用 ________ 來保暖。", blanks: ["暖開水", "暖水袋"], distractors: ["凍飲", "電風扇", "雨具"] },
    { id: "hum_4a_l3_16", unitKey: "hum_4a_l3", qCategory: "hum_fill", type: "fill_blank", typeLabel: "填充題", prompt: "消費者委員會提醒市民，不要捲曲和摺疊電熱毯，以免損壞毯內的 ________。", blanks: ["發熱線"], distractors: ["電池", "膠紙", "濾網"] },

    // 三、分類題 (#17 ~ #20)
    {
      id: "hum_4a_l3_17", unitKey: "hum_4a_l3", qCategory: "hum_classify", type: "mcq", typeLabel: "分類配對題",
      prompt: "【季節分類】「天氣潮濕令衣服難以乾透，牆壁容易發霉」屬於哪一個季節？",
      options: ["A. 春季", "B. 夏季", "C. 秋季", "D. 冬季"],
      answer: "A. 春季"
    },
    {
      id: "hum_4a_l3_18", unitKey: "hum_4a_l3", qCategory: "hum_classify", type: "mcq", typeLabel: "分類配對題",
      prompt: "【季節分類】「注意消暑，多喝水，避免出現熱衰竭甚至中暑」屬於哪一個季節？",
      options: ["A. 春季", "B. 夏季", "C. 秋季", "D. 冬季"],
      answer: "B. 夏季"
    },
    {
      id: "hum_4a_l3_19", unitKey: "hum_4a_l3", qCategory: "hum_classify", type: "mcq", typeLabel: "分類配對題",
      prompt: "【季節分類】「寒流侵襲時，開放社區中心作為臨時避寒中心及派發禦寒衣物」屬於哪一個季節？",
      options: ["A. 春季", "B. 夏季", "C. 秋季", "D. 冬季"],
      answer: "D. 冬季"
    },
    {
      id: "hum_4a_l3_20", unitKey: "hum_4a_l3", qCategory: "hum_classify", type: "mcq", typeLabel: "分類配對題",
      prompt: "【季節分類】「天氣乾燥，掃墓時不要留下火種，以免引起山火」屬於哪一個季節？",
      options: ["A. 春季", "B. 夏季", "C. 秋季", "D. 冬季"],
      answer: "C. 秋季"
    },

    // 四、看圖填充題 (#21 ~ #24)
    {
      id: "hum_4a_l3_21", unitKey: "hum_4a_l3", qCategory: "hum_img_fill", type: "image_fill", typeLabel: "看圖填充題",
      svgKey: "hum_4a_l3_warn_rain",
      prompt: "根據天氣警告卡，紅色暴雨警告信號發出時，應立即遠離 ________，以免被水流捲走。",
      blanks: ["河流或溪澗"], distractors: ["斜坡或護土牆", "玻璃窗", "社區中心"]
    },
    {
      id: "hum_4a_l3_22", unitKey: "hum_4a_l3", qCategory: "hum_img_fill", type: "image_fill", typeLabel: "看圖填充題",
      svgKey: "hum_4a_l3_warn_rain",
      prompt: "根據天氣警告卡，山泥傾瀉警告發出時，應遠離 ________，以免被山泥弄傷。",
      blanks: ["斜坡或護土牆"], distractors: ["河流或溪澗", "泳灘海面", "公園草地"]
    },
    {
      id: "hum_4a_l3_23", unitKey: "hum_4a_l3", qCategory: "hum_img_fill", type: "image_fill", typeLabel: "看圖填充題",
      svgKey: "hum_4a_l3_warn_hot",
      prompt: "根據天氣警告卡，酷熱天氣警告發出時，如果不採取消暑措施，後果可能是出現 ________，甚至中暑。",
      blanks: ["熱衰竭"], distractors: ["被雷電擊中", "被水流捲走", "發霉"]
    },
    {
      id: "hum_4a_l3_24", unitKey: "hum_4a_l3", qCategory: "hum_img_fill", type: "image_fill", typeLabel: "看圖填充題",
      svgKey: "hum_4a_l3_warn_hot",
      prompt: "根據天氣警告卡，雷暴警告發出時，如果不立即停止水上活動，後果可能是 ________。",
      blanks: ["被雷電擊中"], distractors: ["熱衰竭", "被山泥弄傷", "引起山火"]
    },

    // 五、簡答題（#25 ~ #27 — 轉為短詞 multi_mcq，無長句）
    {
      id: "hum_4a_l3_25", unitKey: "hum_4a_l3", qCategory: "hum_short", type: "multi_mcq", typeLabel: "簡答・多選題",
      prompt: "春季的天氣對植物和農業有哪些好處？（可選多於一項）",
      options: ["A. 溫暖潮濕適合植物生長賞花", "B. 雨水滲入泥土有利農夫播種", "C. 天氣乾燥令衣服很快乾透", "D. 氣溫酷熱容易引發山火"],
      answers: ["A. 溫暖潮濕適合植物生長賞花", "B. 雨水滲入泥土有利農夫播種"],
      answer: "A. 溫暖潮濕適合植物生長賞花、B. 雨水滲入泥土有利農夫播種"
    },
    {
      id: "hum_4a_l3_26", unitKey: "hum_4a_l3", qCategory: "hum_short", type: "multi_mcq", typeLabel: "簡答・多選題",
      prompt: "消費者委員會發佈了哪些安全使用電暖爐的小貼士？（可選多於一項）",
      options: ["A. 不與其他高耗電電器共用電源", "B. 不使用電暖爐時應關掉電源", "C. 插在電拖板上通宵長開", "D. 捲曲摺疊電熱毯方便收納"],
      answers: ["A. 不與其他高耗電電器共用電源", "B. 不使用電暖爐時應關掉電源"],
      answer: "A. 不與其他高耗電電器共用電源、B. 不使用電暖爐時應關掉電源"
    },
    {
      id: "hum_4a_l3_27", unitKey: "hum_4a_l3", qCategory: "hum_short", type: "multi_mcq", typeLabel: "簡答・多選題",
      prompt: "當寒流侵襲香港時，社會各界透過哪些措施幫助有需要的人？（可選多於一項）",
      options: ["A. 開放社區中心作臨時避寒中心", "B. 派發禦寒衣物", "C. 派發食物", "D. 在玻璃窗貼上膠紙"],
      answers: ["A. 開放社區中心作臨時避寒中心", "B. 派發禦寒衣物", "C. 派發食物"],
      answer: "A. 開放社區中心作臨時避寒中心、B. 派發禦寒衣物、C. 派發食物"
    },

    // 六、問答／情境題（#28 ~ #30 — 轉為分類籃 classify、短詞填空 fill_blank 與 multi_mcq）
    {
      id: "hum_4a_l3_28", unitKey: "hum_4a_l3", qCategory: "hum_scenario", type: "classify", typeLabel: "情境・分類籃",
      prompt: "【情境：八號風球與山泥傾瀉應變】爸爸想在斜坡旁跑步，媽媽未在玻璃窗貼膠紙。請將正確措施與後果放入分類籃：",
      baskets: ["爸爸(山泥傾瀉警告)", "媽媽(八號風球)"],
      items: [
        { label: "A. 應遠離斜坡或護土牆", basket: "爸爸(山泥傾瀉警告)" },
        { label: "B. 否則可能被塌下山泥弄傷", basket: "爸爸(山泥傾瀉警告)" },
        { label: "C. 應在玻璃窗上貼上膠紙", basket: "媽媽(八號風球)" },
        { label: "D. 否則玻璃碎裂可能弄傷途人", basket: "媽媽(八號風球)" }
      ],
      answer: "爸爸：A、B ｜ 媽媽：C、D"
    },
    {
      id: "hum_4a_l3_29", unitKey: "hum_4a_l3", qCategory: "hum_scenario", type: "fill_blank", typeLabel: "情境・重點填空",
      prompt: "【情境：重陽節郊遊】紅色火災危險警告生效，小康一家掃墓後燒烤，必須注意不要留下 ________，因為秋天天氣 ________，容易引起 ________。",
      blanks: ["火種", "乾燥", "山火"],
      distractors: ["雨具", "潮濕", "水浸"]
    },
    {
      id: "hum_4a_l3_30", unitKey: "hum_4a_l3", qCategory: "hum_scenario", type: "multi_mcq", typeLabel: "情境・多選題",
      prompt: "【情境：寒冬送暖】寒冷天氣警告生效，小學生可以怎樣給身邊長者或有需要的人送上溫暖？（可選多於一項）",
      options: ["A. 致電關心長者並提醒穿足夠衣物", "B. 捐出衣物給有需要的人", "C. 邀請長者到海灘游泳", "D. 建議共用電拖板長開暖爐"],
      answers: ["A. 致電關心長者並提醒穿足夠衣物", "B. 捐出衣物給有需要的人"],
      answer: "A. 致電關心長者並提醒穿足夠衣物、B. 捐出衣物給有需要的人"
    },

    // ==================== 第 5 課：《地球生病了》（30題） ====================
    // 一、選擇題 (#01 ~ #08)
    {
      id: "hum_4a_l5_01", unitKey: "hum_4a_l5", qCategory: "hum_mcq", type: "mcq", typeLabel: "選擇題",
      prompt: "下列哪一組物品的原料均屬於「動物資源」？",
      options: ["A. 羊毛衣和木製家具", "B. 羊毛衣和芝士", "C. 木製家具和芝士", "D. 煤和石油"],
      answer: "B. 羊毛衣和芝士"
    },
    {
      id: "hum_4a_l5_02", unitKey: "hum_4a_l5", qCategory: "hum_mcq", type: "mcq", typeLabel: "選擇題",
      prompt: "過度伐林、放牧和開墾土地，會令土壤失去植物保護，容易造成甚麼結果？",
      options: ["A. 水土流失", "B. 降雨量增加", "C. 耕地增加", "D. 空氣變得更潔淨"],
      answer: "A. 水土流失"
    },
    {
      id: "hum_4a_l5_03", unitKey: "hum_4a_l5", qCategory: "hum_mcq", type: "mcq", typeLabel: "選擇題",
      prompt: "2024年11月完成的新疆塔克拉瑪干沙漠「鎖邊」工程，在沙漠邊緣形成了長達多少公里的阻沙防護帶？",
      options: ["A. 300 公里", "B. 1000 公里", "C. 3000 公里", "D. 5000 公里"],
      answer: "C. 3000 公里"
    },
    {
      id: "hum_4a_l5_04", unitKey: "hum_4a_l5", qCategory: "hum_mcq", type: "mcq", typeLabel: "選擇題",
      prompt: "國家在貴州省畢節推行「退耕還林」措施，讓農民騰出原本種粟米和蕎麥的耕地，改種甚麼植物？",
      options: ["A. 經濟價值較高的果樹", "B. 荷花", "C. 棉花", "D. 甘蔗"],
      answer: "A. 經濟價值較高的果樹"
    },
    {
      id: "hum_4a_l5_05", unitKey: "hum_4a_l5", qCategory: "hum_mcq", type: "mcq", typeLabel: "選擇題",
      prompt: "國家主席習近平在聯合國大會作出減排承諾，中國力爭在何時「碳達峯」及何時前實現「碳中和」？",
      options: ["A. 2025年碳達峯，2050年前碳中和", "B. 2030年碳達峯，2060年前碳中和", "C. 2035年碳達峯，2070年前碳中和", "D. 2040年碳達峯，2080年前碳中和"],
      answer: "B. 2030年碳達峯，2060年前碳中和"
    },
    {
      id: "hum_4a_l5_06", unitKey: "hum_4a_l5", qCategory: "hum_mcq", type: "mcq", typeLabel: "選擇題",
      prompt: "下列哪一組「發電站與可再生能源」的配對是正確的？",
      options: ["A. 長江三峽水力發電站 — 風能", "B. 甘肅光熱發電站 — 水能", "C. 上海海上風電場 — 太陽能", "D. 甘肅光熱發電站 — 太陽能"],
      answer: "D. 甘肅光熱發電站 — 太陽能"
    },
    {
      id: "hum_4a_l5_07", unitKey: "hum_4a_l5", qCategory: "hum_mcq", type: "mcq", typeLabel: "選擇題",
      prompt: "自 1965 年起，香港主要的食水來源是甚麼？",
      options: ["A. 本地收集的雨水", "B. 海水化淡", "C. 從廣東省輸入的東江水", "D. 地下水"],
      answer: "C. 從廣東省輸入的東江水"
    },
    {
      id: "hum_4a_l5_08", unitKey: "hum_4a_l5", qCategory: "hum_mcq", type: "mcq", typeLabel: "選擇題",
      prompt: "政府向市民徵收「排污費」，是根據哪一項原則？",
      options: ["A. 退耕還林", "B. 污染者自付", "C. 南水北調", "D. 碳達峯"],
      answer: "B. 污染者自付"
    },

    // 二、填充題 (#09 ~ #16)
    { id: "hum_4a_l5_09", unitKey: "hum_4a_l5", qCategory: "hum_fill", type: "fill_blank", typeLabel: "填充題", prompt: "地球蘊藏各種天然資源，包括植物資源、動物資源、________ 和礦產資源（如煤、石油、鐵、銅）。", blanks: ["水資源"], distractors: ["塑膠", "紙張", "電器"] },
    { id: "hum_4a_l5_10", unitKey: "hum_4a_l5", qCategory: "hum_fill", type: "fill_blank", typeLabel: "填充題", prompt: "過度使用煤和石油資源會產生大量 ________，導致氣候變化，令暴雨、強力颱風更頻密發生。", blanks: ["二氧化碳"], distractors: ["氧氣", "雨水", "海風"] },
    { id: "hum_4a_l5_11", unitKey: "hum_4a_l5", qCategory: "hum_fill", type: "fill_blank", typeLabel: "填充題", prompt: "我國水資源南多北少，國家推行「________」工程（東線、中線、西線），把南部水資源調往北部。", blanks: ["南水北調"], distractors: ["退耕還林", "鎖邊工程", "移山填海"] },
    { id: "hum_4a_l5_12", unitKey: "hum_4a_l5", qCategory: "hum_fill", type: "fill_blank", typeLabel: "填充題", prompt: "國家積極發展水能、太陽能和風能等 ________ 來發電，比使用煤和天然氣排放較少温室氣體。", blanks: ["可再生能源"], distractors: ["礦產資源", "動物資源", "化石燃料"] },
    { id: "hum_4a_l5_13", unitKey: "hum_4a_l5", qCategory: "hum_fill", type: "fill_blank", typeLabel: "填充題", prompt: "2023 年底啟用的 ________ 海水化淡廠，可以為香港提供半成至一成的淡水用量。", blanks: ["將軍澳"], distractors: ["尖沙咀", "赤鱲角", "啟德"] },
    { id: "hum_4a_l5_14", unitKey: "hum_4a_l5", qCategory: "hum_fill", type: "fill_blank", typeLabel: "填充題", prompt: "2020 至 2022 年香港每人每天平均淡水用量約 ________ 公升，高於聯合國建議的 50–100 公升。", blanks: ["150"], distractors: ["50", "80", "500"] },
    { id: "hum_4a_l5_15", unitKey: "hum_4a_l5", qCategory: "hum_fill", type: "fill_blank", typeLabel: "填充題", prompt: "政府改善空氣污染措施包括立法規定停車等候時要 ________、推廣電動車，以及用較潔淨的 ________ 發電。", blanks: ["關掉引擎", "天然氣"], distractors: ["開大冷氣", "煤炭", "石油"] },
    { id: "hum_4a_l5_16", unitKey: "hum_4a_l5", qCategory: "hum_fill", type: "fill_blank", typeLabel: "填充題", prompt: "我們可以與家人利用「碳中和與可持續發展」網站中的「低碳生活計算機」計算 ________（或稱碳足印）。", blanks: ["碳足跡"], distractors: ["降雨量", "格網座標", "能見度"] },

    // 三、分類題 (#17 ~ #20)
    {
      id: "hum_4a_l5_17", unitKey: "hum_4a_l5", qCategory: "hum_classify", type: "mcq", typeLabel: "分類配對題",
      prompt: "【污水來源分類】「清洗食具、爐具和食物」所產生的污水屬於哪一類來源？",
      options: ["A. 家居", "B. 食肆", "C. 工廠", "D. 農場"],
      answer: "B. 食肆"
    },
    {
      id: "hum_4a_l5_18", unitKey: "hum_4a_l5", qCategory: "hum_classify", type: "mcq", typeLabel: "分類配對題",
      prompt: "【污水來源分類】「飼養禽畜」所產生的污水屬於哪一類來源？",
      options: ["A. 家居", "B. 食肆", "C. 工廠", "D. 農場"],
      answer: "D. 農場"
    },
    {
      id: "hum_4a_l5_19", unitKey: "hum_4a_l5", qCategory: "hum_classify", type: "mcq", typeLabel: "分類配對題",
      prompt: "【污水來源分類】「清潔地板、洗衣服、沖廁、洗澡、刷牙」所產生的污水屬於哪一類來源？",
      options: ["A. 家居", "B. 食肆", "C. 工廠", "D. 農場"],
      answer: "A. 家居"
    },
    {
      id: "hum_4a_l5_20", unitKey: "hum_4a_l5", qCategory: "hum_classify", type: "mcq", typeLabel: "分類配對題",
      prompt: "【污水來源分類】「產品的生產過程」所產生的污水屬於哪一類來源？",
      options: ["A. 家居", "B. 食肆", "C. 工廠", "D. 農場"],
      answer: "C. 工廠"
    },

    // 四、看圖填充題 (#21 ~ #24)
    {
      id: "hum_4a_l5_21", unitKey: "hum_4a_l5", qCategory: "hum_img_fill", type: "image_fill", typeLabel: "看圖填充題",
      svgKey: "hum_4a_l5_rainfall",
      prompt: "根據國家年降雨量圖表，南部區域如珠江和長江的年降雨量比北部區域 ________，反映國家水資源分佈 ________。",
      blanks: ["高", "不均"], distractors: ["低", "平均", "相同"]
    },
    {
      id: "hum_4a_l5_22", unitKey: "hum_4a_l5", qCategory: "hum_img_fill", type: "image_fill", typeLabel: "看圖填充題",
      svgKey: "hum_4a_l5_extreme_weather",
      prompt: "根據極端天氣圖表 (A)，香港天文台最高一小時雨量由 88 毫米上升至 2023 年的 ________ 毫米，反映香港的 ________ 事件越來越嚴重。",
      blanks: ["158", "極端降雨"], distractors: ["100", "乾旱", "沙塵暴"]
    },
    {
      id: "hum_4a_l5_23", unitKey: "hum_4a_l5", qCategory: "hum_img_fill", type: "image_fill", typeLabel: "看圖填充題",
      svgKey: "hum_4a_l5_extreme_weather",
      prompt: "根據極端天氣圖表 (B)，比較兩個時期，香港每年平均酷熱日數 ________，寒冷日數 ________。",
      blanks: ["增多", "減少"], distractors: ["不變", "歸零", "倍減"]
    },
    {
      id: "hum_4a_l5_24", unitKey: "hum_4a_l5", qCategory: "hum_img_fill", type: "image_fill", typeLabel: "看圖填充題",
      svgKey: "hum_4a_l5_extreme_weather",
      prompt: "根據極端天氣圖表 (B) 附註，「酷熱日」是指日最高氣溫攝氏 ________ 度或以上；「寒冷日」是指日最低氣溫攝氏 ________ 度或以下。",
      blanks: ["33", "12"], distractors: ["30", "15", "28"]
    },

    // 五、簡答題（#25 ~ #27 — 轉為短詞填空與多選，無長句）
    {
      id: "hum_4a_l5_25", unitKey: "hum_4a_l5", qCategory: "hum_short", type: "fill_blank", typeLabel: "簡答・重點填空",
      prompt: "新疆塔克拉瑪干沙漠「鎖邊」工程主要採用種植 ________，配合鋪設 ________ 等治沙方式。",
      blanks: ["植物", "沙障"], distractors: ["填海", "大橋", "水塘"]
    },
    {
      id: "hum_4a_l5_26", unitKey: "hum_4a_l5", qCategory: "hum_short", type: "multi_mcq", typeLabel: "簡答・多選題",
      prompt: "空氣污染會對香港市民健康和社會帶來哪些影響？（可選多於一項）",
      options: ["A. 刺激喉嚨咳嗽，令哮喘惡化", "B. 遮蓋維港景觀影響旅遊業", "C. 減低能見度影響船隻航行", "D. 令醫療開支大幅減少"],
      answers: ["A. 刺激喉嚨咳嗽，令哮喘惡化", "B. 遮蓋維港景觀影響旅遊業", "C. 減低能見度影響船隻航行"],
      answer: "A. 刺激喉嚨咳嗽，令哮喘惡化、B. 遮蓋維港景觀影響旅遊業、C. 減低能見度影響船隻航行"
    },
    {
      id: "hum_4a_l5_27", unitKey: "hum_4a_l5", qCategory: "hum_short", type: "multi_mcq", typeLabel: "簡答・多選題",
      prompt: "面對近年極端天氣越見頻繁，政府採取了哪兩項具體措施減輕暴雨和酷熱天氣的影響？（可選多於一項）",
      options: ["A. 治理河道（擴闊河道）減輕氾濫", "B. 制定《預防工作時中暑指引》", "C. 增加使用煤炭發電", "D. 取消推廣電動車輛"],
      answers: ["A. 治理河道（擴闊河道）減輕氾濫", "B. 制定《預防工作時中暑指引》"],
      answer: "A. 治理河道（擴闊河道）減輕氾濫、B. 制定《預防工作時中暑指引》"
    },

    // 六、問答／情境題（#28 ~ #30 — 轉為分類籃 classify）
    {
      id: "hum_4a_l5_28", unitKey: "hum_4a_l5", qCategory: "hum_scenario", type: "classify", typeLabel: "情境・分類籃",
      prompt: "【情境：節約用水與水質保護】請把「必須節水的原因」、「節水方法」與「水質污染後果」放入對應分類籃：",
      baskets: ["節水原因與方法", "水質污染後果"],
      items: [
        { label: "A. 大部分淡水來自東江水", basket: "節水原因與方法" },
        { label: "B. 用淋浴代替浸浴", basket: "節水原因與方法" },
        { label: "C. 海水發臭滋生細菌", basket: "水質污染後果" },
        { label: "D. 破壞河流生態致魚類死亡", basket: "水質污染後果" }
      ],
      answer: "節水原因與方法：A、B ｜ 水質污染後果：C、D"
    },
    {
      id: "hum_4a_l5_29", unitKey: "hum_4a_l5", qCategory: "hum_scenario", type: "classify", typeLabel: "情境・分類籃",
      prompt: "【情境：衣食住行低碳生活】請將課本提及的低碳綠色行動放入「衣、食、住、行」對應分類籃：",
      baskets: ["衣", "食", "住", "行"],
      items: [
        { label: "A. 衣服足夠不隨便買新衣", basket: "衣" },
        { label: "B. 買適量及簡約包裝食物", basket: "食" },
        { label: "C. 選節能雪櫃、關不用電器", basket: "住" },
        { label: "D. 走兩層樓梯、減少搭的士", basket: "行" }
      ],
      answer: "衣：A ｜ 食：B ｜ 住：C ｜ 行：D"
    },
    {
      id: "hum_4a_l5_30", unitKey: "hum_4a_l5", qCategory: "hum_scenario", type: "classify", typeLabel: "情境・分類籃",
      prompt: "【情境：保育香港自然環境】大埔鹽田仔和世界地質公園十分珍貴，請將保育意義放入對應分類籃：",
      baskets: ["應對氣候變化", "消閒學習與培養意識"],
      items: [
        { label: "A. 樹林濕地海洋吸收二氧化碳", basket: "應對氣候變化" },
        { label: "B. 儲存二氧化碳減緩暖化", basket: "應對氣候變化" },
        { label: "C. 瞭解香港美麗的一面", basket: "消閒學習與培養意識" },
        { label: "D. 培養責任感和環保意識", basket: "消閒學習與培養意識" }
      ],
      answer: "應對氣候變化：A、B ｜ 消閒學習與培養意識：C、D"
    }
  ];

  Array.prototype.push.apply(window.Aetheria.QuestionBank.Humanities.QUESTIONS, MORE_HUM_QUESTIONS);
})();
