/* ============================================================================
 * 人文科獨立題庫 — 上半部 Part 2A (questions/questions-humanities.js - v6.7)
 * 內含：17幅精細教科書級向量插畫 + U1《適應青春期》(30題) + U2《與異性相處》(30題)
 * 升級：1.全面平衡所有簡答題、情境題與選擇題的 4 個選項長度與句式結構，杜絕靠長短盲選
 *       2.確保所有正確選項與 answer 100% 完全吻合
 * ============================================================================ */
window.Aetheria = window.Aetheria || {};
window.Aetheria.QuestionBank = window.Aetheria.QuestionBank || {};

(function() {
  const HUM_DIAGRAMS = {
    // 1. U1 #19：男孩在浴室鏡子前摸下巴與頸部，疑惑為何未長出鬍鬚與喉結
    hum_u1_mirror_boy: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 155">
      <defs>
        <linearGradient id="bgM1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#e3f2fd"/><stop offset="100%" stop-color="#bbdefb"/></linearGradient>
        <linearGradient id="glassM1" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#ffffff"/><stop offset="50%" stop-color="#e1f5fe"/><stop offset="100%" stop-color="#b3e5fc"/></linearGradient>
      </defs>
      <rect width="280" height="155" rx="12" fill="url(#bgM1)"/>
      <rect x="20" y="14" width="96" height="126" rx="10" fill="url(#glassM1)" stroke="#5c6bc0" stroke-width="4"/>
      <path d="M30,28 L52,20 M30,40 L66,24" stroke="#ffffff" stroke-width="3" stroke-linecap="round"/>
      <g opacity="0.42">
        <circle cx="68" cy="68" r="20" fill="#ffccbc"/>
        <path d="M48,62 C48,42 88,42 88,62 C80,52 56,52 48,62 Z" fill="#4e342e"/>
        <circle cx="61" cy="68" r="2" fill="#3e2723"/><circle cx="75" cy="68" r="2" fill="#3e2723"/>
        <path d="M64,78 Q68,75 72,78" fill="none" stroke="#5d4037" stroke-width="1.5"/>
        <path d="M45,126 C45,104 91,104 91,126 Z" fill="#42a5f5"/>
      </g>
      <path d="M150,148 C152,116 168,108 192,108 C216,108 232,116 234,148 Z" fill="#42a5f5" stroke="#1565c0" stroke-width="2"/>
      <path d="M180,108 L192,122 L204,108 Z" fill="#ffffff" stroke="#1565c0" stroke-width="1.5"/>
      <rect x="183" y="90" width="18" height="22" rx="4" fill="#ffccbc" stroke="#8d6e63" stroke-width="1.8"/>
      <circle cx="164" cy="66" r="5" fill="#ffccbc" stroke="#8d6e63" stroke-width="1.5"/>
      <circle cx="220" cy="66" r="5" fill="#ffccbc" stroke="#8d6e63" stroke-width="1.5"/>
      <ellipse cx="192" cy="64" rx="26" ry="28" fill="#ffccbc" stroke="#8d6e63" stroke-width="2"/>
      <path d="M165,58 C164,34 180,26 196,28 C212,28 222,38 219,58 C212,46 202,42 188,44 C176,44 170,50 165,58 Z" fill="#3e2723"/>
      <path d="M174,54 Q180,50 185,53 M199,53 Q204,50 210,54" fill="none" stroke="#3e2723" stroke-width="2" stroke-linecap="round"/>
      <circle cx="180" cy="62" r="2.6" fill="#212121"/><circle cx="204" cy="62" r="2.6" fill="#212121"/>
      <path d="M190,66 L188,72 L193,72" fill="none" stroke="#8d6e63" stroke-width="1.6" stroke-linecap="round"/>
      <path d="M185,80 Q192,77 198,80" fill="none" stroke="#5d4037" stroke-width="2" stroke-linecap="round"/>
      <path d="M158,136 C150,118 158,96 174,88 C180,85 184,90 179,95 C168,102 166,120 170,138" fill="#ffccbc" stroke="#8d6e63" stroke-width="2"/>
      <line x1="184" y1="86" x2="128" y2="76" stroke="#43a047" stroke-width="2.2"/>
      <line x1="188" y1="100" x2="128" y2="108" stroke="#43a047" stroke-width="2.2"/>
      <rect x="44" y="64" width="84" height="22" rx="5" fill="#ffffff" stroke="#43a047" stroke-width="1.5"/>
      <text x="86" y="79" font-size="11" font-weight="bold" fill="#1b5e20" text-anchor="middle">未長出鬍鬚？</text>
      <rect x="44" y="96" width="84" height="22" rx="5" fill="#ffffff" stroke="#43a047" stroke-width="1.5"/>
      <text x="86" y="111" font-size="11" font-weight="bold" fill="#1b5e20" text-anchor="middle">未出現喉結？</text>
      <text x="246" y="46" font-size="18" font-weight="900" fill="#1565c0">？</text>
    </svg>`,

    // 2. U1 #20：女孩在洗臉盆前用溫水與溫和洗面膏勤洗面（處理暗瘡）
    hum_u1_wash_face: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 155">
      <rect width="280" height="155" rx="12" fill="#e0f7fa"/>
      <path d="M35,120 C35,144 175,144 175,120 L185,110 L25,110 Z" fill="#ffffff" stroke="#607d8b" stroke-width="2.5"/>
      <path d="M98,110 L98,86 C98,76 114,76 114,86" fill="none" stroke="#78909c" stroke-width="4.5" stroke-linecap="round"/>
      <path d="M112,88 L106,108 M116,88 L120,108" stroke="#29b6f6" stroke-width="2.2" stroke-dasharray="3,2"/>
      <path d="M110,110 C114,92 156,92 160,110 Z" fill="#f48fb1" stroke="#ad1457" stroke-width="2"/>
      <circle cx="164" cy="42" r="10" fill="#3e2723"/>
      <ellipse cx="135" cy="62" rx="24" ry="25" fill="#ffe0b2" stroke="#8d6e63" stroke-width="2"/>
      <path d="M111,56 C112,34 158,34 159,56 C148,44 122,44 111,56 Z" fill="#3e2723"/>
      <path d="M121,60 Q126,64 131,60 M139,60 Q144,64 149,60" fill="none" stroke="#3e2723" stroke-width="2" stroke-linecap="round"/>
      <path d="M130,74 Q135,78 140,74" fill="none" stroke="#ad1457" stroke-width="1.8" stroke-linecap="round"/>
      <circle cx="119" cy="68" r="5" fill="#ffffff" stroke="#81d4fa" stroke-width="1"/>
      <circle cx="151" cy="68" r="5" fill="#ffffff" stroke="#81d4fa" stroke-width="1"/>
      <path d="M118,96 C116,82 126,76 133,80 C140,76 150,82 148,96" fill="#ffe0b2" stroke="#8d6e63" stroke-width="1.8"/>
      <path d="M206,58 C206,50 246,50 246,58 L240,114 C240,120 212,120 212,114 Z" fill="#a5d6a7" stroke="#2e7d32" stroke-width="2"/>
      <rect x="218" y="114" width="16" height="8" rx="2" fill="#1b5e20"/>
      <text x="226" y="84" font-size="10" font-weight="bold" fill="#1b5e20" text-anchor="middle">溫和潔面</text>
      <text x="226" y="98" font-size="10" font-weight="bold" fill="#1b5e20" text-anchor="middle">用品</text>
      <rect x="16" y="20" width="96" height="24" rx="6" fill="#ffffff" stroke="#00897b" stroke-width="1.8"/>
      <text x="64" y="36" font-size="11" font-weight="bold" fill="#004d40" text-anchor="middle">溫水勤洗面防暗瘡</text>
    </svg>`,

    // 3. U1 #21：女孩站在鏡前精心試戴不同髮夾（注重自我形象）
    hum_u1_hairpin: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 155">
      <rect width="280" height="155" rx="12" fill="#fce4ec"/>
      <rect x="22" y="18" width="84" height="120" rx="12" fill="#e1f5fe" stroke="#ec407a" stroke-width="3.5"/>
      <path d="M32,32 L54,24 M32,44 L66,28" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round"/>
      <path d="M132,148 C134,116 150,106 172,106 C194,106 210,116 212,148 Z" fill="#f48fb1" stroke="#ad1457" stroke-width="2"/>
      <path d="M158,106 L172,120 L186,106 Z" fill="#ffffff" stroke="#ad1457" stroke-width="1.5"/>
      <path d="M140,62 C134,88 134,112 144,124 L200,124 C210,112 210,88 204,62 Z" fill="#3e2723"/>
      <ellipse cx="172" cy="68" rx="25" ry="26" fill="#ffe0b2" stroke="#8d6e63" stroke-width="2"/>
      <path d="M146,60 C148,36 196,36 198,60 C188,48 156,48 146,60 Z" fill="#3e2723"/>
      <path d="M182,42 C188,34 198,38 194,46 C202,44 202,54 192,52 C186,50 184,46 182,42 Z" fill="#ff4081" stroke="#880e4f" stroke-width="1.5"/>
      <circle cx="162" cy="66" r="2.8" fill="#212121"/><circle cx="182" cy="66" r="2.8" fill="#212121"/>
      <circle cx="156" cy="73" r="4" fill="#f48fb1" opacity="0.5"/><circle cx="188" cy="73" r="4" fill="#f48fb1" opacity="0.5"/>
      <path d="M166,78 Q172,84 178,78" fill="none" stroke="#ad1457" stroke-width="2" stroke-linecap="round"/>
      <path d="M138,118 C124,102 124,78 138,66" fill="none" stroke="#ffe0b2" stroke-width="7" stroke-linecap="round"/>
      <circle cx="138" cy="62" r="7" fill="#ffd54f" stroke="#f57f17" stroke-width="1.5"/>
      <rect x="196" y="16" width="76" height="40" rx="8" fill="#ffffff" stroke="#ec407a" stroke-width="2"/>
      <text x="234" y="34" font-size="10" font-weight="bold" fill="#880e4f" text-anchor="middle">哪個髮夾</text>
      <text x="234" y="48" font-size="10" font-weight="bold" fill="#880e4f" text-anchor="middle">更好看呢？</text>
    </svg>`,

    // 4. U1 #22：女孩在房間書桌寫日記，轉頭請門外的媽媽不要進來（重視私隱與個人空間）
    hum_u1_diary_privacy: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 155">
      <rect width="280" height="155" rx="12" fill="#fff3e0"/>
      <rect x="18" y="14" width="68" height="128" fill="#ffe082" stroke="#5d4037" stroke-width="3"/>
      <circle cx="38" cy="62" r="14" fill="#ffccbc" stroke="#8d6e63" stroke-width="1.5"/>
      <path d="M24,58 C24,42 52,42 52,58 Z" fill="#4e342e"/>
      <circle cx="34" cy="62" r="1.8" fill="#212121"/><circle cx="43" cy="62" r="1.8" fill="#212121"/>
      <path d="M24,138 C24,96 52,96 52,138 Z" fill="#81c784" stroke="#2e7d32" stroke-width="1.5"/>
      <polygon points="52,14 86,22 86,134 52,142" fill="#a1887f" stroke="#4e342e" stroke-width="2.5"/>
      <circle cx="58" cy="80" r="3.5" fill="#ffd54f"/>
      <rect x="132" y="106" width="132" height="12" rx="3" fill="#8d6e63" stroke="#4e342e" stroke-width="2"/>
      <line x1="146" y1="118" x2="146" y2="146" stroke="#5d4037" stroke-width="4"/>
      <line x1="250" y1="118" x2="250" y2="146" stroke="#5d4037" stroke-width="4"/>
      <path d="M156,94 L184,90 L212,94 L208,108 L184,104 L152,108 Z" fill="#ffffff" stroke="#1e88e5" stroke-width="2"/>
      <path d="M192,146 C194,114 236,114 238,146 Z" fill="#ff8a65" stroke="#d84315" stroke-width="2"/>
      <circle cx="215" cy="68" r="20" fill="#ffe0b2" stroke="#8d6e63" stroke-width="2"/>
      <path d="M195,62 C196,42 234,42 235,62 C225,52 205,52 195,62 Z" fill="#3e2723"/>
      <circle cx="238" cy="58" r="8" fill="#3e2723"/>
      <circle cx="206" cy="68" r="2.2" fill="#212121"/><circle cx="220" cy="68" r="2.2" fill="#212121"/>
      <ellipse cx="213" cy="77" rx="4" ry="2.5" fill="#d84315"/>
      <rect x="96" y="12" width="172" height="34" rx="7" fill="#ffffff" stroke="#fb8c00" stroke-width="2"/>
      <text x="182" y="27" font-size="10" font-weight="bold" fill="#e65100" text-anchor="middle">「媽媽，我正在寫日記，</text>
      <text x="182" y="41" font-size="10" font-weight="bold" fill="#e65100" text-anchor="middle">請不要進來！」</text>
    </svg>`,

    // 5. U1 #23：父母拿着電影票邀請兒子，兒子背着球拍背包揮手說已約同學（減少依賴家人）
    hum_u1_less_depend: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 155">
      <rect width="280" height="155" rx="12" fill="#e8f5e9"/>
      <path d="M24,146 C26,108 68,108 70,146 Z" fill="#64b5f6" stroke="#1565c0" stroke-width="2"/>
      <circle cx="47" cy="74" r="18" fill="#ffccbc" stroke="#8d6e63" stroke-width="1.8"/>
      <path d="M29,68 C30,50 64,50 65,68 Z" fill="#3e2723"/>
      <rect x="36" y="70" width="9" height="6" rx="1" fill="none" stroke="#212121" stroke-width="1.5"/>
      <rect x="49" y="70" width="9" height="6" rx="1" fill="none" stroke="#212121" stroke-width="1.5"/>
      <path d="M43,82 Q47,85 51,82" fill="none" stroke="#5d4037" stroke-width="1.5"/>
      <rect x="74" y="88" width="38" height="20" rx="3" transform="rotate(-12 93 98)" fill="#fff59d" stroke="#f57f17" stroke-width="1.8"/>
      <text x="93" y="101" font-size="9" font-weight="bold" fill="#e65100" text-anchor="middle">電影票</text>
      <rect x="208" y="96" width="26" height="36" rx="6" fill="#43a047" stroke="#1b5e20" stroke-width="2"/>
      <path d="M168,146 C170,106 218,106 220,146 Z" fill="#ffb74d" stroke="#e65100" stroke-width="2"/>
      <circle cx="194" cy="72" r="20" fill="#ffccbc" stroke="#8d6e63" stroke-width="2"/>
      <path d="M174,64 C176,44 214,44 214,64 C202,54 184,54 174,64 Z" fill="#3e2723"/>
      <circle cx="186" cy="70" r="2.3" fill="#212121"/><circle cx="202" cy="70" r="2.3" fill="#212121"/>
      <path d="M188,80 Q194,85 200,80" fill="none" stroke="#5d4037" stroke-width="2" stroke-linecap="round"/>
      <path d="M170,114 C154,104 148,92 152,82" fill="none" stroke="#ffccbc" stroke-width="7" stroke-linecap="round"/>
      <rect x="108" y="12" width="160" height="28" rx="7" fill="#ffffff" stroke="#43a047" stroke-width="2"/>
      <text x="188" y="30" font-size="11" font-weight="bold" fill="#1b5e20" text-anchor="middle">「不用了，我已約同學去看。」</text>
    </svg>`,

    // 6. U2 #18：男孩傷心擦眼淚，旁邊同學指着他取笑「男孩子竟然會哭，真懦弱」（性別角色定型）
    hum_u2_stereotype_cry: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 155">
      <rect width="280" height="155" rx="12" fill="#ede7f6"/>
      <path d="M38,148 C40,110 92,110 94,148 Z" fill="#4fc3f7" stroke="#0277bd" stroke-width="2"/>
      <circle cx="66" cy="74" r="22" fill="#ffe0b2" stroke="#8d6e63" stroke-width="2"/>
      <path d="M44,66 C46,44 86,44 88,66 C76,56 56,56 44,66 Z" fill="#3e2723"/>
      <path d="M52,64 L60,60 M80,64 L72,60" stroke="#3e2723" stroke-width="2" stroke-linecap="round"/>
      <path d="M53,70 Q57,74 61,70 M71,70 Q75,74 79,70" fill="none" stroke="#3e2723" stroke-width="2"/>
      <path d="M54,75 C50,83 56,87 58,80 Z M78,75 C82,83 76,87 74,80 Z" fill="#29b6f6"/>
      <path d="M60,86 Q66,81 72,86" fill="none" stroke="#8d6e63" stroke-width="2" stroke-linecap="round"/>
      <path d="M174,148 C176,110 228,110 230,148 Z" fill="#ffb74d" stroke="#e65100" stroke-width="2"/>
      <circle cx="202" cy="74" r="21" fill="#ffe0b2" stroke="#8d6e63" stroke-width="2"/>
      <path d="M181,66 C182,44 222,44 223,66 Z" fill="#4e342e"/>
      <circle cx="194" cy="70" r="2.3" fill="#212121"/><circle cx="210" cy="70" r="2.3" fill="#212121"/>
      <path d="M195,80 Q202,86 209,80 Z" fill="#d84315"/>
      <path d="M176,112 L132,96" stroke="#ffe0b2" stroke-width="7" stroke-linecap="round"/>
      <rect x="108" y="10" width="160" height="36" rx="7" fill="#ffffff" stroke="#7e57c2" stroke-width="2"/>
      <text x="188" y="25" font-size="10.5" font-weight="bold" fill="#4527a0" text-anchor="middle">「男孩子竟然會哭，</text>
      <text x="188" y="40" font-size="10.5" font-weight="bold" fill="#4527a0" text-anchor="middle">真懦弱呢！」</text>
    </svg>`,

    // 7. U2 #19：男女同學在壁報板前一起看「毛筆書法比賽」海報並手持毛筆練習（尋找相似之處）
    hum_u2_calligraphy: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 155">
      <rect width="280" height="155" rx="12" fill="#fff8e1"/>
      <rect x="88" y="10" width="104" height="104" rx="4" fill="#d7ccc8" stroke="#5d4037" stroke-width="3.5"/>
      <rect x="96" y="16" width="88" height="92" fill="#fffde7" stroke="#8d6e63" stroke-width="1.5"/>
      <rect x="102" y="20" width="76" height="16" rx="3" fill="#5d4037"/>
      <text x="140" y="32" font-size="10.5" font-weight="bold" fill="#ffd54f" text-anchor="middle">毛筆書法比賽</text>
      <path d="M124,48 L142,48 M133,42 L133,76 M122,62 L133,54 L144,66" fill="none" stroke="#212121" stroke-width="3" stroke-linecap="round"/>
      <line x1="158" y1="40" x2="150" y2="70" stroke="#795548" stroke-width="3.5" stroke-linecap="round"/>
      <path d="M150,70 C146,78 142,82 146,84 C150,84 154,78 152,70 Z" fill="#212121"/>
      <path d="M18,148 C20,108 74,108 76,148 Z" fill="#ffffff" stroke="#1565c0" stroke-width="2"/>
      <path d="M42,112 L47,136 L52,112 Z" fill="#1e88e5"/>
      <circle cx="47" cy="72" r="21" fill="#ffccbc" stroke="#8d6e63" stroke-width="2"/>
      <path d="M26,64 C28,42 66,42 68,64 C58,52 38,52 26,64 Z" fill="#3e2723"/>
      <circle cx="39" cy="70" r="2.4" fill="#212121"/><circle cx="55" cy="70" r="2.4" fill="#212121"/>
      <path d="M40,80 Q47,86 54,80" fill="none" stroke="#5d4037" stroke-width="2" stroke-linecap="round"/>
      <path d="M68,116 L94,92" stroke="#ffccbc" stroke-width="6.5" stroke-linecap="round"/>
      <path d="M204,148 C206,108 260,108 262,148 Z" fill="#ffffff" stroke="#ad1457" stroke-width="2"/>
      <path d="M226,112 L233,124 L240,112 Z" fill="#ec407a"/>
      <path d="M208,68 C202,84 204,98 212,102 M258,68 C264,84 262,98 254,102" stroke="#3e2723" stroke-width="6" stroke-linecap="round"/>
      <circle cx="233" cy="72" r="21" fill="#ffe0b2" stroke="#8d6e63" stroke-width="2"/>
      <path d="M212,64 C214,42 252,42 254,64 C244,52 222,52 212,64 Z" fill="#3e2723"/>
      <circle cx="225" cy="70" r="2.4" fill="#212121"/><circle cx="241" cy="70" r="2.4" fill="#212121"/>
      <circle cx="218" cy="76" r="3.5" fill="#f48fb1" opacity="0.55"/><circle cx="248" cy="76" r="3.5" fill="#f48fb1" opacity="0.55"/>
      <path d="M226,80 Q233,86 240,80" fill="none" stroke="#ad1457" stroke-width="2" stroke-linecap="round"/>
      <path d="M212,116 L186,92" stroke="#ffe0b2" stroke-width="6.5" stroke-linecap="round"/>
      <rect x="52" y="120" width="176" height="24" rx="6" fill="#ffffff" stroke="#ffa000" stroke-width="2"/>
      <text x="140" y="136" font-size="11" font-weight="bold" fill="#e65100" text-anchor="middle">共同興趣：一起報名參加書法比賽</text>
    </svg>`,

    // 8. U2 #20：女同學雙手捧着課本大方請教男同學，男同學微笑講解
    hum_u2_study_ask: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 155">
      <rect width="280" height="155" rx="12" fill="#e0f2f1"/>
      <path d="M32,148 C34,110 88,110 90,148 Z" fill="#f48fb1" stroke="#ad1457" stroke-width="2"/>
      <circle cx="61" cy="74" r="21" fill="#ffe0b2" stroke="#8d6e63" stroke-width="2"/>
      <path d="M40,66 C42,44 80,44 82,66 C72,54 50,54 40,66 Z" fill="#3e2723"/>
      <circle cx="53" cy="72" r="2.4" fill="#212121"/><circle cx="69" cy="72" r="2.4" fill="#212121"/>
      <path d="M55,82 Q61,87 67,82" fill="none" stroke="#ad1457" stroke-width="2" stroke-linecap="round"/>
      <path d="M104,88 L140,82 L176,88 L176,124 L140,118 L104,124 Z" fill="#ffffff" stroke="#00897b" stroke-width="2.5"/>
      <line x1="140" y1="82" x2="140" y2="118" stroke="#00897b" stroke-width="2"/>
      <path d="M112,96 L132,94 M112,104 L132,102 M148,94 L168,96 M148,102 L168,104" stroke="#4db6ac" stroke-width="2"/>
      <path d="M190,148 C192,110 246,110 248,148 Z" fill="#64b5f6" stroke="#1565c0" stroke-width="2"/>
      <circle cx="219" cy="74" r="21" fill="#ffccbc" stroke="#8d6e63" stroke-width="2"/>
      <path d="M198,66 C200,44 238,44 240,66 Z" fill="#3e2723"/>
      <circle cx="211" cy="72" r="5" fill="none" stroke="#37474f" stroke-width="1.6"/>
      <circle cx="227" cy="72" r="5" fill="none" stroke="#37474f" stroke-width="1.6"/>
      <line x1="216" y1="72" x2="222" y2="72" stroke="#37474f" stroke-width="1.6"/>
      <circle cx="211" cy="72" r="2" fill="#212121"/><circle cx="227" cy="72" r="2" fill="#212121"/>
      <path d="M213,83 Q219,88 225,83" fill="none" stroke="#5d4037" stroke-width="2" stroke-linecap="round"/>
      <path d="M194,114 L168,102" stroke="#ffccbc" stroke-width="6.5" stroke-linecap="round"/>
      <rect x="28" y="10" width="224" height="28" rx="7" fill="#ffffff" stroke="#00897b" stroke-width="2"/>
      <text x="140" y="28" font-size="11" font-weight="bold" fill="#004d40" text-anchor="middle">「我不太明白這條題目，想向你請教。」</text>
    </svg>`,

    // 9. U2 #21：女同學突然緊抓男同學手臂，男同學面露尷尬並流汗（保持適當身體距離）
    hum_u2_personal_space: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 155">
      <rect width="280" height="155" rx="12" fill="#ffebee"/>
      <path d="M48,148 C50,110 102,110 104,148 Z" fill="#f48fb1" stroke="#c2185b" stroke-width="2"/>
      <circle cx="76" cy="74" r="21" fill="#ffe0b2" stroke="#8d6e63" stroke-width="2"/>
      <path d="M55,66 C56,44 96,44 97,66 Z" fill="#3e2723"/>
      <circle cx="69" cy="72" r="2.4" fill="#212121"/><circle cx="84" cy="72" r="2.4" fill="#212121"/>
      <path d="M71,82 Q76,87 82,82" fill="none" stroke="#c2185b" stroke-width="2" stroke-linecap="round"/>
      <path d="M126,148 C128,110 182,110 184,148 Z" fill="#90caf9" stroke="#1565c0" stroke-width="2"/>
      <circle cx="155" cy="74" r="21" fill="#ffccbc" stroke="#8d6e63" stroke-width="2"/>
      <path d="M134,66 C136,44 174,44 176,66 Z" fill="#3e2723"/>
      <path d="M142,64 L150,61 M168,64 L160,61" stroke="#3e2723" stroke-width="2" stroke-linecap="round"/>
      <circle cx="147" cy="72" r="2.4" fill="#212121"/><circle cx="163" cy="72" r="2.4" fill="#212121"/>
      <path d="M147,84 Q155,80 163,84" fill="none" stroke="#5d4037" stroke-width="2" stroke-linecap="round"/>
      <path d="M179,54 C175,64 183,68 185,58 Z" fill="#29b6f6" stroke="#0277bd" stroke-width="1"/>
      <path d="M96,108 L134,108" stroke="#ffe0b2" stroke-width="8" stroke-linecap="round"/>
      <circle cx="118" cy="108" r="16" fill="none" stroke="#e53935" stroke-width="2.5" stroke-dasharray="4,2"/>
      <rect x="148" y="10" width="122" height="36" rx="7" fill="#ffffff" stroke="#e53935" stroke-width="2"/>
      <text x="209" y="25" font-size="10" font-weight="bold" fill="#b71c1c" text-anchor="middle">「抓着手臂令我很尷尬，</text>
      <text x="209" y="39" font-size="10" font-weight="bold" fill="#b71c1c" text-anchor="middle">應保持適當身體距離！」</text>
    </svg>`,

    // 10. U8 #19：中國西部草原羊群與圓頂蒙古包
    hum_u8_yurt_grassland: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 150">
      <defs>
        <linearGradient id="skyGrass" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#81d4fa"/><stop offset="55%" stop-color="#e1f5fe"/><stop offset="56%" stop-color="#aed581"/><stop offset="100%" stop-color="#7cb342"/></linearGradient>
      </defs>
      <rect width="280" height="150" rx="12" fill="url(#skyGrass)"/>
      <path d="M0,84 Q45,52 95,84 T195,80 T280,84 Z" fill="#90a4ae" opacity="0.5"/>
      <path d="M135,68 C135,42 235,42 235,68 L235,112 C235,118 135,118 135,112 Z" fill="#fffde7" stroke="#8d6e63" stroke-width="2.5"/>
      <path d="M135,68 L235,68 M135,74 L235,74" stroke="#d84315" stroke-width="3"/>
      <path d="M172,46 L198,46 L205,54 L165,54 Z" fill="#ff8f00" stroke="#5d4037" stroke-width="1.5"/>
      <path d="M174,80 L196,80 L196,115 L174,115 Z" fill="#bcaaa4" stroke="#5d4037" stroke-width="2"/>
      <path d="M35,106 C32,98 42,92 50,96 C56,92 66,96 64,104 C70,108 64,116 56,115 L38,115 C32,115 30,110 35,106 Z" fill="#ffffff" stroke="#78909c" stroke-width="1.5"/>
      <path d="M64,100 C70,98 74,104 68,108 Z" fill="#455a64"/>
      <path d="M40,115 L40,124 M46,115 L46,124 M56,115 L56,124 M61,115 L61,124" stroke="#455a64" stroke-width="2"/>
      <line x1="52" y1="94" x2="52" y2="42" stroke="#2e7d32" stroke-width="2"/>
      <line x1="185" y1="46" x2="185" y2="28" stroke="#2e7d32" stroke-width="2"/>
      <rect x="14" y="20" width="82" height="22" rx="5" fill="#ffffff" stroke="#2e7d32" stroke-width="1.5"/>
      <text x="55" y="35" font-size="11" font-weight="bold" fill="#1b5e20" text-anchor="middle">西部草原畜牧</text>
      <rect x="135" y="10" width="100" height="22" rx="5" fill="#ffffff" stroke="#2e7d32" stroke-width="1.5"/>
      <text x="185" y="25" font-size="11" font-weight="bold" fill="#1b5e20" text-anchor="middle">傳統居所：？</text>
    </svg>`,

    // 11. U8 #20：河流三大功能（水力發電、水路運輸、農業灌溉）
    hum_u8_river_uses: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 150">
      <rect width="280" height="150" rx="12" fill="#e8f5e9"/>
      <path d="M15,45 C85,45 95,95 165,98 C215,100 245,115 280,120 L280,150 L140,150 C90,130 65,85 0,80 Z" fill="#29b6f6" stroke="#0288d1" stroke-width="2"/>
      <path d="M22,35 L68,35 L62,78 L16,78 Z" fill="#b0bec5" stroke="#37474f" stroke-width="2"/>
      <path d="M32,52 L28,78 M44,52 L40,78 M54,52 L50,78" stroke="#e1f5fe" stroke-width="2.5"/>
      <path d="M78,18 L86,48 M86,18 L78,48 M74,26 L90,26 M72,36 L92,36" stroke="#455a64" stroke-width="2"/>
      <path d="M115,96 L165,96 L156,110 L124,110 Z" fill="#d84315" stroke="#3e2723" stroke-width="1.5"/>
      <path d="M126,84 L152,84 L152,96 L126,96 Z" fill="#ffca28" stroke="#5d4037" stroke-width="1.5"/>
      <path d="M195,55 L268,55 L268,92 L195,92 Z" fill="#c5e1a5" stroke="#558b2f" stroke-width="1.5"/>
      <path d="M202,65 L260,65 M202,75 L260,75 M202,85 L260,85" stroke="#33691e" stroke-width="2" stroke-dasharray="6,4"/>
      <path d="M185,105 C185,82 198,75 212,75" fill="none" stroke="#0288d1" stroke-width="2.5" stroke-dasharray="3,2"/>
      <text x="45" y="25" font-size="10" font-weight="bold" fill="#1b5e20" text-anchor="middle">1.水力？</text>
      <text x="140" y="76" font-size="10" font-weight="bold" fill="#01579b" text-anchor="middle">2.水路？</text>
      <text x="232" y="46" font-size="10" font-weight="bold" fill="#2e7d32" text-anchor="middle">3.農業？</text>
    </svg>`,

    // 12. U8 #21：青海省山坡層層階梯狀梯田
    hum_u8_terraces: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 150">
      <rect width="280" height="150" rx="12" fill="#e1f5fe"/>
      <path d="M10,140 L10,55 C60,40 120,45 160,60 L265,140 Z" fill="#8d6e63"/>
      <path d="M10,65 C65,55 115,58 148,68 L135,78 C100,70 55,68 10,78 Z" fill="#aed581" stroke="#558b2f" stroke-width="2"/>
      <path d="M10,85 C75,75 135,78 175,90 L162,102 C120,92 65,90 10,100 Z" fill="#9ccc65" stroke="#558b2f" stroke-width="2"/>
      <path d="M10,108 C90,98 160,102 208,114 L195,126 C145,115 80,112 10,122 Z" fill="#7cb342" stroke="#33691e" stroke-width="2"/>
      <path d="M10,130 C105,122 185,125 242,136 L230,146 L10,146 Z" fill="#689f38" stroke="#33691e" stroke-width="2"/>
      <line x1="130" y1="85" x2="195" y2="45" stroke="#2e7d32" stroke-width="2"/>
      <rect x="145" y="18" width="122" height="28" rx="6" fill="#ffffff" stroke="#2e7d32" stroke-width="1.5"/>
      <text x="206" y="36" font-size="11" font-weight="bold" fill="#1b5e20" text-anchor="middle">山坡層層階梯農田</text>
    </svg>`,

    // 13. U8 #22：依山傍水木柱懸空支撐的南方吊腳樓
    hum_u8_stilt_house: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 150">
      <rect width="280" height="150" rx="12" fill="#e0f2f1"/>
      <path d="M0,140 L0,45 Q65,30 125,85 L165,140 Z" fill="#81c784"/>
      <path d="M115,122 L280,122 L280,150 L105,150 Z" fill="#4fc3f7"/>
      <path d="M85,52 C115,36 175,36 205,52 L192,58 L98,58 Z" fill="#4e342e" stroke="#212121" stroke-width="2"/>
      <path d="M98,58 L192,58 L192,94 L98,94 Z" fill="#d7ccc8" stroke="#5d4037" stroke-width="2.5"/>
      <path d="M112,66 L132,66 L132,84 L112,84 Z M156,66 L176,66 L176,84 L156,84 Z" fill="#fff8e1" stroke="#5d4037" stroke-width="1.5"/>
      <path d="M106,94 L106,132 M126,94 L126,136 M146,94 L146,138 M166,94 L166,138 M184,94 L184,138 M106,112 L184,112" stroke="#5d4037" stroke-width="4" stroke-linecap="round"/>
      <line x1="184" y1="112" x2="225" y2="85" stroke="#00695c" stroke-width="2"/>
      <rect x="196" y="62" width="76" height="24" rx="5" fill="#ffffff" stroke="#00695c" stroke-width="1.5"/>
      <text x="234" y="78" font-size="11" font-weight="bold" fill="#004d40" text-anchor="middle">木柱支撐懸空</text>
    </svg>`,

    // 14. U9 #19：頭戴花帽身穿長袍的新疆維吾爾族男孩
    hum_u9_uyghur_boy: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 155">
      <rect width="280" height="155" rx="12" fill="#fff8e1"/>
      <path d="M46,148 C48,102 122,102 124,148 Z" fill="#b71c1c" stroke="#4e342e" stroke-width="2"/>
      <path d="M74,104 L85,126 L96,104 Z" fill="#fffde7"/>
      <line x1="85" y1="126" x2="85" y2="148" stroke="#ffd54f" stroke-width="3"/>
      <rect x="55" y="124" width="60" height="8" rx="2" fill="#ffd54f" stroke="#ff6f00" stroke-width="1.2"/>
      <circle cx="85" cy="70" r="22" fill="#ffe0b2" stroke="#8d6e63" stroke-width="2"/>
      <path d="M58,54 L70,32 L100,32 L112,54 Z" fill="#00695c" stroke="#ffd54f" stroke-width="2"/>
      <path d="M68,46 Q85,36 102,46" fill="none" stroke="#ffffff" stroke-width="2"/>
      <path d="M71,62 Q77,58 82,62 M88,62 Q93,58 99,62" fill="none" stroke="#3e2723" stroke-width="2.2" stroke-linecap="round"/>
      <circle cx="76" cy="68" r="2.6" fill="#212121"/><circle cx="94" cy="68" r="2.6" fill="#212121"/>
      <path d="M78,80 Q85,86 92,80" fill="none" stroke="#8d6e63" stroke-width="2" stroke-linecap="round"/>
      <rect x="138" y="28" width="130" height="68" rx="8" fill="#ffffff" stroke="#ff8f00" stroke-width="2"/>
      <text x="203" y="52" font-size="11" font-weight="bold" fill="#e65100" text-anchor="middle">「我住在新疆，戴花帽</text>
      <text x="203" y="70" font-size="11" font-weight="bold" fill="#e65100" text-anchor="middle">穿長袍，多吃牛羊肉。」</text>
    </svg>`,

    // 15. U9 #20：頭戴精緻銀角銀冠與銀項圈的苗族女孩
    hum_u9_miao_girl: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 155">
      <rect width="280" height="155" rx="12" fill="#f3e5f5"/>
      <path d="M46,148 C48,104 122,104 124,148 Z" fill="#1a237e" stroke="#0d47a1" stroke-width="2"/>
      <path d="M64,104 C74,120 96,120 106,104 M58,110 C72,130 98,130 112,110" fill="none" stroke="#eceff1" stroke-width="3.5"/>
      <circle cx="85" cy="74" r="21" fill="#ffe0b2" stroke="#8d6e63" stroke-width="2"/>
      <path d="M64,66 C66,48 104,48 106,66 Z" fill="#212121"/>
      <path d="M44,22 C50,48 64,52 72,52 L98,52 C106,52 120,48 126,22 C114,34 104,42 96,44 L74,44 C66,42 56,34 44,22 Z" fill="#eceff1" stroke="#607d8b" stroke-width="2"/>
      <rect x="64" y="48" width="42" height="8" rx="2" fill="#cfd8dc" stroke="#455a64" stroke-width="1.5"/>
      <line x1="66" y1="56" x2="66" y2="68" stroke="#eceff1" stroke-width="2"/><line x1="104" y1="56" x2="104" y2="68" stroke="#eceff1" stroke-width="2"/>
      <circle cx="77" cy="72" r="2.5" fill="#212121"/><circle cx="93" cy="72" r="2.5" fill="#212121"/>
      <circle cx="71" cy="78" r="3.5" fill="#f48fb1" opacity="0.55"/><circle cx="99" cy="78" r="3.5" fill="#f48fb1" opacity="0.55"/>
      <path d="M79,82 Q85,87 91,82" fill="none" stroke="#ad1457" stroke-width="2" stroke-linecap="round"/>
      <rect x="138" y="32" width="130" height="64" rx="8" fill="#ffffff" stroke="#8e24aa" stroke-width="2"/>
      <text x="203" y="56" font-size="11" font-weight="bold" fill="#4a148c" text-anchor="middle">佩戴精緻銀飾與刺繡</text>
      <text x="203" y="74" font-size="11" font-weight="bold" fill="#4a148c" text-anchor="middle">（相信銀器能保平安）</text>
    </svg>`,

    // 16. U9 #21：西藏拉薩布達拉宮歷史建築群
    hum_u9_potala_palace: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 150">
      <defs>
        <linearGradient id="tibetSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#1565c0"/><stop offset="100%" stop-color="#90caf9"/></linearGradient>
      </defs>
      <rect width="280" height="150" rx="12" fill="url(#tibetSky)"/>
      <path d="M0,150 L45,75 L140,42 L235,75 L280,150 Z" fill="#8d6e63"/>
      <path d="M48,132 L62,72 L218,72 L232,132 Z" fill="#fafafa" stroke="#5d4037" stroke-width="2"/>
      <path d="M96,98 L104,42 L176,42 L184,98 Z" fill="#b71c1c" stroke="#3e2723" stroke-width="2"/>
      <path d="M108,34 L172,34 L176,42 L104,42 Z" fill="#ffd54f" stroke="#ff6f00" stroke-width="1.5"/>
      <path d="M75,86 L82,86 M95,86 L102,86 M120,56 L128,56 M152,56 L160,56 M178,86 L185,86 M198,86 L205,86" stroke="#3e2723" stroke-width="4"/>
      <rect x="65" y="8" width="150" height="20" rx="5" fill="rgba(255,255,255,0.92)"/>
      <text x="140" y="22" font-size="11" font-weight="bold" fill="#b71c1c" text-anchor="middle">西藏拉薩市・藏傳佛教聖地</text>
    </svg>`,

    // 17. U9 #22：遊客在博物館違反「禁止閃光燈」標誌拍攝青花瓷瓶
    hum_u9_museum_flash: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 155">
      <rect width="280" height="155" rx="12" fill="#eceff1"/>
      <rect x="20" y="24" width="82" height="118" fill="#e1f5fe" stroke="#546e7a" stroke-width="2.5"/>
      <path d="M51,50 L71,50 L67,64 C81,74 81,102 69,112 L53,112 C41,102 41,74 55,64 Z" fill="#ffffff" stroke="#1565c0" stroke-width="2.5"/>
      <path d="M49,84 Q61,76 73,84 M51,94 Q61,102 71,94" fill="none" stroke="#1565c0" stroke-width="2"/>
      <circle cx="122" cy="42" r="22" fill="#ffffff" stroke="#d32f2f" stroke-width="3.5"/>
      <path d="M126,26 L114,42 L125,42 L116,58" fill="none" stroke="#ff8f00" stroke-width="2.5"/>
      <line x1="106" y1="26" x2="138" y2="58" stroke="#d32f2f" stroke-width="3.5"/>
      <path d="M196,148 C198,112 252,112 254,148 Z" fill="#78909c" stroke="#37474f" stroke-width="2"/>
      <circle cx="225" cy="76" r="19" fill="#ffccbc" stroke="#8d6e63" stroke-width="2"/>
      <path d="M206,68 C208,48 242,48 244,68 Z" fill="#3e2723"/>
      <rect x="176" y="72" width="32" height="22" rx="3" fill="#263238" stroke="#000000" stroke-width="1.5"/>
      <polygon points="176,78 104,54 104,106" fill="#fff59d" opacity="0.82"/>
      <text x="195" y="136" font-size="11" font-weight="bold" fill="#c62828" text-anchor="middle">違規使用閃光燈拍攝文物</text>
    </svg>`
  };

  window.Aetheria.QuestionBank.Humanities = {
    DIAGRAMS: HUM_DIAGRAMS,

    LESSONS: [
      { key: "hum_u1", name: "人文・U1 適應青春期 (30題)" },
      { key: "hum_u2", name: "人文・U2 與異性相處 (30題)" },
      { key: "hum_u8", name: "人文・U8 人民生活 (30題)" },
      { key: "hum_u9", name: "人文・U9 文化遺產 (30題)" }
    ],

    QUESTIONS: [
      // ==================== 第一部分：U1 適應青春期 (30題) ====================
      { id: "hum_u1_01", unitKey: "hum_u1", qCategory: "hum_fill", type: "fill_blank", typeLabel: "填充題", prompt: "青春期是由兒童逐漸長大成為 ________ 的必經階段與過渡期。", blanks: ["成人"], distractors: ["長者", "幼兒", "領袖"] },
      { id: "hum_u1_02", unitKey: "hum_u1", qCategory: "hum_fill", type: "fill_blank", typeLabel: "填充題", prompt: "每個人發育的時間和進入青春期的 ________ 都不同，不需要與他人比較。", blanks: ["年齡"], distractors: ["性別", "身高", "體重"] },
      { id: "hum_u1_03", unitKey: "hum_u1", qCategory: "hum_fill", type: "fill_blank", typeLabel: "填充題", prompt: "面對青春期的身體轉變，我們不用感到憂慮和 ________，應接納身體的改變。", blanks: ["自卑"], distractors: ["驕傲", "興奮", "自滿"] },
      { id: "hum_u1_04", unitKey: "hum_u1", qCategory: "hum_fill", type: "fill_blank", typeLabel: "填充題", prompt: "處理暗瘡問題時，應勤洗面，並使用 ________ 的洗面用品和 ________ 洗面。", blanks: ["溫和", "溫水"], distractors: ["刺激", "熱水", "冰水"] },
      { id: "hum_u1_05", unitKey: "hum_u1", qCategory: "hum_fill", type: "fill_blank", typeLabel: "填充題", prompt: "為了處理及預防體臭問題，我們應該每天 ________，並勤換 ________ 和襪子。", blanks: ["洗澡", "內外衣服"], distractors: ["噴香水", "鞋子", "床單"] },
      { id: "hum_u1_06", unitKey: "hum_u1", qCategory: "hum_fill", type: "fill_blank", typeLabel: "填充題", prompt: "女性在月經期間使用衛生巾時，要注意個人及 ________ 衛生，更換前後要清潔 ________。", blanks: ["環境", "雙手"], distractors: ["食物", "頭髮", "臉部"] },
      { id: "hum_u1_07", unitKey: "hum_u1", qCategory: "hum_fill", type: "fill_blank", typeLabel: "填充題", prompt: "把使用過的衛生巾 ________ 好，然後放入 ________ 箱內。", blanks: ["包", "垃圾"], distractors: ["摺", "馬桶", "回收"] },
      { id: "hum_u1_08", unitKey: "hum_u1", qCategory: "hum_fill", type: "fill_blank", typeLabel: "填充題", prompt: "踏入青春期的青少年，情緒變得敏感和 ________，亦會渴望 ________ 自主，減少依賴家人。", blanks: ["不穩定", "獨立"], distractors: ["冷漠", "依附", "退縮"] },

      // U1 分類題 (#9 ~ #13)
      {
        id: "hum_u1_09", unitKey: "hum_u1", qCategory: "hum_classify", type: "classify", typeLabel: "分類題",
        prompt: "【生理與心理變化分類】請將以下青春期特徵放入對應的分類籃：",
        baskets: ["生理變化", "心理變化"],
        items: [
          { label: "A. 臉上長暗瘡", basket: "生理變化" },
          { label: "B. 注重自我形象", basket: "心理變化" },
          { label: "C. 出現體臭", basket: "生理變化" },
          { label: "D. 聲線變得不穩定", basket: "生理變化" },
          { label: "E. 渴求獨立自主", basket: "心理變化" },
          { label: "F. 女孩出現月經", basket: "生理變化" }
        ],
        answer: "生理變化：A、C、D、F ｜ 心理變化：B、E"
      },
      {
        id: "hum_u1_10", unitKey: "hum_u1", qCategory: "hum_classify", type: "classify", typeLabel: "分類題",
        prompt: "【獲取性知識途徑分類】請將以下做法放入對應的分類籃：",
        baskets: ["正確途徑", "錯誤途徑"],
        items: [
          { label: "A. 向老師提出疑問", basket: "正確途徑" },
          { label: "B. 在社交媒體向陌生人查詢", basket: "錯誤途徑" },
          { label: "C. 與父母傾談", basket: "正確途徑" },
          { label: "D. 瀏覽衛生署學生健康服務網站", basket: "正確途徑" }
        ],
        answer: "正確途徑：A、C、D ｜ 錯誤途徑：B"
      },
      {
        id: "hum_u1_11", unitKey: "hum_u1", qCategory: "hum_classify", type: "classify", typeLabel: "分類題",
        prompt: "【月經期間護理分類】請將以下月經期間的做法放入對應的分類籃：",
        baskets: ["應該做的事", "錯誤觀念"],
        items: [
          { label: "A. 勤換衛生巾", basket: "應該做的事" },
          { label: "B. 不要洗頭", basket: "錯誤觀念" },
          { label: "C. 避免吃生冷食物", basket: "應該做的事" },
          { label: "D. 不要做運動", basket: "錯誤觀念" },
          { label: "E. 記錄月經周期日子", basket: "應該做的事" },
          { label: "F. 保持身體清潔", basket: "應該做的事" }
        ],
        answer: "應該做的事：A、C、E、F ｜ 錯誤觀念：B、D"
      },
      {
        id: "hum_u1_12", unitKey: "hum_u1", qCategory: "hum_classify", type: "classify", typeLabel: "分類題",
        prompt: "【衛生習慣配對分類】請將以下衛生習慣歸類入對應的分類籃：",
        baskets: ["處理暗瘡", "處理體臭"],
        items: [
          { label: "A. 每天洗澡", basket: "處理體臭" },
          { label: "B. 用溫水洗面", basket: "處理暗瘡" },
          { label: "C. 勤換內外衣服和襪子", basket: "處理體臭" },
          { label: "D. 使用溫和洗面用品", basket: "處理暗瘡" },
          { label: "E. 少吃味道濃烈的食物", basket: "處理體臭" }
        ],
        answer: "處理暗瘡：B、D ｜ 處理體臭：A、C、E"
      },
      {
        id: "hum_u1_13", unitKey: "hum_u1", qCategory: "hum_classify", type: "classify", typeLabel: "分類題",
        prompt: "【朋輩相處態度分類】面對朋友的要求時，請放入對應的分類籃：",
        baskets: ["應答應的請求", "應拒絕的不當要求"],
        items: [
          { label: "A. 測驗時移近試卷讓同學抄答案", basket: "應拒絕的不當要求" },
          { label: "B. 一起參加毛筆書法比賽", basket: "應答應的請求" },
          { label: "C. 幫不想上興趣班的同學代簽到", basket: "應拒絕的不當要求" },
          { label: "D. 偷拿哥哥的新遊戲機借給朋友", basket: "應拒絕的不當要求" }
        ],
        answer: "應答應：B ｜ 應拒絕：A、C、D"
      },

      // U1 簡答題 (#14 ~ #18 — 四個選項字數與句式結構完全平衡對稱)
      {
        id: "hum_u1_14", unitKey: "hum_u1", qCategory: "hum_short", type: "short_qa", typeLabel: "簡答題",
        prompt: "【簡答題】為什麼我們不需要因為自己還未長高、未長鬍鬚或胸部未發育而與同學比較？",
        options: [
          "因為每個人發育的時間、成長速度和進入青春期的年齡都不相同，存在個別差異。",
          "因為每個人每天進食的零食種類、看電視時間和睡眠姿勢都不相同，純屬巧合。",
          "因為只要不去理會身體發育的變化，所有人的成長速度就會在成年時自動停止。",
          "因為所有青少年都在同一年齡進入青春期，互相比較外貌會嚴重影響學業成績。"
        ],
        answer: "因為每個人發育的時間、成長速度和進入青春期的年齡都不相同，存在個別差異。"
      },
      {
        id: "hum_u1_15", unitKey: "hum_u1", qCategory: "hum_short", type: "short_qa", typeLabel: "簡答題",
        prompt: "【簡答題】請舉出兩個可以獲取正確青春期生理變化知識的可靠網站名稱。",
        options: [
          "衛生署學生健康服務網站、香港家庭計劃指導會網站。",
          "社交媒體匿名討論區網站、網絡紅人私人直播頻道。",
          "網上多人連線遊戲論壇、海外流行服飾購物平台網站。",
          "娛樂八卦新聞雜誌網站、陌生網友私人交友聊天室。"
        ],
        answer: "衛生署學生健康服務網站、香港家庭計劃指導會網站。"
      },
      {
        id: "hum_u1_16", unitKey: "hum_u1", qCategory: "hum_short", type: "short_qa", typeLabel: "簡答題",
        prompt: "【簡答題】除了注意個人清潔衛生外，還有哪四個健康生活習慣能幫助我們順利適應青春期的身體轉變？",
        options: [
          "保持心情愉快（開朗）、進行適量運動、保持均衡飲食，以及有充足睡眠。",
          "每天通宵熬夜溫習功課、只吃高熱量肉類、減少戶外運動，以及長時間玩手機。",
          "大量購買昂貴護膚產品、過度節食減肥、避免外出曬太陽，以及獨自留在家中。",
          "經常進食味道濃烈食物、減少日常飲水、睡前做劇烈運動，以及隱藏所有情緒。"
        ],
        answer: "保持心情愉快（開朗）、進行適量運動、保持均衡飲食，以及有充足睡眠。"
      },
      {
        id: "hum_u1_17", unitKey: "hum_u1", qCategory: "hum_short", type: "short_qa", typeLabel: "簡答題",
        prompt: "【簡答題】青春期的青少年對家人通常會有什麼轉變？我們應該怎樣維持和諧的家庭關係？",
        options: [
          "青少年通常會減少依賴家人並渴求獨立；我們應該與父母保持良好溝通，並學習控制情緒。",
          "青少年通常會完全依賴父母照顧起居；我們應該要求父母代做所有決定，無須自己思考。",
          "青少年通常會抗拒與任何家人交談；我們應該隱瞞學校發生的所有事情，避免與父母溝通。",
          "青少年通常情緒永遠保持絕對平靜；我們應該只聽從陌生網友的意見，不必理會家人感受。"
        ],
        answer: "青少年通常會減少依賴家人並渴求獨立；我們應該與父母保持良好溝通，並學習控制情緒。"
      },
      {
        id: "hum_u1_18", unitKey: "hum_u1", qCategory: "hum_short", type: "short_qa", typeLabel: "簡答題",
        prompt: "【簡答題】踏入青春期後，青少年在「社交與朋輩」以及「個人空間」兩方面會出現什麼心理特徵？",
        options: [
          "社交方面會非常重視朋輩的認同及追隨潮流；個人空間方面會十分重視私隱和個人空間。",
          "社交方面會喜歡孤立自己拒絕結交朋友；個人空間方面會喜歡向所有人公開自己的日記。",
          "社交方面會完全只聽從陌生網友的意見；個人空間方面會完全不需要任何獨立私人的時間。",
          "社交方面會拒絕參加學校任何群體活動；個人空間方面會事事完全依賴父母全天候的陪伴。"
        ],
        answer: "社交方面會非常重視朋輩的認同及追隨潮流；個人空間方面會十分重視私隱和個人空間。"
      },

      // U1 看圖填充題 (#19 ~ #23)
      {
        id: "hum_u1_19", unitKey: "hum_u1", qCategory: "hum_img_fill", type: "image_fill", typeLabel: "看圖填充題",
        svgKey: "hum_u1_mirror_boy",
        prompt: "圖中男孩面對青春期的發育疑問，反映每個人進入青春期的年齡都 ________，我們要 ________ 身體的改變。",
        blanks: ["不同", "接納"], distractors: ["相同", "抗拒", "自卑"]
      },
      {
        id: "hum_u1_20", unitKey: "hum_u1", qCategory: "hum_img_fill", type: "image_fill", typeLabel: "看圖填充題",
        svgKey: "hum_u1_wash_face",
        prompt: "圖中女孩正在透過 ________ 來處理青春期的 ________ 問題。",
        blanks: ["勤洗面", "暗瘡"], distractors: ["噴香水", "體臭", "身高"]
      },
      {
        id: "hum_u1_21", unitKey: "hum_u1", qCategory: "hum_img_fill", type: "image_fill", typeLabel: "看圖填充題",
        svgKey: "hum_u1_hairpin",
        prompt: "這幅圖反映該名青少年出現了「注重 ________」的青春期心理特徵。",
        blanks: ["自我形象"], distractors: ["個人私隱", "家庭依賴", "學業成績"]
      },
      {
        id: "hum_u1_22", unitKey: "hum_u1", qCategory: "hum_img_fill", type: "image_fill", typeLabel: "看圖填充題",
        svgKey: "hum_u1_diary_privacy",
        prompt: "這幅圖反映青少年在青春期非常重視 ________ 和 ________。",
        blanks: ["私隱", "個人空間"], allowSwapIndices: [0, 1], distractors: ["潮流", "朋輩認同", "外表"]
      },
      {
        id: "hum_u1_23", unitKey: "hum_u1", qCategory: "hum_img_fill", type: "image_fill", typeLabel: "看圖填充題",
        svgKey: "hum_u1_less_depend",
        prompt: "這幅圖反映青春期的青少年會出現「減少 ________」的心理轉變。",
        blanks: ["依賴家人"], distractors: ["結交朋友", "獨立自主", "個人私隱"]
      },

      // U1 選擇題 (#24 ~ #27)
      {
        id: "hum_u1_24", unitKey: "hum_u1", qCategory: "hum_mcq", type: "mcq", typeLabel: "選擇題",
        prompt: "以下哪項不是獲取正確青春期生理變化知識的途徑？",
        options: [
          "A. 向學校老師或駐校社工請教疑問",
          "B. 與值得信任的爸爸媽媽坦誠傾訴",
          "C. 在社交媒體上詢問陌生人",
          "D. 瀏覽衛生署等可靠的性教育網站"
        ],
        answer: "C. 在社交媒體上詢問陌生人"
      },
      {
        id: "hum_u1_25", unitKey: "hum_u1", qCategory: "hum_mcq", type: "multi_mcq", typeLabel: "選擇題(可多選)",
        prompt: "女性在月經期間要注意什麼？（可選多於一項）",
        options: ["A. 不要洗頭", "B. 勤換衛生巾", "C. 保持身體清潔", "D. 避免吃生冷食物"],
        answers: ["B. 勤換衛生巾", "C. 保持身體清潔", "D. 避免吃生冷食物"],
        answer: "B. 勤換衛生巾、C. 保持身體清潔、D. 避免吃生冷食物"
      },
      {
        id: "hum_u1_26", unitKey: "hum_u1", qCategory: "hum_mcq", type: "multi_mcq", typeLabel: "選擇題(可多選)",
        prompt: "怎樣處理體臭問題？（可選多於一項）",
        options: ["A. 每天洗澡", "B. 勤換內外衣服和襪子", "C. 少吃味道濃烈的食物", "D. 不要做運動，減少流汗"],
        answers: ["A. 每天洗澡", "B. 勤換內外衣服和襪子", "C. 少吃味道濃烈的食物"],
        answer: "A. 每天洗澡、B. 勤換內外衣服和襪子、C. 少吃味道濃烈的食物"
      },
      {
        id: "hum_u1_27", unitKey: "hum_u1", qCategory: "hum_mcq", type: "mcq", typeLabel: "選擇題",
        prompt: "當朋友稱讚自己的裙子很好看時感到十分開心，甚至為了迎合朋友而追看演唱會，這主要反映了哪兩種青春期心理特徵？",
        options: ["A. 情緒變化大、對性產生好奇", "B. 重視朋輩認同、追隨潮流", "C. 重視私隱、渴求獨立自主", "D. 減少依賴家人、對異性感興趣"],
        answer: "B. 重視朋輩認同、追隨潮流"
      },

      // U1 問答題(情境題) (#28 ~ #30 — 四個選項字數與結構完全平衡對稱)
      {
        id: "hum_u1_28", unitKey: "hum_u1", qCategory: "hum_scenario", type: "short_qa", typeLabel: "問答題(情境題)",
        prompt: "【情境】立德後天有測驗，但已跟同學約定去玩電子遊戲。爸爸要求他不要去，快點留在家中溫習。(1) 爸爸為什麼這樣要求？ (2) 如果你是立德，你會怎樣做？為什麼？",
        options: [
          "(1) 爸爸希望立德為測驗做好準備。(2) 聽從勸告留家溫習，向同學道歉改期，因學業是自己責任，應與父母保持良好溝通並控制情緒。",
          "(1) 爸爸不喜歡立德結交任何朋友。(2) 與爸爸大吵一架並偷偷外出打機，因為滿足朋友的要求永遠比家庭關係和學業更加重要。",
          "(1) 爸爸想自己獨佔家中的遊戲機。(2) 叫同學直接來家裡通宵打機，完全不用理會後天的學校測驗，也不需要理會爸爸的勸告。",
          "(1) 爸爸完全記錯了學校測驗日期。(2) 立即反鎖房門拒絕與家人溝通，並以整天不吃晚飯來抗議父母干預自己的私人娛樂時間。"
        ],
        answer: "(1) 爸爸希望立德為測驗做好準備。(2) 聽從勸告留家溫習，向同學道歉改期，因學業是自己責任，應與父母保持良好溝通並控制情緒。"
      },
      {
        id: "hum_u1_29", unitKey: "hum_u1", qCategory: "hum_scenario", type: "short_qa", typeLabel: "問答題(情境題)",
        prompt: "【情境】同學兆軒在測驗前對立德說：「立德，在測驗時把試卷移近我，讓我抄答案吧！」(1) 兆軒的要求恰當嗎？ (2) 如果你是立德，會怎樣回應？",
        options: [
          "(1) 不恰當，作弊違反校規且不誠實。(2) 勇敢拒絕，並提出平時幫他溫習；切勿因渴望朋輩認同而盲目順從不當要求。",
          "(1) 非常恰當，好朋友之間應該講義氣。(2) 立即答應在測驗時把試卷移近給他抄寫，以免被同學覺得自己自私而遭到排擠。",
          "(1) 不恰當，但為了不得罪好朋友。(2) 表面上答應他的要求，但在測驗試卷上故意寫下全部錯誤的答案讓他抄寫以示懲罰。",
          "(1) 非常恰當，互相抄襲能提升感情。(2) 要求他必須先請自己吃昂貴零食或支付金錢報酬，才願意在測驗時讓他看試卷答案。"
        ],
        answer: "(1) 不恰當，作弊違反校規且不誠實。(2) 勇敢拒絕，並提出平時幫他溫習；切勿因渴望朋輩認同而盲目順從不當要求。"
      },
      {
        id: "hum_u1_30", unitKey: "hum_u1", qCategory: "hum_scenario", type: "short_qa", typeLabel: "問答題(情境題)",
        prompt: "【情境】下星期日是外婆的生日，爸爸媽媽希望與外婆吃晚飯慶祝，但你已答應朋友當晚去看電影。你應該怎樣處理這個情況？",
        options: [
          "主動向朋友坦白解釋當晚是外婆生日需與家人慶祝，向朋友致歉並提議改期看電影；重視朋友同時也要珍惜與家人相處。",
          "隱瞞父母不說實話，當晚直接偷偷溜出家門跟朋友去看電影；因為既然已經答應了朋友就絕對不能因為家人而更改約定。",
          "對朋友撒謊訛稱自己突然患上重病需要入院治療，藉此逃避約定；因為說謊可以避免朋友生氣，不需要坦白說出真正原因。",
          "大發脾氣強迫外婆和父母必須更改生日晚飯的日期來遷就自己；因為個人的娛樂活動與朋友聚會永遠比長輩生日更加重要。"
        ],
        answer: "主動向朋友坦白解釋當晚是外婆生日需與家人慶祝，向朋友致歉並提議改期看電影；重視朋友同時也要珍惜與家人相處。"
      },

      // ==================== 第二部分：U2 與異性相處 (30題) ====================
      { id: "hum_u2_01", unitKey: "hum_u2", qCategory: "hum_fill", type: "fill_blank", typeLabel: "填充題", prompt: "每個人都有不同的 ________ 和特質，這與 ________ 無關，我們應拒絕性別角色定型。", blanks: ["性格", "性別"], distractors: ["年齡", "外貌", "財富"] },
      { id: "hum_u2_02", unitKey: "hum_u2", qCategory: "hum_fill", type: "fill_blank", typeLabel: "填充題", prompt: "我們可以與異性朋友尋找 ________ 的地方，例如一起參加有共同興趣的活動，發展友誼。", blanks: ["相似"], distractors: ["對立", "矛盾", "昂貴"] },
      { id: "hum_u2_03", unitKey: "hum_u2", qCategory: "hum_fill", type: "fill_blank", typeLabel: "填充題", prompt: "在小組合作中，男女同學可以各展所長，互相 ________，互補 ________。", blanks: ["學習", "不足"], distractors: ["推卸", "指責", "比較"] },
      { id: "hum_u2_04", unitKey: "hum_u2", qCategory: "hum_fill", type: "fill_blank", typeLabel: "填充題", prompt: "我們要懂得欣賞和 ________ 別人的優點和缺點，並以坦誠和尊重的態度，________ 選擇可信任的朋友。", blanks: ["接納", "謹慎"], distractors: ["取笑", "隨便", "盲目"] },
      { id: "hum_u2_05", unitKey: "hum_u2", qCategory: "hum_fill", type: "fill_blank", typeLabel: "填充題", prompt: "青春期男女對異性開始感到好奇是正常的，但我們要學會分辨 ________ 和 ________。", blanks: ["友情", "愛情"], allowSwapIndices: [0, 1], distractors: ["親情", "同情", "心情"] },
      { id: "hum_u2_06", unitKey: "hum_u2", qCategory: "hum_fill", type: "fill_blank", typeLabel: "填充題", prompt: "對異性的 ________ 不一定等同愛情，明白兩性之間也可以成為純潔的 ________。", blanks: ["好奇", "朋友"], distractors: ["討厭", "敵人", "伴侶"] },
      { id: "hum_u2_07", unitKey: "hum_u2", qCategory: "hum_fill", type: "fill_blank", typeLabel: "填充題", prompt: "與異性相處時，我們應該保持 ________ 和自然，互相 ________，並保持適當的距離。", blanks: ["大方", "尊重"], distractors: ["害羞", "取笑", "迴避"] },
      { id: "hum_u2_08", unitKey: "hum_u2", qCategory: "hum_fill", type: "fill_blank", typeLabel: "填充題", prompt: "與異性相處時要訂立相處 ________；若對方的言行令自己感到不舒服，要 ________ 說出個人感受。", blanks: ["界線", "坦白"], distractors: ["秘密", "隱瞞", "沉默"] },

      // U2 分類題 (#9 ~ #12)
      {
        id: "hum_u2_09", unitKey: "hum_u2", qCategory: "hum_classify", type: "classify", typeLabel: "分類題",
        prompt: "【性別觀念判斷分類】請將以下說法放入對應的分類籃：",
        baskets: ["性別刻板印象(錯誤)", "正確性別觀念"],
        items: [
          { label: "A. 男孩子竟然會哭，真懦弱", basket: "性別刻板印象(錯誤)" },
          { label: "B. 女孩子踢足球太粗魯，應學彈鋼琴", basket: "性別刻板印象(錯誤)" },
          { label: "C. 男孩和女孩都可以很勇敢保護別人", basket: "正確性別觀念" },
          { label: "D. 女孩運動能力差，男孩粗心大意", basket: "性別刻板印象(錯誤)" },
          { label: "E. 冷靜理智的女孩也能成為出色消防員", basket: "正確性別觀念" }
        ],
        answer: "刻板印象(錯誤)：A、B、D ｜ 正確觀念：C、E"
      },
      {
        id: "hum_u2_10", unitKey: "hum_u2", qCategory: "hum_classify", type: "classify", typeLabel: "分類題",
        prompt: "【友情與愛情分類】請判斷以下情況並放入對應的分類籃：",
        baskets: ["友情的表現", "愛情的表現"],
        items: [
          { label: "A. 一起打羽毛球，更喜歡和朋友進行羣體活動", basket: "友情的表現" },
          { label: "B. 長時間相處接受彼此優缺點，作出承諾計劃結婚", basket: "愛情的表現" },
          { label: "C. 上學碰見男班長跟他說早晨覺得高興", basket: "友情的表現" },
          { label: "D. 確定心意互相信任，多年後決定結婚組織家庭", basket: "愛情的表現" }
        ],
        answer: "友情：A、C ｜ 愛情：B、D"
      },
      {
        id: "hum_u2_11", unitKey: "hum_u2", qCategory: "hum_classify", type: "classify", typeLabel: "分類題",
        prompt: "【兩性相處言行分類】請將以下與異性相處的言行放入對應分類籃：",
        baskets: ["合宜的態度", "不合宜的態度"],
        items: [
          { label: "A. 放學相約異性同學去圖書館搜集研習資料", basket: "合宜的態度" },
          { label: "B. 怕同學看着，故意不跟異性同學說話", basket: "不合宜的態度" },
          { label: "C. 異性同學受傷時主動關心並扶到長椅休息", basket: "合宜的態度" },
          { label: "D. 隨便抓着異性同學手臂令對方尷尬", basket: "不合宜的態度" },
          { label: "E. 看到男女同學一起走便取笑談戀愛", basket: "不合宜的態度" }
        ],
        answer: "合宜：A、C ｜ 不合宜：B、D、E"
      },
      {
        id: "hum_u2_12", unitKey: "hum_u2", qCategory: "hum_classify", type: "classify", typeLabel: "分類題",
        prompt: "【相處原則配對分類】請將以下行為放入對應的「兩性相處態度」分類籃：",
        baskets: ["互相接納", "互補不足", "謹慎選擇朋友"],
        items: [
          { label: "A. 知志健畏高，不坐過山車改看巡遊", basket: "互相接納" },
          { label: "B. 立德負責採訪，靜兒善於整理負責分析", basket: "互補不足" },
          { label: "C. 選擇友善和誠實的人做朋友", basket: "謹慎選擇朋友" }
        ],
        answer: "A：互相接納 ｜ B：互補不足 ｜ C：謹慎選擇朋友"
      },

      // U2 簡答題 (#13 ~ #17 — 四個選項字數與句式結構完全平衡對稱)
      {
        id: "hum_u2_13", unitKey: "hum_u2", qCategory: "hum_short", type: "short_qa", typeLabel: "簡答題",
        prompt: "【簡答題】如果我們對男性和女性抱有傳統的刻板印象（如認為男孩粗心、女孩愛哭），會對兩性相處帶來什麼負面影響？",
        options: [
          "會阻礙對異性的真正瞭解，導致不願與異性合作，影響與異性正常、和諧地相處。",
          "會幫助我們更快按照傳統分工完成專題研習，大幅減少男女同學之間的意見分歧。",
          "會令男同學的運動能力與女同學的音樂才華同時大幅提升，促進全班同學良性競爭。",
          "不會對人際關係造成任何負面影響，反而能夠讓男女同學各自保持距離、增進友誼。"
        ],
        answer: "會阻礙對異性的真正瞭解，導致不願與異性合作，影響與異性正常、和諧地相處。"
      },
      {
        id: "hum_u2_14", unitKey: "hum_u2", qCategory: "hum_short", type: "short_qa", typeLabel: "簡答題",
        prompt: "【簡答題】請列出與異性相處時的正確態度。",
        options: [
          "(1)拒絕性別角色定型；(2)尋找相似之處；(3)互相接納與尊重；(4)互相學習，互補不足；(5)謹慎選擇朋友；(6)保持大方坦誠。",
          "(1)堅持傳統性別定型；(2)刻意迴避異性；(3)取笑異性同學缺點；(4)拒絕同組合作；(5)盲目順從朋友；(6)隱瞞個人感受。",
          "(1)凡事只聽男同學意見；(2)把文書工作全交給女同學；(3)在背後議論異性；(4)炫耀個人長處；(5)只選富有朋友；(6)過度親密。",
          "(1)單獨前往偏僻地方；(2)在網上結交陌生異性；(3)隱瞞父母所有交往；(4)隨意觸碰對方身體；(5)起鬨取笑同學；(6)事事計較。"
        ],
        answer: "(1)拒絕性別角色定型；(2)尋找相似之處；(3)互相接納與尊重；(4)互相學習，互補不足；(5)謹慎選擇朋友；(6)保持大方坦誠。"
      },
      {
        id: "hum_u2_15", unitKey: "hum_u2", qCategory: "hum_short", type: "short_qa", typeLabel: "簡答題",
        prompt: "【簡答題】真正的「愛情」通常具備哪些重要元素（請舉出三項）？",
        options: [
          "經過長時間相處和深入瞭解、互相信任、包容和關心對方優缺點，並願意作出承諾（如計劃結婚、組織家庭）。",
          "只要每天上學碰面時跟對方打招呼覺得高興、喜歡一起進行群體球類活動，就已經具備了成熟愛情的所有重要元素。",
          "只需要注重對方的外貌穿搭是否好看，以及是否經常贈送昂貴禮物，完全不需要經過長時間相處、瞭解與作出承諾。",
          "只要在社交媒體上認識幾天並有共同的電子遊戲興趣，即使從未深入了解彼此的性格優缺點，也屬於真正的愛情。"
        ],
        answer: "經過長時間相處和深入瞭解、互相信任、包容和關心對方優缺點，並願意作出承諾（如計劃結婚、組織家庭）。"
      },
      {
        id: "hum_u2_16", unitKey: "hum_u2", qCategory: "hum_short", type: "short_qa", typeLabel: "簡答題",
        prompt: "【簡答題】與異性朋友相處時，在身體距離和言行方面要注意什麼？",
        options: [
          "留意言行舉止，訂立相處界線並保持適當身體距離；若對方的接觸令自己不舒服，要坦白說出感受。",
          "為了表現自己熱情友善，可以隨時主動拉扯異性朋友的手臂或搭肩膀；不需要理會對方是否感到尷尬。",
          "即使異性朋友的身體接觸令自己感到非常尷尬和不舒服，為了維持友誼也應該默默忍受，不可說出來。",
          "與異性朋友相處時必須完全不說話、不進行任何眼神接觸；在學校分組活動中亦應完全拒絕與異性交談。"
        ],
        answer: "留意言行舉止，訂立相處界線並保持適當身體距離；若對方的接觸令自己不舒服，要坦白說出感受。"
      },
      {
        id: "hum_u2_17", unitKey: "hum_u2", qCategory: "hum_short", type: "short_qa", typeLabel: "簡答題",
        prompt: "【簡答題】當青少年在結交異性朋友時遇上問題或煩惱，應該向誰尋求協助？為什麼？",
        options: [
          "應諮詢父母、老師等可信任的成年人意見，因為他們經驗豐富且可靠，不需獨自煩惱。",
          "應在社交網站向素未謀面的陌生網友傾訴，因為陌生人沒有偏見而且人生經驗最豐富。",
          "應該把所有煩惱藏在心底自己獨自承受，絕對不可告訴父母或老師，以免被長輩責罵。",
          "應該完全聽信身邊八卦同學的起鬨與流言蜚語，按照同輩的盲目建議去處理感情問題。"
        ],
        answer: "應諮詢父母、老師等可信任的成年人意見，因為他們經驗豐富且可靠，不需獨自煩惱。"
      },

      // U2 看圖填充題 (#18 ~ #21)
      {
        id: "hum_u2_18", unitKey: "hum_u2", qCategory: "hum_img_fill", type: "image_fill", typeLabel: "看圖填充題",
        svgKey: "hum_u2_stereotype_cry",
        prompt: "圖中取笑別人的同學抱有錯誤的 ________ 定型觀念，沒有做到 ________ 他人。",
        blanks: ["性別角色", "尊重"], distractors: ["年齡", "取笑", "依賴"]
      },
      {
        id: "hum_u2_19", unitKey: "hum_u2", qCategory: "hum_img_fill", type: "image_fill", typeLabel: "看圖填充題",
        svgKey: "hum_u2_calligraphy",
        prompt: "這幅圖展示了與異性相處時，可以透過「尋找 ________ 之處」來建立友誼。",
        blanks: ["相似"], distractors: ["不同", "矛盾", "秘密"]
      },
      {
        id: "hum_u2_20", unitKey: "hum_u2", qCategory: "hum_img_fill", type: "image_fill", typeLabel: "看圖填充題",
        svgKey: "hum_u2_study_ask",
        prompt: "圖中女同學與異性相處的態度 ________（正確／不正確），因為她表現得 ________，能與異性同學互相學習。",
        blanks: ["正確", "大方坦誠"], distractors: ["不正確", "害羞退縮", "粗魯"]
      },
      {
        id: "hum_u2_21", unitKey: "hum_u2", qCategory: "hum_img_fill", type: "image_fill", typeLabel: "看圖填充題",
        svgKey: "hum_u2_personal_space",
        prompt: "圖中女同學的行為忽略了與異性相處應保持適當的 ________，男同學應該 ________ 向她說出自己的感受。",
        blanks: ["距離", "坦白"], distractors: ["秘密", "隱瞞", "討好"]
      },

      // U2 選擇題 (#22 ~ #26 — 四個選項長度一致)
      {
        id: "hum_u2_22", unitKey: "hum_u2", qCategory: "hum_mcq", type: "mcq", typeLabel: "選擇題",
        prompt: "以下哪一項關於性別特質的描述是正確的？",
        options: [
          "A. 女性天性都是容易哭泣和經常愛生氣的",
          "B. 男孩子的數學和運動能力一定比女孩子強",
          "C. 每個人都有不同性格和特質，與性別無關",
          "D. 消防員只適合男性擔任，女性並不適合"
        ],
        answer: "C. 每個人都有不同性格和特質，與性別無關"
      },
      {
        id: "hum_u2_23", unitKey: "hum_u2", qCategory: "hum_mcq", type: "mcq", typeLabel: "選擇題",
        prompt: "穎思在網上發文表示，有男同學最近突然握她的手或搭她的肩，說話又靠得很近，令她很尷尬。以下哪位網友的意見最正確？",
        options: [
          "A. 網友A：是不是你平時太粗魯，他才把你當成男孩子對待？",
          "B. 網友B：你實在太敏感小題大做了，搭肩膀握住手很普通吧！",
          "C. 網友C：如果你不喜歡這些行為，便直接告訴對方，朋友之間應該互相尊重！",
          "D. 網友D：他這樣做一定是對你有好感！你心裡面喜歡他嗎？"
        ],
        answer: "C. 網友C：如果你不喜歡這些行為，便直接告訴對方，朋友之間應該互相尊重！"
      },
      {
        id: "hum_u2_24", unitKey: "hum_u2", qCategory: "hum_mcq", type: "mcq", typeLabel: "選擇題",
        prompt: "當與異性同學一起進行專題研習時，最理想的做法是什麼？",
        options: [
          "A. 拒絕與男同學同組合作，因為男孩子都粗心大意",
          "B. 為免被同學取笑談戀愛，全程不與異性組員交談",
          "C. 根據大家的專長分工合作，互相學習，互補不足",
          "D. 把所有資料搜集與報告工作全部交給異性同學做"
        ],
        answer: "C. 根據大家的專長分工合作，互相學習，互補不足"
      },
      {
        id: "hum_u2_25", unitKey: "hum_u2", qCategory: "hum_mcq", type: "mcq", typeLabel: "選擇題",
        prompt: "哪一項不是分辨友情與愛情的正確觀念？",
        options: [
          "A. 對異性產生好奇心是正常的，不一定等同愛情",
          "B. 跟異性同學打招呼覺得高興，就代表已經愛上對方",
          "C. 男女兩性之間也可以成為志趣相投的純潔好朋友",
          "D. 真正的愛情需要長時間相處瞭解，並願意作出承諾"
        ],
        answer: "B. 跟異性同學打招呼覺得高興，就代表已經愛上對方"
      },
      {
        id: "hum_u2_26", unitKey: "hum_u2", qCategory: "hum_mcq", type: "mcq", typeLabel: "選擇題",
        prompt: "結交異性朋友時，我們應該選擇怎樣的人做朋友？",
        options: [
          "A. 班上最受歡迎、外貌最好看和最富有的人",
          "B. 友善、誠實和可信任的人",
          "C. 會無條件盲目順從自己所有不當要求的人",
          "D. 喜歡在背後議論是非和取笑別人的同學"
        ],
        answer: "B. 友善、誠實和可信任的人"
      },

      // U2 問答題(情境題) (#27 ~ #30 — 四個選項字數與結構完全平衡對稱)
      {
        id: "hum_u2_27", unitKey: "hum_u2", qCategory: "hum_scenario", type: "short_qa", typeLabel: "問答題(情境題)",
        prompt: "【情境】小美很喜歡踢足球，但媽媽卻對她說：「女孩子踢足球太粗魯，你應該學彈鋼琴。」你同意媽媽的說話嗎？為什麼？",
        options: [
          "不同意。因為每個人的興趣、性格和能力都不同，與性別無關，不應受傳統性別角色定型限制。",
          "同意。因為踢足球是屬於男孩子的粗魯運動，女孩子天生體能較弱，只適合學習彈鋼琴等靜態音樂。",
          "同意。因為女孩子的運動能力和團隊合作精神一定比男孩子差，參加足球隊會影響其他隊員表現。",
          "不同意。因為女孩子在青春期應該完全停止參加任何體育或音樂課外活動，只可留在家中做家務。"
        ],
        answer: "不同意。因為每個人的興趣、性格和能力都不同，與性別無關，不應受傳統性別角色定型限制。"
      },
      {
        id: "hum_u2_28", unitKey: "hum_u2", qCategory: "hum_scenario", type: "short_qa", typeLabel: "問答題(情境題)",
        prompt: "【情境】有個男同學最近經常突然搭着穎思的肩膀，說話時又靠得很近，令穎思覺得很尷尬和不舒服。如果你是穎思，你會怎樣做？",
        options: [
          "保持冷靜，直接而坦白地告訴他自己不喜歡這些身體接觸，請他保持適當距離（互相尊重）；若無改善則向父母或老師求助。",
          "為了害怕破壞同學之間的表面和諧關係，即使心裡覺得非常尷尬和不舒服，也應該全程保持沉默、默默忍受對方的行為。",
          "立即在社交媒體上發文公開羞辱和謾罵該名男同學，並號召全班同學一起排擠和孤立他，不需事先向他坦白表達感受。",
          "因為害怕在學校再次遇到該名男同學，決定從此假裝生病逃學不再回校上課，並且絕對不把這件事告訴父母或老師。"
        ],
        answer: "保持冷靜，直接而坦白地告訴他自己不喜歡這些身體接觸，請他保持適當距離（互相尊重）；若無改善則向父母或老師求助。"
      },
      {
        id: "hum_u2_29", unitKey: "hum_u2", qCategory: "hum_scenario", type: "short_qa", typeLabel: "問答題(情境題)",
        prompt: "【情境】最近，興趣班的同學取笑你和一位異性朋友在談戀愛，你們都覺得很尷尬，考慮是不是應該減少聯絡。你認為應該怎樣應對？",
        options: [
          "不需因被取笑而尷尬或刻意減少聯絡；向同學澄清大家只是好朋友，繼續保持大方、自然和坦誠的態度相處即可。",
          "應該立即與該名異性朋友徹底絕交，以後在學校或興趣班見面時也假裝完全不認識對方，以免再被其他同學起鬨取笑。",
          "為了向興趣班的同學證明你們兩個人並沒有談戀愛，應該故意在所有同學面前大聲責罵和推開該名異性朋友以示清白。",
          "因為害怕被同學繼續議論和取笑，應該立即向父母要求退出該興趣班，從此不再參加任何有異性同學在場的群體活動。"
        ],
        answer: "不需因被取笑而尷尬或刻意減少聯絡；向同學澄清大家只是好朋友，繼續保持大方、自然和坦誠的態度相處即可。"
      },
      {
        id: "hum_u2_30", unitKey: "hum_u2", qCategory: "hum_scenario", type: "short_qa", typeLabel: "問答題(情境題)",
        prompt: "【情境】在籃球比賽中，異性隊友不慎跌倒受傷，但你擔心主動扶對方會被其他同學起鬨取笑。這時候你應該怎樣做？為什麼？",
        options: [
          "放下顧慮，大方地主動上前關心，並與其他同學一起扶對方到長椅休息；因為同學間應發揮仁愛和同理心互相幫助。",
          "為了避免被場邊的其他同學起鬨取笑自己與異性談戀愛，應該假裝看不見對方跌倒受傷，立即轉身走開不作任何理會。",
          "站在球場旁邊跟其他同學一起大聲起鬨和取笑跌倒的異性隊友，這樣才不會被別人懷疑自己對該名異性隊友有特別好感。",
          "上前大聲責怪該名異性隊友在比賽途中不小心跌倒，認為對方的失誤連累了整支球隊的得分表現，要求對方立即離場。"
        ],
        answer: "放下顧慮，大方地主動上前關心，並與其他同學一起扶對方到長椅休息；因為同學間應發揮仁愛和同理心互相幫助。"
      }
    ]
  };
})();
/* ============================================================================
 * 人文科獨立題庫 — 下半部 Part 2B (questions/questions-humanities.js - v6.7)
 * 內含：U8《人民生活》(30題) + U9《文化遺產》(30題)
 * 升級：全面平衡所有簡答題、情境題與選擇題的 4 個選項長度與句式結構，杜絕盲選
 * 請直接緊接貼在 v6.7 Part 2A 代碼的最下方！
 * ============================================================================ */
(function() {
  if (!window.Aetheria || !window.Aetheria.QuestionBank || !window.Aetheria.QuestionBank.Humanities) return;

  const MORE_HUM_QUESTIONS = [
    // ==================== 第三部分：U8 人民生活 (30題) ====================
    { id: "hum_u8_01", unitKey: "hum_u8", qCategory: "hum_fill", type: "fill_blank", typeLabel: "填充題", prompt: "我國人口有 ________ 多，但人口分佈並不平均，超過九成（約93.5%）人口集中在 ________ 地區。", blanks: ["14億", "東南部"], distractors: ["5億", "西北部", "正中央"] },
    { id: "hum_u8_02", unitKey: "hum_u8", qCategory: "hum_fill", type: "fill_blank", typeLabel: "填充題", prompt: "我國人口分佈地圖上，由黑龍江省 ________ 市至雲南省 ________ 市的連線，是著名的人口地理分界線。", blanks: ["黑河", "騰衝"], distractors: ["哈爾濱", "昆明", "拉薩"] },
    { id: "hum_u8_03", unitKey: "hum_u8", qCategory: "hum_fill", type: "fill_blank", typeLabel: "填充題", prompt: "我國東南部地勢較 ________，氣候較 ________，且降水量較 ________，因此適合人類居住及發展農業。", blanks: ["平緩", "溫暖", "充足"], distractors: ["陡峭", "嚴寒", "稀少"] },
    { id: "hum_u8_04", unitKey: "hum_u8", qCategory: "hum_fill", type: "fill_blank", typeLabel: "填充題", prompt: "我國素有「北方人吃 ________，南方人吃 ________」的飲食習慣差異。", blanks: ["麵食", "米食"], distractors: ["海鮮", "生果", "甜點"] },
    { id: "hum_u8_05", unitKey: "hum_u8", qCategory: "hum_fill", type: "fill_blank", typeLabel: "填充題", prompt: "________ 高原是我國黃河、長江、瀾滄江三條重要河流的發源地，有「________」的美譽。", blanks: ["青藏", "中華水塔"], distractors: ["黃土", "世界屋脊", "雲貴"] },
    { id: "hum_u8_06", unitKey: "hum_u8", qCategory: "hum_fill", type: "fill_blank", typeLabel: "填充題", prompt: "黃河上游河水清澈，但流經中部土壤鬆軟的 ________ 高原時，大量泥沙沖入河中，令河水變黃，更會抬高下游的 ________。", blanks: ["黃土", "河牀"], distractors: ["青藏", "水位", "山脈"] },
    { id: "hum_u8_07", unitKey: "hum_u8", qCategory: "hum_fill", type: "fill_blank", typeLabel: "填充題", prompt: "長江三峽位於長江上游，由 ________、________ 和 ________ 組成，風景雄偉。", blanks: ["瞿塘峽", "巫峽", "西陵峽"], allowSwapIndices: [0, 1, 2], distractors: ["虎跳峽", "三門峽", "劉家峽"] },
    { id: "hum_u8_08", unitKey: "hum_u8", qCategory: "hum_fill", type: "fill_blank", typeLabel: "填充題", prompt: "珠江流域擁有能保護海岸、改善水質的 ________，水域內更有 ________ 和黑臉琵鷺等瀕危物種棲息。", blanks: ["濕地", "中華白海豚"], distractors: ["沙漠", "大熊貓", "揚子鱷"] },

    // U8 分類題 (#9 ~ #13) -> 分類籃
    {
      id: "hum_u8_09", unitKey: "hum_u8", qCategory: "hum_classify", type: "classify", typeLabel: "分類題",
      prompt: "【西北部與東南部比較分類】請將以下特徵放入對應的分類籃：",
      baskets: ["我國西北部", "我國東南部"],
      items: [
        { label: "A. 面積約佔56.2%，人口只佔約6.5%", basket: "我國西北部" },
        { label: "B. 面積約佔43.8%，人口佔約93.5%", basket: "我國東南部" },
        { label: "C. 海拔較高，寒冷乾燥，降水缺乏", basket: "我國西北部" },
        { label: "D. 地勢平坦，溫暖多雨，交通發達", basket: "我國東南部" }
      ],
      answer: "我國西北部：A、C ｜ 我國東南部：B、D"
    },
    {
      id: "hum_u8_10", unitKey: "hum_u8", qCategory: "hum_classify", type: "classify", typeLabel: "分類題",
      prompt: "【地區物產與環境分類】請將以下物產放入我國四大地區分類籃：",
      baskets: ["我國北部", "我國南部", "我國西部", "我國東部"],
      items: [
        { label: "A. 小麥製品（麵條、饅頭）", basket: "我國北部" },
        { label: "B. 米飯（水稻）", basket: "我國南部" },
        { label: "C. 肉類、奶類和毛皮（畜牧業）", basket: "我國西部" },
        { label: "D. 水產（漁業）", basket: "我國東部" }
      ],
      answer: "北部：A ｜ 南部：B ｜ 西部：C ｜ 東部：D"
    },
    {
      id: "hum_u8_11", unitKey: "hum_u8", qCategory: "hum_classify", type: "classify", typeLabel: "分類題",
      prompt: "【特色房屋與環境配對分類】請將房屋特點放入對應的傳統建築分類籃：",
      baskets: ["蒙古包", "窰洞", "吊腳樓", "四合院"],
      items: [
        { label: "A. 木柱支撐懸空，適應山坡濕熱，防潮通風", basket: "吊腳樓" },
        { label: "B. 能拆卸隨季節遷徙，抵禦風沙適應遊牧", basket: "蒙古包" },
        { label: "C. 四周房屋圍庭院在中間，適應平原防風防寒", basket: "四合院" },
        { label: "D. 用黃土建構冬暖夏涼，適應乾燥少雨缺木材", basket: "窰洞" }
      ],
      answer: "蒙古包：B ｜ 窰洞：D ｜ 吊腳樓：A ｜ 四合院：C"
    },
    {
      id: "hum_u8_12", unitKey: "hum_u8", qCategory: "hum_classify", type: "classify", typeLabel: "分類題",
      prompt: "【三大河流特徵分類】請將以下特徵放入對應的河流分類籃：",
      baskets: ["黃河", "長江", "珠江"],
      items: [
        { label: "A. 歷史氾濫約1600次，設調水調沙工程", basket: "黃河" },
        { label: "B. 上游有三峽奇峯，開展《十年禁漁計劃》", basket: "長江" },
        { label: "C. 擁有大片紅樹林濕地，中華白海豚棲息", basket: "珠江" }
      ],
      answer: "黃河：A ｜ 長江：B ｜ 珠江：C"
    },
    {
      id: "hum_u8_13", unitKey: "hum_u8", qCategory: "hum_classify", type: "classify", typeLabel: "分類題",
      prompt: "【河流危機與生態建設配對】請將生態建設措施放入對應的危機分類籃：",
      baskets: ["治理河水氾濫", "治理水土流失", "治理水污染及生態"],
      items: [
        { label: "A. 植樹造林及修建梯田", basket: "治理水土流失" },
        { label: "B. 推動大型水利工程（如調水調沙）", basket: "治理河水氾濫" },
        { label: "C. 立法限制排污、設污水廠及禁捕政策", basket: "治理水污染及生態" }
      ],
      answer: "河水氾濫：B ｜ 水土流失：A ｜ 水污染及生態：C"
    },

    // U8 簡答題 (#14 ~ #18 — 四個選項字數與句式結構完全平衡對稱)
    {
      id: "hum_u8_14", unitKey: "hum_u8", qCategory: "hum_short", type: "short_qa", typeLabel: "簡答題",
      prompt: "【簡答題】為什麼我國超過九成的人口都選擇居住在東南部，而西北部人口卻非常稀少？",
      options: [
        "西北部地勢高、山勢陡峭且寒冷乾燥，不利農業與交通；東南部多平原、氣候溫和、雨水充足，有利農業、交通及生活。",
        "西北部地勢低平、全年酷熱多雨且經常發生水災；東南部全屬高寒山地、終年積雪但礦產豐富，因此人口集中在東南部。",
        "西北部擁有大片紅樹林濕地與海洋保護區，禁止人類開發居住；東南部全是沙漠與戈壁盆地，土地廣闊適合興建高樓。",
        "西北部氣候溫暖潮濕、河流眾多但只准發展林業；東南部氣候嚴寒乾燥、缺乏淡水資源，居民為了採礦而聚集在東南部。"
      ],
      answer: "西北部地勢高、山勢陡峭且寒冷乾燥，不利農業與交通；東南部多平原、氣候溫和、雨水充足，有利農業、交通及生活。"
    },
    {
      id: "hum_u8_15", unitKey: "hum_u8", qCategory: "hum_short", type: "short_qa", typeLabel: "簡答題",
      prompt: "【簡答題】為什麼我國會有「北方人吃麵食，南方人吃米食」的差異？",
      options: [
        "因為北方氣候較乾旱，適合小麥生長（製成麵條、饅頭）；南方氣候溫暖潮濕，適合水稻生長（加工成米飯）。",
        "因為北方氣候溫暖多雨，適合種植熱帶水稻；南方氣候寒冷乾燥，適合種植耐寒小麥，兩地居民互相交換農作物。",
        "因為北方地區全部屬於海洋漁業區，缺乏耕地種植水稻；南方地區全部屬於高山牧區，只適合開墾梯田種植小麥。",
        "因為北方傳統習俗規定全年只准食用麵粉製品；南方傳統習俗規定只准食用稻米，這與當地的氣候及農作物無關。"
      ],
      answer: "因為北方氣候較乾旱，適合小麥生長（製成麵條、饅頭）；南方氣候溫暖潮濕，適合水稻生長（加工成米飯）。"
    },
    {
      id: "hum_u8_16", unitKey: "hum_u8", qCategory: "hum_short", type: "short_qa", typeLabel: "簡答題",
      prompt: "【簡答題】河流對我國人民的生活發揮了哪些重要作用？（請舉出六項）",
      options: [
        "(1)灌溉農作物；(2)水路運輸；(3)水力發電；(4)日常生活飲用；(5)工業生產；(6)捕食及養殖水產。",
        "(1)開採地下煤炭；(2)製造沙漠地形；(3)阻擋季候風暴；(4)減少空氣濕度；(5)提供高原牧場；(6)降低地球氣溫。",
        "(1)引發板塊移動；(2)形成火山岩柱；(3)加速土壤流失；(4)取代陸路交通；(5)提供天然石油；(6)消除工業噪音。",
        "(1)提供冬季溜冰；(2)埋藏遠古化石；(3)抬高下游河牀；(4)形成內陸盆地；(5)吸收太陽紫外線；(6)製造人工降雪。"
      ],
      answer: "(1)灌溉農作物；(2)水路運輸；(3)水力發電；(4)日常生活飲用；(5)工業生產；(6)捕食及養殖水產。"
    },
    {
      id: "hum_u8_17", unitKey: "hum_u8", qCategory: "hum_short", type: "short_qa", typeLabel: "簡答題",
      prompt: "【簡答題】河流流域的「水土流失」危機是由什麼原因造成的？國家採取了什麼措施治理，並取得了什麼成就？",
      options: [
        "原因：過度開墾和過度伐木令土壤貧瘠鬆散。措施與成就：利用植樹和修建梯田減少侵蝕，平均每年減少土壤流失達16億噸。",
        "原因：河流魚類繁殖過多及船隻航行太密。措施與成就：全面實施十年禁漁及限制航運，平均每年增加河水流量達16億噸。",
        "原因：上游興建過多水力發電站及水庫大壩。措施與成就：拆卸沿岸水壩並將河道填平為耕地，每年增加農業產量達16億噸。",
        "原因：冬季氣候嚴寒令河水長期結冰膨脹。措施與成就：在河岸鋪設塑膠保溫層及人工增雨，每年減少河牀結冰達16億噸。"
      ],
      answer: "原因：過度開墾和過度伐木令土壤貧瘠鬆散。措施與成就：利用植樹和修建梯田減少侵蝕，平均每年減少土壤流失達16億噸。"
    },
    {
      id: "hum_u8_18", unitKey: "hum_u8", qCategory: "hum_short", type: "short_qa", typeLabel: "簡答題",
      prompt: "【簡答題】為什麼保護水資源對我國的「國家安全（生態安全）」非常重要？",
      options: [
        "因為水是人類必需品，缺水會嚴重影響民生和經濟；若水資源被濫用或污染，生態環境便會被破壞，故必須確保水資源安全。",
        "因為水資源可以直接代替煤炭和石油作為汽車燃料；若水資源減少，全國所有交通工具都會停駛，故必須確保水資源安全。",
        "因為只要擁有充足的水資源就不需要發展農業和工業；若河流水位下降，沿海城市就會立即變成沙漠，故必須保護水資源。",
        "因為保護水資源純粹是為了吸引外國遊客前來觀光；若河水變混濁，風景區門票收入便會大幅減少，故必須確保水資源清澈。"
      ],
      answer: "因為水是人類必需品，缺水會嚴重影響民生和經濟；若水資源被濫用或污染，生態環境便會被破壞，故必須確保水資源安全。"
    },

    // U8 看圖填充題 (#19 ~ #22)
    {
      id: "hum_u8_19", unitKey: "hum_u8", qCategory: "hum_img_fill", type: "image_fill", typeLabel: "看圖填充題",
      svgKey: "hum_u8_yurt_grassland",
      prompt: "我國西部草原地區盛產 ________（物產），當地牧民多居住在方便拆卸遷徙的 ________（房屋）。",
      blanks: ["肉類", "蒙古包"], distractors: ["水產", "吊腳樓", "四合院"]
    },
    {
      id: "hum_u8_20", unitKey: "hum_u8", qCategory: "hum_img_fill", type: "image_fill", typeLabel: "看圖填充題",
      svgKey: "hum_u8_river_uses",
      prompt: "這幅圖顯示河流具有水力 ________、水路 ________ 以及農業 ________ 的重要功能。",
      blanks: ["發電", "運輸", "灌溉"], distractors: ["開墾", "排污", "伐木"]
    },
    {
      id: "hum_u8_21", unitKey: "hum_u8", qCategory: "hum_img_fill", type: "image_fill", typeLabel: "看圖填充題",
      svgKey: "hum_u8_terraces",
      prompt: "圖中展示我國青海省利用修建 ________ 的方法，有效治理 ________ 的生態危機。",
      blanks: ["梯田", "水土流失"], distractors: ["魚塘", "空氣污染", "溫室效應"]
    },
    {
      id: "hum_u8_22", unitKey: "hum_u8", qCategory: "hum_img_fill", type: "image_fill", typeLabel: "看圖填充題",
      svgKey: "hum_u8_stilt_house",
      prompt: "這種特色房屋稱為 ________，能適應南方山坡、河谷及濕熱的天氣，具有 ________ 通風的作用。",
      blanks: ["吊腳樓", "防潮"], distractors: ["窰洞", "保暖", "防風沙"]
    },

    // U8 選擇題 (#23 ~ #27 — 選項長度對稱一致)
    {
      id: "hum_u8_23", unitKey: "hum_u8", qCategory: "hum_mcq", type: "mcq", typeLabel: "選擇題",
      prompt: "以下哪一項關於「黑河—騰衝線」的描述是正確的？",
      options: [
        "A. 分界線的西北部面積較小，但人口密度卻是全國最高",
        "B. 線的東南部面積約佔全國43.8%，卻居住了超過九成的人口",
        "C. 這條分界線將我國平均劃分為南方和北方兩個相等區域",
        "D. 分界線的西北部地勢平坦開闊，而且全年雨水非常充足"
      ],
      answer: "B. 線的東南部面積約佔全國43.8%，卻居住了超過九成的人口"
    },
    {
      id: "hum_u8_24", unitKey: "hum_u8", qCategory: "hum_mcq", type: "mcq", typeLabel: "選擇題",
      prompt: "為了保護黃河、長江和瀾滄江三大河流的源頭，我國在青藏高原設立了什麼保護區？",
      options: [
        "A. 珠江紅樹林濕地自然保護區及海岸公園",
        "B. 黃土高原水土保持林木栽植生態保護區",
        "C. 三江源自然保護區及三江源國家公園",
        "D. 長江三峽奇峯古蹟自然生態國家公園"
      ],
      answer: "C. 三江源自然保護區及三江源國家公園"
    },
    {
      id: "hum_u8_25", unitKey: "hum_u8", qCategory: "hum_mcq", type: "mcq", typeLabel: "選擇題",
      prompt: "以下哪一項描述是不正確的？",
      options: [
        "A. 青藏高原是黃河和珠江的發源地",
        "B. 黃河流經黃土高原時帶走大量泥沙，令河水變黃",
        "C. 長江三峽兩岸滿佈奇峯和古蹟，是著名的旅遊景點",
        "D. 黃河是我國歷史上氾濫次數最多的河流之一"
      ],
      answer: "A. 青藏高原是黃河和珠江的發源地"
    },
    {
      id: "hum_u8_26", unitKey: "hum_u8", qCategory: "hum_mcq", type: "multi_mcq", typeLabel: "選擇題(可多選)",
      prompt: "針對家居、工業、農業污水流入河道，以及水產過度捕撈的問題，國家採取了什麼措施？（可選多於一項）",
      options: ["A. 立法限制水污染", "B. 設立污水處理廠淨化水質", "C. 開展《長江十年禁漁計劃》等禁捕政策", "D. 填平河道改建為農地"],
      answers: ["A. 立法限制水污染", "B. 設立污水處理廠淨化水質", "C. 開展《長江十年禁漁計劃》等禁捕政策"],
      answer: "A. 立法限制水污染、B. 設立污水處理廠淨化水質、C. 開展《長江十年禁漁計劃》等禁捕政策"
    },
    {
      id: "hum_u8_27", unitKey: "hum_u8", qCategory: "hum_mcq", type: "mcq", typeLabel: "選擇題",
      prompt: "北京等北方平原地區常見的傳統建築「四合院」，具有什麼建築特點？",
      options: [
        "A. 在深厚的黃土山坡上挖掘洞穴而成，冬暖夏涼",
        "B. 四周建有房屋，將庭院圍在中間，能防風和防寒",
        "C. 用堅固的竹木柱支撐懸空搭建在山坡或水面上",
        "D. 用厚毛氈覆蓋在圓形木架上，方便隨時拆卸遷徙"
      ],
      answer: "B. 四周建有房屋，將庭院圍在中間，能防風和防寒"
    },

    // U8 問答題(情境題) (#28 ~ #30 — 四個選項字數與結構完全平衡對稱)
    {
      id: "hum_u8_28", unitKey: "hum_u8", qCategory: "hum_scenario", type: "short_qa", typeLabel: "問答題(情境題)",
      prompt: "【時事情境】新聞報道：「受持續暴雨影響，全國27條河流出現超警戒水位洪水，南方多地受災，張家界市有人被洪水沖走。當地出動武警防洪，國家緊急調運八萬多件救災物資到災區。」(1) 暴雨引發什麼災害與後果？ (2) 政府採取了什麼即時應對措施？",
      options: [
        "(1) 引發河水氾濫（洪水），導致財物損失及人命傷亡。(2) 出動武警防洪救援，並緊急調運帳篷、摺牀等救災物資到災區。",
        "(1) 引發嚴重乾旱及土地沙漠化，導致農作物失收。(2) 立即派飛機進行人工增雨，並關閉沿岸所有水庫儲水以供應食水。",
        "(1) 引發大規模沙塵暴及寒潮，導致陸路交通中斷。(2) 安排受影響居民全部遷往草原蒙古包居住，並派發禦寒毛皮衣物。",
        "(1) 引發地殼板塊移動及地震，導致山脈岩石崩塌。(2) 立即在受災河道開展十年禁漁計劃，並興建污水處理廠淨化水質。"
      ],
      answer: "(1) 引發河水氾濫（洪水），導致財物損失及人命傷亡。(2) 出動武警防洪救援，並緊急調運帳篷、摺牀等救災物資到災區。"
    },
    {
      id: "hum_u8_29", unitKey: "hum_u8", qCategory: "hum_scenario", type: "short_qa", typeLabel: "問答題(情境題)",
      prompt: "【承上題情境】從長遠來看，國家及河流附近的居民有什麼方法可以預防及減低「河水氾濫」帶來的危機？",
      options: [
        "國家：推動大型水利工程（興建水壩、調水調沙）及植樹造林保持水土。居民：留意水位預警、暴雨遠離河道、配合疏散及不非法開墾。",
        "國家：把所有經常氾濫的天然河道全部填平改建為高速公路。居民：在乾涸的河牀正中央建造房屋居住，並大量砍伐河岸兩旁的樹木。",
        "國家：全面停止所有水利工程，任由河水自然流向低窪城市。居民：在暴雨期間前往河岸捕撈水產，並把家居垃圾倒入河中阻擋水流。",
        "國家：將東南部所有居民強制遷移到西北部高山沙漠地區定居。居民：完全不需要留意天氣預報，也不用配合防洪疏散指示。"
      ],
      answer: "國家：推動大型水利工程（興建水壩、調水調沙）及植樹造林保持水土。居民：留意水位預警、暴雨遠離河道、配合疏散及不非法開墾。"
    },
    {
      id: "hum_u8_30", unitKey: "hum_u8", qCategory: "hum_scenario", type: "short_qa", typeLabel: "問答題(情境題)",
      prompt: "【情境】假設你要到內蒙古草原及陝西黃土高原進行考察，你會分別看到當地居民居住在什麼傳統特色房屋？為什麼他們會建造這樣的房屋？",
      options: [
        "內蒙古草原：蒙古包（適應草原遊牧，方便拆卸遷徙並抵禦風沙）；黃土高原：窰洞（氣候乾燥少雨且缺木材，利用深厚黃土就地取材，冬暖夏涼）。",
        "內蒙古草原：吊腳樓（利用長木柱將房屋懸空，以適應潮濕多雨的草原氣候）；黃土高原：四合院（四周建有房屋圍住庭院，方便隨季節拆卸遷徙）。",
        "內蒙古草原：窰洞（在草原地底挖掘深穴居住，防止牛羊走失）；黃土高原：蒙古包（利用毛氈搭建帳幕，以適應高原全年多雨潮濕的河谷環境）。",
        "內蒙古草原：四合院（用磚石建造固定大宅，適合終年定居耕種水稻）；黃土高原：吊腳樓（依山傍水搭建竹木高樓，有助抵禦黃土高原的暴風雪）。"
      ],
      answer: "內蒙古草原：蒙古包（適應草原遊牧，方便拆卸遷徙並抵禦風沙）；黃土高原：窰洞（氣候乾燥少雨且缺木材，利用深厚黃土就地取材，冬暖夏涼）。"
    },

    // ==================== 第四部分：U9 文化遺產 (30題) ====================
    { id: "hum_u9_01", unitKey: "hum_u9", qCategory: "hum_fill", type: "fill_blank", typeLabel: "填充題", prompt: "我國是一個多民族的國家，共有 ________ 個民族，其中 ________ 族人口超過九成，其餘 ________ 個為少數民族。", blanks: ["56", "漢", "55"], distractors: ["50", "滿", "49"] },
    { id: "hum_u9_02", unitKey: "hum_u9", qCategory: "hum_fill", type: "fill_blank", typeLabel: "填充題", prompt: "我國少數民族的主要聚居地包括五個自治區：新疆維吾爾自治區、________ 自治區、________ 自治區、寧夏回族自治區、________ 壯族自治區，以及多民族聚居的 ________ 省。", blanks: ["內蒙古", "西藏", "廣西", "雲南"], allowSwapIndices: [0, 1], distractors: ["廣東", "四川", "青海"] },
    { id: "hum_u9_03", unitKey: "hum_u9", qCategory: "hum_fill", type: "fill_blank", typeLabel: "填充題", prompt: "各少數民族聚居的地方實行 ________ 制度，以促進民族平等、團結、互助，所有民族自治地方都是中國 ________ 的部分。", blanks: ["區域自治", "不可分離"], distractors: ["獨立管理", "各自發展", "臨時劃分"] },
    { id: "hum_u9_04", unitKey: "hum_u9", qCategory: "hum_fill", type: "fill_blank", typeLabel: "填充題", prompt: "蒙古族使用 ________ 文，傳統飲食有烤全羊和 ________，重要傳統活動是「________ 大會」。", blanks: ["蒙古", "乾奶酪", "那達慕"], distractors: ["東巴", "麗江粑粑", "潑水"] },
    { id: "hum_u9_05", unitKey: "hum_u9", qCategory: "hum_fill", type: "fill_blank", typeLabel: "填充題", prompt: "雲南省納西族使用獨特的 ________ 文，特色食物有麗江粑粑和 ________，傳統節日是祭祀民族保護神的「________ 節」。", blanks: ["東巴", "雞豆涼粉", "三多"], distractors: ["蒙古", "乾奶酪", "火把"] },
    { id: "hum_u9_06", unitKey: "hum_u9", qCategory: "hum_fill", type: "fill_blank", typeLabel: "填充題", prompt: "位於西藏拉薩市的 ________ 歷史建築羣，是藏傳佛教聖地；位於四川省的 ________ 大佛，建於唐朝，是世界最大的石刻佛像。", blanks: ["布達拉宮", "樂山"], distractors: ["明十三陵", "開平", "花山"] },
    { id: "hum_u9_07", unitKey: "hum_u9", qCategory: "hum_fill", type: "fill_blank", typeLabel: "填充題", prompt: "廣東省開平市的 ________ 是1920至1930年代華僑為防禦土匪而建，具中西合璧風格；廣西崇左市的 ________ 則是壯族祖先以紅色顏料繪畫的崖壁畫。", blanks: ["開平碉樓", "花山岩畫"], distractors: ["布達拉宮", "樂山大佛", "莫高窟"] },
    { id: "hum_u9_08", unitKey: "hum_u9", qCategory: "hum_fill", type: "fill_blank", typeLabel: "填充題", prompt: "國家積極向聯合國教科文組織申報，把文化遺產列入《________ 名錄》，並訂立《________ 法》等法律保護歷史古蹟。", blanks: ["世界遺產", "文物保護"], distractors: ["自然公園", "城市規劃", "旅遊發展"] },

    // U9 分類題 (#9 ~ #13) -> 分類籃
    {
      id: "hum_u9_09", unitKey: "hum_u9", qCategory: "hum_classify", type: "classify", typeLabel: "分類題",
      prompt: "【少數民族服飾配對分類】請將傳統服飾放入對應的少數民族分類籃：",
      baskets: ["苗族", "維吾爾族", "蒙古族", "彝族", "藏族"],
      items: [
        { label: "A. 刺繡和精緻銀飾（保平安）", basket: "苗族" },
        { label: "B. 花帽和長袍", basket: "維吾爾族" },
        { label: "C. 蒙古袍", basket: "蒙古族" },
        { label: "D. 帽子和披風", basket: "彝族" },
        { label: "E. 藏袍和項鍊", basket: "藏族" }
      ],
      answer: "苗族：A ｜ 維吾爾族：B ｜ 蒙古族：C ｜ 彝族：D ｜ 藏族：E"
    },
    {
      id: "hum_u9_10", unitKey: "hum_u9", qCategory: "hum_classify", type: "classify", typeLabel: "分類題",
      prompt: "【少數民族聚居地環境分類】請將地理與氣候特徵放入對應地區分類籃：",
      baskets: ["新疆維吾爾自治區", "西藏自治區", "寧夏回族自治區", "雲南省"],
      items: [
        { label: "A. 高山盆地沙漠為主，夏酷熱冬嚴寒", basket: "新疆維吾爾自治區" },
        { label: "B. 位於青藏高原，氣候高寒，晝夜溫差大", basket: "西藏自治區" },
        { label: "C. 高原沙漠為主，盛產枸杞、葡萄、羊肉", basket: "寧夏回族自治區" },
        { label: "D. 低海拔熱帶雨林、高海拔寒雪，孕育多元民族", basket: "雲南省" }
      ],
      answer: "新疆：A ｜ 西藏：B ｜ 寧夏：C ｜ 雲南：D"
    },
    {
      id: "hum_u9_11", unitKey: "hum_u9", qCategory: "hum_classify", type: "classify", typeLabel: "分類題",
      prompt: "【少數民族節慶分類】請將節慶活動放入對應的少數民族分類籃：",
      baskets: ["傣族", "彝族", "蒙古族", "納西族"],
      items: [
        { label: "A. 潑水節（互相潑水祈求消災除病）", basket: "傣族" },
        { label: "B. 火把節（點燃營火火把遊行驅邪祈福）", basket: "彝族" },
        { label: "C. 那達慕大會（賽馬、摔跤和射箭比賽）", basket: "蒙古族" },
        { label: "D. 三多節（農曆二月初八祭祀保護神）", basket: "納西族" }
      ],
      answer: "傣族：A ｜ 彝族：B ｜ 蒙古族：C ｜ 納西族：D"
    },
    {
      id: "hum_u9_12", unitKey: "hum_u9", qCategory: "hum_classify", type: "classify", typeLabel: "分類題",
      prompt: "【文化遺產地點分類】請將四項文化遺產放入所在地區分類籃：",
      baskets: ["西藏自治區", "廣東省", "四川省", "廣西壯族自治區"],
      items: [
        { label: "A. 布達拉宮歷史建築羣", basket: "西藏自治區" },
        { label: "B. 開平碉樓", basket: "廣東省" },
        { label: "C. 峨眉山—樂山大佛", basket: "四川省" },
        { label: "D. 花山岩畫", basket: "廣西壯族自治區" }
      ],
      answer: "西藏：A ｜ 廣東：B ｜ 四川：C ｜ 廣西：D"
    },
    {
      id: "hum_u9_13", unitKey: "hum_u9", qCategory: "hum_classify", type: "classify", typeLabel: "分類題",
      prompt: "【參觀古蹟行為分類】請將參觀文化遺產時的行為放入對應分類籃：",
      baskets: ["正確保育行為", "破壞文物行為"],
      items: [
        { label: "A. 不觸摸、不攀爬文物", basket: "正確保育行為" },
        { label: "B. 用閃光燈拍攝禁止閃光燈的青花瓷瓶", basket: "破壞文物行為" },
        { label: "C. 聽從導覽員或標示指示", basket: "正確保育行為" },
        { label: "D. 將垃圾丟入分類箱保持整潔", basket: "正確保育行為" },
        { label: "E. 跨越圍欄撫摸古蹟石獅子及古炮台", basket: "破壞文物行為" }
      ],
      answer: "正確保育：A、C、D ｜ 破壞文物：B、E"
    },

    // U9 簡答題 (#14 ~ #18 — 四個選項字數與句式結構完全平衡對稱)
    {
      id: "hum_u9_14", unitKey: "hum_u9", qCategory: "hum_short", type: "short_qa", typeLabel: "簡答題",
      prompt: "【簡答題】少數民族的傳統服飾除了美觀和代表民族身份外，還有什麼實際功能？（可結合聚居地環境說明）",
      options: [
        "具有適應當地氣候環境和生活方式的實用功能，例如蒙古袍和藏袍能抵禦高原與草原的嚴寒及晝夜溫差；苗族銀飾則被視為保平安。",
        "純粹為了在節日慶典舞台上進行歌舞表演而設計，服飾材質極為單薄易碎，在日常放牧或耕種生活中完全不能穿戴及抵禦風寒。",
        "所有少數民族的傳統服飾都是為了適應海洋潛水及熱帶水上活動而設計，例如藏袍和蒙古袍的主要功能是防水透氣及快速排汗。",
        "主要用來區分家族財富與社會階級，服飾越厚重代表居住的地方氣候越炎熱潮濕；與當地的自然地理環境及保暖需求完全無關。"
      ],
      answer: "具有適應當地氣候環境和生活方式的實用功能，例如蒙古袍和藏袍能抵禦高原與草原的嚴寒及晝夜溫差；苗族銀飾則被視為保平安。"
    },
    {
      id: "hum_u9_15", unitKey: "hum_u9", qCategory: "hum_short", type: "short_qa", typeLabel: "簡答題",
      prompt: "【簡答題】什麼是「民族團結」？我國實行區域自治制度有什麼目的？",
      options: [
        "民族團結：各民族友好相處、互相尊重包容幫助，齊心維護國家統一。自治制度目的：促進民族平等、團結、互助，鞏固國家統一。",
        "民族團結：要求所有少數民族放棄原有的語言文字、飲食和傳統節日。自治制度目的：讓各個民族地區各自獨立管理、互不往來。",
        "民族團結：只適用於人口佔多數的漢族居民，不包括五十五個少數民族。自治制度目的：將所有少數民族集中在同一個省份居住。",
        "民族團結：規定全國各族人民必須穿戴完全相同的服飾及居住相同房屋。自治制度目的：純粹為了開發旅遊景點以增加門票收入。"
      ],
      answer: "民族團結：各民族友好相處、互相尊重包容幫助，齊心維護國家統一。自治制度目的：促進民族平等、團結、互助，鞏固國家統一。"
    },
    {
      id: "hum_u9_16", unitKey: "hum_u9", qCategory: "hum_short", type: "short_qa", typeLabel: "簡答題",
      prompt: "【簡答題】為什麼不同少數民族在飲食、文字和風俗上會有各自獨特的生活方式？",
      options: [
        "因為各民族居住地區的地理環境、氣候、歷史文化和資源條件都不相同，因而孕育出多姿多彩的生活方式。",
        "因為國家規定每個少數民族每年必須透過抽籤方式，重新更改自己民族的傳統文字、飲食習慣與節日風俗。",
        "因為五十五個少數民族都居住在氣候與地形完全相同的沙漠環境，為了刻意標奇立異而人為創造出不同習俗。",
        "因為各民族的生活方式純粹受外國流行文化影響而形成，與當地本身的地理環境、氣候特徵和歷史文化無關。"
      ],
      answer: "因為各民族居住地區的地理環境、氣候、歷史文化和資源條件都不相同，因而孕育出多姿多彩的生活方式。"
    },
    {
      id: "hum_u9_17", unitKey: "hum_u9", qCategory: "hum_short", type: "short_qa", typeLabel: "簡答題",
      prompt: "【簡答題】什麼是「文化遺產」？我國政府在保育文化遺產方面採取了哪兩大類措施？",
      options: [
        "定義：從歷史、藝術或科學角度看具突出普遍價值的文物、建築和遺址。措施：(1)法律與政策保護（申報世遺、訂立《文物保護法》）；(2)修復與維護工程。",
        "定義：現代城市最新興建的大型購物商場、主題樂園與玻璃幕牆摩天大廈。措施：(1)將所有舊古蹟拆卸重建；(2)在遺址上塗上鮮艷油漆並加裝霓虹燈飾。",
        "定義：只存在於外國而我國境內完全沒有的古代歷史建築與石刻雕像。措施：(1)永久封閉所有博物館禁止市民參觀；(2)任由古蹟自然風化不作任何維護。",
        "定義：大自然隨季節變化而產生的雨、雪、雹、霧、霜等日常天氣現象。措施：(1)利用人工增雨改變古蹟外貌；(2)允許遊客隨意攀爬及觸摸古代文物。"
      ],
      answer: "定義：從歷史、藝術或科學角度看具突出普遍價值的文物、建築和遺址。措施：(1)法律與政策保護（申報世遺、訂立《文物保護法》）；(2)修復與維護工程。"
    },
    {
      id: "hum_u9_18", unitKey: "hum_u9", qCategory: "hum_short", type: "short_qa", typeLabel: "簡答題",
      prompt: "【簡答題】作為普通市民和學生，我們在參觀古蹟和博物館時，應該遵守哪三項基本守則來保護文化遺產？",
      options: [
        "(1) 不觸摸、不攀爬文物；(2) 聽從導覽員或標示指示（如不使用閃光燈）；(3) 保持環境整潔，不亂拋垃圾。",
        "(1) 跨越圍欄近距離撫摸文物；(2) 開啟強光閃光燈拍攝古畫與瓷器；(3) 在古蹟牆壁上刻字簽名留念。",
        "(1) 將古蹟的小碎片帶回家中研究；(2) 在博物館展廳內奔跑追逐及飲食；(3) 爬上古代石獅子拍照打卡。",
        "(1) 無視館內的禁止標示自由行動；(2) 用手拍打古建築木柱測試穩固度；(3) 將果皮及飲品樽留在展櫃上。"
      ],
      answer: "(1) 不觸摸、不攀爬文物；(2) 聽從導覽員或標示指示（如不使用閃光燈）；(3) 保持環境整潔，不亂拋垃圾。"
    },

    // U9 看圖填充題 (#19 ~ #22)
    {
      id: "hum_u9_19", unitKey: "hum_u9", qCategory: "hum_img_fill", type: "image_fill", typeLabel: "看圖填充題",
      svgKey: "hum_u9_uyghur_boy",
      prompt: "圖中頭戴花帽、身穿長袍、住在新疆並多吃牛羊肉的男孩屬於 ________ 族。",
      blanks: ["維吾爾"], distractors: ["苗", "傣", "納西"]
    },
    {
      id: "hum_u9_20", unitKey: "hum_u9", qCategory: "hum_img_fill", type: "image_fill", typeLabel: "看圖填充題",
      svgKey: "hum_u9_miao_girl",
      prompt: "圖中頭戴精緻銀冠和銀項圈、相信銀器有保平安作用的女孩屬於 ________ 族。",
      blanks: ["苗"], distractors: ["蒙古", "維吾爾", "藏"]
    },
    {
      id: "hum_u9_21", unitKey: "hum_u9", qCategory: "hum_img_fill", type: "image_fill", typeLabel: "看圖填充題",
      svgKey: "hum_u9_potala_palace",
      prompt: "這項文化遺產是位於西藏拉薩市的 ________，是藏傳佛教聖地。",
      blanks: ["布達拉宮歷史建築羣"], distractors: ["開平碉樓", "樂山大佛", "花山岩畫"]
    },
    {
      id: "hum_u9_22", unitKey: "hum_u9", qCategory: "hum_img_fill", type: "image_fill", typeLabel: "看圖填充題",
      svgKey: "hum_u9_museum_flash",
      prompt: "圖中男遊客的行為是 ________（正確／不正確）的，因為他沒有 ________ 標示的指示，強光會損害文物。",
      blanks: ["不正確", "聽從"], distractors: ["正確", "違反", "忽略"]
    },

    // U9 選擇題 (#23 ~ #27 — 選項長度對稱一致)
    {
      id: "hum_u9_23", unitKey: "hum_u9", qCategory: "hum_mcq", type: "mcq", typeLabel: "選擇題",
      prompt: "以下哪個地方以「高原為主，地勢平坦開闊，擁有寬廣草原，適合放牧生活方式」而聞名？",
      options: ["A. 新疆維吾爾自治區", "B. 內蒙古自治區", "C. 廣西壯族自治區", "D. 雲南省"],
      answer: "B. 內蒙古自治區"
    },
    {
      id: "hum_u9_24", unitKey: "hum_u9", qCategory: "hum_mcq", type: "mcq", typeLabel: "選擇題",
      prompt: "每年四月（傣曆新年）舉行的「潑水節」是哪個少數民族的盛大節日？",
      options: ["A. 彝族", "B. 納西族", "C. 傣族", "D. 藏族"],
      answer: "C. 傣族"
    },
    {
      id: "hum_u9_25", unitKey: "hum_u9", qCategory: "hum_mcq", type: "mcq", typeLabel: "選擇題",
      prompt: "關於雲南省納西族所使用的「東巴文」，以下哪項描述是正確的？",
      options: [
        "A. 它是一種由二十六個拉丁字母組成的拼音文字",
        "B. 它是一種圖畫象形文字，常刻畫在石頭或木紙上",
        "C. 它是內蒙古草原牧民專門用來記錄賽馬的文字",
        "D. 它是在二十世紀才發明、只用於現代電腦的符號"
      ],
      answer: "B. 它是一種圖畫象形文字，常刻畫在石頭或木紙上"
    },
    {
      id: "hum_u9_26", unitKey: "hum_u9", qCategory: "hum_mcq", type: "mcq", typeLabel: "選擇題",
      prompt: "以下哪一項文化遺產是由華僑在1920至1930年代為了防禦土匪而建，並具有中西合璧的建築風格？",
      options: ["A. 北京明十三陵", "B. 四川樂山大佛", "C. 廣東開平碉樓", "D. 廣西花山岩畫"],
      answer: "C. 廣東開平碉樓"
    },
    {
      id: "hum_u9_27", unitKey: "hum_u9", qCategory: "hum_mcq", type: "mcq", typeLabel: "選擇題",
      prompt: "我國對北京故宮等古蹟進行修復與維護工程時，會遵循什麼重要原則？",
      options: [
        "A. 將原有的木結構全部拆卸，並改建成現代化的玻璃幕牆大廈",
        "B. 在保留原有建築風格的前提下，重點解決結構老化和防災等問題",
        "C. 任由古蹟在風雨中自然風化坍塌，完全不作任何人工修復與維護",
        "D. 把所有古代建築外牆塗上鮮艷的現代塑膠油漆，並加裝扶手電梯"
      ],
      answer: "B. 在保留原有建築風格的前提下，重點解決結構老化和防災等問題"
    },

    // U9 問答題(情境題) (#28 ~ #30 — 四個選項字數與結構完全平衡對稱)
    {
      id: "hum_u9_28", unitKey: "hum_u9", qCategory: "hum_scenario", type: "short_qa", typeLabel: "問答題(情境題)",
      prompt: "【情境】在博物館參觀時，你看到一個小男孩無視「請勿觸摸」的告示牌，伸手去摸古代大炮的木輪。(1) 男孩子的行為正確嗎？為什麼？ (2) 看到這個情況，你會怎樣做？",
      options: [
        "(1) 不正確，觸摸文物會加速文物損壞或老化。(2) 上前有禮貌地勸阻，提醒他看告示牌，或通知工作人員處理。",
        "(1) 非常正確，親手觸摸文物才能深入認識歷史。(2) 立即走上前跟他一起排隊撫摸古代大炮的木輪，並爬上去拍照。",
        "(1) 不正確，因為古代大炮只准成年遊客觸摸。(2) 當場對着小男孩大聲喝罵並用力推開他，自行沒收他的入場門票。",
        "(1) 非常正確，告示牌只是裝飾用途不必理會。(2) 拿出相機開啟強光閃光燈幫小男孩與古代大炮近距離拍攝合照留念。"
      ],
      answer: "(1) 不正確，觸摸文物會加速文物損壞或老化。(2) 上前有禮貌地勸阻，提醒他看告示牌，或通知工作人員處理。"
    },
    {
      id: "hum_u9_29", unitKey: "hum_u9", qCategory: "hum_scenario", type: "short_qa", typeLabel: "問答題(情境題)",
      prompt: "【情境】學校舉辦「少數民族節日嘉年華」，有同學看到少數民族的傳統服飾和風俗跟自己平時的生活習慣很不一樣，便在旁取笑他們奇怪。你會怎樣勸導這位同學？",
      options: [
        "告訴他我國是多民族國家，各民族因地理和歷史不同而發展出獨特文化；我們應尊重、包容和欣賞不同民族文化，促進民族團結。",
        "認同這位同學的說法，並跟隨他一起在攤位旁邊大聲取笑少數民族的傳統服飾和風俗；因為所有人都應該只穿完全相同的現代服裝。",
        "叫這位同學不要大聲說出來以免被老師責罰，但自己在心裡面也認為少數民族的飲食和節日風俗非常古怪落後，不值得去認識。",
        "立即向校長投訴並要求學校取消「少數民族節日嘉年華」活動；因為展示不同民族的傳統文化會令同學產生分歧，無助文化交流。"
      ],
      answer: "告訴他我國是多民族國家，各民族因地理和歷史不同而發展出獨特文化；我們應尊重、包容和欣賞不同民族文化，促進民族團結。"
    },
    {
      id: "hum_u9_30", unitKey: "hum_u9", qCategory: "hum_scenario", type: "short_qa", typeLabel: "問答題(情境題)",
      prompt: "【情境】外國朋友來中國旅遊，想參觀一處既能體驗少數民族宗教文化、又能欣賞宏偉古代建築的世界文化遺產。你會向他推薦課本中的哪一個景點？並提醒他參觀注意事項。",
      options: [
        "推薦：西藏拉薩「布達拉宮歷史建築羣」（藏傳佛教聖地，保存珍貴佛經壁畫）。注意：尊重宗教文化、不觸摸攀爬文物、聽從指示及保持整潔。",
        "推薦：現代城市新建的「大型機動遊戲主題樂園」（設有多種刺激過山車）。注意：可以在古蹟牆壁上隨意塗鴉刻字、跨越圍欄攀爬雕像拍照。",
        "推薦：珠江口岸的「紅樹林自然濕地保護區」（棲息着中華白海豚與黑臉琵鷺）。注意：參觀時必須全程開啟強光閃光燈拍攝壁畫及大聲喧嘩。",
        "推薦：市中心商業區的「現代化玻璃幕牆購物商場」（匯集國際名牌服飾店）。注意：參觀時不需要遵守任何導覽指示，可以隨手觸摸所有展品。"
      ],
      answer: "推薦：西藏拉薩「布達拉宮歷史建築羣」（藏傳佛教聖地，保存珍貴佛經壁畫）。注意：尊重宗教文化、不觸摸攀爬文物、聽從指示及保持整潔。"
    }
  ];

  Array.prototype.push.apply(window.Aetheria.QuestionBank.Humanities.QUESTIONS, MORE_HUM_QUESTIONS);
})();
