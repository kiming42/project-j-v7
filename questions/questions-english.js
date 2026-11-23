/* ============================================================================
 * 英文科獨立題庫 — 上半部 Part A (questions/questions-english.js - v7.0)
 * 教材：P4 English Vocab Booster (Chapters 1–5，共 190 個詞彙 ➔ 380 題串字及填充)
 * Part A 內含：Ch1 (34詞) + Ch2 (30詞) + Ch3 (45詞) = 109詞 ➔ 218 題
 * ============================================================================ */
window.Aetheria = window.Aetheria || {};
window.Aetheria.QuestionBank = window.Aetheria.QuestionBank || {};

(function() {
  function buildUnitQuestions(unitKey, entries) {
    const out = [];
    const total = entries.length;
    for (let i = 0; i < total; i++) {
      const [word, zh, level, sentence, ans] = entries[i];
      const num = String(i + 1).padStart(2, "0");
      const cleanSentence = sentence.replace(/_{3,}/g, "________");

      // 自動從同單元挑選 3 個不重複的干擾詞作為填充題字塊
      const distractors = [];
      for (let step = 1; step < total && distractors.length < 3; step++) {
        const cand = entries[(i + step * 3) % total][4];
        if (cand !== ans && distractors.indexOf(cand) === -1) {
          distractors.push(cand);
        }
      }

      // 1. 英文串字題 (Spelling)
      out.push({
        id: unitKey + "_sp_" + num,
        unitKey: unitKey,
        qCategory: "eng_spelling",
        type: "spelling",
        typeLabel: "英文串字 (" + level + ")",
        prompt: "【" + level + "】請拼寫出「" + zh + "」的英文：",
        word: word,
        meaning: zh,
        hint: cleanSentence,
        answer: word
      });

      // 2. 英文情境填充題 (Fill-in-the-blank)
      out.push({
        id: unitKey + "_fb_" + num,
        unitKey: unitKey,
        qCategory: "eng_fill",
        type: "fill_blank",
        typeLabel: "英文填充 (" + level + ")",
        prompt: cleanSentence + " （" + zh + "）",
        blanks: [ans],
        distractors: distractors,
        answer: ans
      });
    }
    return out;
  }

  const CH1_ENTRIES = [
    ["go rock climbing", "去攀石", "Key words", "Ben is brave and strong. He likes to __________________ on a climbing wall at weekends.", "go rock climbing"],
    ["go jogging", "去慢跑", "Key words", "Every morning, my dad and I put on our running shoes and __________________ in the park.", "go jogging"],
    ["go cycling", "去踏單車", "Key words", "We like to rent bicycles in Sha Tin and __________________ along the river.", "go cycling"],
    ["go ice-skating", "去溜冰", "Key words", "Mary wears a warm jacket when she goes to the rink to __________________.", "go ice-skating"],
    ["go to an indoor playground", "去室內遊樂場", "Key words", "When it rains heavily outside, children can still play on slides if they __________________.", "go to an indoor playground"],
    ["go to a public library", "去公共圖書館", "Key words", "I want to borrow some storybooks for free, so I will __________________ after school.", "go to a public library"],
    ["play tennis", "打網球", "Key words", "You need a racket and a small yellow ball to __________________ on the court.", "play tennis"],
    ["play volleyball", "打排球", "Key words", "Two teams hit a ball over a high net with their hands when they __________________.", "play volleyball"],
    ["play online games", "玩網上遊戲", "Key words", "My brother uses the Internet to __________________ with his classmates at night.", "play online games"],
    ["play video games", "玩電子遊戲", "Key words", "After finishing his homework, Leo turns on his TV console to __________________.", "play video games"],
    ["text my friend", "發短訊給我的朋友", "Key words", "I use my smartphone to __________________ when I want to ask her about our homework.", "text my friend"],
    ["read the newspaper", "看報紙", "Key words", "Grandpa buys a paper every morning so he can __________________ and learn about the news.", "read the newspaper"],
    ["read magazines", "看雜誌", "Key words", "Anna likes colourful photos and fashion stories, so she loves to __________________.", "read magazines"],
    ["surf the Net", "上網瀏覽", "LEVEL UP!", "I often use my computer to __________________ and look for information for my school project.", "surf the Net"],
    ["make video blogs", "製作影片網誌（拍 Vlog）", "LEVEL UP!", "Sam uses a camera to film his daily life because he loves to __________________.", "make video blogs"],
    ["watch online videos on social media platforms", "在社交媒體平台上觀看網上影片", "LEVEL UP!", "Many teenagers use their phones to __________________ like YouTube and Instagram.", "watch online videos on social media platforms"],
    ["play handball", "打手球", "LEVEL UP!", "Players run and throw a ball into the goal using their hands when they __________________.", "play handball"],
    ["play hockey", "打曲棍球", "LEVEL UP!", "You need a curved stick to hit a small hard ball when you __________________.", "play hockey"],
    ["play mini golf", "打迷你高爾夫球", "LEVEL UP!", "My family likes to __________________ on a small course with fun obstacles and holes.", "play mini golf"],
    ["do judo", "練柔道", "LEVEL UP!", "In Japan, many children wear white uniforms and __________________ to learn how to throw opponents safely.", "do judo"],
    ["do taekwondo", "練跆拳道", "LEVEL UP!", "This Korean martial art uses lots of high kicks. I __________________ every Saturday.", "do taekwondo"],
    ["do karate", "練空手道", "LEVEL UP!", "Tim is practising punches and kicks because he wants to get a black belt when he learns to __________________.", "do karate"],
    ["do kung fu", "練功夫", "LEVEL UP!", "We learn traditional Chinese martial arts when we __________________ with our master.", "do kung fu"],
    ["do fencing", "玩劍擊", "LEVEL UP!", "You must wear a protective mask and hold a long thin sword to __________________.", "do fencing"],
    ["do yoga", "做瑜伽", "LEVEL UP!", "My mum stretches her body and breathes slowly on a mat when she likes to __________________.", "do yoga"],
    ["go canoeing", "去划獨木舟（開放式）", "LEVEL UP!", "Several people sit in an open boat and move it across the lake when they __________________.", "go canoeing"],
    ["go kayaking", "去划皮划艇（單人/雙人艇）", "LEVEL UP!", "One person sits inside a narrow boat to __________________ on the calm sea.", "go kayaking"],
    ["a paddle", "一支槳（用於獨木舟/皮划艇）", "LEVEL UP!", "When you go kayaking, you hold __________________ with both hands to push the water.", "a paddle"],
    ["go rowing", "去划艇（賽艇）", "LEVEL UP!", "A team of four athletes sit facing backwards in a long boat to __________________ on the river.", "go rowing"],
    ["an oar", "一支划艇長槳", "LEVEL UP!", "Each person in the rowing boat holds __________________ that is attached to the side of the boat.", "an oar"],
    ["go rollerblading", "去踩滾軸溜冰鞋", "LEVEL UP!", "Kitty wears boots with a single line of wheels on the bottom to __________________ in the park.", "go rollerblading"],
    ["go skateboarding", "去玩滑板", "LEVEL UP!", "Jack stands on a small wooden board with four wheels to __________________ at the skate park.", "go skateboarding"],
    ["make jewellery", "製作首飾", "LEVEL UP!", "Wendy uses colourful beads and strings to __________________ like necklaces and bracelets.", "make jewellery"],
    ["make pottery", "製作陶器", "LEVEL UP!", "In art class, we shape wet clay with our hands to __________________ such as bowls and cups.", "make pottery"]
  ];

  const CH2_ENTRIES = [
    ["the news", "新聞報道", "Key words", "My parents watch __________________ every evening to find out what happened around the world.", "the news"],
    ["the weather report", "天氣報告", "Key words", "Let's watch __________________ to see if it will rain tomorrow before our picnic.", "the weather report"],
    ["a drama", "電視劇／連續劇", "Key words", "Mum loves watching __________________ about a family's love and daily life.", "a drama"],
    ["a game show", "遊戲節目", "Key words", "Players compete in fun challenges to win big prizes on __________________.", "a game show"],
    ["a pop music show", "流行音樂節目", "Key words", "Famous singers sing their newest hit songs live on __________________.", "a pop music show"],
    ["a documentary", "紀錄片", "Key words", "We watched __________________ about wild pandas in China and learnt many real facts.", "a documentary"],
    ["a sports show", "體育節目", "Key words", "Dad is a football fan, so he always watches __________________ on Sunday afternoons.", "a sports show"],
    ["a cartoon", "卡通片／動畫", "Key words", "My little sister laughs happily whenever she watches __________________ with funny animated animals.", "a cartoon"],
    ["a cooking show", "烹飪節目", "Key words", "Grandma watches __________________ to learn how to make new and tasty dishes.", "a cooking show"],
    ["a travel show", "旅遊節目", "Key words", "We love watching __________________ because we can see famous places in Japan and Europe.", "a travel show"],
    ["informative", "資訊豐富的／增長知識的", "Key words", "I like documentaries because they are very __________________ and teach me lots of useful facts.", "informative"],
    ["exciting", "令人興奮的／刺激的", "Key words", "The football match was so __________________ that we all cheered loudly until the final second.", "exciting"],
    ["interesting", "有趣的", "Key words", "This science programme is very __________________; I never feel sleepy while watching it.", "interesting"],
    ["touching", "感人的／動人的", "Key words", "The story about the loyal dog was so __________________ that tears rolled down my cheeks.", "touching"],
    ["boring", "沉悶的／無聊的", "Key words", "Tim fell asleep during the show because he thought it was too __________________.", "boring"],
    ["silly", "愚蠢的／幼稚的", "Key words", "I don't like that cartoon because the characters always do __________________ and foolish things.", "silly"],
    ["a talent show", "才藝表演節目", "LEVEL UP!", "People go on stage to sing, dance or do magic tricks on __________________.", "a talent show"],
    ["a performance", "一場表演／演出", "LEVEL UP!", "Everyone clapped loudly at the end of the dancer's amazing __________________.", "a performance"],
    ["a food programme", "飲食節目", "LEVEL UP!", "The presenter visits famous restaurants and tastes delicious meals on __________________.", "a food programme"],
    ["a children's show", "兒童節目", "LEVEL UP!", "Young kids love watching __________________ with colourful puppets, songs and simple games.", "a children's show"],
    ["a child performer", "小演員／童星", "LEVEL UP!", "The nine-year-old boy acted so well in the TV show; he is a very talented __________________.", "a child performer"],
    ["a quiz show", "問答遊戲節目", "LEVEL UP!", "Contestants must answer difficult general knowledge questions quickly on __________________.", "a quiz show"],
    ["a reality show", "真人騷", "LEVEL UP!", "Cameras follow ordinary people trying to survive on a wild island in __________________.", "a reality show"],
    ["a talk show", "清談節目／訪談節目", "LEVEL UP!", "Movie stars sit on a sofa and chat about their lives on __________________.", "a talk show"],
    ["a guest", "嘉賓", "LEVEL UP!", "Tonight's talk show invited a famous Olympic swimmer to be __________________.", "a guest"],
    ["a host", "節目主持人", "LEVEL UP!", "The friendly __________________ welcomed the audience and asked the singer many questions.", "a host"],
    ["moving", "感人的（= touching）", "LEVEL UP!", "The wedding scene in the drama was very __________________; even my dad felt emotional.", "moving"],
    ["amusing", "逗趣的／好笑的（= funny）", "LEVEL UP!", "The cute dog doing tricks on TV was so __________________ that we laughed out loud.", "amusing"],
    ["dull", "枯燥乏味的（= boring）", "LEVEL UP!", "Nobody wanted to watch the long speech because it was slow and __________________.", "dull"],
    ["frightening", "令人害怕的／恐怖的（= scary）", "LEVEL UP!", "I covered my eyes during the ghost scene because it was too __________________.", "frightening"]
  ];

  const CH3_ENTRIES = [
    ["a carton of soya milk", "一盒豆漿", "Key words", "I drink __________________ from a paper box with a straw every morning for breakfast.", "a carton of soya milk"],
    ["a tin of sausages", "一罐香腸", "Key words", "Dad opened __________________ with a tin opener to cook with our breakfast eggs.", "a tin of sausages"],
    ["a tin of nuts", "一罐果仁", "Key words", "My uncle likes to eat crunchy peanuts and almonds from __________________ while watching TV.", "a tin of nuts"],
    ["a packet of raisins", "一包提子乾", "Key words", "Mum puts __________________ into my school bag as a sweet and healthy dried-fruit snack.", "a packet of raisins"],
    ["a packet of seaweed", "一包紫菜", "Key words", "I love crispy, salty green snacks, so I bought __________________ at the supermarket.", "a packet of seaweed"],
    ["a bar of chocolate", "一條朱古力", "Key words", "May broke __________________ into small squares to share with her best friend.", "a bar of chocolate"],
    ["a jar of honey", "一瓶蜂蜜", "Key words", "My throat feels sore, so Mum took a spoonful from __________________ and mixed it with warm water.", "a jar of honey"],
    ["a jar of peanut butter", "一瓶花生醬", "Key words", "Tom opened __________________ and spread the creamy brown paste onto his toast.", "a jar of peanut butter"],
    ["a loaf of bread", "一條麵包", "Key words", "We bought __________________ from the bakery and sliced it to make sandwiches.", "a loaf of bread"],
    ["a bunch of bananas", "一串香蕉", "Key words", "There are six yellow fruits joined together in __________________ on the kitchen table.", "a bunch of bananas"],
    ["a bunch of grapes", "一串提子", "Key words", "Please wash __________________ carefully before we eat the juicy purple fruit.", "a bunch of grapes"],
    ["cheap", "便宜的（反義詞：expensive）", "Key words", "This packet of instant noodles only costs six dollars. It is very __________________.", "cheap"],
    ["expensive", "昂貴的（反義詞：cheap）", "Key words", "That luxury chocolate box costs five hundred dollars! It is too __________________ for me.", "expensive"],
    ["light", "輕的（反義詞：heavy）", "Key words", "A packet of seaweed is very __________________; even a baby can lift it easily.", "light"],
    ["heavy", "重的（反義詞：light）", "Key words", "The shopping bag is full of big bottles of water. It is too __________________ for me to carry.", "heavy"],
    ["healthy", "健康的（反義詞：unhealthy）", "Key words", "Fresh fruit and vegetables are __________________ foods that help us grow strong.", "healthy"],
    ["unhealthy", "不健康的（反義詞：healthy）", "Key words", "Eating too many potato chips and sweets is __________________ for your body.", "unhealthy"],
    ["popular", "受歡迎的（反義詞：unpopular）", "Key words", "Ice cream is very __________________ among children, especially on hot summer days.", "popular"],
    ["unpopular", "不受歡迎的（反義詞：popular）", "Key words", "Nobody bought the strange bitter drink because it is very __________________.", "unpopular"],
    ["delicious", "美味的（反義詞：disgusting）", "Key words", "This homemade blueberry cake tastes so __________________ that I want another piece!", "delicious"],
    ["disgusting", "令人厭惡的／難吃的（反義詞：delicious）", "Key words", "The milk went bad and smelled __________________; I poured it down the sink immediately.", "disgusting"],
    ["a packet of instant noodles", "一包即食麵", "LEVEL UP!", "When I am hungry and in a hurry, I boil __________________ in hot water for three minutes.", "a packet of instant noodles"],
    ["a packet of wafers", "一包威化餅", "LEVEL UP!", "I love light, crispy layered biscuits, so I chose __________________ for tea time.", "a packet of wafers"],
    ["a packet of crackers", "一包梳打餅／脆餅乾", "LEVEL UP!", "Mum likes to eat savoury biscuits with cheese, so she bought __________________.", "a packet of crackers"],
    ["a packet of egg rolls", "一包蛋卷", "LEVEL UP!", "These thin, golden rolled biscuits are very crispy. Let's buy __________________.", "a packet of egg rolls"],
    ["a packet of chewing gum", "一包香口膠", "LEVEL UP!", "You must not swallow the minty candy from __________________; spit it into a tissue instead.", "a packet of chewing gum"],
    ["a tin of soup", "一罐湯", "LEVEL UP!", "We heated up __________________ in a pot for a quick and warm lunch.", "a tin of soup"],
    ["a tin of beans", "一罐豆", "LEVEL UP!", "Dad poured tomato-sauced beans from __________________ onto his toast.", "a tin of beans"],
    ["a tin of sardines", "一罐沙甸魚", "LEVEL UP!", "Grandpa likes eating small oily fish from __________________ with rice.", "a tin of sardines"],
    ["a tin of tuna", "一罐吞拿魚", "LEVEL UP!", "To make tuna sandwiches, Mum mixed mayonnaise with fish from __________________.", "a tin of tuna"],
    ["a tin of pasta sauce", "一罐意粉醬", "LEVEL UP!", "We boiled some spaghetti and poured red tomato sauce from __________________ on top.", "a tin of pasta sauce"],
    ["a box of chocolates", "一盒朱古力", "LEVEL UP!", "For Mother's Day, I gave Mum __________________ wrapped with a pretty ribbon.", "a box of chocolates"],
    ["a box of ice cream cones", "一盒雪糕筒", "LEVEL UP!", "We bought __________________ so we could scoop ice cream into crispy cones at home.", "a box of ice cream cones"],
    ["a box of cereal", "一盒穀物早餐", "LEVEL UP!", "Every morning, Jack pours crunchy flakes from __________________ into his bowl and adds milk.", "a box of cereal"],
    ["a plate of fried rice", "一碟炒飯", "LEVEL UP!", "I was very hungry at lunch, so I ate __________________ with egg and green peas.", "a plate of fried rice"],
    ["a bowl of congee", "一碗粥", "LEVEL UP!", "When I have a stomachache, Mum cooks __________________ because it is warm and easy to digest.", "a bowl of congee"],
    ["a jar of hazelnut spread", "一瓶榛子醬", "LEVEL UP!", "Kids love spreading sweet chocolate-nut paste from __________________ onto bread.", "a jar of hazelnut spread"],
    ["a jug of lemonade", "一壺檸檬水", "LEVEL UP!", "Mum made __________________ with fresh lemons, sugar and ice cubes for our guests.", "a jug of lemonade"],
    ["a bottle of mineral water", "一樽礦泉水", "LEVEL UP!", "Remember to bring __________________ when we go hiking so you don't get thirsty.", "a bottle of mineral water"],
    ["a bottle of oyster sauce", "一樽蠔油", "LEVEL UP!", "In Chinese cooking, we often add a spoonful from __________________ to fried vegetables.", "a bottle of oyster sauce"],
    ["a tub of ice cream", "一桶雪糕", "LEVEL UP!", "Keep __________________ in the freezer so the cold dessert does not melt.", "a tub of ice cream"],
    ["a tub of yoghurt", "一杯乳酪", "LEVEL UP!", "After lunch, Kelly eats __________________ with a spoon because it is good for her tummy.", "a tub of yoghurt"],
    ["a bag of peppers", "一袋燈籠椒／甜椒", "LEVEL UP!", "Mum bought __________________ in red, yellow and green colours to make a salad.", "a bag of peppers"],
    ["a bag of buns", "一袋餐包／小圓麵包", "LEVEL UP!", "We got __________________ from the bakery to eat with our soup for dinner.", "a bag of buns"],
    ["a tube of wasabi", "一支芥末（青芥辣）", "LEVEL UP!", "Dad squeezed a little bit of spicy green paste from __________________ to eat with his sushi.", "a tube of wasabi"]
  ];

  window.Aetheria.QuestionBank.English = {
    _buildUnitQuestions: buildUnitQuestions,
    LESSONS: [
      { key: "eng_4a_ch1", name: "英文4上・Ch1 My favourite activities (34詞 / 68題)" },
      { key: "eng_4a_ch2", name: "英文4上・Ch2 Shows we like (30詞 / 60題)" },
      { key: "eng_4a_ch3", name: "英文4上・Ch3 At the supermarket (45詞 / 90題)" },
      { key: "eng_4a_ch4", name: "英文4上・Ch4 Eating out (43詞 / 86題)" },
      { key: "eng_4a_ch5", name: "英文4上・Ch5 Now and then (38詞 / 76題)" }
    ],
    QUESTIONS: []
      .concat(buildUnitQuestions("eng_4a_ch1", CH1_ENTRIES))
      .concat(buildUnitQuestions("eng_4a_ch2", CH2_ENTRIES))
      .concat(buildUnitQuestions("eng_4a_ch3", CH3_ENTRIES))
  };
})();
/* ============================================================================
 * 英文科獨立題庫 — 下半部 Part B (questions/questions-english.js - v7.0)
 * 內含：Ch4 Eating out (43詞 / 86題) + Ch5 Now and then (38詞 / 76題) = 162 題
 * 請直接緊接貼在 v7.0 Part A 代碼的最下方！
 * ============================================================================ */
(function() {
  if (!window.Aetheria || !window.Aetheria.QuestionBank || !window.Aetheria.QuestionBank.English) return;
  const eng = window.Aetheria.QuestionBank.English;
  const buildUnitQuestions = eng._buildUnitQuestions;
  if (typeof buildUnitQuestions !== "function") return;

  const CH4_ENTRIES = [
    ["noodles with pork chop", "豬扒麵", "Key words", "I'd like a bowl of __________________ because I love crispy fried pork on top of my noodles.", "noodles with pork chop"],
    ["noodles with dumplings", "餃子麵", "Key words", "Mum ordered __________________; the dumplings are filled with minced meat and vegetables.", "noodles with dumplings"],
    ["tuna salad", "吞拿魚沙律", "Key words", "For a light lunch, Miss Chan ordered __________________ made with fresh lettuce and fish.", "tuna salad"],
    ["prawn salad", "鮮蝦沙律", "Key words", "I love seafood and vegetables, so I chose __________________ as my starter.", "prawn salad"],
    ["macaroni with mushrooms", "蘑菇通心粉", "Key words", "My little brother loves short curved pasta, so he ordered __________________.", "macaroni with mushrooms"],
    ["spaghetti with meat sauce", "肉醬意粉", "Key words", "Peter loves long Italian noodles topped with tomato and minced beef, so he eats __________________.", "spaghetti with meat sauce"],
    ["beef curry", "咖喱牛腩／咖喱牛肉", "Key words", "Dad loves spicy food with tender beef, so he ordered __________________ with rice.", "beef curry"],
    ["chicken curry", "咖喱雞", "Key words", "Would you like __________________ or beef curry? I don't eat beef, so I'll have the chicken one.", "chicken curry"],
    ["mango pudding", "芒果布甸", "Key words", "For dessert, I want to eat cold, sweet yellow __________________ topped with milk.", "mango pudding"],
    ["blueberry cheesecake", "藍莓芝士蛋糕", "Key words", "Amy loves rich creamy cakes with purple berries, so she ordered a slice of __________________.", "blueberry cheesecake"],
    ["sweet", "甜的", "Key words", "There is a lot of sugar in this cake, so it tastes very __________________.", "sweet"],
    ["sour", "酸的", "Key words", "When I bit into the yellow lemon, my face scrunched up because it was so __________________!", "sour"],
    ["bitter", "苦的", "Key words", "I don't like black coffee or dark medicine because they taste __________________.", "bitter"],
    ["spicy", "辣的", "Key words", "There are too many red chillies in this curry! It is too __________________ for me.", "spicy"],
    ["oily", "油膩的", "Key words", "French fries and deep-fried chicken wings are too __________________; don't eat too much.", "oily"],
    ["bland", "淡而無味的", "Key words", "The soup has no salt or pepper in it at all, so it tastes very __________________.", "bland"],
    ["pumpkin soup", "南瓜湯", "LEVEL UP!", "Which would you like, orange __________________ or green pea soup?", "pumpkin soup"],
    ["pea soup", "青豆湯", "LEVEL UP!", "This thick, bright green starter is __________________; it is warm and healthy.", "pea soup"],
    ["baked snails", "焗田螺", "LEVEL UP!", "In a French restaurant, Dad tried __________________ cooked with garlic butter in their shells.", "baked snails"],
    ["barbecued ribs", "燒排骨", "LEVEL UP!", "We got sauce on our fingers while eating the smoky, grilled __________________.", "barbecued ribs"],
    ["baked lobster", "焗龍蝦", "LEVEL UP!", "For Grandpa's birthday dinner, we ordered an expensive shellfish dish called __________________ with cheese.", "baked lobster"],
    ["baked lasagna", "焗千層麵", "LEVEL UP!", "This Italian dish has flat layers of pasta, meat sauce and melted cheese. It is __________________.", "baked lasagna"],
    ["roast rack of lamb", "烤羊架", "LEVEL UP!", "At the steakhouse, Uncle Ben ordered __________________ because he loves roasted sheep meat.", "roast rack of lamb"],
    ["baked salmon", "焗三文魚", "LEVEL UP!", "Mum cooked orange-pink fish fillets in the oven to make healthy __________________.", "baked salmon"],
    ["roast suckling pig", "烤乳豬", "LEVEL UP!", "At Chinese wedding banquets, people often eat crispy red-skinned __________________ as the first dish.", "roast suckling pig"],
    ["barbecued pork", "叉燒", "LEVEL UP!", "Char siu is a famous Cantonese dish also known in English as __________________.", "barbecued pork"],
    ["steamed fish", "清蒸魚", "LEVEL UP!", "To keep the seafood fresh and healthy, Grandma cooked __________________ with ginger and soy sauce.", "steamed fish"],
    ["sweet and sour pork", "咕嚕肉", "LEVEL UP!", "This popular Chinese dish has crispy pork pieces cooked with pineapple in a red sauce. It is __________________.", "sweet and sour pork"],
    ["fried noodles with seafood", "海鮮炒麵", "LEVEL UP!", "We shared a big plate of __________________ topped with prawns, squid and scallops.", "fried noodles with seafood"],
    ["fried rice with prawns / shrimps", "蝦仁炒飯", "LEVEL UP!", "I love rice stir-fried with egg and pink seafood, so I ordered __________________.", "fried rice with prawns / shrimps"],
    ["noodles with fish balls", "魚蛋麵", "LEVEL UP!", "At the local noodle shop, I always eat bouncy white balls in soup called __________________.", "noodles with fish balls"],
    ["deep-fried wontons", "炸雲吞", "LEVEL UP!", "These golden, super crunchy Chinese dumplings are cooked in hot oil. They are __________________.", "deep-fried wontons"],
    ["tiramisu", "意大利芝士餅（提拉米蘇）", "LEVEL UP!", "Mum ordered an Italian coffee-flavoured dessert with cocoa powder on top called __________________.", "tiramisu"],
    ["a fruit tart", "一個水果撻", "LEVEL UP!", "Look at the strawberries and kiwi slices on that crispy pastry cup! I'd like __________________.", "a fruit tart"],
    ["brownies", "朱古力布朗尼蛋糕", "LEVEL UP!", "These small square chocolate cakes are rich and fudgy. May loves eating __________________.", "brownies"],
    ["a cream puff", "一個忌廉泡芙", "LEVEL UP!", "When I bit into the light, round pastry, sweet white cream came out! It was __________________.", "a cream puff"],
    ["savoury", "鹹香的／惹味的（非甜食）", "LEVEL UP!", "I don't want sweet desserts; I prefer __________________ snacks like dim sum and pizza.", "savoury"],
    ["salty", "鹹的", "LEVEL UP!", "The chef added too much salt to the soup, so it is too __________________ to drink.", "salty"],
    ["a salted egg", "一隻鹹蛋", "LEVEL UP!", "Grandpa likes to eat his white congee with __________________ for extra flavour.", "a salted egg"],
    ["soft", "軟的／鬆軟的", "LEVEL UP!", "This freshly baked bread is very __________________ and easy to chew.", "soft"],
    ["marshmallows", "棉花糖", "LEVEL UP!", "At the barbecue, we roasted soft, fluffy white and pink __________________ over the fire.", "marshmallows"],
    ["juicy", "多汁的", "LEVEL UP!", "Watermelon and ripe oranges are sweet and __________________; they are great in summer!", "juicy"],
    ["overcooked", "煮得過熟的／煮過頭的（= cooked too long）", "LEVEL UP!", "The steak was left in the pan for too long, so it became dry, burnt and __________________.", "overcooked"]
  ];

  const CH5_ENTRIES = [
    ["use smartphones", "使用智能電話", "Key words", "Nowadays, almost all adults __________________ to make calls, take photos and go online.", "use smartphones"],
    ["use electronic money", "使用電子貨幣", "Key words", "Instead of carrying heavy coins, people in Hong Kong often __________________ like Octopus cards.", "use electronic money"],
    ["live on housing estates", "住在屋邨", "Key words", "In the past, many people lived in small villages, but now most families __________________.", "live on housing estates"],
    ["drive electric cars", "駕駛電動車", "Key words", "To protect the air from pollution, more drivers today choose to __________________ instead of petrol ones.", "drive electric cars"],
    ["work in offices", "在辦公室工作", "Key words", "Many people sit at desks and use computers when they __________________ in tall buildings.", "work in offices"],
    ["work in factories", "在工廠工作", "Key words", "Workers operate big machines to make clothes and toys when they __________________.", "work in factories"],
    ["buy food online", "在網上購買食物", "Key words", "Busy parents don't always go to the market; they can __________________ and have it delivered to their door.", "buy food online"],
    ["use air-conditioners (air-cons)", "使用冷氣機", "Key words", "On hot summer nights, we __________________ to keep our bedrooms cool.", "use air-conditioners (air-cons)"],
    ["use microwave ovens (microwaves)", "使用微波爐", "Key words", "We can __________________ to heat up cold dinner in just two minutes.", "use microwave ovens (microwaves)"],
    ["use refrigerators (fridges)", "使用雪櫃", "Key words", "People __________________ to keep milk, meat and vegetables cold and fresh.", "use refrigerators (fridges)"],
    ["use washing machines", "使用洗衣機", "Key words", "In the past, people washed clothes by hand, but now we __________________ to clean them easily.", "use washing machines"],
    ["a supermarket", "一間超級市場", "Key words", "Mum pushes a trolley around __________________ to buy groceries, snacks and drinks.", "a supermarket"],
    ["a shopping centre", "一個商場", "Key words", "There are hundreds of shops, restaurants and a cinema inside __________________.", "a shopping centre"],
    ["an airport", "一個機場", "Key words", "We took a taxi to __________________ to catch our plane to Japan.", "an airport"],
    ["a theme park", "一個主題公園", "Key words", "Children love riding roller coasters and meeting cartoon characters at __________________.", "a theme park"],
    ["write e-mails", "寫電郵", "LEVEL UP!", "In the past, people posted paper letters, but now we __________________ on our computers.", "write e-mails"],
    ["send instant messages", "發送即時訊息", "LEVEL UP!", "Friends can __________________ on WhatsApp and get replies within seconds.", "send instant messages"],
    ["make online / video calls", "打網上視像電話", "LEVEL UP!", "Although my cousin lives in Canada, we can see her face when we __________________.", "make online / video calls"],
    ["chat in online forums", "在網上討論區聊天", "LEVEL UP!", "People with the same hobbies like to share ideas and __________________.", "chat in online forums"],
    ["pay with smartphones", "用智能電話付款", "LEVEL UP!", "At the convenience store, you can simply tap your mobile phone to __________________.", "pay with smartphones"],
    ["watch 3D films", "看立體（3D）電影", "LEVEL UP!", "We put on special glasses at the cinema to __________________ so pictures look real.", "watch 3D films"],
    ["read e-books", "看電子書", "LEVEL UP!", "Instead of carrying heavy paper books, Dad uses a tablet to __________________ on the train.", "read e-books"],
    ["use news apps", "使用新聞應用程式", "LEVEL UP!", "Many people __________________ on their phones to read the latest news anytime.", "use news apps"],
    ["wear smartwatches", "戴智能手錶", "LEVEL UP!", "Runners like to __________________ on their wrists to check the time and count their steps.", "wear smartwatches"],
    ["work with modern technology", "運用現代科技工作", "LEVEL UP!", "Engineers and factory workers today __________________ to build cars faster and safer.", "work with modern technology"],
    ["a machine", "一部機器", "LEVEL UP!", "A worker presses buttons to control __________________ that packs boxes automatically.", "a machine"],
    ["a robot", "一個機械人", "LEVEL UP!", "In modern car factories, __________________ with metal arms helps paint and build cars.", "a robot"],
    ["cook with a gas stove", "用煤氣爐煮食", "LEVEL UP!", "Fifty years ago, people burnt firewood, but today many families __________________ in the kitchen.", "cook with a gas stove"],
    ["a rice cooker", "一個電飯煲", "LEVEL UP!", "Put washed rice and water into __________________ and press the button to cook fluffy white rice.", "a rice cooker"],
    ["a toaster", "一個多士爐", "LEVEL UP!", "Dad puts two slices of bread into __________________ to make them brown and crispy for breakfast.", "a toaster"],
    ["a hairdryer", "一個風筒", "LEVEL UP!", "After washing my hair, I use __________________ to blow warm air and dry it quickly.", "a hairdryer"],
    ["a coffee maker", "一部咖啡機", "LEVEL UP!", "Every morning, Mum uses __________________ to brew a hot cup of coffee.", "a coffee maker"],
    ["a kettle", "一個電熱水壺", "LEVEL UP!", "Please fill __________________ with water and switch it on so we can make some hot tea.", "a kettle"],
    ["a blender", "一部攪拌機", "LEVEL UP!", "Were there any blenders 80 years ago? Today we use __________________ to mix fruit into smoothies.", "a blender"],
    ["an iron", "一個熨斗", "LEVEL UP!", "My school uniform is wrinkled, so Mum uses __________________ to press it flat and neat.", "an iron"],
    ["a cord", "一條電線", "LEVEL UP!", "Be careful not to trip over __________________ connecting the iron to the wall.", "a cord"],
    ["a socket", "一個插座（蘇底）", "LEVEL UP!", "Never put your fingers or metal objects into __________________ on the wall; it is dangerous!", "a socket"],
    ["a plug", "一個插頭", "LEVEL UP!", "Push __________________ firmly into the wall socket before you turn on the fan.", "a plug"]
  ];

  Array.prototype.push.apply(eng.QUESTIONS, buildUnitQuestions("eng_4a_ch4", CH4_ENTRIES));
  Array.prototype.push.apply(eng.QUESTIONS, buildUnitQuestions("eng_4a_ch5", CH5_ENTRIES));
})();
