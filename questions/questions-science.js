/* ============================================================================
 * 科學科獨立題庫 — 上半部 Part 3A (questions/questions-science.js - v6.7)
 * 內含：12幅精細教科書級向量插畫 + 第2課《青春期的變化》(30題) + 第3課《應對青春期》(30題)
 * 升級：1.全面平衡所有簡答題、情境題與選擇題的 4 個選項長度與句式結構，杜絕靠長短盲選
 *       2.所有正確選項與 answer 100% 一字不差完全吻合
 * ============================================================================ */
window.Aetheria = window.Aetheria || {};
window.Aetheria.QuestionBank = window.Aetheria.QuestionBank || {};

(function() {
  const SCI_DIAGRAMS = {
    // 1. 第2課 #25：男性的生殖系統結構簡圖
    sci_l2_male_repro: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 165">
      <defs>
        <radialGradient id="maleHalo" cx="50%" cy="46%" r="48%">
          <stop offset="0%" stop-color="#ffffff"/>
          <stop offset="68%" stop-color="#d4f0ff"/>
          <stop offset="100%" stop-color="#b3e5fc"/>
        </radialGradient>
      </defs>
      <rect width="280" height="165" rx="12" fill="url(#maleHalo)"/>
      <circle cx="140" cy="76" r="64" fill="#ffffff" opacity="0.55" stroke="#81d4fa" stroke-width="2"/>
      <path d="M98,16 C125,12 178,16 198,38 L198,136 L128,136 L128,118 C126,128 112,132 104,124 C96,116 96,96 102,86 C96,94 90,112 86,120 C82,126 72,124 72,114 C72,98 82,78 90,66 C88,50 92,30 98,16 Z" fill="#f9d5d3" stroke="#c48b89" stroke-width="2"/>
      <path d="M118,32 C122,22 158,24 162,40 C164,54 152,66 142,68 C130,66 114,48 118,32 Z" fill="#fff15c" stroke="#e0c238" stroke-width="1.5"/>
      <path d="M134,68 C134,62 150,62 150,68 C152,76 132,76 134,68 Z" fill="#f29cb1"/>
      <ellipse cx="115" cy="108" rx="10" ry="13" fill="#f49ac1" stroke="#e06c9f" stroke-width="1.5"/>
      <path d="M118,95 C124,96 126,108 122,116 C128,112 128,96 118,86 C106,72 104,42 114,26 C124,14 160,16 168,34 C172,48 162,64 146,72" fill="none" stroke="#eb6b7e" stroke-width="3" stroke-linecap="round"/>
      <path d="M142,66 C140,74 134,78 120,78 C102,78 90,88 80,120" fill="none" stroke="#fff15c" stroke-width="2.8" stroke-linecap="round"/>
      <line x1="108" y1="36" x2="54" y2="24" stroke="#ffffff" stroke-width="4"/><line x1="108" y1="36" x2="54" y2="24" stroke="#7ac143" stroke-width="2"/>
      <line x1="86" y1="74" x2="48" y2="66" stroke="#ffffff" stroke-width="4"/><line x1="86" y1="74" x2="48" y2="66" stroke="#7ac143" stroke-width="2"/>
      <line x1="115" y1="108" x2="188" y2="116" stroke="#ffffff" stroke-width="4"/><line x1="115" y1="108" x2="188" y2="116" stroke="#7ac143" stroke-width="2"/>
      <rect x="8" y="12" width="54" height="20" rx="4" fill="#ffffff" stroke="#26a69a" stroke-width="1.5"/>
      <text x="35" y="26" font-size="10" font-weight="bold" fill="#00695c" text-anchor="middle">輸送管道？</text>
      <rect x="8" y="54" width="54" height="20" rx="4" fill="#ffffff" stroke="#26a69a" stroke-width="1.5"/>
      <text x="35" y="68" font-size="10" font-weight="bold" fill="#00695c" text-anchor="middle">排出體外？</text>
      <rect x="186" y="104" width="84" height="22" rx="4" fill="#ffffff" stroke="#26a69a" stroke-width="1.5"/>
      <text x="228" y="119" font-size="10" font-weight="bold" fill="#00695c" text-anchor="middle">製造精子器官？</text>
      <rect x="64" y="136" width="152" height="24" rx="8" fill="#a3daf6"/>
      <text x="140" y="152" font-size="12" font-weight="bold" fill="#263238" text-anchor="middle">男性的生殖系統結構簡圖</text>
    </svg>`,

    // 2. 第2課 #26：女性的生殖系統結構簡圖
    sci_l2_female_repro: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 165">
      <defs>
        <radialGradient id="femHalo" cx="50%" cy="46%" r="48%">
          <stop offset="0%" stop-color="#ffffff"/>
          <stop offset="68%" stop-color="#fce4ec"/>
          <stop offset="100%" stop-color="#f8bbd0"/>
        </radialGradient>
      </defs>
      <rect width="280" height="165" rx="12" fill="url(#femHalo)"/>
      <circle cx="140" cy="74" r="62" fill="#ffffff" opacity="0.65" stroke="#f48fb1" stroke-width="2"/>
      <path d="M116,46 C96,38 78,44 76,58 C76,66 84,68 88,62 C86,52 98,48 114,54" fill="#f49ac1" stroke="#d81b60" stroke-width="1.5"/>
      <path d="M164,46 C184,38 202,44 204,58 C204,66 196,68 192,62 C194,52 182,48 166,54" fill="#f49ac1" stroke="#d81b60" stroke-width="1.5"/>
      <ellipse cx="92" cy="66" rx="11" ry="8" fill="#ffe082" stroke="#ffa000" stroke-width="1.5"/>
      <ellipse cx="188" cy="66" rx="11" ry="8" fill="#ffe082" stroke="#ffa000" stroke-width="1.5"/>
      <path d="M114,44 C126,38 154,38 166,44 C168,62 156,82 148,94 L148,126 L132,126 L132,94 C124,82 112,62 114,44 Z" fill="#f29cb1" stroke="#c2185b" stroke-width="2"/>
      <path d="M124,52 C132,48 148,48 156,52 C154,68 146,82 140,90 C134,82 126,68 124,52 Z" fill="#e91e63"/>
      <line x1="94" y1="44" x2="54" y2="26" stroke="#ffffff" stroke-width="4"/><line x1="94" y1="44" x2="54" y2="26" stroke="#7ac143" stroke-width="2"/>
      <line x1="92" y1="66" x2="54" y2="76" stroke="#ffffff" stroke-width="4"/><line x1="92" y1="66" x2="54" y2="76" stroke="#7ac143" stroke-width="2"/>
      <line x1="145" y1="66" x2="204" y2="56" stroke="#ffffff" stroke-width="4"/><line x1="145" y1="66" x2="204" y2="56" stroke="#7ac143" stroke-width="2"/>
      <rect x="6" y="14" width="62" height="20" rx="4" fill="#ffffff" stroke="#26a69a" stroke-width="1.5"/>
      <text x="37" y="28" font-size="10" font-weight="bold" fill="#00695c" text-anchor="middle">輸送卵子？</text>
      <rect x="6" y="66" width="62" height="20" rx="4" fill="#ffffff" stroke="#26a69a" stroke-width="1.5"/>
      <text x="37" y="80" font-size="10" font-weight="bold" fill="#00695c" text-anchor="middle">排出卵子？</text>
      <rect x="200" y="44" width="72" height="22" rx="4" fill="#ffffff" stroke="#26a69a" stroke-width="1.5"/>
      <text x="236" y="59" font-size="10" font-weight="bold" fill="#00695c" text-anchor="middle">孕育胎兒？</text>
      <rect x="64" y="136" width="152" height="24" rx="8" fill="#a3daf6"/>
      <text x="140" y="152" font-size="12" font-weight="bold" fill="#263238" text-anchor="middle">女性的生殖系統結構簡圖</text>
    </svg>`,

    // 3. 第2課 #27：左圖男孩照鏡噴髮膠整理髮型、右圖女孩背書包向爸爸揮手說自己上學
    sci_l2_psych_both: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 155">
      <rect width="280" height="155" rx="12" fill="#f3e5f5"/>
      <line x1="140" y1="10" x2="140" y2="145" stroke="#ba68c8" stroke-width="2" stroke-dasharray="4,3"/>
      <rect x="12" y="22" width="38" height="92" rx="6" fill="#e1f5fe" stroke="#5c6bc0" stroke-width="3"/>
      <path d="M18,34 L34,26 M18,44 L40,32" stroke="#ffffff" stroke-width="2" stroke-linecap="round"/>
      <path d="M58,124 C60,96 102,96 104,124 Z" fill="#42a5f5" stroke="#1565c0" stroke-width="2"/>
      <circle cx="81" cy="68" r="19" fill="#ffccbc" stroke="#8d6e63" stroke-width="2"/>
      <path d="M62,60 C60,38 86,32 100,42 C96,48 104,52 98,60 C88,50 72,50 62,60 Z" fill="#3e2723"/>
      <circle cx="74" cy="66" r="2.2" fill="#212121"/><circle cx="88" cy="66" r="2.2" fill="#212121"/>
      <path d="M76,75 Q81,80 86,75" fill="none" stroke="#5d4037" stroke-width="2" stroke-linecap="round"/>
      <rect x="112" y="50" width="12" height="24" rx="2" fill="#29b6f6" stroke="#0277bd" stroke-width="1.5"/>
      <rect x="115" y="45" width="6" height="5" fill="#e53935"/>
      <path d="M112,48 L98,42 M112,50 L98,50 M112,52 L100,56" stroke="#0288d1" stroke-width="1.8" stroke-dasharray="2,2"/>
      <text x="70" y="142" font-size="11" font-weight="bold" fill="#4a148c" text-anchor="middle">左圖：噴髮膠整理髮型</text>
      <circle cx="164" cy="70" r="14" fill="#ffccbc" stroke="#8d6e63" stroke-width="1.5"/>
      <path d="M150,64 C152,48 176,48 178,64 Z" fill="#4e342e"/>
      <circle cx="160" cy="69" r="1.8" fill="#212121"/><circle cx="169" cy="69" r="1.8" fill="#212121"/>
      <path d="M148,124 C150,94 178,94 180,124 Z" fill="#78909c" stroke="#37474f" stroke-width="1.5"/>
      <rect x="234" y="86" width="18" height="26" rx="4" fill="#ffb300" stroke="#e65100" stroke-width="1.5"/>
      <path d="M202,124 C204,96 242,96 244,124 Z" fill="#f48fb1" stroke="#ad1457" stroke-width="2"/>
      <circle cx="223" cy="68" r="18" fill="#ffe0b2" stroke="#8d6e63" stroke-width="2"/>
      <path d="M205,62 C206,42 240,42 241,62 C232,52 214,52 205,62 Z" fill="#3e2723"/>
      <circle cx="216" cy="67" r="2.2" fill="#212121"/><circle cx="230" cy="67" r="2.2" fill="#212121"/>
      <path d="M218,76 Q223,81 228,76" fill="none" stroke="#ad1457" stroke-width="2" stroke-linecap="round"/>
      <path d="M204,100 L188,88" stroke="#ffe0b2" stroke-width="5.5" stroke-linecap="round"/>
      <rect x="148" y="12" width="124" height="24" rx="6" fill="#ffffff" stroke="#8e24aa" stroke-width="1.5"/>
      <text x="210" y="28" font-size="10" font-weight="bold" fill="#4a148c" text-anchor="middle">「我自己上學就可以了」</text>
      <text x="210" y="142" font-size="11" font-weight="bold" fill="#4a148c" text-anchor="middle">右圖：不需父母接送</text>
    </svg>`,

    // 4. 第3課 #25：健康飲食金字塔
    sci_l3_food_pyramid: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 160">
      <rect width="280" height="160" rx="12" fill="#f1f8e9"/>
      <polygon points="140,12 112,42 168,42" fill="#ffcdd2" stroke="#c62828" stroke-width="2"/>
      <polygon points="112,42 86,74 194,74 168,42" fill="#ffe0b2" stroke="#ef6c00" stroke-width="2"/>
      <polygon points="86,74 58,108 222,108 194,74" fill="#c8e6c9" stroke="#2e7d32" stroke-width="2"/>
      <line x1="140" y1="74" x2="140" y2="108" stroke="#2e7d32" stroke-width="2"/>
      <polygon points="58,108 30,144 250,144 222,108" fill="#fff9c4" stroke="#f9a825" stroke-width="2"/>
      <text x="140" y="36" font-size="10" font-weight="bold" fill="#b71c1c" text-anchor="middle">頂層(吃最少)：？</text>
      <text x="140" y="62" font-size="10" font-weight="bold" fill="#e65100" text-anchor="middle">吃適量：奶類、肉魚蛋</text>
      <text x="104" y="96" font-size="10" font-weight="bold" fill="#1b5e20" text-anchor="middle">多吃些：？</text>
      <text x="176" y="96" font-size="10" font-weight="bold" fill="#1b5e20" text-anchor="middle">多吃些：？</text>
      <text x="140" y="130" font-size="11" font-weight="bold" fill="#f57f17" text-anchor="middle">最底層(吃最多)：？</text>
    </svg>`,

    // 5. 第3課 #26：左圖打乒乓球（中等強度）、右圖快速跑步（劇烈強度）
    sci_l3_exercise_intensity: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 155">
      <rect width="280" height="155" rx="12" fill="#e8f5e9"/>
      <line x1="140" y1="12" x2="140" y2="142" stroke="#81c784" stroke-width="2" stroke-dasharray="4,3"/>
      <circle cx="52" cy="54" r="15" fill="#ffccbc" stroke="#8d6e63" stroke-width="1.8"/>
      <path d="M37,48 C38,32 66,32 67,48 Z" fill="#3e2723"/>
      <circle cx="47" cy="54" r="2" fill="#212121"/><circle cx="58" cy="54" r="2" fill="#212121"/>
      <path d="M48,61 Q52,65 56,61" fill="none" stroke="#5d4037" stroke-width="1.8"/>
      <path d="M38,98 C40,70 64,70 66,98 Z" fill="#42a5f5" stroke="#1565c0" stroke-width="1.8"/>
      <path d="M64,78 L84,68" stroke="#ffccbc" stroke-width="5.5" stroke-linecap="round"/>
      <circle cx="90" cy="64" r="9" fill="#e53935" stroke="#b71c1c" stroke-width="1.5"/>
      <circle cx="108" cy="58" r="4" fill="#ffffff" stroke="#fb8c00" stroke-width="1.2"/>
      <polygon points="18,98 124,98 116,114 26,114" fill="#1e88e5" stroke="#0d47a1" stroke-width="2"/>
      <line x1="72" y1="90" x2="72" y2="104" stroke="#ffffff" stroke-width="2.5"/>
      <text x="70" y="24" font-size="11" font-weight="bold" fill="#1b5e20" text-anchor="middle">左圖：打乒乓球</text>
      <text x="70" y="138" font-size="10" font-weight="bold" fill="#2e7d32" text-anchor="middle">（能說話但不能唱歌）</text>
      <circle cx="216" cy="52" r="16" fill="#ffccbc" stroke="#8d6e63" stroke-width="1.8"/>
      <path d="M200,46 C202,30 230,30 232,46 Z" fill="#3e2723"/>
      <circle cx="211" cy="51" r="2" fill="#212121"/><circle cx="223" cy="51" r="2" fill="#212121"/>
      <ellipse cx="218" cy="60" rx="4" ry="3" fill="#b71c1c"/>
      <path d="M196,42 C192,48 198,52 200,46 Z M236,46 C234,52 240,56 242,48 Z" fill="#29b6f6"/>
      <path d="M154,56 L178,56 M148,72 L174,72 M156,88 L178,88" stroke="#29b6f6" stroke-width="2.5" stroke-linecap="round"/>
      <path d="M198,68 L222,68 L214,98 L192,98 Z" fill="#ff7043" stroke="#d84315" stroke-width="2"/>
      <path d="M214,74 L238,66 M198,74 L178,84" stroke="#ffccbc" stroke-width="5.5" stroke-linecap="round"/>
      <path d="M212,98 L234,116 M196,98 L176,118" stroke="#37474f" stroke-width="6" stroke-linecap="round"/>
      <text x="210" y="24" font-size="11" font-weight="bold" fill="#b71c1c" text-anchor="middle">右圖：快速跑步</text>
      <text x="210" y="138" font-size="10" font-weight="bold" fill="#c62828" text-anchor="middle">（呼吸急促難說完整句）</text>
    </svg>`,

    // 6. 第3課 #27：皮膚毛孔結構圖
    sci_l3_skin_pore: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 160">
      <rect width="280" height="160" rx="12" fill="#fff3e0"/>
      <path d="M16,58 L96,58 C108,42 122,42 126,56 L154,56 C158,42 172,42 184,58 L264,58 L264,136 L16,136 Z" fill="#ffccbc" stroke="#d84315" stroke-width="2"/>
      <path d="M126,54 C124,84 118,118 138,124 C158,118 154,84 152,54 Z" fill="#ffe082" stroke="#ffa000" stroke-width="2"/>
      <path d="M126,48 C132,42 146,42 152,48 L150,58 L128,58 Z" fill="#4e342e"/>
      <path d="M124,78 C102,72 96,94 114,98 C120,98 124,92 126,88 Z" fill="#fff59d" stroke="#fbc02d" stroke-width="1.5"/>
      <path d="M154,78 C176,72 182,94 164,98 C158,98 154,92 152,88 Z" fill="#fff59d" stroke="#fbc02d" stroke-width="1.5"/>
      <path d="M100,62 C92,82 96,112 116,120 M180,62 C188,82 184,112 164,120" fill="none" stroke="#e53935" stroke-width="2.5" stroke-dasharray="4,2"/>
      <line x1="108" y1="86" x2="58" y2="86" stroke="#7ac143" stroke-width="2"/>
      <line x1="138" y1="50" x2="72" y2="28" stroke="#7ac143" stroke-width="2"/>
      <line x1="176" y1="98" x2="218" y2="98" stroke="#7ac143" stroke-width="2"/>
      <rect x="8" y="16" width="66" height="20" rx="4" fill="#ffffff" stroke="#7ac143" stroke-width="1.5"/>
      <text x="41" y="30" font-size="10" font-weight="bold" fill="#2e7d32" text-anchor="middle">堵塞成？</text>
      <rect x="8" y="76" width="54" height="20" rx="4" fill="#ffffff" stroke="#7ac143" stroke-width="1.5"/>
      <text x="35" y="90" font-size="10" font-weight="bold" fill="#2e7d32" text-anchor="middle">？腺體</text>
      <rect x="214" y="88" width="58" height="20" rx="4" fill="#ffffff" stroke="#e53935" stroke-width="1.5"/>
      <text x="243" y="102" font-size="10" font-weight="bold" fill="#c62828" text-anchor="middle">局部？</text>
    </svg>`,

    // 7. 第8課 #25：方向標示圖（綠色箭頭由「東」吹向「西」）
    sci_l8_wind_dir: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 155">
      <rect width="280" height="155" rx="12" fill="#e1f5fe"/>
      <line x1="140" y1="24" x2="140" y2="132" stroke="#78909c" stroke-width="2"/>
      <line x1="46" y1="78" x2="234" y2="78" stroke="#78909c" stroke-width="2"/>
      <text x="140" y="18" font-size="12" font-weight="bold" fill="#37474f" text-anchor="middle">北 (N)</text>
      <text x="140" y="148" font-size="12" font-weight="bold" fill="#37474f" text-anchor="middle">南 (S)</text>
      <text x="28" y="82" font-size="13" font-weight="bold" fill="#1565c0" text-anchor="middle">西</text>
      <text x="252" y="82" font-size="13" font-weight="bold" fill="#2e7d32" text-anchor="middle">東</text>
      <path d="M222,68 L96,68 L96,56 L64,78 L96,100 L96,88 L222,88 Z" fill="#66bb6a" stroke="#1b5e20" stroke-width="2"/>
      <text x="154" y="82" font-size="11" font-weight="bold" fill="#ffffff" text-anchor="middle">風從東方吹向西方</text>
    </svg>`,

    // 8. 第8課 #26：香港天文台三大觀測儀器
    sci_l8_hko_instruments: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 160">
      <rect width="280" height="160" rx="12" fill="#e8f5e9"/>
      <path d="M18,42 L82,42 L82,98 L18,98 Z" fill="#ffffff" stroke="#546e7a" stroke-width="2"/>
      <path d="M14,42 L50,26 L86,42 Z" fill="#cfd8dc" stroke="#455a64" stroke-width="2"/>
      <path d="M24,52 L76,52 M24,62 L76,62 M24,72 L76,72 M24,82 L76,82" stroke="#90a4ae" stroke-width="2"/>
      <path d="M26,98 L26,126 M74,98 L74,126" stroke="#546e7a" stroke-width="3"/>
      <text x="50" y="144" font-size="10" font-weight="bold" fill="#1b5e20" text-anchor="middle">(1) 百葉箱</text>
      <line x1="142" y1="32" x2="142" y2="126" stroke="#455a64" stroke-width="3.5"/>
      <line x1="114" y1="48" x2="170" y2="48" stroke="#37474f" stroke-width="2.5"/>
      <path d="M114,42 C106,42 106,54 114,54 Z M170,42 C178,42 178,54 170,54 Z" fill="#263238"/>
      <path d="M118,74 L166,74 M166,74 L158,68 M166,74 L158,80 M118,68 L118,80" stroke="#0277bd" stroke-width="2.5"/>
      <text x="142" y="144" font-size="10" font-weight="bold" fill="#01579b" text-anchor="middle">(2) 風向儀/風速表</text>
      <path d="M206,46 L258,46 L254,124 L210,124 Z" fill="#eceff1" stroke="#546e7a" stroke-width="2"/>
      <path d="M206,46 L232,68 L258,46" fill="#b0bec5" stroke="#455a64" stroke-width="1.5"/>
      <path d="M218,22 L214,36 M232,18 L228,34 M246,22 L242,36" stroke="#29b6f6" stroke-width="2" stroke-linecap="round"/>
      <text x="232" y="144" font-size="10" font-weight="bold" fill="#263238" text-anchor="middle">(3) 翻斗式雨量器</text>
    </svg>`,

    // 9. 第8課 #27：海霧形成過程圖
    sci_l8_fog_formation: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 155">
      <rect width="280" height="155" rx="12" fill="#cfd8dc"/>
      <path d="M0,112 L150,112 L150,155 L0,155 Z" fill="#0277bd"/>
      <path d="M145,104 C185,96 235,98 280,104 L280,155 L145,155 Z" fill="#558b2f"/>
      <text x="75" y="138" font-size="11" font-weight="bold" fill="#e1f5fe" text-anchor="middle">較冷的海面</text>
      <text x="215" y="138" font-size="11" font-weight="bold" fill="#f1f8e9" text-anchor="middle">較冷的地面</text>
      <path d="M18,54 C48,46 82,52 108,64" fill="none" stroke="#ff7043" stroke-width="3" stroke-linecap="round"/>
      <polygon points="112,66 102,58 104,68" fill="#ff7043"/>
      <text x="62" y="42" font-size="11" font-weight="bold" fill="#bf360c" text-anchor="middle">溫暖潮濕的空氣</text>
      <path d="M88,76 C102,62 138,62 152,74 C168,60 208,62 222,76 C242,66 266,74 268,90 C266,104 236,106 212,102 C188,108 148,106 126,102 C98,106 76,94 88,76 Z" fill="#ffffff" opacity="0.88" stroke="#b0bec5" stroke-width="2"/>
      <text x="178" y="88" font-size="12" font-weight="bold" fill="#37474f" text-anchor="middle">低空遇冷形成白茫茫的？</text>
    </svg>`,

    // 10. 第9課 #25：板塊分離形成裂谷圖
    sci_l9_plate_rift: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 155">
      <rect width="280" height="155" rx="12" fill="#e1f5fe"/>
      <path d="M12,96 L268,96 L268,144 L12,144 Z" fill="#ff5722" stroke="#bf360c" stroke-width="2"/>
      <path d="M118,96 L140,62 L162,96 Z" fill="#ff9800"/>
      <path d="M12,48 L112,48 L126,76 L118,96 L12,96 Z" fill="#8d6e63" stroke="#4e342e" stroke-width="2"/>
      <path d="M168,48 L268,48 L268,96 L162,96 L154,76 Z" fill="#8d6e63" stroke="#4e342e" stroke-width="2"/>
      <path d="M96,68 L48,68 L48,58 L28,73 L48,88 L48,78 L96,78 Z" fill="#e53935" stroke="#ffffff" stroke-width="1.5"/>
      <path d="M184,68 L232,68 L232,58 L252,73 L232,88 L232,78 L184,78 Z" fill="#e53935" stroke="#ffffff" stroke-width="1.5"/>
      <text x="140" y="30" font-size="12" font-weight="bold" fill="#b71c1c" text-anchor="middle">兩塊板塊互相分離 ➔ 形成？</text>
      <text x="140" y="126" font-size="11" font-weight="bold" fill="#fffde7" text-anchor="middle">地殼下流動的岩漿</text>
    </svg>`,

    // 11. 第9課 #26：三格圖解 — 海底魚龍化石隆起成高山
    sci_l9_ichthyosaur_3step: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 155">
      <rect width="280" height="155" rx="12" fill="#eceff1"/>
      <rect x="8" y="12" width="84" height="130" rx="6" fill="#e1f5fe" stroke="#90a4ae" stroke-width="1.5"/>
      <path d="M8,52 L92,52 L92,96 L8,96 Z" fill="#4fc3f7"/>
      <path d="M8,96 L92,96 L92,142 L8,142 Z" fill="#bcaaa4"/>
      <path d="M26,112 C42,104 62,106 76,114 C62,118 42,118 26,112 Z" fill="#fff8e1" stroke="#5d4037" stroke-width="1.5"/>
      <text x="50" y="30" font-size="10" font-weight="bold" fill="#01579b" text-anchor="middle">(1) 海底遺骸掩埋</text>
      <rect x="98" y="12" width="84" height="130" rx="6" fill="#e1f5fe" stroke="#90a4ae" stroke-width="1.5"/>
      <path d="M98,112 Q140,56 182,112 L182,142 L98,142 Z" fill="#a1887f" stroke="#5d4037" stroke-width="2"/>
      <path d="M104,124 Q140,72 176,124" fill="none" stroke="#d7ccc8" stroke-width="3" stroke-dasharray="4,2"/>
      <text x="140" y="30" font-size="10" font-weight="bold" fill="#4e342e" text-anchor="middle">(2) 岩層擠壓隆起</text>
      <rect x="188" y="12" width="84" height="130" rx="6" fill="#e1f5fe" stroke="#90a4ae" stroke-width="1.5"/>
      <path d="M188,142 L228,46 L272,142 Z" fill="#78909c" stroke="#37474f" stroke-width="2"/>
      <path d="M214,78 L228,46 L242,78 Z" fill="#ffffff"/>
      <path d="M216,96 C226,90 238,92 246,98" fill="none" stroke="#ffe082" stroke-width="3"/>
      <text x="230" y="30" font-size="10" font-weight="bold" fill="#263238" text-anchor="middle">(3) 高山發現化石</text>
    </svg>`,

    // 12. 第9課 #27：三個古生物化石圖 — (1)魚化石 (2)菊石化石 (3)植物化石
    sci_l9_three_fossils: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 155">
      <rect width="280" height="155" rx="12" fill="#efebe9"/>
      <path d="M16,28 C22,16 78,16 84,28 L86,112 C80,124 20,124 14,112 Z" fill="#d7ccc8" stroke="#8d6e63" stroke-width="2"/>
      <path d="M26,70 L74,70 M74,70 L82,60 M74,70 L82,80 M36,56 L42,84 M48,54 L54,86 M60,58 L64,82" stroke="#4e342e" stroke-width="2.2" stroke-linecap="round"/>
      <text x="50" y="140" font-size="11" font-weight="bold" fill="#3e2723" text-anchor="middle">(1) ？化石</text>
      <path d="M104,28 C110,16 170,16 176,28 L178,112 C172,124 108,124 102,112 Z" fill="#d7ccc8" stroke="#8d6e63" stroke-width="2"/>
      <path d="M140,70 C144,66 148,72 142,76 C134,80 126,70 132,60 C140,48 158,54 160,70 C162,88 140,98 124,88 C110,76 116,46 138,42" fill="none" stroke="#4e342e" stroke-width="3" stroke-linecap="round"/>
      <text x="140" y="140" font-size="11" font-weight="bold" fill="#3e2723" text-anchor="middle">(2) ？化石</text>
      <path d="M194,28 C200,16 260,16 266,28 L268,112 C262,124 198,124 192,112 Z" fill="#d7ccc8" stroke="#8d6e63" stroke-width="2"/>
      <path d="M230,42 C248,56 250,86 230,102 C210,86 212,56 230,42 Z" fill="none" stroke="#4e342e" stroke-width="2.2"/>
      <path d="M230,42 L230,108 M230,60 L242,52 M230,74 L244,66 M230,66 L218,58 M230,82 L218,74" stroke="#4e342e" stroke-width="2" stroke-linecap="round"/>
      <text x="230" y="140" font-size="11" font-weight="bold" fill="#3e2723" text-anchor="middle">(3) ？化石</text>
    </svg>`
  };

  window.Aetheria.QuestionBank.Science = {
    DIAGRAMS: SCI_DIAGRAMS,

    LESSONS: [
      { key: "sci_l2", name: "科學・第2課 青春期的變化 (30題)" },
      { key: "sci_l3", name: "科學・第3課 應對青春期 (30題)" },
      { key: "sci_l8", name: "科學・第8課 觀測天氣 (30題)" },
      { key: "sci_l9", name: "科學・第9課 探索地貌 (30題)" }
    ],

    QUESTIONS: [
      // ==================== 第 2 課：青春期的變化 (30題) ====================
      { id: "sci_l2_01", unitKey: "sci_l2", qCategory: "sci_fill", type: "fill_blank", typeLabel: "填充題", prompt: "人的一生大致分為五個成長階段：嬰幼兒期、兒童期、______、成年期和老年期。", blanks: ["青春期"], distractors: ["少年期", "叛逆期", "成熟期"] },
      { id: "sci_l2_02", unitKey: "sci_l2", qCategory: "sci_fill", type: "fill_blank", typeLabel: "填充題", prompt: "一般而言，女性約在 7 至 12 歲開始青春期，男性則約在______歲開始。", blanks: ["9至14"], distractors: ["5至8", "15至20", "18至22"] },
      { id: "sci_l2_03", unitKey: "sci_l2", qCategory: "sci_fill", type: "fill_blank", typeLabel: "填充題", prompt: "在人類的成長階段中，______期的生長速度最快，並開始學習控制身體和動作。", blanks: ["嬰幼兒"], distractors: ["兒童", "成年", "老年"] },
      { id: "sci_l2_04", unitKey: "sci_l2", qCategory: "sci_fill", type: "fill_blank", typeLabel: "填充題", prompt: "踏入______期，人的皮膚會有皺紋、斑點，白髮明顯增加，各種能力逐漸退化。", blanks: ["老年"], distractors: ["青春", "成年", "兒童"] },
      { id: "sci_l2_05", unitKey: "sci_l2", qCategory: "sci_fill", type: "fill_blank", typeLabel: "填充題", prompt: "進入青春期後，______會分泌大量荷爾蒙，刺激生殖器官發育。", blanks: ["腦部"], distractors: ["心臟", "肺部", "胃部"] },
      { id: "sci_l2_06", unitKey: "sci_l2", qCategory: "sci_fill", type: "fill_blank", typeLabel: "填充題", prompt: "進入青春期後，男孩的______開始產生男性荷爾蒙；女孩的______開始產生女性荷爾蒙。", blanks: ["睾丸", "卵巢"], distractors: ["陰囊", "子宮", "腎臟"] },
      { id: "sci_l2_07", unitKey: "sci_l2", qCategory: "sci_fill", type: "fill_blank", typeLabel: "填充題", prompt: "青春期男女的身體會出現明顯的變化，並開始具備______能力。", blanks: ["生育"], distractors: ["飛行", "透視", "冬眠"] },
      { id: "sci_l2_08", unitKey: "sci_l2", qCategory: "sci_fill", type: "fill_blank", typeLabel: "填充題", prompt: "人類的繁殖源於______和______的結合，前者來自爸爸，後者來自媽媽。", blanks: ["精子", "卵子"], distractors: ["血液", "細胞核", "荷爾蒙"] },
      { id: "sci_l2_09", unitKey: "sci_l2", qCategory: "sci_fill", type: "fill_blank", typeLabel: "填充題", prompt: "男性進入青春期，如果睡覺時陰莖受到刺激，可能會排出精液，造成「______」。", blanks: ["夢遺"], distractors: ["月經", "失眠", "發炎"] },
      { id: "sci_l2_10", unitKey: "sci_l2", qCategory: "sci_fill", type: "fill_blank", typeLabel: "填充題", prompt: "踏入青春期，荷爾蒙變化會影響腦部調節情緒的功能，導致______容易起伏。", blanks: ["情緒"], distractors: ["體溫", "視力", "聽覺"] },

      // 第2課 選擇題 (#11 ~ #18 — 選項長度對稱一致)
      {
        id: "sci_l2_11", unitKey: "sci_l2", qCategory: "sci_mcq", type: "mcq", typeLabel: "選擇題",
        prompt: "哪一個成長階段的特徵是「身體逐漸成長，平衡力和協調能力增強」？",
        options: ["A. 嬰幼兒期", "B. 兒童期", "C. 青春期", "D. 成年期"],
        answer: "B. 兒童期"
      },
      {
        id: "sci_l2_12", unitKey: "sci_l2", qCategory: "sci_mcq", type: "mcq", typeLabel: "選擇題",
        prompt: "「骨骼、肌肉生長加快，女性體形變得渾圓，男性體形變得結實」屬於哪個成長階段的特徵？",
        options: ["A. 兒童期", "B. 青春期", "C. 成年期", "D. 老年期"],
        answer: "B. 青春期"
      },
      {
        id: "sci_l2_13", unitKey: "sci_l2", qCategory: "sci_mcq", type: "mcq", typeLabel: "選擇題",
        prompt: "下列哪一項是青春期男女共同出現的生理特徵？",
        options: ["A. 出現明顯喉結", "B. 乳房開始隆起", "C. 容易長暗瘡", "D. 聲線變得低沉"],
        answer: "C. 容易長暗瘡"
      },
      {
        id: "sci_l2_14", unitKey: "sci_l2", qCategory: "sci_mcq", type: "mcq", typeLabel: "選擇題",
        prompt: "下列哪一項不是青春期男性的生理特徵？",
        options: ["A. 肌肉變得壯實", "B. 臀部變得豐滿", "C. 陰莖逐漸增大", "D. 可能長出胸毛"],
        answer: "B. 臀部變得豐滿"
      },
      {
        id: "sci_l2_15", unitKey: "sci_l2", qCategory: "sci_mcq", type: "mcq", typeLabel: "選擇題",
        prompt: "關於精子和卵子的描述，哪一項是正確的？",
        options: [
          "A. 精子的外形呈圓球狀且不能游動",
          "B. 卵子的外形像蝌蚪一樣長有尾巴",
          "C. 精子是男性體內最小的細胞",
          "D. 卵子是由爸爸的生殖系統製造的"
        ],
        answer: "C. 精子是男性體內最小的細胞"
      },
      {
        id: "sci_l2_16", unitKey: "sci_l2", qCategory: "sci_mcq", type: "mcq", typeLabel: "選擇題",
        prompt: "在男性的生殖系統中，哪一個器官負責「保護睾丸」？",
        options: ["A. 輸精管", "B. 陰囊", "C. 陰莖", "D. 尿道"],
        answer: "B. 陰囊"
      },
      {
        id: "sci_l2_17", unitKey: "sci_l2", qCategory: "sci_mcq", type: "mcq", typeLabel: "選擇題",
        prompt: "在女性的生殖系統中，哪一個器官是「嬰兒出生時通過的地方」？",
        options: ["A. 卵巢", "B. 輸卵管", "C. 子宮", "D. 陰道"],
        answer: "D. 陰道"
      },
      {
        id: "sci_l2_18", unitKey: "sci_l2", qCategory: "sci_mcq", type: "mcq", typeLabel: "選擇題",
        prompt: "在月經周期中，卵巢按月排出卵子後，約兩星期如果卵子沒有受精，甚麼部位會脫落並排出體外形成月經？",
        options: ["A. 卵巢外壁", "B. 輸卵管內壁", "C. 子宮內膜", "D. 陰道黏膜"],
        answer: "C. 子宮內膜"
      },

      // 第2課 分類題 (#19 ~ #21)
      {
        id: "sci_l2_19", unitKey: "sci_l2", qCategory: "sci_classify", type: "classify", typeLabel: "分類題",
        prompt: "請將以下青春期的生理特徵放入對應的分類籃：",
        baskets: ["男性獨有", "女性獨有", "男女皆有"],
        items: [
          { label: "1. 長出陰毛", basket: "男女皆有" },
          { label: "2. 出現喉結", basket: "男性獨有" },
          { label: "3. 乳房隆起", basket: "女性獨有" },
          { label: "4. 長出腋毛", basket: "男女皆有" },
          { label: "5. 聲線變得低沉", basket: "男性獨有" },
          { label: "6. 臀部變得豐滿", basket: "女性獨有" }
        ],
        answer: "男性獨有：2, 5 ｜ 女性獨有：3, 6 ｜ 男女皆有：1, 4"
      },
      {
        id: "sci_l2_20", unitKey: "sci_l2", qCategory: "sci_classify", type: "classify", typeLabel: "分類題",
        prompt: "請將以下器官放入對應的生殖系統分類籃：",
        baskets: ["男性生殖系統", "女性生殖系統"],
        items: [
          { label: "1. 輸精管", basket: "男性生殖系統" },
          { label: "2. 卵巢", basket: "女性生殖系統" },
          { label: "3. 陰囊", basket: "男性生殖系統" },
          { label: "4. 子宮", basket: "女性生殖系統" },
          { label: "5. 睾丸", basket: "男性生殖系統" },
          { label: "6. 輸卵管", basket: "女性生殖系統" }
        ],
        answer: "男性生殖系統：1, 3, 5 ｜ 女性生殖系統：2, 4, 6"
      },
      {
        id: "sci_l2_21", unitKey: "sci_l2", qCategory: "sci_classify", type: "classify", typeLabel: "分類題",
        prompt: "請將以下特徵放入青春期的「生理變化」或「心理變化」分類籃：",
        baskets: ["生理變化", "心理變化"],
        items: [
          { label: "1. 身高和體重顯著增加", basket: "生理變化" },
          { label: "2. 渴望獨立自主", basket: "心理變化" },
          { label: "3. 注重自我形象", basket: "心理變化" },
          { label: "4. 生殖系統開始成熟", basket: "生理變化" },
          { label: "5. 重視朋輩認同", basket: "心理變化" }
        ],
        answer: "生理變化：1, 4 ｜ 心理變化：2, 3, 5"
      },

      // 第2課 簡答題 (#22 ~ #24 — 四個選項字數與句式結構完全平衡對稱)
      {
        id: "sci_l2_22", unitKey: "sci_l2", qCategory: "sci_short", type: "short_qa", typeLabel: "簡答題",
        prompt: "【簡答題】成年期初期和後期的身體特徵有甚麼分別？",
        options: [
          "在初期，身體最強壯；到後期，活動速度減慢。",
          "在初期，皮膚有皺紋；到後期，生長速度最快。",
          "在初期，平衡力最弱；到後期，骨骼急速生長。",
          "在初期，剛學會走路；到後期，才具備生育力。"
        ],
        answer: "在初期，身體最強壯；到後期，活動速度減慢。"
      },
      {
        id: "sci_l2_23", unitKey: "sci_l2", qCategory: "sci_short", type: "short_qa", typeLabel: "簡答題",
        prompt: "【簡答題】請列舉青春期常見的心理特徵。",
        options: [
          "渴望獨立自主、注重自我形象、對異性感興趣、重視朋輩認同、對性產生好奇。",
          "完全依賴父母、毫不注重外表、抗拒異性相處、忽視朋輩意見、對性毫無好奇。",
          "記憶力漸衰退、拒絕個人空間、情緒永遠平靜、只愛獨自留家、對事物失興趣。",
          "生長速度最快、剛學控制身體、喜歡模仿成人、平衡力漸增強、事事服從長輩。"
        ],
        answer: "渴望獨立自主、注重自我形象、對異性感興趣、重視朋輩認同、對性產生好奇。"
      },
      {
        id: "sci_l2_24", unitKey: "sci_l2", qCategory: "sci_short", type: "short_qa", typeLabel: "簡答題",
        prompt: "【簡答題】請按次序簡述女性月經形成的過程。",
        options: [
          "卵巢按月排卵，子宮內膜增厚充血；卵子經輸卵管移向子宮，內膜繼續增厚；約兩星期後若卵子未受精，子宮內膜脫落經陰道排出形成月經。",
          "子宮按月排卵，卵巢內壁增厚充血；卵子經陰道移向輸卵管，內壁繼續增厚；約兩星期後若卵子未受精，卵巢內壁脫落經尿道排出形成月經。",
          "卵巢每天排卵，輸卵管壁增厚充血；卵子經子宮移向輸精管，管壁繼續增厚；約兩天之後若卵子已受精，子宮內膜脫落經陰道排出形成月經。",
          "輸卵管按月排卵，子宮頸增厚充血；卵子經卵巢移向陰道口，宮頸繼續增厚；約兩個月後若卵子未受精，輸卵管壁脫落經尿道排出形成月經。"
        ],
        answer: "卵巢按月排卵，子宮內膜增厚充血；卵子經輸卵管移向子宮，內膜繼續增厚；約兩星期後若卵子未受精，子宮內膜脫落經陰道排出形成月經。"
      },

      // 第2課 看圖填充題 (#25 ~ #27)
      {
        id: "sci_l2_25", unitKey: "sci_l2", qCategory: "sci_img_fill", type: "image_fill", typeLabel: "看圖填充題",
        svgKey: "sci_l2_male_repro",
        prompt: "觀察男性生殖系統結構簡圖：負責製造精子的器官是______；負責輸送精子的管道是______；負責把精子排出體外的器官是______。",
        blanks: ["睾丸", "輸精管", "陰莖"], distractors: ["卵巢", "子宮", "輸卵管"]
      },
      {
        id: "sci_l2_26", unitKey: "sci_l2", qCategory: "sci_img_fill", type: "image_fill", typeLabel: "看圖填充題",
        svgKey: "sci_l2_female_repro",
        prompt: "觀察女性生殖系統結構簡圖：負責製造、儲存和排出卵子的器官是______；負責輸送卵子的是______；負責孕育胎兒的是______。",
        blanks: ["卵巢", "輸卵管", "子宮"], distractors: ["睾丸", "輸精管", "陰囊"]
      },
      {
        id: "sci_l2_27", unitKey: "sci_l2", qCategory: "sci_img_fill", type: "image_fill", typeLabel: "看圖填充題",
        svgKey: "sci_l2_psych_both",
        prompt: "觀察圖中青少年的表現：左圖男孩噴髮膠整理髮型的行為反映他______；右圖女孩自己上學的行為反映她______。",
        blanks: ["注重自我形象", "渴望獨立自主"], distractors: ["依賴家人照顧", "忽視個人衛生", "抗拒上學"]
      },

      // 第2課 情境題 (#28 ~ #30 — 四個選項字數與句式結構完全平衡對稱)
      {
        id: "sci_l2_28", unitKey: "sci_l2", qCategory: "sci_scenario", type: "short_qa", typeLabel: "情境題",
        prompt: "【情境題】家誠今年11歲，與媽媽去游泳池時，拒絕再跟媽媽進入女更衣室，堅持自己去男更衣室。為甚麼他會有這樣的轉變？我們對待自己和別人的身體應有甚麼態度？",
        options: [
          "因為他已踏入青春期，意識到男女有別，進異性更衣室會不自在或尷尬。我們應保護自己的身體，並尊重別人的私隱。",
          "因為他正處於兒童期，故意與媽媽作對，進異性更衣室會被泳池職員罰款。我們應隨意展示身體，並公開別人的私隱。",
          "因為他已踏入成年期，嫌棄女更衣室水溫太冷，進男更衣室才有熱水淋浴。我們應只顧自己方便，無須理會別人感受。",
          "因為他正處於嬰幼兒期，不喜歡與家人同行，進男更衣室可以獨自玩耍。我們應隱藏身體變化，並拒絕與任何家人溝通。"
        ],
        answer: "因為他已踏入青春期，意識到男女有別，進異性更衣室會不自在或尷尬。我們應保護自己的身體，並尊重別人的私隱。"
      },
      {
        id: "sci_l2_29", unitKey: "sci_l2", qCategory: "sci_scenario", type: "short_qa", typeLabel: "情境題",
        prompt: "【情境題】12歲的子軒早上醒來發現內褲濕了，懷疑自己患病，感到非常害怕。這是甚麼生理現象？你會怎樣向他解釋原因以消除他的疑慮？",
        options: [
          "這是「夢遺」。男性進入青春期後睾丸開始製造精子；睡覺時若陰莖受刺激可能排出精液，屬正常生理現象，對身體無害，無須害怕。",
          "這是「尿床」。男性進入青春期後膀胱容量大幅縮小；睡覺時若飲水過多便會自動排出尿液，屬嚴重腎臟疾病，對身體有害，必須求醫。",
          "這是「盜汗」。男性進入青春期後汗腺出現異常退化；睡覺時若被子太薄便會大量排出汗水，屬罕見荷爾蒙失調，會妨礙發育，應吃藥。",
          "這是「發炎」。男性進入青春期後輸精管被細菌感染；睡覺時若內褲太鬆便會滲出組織液體，屬異常生理病變，會損害生育力，須動手術。"
        ],
        answer: "這是「夢遺」。男性進入青春期後睾丸開始製造精子；睡覺時若陰莖受刺激可能排出精液，屬正常生理現象，對身體無害，無須害怕。"
      },
      {
        id: "sci_l2_30", unitKey: "sci_l2", qCategory: "sci_scenario", type: "short_qa", typeLabel: "情境題",
        prompt: "【情境題】踏入青春期的小玲有兩個疑問：(1) 女性在月經期間能不能做運動？ (2) 男生同學的胸部變大是不正常的嗎？請以科學角度為她解答。",
        options: [
          "(1) 月經期間可以做適度運動，對身體有益，但需按個人狀況選擇合適運動。(2) 青春期男性肌肉和脂肪都會增長，若無不適，胸部變大亦屬正常生理現象。",
          "(1) 月經期間絕對不可做任何運動，否則會令子宮內膜停止脫落並損害健康。(2) 青春期男性只會增長骨骼不會長脂肪，胸部變大屬於嚴重的荷爾蒙病變。",
          "(1) 月經期間必須每天進行超負荷劇烈運動，才能加速經血排出以縮短周期。(2) 青春期男性出現女性生理特徵，代表生殖系統發育停滯，必須立即服藥。",
          "(1) 月經期間既不可洗頭也不可外出步行，必須整天臥床休息避免吹風受涼。(2) 青春期男性胸部變大是因為缺乏睡眠與運動不足，會導致永久失去生育力。"
        ],
        answer: "(1) 月經期間可以做適度運動，對身體有益，但需按個人狀況選擇合適運動。(2) 青春期男性肌肉和脂肪都會增長，若無不適，胸部變大亦屬正常生理現象。"
      },

      // ==================== 第 3 課：應對青春期 (30題) ====================
      { id: "sci_l3_01", unitKey: "sci_l3", qCategory: "sci_fill", type: "fill_blank", typeLabel: "填充題", prompt: "青春期男女因發育情況不同而出現個別差異，這是______的現象，我們不必感到煩惱。", blanks: ["正常"], distractors: ["異常", "罕見", "危險"] },
      { id: "sci_l3_02", unitKey: "sci_l3", qCategory: "sci_fill", type: "fill_blank", typeLabel: "填充題", prompt: "面對青春期發育的個別差異，我們應持有的正確態度是：明白及______。", blanks: ["接受"], distractors: ["比較", "隱瞞", "自卑"] },
      { id: "sci_l3_03", unitKey: "sci_l3", qCategory: "sci_fill", type: "fill_blank", typeLabel: "填充題", prompt: "青春期的發育情況主要受______、睡眠、______和______影響，因人而異，不必互相比較。", blanks: ["遺傳", "飲食", "運動"], allowSwapIndices: [1, 2], distractors: ["天氣", "衣着", "星座"] },
      { id: "sci_l3_04", unitKey: "sci_l3", qCategory: "sci_fill", type: "fill_blank", typeLabel: "填充題", prompt: "親代（父母）的特徵會遺傳給子代（子女）。青少年的發育受先天______的影響，但後天的生活______亦十分重要。", blanks: ["遺傳", "習慣"], distractors: ["財富", "運氣", "興趣"] },
      { id: "sci_l3_05", unitKey: "sci_l3", qCategory: "sci_fill", type: "fill_blank", typeLabel: "填充題", prompt: "有助生長的荷爾蒙主要在晚上 10 時至凌晨 2 時的______睡眠中分泌。", blanks: ["深層"], distractors: ["淺層", "午間", "短暫"] },
      { id: "sci_l3_06", unitKey: "sci_l3", qCategory: "sci_fill", type: "fill_blank", typeLabel: "填充題", prompt: "衛生署建議 6 至 13 歲學童每天睡______至______小時。", blanks: ["9", "11"], distractors: ["4", "6", "15"] },
      { id: "sci_l3_07", unitKey: "sci_l3", qCategory: "sci_fill", type: "fill_blank", typeLabel: "填充題", prompt: "良好的睡眠使人回復______，心情開朗，有助身心發展。", blanks: ["精力"], distractors: ["飢餓", "疲勞", "壓力"] },
      { id: "sci_l3_08", unitKey: "sci_l3", qCategory: "sci_fill", type: "fill_blank", typeLabel: "填充題", prompt: "根據「健康飲食金字塔」，我們每天應喝______至______杯流質飲料，例如開水、奶。", blanks: ["6", "8"], distractors: ["1", "2", "20"] },
      { id: "sci_l3_09", unitKey: "sci_l3", qCategory: "sci_fill", type: "fill_blank", typeLabel: "填充題", prompt: "垃圾食物是指______、脂肪、糖及鹽含量高，______價值卻很低的食物和飲料。", blanks: ["熱量", "營養"], distractors: ["水分", "纖維", "維生素"] },
      { id: "sci_l3_10", unitKey: "sci_l3", qCategory: "sci_fill", type: "fill_blank", typeLabel: "填充題", prompt: "適量的運動對發育有很多好處，包括強健______、減輕______和預防______。", blanks: ["骨骼", "壓力", "肥胖"], distractors: ["視力", "身高", "睡眠"] },

      // 第3課 選擇題 (#11 ~ #18 — 選項長度對稱一致)
      {
        id: "sci_l3_11", unitKey: "sci_l3", qCategory: "sci_mcq", type: "mcq", typeLabel: "選擇題",
        prompt: "以下哪一項影響青少年發育的因素屬於「先天因素」？",
        options: ["A. 飲食", "B. 睡眠", "C. 運動", "D. 遺傳"],
        answer: "D. 遺傳"
      },
      {
        id: "sci_l3_12", unitKey: "sci_l3", qCategory: "sci_mcq", type: "mcq", typeLabel: "選擇題",
        prompt: "我們一般會從父母身上遺傳到哪些身體特徵？",
        options: ["A. 身高和體形", "B. 樣貌和骨骼", "C. 以上皆是", "D. 以上皆非"],
        answer: "C. 以上皆是"
      },
      {
        id: "sci_l3_13", unitKey: "sci_l3", qCategory: "sci_mcq", type: "mcq", typeLabel: "選擇題",
        prompt: "當你睡得不好或睡眠不足時，身體會出現甚麼感覺或反應？",
        options: ["A. 頭痛和疲倦", "B. 煩躁和焦慮", "C. 注意力渙散和記憶力變差", "D. 以上皆是"],
        answer: "D. 以上皆是"
      },
      {
        id: "sci_l3_14", unitKey: "sci_l3", qCategory: "sci_mcq", type: "mcq", typeLabel: "選擇題",
        prompt: "根據「健康飲食金字塔」，哪兩類食物我們應該「吃適量」？",
        options: [
          "A. 蔬菜類及各種新鮮水果類",
          "B. 奶類及代替品、肉魚蛋及代替品",
          "C. 穀物類及油、鹽、糖類製品",
          "D. 水果類及奶類與芝士代替品"
        ],
        answer: "B. 奶類及代替品、肉魚蛋及代替品"
      },
      {
        id: "sci_l3_15", unitKey: "sci_l3", qCategory: "sci_mcq", type: "mcq", typeLabel: "選擇題",
        prompt: "長期欠缺某些營養素（營養失衡），可能對發育造成甚麼影響？",
        options: [
          "A. 令血糖波動變大，容易感到煩躁不安",
          "B. 肌肉或骨骼發育不良，體力變差",
          "C. 刺激皮脂腺過度分泌油脂並堵塞毛孔",
          "D. 令夜間深層睡眠的生長荷爾蒙分泌過多"
        ],
        answer: "B. 肌肉或骨骼發育不良，體力變差"
      },
      {
        id: "sci_l3_16", unitKey: "sci_l3", qCategory: "sci_mcq", type: "mcq", typeLabel: "選擇題",
        prompt: "根據兒童及青少年運動量指引，每天應累積做至少多少分鐘中等或以上強度的運動？",
        options: ["A. 15分鐘", "B. 30分鐘", "C. 60分鐘", "D. 120分鐘"],
        answer: "C. 60分鐘"
      },
      {
        id: "sci_l3_17", unitKey: "sci_l3", qCategory: "sci_mcq", type: "mcq", typeLabel: "選擇題",
        prompt: "進行活動時，「仍能說話但不能唱歌」，這屬於哪一種強度的體能活動？",
        options: ["A. 低強度運動", "B. 中等強度運動", "C. 劇烈強度運動", "D. 超負荷運動"],
        answer: "B. 中等強度運動"
      },
      {
        id: "sci_l3_18", unitKey: "sci_l3", qCategory: "sci_mcq", type: "mcq", typeLabel: "選擇題",
        prompt: "青春期時皮膚容易出現「黑頭」，黑頭是怎樣形成的？",
        options: [
          "A. 皮膚表層過度乾燥引起脫皮，死皮與汗水混合並凝結在毛孔內",
          "B. 空氣中的細菌直接入侵真皮層，導致毛囊微血管破裂形成黑點",
          "C. 過多的油脂與黏附在毛孔上的塵埃混合，堵塞毛孔形成硬粒",
          "D. 長期睡眠不足導致黑色素大量沉澱，在鼻頭表面聚集成小黑斑"
        ],
        answer: "C. 過多的油脂與黏附在毛孔上的塵埃混合，堵塞毛孔形成硬粒"
      },

      // 第3課 分類題 (#19 ~ #21)
      {
        id: "sci_l3_19", unitKey: "sci_l3", qCategory: "sci_classify", type: "classify", typeLabel: "分類題",
        prompt: "請將以下影響發育的因素放入「先天因素」或「後天因素」分類籃：",
        baskets: ["先天因素", "後天因素"],
        items: [
          { label: "1. 遺傳", basket: "先天因素" },
          { label: "2. 睡眠", basket: "後天因素" },
          { label: "3. 飲食", basket: "後天因素" },
          { label: "4. 運動", basket: "後天因素" }
        ],
        answer: "先天因素：1 ｜ 後天因素：2, 3, 4"
      },
      {
        id: "sci_l3_20", unitKey: "sci_l3", qCategory: "sci_classify", type: "classify", typeLabel: "分類題",
        prompt: "請將以下睡前行為放入對應的睡眠質素分類籃：",
        baskets: ["有助提升睡眠質素", "減低睡眠質素"],
        items: [
          { label: "1. 每天定時起牀和睡覺", basket: "有助提升睡眠質素" },
          { label: "2. 睡覺前大量進食", basket: "減低睡眠質素" },
          { label: "3. 睡覺前做劇烈運動", basket: "減低睡眠質素" },
          { label: "4. 睡覺前使用電子科技產品", basket: "減低睡眠質素" }
        ],
        answer: "提升睡眠質素：1 ｜ 減低睡眠質素：2, 3, 4"
      },
      {
        id: "sci_l3_21", unitKey: "sci_l3", qCategory: "sci_classify", type: "classify", typeLabel: "分類題",
        prompt: "請根據「健康飲食金字塔」進食原則，將以下食物放入對應分類籃：",
        baskets: ["吃最多", "多吃些", "吃適量", "吃最少"],
        items: [
          { label: "1. 蔬菜類", basket: "多吃些" },
          { label: "2. 油、鹽、糖類", basket: "吃最少" },
          { label: "3. 穀物類", basket: "吃最多" },
          { label: "4. 奶類及代替品", basket: "吃適量" },
          { label: "5. 水果類", basket: "多吃些" },
          { label: "6. 肉、魚、蛋及代替品", basket: "吃適量" }
        ],
        answer: "吃最多：3 ｜ 多吃些：1, 5 ｜ 吃適量：4, 6 ｜ 吃最少：2"
      },

      // 第3課 簡答題 (#22 ~ #24 — 四個選項字數與句式結構完全平衡對稱，解決圖 2 盲選問題)
      {
        id: "sci_l3_22", unitKey: "sci_l3", qCategory: "sci_short", type: "short_qa", typeLabel: "簡答題",
        prompt: "【簡答題】為甚麼「運動」有助於青少年強健骨骼、減輕壓力和預防肥胖？請分別說明。",
        options: [
          "強健骨骼：刺激骨骼生長促進身高；減輕壓力：穩定情緒並消耗體力助夜間深層睡眠；預防肥胖：刺激肌肉生長減少脂肪積聚。",
          "強健骨骼：減少骨質密度避免增高；減輕壓力：刺激腦部亢奮並縮短夜間深層睡眠；預防肥胖：抑制肌肉生長增加脂肪積聚。",
          "強健骨骼：直接取代鈣質與蛋白質；減輕壓力：消除所有荷爾蒙分泌令情緒變冷漠；預防肥胖：快速蒸發體內水分減輕體重。",
          "強健骨骼：加速軟骨鈣化停止發育；減輕壓力：使血糖大幅波動並轉移學習注意力；預防肥胖：阻塞皮脂腺分泌減少油脂。"
        ],
        answer: "強健骨骼：刺激骨骼生長促進身高；減輕壓力：穩定情緒並消耗體力助夜間深層睡眠；預防肥胖：刺激肌肉生長減少脂肪積聚。"
      },
      {
        id: "sci_l3_23", unitKey: "sci_l3", qCategory: "sci_short", type: "short_qa", typeLabel: "簡答題",
        prompt: "【簡答題】我們怎樣可以在日常生活中爭取機會增加運動量？",
        options: [
          "以走樓梯代替使用扶手電梯；一邊看電視一邊做伸展運動；乘車時提前一個站下車步行到目的地。",
          "以乘搭升降機代替走樓梯節省體力；一邊看電視一邊吃高熱量零食；出門時全程乘搭計程車代步。",
          "每天睡前一小時在床上做劇烈運動；上課期間長時間坐着玩手機遊戲；周末整天留在家中補眠。",
          "平日完全不做任何步行與體能活動；只在每年學校運動會當天跑一次步；飯後立即躺下休息睡覺。"
        ],
        answer: "以走樓梯代替使用扶手電梯；一邊看電視一邊做伸展運動；乘車時提前一個站下車步行到目的地。"
      },
      {
        id: "sci_l3_24", unitKey: "sci_l3", qCategory: "sci_short", type: "short_qa", typeLabel: "簡答題",
        prompt: "【簡答題】青少年使用電子屏幕時間過長會有甚麼潛在風險？我們應該怎樣做？",
        options: [
          "風險：阻礙身心發展，降低專注力、情緒管理能力和現實社交技巧。做法：有效管理時間，在網絡與現實間取得平衡，做負責任的數碼公民。",
          "風險：加快手機電池老化，增加家庭電費開支和損壞電子屏幕。做法：準備多個流動充電器，在睡前關燈環境下繼續使用，做精通科技的達人。",
          "風險：令雙手手指肌肉過度發達，減少睡眠時間但能提升記憶力。做法：完全放棄現實社交活動，將所有溫習與娛樂時間轉移到網上世界進行。",
          "風險：只會造成短暫眼乾而對身心發展、專注力及社交毫無影響。做法：不需要限制每天使用電子屏幕的時間，只需在感到疲倦時滴眼藥水即可。"
        ],
        answer: "風險：阻礙身心發展，降低專注力、情緒管理能力和現實社交技巧。做法：有效管理時間，在網絡與現實間取得平衡，做負責任的數碼公民。"
      },

      // 第3課 看圖填充題 (#25 ~ #27)
      {
        id: "sci_l3_25", unitKey: "sci_l3", qCategory: "sci_img_fill", type: "image_fill", typeLabel: "看圖填充題",
        svgKey: "sci_l3_food_pyramid",
        prompt: "觀察健康飲食金字塔：最底層（吃最多）是______；第二層（多吃些）是______和______；最頂層（吃最少）是______。",
        blanks: ["穀物類", "蔬菜類", "水果類", "油、鹽、糖類"], allowSwapIndices: [1, 2], distractors: ["肉魚蛋類", "奶類", "零食類"]
      },
      {
        id: "sci_l3_26", unitKey: "sci_l3", qCategory: "sci_img_fill", type: "image_fill", typeLabel: "看圖填充題",
        svgKey: "sci_l3_exercise_intensity",
        prompt: "觀察運動強度圖：左圖打乒乓球屬於______強度的運動；右圖跑步時除非停下來呼吸，否則說不完整個句子，屬於______強度的運動。",
        blanks: ["中等", "劇烈"], distractors: ["低", "靜態", "零"]
      },
      {
        id: "sci_l3_27", unitKey: "sci_l3", qCategory: "sci_img_fill", type: "image_fill", typeLabel: "看圖填充題",
        svgKey: "sci_l3_skin_pore",
        prompt: "觀察皮膚毛孔結構圖：青春期荷爾蒙分泌變化會刺激______過度分泌油脂，堵塞毛孔形成______；若受細菌感染，便會導致皮膚局部______，形成暗瘡。",
        blanks: ["皮脂腺", "黑頭", "發炎"], distractors: ["汗腺", "白頭", "結冰"]
      },

      // 第3課 情境題 (#28 ~ #30 — 四個選項字數與句式結構完全平衡對稱)
      {
        id: "sci_l3_28", unitKey: "sci_l3", qCategory: "sci_scenario", type: "short_qa", typeLabel: "情境題",
        prompt: "【情境題】新聞報道一名 16 歲少年，按父母遺傳預測身高應達 177 厘米，但他因升學壓力大，長期每日只睡 4 小時，身高僅 156 厘米。請分析他長不高的原因。",
        options: [
          "學習壓力令他長期焦慮、睡眠不足；而有助生長的荷爾蒙主要在深層睡眠中分泌，睡眠不足導致生長荷爾蒙分泌減少，干擾正常發育。",
          "因為他完全沒有遺傳到父母的高大基因，身高純粹由先天因素決定；後天的睡眠時間長短與升學壓力高低，對生長荷爾蒙分泌毫無影響。",
          "因為他每天睡四小時已經太多了，青少年在青春期應該減少睡眠以增加溫習時間；長不高的原因是他沒有在睡前大量進食高熱量的宵夜。",
          "因為長時間思考功課會直接消耗骨骼內的鈣質與水分，令脊骨逐漸縮短；只要他完全停止讀書並每天在床上躺着不動，身高就會立即恢復。"
        ],
        answer: "學習壓力令他長期焦慮、睡眠不足；而有助生長的荷爾蒙主要在深層睡眠中分泌，睡眠不足導致生長荷爾蒙分泌減少，干擾正常發育。"
      },
      {
        id: "sci_l3_29", unitKey: "sci_l3", qCategory: "sci_scenario", type: "short_qa", typeLabel: "情境題",
        prompt: "【情境題】小明在發育時期非常喜歡吃薯條、炸雞、冬甩和汽水等垃圾食物，很少吃正餐。如果他長期保持這種飲食習慣，會引致甚麼問題？為甚麼？",
        options: [
          "(1)營養失衡：欠缺營養素致肌肉骨骼發育不良、體力變差；(2)肥胖：高糖高脂致脂肪過多妨礙發育；(3)情緒不穩：血糖波動大易煩躁難集中。",
          "(1)發育加快：高熱量食物能刺激骨骼迅速增長、體力變強；(2)消瘦：高糖高脂會加速新陳代謝消耗脂肪；(3)情緒平穩：血糖升高令人心情愉快。",
          "(1)營養全面：薯條與炸雞已包含人體所需的所有維生素；(2)強壯：高鹽高糖能直接轉化為堅實肌肉；(3)睡眠改善：汽水能幫助夜間進入深層睡眠。",
          "(1)皮膚變白：高糖飲食能抑制皮脂腺分泌油脂及消除暗瘡；(2)增高：多吃油炸食物能促進生長荷爾蒙分泌；(3)記憶提升：高鹽分能增強腦部專注力。"
        ],
        answer: "(1)營養失衡：欠缺營養素致肌肉骨骼發育不良、體力變差；(2)肥胖：高糖高脂致脂肪過多妨礙發育；(3)情緒不穩：血糖波動大易煩躁難集中。"
      },
      {
        id: "sci_l3_30", unitKey: "sci_l3", qCategory: "sci_scenario", type: "short_qa", typeLabel: "情境題",
        prompt: "【情境題】美美臉上長了幾顆暗瘡，她常常用手擠壓暗瘡、用頭髮遮蓋，並且每天洗臉五、六次。請指出她處理暗瘡的錯誤之處及後果，並提供正確建議。",
        options: [
          "錯誤：(1)擠壓或用頭髮遮蓋會造成更嚴重發炎甚至留疤；(2)過度清潔令皮膚太乾反而刺激更多油脂分泌。建議：適度清潔切勿擠壓，嚴重時求醫。",
          "錯誤：(1)每天洗臉五六次太少，未能徹底洗走臉上油脂；(2)沒有塗抹厚重的油性化妝品遮蓋紅腫暗瘡。建議：改用滾燙熱水及強力肥皂每小時洗臉。",
          "錯誤：(1)擠壓暗瘡時力度不足，未能把毛囊連根拔起；(2)沒有在傷口塗上刺激性酒精消毒殺菌。建議：使用未經消毒的針頭刺穿暗瘡並貼上膠布密封。",
          "錯誤：(1)留長頭髮會吸收臉部營養令暗瘡難以癒合；(2)洗臉時使用了溫和洗面膏而非磨砂膏。建議：完全停止洗臉一個月，讓油脂自然結痂脫落即可。"
        ],
        answer: "錯誤：(1)擠壓或用頭髮遮蓋會造成更嚴重發炎甚至留疤；(2)過度清潔令皮膚太乾反而刺激更多油脂分泌。建議：適度清潔切勿擠壓，嚴重時求醫。"
      }
    ]
  };
})();
/* ============================================================================
 * 科學科獨立題庫 — 下半部 Part 3B (questions/questions-science.js - v6.7)
 * 內含：第8課《觀測天氣》(30題) + 第9課《探索地貌》(30題)
 * 升級：全面平衡所有簡答題、情境題與選擇題的 4 個選項長度與句式結構，杜絕盲選
 * 請直接緊接貼在 v6.7 Part 3A 代碼的最下方！
 * ============================================================================ */
(function() {
  if (!window.Aetheria || !window.Aetheria.QuestionBank || !window.Aetheria.QuestionBank.Science) return;

  const MORE_SCI_QUESTIONS = [
    // ==================== 第 8 課：觀測天氣 (30題) ====================
    { id: "sci_l8_01", unitKey: "sci_l8", qCategory: "sci_fill", type: "fill_blank", typeLabel: "填充題", prompt: "我們可以運用天氣數據來描述天氣情況，例如氣溫、______、風向、______和降雨量。", blanks: ["風力", "相對濕度"], allowSwapIndices: [0, 1], distractors: ["海拔", "氣壓", "日照"] },
    { id: "sci_l8_02", unitKey: "sci_l8", qCategory: "sci_fill", type: "fill_blank", typeLabel: "填充題", prompt: "香港天文台運用百葉箱內的溫度計來測量______和______。", blanks: ["氣溫", "相對濕度"], allowSwapIndices: [0, 1], distractors: ["風速", "降雨量", "風向"] },
    { id: "sci_l8_03", unitKey: "sci_l8", qCategory: "sci_fill", type: "fill_blank", typeLabel: "填充題", prompt: "風向是指風______的方向。例如：從東方吹向西方的風，稱為「______」。", blanks: ["吹來", "東風"], distractors: ["吹去", "西風", "北風"] },
    { id: "sci_l8_04", unitKey: "sci_l8", qCategory: "sci_fill", type: "fill_blank", typeLabel: "填充題", prompt: "降雨量是指雨水在地面上積起來的______，通常以毫米為單位。", blanks: ["高度"], distractors: ["重量", "面積", "速度"] },
    { id: "sci_l8_05", unitKey: "sci_l8", qCategory: "sci_fill", type: "fill_blank", typeLabel: "填充題", prompt: "______是指大氣中的水蒸氣凝結後，從雲層降落到地面的現象，它是水循環的一個階段。", blanks: ["降水"], distractors: ["蒸發", "風化", "沉積"] },
    { id: "sci_l8_06", unitKey: "sci_l8", qCategory: "sci_fill", type: "fill_blank", typeLabel: "填充題", prompt: "太陽照射地面，水蒸發成水蒸氣上升，在高空遇冷形成______或______，聚集成雲。", blanks: ["水點", "冰晶"], allowSwapIndices: [0, 1], distractors: ["煙霧", "塵埃", "空氣"] },
    { id: "sci_l8_07", unitKey: "sci_l8", qCategory: "sci_fill", type: "fill_blank", typeLabel: "填充題", prompt: "當水點落下，如果接近地面的溫度______於 0°C，水點沒有結冰，就會形成雨。", blanks: ["高"], distractors: ["低", "等", "零"] },
    { id: "sci_l8_08", unitKey: "sci_l8", qCategory: "sci_fill", type: "fill_blank", typeLabel: "填充題", prompt: "當冰晶落下，如果接近地面的溫度______於 0°C，冰晶沒有融化，就會形成雪。", blanks: ["低"], distractors: ["高", "等", "熱"] },
    { id: "sci_l8_09", unitKey: "sci_l8", qCategory: "sci_fill", type: "fill_blank", typeLabel: "填充題", prompt: "當雲中出現強烈的______氣流時，冰粒跟隨氣流上下翻滾並不斷增大，最終落下形成______。", blanks: ["上升", "雹"], distractors: ["下降", "霧", "霜"] },
    { id: "sci_l8_10", unitKey: "sci_l8", qCategory: "sci_fill", type: "fill_blank", typeLabel: "填充題", prompt: "溫暖和潮濕的空氣在低空遇冷時，水蒸氣凝結成微細的______，飄浮在空中，那就是______。", blanks: ["水點", "霧"], distractors: ["冰粒", "雹", "雪"] },

    // 第8課 選擇題 (#11 ~ #18 — 選項長度對稱一致)
    {
      id: "sci_l8_11", unitKey: "sci_l8", qCategory: "sci_mcq", type: "mcq", typeLabel: "選擇題",
      prompt: "香港天文台使用「翻斗式雨量器」來測量哪一項天氣數據？",
      options: ["A. 相對濕度", "B. 風速", "C. 降雨量", "D. 氣溫"],
      answer: "C. 降雨量"
    },
    {
      id: "sci_l8_12", unitKey: "sci_l8", qCategory: "sci_mcq", type: "mcq", typeLabel: "選擇題",
      prompt: "使用溫度計測量氣溫時，應該把溫度計放置在甚麼地方？",
      options: [
        "A. 陽光直接照射而且沒有遮擋的空曠地面",
        "B. 陽光照射不到而且空氣流通的地方",
        "C. 門窗緊閉而且空氣不流通的密閉房間內",
        "D. 靠近冷氣機出風口或發熱電器的位置"
      ],
      answer: "B. 陽光照射不到而且空氣流通的地方"
    },
    {
      id: "sci_l8_13", unitKey: "sci_l8", qCategory: "sci_mcq", type: "mcq", typeLabel: "選擇題",
      prompt: "閱讀溫度計的度數時，視線應該怎樣？",
      options: [
        "A. 從上往下俯視溫度計頂端的刻度線位置",
        "B. 從下往上仰視溫度計底部的液體位置",
        "C. 從水平角度觀察紅色液體頂部的位置",
        "D. 手握玻璃泡並從側面斜視液體的位置"
      ],
      answer: "C. 從水平角度觀察紅色液體頂部的位置"
    },
    {
      id: "sci_l8_14", unitKey: "sci_l8", qCategory: "sci_mcq", type: "mcq", typeLabel: "選擇題",
      prompt: "在製作和進行模擬「霜」的形成實驗時，下列哪一項安全提示是正確的？",
      options: [
        "A. 可以直接用雙手長時間緊握冰塊和金屬杯",
        "B. 備用的溫度計應該垂直立在實驗桌面上",
        "C. 避免直接接觸冰塊和金屬杯，以免凍傷",
        "D. 實驗桌面被冰水濺濕了也不需要抹乾理會"
      ],
      answer: "C. 避免直接接觸冰塊和金屬杯，以免凍傷"
    },
    {
      id: "sci_l8_15", unitKey: "sci_l8", qCategory: "sci_mcq", type: "mcq", typeLabel: "選擇題",
      prompt: "雨、雪、雹三種降水現象中，哪一種在香港最罕見？",
      options: ["A. 雨", "B. 雪", "C. 雹", "D. 一樣常見"],
      answer: "B. 雪"
    },
    {
      id: "sci_l8_16", unitKey: "sci_l8", qCategory: "sci_mcq", type: "mcq", typeLabel: "選擇題",
      prompt: "承上題，為甚麼「雪」這種降水現象在香港最罕見？",
      options: [
        "A. 因為香港天空終年沒有高雲，無法凝結任何水點與冰晶",
        "B. 因為香港四面環海但空氣太乾燥，大氣中缺乏水蒸氣",
        "C. 因為香港屬於亞熱帶氣候，冬季氣溫甚少降至 0°C 以下",
        "D. 因為香港地勢平坦而且風力太強，冰晶在半空已被吹散"
      ],
      answer: "C. 因為香港屬於亞熱帶氣候，冬季氣溫甚少降至 0°C 以下"
    },
    {
      id: "sci_l8_17", unitKey: "sci_l8", qCategory: "sci_mcq", type: "mcq", typeLabel: "選擇題",
      prompt: "下列哪一項關於「霜」的描述是正確的？",
      options: [
        "A. 接近地面的氣溫在 0°C 以上時才會凝結形成",
        "B. 是水蒸氣在極冷的物體表面直接形成的冰晶",
        "C. 屬於高空雲層降落到地面的一種液態天氣現象",
        "D. 是飄浮在半空中的微細水點，會模糊遠處視線"
      ],
      answer: "B. 是水蒸氣在極冷的物體表面直接形成的冰晶"
    },
    {
      id: "sci_l8_18", unitKey: "sci_l8", qCategory: "sci_mcq", type: "mcq", typeLabel: "選擇題",
      prompt: "科學家在雲中撒播化學物質以進行「人工增雨」，其科學原理是甚麼？",
      options: [
        "A. 使雲層溫度降至 0°C 以下，促成降雪",
        "B. 製造強烈的上升氣流，把雲層吹散",
        "C. 使雲中的水滴迅速聚集，促成降雨",
        "D. 把空氣中的氧氣變成水蒸氣，增加濕度"
      ],
      answer: "C. 使雲中的水滴迅速聚集，促成降雨"
    },

    // 第8課 分類題 (#19 ~ #21)
    {
      id: "sci_l8_19", unitKey: "sci_l8", qCategory: "sci_classify", type: "classify", typeLabel: "分類題",
      prompt: "請將以下測量儀器放入其測量的天氣數據分類籃：",
      baskets: ["A. 降雨量", "B. 氣溫", "C. 風向和風速"],
      items: [
        { label: "1. 溫度計", basket: "B. 氣溫" },
        { label: "2. 風杯式風速表/風向儀", basket: "C. 風向和風速" },
        { label: "3. 雨量計", basket: "A. 降雨量" }
      ],
      answer: "1 配 B (氣溫) ｜ 2 配 C (風向和風速) ｜ 3 配 A (降雨量)"
    },
    {
      id: "sci_l8_20", unitKey: "sci_l8", qCategory: "sci_classify", type: "classify", typeLabel: "分類題",
      prompt: "請將以下天氣現象按水點/冰晶的狀態放入對應分類籃：",
      baskets: ["液態（水點）", "固態（冰晶/冰粒）"],
      items: [
        { label: "1. 雨", basket: "液態（水點）" },
        { label: "2. 雪", basket: "固態（冰晶/冰粒）" },
        { label: "3. 雹", basket: "固態（冰晶/冰粒）" },
        { label: "4. 霧", basket: "液態（水點）" },
        { label: "5. 霜", basket: "固態（冰晶/冰粒）" }
      ],
      answer: "液態（水點）：1, 4 ｜ 固態（冰晶/冰粒）：2, 3, 5"
    },
    {
      id: "sci_l8_21", unitKey: "sci_l8", qCategory: "sci_classify", type: "classify", typeLabel: "分類題",
      prompt: "請將以下天氣現象放入對應的形成位置分類籃：",
      baskets: ["從高空雲層降落(降水)", "在接近地面/低空形成"],
      items: [
        { label: "1. 雨", basket: "從高空雲層降落(降水)" },
        { label: "2. 霧", basket: "在接近地面/低空形成" },
        { label: "3. 雪", basket: "從高空雲層降落(降水)" },
        { label: "4. 霜", basket: "在接近地面/低空形成" },
        { label: "5. 雹", basket: "從高空雲層降落(降水)" }
      ],
      answer: "高空雲層降落(降水)：1, 3, 5 ｜ 接近地面/低空形成：2, 4"
    },

    // 第8課 簡答題 (#22 ~ #24 — 四個選項字數與句式結構完全平衡對稱)
    {
      id: "sci_l8_22", unitKey: "sci_l8", qCategory: "sci_short", type: "short_qa", typeLabel: "簡答題",
      prompt: "【簡答題】請描述「霧」和「霜」在外觀上有甚麼特徵。",
      options: [
        "霧：白色或灰白色的霧氣，像煙霧一樣模糊視線；霜：白色、細小的冰晶，看起來像雪或糖霜。",
        "霧：透明堅硬的大塊冰粒，從高空雲層急速落下；霜：飄浮在半空中的灰黑色煙霧，會遮擋陽光。",
        "霧：附在樹葉表面的固態白色冰塊，觸摸時極冷；霜：飄浮在海面與低空的液態水滴，會模糊視線。",
        "霧：高空落下的白色雪花，堆積在地面形成積雪；霜：受熱蒸發的透明水蒸氣，肉眼完全看不見。"
      ],
      answer: "霧：白色或灰白色的霧氣，像煙霧一樣模糊視線；霜：白色、細小的冰晶，看起來像雪或糖霜。"
    },
    {
      id: "sci_l8_23", unitKey: "sci_l8", qCategory: "sci_short", type: "short_qa", typeLabel: "簡答題",
      prompt: "【簡答題】請按次序寫出「雹」的四個形成步驟。",
      options: [
        "1.水蒸氣被強烈上升氣流帶到高空；2.遇冷形成冰粒；3.冰粒隨劇烈氣流上下翻滾吸附水分不斷增大；4.重量超過上升氣流支撐力落下成雹。",
        "1.雨水先降落到寒冷地面；2.在地面結成冰塊；3.冰塊被強風重新吹上高空雲層；4.在雲層受熱融化後再降落地面形成雹。",
        "1.水蒸氣在低空遇冷；2.在極冷的樹葉表面結成細小冰晶；3.受正午陽光照射逐漸融化；4.匯聚成水流落到地面形成雹。",
        "1.高空雲層溫度升至零度以上；2.冰晶在雲中完全融化成水點；3.水點隨下降氣流平緩飄落；4.在半空蒸發變小落下成雹。"
      ],
      answer: "1.水蒸氣被強烈上升氣流帶到高空；2.遇冷形成冰粒；3.冰粒隨劇烈氣流上下翻滾吸附水分不斷增大；4.重量超過上升氣流支撐力落下成雹。"
    },
    {
      id: "sci_l8_24", unitKey: "sci_l8", qCategory: "sci_short", type: "short_qa", typeLabel: "簡答題",
      prompt: "【簡答題】「人工增雨」對人類有甚麼幫助？",
      options: [
        "能有效解決食水不足的問題，並減輕乾旱等天氣災害。",
        "能有效製造強烈的熱帶氣旋，並增加冰雹等天氣現象。",
        "能使冬季的地面氣溫立即降至零度以下，促成人工降雪。",
        "能把海洋中的鹹水直接轉化為淡水，完全不需經過雲層。"
      ],
      answer: "能有效解決食水不足的問題，並減輕乾旱等天氣災害。"
    },

    // 第8課 看圖填充題 (#25 ~ #27)
    {
      id: "sci_l8_25", unitKey: "sci_l8", qCategory: "sci_img_fill", type: "image_fill", typeLabel: "看圖填充題",
      svgKey: "sci_l8_wind_dir",
      prompt: "觀察方向標示圖（綠色箭頭從「東」指向「西」）：圖中的風從東方吹向西方，這股風的風向稱為______。",
      blanks: ["東風"], distractors: ["西風", "南風", "北風"]
    },
    {
      id: "sci_l8_26", unitKey: "sci_l8", qCategory: "sci_img_fill", type: "image_fill", typeLabel: "看圖填充題",
      svgKey: "sci_l8_hko_instruments",
      prompt: "觀察三個香港天文台的儀器：儀器(1)百葉箱用來測量氣溫和______；儀器(2)用來測量風向和______；儀器(3)翻斗式雨量器用來測量______。",
      blanks: ["相對濕度", "風速", "降雨量"], distractors: ["氣壓", "紫外線", "海拔"]
    },
    {
      id: "sci_l8_27", unitKey: "sci_l8", qCategory: "sci_img_fill", type: "image_fill", typeLabel: "看圖填充題",
      svgKey: "sci_l8_fog_formation",
      prompt: "觀察圖中的天氣現象：圖中顯示的是______的形成過程，當溫暖和潮濕的空氣在低空遇______時，水蒸氣凝結成微細的水點飄浮在空中。",
      blanks: ["霧", "冷"], distractors: ["霜", "熱", "雹"]
    },

    // 第8課 情境題 (#28 ~ #30 — 四個選項字數與句式結構完全平衡對稱)
    {
      id: "sci_l8_28", unitKey: "sci_l8", qCategory: "sci_scenario", type: "short_qa", typeLabel: "情境題",
      prompt: "【情境題】假設今天天氣數據：最高氣溫32°C、最低28°C、風向西南、風力5級、相對濕度80-95%、降雨量5-10毫米（多雲有驟雨）。請以天氣報告員身分描述今天天氣。",
      options: [
        "今天多雲，有驟雨；天氣炎熱，氣溫介乎 28°C 至 32°C；吹 5 級清勁西南風；天氣潮濕，相對濕度介乎 80% 至 95%，降雨量為 5 至 10 毫米。",
        "今天天晴，無驟雨；天氣嚴寒，氣溫降至 0°C 以下；吹 1 級微弱東北風；空氣極為乾燥，相對濕度介乎 20% 至 35%，全天沒有錄得任何降雨量。",
        "今天有雪，夾雜冰雹；天氣酷熱，氣溫高達 38°C 至 45°C；吹 10 級強烈西北颶風；天氣乾燥，相對濕度只有 10% 至 20%，降雨量為 500 毫米。",
        "今天有霧，能見度低；天氣清涼，氣溫介乎 12°C 至 16°C；吹 2 級輕微東南風；空氣頗為乾燥，相對濕度介乎 30% 至 45%，降雨量為 0 毫米。"
      ],
      answer: "今天多雲，有驟雨；天氣炎熱，氣溫介乎 28°C 至 32°C；吹 5 級清勁西南風；天氣潮濕，相對濕度介乎 80% 至 95%，降雨量為 5 至 10 毫米。"
    },
    {
      id: "sci_l8_29", unitKey: "sci_l8", qCategory: "sci_scenario", type: "short_qa", typeLabel: "情境題",
      prompt: "【情境題】冬季寒冷清晨，大帽山山頂氣溫降至 0°C 以下，遠足人士發現樹葉表面結了一層薄薄的白色冰晶，有人大喊：「香港下雪了！」你認同嗎？請根據科學原理解釋。",
      options: [
        "不認同，那是「霜」而不是「雪」。雪是雲中冰晶從高空降落的降水現象；而樹葉上的冰晶是近地面氣溫在 0°C 以下，空氣中水蒸氣在極冷樹葉表面直接形成的「霜」。",
        "認同，那是真正的「雪」。因為只要大帽山山頂氣溫降至 0°C 以下，任何出現在樹葉和草地表面的白色細小冰晶，都必然是從高空雲層直接降落到地面的「雪」。",
        "不認同，那是「雹」而不是「雪」。因為冬季大帽山山頂出現強烈的上升氣流，把樹葉表面的水滴帶到高空反覆翻滾結成冰粒，再降落回樹葉表面形成「雹」。",
        "不認同，那是「霧」而不是「雪」。因為溫暖潮濕的空氣吹過大帽山山頂時，水蒸氣在低空凝結成液態微細水點並附在樹葉上，看起來像白色冰晶但其實是「霧」。"
      ],
      answer: "不認同，那是「霜」而不是「雪」。雪是雲中冰晶從高空降落的降水現象；而樹葉上的冰晶是近地面氣溫在 0°C 以下，空氣中水蒸氣在極冷樹葉表面直接形成的「霜」。"
    },
    {
      id: "sci_l8_30", unitKey: "sci_l8", qCategory: "sci_scenario", type: "short_qa", typeLabel: "情境題",
      prompt: "【情境題】科學課上，同學們分組製作了自製的「風向儀」和「雨量計」去操場測量天氣。請說明在製作時有甚麼安全注意事項，以及如何讀取「雨量計」的數據。",
      options: [
        "安全注意事項：製作時要小心使用利器。讀取雨量計數據方法：觀察並量度雨量計所收集的雨水高度，該高度就是降雨量。",
        "安全注意事項：直接徒手折斷塑膠瓶與鐵線。讀取雨量計數據方法：使用電子磅量度雨量計內雨水的總重量，該重量就是降雨量。",
        "安全注意事項：在雷暴警告下舉高金屬風向儀。讀取雨量計數據方法：使用溫度計測量雨量計內雨水的溫度，該度數就是降雨量。",
        "安全注意事項：製作過程完全不需注意工具安全。讀取雨量計數據方法：用肉眼估計雨量計內雨水的顏色深淺與面積，就是降雨量。"
      ],
      answer: "安全注意事項：製作時要小心使用利器。讀取雨量計數據方法：觀察並量度雨量計所收集的雨水高度，該高度就是降雨量。"
    },

    // ==================== 第 9 課：探索地貌 (30題) ====================
    { id: "sci_l9_01", unitKey: "sci_l9", qCategory: "sci_fill", type: "fill_blank", typeLabel: "填充題", prompt: "凹凸不平的______構成了不同的地貌種類，例如山脈、高原、平原、河谷和盆地。", blanks: ["地殼"], distractors: ["雲層", "大氣", "地核"] },
    { id: "sci_l9_02", unitKey: "sci_l9", qCategory: "sci_fill", type: "fill_blank", typeLabel: "填充題", prompt: "由山坡陡峭、連綿的高山組成，地勢高的地貌稱為______（例如喜馬拉雅山脈）。", blanks: ["山脈"], distractors: ["平原", "盆地", "河谷"] },
    { id: "sci_l9_03", unitKey: "sci_l9", qCategory: "sci_fill", type: "fill_blank", typeLabel: "填充題", prompt: "面積廣闊、平坦的低地稱為______（例如亞馬遜平原）。", blanks: ["平原"], distractors: ["高原", "山脈", "裂谷"] },
    { id: "sci_l9_04", unitKey: "sci_l9", qCategory: "sci_fill", type: "fill_blank", typeLabel: "填充題", prompt: "四周由高地圍繞，中央土地低平的地貌稱為______（例如四川盆地）。", blanks: ["盆地"], distractors: ["高原", "山脈", "海溝"] },
    { id: "sci_l9_05", unitKey: "sci_l9", qCategory: "sci_fill", type: "fill_blank", typeLabel: "填充題", prompt: "兩側地勢較高，河水流經中央低地的地貌稱為______（例如尼羅河谷）。", blanks: ["河谷"], distractors: ["盆地", "高原", "沙漠"] },
    { id: "sci_l9_06", unitKey: "sci_l9", qCategory: "sci_fill", type: "fill_blank", typeLabel: "填充題", prompt: "地貌受地球______力量和地球______力量影響，會逐漸發生變化。", blanks: ["內部", "外部"], allowSwapIndices: [0, 1], distractors: ["月球", "太陽", "人造"] },
    { id: "sci_l9_07", unitKey: "sci_l9", qCategory: "sci_fill", type: "fill_blank", typeLabel: "填充題", prompt: "地殼下流動的______帶動板塊移動，令板塊與板塊相撞或分離。", blanks: ["岩漿"], distractors: ["海水", "石油", "地下水"] },
    { id: "sci_l9_08", unitKey: "sci_l9", qCategory: "sci_fill", type: "fill_blank", typeLabel: "填充題", prompt: "兩塊板塊相撞，互相擠壓，地殼會______，形成山脈；兩塊板塊分離，地殼會______，形成裂谷。", blanks: ["褶曲", "破裂"], distractors: ["融化", "蒸發", "結冰"] },
    { id: "sci_l9_09", unitKey: "sci_l9", qCategory: "sci_fill", type: "fill_blank", typeLabel: "填充題", prompt: "______是存留在地殼岩石和冰層中的一些古生物的______（例如魚、菊石、植物等）。", blanks: ["化石", "遺骸"], distractors: ["礦物", "寶石", "金屬"] },
    { id: "sci_l9_10", unitKey: "sci_l9", qCategory: "sci_fill", type: "fill_blank", typeLabel: "填充題", prompt: "河水______岩石和土壤，漸漸形成河谷；海浪令泥沙______，漸漸形成沙灘。", blanks: ["侵蝕", "堆積"], distractors: ["擠壓", "褶曲", "凝固"] },

    // 第9課 選擇題 (#11 ~ #18 — 選項長度對稱一致)
    {
      id: "sci_l9_11", unitKey: "sci_l9", qCategory: "sci_mcq", type: "mcq", typeLabel: "選擇題",
      prompt: "平均高度在 4000 米以上的「青藏高原」，具有甚麼地貌特點？",
      options: [
        "A. 四周由高地圍繞，中央低平",
        "B. 面積廣闊、平坦的高地",
        "C. 面積廣闊、平坦的低地",
        "D. 兩側地勢高，中央有河流"
      ],
      answer: "B. 面積廣闊、平坦的高地"
    },
    {
      id: "sci_l9_12", unitKey: "sci_l9", qCategory: "sci_mcq", type: "mcq", typeLabel: "選擇題",
      prompt: "海底地形也是起伏不平的，其中狹長凹陷的海底最深處稱為甚麼？",
      options: ["A. 海盆", "B. 海溝", "C. 海嶺", "D. 海谷"],
      answer: "B. 海溝"
    },
    {
      id: "sci_l9_13", unitKey: "sci_l9", qCategory: "sci_mcq", type: "mcq", typeLabel: "選擇題",
      prompt: "觀察「主要板塊分佈圖」，像喜馬拉雅山脈、洛磯山脈和紅海裂谷這些地貌，通常位於地殼的甚麼位置？",
      options: [
        "A. 板塊的正中央",
        "B. 接近板塊邊界",
        "C. 遠離板塊的地方",
        "D. 只出現在赤道上"
      ],
      answer: "B. 接近板塊邊界"
    },
    {
      id: "sci_l9_14", unitKey: "sci_l9", qCategory: "sci_mcq", type: "mcq", typeLabel: "選擇題",
      prompt: "當兩塊板塊互相分離時，岩漿會從板塊之間湧上地面形成新的地殼，這可能會形成下列哪種地貌？",
      options: ["A. 紅海裂谷", "B. 喜馬拉雅山脈", "C. 四川盆地", "D. 亞馬遜平原"],
      answer: "A. 紅海裂谷"
    },
    {
      id: "sci_l9_15", unitKey: "sci_l9", qCategory: "sci_mcq", type: "mcq", typeLabel: "選擇題",
      prompt: "下列哪一項不屬於化石？",
      options: [
        "A. 地殼岩石中的菊石遺骸",
        "B. 冰層中的古生物遺骸",
        "C. 古生物留下的足印痕跡",
        "D. 火山爆發剛凝固的岩漿"
      ],
      answer: "D. 火山爆發剛凝固的岩漿"
    },
    {
      id: "sci_l9_16", unitKey: "sci_l9", qCategory: "sci_mcq", type: "mcq", typeLabel: "選擇題",
      prompt: "「沙漠」和「風蝕地貌」的形成，分別是風的甚麼作用造成的？",
      options: [
        "A. 沙漠是侵蝕作用；風蝕地貌也是侵蝕作用",
        "B. 沙漠是堆積作用；風蝕地貌也是堆積作用",
        "C. 沙漠是堆積作用；風蝕地貌是侵蝕作用",
        "D. 沙漠是侵蝕作用；風蝕地貌是堆積作用"
      ],
      answer: "C. 沙漠是堆積作用；風蝕地貌是侵蝕作用"
    },
    {
      id: "sci_l9_17", unitKey: "sci_l9", qCategory: "sci_mcq", type: "mcq", typeLabel: "選擇題",
      prompt: "香港的「林村河谷」和「西貢扭曲的火山岩柱」，分別主要受甚麼力量影響而形成？",
      options: [
        "A. 林村河谷：內部力量（板塊相撞）；西貢火山岩柱：內部力量（地殼運動擠壓）",
        "B. 林村河谷：外部力量（河水侵蝕）；西貢火山岩柱：外部力量（海浪拍打侵蝕）",
        "C. 林村河谷：外部力量（河水侵蝕）；西貢火山岩柱：內部力量（地殼運動擠壓）",
        "D. 林村河谷：內部力量（板塊分離）；西貢火山岩柱：外部力量（強風吹襲堆積）"
      ],
      answer: "C. 林村河谷：外部力量（河水侵蝕）；西貢火山岩柱：內部力量（地殼運動擠壓）"
    },
    {
      id: "sci_l9_18", unitKey: "sci_l9", qCategory: "sci_mcq", type: "mcq", typeLabel: "選擇題",
      prompt: "我國科學家劉東生考察黃土高原時，發現黃土和紅土層中分別有不同習性的蝸牛化石，這證明了甚麼？",
      options: [
        "A. 證明古代的蝸牛只喜歡棲息在乾冷的沙漠岩石表面",
        "B. 證明黃土高原在數百萬年前曾經是一片深邃的海洋",
        "C. 這些土壤和化石是證明過去氣候變化的「記錄本」",
        "D. 證明地球的地殼板塊自古以來從來沒有發生過移動"
      ],
      answer: "C. 這些土壤和化石是證明過去氣候變化的「記錄本」"
    },

    // 第9課 分類題 (#19 ~ #21)
    {
      id: "sci_l9_19", unitKey: "sci_l9", qCategory: "sci_classify", type: "classify", typeLabel: "分類題",
      prompt: "請將以下著名地理景觀放入其所屬的「地貌種類」分類籃：",
      baskets: ["A. 山脈", "B. 高原", "C. 平原", "D. 盆地", "E. 河谷"],
      items: [
        { label: "1. 亞馬遜", basket: "C. 平原" },
        { label: "2. 青藏", basket: "B. 高原" },
        { label: "3. 四川", basket: "D. 盆地" },
        { label: "4. 喜馬拉雅", basket: "A. 山脈" },
        { label: "5. 尼羅", basket: "E. 河谷" }
      ],
      answer: "1配C(亞馬遜平原)｜2配B(青藏高原)｜3配D(四川盆地)｜4配A(喜馬拉雅山脈)｜5配E(尼羅河谷)"
    },
    {
      id: "sci_l9_20", unitKey: "sci_l9", qCategory: "sci_classify", type: "classify", typeLabel: "分類題",
      prompt: "請將以下地貌成因放入「地球內部力量」或「地球外部力量」分類籃：",
      baskets: ["地球內部力量(地殼運動)", "地球外部力量(水和風)"],
      items: [
        { label: "1. 板塊相撞形成山脈", basket: "地球內部力量(地殼運動)" },
        { label: "2. 河水侵蝕形成河谷", basket: "地球外部力量(水和風)" },
        { label: "3. 板塊分離形成裂谷", basket: "地球內部力量(地殼運動)" },
        { label: "4. 海浪令泥沙堆積形成沙灘", basket: "地球外部力量(水和風)" },
        { label: "5. 風堆積沙土形成沙漠", basket: "地球外部力量(水和風)" }
      ],
      answer: "地球內部力量：1, 3 ｜ 地球外部力量：2, 4, 5"
    },
    {
      id: "sci_l9_21", unitKey: "sci_l9", qCategory: "sci_classify", type: "classify", typeLabel: "分類題",
      prompt: "請將以下由水和風造成的地貌變化，放入「侵蝕作用」或「堆積作用」分類籃：",
      baskets: ["侵蝕作用", "堆積作用"],
      items: [
        { label: "1. 河水沖刷岩石和土壤形成河谷", basket: "侵蝕作用" },
        { label: "2. 海浪把泥沙帶到岸邊形成沙灘", basket: "堆積作用" },
        { label: "3. 風使岩石凹凸不平形成奇形岩柱", basket: "侵蝕作用" },
        { label: "4. 風持續把沙土吹到一處形成沙漠", basket: "堆積作用" }
      ],
      answer: "侵蝕作用：1, 3 ｜ 堆積作用：2, 4"
    },

    // 第9課 簡答題 (#22 ~ #24 — 四個選項字數與句式結構完全平衡對稱)
    {
      id: "sci_l9_22", unitKey: "sci_l9", qCategory: "sci_short", type: "short_qa", typeLabel: "簡答題",
      prompt: "【簡答題】為甚麼科學家可以從化石來推斷地貌的變化？",
      options: [
        "因為地殼運動會改變岩層和化石的位置，所以從化石的位置和種類，有助推斷該地區地貌的變化。",
        "因為遠古生物化石會隨着四季氣候而自行移動位置，所以從化石的新舊程度，可預測明天的天氣變化。",
        "因為所有古生物化石都只會在炎熱乾燥的沙漠表面形成，所以只要發現化石，就代表該處從未有過海洋。",
        "因為風化和侵蝕作用會把現代生物直接變成化石，所以從化石的顏色深淺，可推斷地底岩漿流動的速度。"
      ],
      answer: "因為地殼運動會改變岩層和化石的位置，所以從化石的位置和種類，有助推斷該地區地貌的變化。"
    },
    {
      id: "sci_l9_23", unitKey: "sci_l9", qCategory: "sci_short", type: "short_qa", typeLabel: "簡答題",
      prompt: "【簡答題】請解釋「風蝕地貌」（奇形怪狀的岩柱或石塔）和「沙漠」分別是怎樣形成的。",
      options: [
        "風蝕地貌：風長時間侵蝕岩石，使岩石變得凹凸不平形成奇形岩柱或石塔；沙漠：風持續把沙土吹到一個地方逐漸堆積起來形成沙漠。",
        "風蝕地貌：海浪長時間拍打岸邊泥沙，使泥沙逐漸堆積形成奇形岩柱；沙漠：河水持續沖刷內陸高山岩石，使岩石碎裂崩塌形成沙漠。",
        "風蝕地貌：地殼板塊互相碰撞擠壓，使海底岩層彎曲隆起形成石塔；沙漠：火山爆發噴出大量熾熱岩漿，在地面冷卻凝固後形成沙漠。",
        "風蝕地貌：雨水長時間溶解地底岩石，在山洞內凝結形成石柱；沙漠：古代人類大量開採礦石並搬運泥沙，將沙土集中堆放形成沙漠。"
      ],
      answer: "風蝕地貌：風長時間侵蝕岩石，使岩石變得凹凸不平形成奇形岩柱或石塔；沙漠：風持續把沙土吹到一個地方逐漸堆積起來形成沙漠。"
    },
    {
      id: "sci_l9_24", unitKey: "sci_l9", qCategory: "sci_short", type: "short_qa", typeLabel: "簡答題",
      prompt: "【簡答題】請說明香港「林村河谷」的上游和中下游分別受到河水的甚麼作用影響。",
      options: [
        "林村河上游被河水侵蝕成河谷；中下游流速減緩，堆積出寬廣平原。",
        "林村河上游因泥沙堆積成平原；中下游流速加快，被河水侵蝕成河谷。",
        "林村河上游被強風侵蝕成石塔；中下游受海浪拍打，堆積出狹長海溝。",
        "林村河上游受板塊擠壓成山脈；中下游因地殼破裂，凹陷成深邃裂谷。"
      ],
      answer: "林村河上游被河水侵蝕成河谷；中下游流速減緩，堆積出寬廣平原。"
    },

    // 第9課 看圖填充題 (#25 ~ #27)
    {
      id: "sci_l9_25", unitKey: "sci_l9", qCategory: "sci_img_fill", type: "image_fill", typeLabel: "看圖填充題",
      svgKey: "sci_l9_plate_rift",
      prompt: "觀察板塊運動圖：圖中岩漿流動帶動兩塊板塊互相______，導致地殼破裂，可能形成______地貌。",
      blanks: ["分離", "裂谷"], distractors: ["相撞", "山脈", "平原"]
    },
    {
      id: "sci_l9_26", unitKey: "sci_l9", qCategory: "sci_img_fill", type: "image_fill", typeLabel: "看圖填充題",
      svgKey: "sci_l9_ichthyosaur_3step",
      prompt: "觀察三格圖解：古代海洋生物「魚龍」的______被泥沙掩埋成為化石；經過多次的______，曾經位於海底的______被推升至高處，形成山脈。",
      blanks: ["遺骸", "地殼運動", "岩層"], distractors: ["食物", "風化作用", "海水"]
    },
    {
      id: "sci_l9_27", unitKey: "sci_l9", qCategory: "sci_img_fill", type: "image_fill", typeLabel: "看圖填充題",
      svgKey: "sci_l9_three_fossils",
      prompt: "觀察三個古生物化石圖：照片(1)是______化石；照片(2)螺旋外殼是______化石；照片(3)是______化石。",
      blanks: ["魚", "菊石", "植物"], distractors: ["鳥類", "恐龍蛋", "珊瑚"]
    },

    // 第9課 情境題 (#28 ~ #30 — 四個選項字數與句式結構完全平衡對稱)
    {
      id: "sci_l9_28", unitKey: "sci_l9", qCategory: "sci_scenario", type: "short_qa", typeLabel: "情境題",
      prompt: "【情境題】我國科學家在平均高度 6000 米以上的喜馬拉雅山脈上，發掘出古代海洋生物「魚龍」的化石。為甚麼高山上會出現海洋生物的化石？請詳細解釋其過程。",
      options: [
        "喜馬拉雅山脈岩層原本在海底，魚龍死後遺骸被海底泥沙掩埋成化石；後因地殼運動（板塊相撞擠壓），把海底岩層推升至高處形成高山。",
        "喜馬拉雅山脈原本就是高聳入雲的雪山，古代海洋生物魚龍長有雙翼，喜歡飛到六千米高山湖泊棲息，死後遺骸被冰雪掩埋形成化石。",
        "喜馬拉雅山脈是由兩塊板塊互相分離破裂而成，當時海浪發生巨大海嘯，直接把深海中的魚龍遺骸沖上六千米高的山頂並風化成化石。",
        "喜馬拉雅山脈岩層是由強風吹來沙漠粉塵堆積而成，遠古人類在海底捕獲魚龍後，將其遺骸搬運到高山洞穴內埋藏，日久變成了化石。"
      ],
      answer: "喜馬拉雅山脈岩層原本在海底，魚龍死後遺骸被海底泥沙掩埋成化石；後因地殼運動（板塊相撞擠壓），把海底岩層推升至高處形成高山。"
    },
    {
      id: "sci_l9_29", unitKey: "sci_l9", qCategory: "sci_scenario", type: "short_qa", typeLabel: "情境題",
      prompt: "【情境題】小華去香港聯合國教科文組織世界地質公園參觀，看到「西貢扭曲的火山岩柱」，他覺得很奇怪，為甚麼堅硬的石柱會像麵條一樣彎曲？請為他解答。",
      options: [
        "因為在古代火山爆發後，熾熱的火山岩柱尚未完全凝固時，受到地殼運動（地球內部力量）的強大擠壓，因而扭曲變形。",
        "因為在火山岩柱完全冷卻變硬之後，長期受到海浪拍打和強風吹襲（地球外部力量）的持續沖刷侵蝕，因而被拗彎變形。",
        "因為西貢地區的地殼板塊發生互相分離破裂，形成深邃的海底海溝，海水巨大的水壓直接把堅硬的石柱壓得像麵條一樣彎曲。",
        "因為古代西貢曾經是一片炎熱的沙漠，強風持續把沙土吹到石柱表面堆積，沙土的重量把原本筆直的岩石柱壓得扭曲變形。"
      ],
      answer: "因為在古代火山爆發後，熾熱的火山岩柱尚未完全凝固時，受到地殼運動（地球內部力量）的強大擠壓，因而扭曲變形。"
    },
    {
      id: "sci_l9_30", unitKey: "sci_l9", qCategory: "sci_scenario", type: "short_qa", typeLabel: "情境題",
      prompt: "【情境題】我國科學家劉東生考察黃土高原時，發現土壤是一層黃土、一層紅土交替堆積，且黃土有喜乾冷的蝸牛化石，紅土有喜濕暖的蝸牛化石。請解釋黃土和紅土是如何形成的。",
      options: [
        "乾冷的西北風從沙漠吹來粉塵堆積形成黃土；溫暖潮濕的東南風帶來雨水讓黃土變成紅土。隨着過去氣候冷暖變化，黃土和紅土便一層層交替堆積。",
        "溫暖潮濕的東南風從海洋吹來泥沙堆積形成黃土；乾冷的西北風帶來冰雪讓黃土結冰變成紅土。隨着四季更替變化，黃土和紅土便一層層交替堆積。",
        "黃河氾濫時把上游的泥沙沖上高原堆積形成黃土；火山爆發時噴出的熾熱岩漿覆蓋地面冷卻變成紅土。隨着地殼運動，黃土和紅土便一層層交替堆積。",
        "古代喜歡乾冷的蝸牛在土壤中分泌黃色黏液形成黃土；喜歡溫暖潮濕的蝸牛則分泌紅色物質把泥土染成紅土。隨着生物繁衍，黃土和紅土便交替堆積。"
      ],
      answer: "乾冷的西北風從沙漠吹來粉塵堆積形成黃土；溫暖潮濕的東南風帶來雨水讓黃土變成紅土。隨着過去氣候冷暖變化，黃土和紅土便一層層交替堆積。"
    }
  ];

  Array.prototype.push.apply(window.Aetheria.QuestionBank.Science.QUESTIONS, MORE_SCI_QUESTIONS);
})();
