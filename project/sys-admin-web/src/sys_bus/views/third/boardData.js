const BrandColor={
		ajqk:{
			//  1:"A",
			"a":"10",
			"A":"10",
			"b":"J",
			"c":"Q",
			"d":"K"
		},
		0: "♦",
		1: "♣",
		2: "♥",
		3: "♠",
		42:"▲小王",
		43:"★大王",
};
const BoardData = {
	/*1  */
	620: {name: "德州扑克",
		cardNumber: 2,
		playerNumer: 9,
		type:1,
	},
	/**1 已下线无法测试 */
	380: {name: "幸运五张",
		cardNumber: 5,
		playerNumer: 1,
		type:1,
	},
	/*1  */
	870:{name:"通比牛牛",
		cardNumber: 5,
		playerNumer: 6,
		type:1,
	},
	/**1  */
	830:{name:"抢庄牛牛",
		cardNumber: 5,
		playerNumer: 4,
		type:1,
	},
	/*1  */
	890:{name:"看牌抢庄牛牛",
		cardNumber: 5,
		playerNumer: 4,
		type:1,
	},
	/*1  */
	220:{name:"炸金花",
		cardNumber:3,
		playerNumer:5,
		type:1,
	},
	/*1  */
	230: {name:"极速炸金花",
	cardNumber: 3,
	playerNumer: 9,
	type:1,
},
	/*1  */
	610:{name:"斗地主",
		cardNumber: 17,
		playerNumer: 3,
		type:1,
	},
	/*1 */
	860:{name:"三公",
		cardNumber: 3,
		playerNumer: 5,
		type:1,
	},
	/**1 下线 */
	390:{name:"射龙门",
		cardNumber: 3,
		playerNumer: 3,
		type:1,
	},
	/*1  */
	930:{name:"百人牛牛",
	cardNumber: 5,
	playerNumer: 5,
	type:2,
	1:"天",
	2:"地",
	3:"玄",
	4:"黄",
	5:"庄"
	},
	/*1  */
	1960:{name:"奔驰宝马",
		type:3,
		cardNumber:1,
		playerNumer:1,
		1:"法拉利",
		2:"兰博基尼",
		3:"玛莎拉蒂",
		4:"保时捷",
		5:"雷克萨斯",
		6:"大众",
		7:"奔驰",
		8:"宝马"
 },
 /*1  */
  1940:{name:"金鲨银鲨",
	type:3,
	cardNumber:1,
	playerNumer:1,
	1:"燕子",
	2:"鸽子",
	3:"孔雀",
	4:"老鹰",
	5:"兔子",
	6:"猴子",
	7:"熊猫",
	8:"狮子",
	9:"银鲨",
	10:"金鲨"
	},
	/**1  */
	720:{name:"二八杠",
		cardNumber: 2,
		playerNumer: 4,
		type:5,
		"1":"一筒",
		"2":"二筒",
		"3":"三筒",
		"4":"四筒",
		"5":"五筒",
		"6":"六筒",
		"7":"七筒",
		"8":"八筒",
		"9":"九筒",
		"A":"白板",
		"a":"白板"
	},
	900:{name:"押庄龙虎"},
	600:{name:"21点"},
	880:{name:"欢乐红包",
		cardNumber: 1,
		playerNumer: 1,
	},
	730: {name: "抢庄牌九",
		12: "丁三",
		24: "二四",
		23: "杂五",
		14: "杂五",
		25: "杂七",
		34: "杂七",
		26: "杂八",
		35: "杂八",
		36: "杂九",
		45: "杂九",
		15: "零霖六",
		15: "零霖六",
		16: "高脚七",
		16: "高脚七",
		46: "红头十",
		46: "红头十",
		56: "斧头",
		56: "斧头",
		22: "板凳",
		22: "板凳",
		33: "长三",
		33: "长三",
		55: "梅牌",
		55: "梅牌",
		13: "鹅牌",
		13: "鹅牌",
		44: "人牌",
		44: "人牌",
		11: "地牌",
		11: "地牌",
		66: "天牌",
		66: "天牌"
	},
	630:{name:"十三水",
		0 :"乌龙",
		1 :"一对",
		2 :"两对",
		3 :"三条",
		4 :"顺子",
		5 :"同花",
		6 :"葫芦",
		7 :"铁支",
		8 :"同花顺",
		14 :"三同花",
		15 :"三顺子",
		16 :"六对半",
		17 :"五对三条",
		18 :"四套三条",
		19 :"凑一色",
		20 :"全小",
		21 :"全大",
		22 :"三分天下",
		23 :"三同花顺",
		24 :"十二皇族",
		25 :"十三水",
		26 :"至尊青龙"
	},
	910:{name:"百家乐"},
	920:{name:"森林舞会"},
	/*1  */
	1950:{name:"万人炸金花",
	cardNumber: 3,
	playerNumer: 5,
	type:2,
	"1":"天",
	"2":"地",
	"3":"玄",
	"4":"黄",
	"5":"庄"
},
	/*1  */
	650:{name:"血流成河",
	type:5,
	"11":"一万",
  "12":"二万",
  "13":"三万",
  "14":"四万",
  "15":"五万",
  "16":"六万",
  "17":"七万",
  "18":"八万",
	"19":"九万",
	"21":"一条",
	"22":"二条",
	"23":"三条",
	"24":"四条",
	"25":"五条",
	"26":"六条",
	"27":"七条",
	"28":"八条",
	"29":"九条",
	"31":"一筒",
  "32":"二筒",
  "33":"三筒",
  "34":"四筒",
  "35":"五筒",
  "36":"六筒",
  "37":"七筒",
  "38":"八筒",
  "39":"九筒"
},
	/*1  */
	740:{name:"二人麻将",
		type:5,
		"1":"一万",
		"2":"二万",
		"3":"三万",
		"4":"四万",
		"5":"五万",
		"6":"六万",
		"7":"七万",
		"8":"八万",
		"9":"九万",
		"11":"东风",
		"12":"南风",
		"13":"西风",
		"14":"北风",
		"15":"中",
		"16":"發",
		"17":"白",
		"21":"春",
		"22":"夏",
		"23":"秋",
		"24":"冬",
		"25":"梅",
		"26":"兰",
		"27":"竹",
		"28":"菊"
	},
	/*1  */
	1350:{name:"幸运转盘",type:4},
}

function ConversionCard(row) {
	/*获取当前游戏类型 */
	let gameType=BoardData[row.kindId];
	/** 德州扑克系列 */
	if(gameType.type===1){
		/* 截取牌值 */
		let playerCardDataArr=row.cardValue.slice(0,gameType.playerNumer*gameType.cardNumber*2).replace(eval("/(.{"+(gameType.cardNumber*2)+"})/g"),"$1,").replace(/,$/,'').split(',');
		/* 转换花色 */
		let transferArr=playerCardDataArr.map((item,i)=>{
				let rowCardArr=item.replace(eval("/(.{"+2+"})/g"),"$1,").replace(/,$/,'').split(',');
				let rowCardColorArr=rowCardArr.map(item1=>{
								let itemNumber,cardItem;
							/* 如果牌面都为0则本桌没有玩家 */
								if(item1[0]==="0"&&item1[1]==="0") return "-";
								itemNumber=BrandColor.ajqk[item1[1]]?BrandColor.ajqk[item1[1]]:item1[1];
								cardItem=BrandColor[item1[0]]+itemNumber;
								/** 如果是大王和小王的情况 */
								if(item1[0]==4){cardItem=BrandColor[item1];}
								return cardItem;
					})
					return {position:`第${i+1}号位置`,card:rowCardColorArr};;
			})
			/** 如果是斗地主 庄家多3张牌 */
		if(row.kindId==610){
					let addCardItemArr=row.cardValue.slice(102,108).replace(eval("/(.{"+2+"})/g"),"$1,").replace(/,$/,'').split(',');
					let addRowCardArr=addCardItemArr.map(item1=>{
						let itemNumber,cardItem;
								itemNumber=BrandColor.ajqk[item1[1]]?BrandColor.ajqk[item1[1]]:item1[1];
								cardItem=BrandColor[item1[0]]+itemNumber;
								/** 如果是大王和小王的情况 */
								if(item1[0]==4){cardItem=BrandColor[item1];}
								return cardItem;
					})
					transferArr.push(addRowCardArr);
		}
		transferArr.push({position:"庄家位置",card:[row.cardValue.slice(-1)]});
		return transferArr||[];
	}
	/** 百人牛牛系列 */
	if(gameType.type===2){
		/* 截取牌值 */
		let playerCardDataArr=row.cardValue.slice(0,gameType.playerNumer*gameType.cardNumber*2+5).replace(eval("/(.{"+(gameType.cardNumber*2+1)+"})/g"),"$1,").replace(/,$/,'').split(',');
		/* 转换花色 */
		let transferArr=playerCardDataArr.map(item=>{
				let postion=item[0];
				let rowCardArr=item.slice(1,item.length).replace(eval("/(.{"+2+"})/g"),"$1,").replace(/,$/,'').split(',');
				let rowCardColorArr=rowCardArr.map((item1,i)=>{
								let itemNumber,cardItem;
							/* 如果牌面都为0则本桌没有玩家 */
								if(item1[0]==="0"&&item1[1]==="0") return "-";
								itemNumber=BrandColor.ajqk[item1[1]]?BrandColor.ajqk[item1[1]]:item1[1];
								cardItem=BrandColor[item1[0]]+itemNumber;
								/** 如果是大王和小王的情况 */
								if(item1[0]==4){cardItem=BrandColor[item1];}
								return cardItem;
					})
					return {position:gameType[item[0]],card:rowCardColorArr};
			})
			/* 组合赢家位置 */
			let endStrArr=row.cardValue.slice(gameType.cardNumber*2*gameType.playerNumer+gameType.playerNumer+1).split('0').map(item=>gameType[item]);
			transferArr.push({position:"赢家位置",card:endStrArr});
		return transferArr||[];
	}
	/** 奔驰宝马系列 */
	if(gameType.type===3){
		/* 截取牌值 */
		let playerCardDataStr=row.cardValue.slice(0,gameType.playerNumer*gameType.cardNumber*2).replace(eval("/(.{"+(gameType.cardNumber*2)+"})/g"),"$1,").replace(/,$/,'');
		return [{position:"第1号位置",card:[gameType[+playerCardDataStr]]}];
	}
	/** 幸运转盘系列 */
	if(gameType.type===4){
		return [{position:"本局中获取下注金额奖金倍数",card:[row.cardValue]}];
	}
	/** 二人麻将,二八杠系列 */
	if(gameType.type===5){
			/* 截取牌值 */
			let playerCardDataArr;
			if(row.kindId==740 || row.kindId==650)playerCardDataArr=row.cardValue.replace(/,[0-9]$/,'').split(',');
			if(row.kindId==720)playerCardDataArr=row.cardValue.slice(0,gameType.playerNumer*gameType.cardNumber*1).replace(eval("/(.{"+(gameType.cardNumber*1)+"})/g"),"$1,").replace(/,$/,'').split(',');
			/* 转换花色 */
			let transferArr=playerCardDataArr.map((item,i)=>{
					let rowCardArr=item.replace(eval("/(.{"+2+"})/g"),"$1,").replace(/,$/,'').split(',');
					let rowCardColorArr;
					if(row.kindId==740 || row.kindId==650)rowCardColorArr=rowCardArr.map(item=>gameType[item]);
					if(row.kindId==720)rowCardColorArr=rowCardArr.map(item=>[gameType[item[0]],gameType[item[1]]])
				return {position:`第${i+1}号位置`,card:rowCardColorArr};;
			})
			if(row.kindId!==740) transferArr.push({position:"庄家位置",card:[row.cardValue.slice(-1)]});
			return transferArr||[];
	}
}

export default {
	ConversionCard
}