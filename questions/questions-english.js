/* ============================================================================
 * 英文科獨立題庫 — 上半部 Part A (questions/questions-english.js - v7.1)
 * 對齊 question-bridge.js 原生 VOCAB 結構（自動生成「字塊串字 + 句子填充」雙題型）
 * Part A 內含：Ch1 (34詞) + Ch2 (30詞) + Ch3 (45詞) = 109詞 ➔ 218 題
 * ============================================================================ */
window.Aetheria = window.Aetheria || {};
window.Aetheria.QuestionBank = window.Aetheria.QuestionBank || {};

(function() {
  function buildVocabItems(unitKey, rawList) {
    return rawList.map(function(entry, idx) {
      return {
        id: unitKey + "_" + String(idx + 1).padStart(2, "0"),
        unitKey: unitKey,
        word: entry[0],
        meaning: entry[1],
        sentence: entry[2]
      };
    });
  }

  const CH1_RAW = [
    ["go rock climbing", "去攀石", "Ben is brave and strong. He likes to ________ on a climbing wall at weekends."],
    ["go jogging", "去慢跑", "Every morning, my dad and I put on our running shoes and ________ in the park."],
    ["go cycling", "去踏單車", "We like to rent bicycles in Sha Tin and ________ along the river."],
    ["go ice-skating", "去溜冰", "Mary wears a warm jacket when she goes to the rink to ________."],
    ["go to an indoor playground", "去室內遊樂場", "When it rains heavily outside, children can still play on slides if they ________."],
    ["go to a public library", "去公共圖書館", "I want to borrow some storybooks for free, so I will ________ after school."],
    ["play tennis", "打網球", "You need a racket and a small yellow ball to ________ on the court."],
    ["play volleyball", "打排球", "Two teams hit a ball over a high net with their hands when they ________."],
    ["play online games", "玩網上遊戲", "My brother uses the Internet to ________ with his classmates at night."],
    ["play video games", "玩電子遊戲", "After finishing his homework, Leo turns on his TV console to ________."],
    ["text my friend", "發短訊給我的朋友", "I use my smartphone to ________ when I want to ask her about our homework."],
    ["read the newspaper", "看報紙", "Grandpa buys a paper every morning so he can ________ and learn about the news."],
    ["read magazines", "看雜誌", "Anna likes colourful photos and fashion stories, so she loves to ________."],
    ["surf the Net", "上網瀏覽", "I often use my computer to ________ and look for information for my school project."],
    ["make video blogs", "製作影片網誌（拍 Vlog）", "Sam uses a camera to film his daily life because he loves to ________."],
    ["watch online videos on social media platforms", "在社交媒體平台上觀看網上影片", "Many teenagers use their phones to ________ like YouTube and Instagram."],
    ["play handball", "打手球", "Players run and throw a ball into the goal using their hands when they ________."],
    ["play hockey", "打曲棍球", "You need a curved stick to hit a small hard ball when you ________."],
    ["play mini golf", "打迷你高爾夫球", "My family likes to ________ on a small course with fun obstacles and holes."],
    ["do judo", "練柔道", "In Japan, many children wear white uniforms and ________ to learn how to throw opponents safely."],
    ["do taekwondo", "練跆拳道", "This Korean martial art uses lots of high kicks. I ________ every Saturday."],
    ["do karate", "練空手道", "Tim is practising punches and kicks because he wants to get a black belt when he learns to ________."],
    ["do kung fu", "練功夫", "We learn traditional Chinese martial arts when we ________ with our master."],
    ["do fencing", "玩劍擊", "You must wear a protective mask and hold a long thin sword to ________."],
    ["do yoga", "做瑜伽", "My mum stretches her body and breathes slowly on a mat when she likes to ________."],
    ["go canoeing", "去划獨木舟（開放式）", "Several people sit in an open boat and move it across the lake when they ________."],
    ["go kayaking", "去划皮划艇（單人/雙人艇）", "One person sits inside a narrow boat to ________ on the calm sea."],
    ["a paddle", "一支槳（用於獨木舟/皮划艇）", "When you go kayaking, you hold ________ with both hands to push the water."],
    ["go rowing", "去划艇（賽艇）", "A team of four athletes sit facing backwards in a long boat to ________ on the river."],
    ["an oar", "一支划艇長槳", "Each person in the rowing boat holds ________ that is attached to the side of the boat."],
    ["go rollerblading", "去踩滾軸溜冰鞋", "Kitty wears boots with a single line of wheels on the bottom to ________ in the park."],
    ["go skateboarding", "去玩滑板", "Jack stands on a small wooden board with four wheels to ________ at the skate park."],
    ["make jewellery", "製作首飾", "Wendy uses colourful beads and strings to ________ like necklaces and bracelets."],
    ["make pottery", "製作陶器", "In art class, we shape wet clay with our hands to ________ such as bowls and cups."]
  ];

  const CH2_RAW = [
    ["the news", "新聞報道", "My parents watch ________ every evening to find out what happened around the world."],
    ["the weather report", "天氣報告", "Let's watch ________ to see if it will rain tomorrow before our picnic."],
    ["a drama", "電視劇／連續劇", "Mum loves watching ________ about a family's love and daily life."],
    ["a game show", "遊戲節目", "Players compete in fun challenges to win big prizes on ________."],
    ["a pop music show", "流行音樂節目", "Famous singers sing their newest hit songs live on ________."],
    ["a documentary", "紀錄片", "We watched ________ about wild pandas in China and learnt many real facts."],
    ["a sports show", "體育節目", "Dad is a football fan, so he always watches ________ on Sunday afternoons."],
    ["a cartoon", "卡通片／動畫", "My little sister laughs happily whenever she watches ________ with funny animated animals."],
    ["a cooking show", "烹飪節目", "Grandma watches ________ to learn how to make new and tasty dishes."],
    ["a travel show", "旅遊節目", "We love watching ________ because we can see famous places in Japan and Europe."],
    ["informative", "資訊豐富的／增長知識的", "I like documentaries because they are very ________ and teach me lots of useful facts."],
    ["exciting", "令人興奮的／刺激的", "The football match was so ________ that we all cheered loudly until the final second."],
    ["interesting", "有趣的", "This science programme is very ________; I never feel sleepy while watching it."],
    ["touching", "感人的／動人的", "The story about the loyal dog was so ________ that tears rolled down my cheeks."],
    ["boring", "沉悶的／無聊的", "Tim fell asleep during the show because he thought it was too ________."],
    ["silly", "愚蠢的／幼稚的", "I don't like that cartoon because the characters always do ________ and foolish things."],
    ["a talent show", "才藝表演節目", "People go on stage to sing, dance or do magic tricks on ________."],
    ["a performance", "一場表演／演出", "Everyone clapped loudly at the end of the dancer's amazing ________."],
    ["a food programme", "飲食節目", "The presenter visits famous restaurants and tastes delicious meals on ________."],
    ["a children's show", "兒童節目", "Young kids love watching ________ with colourful puppets, songs and simple games."],
    ["a child performer", "小演員／童星", "The nine-year-old boy acted so well in the TV show; he is a very talented ________."],
    ["a quiz show", "問答遊戲節目", "Contestants must answer difficult general knowledge questions quickly on ________."],
    ["a reality show", "真人騷", "Cameras follow ordinary people trying to survive on a wild island in ________."],
    ["a talk show", "清談節目／訪談節目", "Movie stars sit on a sofa and chat about their lives on ________."],
    ["a guest", "嘉賓", "Tonight's talk show invited a famous Olympic swimmer to be ________."],
    ["a host", "節目主持人", "The friendly ________ welcomed the audience and asked the singer many questions."],
    ["moving", "感人的（= touching）", "The wedding scene in the drama was very ________; even my dad felt emotional."],
    ["amusing", "逗趣的／好笑的（= funny）", "The cute dog doing tricks on TV was so ________ that we laughed out loud."],
    ["dull", "枯燥乏味的（= boring）", "Nobody wanted to watch the long speech because it was slow and ________."],
    ["frightening", "令人害怕的／恐怖的（= scary）", "I covered my eyes during the ghost scene because it was too ________."]
  ];

  const CH3_RAW = [
    ["a carton of soya milk", "一盒豆漿", "I drink ________ from a paper box with a straw every morning for breakfast."],
    ["a tin of sausages", "一罐香腸", "Dad opened ________ with a tin opener to cook with our breakfast eggs."],
    ["a tin of nuts", "一罐果仁", "My uncle likes to eat crunchy peanuts and almonds from ________ while watching TV."],
    ["a packet of raisins", "一包提子乾", "Mum puts ________ into my school bag as a sweet and healthy dried-fruit snack."],
    ["a packet of seaweed", "一包紫菜", "I love crispy, salty green snacks, so I bought ________ at the supermarket."],
    ["a bar of chocolate", "一條朱古力", "May broke ________ into small squares to share with her best friend."],
    ["a jar of honey", "一瓶蜂蜜", "My throat feels sore, so Mum took a spoonful from ________ and mixed it with warm water."],
    ["a jar of peanut butter", "一瓶花生醬", "Tom opened ________ and spread the creamy brown paste onto his toast."],
    ["a loaf of bread", "一條麵包", "We bought ________ from the bakery and sliced it to make sandwiches."],
    ["a bunch of bananas", "一串香蕉", "There are six yellow fruits joined together in ________ on the kitchen table."],
    ["a bunch of grapes", "一串提子", "Please wash ________ carefully before we eat the juicy purple fruit."],
    ["cheap", "便宜的（反義詞：expensive）", "This packet of instant noodles only costs six dollars. It is very ________."],
    ["expensive", "昂貴的（反義詞：cheap）", "That luxury chocolate box costs five hundred dollars! It is too ________ for me."],
    ["light", "輕的（反義詞：heavy）", "A packet of seaweed is very ________; even a baby can lift it easily."],
    ["heavy", "重的（反義詞：light）", "The shopping bag is full of big bottles of water. It is too ________ for me to carry."],
    ["healthy", "健康的", "Fresh fruit and vegetables are ________ foods that help us grow strong."],
    ["unhealthy", "不健康的", "Eating too many potato chips and sweets is ________ for your body."],
    ["popular", "受歡迎的", "Ice cream is very ________ among children, especially on hot summer days."],
    ["unpopular", "不受歡迎的", "Nobody bought the strange bitter drink because it is very ________."],
    ["delicious", "美味的（反義詞：disgusting）", "This homemade blueberry cake tastes so ________ that I want another piece!"],
    ["disgusting", "令人厭惡的／難吃的（反義詞：delicious）", "The milk went bad and smelled ________; I poured it down the sink immediately."],
    ["a packet of instant noodles", "一包即食麵", "When I am hungry and in a hurry, I boil ________ in hot water for three minutes."],
    ["a packet of wafers", "一包威化餅", "I love light, crispy layered biscuits, so I chose ________ for tea time."],
    ["a packet of crackers", "一包梳打餅／脆餅乾", "Mum likes to eat savoury biscuits with cheese, so she bought ________."],
    ["a packet of egg rolls", "一包蛋卷", "These thin, golden rolled biscuits are very crispy. Let's buy ________."],
    ["a packet of chewing gum", "一包香口膠", "You must not swallow the minty candy from ________; spit it into a tissue instead."],
    ["a tin of soup", "一罐湯", "We heated up ________ in a pot for a quick and warm lunch."],
    ["a tin of beans", "一罐豆", "Dad poured tomato-sauced beans from ________ onto his toast."],
    ["a tin of sardines", "一罐沙甸魚", "Grandpa likes eating small oily fish from ________ with rice."],
    ["a tin of tuna", "一罐吞拿魚", "To make tuna sandwiches, Mum mixed mayonnaise with fish from ________."],
    ["a tin of pasta sauce", "一罐意粉醬", "We boiled some spaghetti and poured red tomato sauce from ________ on top."],
    ["a box of chocolates", "一盒朱古力", "For Mother's Day, I gave Mum ________ wrapped with a pretty ribbon."],
    ["a box of ice cream cones", "一盒雪糕筒", "We bought ________ so we could scoop ice cream into crispy cones at home."],
    ["a box of cereal", "一盒穀物早餐", "Every morning, Jack pours crunchy flakes from ________ into his bowl and adds milk."],
    ["a plate of fried rice", "一碟炒飯", "I was very hungry at lunch, so I ate ________ with egg and green peas."],
    ["a bowl of congee", "一碗粥", "When I have a stomachache, Mum cooks ________ because it is warm and easy to digest."],
    ["a jar of hazelnut spread", "一瓶榛子醬", "Kids love spreading sweet chocolate-nut paste from ________ onto bread."],
    ["a jug of lemonade", "一壺檸檬水", "Mum made ________ with fresh lemons, sugar and ice cubes for our guests."],
    ["a bottle of mineral water", "一樽礦泉水", "Remember to bring ________ when we go hiking so you don't get thirsty."],
    ["a bottle of oyster sauce", "一樽蠔油", "In Chinese cooking, we often add a spoonful from ________ to fried vegetables."],
    ["a tub of ice cream", "一桶雪糕", "Keep ________ in the freezer so the cold dessert does not melt."],
    ["a tub of yoghurt", "一杯乳酪", "After lunch, Kelly eats ________ with a spoon because it is good for her tummy."],
    ["a bag of peppers", "一袋燈籠椒／甜椒", "Mum bought ________ in red, yellow and green colours to make a salad."],
    ["a bag of buns", "一袋餐包／小圓麵包", "We got ________ from the bakery to eat with our soup for dinner."],
    ["a tube of wasabi", "一支芥末（青芥辣）", "Dad squeezed a little bit of spicy green paste from ________ to eat with his sushi."]
  ];

  window.Aetheria.QuestionBank.English = {
    _buildVocabItems: buildVocabItems,
    LESSONS: [
      { key: "eng_4a_ch1", name: "Ch1 My favourite activities" },
      { key: "eng_4a_ch2", name: "Ch2 Shows we like" },
      { key: "eng_4a_ch3", name: "Ch3 At the supermarket" },
      { key: "eng_4a_ch4", name: "Ch4 Eating out" },
      { key: "eng_4a_ch5", name: "Ch5 Now and then" }
    ],
    VOCAB: []
      .concat(buildVocabItems("eng_4a_ch1", CH1_RAW))
      .concat(buildVocabItems("eng_4a_ch2", CH2_RAW))
      .concat(buildVocabItems("eng_4a_ch3", CH3_RAW))
  };
})();
/* ============================================================================
 * 英文科獨立題庫 — 下半部 Part B (questions/questions-english.js - v7.1)
 * 內含：Ch4 Eating out (43詞 / 86題) + Ch5 Now and then (38詞 / 76題) = 162 題
 * 請直接緊接貼在 v7.1 Part A 代碼的最下方！
 * ============================================================================ */
(function() {
  if (!window.Aetheria || !window.Aetheria.QuestionBank || !window.Aetheria.QuestionBank.English) return;
  const eng = window.Aetheria.QuestionBank.English;
  const buildVocabItems = eng._buildVocabItems;
  if (typeof buildVocabItems !== "function" || !Array.isArray(eng.VOCAB)) return;

  const CH4_RAW = [
    ["noodles with pork chop", "豬扒麵", "I'd like a bowl of ________ because I love crispy fried pork on top of my noodles."],
    ["noodles with dumplings", "餃子麵", "Mum ordered ________; the dumplings are filled with minced meat and vegetables."],
    ["tuna salad", "吞拿魚沙律", "For a light lunch, Miss Chan ordered ________ made with fresh lettuce and fish."],
    ["prawn salad", "鮮蝦沙律", "I love seafood and vegetables, so I chose ________ as my starter."],
    ["macaroni with mushrooms", "蘑菇通心粉", "My little brother loves short curved pasta, so he ordered ________."],
    ["spaghetti with meat sauce", "肉醬意粉", "Peter loves long Italian noodles topped with tomato and minced beef, so he eats ________."],
    ["beef curry", "咖喱牛腩／咖喱牛肉", "Dad loves spicy food with tender beef, so he ordered ________ with rice."],
    ["chicken curry", "咖喱雞", "Would you like ________ or beef curry? I don't eat beef, so I'll have the chicken one."],
    ["mango pudding", "芒果布甸", "For dessert, I want to eat cold, sweet yellow ________ topped with milk."],
    ["blueberry cheesecake", "藍莓芝士蛋糕", "Amy loves rich creamy cakes with purple berries, so she ordered a slice of ________."],
    ["sweet", "甜的", "There is a lot of sugar in this cake, so it tastes very ________."],
    ["sour", "酸的", "When I bit into the yellow lemon, my face scrunched up because it was so ________!"],
    ["bitter", "苦的", "I don't like black coffee or dark medicine because they taste ________."],
    ["spicy", "辣的", "There are too many red chillies in this curry! It is too ________ for me."],
    ["oily", "油膩的", "French fries and deep-fried chicken wings are too ________; don't eat too much."],
    ["bland", "淡而無味的", "The soup has no salt or pepper in it at all, so it tastes very ________."],
    ["pumpkin soup", "南瓜湯", "Which would you like, orange ________ or green pea soup?"],
    ["pea soup", "青豆湯", "This thick, bright green starter is ________; it is warm and healthy."],
    ["baked snails", "焗田螺", "In a French restaurant, Dad tried ________ cooked with garlic butter in their shells."],
    ["barbecued ribs", "燒排骨", "We got sauce on our fingers while eating the smoky, grilled ________."],
    ["baked lobster", "焗龍蝦", "For Grandpa's birthday dinner, we ordered an expensive shellfish dish called ________ with cheese."],
    ["baked lasagna", "焗千層麵", "This Italian dish has flat layers of pasta, meat sauce and melted cheese. It is ________."],
    ["roast rack of lamb", "烤羊架", "At the steakhouse, Uncle Ben ordered ________ because he loves roasted sheep meat."],
    ["baked salmon", "焗三文魚", "Mum cooked orange-pink fish fillets in the oven to make healthy ________."],
    ["roast suckling pig", "烤乳豬", "At Chinese wedding banquets, people often eat crispy red-skinned ________ as the first dish."],
    ["barbecued pork", "叉燒", "Char siu is a famous Cantonese dish also known in English as ________."],
    ["steamed fish", "清蒸魚", "To keep the seafood fresh and healthy, Grandma cooked ________ with ginger and soy sauce."],
    ["sweet and sour pork", "咕嚕肉", "This popular Chinese dish has crispy pork pieces cooked with pineapple in a red sauce. It is ________."],
    ["fried noodles with seafood", "海鮮炒麵", "We shared a big plate of ________ topped with prawns, squid and scallops."],
    ["fried rice with prawns", "蝦仁炒飯", "I love rice stir-fried with egg and pink seafood, so I ordered ________."],
    ["noodles with fish balls", "魚蛋麵", "At the local noodle shop, I always eat bouncy white balls in soup called ________."],
    ["deep-fried wontons", "炸雲吞", "These golden, super crunchy Chinese dumplings are cooked in hot oil. They are ________."],
    ["tiramisu", "意大利芝士餅（提拉米蘇）", "Mum ordered an Italian coffee-flavoured dessert with cocoa powder on top called ________."],
    ["a fruit tart", "一個水果撻", "Look at the strawberries and kiwi slices on that crispy pastry cup! I'd like ________."],
    ["brownies", "朱古力布朗尼蛋糕", "These small square chocolate cakes are rich and fudgy. May loves eating ________."],
    ["a cream puff", "一個忌廉泡芙", "When I bit into the light, round pastry, sweet white cream came out! It was ________."],
    ["savoury", "鹹香的／惹味的（非甜食）", "I don't want sweet desserts; I prefer ________ snacks like dim sum and pizza."],
    ["salty", "鹹的", "The chef added too much salt to the soup, so it is too ________ to drink."],
    ["a salted egg", "一隻鹹蛋", "Grandpa likes to eat his white congee with ________ for extra flavour."],
    ["soft", "軟的／鬆軟的", "This freshly baked bread is very ________ and easy to chew."],
    ["marshmallows", "棉花糖", "At the barbecue, we roasted soft, fluffy white and pink ________ over the fire."],
    ["juicy", "多汁的", "Watermelon and ripe oranges are sweet and ________; they are great in summer!"],
    ["overcooked", "煮得過熟的／煮過頭的（= cooked too long）", "The steak was left in the pan for too long, so it became dry, burnt and ________."]
  ];

  const CH5_RAW = [
    ["use smartphones", "使用智能電話", "Nowadays, almost all adults ________ to make calls, take photos and go online."],
    ["use electronic money", "使用電子貨幣", "Instead of carrying heavy coins, people in Hong Kong often ________ like Octopus cards."],
    ["live on housing estates", "住在屋邨", "In the past, many people lived in small villages, but now most families ________."],
    ["drive electric cars", "駕駛電動車", "To protect the air from pollution, more drivers today choose to ________ instead of petrol ones."],
    ["work in offices", "在辦公室工作", "Many people sit at desks and use computers when they ________ in tall buildings."],
    ["work in factories", "在工廠工作", "Workers operate big machines to make clothes and toys when they ________."],
    ["buy food online", "在網上購買食物", "Busy parents don't always go to the market; they can ________ and have it delivered to their door."],
    ["use air-conditioners", "使用冷氣機（全寫）", "On hot summer nights, we ________ to keep our bedrooms cool."],
    ["use microwave ovens", "使用微波爐（全寫）", "We can ________ to heat up cold dinner in just two minutes."],
    ["use refrigerators", "使用雪櫃（全寫）", "People ________ to keep milk, meat and vegetables cold and fresh."],
    ["use washing machines", "使用洗衣機", "In the past, people washed clothes by hand, but now we ________ to clean them easily."],
    ["a supermarket", "一間超級市場", "Mum pushes a trolley around ________ to buy groceries, snacks and drinks."],
    ["a shopping centre", "一個商場", "There are hundreds of shops, restaurants and a cinema inside ________."],
    ["an airport", "一個機場", "We took a taxi to ________ to catch our plane to Japan."],
    ["a theme park", "一個主題公園", "Children love riding roller coasters and meeting cartoon characters at ________."],
    ["write e-mails", "寫電郵", "In the past, people posted paper letters, but now we ________ on our computers."],
    ["send instant messages", "發送即時訊息", "Friends can ________ on WhatsApp and get replies within seconds."],
    ["make video calls", "打網上視像電話", "Although my cousin lives in Canada, we can see her face when we ________."],
    ["chat in online forums", "在網上討論區聊天", "People with the same hobbies like to share ideas and ________."],
    ["pay with smartphones", "用智能電話付款", "At the convenience store, you can simply tap your mobile phone to ________."],
    ["watch 3D films", "看立體（3D）電影", "We put on special glasses at the cinema to ________ so pictures look real."],
    ["read e-books", "看電子書", "Instead of carrying heavy paper books, Dad uses a tablet to ________ on the train."],
    ["use news apps", "使用新聞應用程式", "Many people ________ on their phones to read the latest news anytime."],
    ["wear smartwatches", "戴智能手錶", "Runners like to ________ on their wrists to check the time and count their steps."],
    ["work with modern technology", "運用現代科技工作", "Engineers and factory workers today ________ to build cars faster and safer."],
    ["a machine", "一部機器", "A worker presses buttons to control ________ that packs boxes automatically."],
    ["a robot", "一個機械人", "In modern car factories, ________ with metal arms helps paint and build cars."],
    ["cook with a gas stove", "用煤氣爐煮食", "Fifty years ago, people burnt firewood, but today many families ________ in the kitchen."],
    ["a rice cooker", "一個電飯煲", "Put washed rice and water into ________ and press the button to cook fluffy white rice."],
    ["a toaster", "一個多士爐", "Dad puts two slices of bread into ________ to make them brown and crispy for breakfast."],
    ["a hairdryer", "一個風筒", "After washing my hair, I use ________ to blow warm air and dry it quickly."],
    ["a coffee maker", "一部咖啡機", "Every morning, Mum uses ________ to brew a hot cup of coffee."],
    ["a kettle", "一個電熱水壺", "Please fill ________ with water and switch it on so we can make some hot tea."],
    ["a blender", "一部攪拌機", "Were there any blenders 80 years ago? Today we use ________ to mix fruit into smoothies."],
    ["an iron", "一個熨斗", "My school uniform is wrinkled, so Mum uses ________ to press it flat and neat."],
    ["a cord", "一條電線", "Be careful not to trip over ________ connecting the iron to the wall."],
    ["a socket", "一個插座（蘇底）", "Never put your fingers or metal objects into ________ on the wall; it is dangerous!"],
    ["a plug", "一個插頭", "Push ________ firmly into the wall socket before you turn on the fan."]
  ];

  Array.prototype.push.apply(eng.VOCAB, buildVocabItems("eng_4a_ch4", CH4_RAW));
  Array.prototype.push.apply(eng.VOCAB, buildVocabItems("eng_4a_ch5", CH5_RAW));
})();
