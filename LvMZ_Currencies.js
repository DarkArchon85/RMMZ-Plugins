// ============================================================================
//  LordValinar Plugin - Multiple Currencies
//  LvMZ_Currencies.js
// ============================================================================

var Imported = Imported || {};
if (!Imported['LvMZ_Core']) {
	throw new Error("LvMZ_Currencies requires plugin 'LvMZ_Core'!");
}
Imported["LvMZ_Currencies"] = true;

/*:
 * @target MZ
 * @plugindesc [v1.2] Allows usage of multiple currencies as seen in both
 * real life and in other RPGs! Dollars, Shillings, Gold, you name it!
 * @author LordValinar
 * @url https://github.com/DarkArchon85/RMMZ-Plugins
 * @orderAfter VisuMZ_1_ItemsEquipsCore
 * @orderAfter LvMZ_Core
 * @orderAfter LvMZ_Factions
 * @orderAfter LvMZ_Economy
 *
 * @param defUnit
 * @text Default Currency
 * @type item
 * @desc The item ID selected as the default currency. See 
 * help file for specifics.
 * @default 0
 *
 * @param goldIcon
 * @text Gold Icon ID
 * @type number
 * @min 0
 * @desc Gold Icon to use for default gold window. Setting 
 * to 0 will disable this and use unit text instead.
 * @default 314
 *
 * @param varOffset
 * @text Shop Variable Offset
 * @type number 
 * @decimals 0
 * @min -4999
 * @max 4999
 * @desc When using variables to buy-sell items, the variable 
 * checked and saved on the shop has the ID + this offset.
 * @default 1
 *
 * @ --------------------------------------------------------------------------
 * 
 * @command currencyMode
 * @desc Change default currency shown in the shop window.
 * 
 * @arg mode
 * @text Shop Currency Mode
 * @type select
 * @option Default
 * @option Item
 * @option Weapon
 * @option Armor
 * @desc Currenty mode (item, weapon, armor will get from database),
 * Default will return to normal gold/currencies.
 * @default Default
 * 
 * @arg id
 * @text Shop Currency ID
 * @type number
 * @desc Item, Weapon, or Armor ID of the database Alt Currency.
 * Ignores this if mode is Default.
 * @default 0
 *
 * @ --------------------------------------------------------------------------
 * 
 * @command currencySet
 * @desc Change the currency set to a new one.
 *
 * @arg list
 * @text Item List
 * @type item[]
 * @desc Array of items (ID and price) to set the new currency.
 * @default []
 * 
 *
 * @help
 * ----------------------------------------------------------------------------
 * Introduction
 * ----------------------------------------------------------------------------
 *
 * This plugin was designed with the 'Greatest Roleplaying Game' in mind - its 
 * currencies of Gold Pieces, Silver Pieces, and Copper Pieces (We don't speak 
 * of Electrum). Now you can control your own currencies within your game 
 * world. Just follow the instructions below.
 *
 * This plugin is part of a set, but can be used independently.
 *
 * == THE ECONOMICS TRINITY ==
 *  - LvMZ_Factions.js
 *  - LvMZ_Economy.js
 *  - LvMZ_Currencies.js
 *
 * ----------------------------------------------------------------------------
 * The following scripts have been overwritten
 * ----------------------------------------------------------------------------
 *
 * [rmmz_objects.js]
 *  - Game_Interpreter.prototype.command125
 * [rmmz_scenes.js]
 *  - Scene_Shop.prototype.buyingPrice
 *  - Scene_Shop.prototype.sellingPrice
 *  - Scene_Shop.prototype.maxSell
 * [rmmz_windows.js]
 *  - Window_Gold.prototype.refresh
 *  - Window_ShopBuy.prototype.drawItem
 *  - Window_ShopNumber.prototype.drawTotalPrice
 * [LvMZ_Economy.js]
 *  - Game_Interpreter.prototype.loaded
 *  - Window_ShopGold.prototype.refresh
 *  - Window_ShopGold.prototype.numWindowRefresh
 *  - itemGroup
 *
 * ----------------------------------------------------------------------------
 * Instructions
 * ----------------------------------------------------------------------------
 *
 * Most of this plugin's setup is within the database items, weapons, and
 * armor with notetags. First we'll go over the parameter settings, then 
 * setting up a currency set, and finally the notetags you can use.
 *
 * >> PARAMETERS <<
 *
 * : Default Currency
 *  - If using a currency set, this will be the default item to go by when 
 *    calculating your standard "G" prices (what you normally see in an 
 *    RPG Maker game). This will be the default currency used when 
 *    converting base numbers (see Price in "Setting Up Currencies").
 *
 * : Gold Icon ID
 *  - This is really only if you're not using a currency set, LvMZ_Economy,
 *    or VisuStella's Core plugin. It just spices up the gold window with 
 *    an icon.
 *
 * : Shop Variable Offset
 *  - If you are NOT using LvMZ_Economy, this will be ignored. When setting
 *    up items to buy and sell with a variable, the shop has to have the 
 *    amount of this variable in order for the player to sell it. So the 
 *    shop needs its own variable to keep track of it. This offset tells 
 *    the plugin how many IDs away from the original variable (that the 
 *    player keeps track of) it is.
 *
 *  - Example: setting up variable [10] for "Knowledge" and the offset is
 *    1, then that means variable [11] will track "Knowledge" for the shop.
 *
 *
 * >> SETTING UP CURRENCIES <<
 *
 * In the ITEMS database, you will setup your currencies from the most 
 * valuable to the least valuable. The only fields that matter with these 
 * is the Icon, Price, and Note (Name might help you remember though).
 *
 * : Icon
 *  - This is the icon that will appear when listing item prices in shops
 *    or in any of the gold windows.
 *
 * : Price
 *  - This is the conversion rate. 1 of these items will = the Price in 
 *    a base number. This base number represents the LOWEST currency 
 *    value (which usually = 1). Think like 1 US Dollar = 100 pennies.
 *
 * : Note
 *  - You will need the <Currency> notetag for the plugin to register this 
 *    as a viable currency. 
 *
 * : Using Plugin Commands and Script Calls
 *  - The "currencySet" plugin command will allow you to setup custom
 *    currencies at any point in the game. Useful for games with 
 *    multiple currencies in various regions - like in the real world.
 *  - Alternatively, you can reset to the default by using the script
 *    call(without quotes): 
 *      "setCurrencySet($dataItems)"
 *
 *
 * >> ALTERNATE CURRENCIES <<
 *
 * You can also setup other items, weapons, and armors as alternate 
 * currencies to buy or sell something. You can even use variables!
 * If you want to buy an item with the standard gold, but then sell it 
 * back for a long sword.. you can!
 *
 * Here is the notetag you'll require to setup alternate currencies 
 * and the breakdown of each parameter.
 *
 * : <AltCurrency: [type] [id] [mode] [price]>
 *  - Type : Var | Item | Weapon | Armor
 *  - ID   : The id of the variable, item, weapon, or armor
 *  - Mode : Buy | Sell  (case-sensitive)
 *  - Price: How many to obtain or get rid of
 *
 * Example: If you wanted to buy a potion with a long sword(id:2) but 
 * sell it back for 10 points in the variable "Knowledge"(id:5 in the demo),
 * then you would put the 2 note tags in the potion's NOTE box:
 * <AltCurrency: Weapon 2 Buy 1>
 * <AltCurrency: Var 5 Sell 10>
 *
 * NOTE: A thing to keep in mind, is when buying or selling an item, weapon,
 * or armor, if it has an Alternate Currency notetag, it will ignore the 
 * database price of that item. Otherwise, it will act normally (if price 
 * is > 0, it will be available to buy).
 * - If you have LvMZ_Economy, item prices at 0 will never be added to the 
 *   shop (that don't have AltCurrencies)
 *
 * ----------------------------------------------------------------------------
 * Credits
 * ----------------------------------------------------------------------------
 *
 * You must credit both Yanfly and myself with the usage of this plugin.
 *
 * ----------------------------------------------------------------------------
 * Terms of Use
 * ----------------------------------------------------------------------------
 *
 * Free to use and modify for commercial and noncommercial games, with credits.
 * Do NOT remove my name from the Author of this plugin
 * Do NOT reupload this plugin (modified or otherwise) anywhere other than the 
 * RPG Maker Web main forums: https://forums.rpgmakerweb.com/index.php
 *
 * ----------------------------------------------------------------------------
 * Changelog
 * ----------------------------------------------------------------------------
 *
 *  v1.2 - Updated to new format plus minor fixes for demo; Can set or reset
 *         currency "sets" (like going from Euros to Dollars)
 *
 *  v1.1 - A few fixes (including Alternate Currency tags using item names 
 *         instead of numbers. Item name must match exactly (case-sensitive)!
 *
 *  v1.0 - Plugin finished!
 *
 * ----------------------------------------------------------------------------
 */
//=============================================================================

var LvMZ = LvMZ || {};
LvMZ.Currencies = {
	name: "Alternate Currencies",
	desc: "Buy or sell with items, weapons, armors, or variables!",
	version: 1.2,
	curMode: null
};

(($) => {
'use strict';

const pluginName = "LvMZ_Currencies";
const params     = new LvParams(pluginName);
const defUnit    = params.value('defUnit','num');
const lvGoldIcon = params.value('goldIcon','num');
const varOS      = params.value('varOffset','num');

/******************************************************************************
	Plugin Commands
******************************************************************************/
PluginManager.registerCommand(pluginName, 'currencyMode', args => {
	const mode = args.mode.toLowerCase();
	const id = Number(args.id);
	$.curMode = mode !== "default" ? itemGroup(mode, id) : null;
});

PluginManager.registerCommand(pluginName, 'currencySet', args => {
	const group = JSON.parse(args.list).map(id => $dataItems[id]);
	DataManager.setCurrencySet(group);
});

/******************************************************************************
	LvMZ_Currencies.js (private functions)
******************************************************************************/

function cache(object, type, mode, id, price) {
	const key = 'alt'+type+mode+'Prices';
	object[key] = object[key] || {};
	object[key][id] = price;
}

function clone(object, cloneItem) {
	const type = itemType(cloneItem);
	if (!cloneItem || !type || object === cloneItem) return;
	if (type == 'skill') return; // items, weapons, and armors only
	object.clone = cloneItem;
	object.name = cloneItem.name;
	object.iconIndex = cloneItem.iconIndex;
	object.description = cloneItem.description;
	if (type == 'item') object.effects = cloneItem.effects;
	if (['weapon','armor'].includes(type)) {
		object.params = cloneItem.params.slice();
	}
}

/******************************************************************************
	rmmz_managers.js
******************************************************************************/

const dm_dbLoaded = DataManager.isDatabaseLoaded;
DataManager.isDatabaseLoaded = function() {
	if (!dm_dbLoaded.call(this)) return false;
	if (!this._currencies) {
		this.cacheDatabaseCurrencies();
	}
	return true;
};

/**
 *  Initializes the currencies and notetags for the
 *  alternate currencies as well. Use sparringly.
 *
 * @memberof LvCore
 */
DataManager.cacheDatabaseCurrencies = function() {
	this._currencies = {};
	this.cacheMeta($dataItems);
	this.cacheMeta($dataWeapons);
	this.cacheMeta($dataArmors);
};

/**
 *  Sets a new group to be the currency set. Useful if 
 *  transmigrating worlds, or enter different regions.
 *
 * @memberof LvCore
 * @param array {object} Array of items with the IDs and Prices
 */
DataManager.setCurrencySet = function(array) {
	const newData = {};
	for (const item of array.filter(obj => !!obj)) {
		if (Lv.checkTag(item, /<CURRENCY>/i)) {
			newData[item.id] = item.price;
		}
	}
	if (Object.keys(newData).length > 0) {
		this._currencies = newData;
	}
}

/**
 * Logs any "alternate currencies" (ignores item price)
 *
 * @memberof LvCore
 */
DataManager.cacheMeta = function(group) {
	const tagID = /<ALTCURRENCY:\s(VAR||ITEM||WEAPON||ARMOR)\s(\d+)\s(BUY||SELL)\s(\d+)>/i;
	const tagNAME = /<ALTCURRENCY:\s(ITEM||WEAPON||ARMOR)\s(.*)\s(BUY||SELL)\s(\d+)>/i;
	let type, id, mode, price;
	for (const item of group.filter(e => !!e)) {
		const data = (item.note || "").split(/[\r\n]+/);
		for (const meta of data) {
			if (meta.match(tagID)) {
				type = RegExp.$1.capFirst();
				mode = RegExp.$3.capFirst();
				id = parseInt(RegExp.$2);
				price = parseInt(RegExp.$4);
				cache(item, type, mode, id, price);
			} else if (meta.match(tagNAME)) {
				type = RegExp.$1.capFirst();
				mode = RegExp.$3.capFirst();
				id = group.indexByKey("name", RegExp.$2);
				price = parseInt(RegExp.$4);
				cache(item, type, mode, id, price);
			} else if (meta.match(/<CLONE:[ ](\d+)>/i)) {
				id = parseInt(RegExp.$1);
				clone(item, group[id]);
			} else if (meta.match(/<CLONE:\s([^>]*)>/i)) {
				id = group.indexByKey("name", RegExp.$1);
				clone(item, group[id]);
			} else if (meta.match(/<CURRENCY>/i)) {
				this._currencies[item.id] = item.price;
			}
		}
	}
};

/**
 *  Retrieves the currency ITEMS from the databse by ID
 *
 * @memberof LvCore
 * @return {object} Array of databse items
 */
DataManager.currencies = function() {
	return Object.keys(this._currencies).map(id => $dataItems[id]);
};

/******************************************************************************
	rmmz_objects.js
******************************************************************************/

if (Imported["LvMZ_Economy"]) {
	// --- LvMZ SHOP ---
	const lvShop_refresh = LvMZ_Shop.prototype.refresh;
	LvMZ_Shop.prototype.refresh = function() {
		this._init = false;
		lvShop_refresh.call(this);
	};
	
	// --- GAME EVENT ---
	const gameEv_setup = Game_Event.prototype.setupPageSettings;
	Game_Event.prototype.setupPageSettings = function() {
		gameEv_setup.call(this);
		if (this.page() && this.isShop()) {
			const shop = this.shopData();
			if (!shop._init && shop._money > 0) {
				shop._money = convertPrice(shop._money);
				shop._init = true;
			}
		}
	};
	
	// --- GAME PARTY ---	
	const gameParty_stealItem = Game_Party.prototype.stealItem;
	Game_Party.prototype.stealItem = function(item, amount, includeEquip) {
		// Give base currency, and not the currency item
		if (item && item.meta.Currency) {
			amount *= item.price;
			this.stealGold(amount);
		} else {
			gameParty_stealItem.call(this, item, amount, includeEquip);
		}
	};
}


// --- GAME PARTY ---
const gameParty_maxGold = Game_Party.prototype.maxGold;
Game_Party.prototype.maxGold = function() {
	const cache = DataManager.currencies();
	let maxGold = gameParty_maxGold.call(this);
	if (cache.length > 0) {
		maxGold *= $dataItems[defUnit].price;
	}
	return maxGold;
};

const gameParty_gainItem = Game_Party.prototype.gainItem;
Game_Party.prototype.gainItem = function(item, amount, includeEquip) {
	// Give base currency, and not the currency item
	if (item && item.meta.Currency) {
		amount *= item.price;
		this.gainGold(amount);
	} else {
		gameParty_gainItem.call(this, item, amount, includeEquip);
	}
};


// --- GAME INTERPRETER ---

// Conditional Branch
const gameIntr_CondBranch = Game_Interpreter.prototype.command111;
Game_Interpreter.prototype.command111 = function(params) {
	const cache = DataManager.currencies();
	if (cache.length > 0 && params[0] === 7) {
		// Gold -> Convert the amount to check into the gold standard
		params[1] = convertPrice(params[1]);
	}
	return gameIntr_CondBranch.call(this, params);
};

// Overwrite - Change Gold
Game_Interpreter.prototype.command125 = function(params) {
	const value = this.operateValue(params[0], params[1], params[2]);
	const newValue = convertPrice(value);
	$gameParty.gainGold(newValue);
	return true;		
};

/******************************************************************************
	rmmz_scenes.js
******************************************************************************/

// --- SCENE MESSAGE ---
const sceneMsg_goldRect = Scene_Message.prototype.goldWindowRect;
Scene_Message.prototype.goldWindowRect = function() {
	const rect = sceneMsg_goldRect.call(this);
	if (DataManager.currencies().length > 0) {
		rect.width = Graphics.boxWidth / 2;
		rect.x = Graphics.boxWidth - rect.width;
	}
	return rect;
};


// --- SCENE MENU ---
const sceneMenu_statRect = Scene_Menu.prototype.statusWindowRect;
Scene_Menu.prototype.statusWindowRect = function() {
	const rect = sceneMenu_statRect.call(this);
	if (DataManager.currencies().length > 0) {
		rect.height -= this.calcWindowHeight(1, true);
	}
	return rect;
};

const sceneMenu_goldRect = Scene_Menu.prototype.goldWindowRect;
Scene_Menu.prototype.goldWindowRect = function() {
	const rect = sceneMenu_goldRect.call(this);
	if (DataManager.currencies().length > 0) {
		rect.x = 0;
		rect.width = Graphics.boxWidth;
	}
	return rect;
};

// --- SCENE SHOP ---
if (!Imported['LvMZ_Economy']) {
	const sceneShop_goldRect = Scene_Shop.prototype.goldWindowRect;
	Scene_Shop.prototype.goldWindowRect = function() {
		const rect = sceneShop_goldRect.call(this);
		rect.width = this.statusWidth();
		rect.x = Graphics.boxWidth - rect.width;
		return rect;
	};

	const sceneShop_commandRect = Scene_Shop.prototype.commandWindowRect;
	Scene_Shop.prototype.commandWindowRect = function() {
		const rect = sceneShop_commandRect.call(this);
		rect.width = Graphics.boxWidth - this.statusWidth();
		return rect;
	};
}

// --

const sS_buyCancel = Scene_Shop.prototype.onBuyCancel;
Scene_Shop.prototype.onBuyCancel = function() {
	sS_buyCancel.call(this);
	this._goldWindow.setItem(null, 'Buy');
	if (Imported['LvMZ_Economy']) {
		this._shopGoldWindow.setItem(null);
	}
};

const sS_sellCancel = Scene_Shop.prototype.onSellCancel;
Scene_Shop.prototype.onSellCancel = function() {
	sS_sellCancel.call(this);
	this._goldWindow.setItem(null, 'Sell');
	if (Imported['LvMZ_Economy']) {
		this._shopGoldWindow.setItem(null);
	}
};

// overwrite
Scene_Shop.prototype.buyingPrice = function() {
	let price = this._buyWindow.price(this._item);
	if (Imported['LvMZ_Economy']) {
		const index = this._buyWindow.index();
		price = economicBuyPrice(price, index);
	}
	if (!this.checkMeta(this._item)) {
		return convertPrice(price, this._item);
	}
	return Math.floor(price);
};

// overwrite
Scene_Shop.prototype.sellingPrice = function() {
	let price = Math.floor(this._item.price / 2);
	if (Imported['LvMZ_Economy']) {
		const index = this._sellWindow.index();
		price = economicSellPrice(this._item.price, index);
	}
	if (!this.checkMeta(this._item)) {
		return convertPrice(price, this._item);
	}
	return Math.floor(price);
};

// overwrite
Scene_Shop.prototype.doBuy = function(number) {
	this.doBuy_gold(number);
	this.doBuy_item(number);
	this.doShopBuy(number); // if using LvMZ_Economy
};

// overwrite
Scene_Shop.prototype.doSell = function(number) {
	this.doSell_gold(number);
	this.doSell_item(number);
	this.doShopSell(number); // if using LvMZ_Economy
};

const sceneShop_maxBuy = Scene_Shop.prototype.maxBuy;
Scene_Shop.prototype.maxBuy = function() {
	const item = this._item;
	const groups = ['Var','Item','Weapon','Armor'];
	let max = sceneShop_maxBuy.call(this);
	let value, price;
	for (const type of groups) {
		const key = 'alt'+type+'BuyPrices';
		if (!item[key]) continue;
		for (const id in item[key]) {
			price = item[key][id];
			if (type === 'Var') {
				value = $gameVariables.value(id);
			} else {
				value = $gameParty.numItems(itemGroup(type, id));
			}
			max = Math.min(max, Math.floor(value / price));
		}
	}
	return max;
};

// overwrite - need to account for price conversion
Scene_Shop.prototype.maxSell = function() {
	// -- Original --
	let max = $gameParty.numItems(this._item);
	if (!Imported['LvMZ_Economy']) return max;
	// -- End: Now account for LvMZ_Economy --
	const shop = MapManager.event().shopData();
	const index = this._sellWindow.index();
	const ecoPprice = economicSellPrice(this._item.price, index);
	const price = convertPrice(ecoPprice, this._item);
	return Math.min(max, Math.floor(shop.gold() / price));
};

Scene_Shop.prototype.doBuy_gold = function(number) {
	const item = this._item;
	const groups = ['Var','Item','Weapon','Armor'];
	let alt = false;
	let value, price;
	for (const type of groups) {
		const key = 'alt'+type+'BuyPrices';
		if (!item[key]) continue;
		for (const id in item[key]) {
			price = item[key][id] * number;
			if (type === 'Var') {
				value = $gameVariables.value(id) - price;
				$gameVariables.setValue(id, value);
			} else {
				value = itemGroup(type, id);
				$gameParty.loseItem(value, price);
			}
			alt = true;
		}
	}
	if (!alt) {
		let amount = convertPrice(number * this.buyingPrice());
		$gameParty.loseGold(amount);
	}
};

Scene_Shop.prototype.doBuy_item = function(number) {
	const item = this._item.clone || this._item;
	$gameParty.gainItem(item, number);
};

Scene_Shop.prototype.doSell_gold = function(number) {
	const item = this._item;
	const groups = ['Var','Item','Weapon','Armor'];
	let alt = false;
	let value, price;
	for (const type of groups) {
		const key = 'alt'+type+'SellPrices';
		if (!item[key]) continue;
		for (const id in item[key]) {
			price = item[key][id] * number;
			if (type === 'Var') {
				value = $gameVariables.value(id) + price;
				$gameVariables.setValue(id, value);
			} else {
				value = itemGroup(type, id);
				$gameParty.gainItem(value, price);
			}
			alt = true;
		}
	}
	if (!alt) {
		let amount = convertPrice(number * this.sellingPrice());
		$gameParty.gainGold(amount);
	}
};

Scene_Shop.prototype.doSell_item = function(number) {
	$gameParty.loseItem(this._item, number);
};

Scene_Shop.prototype.checkMeta = function(item) {
	if (item) {
		const groups = ['Var','Item','Weapon','Armor'];
		const mode = this.isSelling() ? "Sell" : "Buy";
		for (const type of groups) {
			const key = 'alt'+type+mode+'Prices';
			if (item[key]) return true;
		}
	}
	return false;
};

Scene_Shop.prototype.isSelling = function() {
	return this._commandWindow.currentSymbol() === 'sell';
};

// -- LvMZ_Economy compatibility --
Scene_Shop.prototype.doShopBuy = function(number) {
	if (!Imported["LvMZ_Economy"]) return; // do nothing
	const shop = MapManager.event().shopData();
	const index = this._buyWindow.index();
	shop._windowShopper = false;
	if (shop._stock[index] === 255) return;
	if (!this.checkMeta(this._item)) {
		shop.addGold(number * this.buyingPrice());
	} else {
		this.shopBuy_currencies(shop, number);
	}
	shop.loseGoods(this._item, number);
};

Scene_Shop.prototype.doShopSell = function(number) {
	if (!Imported["LvMZ_Economy"]) return; // do nothing
	const shop = MapManager.event().shopData();
	const index = this._sellWindow.index();
	shop._windowShopper = false;
	if (shop._stock[index] === 255) return;
	if (!this.checkMeta(this._item)) {
		shop.loseGold(number * this.sellingPrice());
	} else {
		this.shopSell_currencies(shop, number);
	}
	shop.addGoods(this._item, number);
};

Scene_Shop.prototype.shopBuy_currencies = function(shop, number) {
	const item = this._item;
	const groups = ['Var','Item','Weapon','Armor'];
	let price, value;
	for (const type of groups) {
		const key = 'alt'+type+'BuyPrices';
		if (!item[key]) continue;
		for (const id in item[key]) {
			price = item[key][id] * number;
			if (type == 'Var') {
				let varID = Number(id) + varOS;
				value = $gameVariables.value(varID) + price;
				$gameVariables.setValue(varID, value);
			} else {
				value = itemGroup(type, id);
				shop.addGoods(value, price);
			}
		}
	}
};

Scene_Shop.prototype.shopSell_currencies = function(shop, number) {
	const item = this._item;
	const groups = ['Var','Item','Weapon','Armor'];
	let price, value;
	for (const type of groups) {
		const key = 'alt'+type+'SellPrices';
		if (!item[key]) continue;
		for (const id in item[key]) {
			price = item[key][id] * number;
			if (type == 'Var') {
				let varID = Number(id) + varOS;
				value = $gameVariables.value(varID) - price;
				$gameVariables.setValue(varID, value);
			} else {
				value = itemGroup(type, id);
				shop.loseGoods(value, price);
			}
		}
	}
};

// -- 

Scene_Shop.prototype.terminate = function() {
	$.curMode = null;
    Scene_MenuBase.prototype.terminate.call(this);
};

/******************************************************************************
	rmmz_windows.js
******************************************************************************/

// --- WINDOW BASE ---
Window_Base.prototype.currencyWidth = function(value) {
	const unitWidth = this.textWidth(TextManager.currencyUnit);
	const width = lvGoldIcon > 0 ? ImageManager.iconWidth + 2 : unitWidth;
	return width + this.textWidth(value) + 4;
};

Window_Base.prototype.validItem = function(item) {
	if (typeof item === "string") return false;
	return ['item','weapon','armor'].includes(itemType(item));
};

const winBase_drawCurValue = Window_Base.prototype.drawCurrencyValue;
Window_Base.prototype.drawCurrencyValue = function(value, unit, x, y, width) {
	if (unit !== TextManager.currencyUnit) {
		return this.drawAltCurrency(value, unit, x, y, width);
	} else if (Imported["VisuMZ_0_CoreEngine"]) {
		return winBase_drawCurValue.call(this, value, unit, x, y, width);
	}
	this.drawNewGoldValue(value, unit, x, y, width);
};

Window_Base.prototype.drawNewGoldValue = function(value, unit, x, y, w) {
	this.contents.fontSize -= 2;
	const iw = ImageManager.iconWidth;
	const cx = lvGoldIcon > 0 ? this.currencyWidth(unit) : this.textWidth(unit);
	if (this.textWidth(value) > w - cx) value = "A lot!";
	this.drawText(value, x, y, w - 2, 'right');
	this.processColorChange(16); // system color
	if (lvGoldIcon > 0) {
		this.drawIcon(lvGoldIcon, x + 2, y + 2);
		this.drawText(unit, x + iw + 6, y, w);
	} else {
		this.drawText(unit, x + 2, y, w);
	}
	this.resetFontSettings();
};

Window_Base.prototype.drawAltCurrency = function(value, unit, x, y, width) {
	this.contents.fontSize -= 2;
	let icon = 0;
	let text = '';
	if (this.validItem(unit)) {
		icon = unit.iconIndex;
	} else if (unit.match(/VARIABLE[ ](\d+)/i)) {
		let name = $dataSystem.variables[parseInt(RegExp.$1)];
		if (name.match(/\\I\[(\d+)\]/i)) icon = parseInt(RegExp.$1);
		name = name.replace(/\\I\[(\d+)\]/gi, '');
		text = name.replace(/\{([^\}]*)\}/gi, '');
	}
	if (text !== '') {
		this.processColorChange(16);
		this.drawText(text, x, y, width, 'right');
		width -= this.textWidth(text);
	}
	if (icon > 0) {
		if (text !== '') width -= 6;
		width -= ImageManager.iconWidth;
		this.drawIcon(icon, x + width, y + 2);
	}
	this.drawText(value, x, y, width - 4, 'right');
	width -= this.textWidth(value);
	this.resetFontSettings();
	return width;
};

Window_Base.prototype.checkDrawCurrencies = function(item, mode) {
	if (item) {
		const groups = ['Var','Item','Weapon','Armor'];
		for (const type of groups) {
			const key = 'alt'+type+mode+'Prices';
			if (item[key]) return false;
		}
	}
	return true;
};

Window_Base.prototype.drawCurrencies = function(value, rect, showAll=false) {
	this.contents.fontSize -= 2;
	const x = rect.x;
	const y = rect.y;
	let width = rect.width;
	const cache = DataManager.currencies();
	const arr = convertBase(value);
	const iw = ImageManager.iconWidth;
	for (let i = arr.length - 1; i >= 0; i--) {
		const item = cache[i];
		value = arr[i];
		if (value > 0 || showAll) {
			const iconIndex = DataManager.isItem(item) ? item.iconIndex : lvGoldIcon;
			if (iconIndex > 0) {
				width -= iw;
				this.drawIcon(iconIndex, x + width, y + 2);
			}
			if (this.textWidth(value) > width - (iw + 4)) value = 'A lot!';
			this.drawText(value, x, y, width-4, 'right');
			width -= this.textWidth(value) + 4;
			width -= this.itemPadding();
		}
	}
	this.resetFontSettings();
	return width;
};

Window_Base.prototype.isSelling = function() {
	const scene = SceneManager._scene;
	return scene.constructor === Scene_Shop ? scene.isSelling() : false;
};


// --- WINDOW SELECTABLE ---
if (!Imported['LvMZ_Economy']) {
	const winSel_select = Window_Selectable.prototype.select;
	Window_Selectable.prototype.select = function(index) {
		winSel_select.call(this, index);
		const scene = SceneManager._scene;
		if (scene.constructor === Scene_Shop) {
			const num = scene._numberWindow ? scene._numberWindow.active : false;
			if (num) scene._goldWindow.numWindowRefresh();
		}
	};
}


// --- WINDOW GOLD ---
Window_Gold.prototype.drawItemCurrencies = function(item, mode, rect) {
	const x = rect.x;
	const y = rect.y;
	let width = rect.width;
	const groups = ['Var','Item','Weapon','Armor'];
	let value, unit;
	for (const type of groups) {
		const key = 'alt'+type+mode+'Prices';
		if (!item[key]) continue;
		for (const id in item[key]) {
			if (type === 'Var') {
				unit = 'VARIABLE ' + id;
				value = $gameVariables.value(id);
			} else {
				unit = itemGroup(type, id);
				value = $gameParty.numItems(unit);
			}
			width = this.drawAltCurrency(value, unit, x, y, width);
			width -= this.itemPadding();
		}
	}
};

// Overwrite
Window_Gold.prototype.refresh = function() {
	const rect = this.itemLineRect(0);
	let item = this._item;
	let mode = this._buyMode;
	this.contents.clear();
	if ($.curMode) {
		let unit = $.curMode;
		let value = $gameParty.numItems(unit);
		this.drawAltCurrency(value, unit, rect.x, rect.y, rect.width);
		item = null;
	} else if (this.checkDrawCurrencies(item, mode)) {
		if (!this.value()) {
			let unit = TextManager.currencyUnit;
			return this.drawNewGoldValue(0, unit, rect.x, rect.y, rect.width);
		}
		this.drawCurrencies(this.value(), rect);
		item = null;
	}
	if (item) this.drawItemCurrencies(item, mode, rect);
};

// Overwrite (if Economy is imported); Else "new"
Window_Gold.prototype.numWindowRefresh = function() {
	const scene = SceneManager._scene;
	const numWindow = scene._numberWindow;
	const item = numWindow._item;
	const sym = scene.isSelling() ? "Sell" : "Buy";
	const rect = this.itemLineRect(0);
	this.contents.clear();
	if (this.checkDrawCurrencies(item, sym)) {
		let total = numWindow._price * numWindow.number();
		if (sym == 'Buy') {
			this.processColorChange(2);
			total = $gameParty.gold() - total;
		} else {
			this.processColorChange(24);
			total = $gameParty.gold() + total;
		}
		if (total <= 0) {
			let ww = rect.width;
			if (lvGoldIcon > 0) {
				ww -= ImageManager.iconWidth;
				this.drawIcon(lvGoldIcon, rect.x + ww, rect.y + 2);
			}
			this.contents.fontSize -= 2;
			this.drawText(total, rect.x, rect.y, ww-4, 'right');
		} else {
			return this.drawCurrencies(total, rect);
		}
	}
	this.drawNumCurrencies(item, sym, numWindow, rect);
	this.resetFontSettings();
};

Window_Gold.prototype.drawNumCurrencies = function(item, mode, numWindow, rect) {
	const groups = ['Var','Item','Weapon','Armor'];
	const x = rect.x;
	const y = rect.y;
	let width = rect.width;
	let price, value, unit;
	for (const type of groups) {
		const key = 'alt'+type+mode+'Prices';
		if (!item[key]) continue;
		for (const id in item[key]) {
			price = item[key][id] * numWindow.number();
			if (type === 'Var') {
				unit = 'VARIABLE ' + id;
				value = $gameVariables.value(id);
			} else {
				unit = itemGroup(type, id);
				value = $gameParty.numItems(unit);
			}
			if (mode == 'Buy') {
				this.processColorChange(2);
				value -= price;
			} else {
				this.processColorChange(24);
				value += price;
			}
			width = this.drawAltCurrency(value, unit, x, y, width);
			width -= this.itemPadding();
		}
	}
};

Window_Gold.prototype.setItem = function(item, mode) {
	this._item = item;
	this._buyMode = mode;
	this.refresh();
};


// --- WINDOW SHOP_STATUS ---
const wss_drawPossession = Window_ShopStatus.prototype.drawPossession;
Window_ShopStatus.prototype.drawPossession = function(x, y) {
	const oldItem = this._item;
	if (this._item.clone) this._item = this._item.clone;
	wss_drawPossession.call(this, x, y);
	this._item = oldItem;
};

const wss_setItem = Window_ShopStatus.prototype.setItem;
Window_ShopStatus.prototype.setItem = function(item) {
	if (item && item.clone) item = item.clone;
	wss_setItem.call(this, item);
};


// --- WINDOW SHOP_BUY ---
// Overwrite (if LvMZ_Economy is -NOT- imported)
const wsb_drawItem = Imported['LvMZ_Economy'] ? Window_ShopBuy.prototype.drawItem : null;
Window_ShopBuy.prototype.drawItem = function(index) {
	if (wsb_drawItem) return wsb_drawItem.call(this, index);
	const item = this.itemAt(index);
	const rect = this.itemLineRect(index);
	this.changePaintOpacity(this.isEnabled(item));
	this.drawItemName(item, rect.x, rect.y, rect.width);
	this.drawShopBuyPrice(index, rect);
	this.changePaintOpacity(true);
	this.resetFontSettings();
};

Window_ShopBuy.prototype.drawShopBuyPrice = function(index, rect) {
	const item = this.itemAt(index);
	let price = this.price(item);
	if (Imported['LvMZ_Economy']) {
		price = economicBuyPrice(price, index);
	}
	if (this.checkDrawCurrencies(item, "Buy")) {
		price = convertPrice(price, item);
		return this.drawCurrencies(price, rect);
	}
	this.drawShopBuyCurrencies(item, rect.x, rect.y, rect.width);
};

Window_ShopBuy.prototype.drawShopBuyCurrencies = function(item, x, y, w) {
	const groups = ['Var','Item','Weapon','Armor'];
	for (const type of groups) {
		const key = 'alt'+type+'BuyPrices';
		if (!item[key]) continue;
		for (const id in item[key]) {
			const value = item[key][id];
			const unit = type == 'Var' ? 'VARIABLE ' + id : itemGroup(type, id);
			w = this.drawAltCurrency(value, unit, x, y, w);
			w -= this.itemPadding();
		}
	}
	return w;
};

const wsb_isEnabled = Window_ShopBuy.prototype.isEnabled;
Window_ShopBuy.prototype.isEnabled = function(item) {
	if (!item || $gameParty.hasMaxItems(item)) return false;
	if (this.checkDrawCurrencies(item, "Buy")) {
		let price = this.price(item);
		if (Imported['LvMZ_Economy']) {
			price = economicBuyPrice(price, this.index());
		}
		price = convertPrice(price, item);
		return price <= this._money;
	}	
	const groups = ['Var','Item','Weapon','Armor'];
	for (const type of groups) {
		const key = 'alt'+type+'BuyPrices';
		if (!item[key]) continue;
		for (const id in item[key]) {
			let price = item[key][id];
			if (type === 'Var') {
				let value = $gameVariables.value(id);
				if (value < price) return false;
			} else {
				let value = $gameParty.numItems(itemGroup(type, id));
				if (value < price) return false;
			}
		}
	}
	return wsb_isEnabled.call(this, item);
};

const wsb_updateHelp = Window_ShopBuy.prototype.updateHelp;
Window_ShopBuy.prototype.updateHelp = function() {
	wsb_updateHelp.call(this);
	const scene = SceneManager._scene;
	const gw = scene._goldWindow;
	if (gw) gw.setItem(this.item(), "Buy");	
	if (Imported['LvMZ_Economy']) {
		const sgw = scene._shopGoldWindow;
		if (sgw) sgw.setItem(this.item());
	}
};


// --- WINDOW SHOP_SELL ---
const wss_isEnabled = Window_ShopSell.prototype.isEnabled;
Window_ShopSell.prototype.isEnabled = function(item) {
	if (!Imported['LvMZ_Economy']) {
		// If there's no shop, don't have anything to check here
		return wss_isEnabled.call(this, item);
	}
	// Original(RM) method
	if (!item || item.price <= 0) return false;
	// Stolen Item Check
	if (!this.shop()._buysStolen && item.stolen) return false;
	if (this.checkDrawCurrencies(item, "Sell")) {
		let price = economicSellPrice(item.price, this.index());
		price = convertPrice(price, item);
		return this.shop()._money >= price;
	}
	const groups = ['Var','Item','Weapon','Armor'];
	let unit, value, price;
	for (const type of groups) {
		const key = 'alt'+type+'SellPrices';
		if (!item[key]) continue;
		for (const id in item[key]) {
			price = item[key][id];
			if (type === 'Var') {
				unit = Number(id) + varOS;
				value = $gameVariables.value(unit);
				if (value < price) return false;
			} else {
				unit = itemGroup(type, id);
				unit = this.shop()._goods.indexOf(unit);
				value = this.shop()._stock[unit] || 0;
				if (value < price) return false;
			}
		}
	}
	return wss_isEnabled.call(this, item);
};

const wss_updateHelp = Window_ShopSell.prototype.updateHelp;
Window_ShopSell.prototype.updateHelp = function() {
	wss_updateHelp.call(this);
	const scene = SceneManager._scene;
	const gw = scene._goldWindow;
	if (gw) gw.setItem(this.item(), "Sell");	
	if (Imported['LvMZ_Economy']) {
		const sgw = scene._shopGoldWindow;
		if (sgw) sgw.setItem(this.item());
	}
};


// --- WINDOW SHOP_NUMBER ---
if (!Imported['LvMZ_Economy']) {
	const wsn_refresh = Window_ShopNumber.prototype.refresh;
	Window_ShopNumber.prototype.refresh = function() {
		wsn_refresh.call(this);
		const scene = SceneManager._scene;
		scene._goldWindow.numWindowRefresh();
	};
}

// overwrite
Window_ShopNumber.prototype.drawTotalPrice = function() {
	const total = this._price * this._number;
	const padding = this.itemPadding();
	const rect = {
		x: 0,
		y: this.totalPriceY(),
		width: this.innerWidth - padding * 2
	};
	const mode = this.isSelling() ? "Sell" : "Buy";
	if (this.checkDrawCurrencies(this._item, mode)) {
		return this.drawCurrencies(total, rect);
	}
	this.drawItemCurrencies(this._item, mode, rect);
};

Window_ShopNumber.prototype.drawItemCurrencies = function(item, mode, rect) {
	const x = rect.x;
	const y = rect.y;
	let width = rect.width;
	const groups = ['Var','Item','Weapon','Armor'];
	let value, unit;
	for (const type of groups) {
		const key = 'alt'+type+mode+'Prices';
		if (!item[key]) continue;
		for (const id in item[key]) {
			value = item[key][id] * this._number;
			if (type === 'Var') {
				unit = 'VARIABLE ' + id;
			} else {
				unit = itemGroup(type, id);
			}
			width = this.drawAltCurrency(value, unit, x, y, width);
			width -= this.itemPadding();
		}
	}
};

// --- Economy Compatibility ---
if (Imported['LvMZ_Economy']) {
	// overwrite
	Window_ShopGold.prototype.refresh = function() {
		const shop = MapManager.event().shopData();
		const item = this._item;
		const mode = this.isSelling() ? "Sell" : "Buy";
		const rect = this.itemLineRect(0);
		this.contents.clear();
		this.drawText("Shop:", rect.x, rect.y, rect.width);
		if (this.checkDrawCurrencies(item, mode)) {
			return this.drawCurrencies(shop.gold(), rect);
		}
		this.drawShopCurrency(item, mode, rect);
	};
	
	Window_ShopGold.prototype.drawShopCurrency = function(item, mode, rect) {
		this.drawText("Shop:", rect.x, rect.y, rect.width);
		const x = rect.x;
		const y = rect.y;
		let width = rect.width;
		const groups = ['Var','Item','Weapon','Armor'];
		let value, unit;
		for (const type of groups) {
			const key = 'alt'+type+mode+'Prices';
			if (!item[key]) continue;
			for (const id in item[key]) {
				if (type === 'Var') {
					unit = Number(id) + varOS;
					value = $gameVariables.value(unit);
					unit = 'VARIABLE '+String(unit);
				} else {
					unit = itemGroup(type, id);
					value = this.shop()._goods.indexOf(unit);
					value = this.shop()._stock[value] || 0;
				}
				width = this.drawAltCurrency(value, unit, x, y, width);
				width -= this.itemPadding();
			}
		}
	};
	
	// overwrite
	// * Updates text value-color combos when buying-selling
	Window_ShopGold.prototype.numWindowRefresh = function() {
		const shop = MapManager.event().shopData();
		const scene = SceneManager._scene;
		const numWindow = scene._numberWindow;
		const item = this._item;
		const mode = scene.isSelling() ? "Sell" : "Buy";
		const rect = this.itemLineRect(0);
		this.contents.clear();
		this.drawText("Shop:", rect.x, rect.y, rect.width);
		if (this.checkDrawCurrencies(item, mode)) {
			let total = numWindow._price * numWindow.number();
			if (mode == 'Buy') {
				this.processColorChange(24);
				total = shop.gold() + total;
			} else {
				this.processColorChange(2);
				total = shop.gold() - total;
			}
			return this.drawCurrencies(total, rect);
		}
		this.drawNumCurrencies(item, mode, numWindow, rect);
		this.resetFontSettings();
	};
	
	Window_ShopGold.prototype.drawNumCurrencies = function(item, mode, numWindow, rect) {
		const shop = MapManager.event().shopData();
		const groups = ['Var','Item','Weapon','Armor'];
		const x = rect.x;
		const y = rect.y;
		let width = rect.width;
		let price, value, unit;
		for (const type of groups) {
			const key = 'alt'+type+mode+'Prices';
			if (!item[key]) continue;
			for (const id in item[key]) {
				price = item[key][id] * numWindow.number();
				if (type === 'Var') {
					unit = 'VARIABLE '+String(id);
					let varID = Number(id) + varOS;
					value = $gameVariables.value(varID);
				} else {
					unit = itemGroup(type, id);
					value = shop._goods.indexOf(unit);
					value = shop._stock[value] || 0;
				}
				if (mode == 'Buy') {
					this.processColorChange(24);
					value += price;
				} else {
					this.processColorChange(2);
					value -= price;
				}
				width = this.drawAltCurrency(value, unit, x, y, width);
				width -= this.itemPadding();
			}
		}
	};
	
	Window_ShopGold.prototype.setItem = function(item) {
		this._item = item;
		this.refresh();
	};
}

})(LvMZ.Currencies);

// -- Global Functions
function itemType(item) {
	const object = new Game_Item(item);
	return object._dataClass;
}

// convertPrice: Converts a standard item pricing (via Database) and 
// compares it with any notetags (ex: <Unit:#>) and then returns 
// it in a base number format (lowest currency)
function convertPrice(price, item) {
	const cache = DataManager.currencies();
	if (cache.length > 0) {
		const params = new LvParams('LvMZ_Currencies');
		const defUnit = params.value('defUnit','num');
		const unitId = item && item.meta.Unit ? Number(item.meta.Unit) : defUnit;
		price *= $dataItems[unitId].price;
	}
	return price;
}

// convertBase: Converts the base number into a Currency Array
// depending on how many currencies there are and the exchange rate.
// 100505 (3x currencies at [10000,100,1] rates) --> [10,5,5]
function convertBase(baseNumber) {
	const cache = DataManager.currencies();
	if (cache.length === 0) return [baseNumber];
	let list = [];
	for (const item of cache) {
		if (baseNumber <= 0) { list.push(0); continue; }
		let rate = item.price;
		let value = Math.floor(baseNumber / rate);
		baseNumber -= value * rate;
		list.push(value);
	}
	return list;
}