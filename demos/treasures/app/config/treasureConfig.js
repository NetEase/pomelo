var trconfig = module.exports;

trconfig.TREASURE_DATA = {
		"001":{"name":"碧玉葫芦 ", "imgId": "001", "score": 1},
		"44":{"name":"飞剑 ", "imgId": "44", "score": 1},
		"003":{"name":"拭剑石 ", "imgId": "003", "score": 1},
		"45":{"name":"金甲仙衣 ", "imgId": "45", "score": 1},
		"005":{"name":"缚妖索 ", "imgId": "005", "score": 1},
		"006":{"name":"鬼脸面具 ", "imgId": "006", "score": 1},
		"025":{"name":"金钱镖 ", "imgId": "025", "score": 1},
		"008":{"name":"惊魂铃 ", "imgId": "008", "score": 1},
		"009":{"name":"嗜血幡 ", "imgId": "009", "score": 1},
		"010":{"name":"风袋 ", "imgId": "010", "score": 2},
		"40":{"name":"清心咒 ", "imgId": "40", "score": 2},
		"50":{"name":"九黎战鼓 ", "imgId": "50", "score": 2},
		"51":{"name":"盘龙壁 ", "imgId": "51", "score": 2},
		"52":{"name":"神行飞剑 ", "imgId": "52", "score": 2},
		"53":{"name":"汇灵盏 ", "imgId": "53", "score": 2},
//		"73":{"name":"五色旗盒 ", "imgId": "73", "score": 2},
		"011":{"name":"天师符 ", "imgId": "011", "score": 3},
		"012":{"name":"织女扇 ", "imgId": "012", "score": 3},
		"013":{"name":"雷兽 ", "imgId": "013", "score": 3},
		"014":{"name":"迷魂灯 ", "imgId": "014", "score": 3},
		"015":{"name":"定风珠 ", "imgId": "015", "score": 3},
		"016":{"name":"玄冰面具 ", "imgId": "016", "score": 3},
		"040":{"name":"降魔斗篷", "imgId": "040", "score": 3},
		"041":{"name":"附灵玉", "imgId": "041", "score": 4},
		"017":{"name":"捆仙绳 ", "imgId": "017", "score": 4},
		"47":{"name":"现形符 ", "imgId": "47", "score": 4},
		"48":{"name":"发瘟匣 ", "imgId": "48", "score": 4},
		"020":{"name":"聚妖铃 ", "imgId": "020", "score": 4},
		"49":{"name":"万鬼幡 ", "imgId": "49", "score": 4},
		"022":{"name":"断线木偶 ", "imgId": "022", "score": 4},
		"023":{"name":"五彩娃娃 ", "imgId": "023", "score": 5},
		"41":{"name":"番天印 ", "imgId": "41", "score": 5},
		"54":{"name":"七杀 ", "imgId": "54", "score": 5},
		"55":{"name":"罗汉珠 ", "imgId": "55", "score": 5},
		"56":{"name":"分水 ", "imgId": "56", "score": 5},
		"57":{"name":"赤焰", "imgId": "57", "score": 5},
		"58":{"name":"金刚杵", "imgId": "58", "score": 5},
		"59":{"name":"兽王令", "imgId": "59", "score": 5},
		"60":{"name":"摄魂", "imgId": "60", "score": 6},
		"024":{"name":"神木面具 ", "imgId": "024", "score": 6},
		"46":{"name":"落雨金钱 ", "imgId": "46", "score": 6},
		"026":{"name":"缚龙索 ", "imgId": "026", "score": 6},
		"027":{"name":"照妖镜 ", "imgId": "027", "score": 6},
		"028":{"name":"鬼泣 ", "imgId": "028", "score": 6},
		"029":{"name":"月光宝盒 ", "imgId": "029", "score": 6},
		"030":{"name":"缩地尺 ", "imgId": "030", "score": 6},
		"031":{"name":"影蛊 ", "imgId": "031", "score": 7},
		"032":{"name":"混元伞 ", "imgId": "032", "score": 7},
		"033":{"name":"落宝金钱 ", "imgId": "033", "score": 7},
		"034":{"name":"无魂傀儡 ", "imgId": "034", "score": 7},
		"035":{"name":"苍白纸人 ", "imgId": "035", "score": 7},
		"036":{"name":"通灵宝玉 ", "imgId": "036", "score": 7},
		"037":{"name":"聚宝盆 ", "imgId": "037", "score": 7},
		"038":{"name":"乾坤玄火塔 ", "imgId": "038", "score": 8},
		"039":{"name":"无尘扇 ", "imgId": "039", "score": 8},
		"42":{"name":"七宝玲珑灯 ", "imgId": "42", "score": 8},
		"43":{"name":"无字经 ", "imgId": "43", "score": 8},
		"61":{"name":"干将莫邪 ", "imgId": "61", "score": 8},
		"62":{"name":"慈悲 ", "imgId": "62", "score": 8},
		"63":{"name":"曼陀罗 ", "imgId": "63", "score": 8},
		"70":{"name":"救命毫毛 ", "imgId": "70", "score": 9},
		"71":{"name":"伏魔天书 ", "imgId": "71", "score": 9},
		"72":{"name":"普渡 ", "imgId": "72", "score": 9},
		"64":{"name":"镇海珠 ", "imgId": "64", "score": 9},
		"65":{"name":" 奇门五行令 ", "imgId": "65", "score": 9},
		"66":{"name":"失心钹 ", "imgId": "66", "score": 9},
		"67":{"name":"五火神焰印 ", "imgId": "67", "score": 9},
		"68":{"name":"九幽 ", "imgId": "68", "score": 10},
		"69":{"name":"忘情 ", "imgId": "69", "score": 10}
};
var ids = [];
for (var key in trconfig.TREASURE_DATA){
	ids.push(key);
}
trconfig.TREASURE_IDS = ids;

trconfig.TREASURE_NUM = 30;