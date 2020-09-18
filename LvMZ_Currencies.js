// ============================================================================
//  LordValinar Plugin - Multiple Currencies
//  LvMZ_Currencies.js
// ============================================================================

var LordV = LordV || {};
var Imported = Imported || {};
Imported["LvMZCurrencies"] = true;
$gameCurrency = null;

/*:
 * @target MZ
 * @plugindesc [v1.2] Allows usage of multiple currencies as seen in both
 * real life and in other RPGs! Dollars, Shillings, Gold, you name it!
 * @author LordValinar
 * @url https://github.com/DarkArchon85/RMMZ-Plugins
 * @orderAfter LvMZ_Economy
 *
 * @param Currencies
 * @text Currencies
 * @type struct<NewCurrency>[]
 * @desc List of defined currency items. Acquiring these 
 * will convert them over (no physical items in inventory).
 * @default []
 *
 * @param CurrencyUnit
 * @text Default Unit Currency
 * @type item
 * @desc Which item represents your core currency? 
 * @default 0
 *
 * @param Padding
 * @text Currency Padding
 * @type number
 * @decimals 0
 * @min 0
 * @desc The padding used for multiple currencies in pixels.
 * @default 10
 *
 * @help
 * ----------------------------------------------------------------------------
 * Introduction
 * ----------------------------------------------------------------------------
 *
 * This plugin was designed from the thought of D&D, its currencies of 
 * Gold Pieces, Silver Pieces, and Copper Pieces (We don't speak of Electrum).
 * Now you can control your own currencies within your game world. Just follow
 * the instructions below.
 *
 * ----------------------------------------------------------------------------
 * Instructions
 * ----------------------------------------------------------------------------
 *
 *   First you will need to setup the currency ITEMS in your database. This 
 * allows the plugin to know their conversion rates and whether or not you 
 * pick up these currencies from enemy drops, treasure chests, other other 
 * means - and then converts them over without polluting your inventory 
 * with the actual items.
 *
 *   Next you will input those values (specifically the itemID) into the 
 * plugin parameters. You can use the default setup, replacing the itemIDs, 
 * or if you have plans of your own currencies, set them up in the same way 
 * by placing the itemID and the base conversion value.
 *
 *  - Example: Using the D&D coin standard
 * Currency: Gold   / itemId: 1 / Rate: 100
 * Currency: Silver / itemId: 2 / Rate: 10
 * Currency: Copper / itemId: 3 / Rate: 1
 *
 *  - Example: Using the US Dollar standard
 * Currency: Dollar  / itemId: 1 / Rate: 100
 * Currency: Quarter / itemId: 2 / Rate: 25
 * Currency: Dime    / itemId: 3 / Rate: 10
 * Currency: Nickel  / itemId: 4 / Rate: 5
 * Currency: Penny   / itemId: 5 / Rate: 1
 * -----
 * NOTE: The itemIDs do not have to be in any order, they just refer to which 
 * currency from the database Items list to keep track of.
 * -----
 *   Once you've listed your currencies in order of most valuable to least
 * then you just need to define which of these currencies is going to be 
 * your "Standard" currency (what you would normally define as the Party Gold).
 *
 * > > SETTING UP DATABSE < <
 *
 * For items, weapons, and armors you with to buy and sell from a shop, you 
 * will set the price as normal. To buy or sell them as a different currency,
 * such as the Silver Pieces above, put:
 *  <Currency: itemId>
 *   itemId: This is the currency itemId you previously setup
 *
 *  - Example: Using the D&D coin standard
 *  Price: 10 / Notetag: <Currency: 2>    --> Will cost 10 silver pieces
 *
 * > > ALTERNATE CURRENCIES < <
 *
 * To buy an item, weapon, or armor with another item, weapon, or armor 
 * independent of the main currencies, you'll setup its price as normal
 * but use a different notetag:
 *
 * <tag type id>
 *
 * tag: The main notetag to determine using an alternative currency
 *    example: <AltBuy  or  <AltSell
 * type: Item category to buy or sell. (Item - Weapon - Armor)
 *    example: <AltBuy Item
 * id: This is the item, weapon or armor ID in the database.
 *    example: <AltBuy Item 5>
 *
 * ----------------------------------------------------------------------------
 * Terms of Use
 * ----------------------------------------------------------------------------
 *
 * Free to use and modify for commercial and noncommercial games, with credit.
 * Do NOT remove my name from the Author of this plugin
 * Do NOT reupload this plugin (modified or otherwise) anywhere other than the 
 * RPG Maker MV main forums: https://forums.rpgmakerweb.com/index.php
 *
 * ----------------------------------------------------------------------------
 * Changelog
 * ----------------------------------------------------------------------------
 *
 * v1.2 - Upgraded with alternative currencies independent of the main 
 *   currencies to buy or sell items.
 *
 * v1.1 - Functions moved to global so "Load Game" will work.. but kept 
 *   them and the constants unique so it shouldn't clash with other plugins.
 *
 * v1.0 - Plugin finished!
 *
 * ----------------------------------------------------------------------------
 */
/*~struct~NewCurrency:
 * @param itemId
 * @text Currency
 * @type item
 * @desc The item to represent this currency, listed in 
 * Ascending order. If no items, uses default party gold.
 * @default 0
 *
 * @param rate
 * @text Exchange Rate
 * @type number
 * @decimals 0
 * @min 1
 * @desc What is the rate one of these currencies equals 
 * to the lowest currency value? (1 dollar = 100 pennies)
 * @default 10
 */

const lvCur_Params = PluginManager.parameters('LvMZ_Currencies');
const lvCur_curUnits = JSON.parse(lvCur_Params['Currencies']).map(e => JSON.parse(e));
const lvCur_defaultUnit = Number(lvCur_Params['CurrencyUnit']);
const lvCur_curPadding = Number(lvCur_Params['Padding']);

function LordV_Currencies() {
	this.initialize(...arguments);
}

LordV_Currencies.prototype.initialize = function() {
	this._units = [];
	lvCur_curUnits.forEach(e => {
		let data = { id: Number(e.itemId), rate: Number(e.rate) };
		this._units.push(data);
	});
};

// convertPrice: Converts a standard item pricing (via Database) and 
// compares it with any notetags (ex: <Currency:#>) and then returns 
// it in a base number format: see LordV_Currencies.prototype.base()
LordV_Currencies.prototype.convertPrice = function(price, unitId) {
	if (unitId === undefined) unitId = lvCur_defaultUnit;
	if (this.index(unitId) >= 0) {
		const arr = this._units.map(e => unitId === e.id ? price : 0);
		return this.base(arr);
	}
	return price;
};

// base: Converts the currency array into a number based on the 
// exchange rate and the lowest currency item.
// [10,5,5] with a [10000,100,1] conversion --> 100505
LordV_Currencies.prototype.base = function(arr) {
	const list = [];
	for (let i = 0; i < arr.length; i++) {
		let rate = this._units[i].rate;
		let value = arr[i] * rate;
		list.push(value);
	}
	return list.length > 0 ? list.reduce((a,c) => a + c) : 0;
};

// convertBase: Converts the base number into a Currency Array
// depending on how many currencies there are and the exchange rate.
// 100505 (3x currencies at [10000,100,1] rates) --> [10,5,5]
LordV_Currencies.prototype.convertBase = function(baseNumber) {
	let list = [];
	for (let i = 0; i < this._units.length; i++) {
		if (baseNumber <= 0) { list.push(0); continue; }
		let rate = this._units[i].rate;
		let value = Math.floor(baseNumber / rate);
		list.push(value);
		baseNumber -= value * rate;
	}
	return list;
};

LordV_Currencies.prototype.isCurrency = function(item) {
	const units = this._units.map(e => Number(e.id));
	return units.includes(item.id);
};

LordV_Currencies.prototype.index = function(itemId) {
	const units = this._units.map(e => Number(e.id));
	return units.indexOf(itemId);
};

LordV_Currencies.prototype.meta = function(item) {
	if (!item) return {type:'', id:0};
	const tag = /<(?:ALTBUY||ALTSELL)[ ](?:ITEM||WEAPON||ARMOR)[ ](\d+)>/i;
	const match = item.note.match(tag);
	if (match) return {
		type: match[0].split(' ')[1].toLowerCase(),
		id: Number(RegExp.$1)
	};
	if (item.meta.Currency) return {
		type: 'currency',
		id: Number(item.meta.Currency)
	};	
	if (!this.exists()) return {type:'', id:0};
	return {type:'currency', id:lvCur_defaultUnit};
};

LordV_Currencies.prototype.exists = function() {
	return this._units.length > 0;
};

LordV_Currencies.prototype.metaToItem = function(meta) {
	switch (meta.type) {
		case 'item': return $dataItems[meta.id];
		case 'weapon': return $dataWeapons[meta.id];
		case 'armor': return $dataArmors[meta.id];
		default: return null;
	}
};

// --

(() => {
'use strict';

/******************************************************************************
	rmmv_managers.js
******************************************************************************/

const dm_createGameObjects = DataManager.createGameObjects;
DataManager.createGameObjects = function() {
	dm_createGameObjects.call(this);
	$gameCurrency = new LordV_Currencies();
};

const dm_saveContents = DataManager.makeSaveContents;
DataManager.makeSaveContents = function() {
	const contents = dm_saveContents.call(this);
	contents.currencies = $gameCurrency;
	return contents;
};

const dm_extractContents = DataManager.extractSaveContents;
DataManager.extractSaveContents = function(contents) {
	dm_extractContents.call(this, contents);
	$gameCurrency = contents.currencies;
};

/******************************************************************************
	rmmv_objects.js
******************************************************************************/

// --- GAME PARTY ---
const gameParty_gainItem = Game_Party.prototype.gainItem;
Game_Party.prototype.gainItem = function(item, amount, includeEquip) {
	if ($gameCurrency.isCurrency(item)) {
		const newNumber = $gameCurrency.convertPrice(amount, item.id);
		this.gainGold(newNumber);
	} else {
		gameParty_gainItem.call(this, item, amount, includeEquip);
	}
};

/******************************************************************************
	rmmv_scenes.js
******************************************************************************/

const sceneShop_create = Scene_Shop.prototype.create;
Scene_Shop.prototype.create = function() {
	sceneShop_create.call(this);
	this.createAltCurrencyWindow();
};

Scene_Shop.prototype.createAltCurrencyWindow = function() {
	const rect = this.goldWindowRect();
	this._altCurrencyWindow = new Window_AltCurrency(rect);
	this._altCurrencyWindow.hide();
	this.addWindow(this._altCurrencyWindow);
};

// --

const sceneShop_buyingPrice = Scene_Shop.prototype.buyingPrice;
Scene_Shop.prototype.buyingPrice = function() {
	const price = sceneShop_buyingPrice.call(this);
	const meta = $gameCurrency.meta(this._item);
	return meta.type !== 'currency' ? Math.floor(price) : price;
};

const sceneShop_sellingPrice = Scene_Shop.prototype.sellingPrice;
Scene_Shop.prototype.sellingPrice = function() {
	const price = sceneShop_sellingPrice.call(this);
	const meta = $gameCurrency.meta(this._item);
	return meta.type !== 'currency' ? Math.floor(price) : price;
};

const sceneShop_buy = Scene_Shop.prototype.doBuy;
Scene_Shop.prototype.doBuy = function(number) {
	const meta = $gameCurrency.meta(this._item);
	if (meta.type === 'currency' || meta.type === '') {
		return sceneShop_buy.call(this, number);
	}
	const item = $gameCurrency.metaToItem(meta);
	const price = this.buyingPrice();
	$gameParty.loseItem(item, price);
	$gameParty.gainItem(this._item, number);
};

const sceneShop_sell = Scene_Shop.prototype.doSell;
Scene_Shop.prototype.doSell = function(number) {
	const meta = $gameCurrency.meta(this._item);
	if (meta.type === 'currency' || meta.type === '') {
		return sceneShop_sell.call(this, number);
	}
	const item = $gameCurrency.metaToItem(meta);
	const price = this.sellingPrice();
	$gameParty.gainItem(item, price);
	$gameParty.loseItem(this._item, number);
};

const sceneShop_maxBuy = Scene_Shop.prototype.maxBuy;
Scene_Shop.prototype.maxBuy = function() {
    const meta = $gameCurrency.meta(this._item);
	const reqItem = $gameCurrency.metaToItem(meta);
	// Call original if not buying with alternate currencies
	if (!reqItem) return sceneShop_maxBuy.call(this);
	// Otherwise, return the proper amount
	const num = $gameParty.numItems(this._item);
    const max = $gameParty.maxItems(this._item) - num;
	const items = $gameParty.numItems(reqItem);
	const price = this.buyingPrice();
    if (price > 0) {
        return Math.min(max, Math.floor(items / price));
    } else {
        return max;
    }
};

/******************************************************************************
	rmmv_windows.js
******************************************************************************/

// --- WINDOW BASE ---
Window_Base.prototype.drawAltCurrency = function(value, item, rect) {
	let width = rect.width;
	width = this.drawAltCurrencyUnit(value, item, rect.x, rect.y, width);
	width -= lvCur_curPadding;
};

Window_Base.prototype.drawAltCurrencyUnit = function(value, item, x, y, width) {
	const iconIndex = item ? item.iconIndex || 0 : 0;
	if (iconIndex > 0) {
		width -= ImageManager.iconWidth;
		this.drawIcon(iconIndex, x + width, y + 2);
	}
	this.drawText(value, x, y, width-lvCur_curPadding, 'right');
	width -= this.textWidth(value);
	width -= lvCur_curPadding;
	return width;
};

Window_Base.prototype.drawCurrencies = function(units, rect, party) {
	if (party === undefined) party = false;
	let width = rect.width;
	for (let i = units.length - 1; i >= 0; i--) {
		let value = units[i];
		if (value > 0 || party) {
			let itemId = $gameCurrency._units[i].id;
			let item = $dataItems[itemId];
			width = this.drawCurrencyUnit(value, item, rect.x, rect.y, width);
			width -= lvCur_curPadding;
		}
	}
};

Window_Base.prototype.drawCurrencyUnit = function(value, item, x, y, width) {
	const iconIndex = DataManager.isItem(item) ? item.iconIndex || 0 : 0;
	if (iconIndex > 0) {
		width -= ImageManager.iconWidth;
		this.drawIcon(iconIndex, x + width, y + 2);
	}
	if (value > $gameParty.maxGold()) {
		if (Imported.VisuMZ_0_CoreEngine) {
			value = VisuMZ.CoreEngine.Settings.Gold.GoldOverlap;
		} else {
			value = 'A lot!';
		}
	}
	this.drawText(value, x, y, width-lvCur_curPadding, 'right');
	width -= this.textWidth(value);
	width -= lvCur_curPadding;
	return width;
};


// --- WINDOW SELECTABLE ---
const winSel_select = Window_Selectable.prototype.select;
Window_Selectable.prototype.select = function(index) {
	winSel_select.call(this, index);
	const scene = SceneManager._scene;
	const buyWindow = scene._buyWindow;
	const isActive = buyWindow ? buyWindow.active : false;
	if (scene.constructor === Scene_Shop && isActive) {
		const goldWindow = scene._goldWindow;
		const altCurWindow = scene._altCurrencyWindow;
		// Check the current item for alternative currencies
		const item = buyWindow.item();
		const meta = $gameCurrency.meta(item);
		const reqItem = $gameCurrency.metaToItem(meta);
		if (reqItem) { // Use Alternative Currency Window
			goldWindow.hide();
			altCurWindow.show();
			altCurWindow.setItem(item);
		} else { // Use Default Gold Window
			altCurWindow.setItem(null);
			altCurWindow.hide();
			goldWindow.show();
		}
	}
};


// --- WINDOW GOLD ---
const windowGold_init = Window_Gold.prototype.initialize;
Window_Gold.prototype.initialize = function(rect) {
	const check = (
		SceneManager._scene.constructor === Scene_Menu && 
		!Imported.VisuMZ_1_MainMenuCore
	);
	if (check || !$gameCurrency.exists()) {
		windowGold_init.call(this, rect);
	} else {
		Window_Base.prototype.initialize.call(this, rect);
		const length = lvCur_curUnits.length - 1;
		const iw = ImageManager.iconWidth;
		const v1 = this.textWidth("00000000");
		const v2 = this.textWidth("00");
		const group1 = iw + (lvCur_curPadding * 3) + v1;
		const group2 = iw + (lvCur_curPadding * 3) + v2;
		rect.width = Math.ceil(group1 + group2 * length);
		rect.x = Graphics.boxWidth - rect.width;
		windowGold_init.call(this, rect);
	}
};

const winGold_refresh = Window_Gold.prototype.refresh;
Window_Gold.prototype.refresh = function() {
	if (!$gameCurrency.exists()) return winGold_refresh.call(this);
	const rect = this.itemLineRect(0);	
	const gold = $gameParty.gold();
	const check = SceneManager._scene.constructor;
	let units = $gameCurrency.convertBase(gold);
	if (check === Scene_Menu && !Imported.VisuMZ_1_MainMenuCore) {
		units = [units[0]];
	}
	this.contents.clear();
	this.drawCurrencies(units, rect, true);
};


// --- WINDOW SHOP_BUY ---
const windowShopBuy_price = Window_ShopBuy.prototype.price;
Window_ShopBuy.prototype.price = function(item) {
	const price = windowShopBuy_price.call(this, item);
	const meta = $gameCurrency.meta(item);
	if (meta.type === 'currency') {
		return $gameCurrency.convertPrice(price, meta.id);
	}
	return price;
};

// overwrite
Window_ShopBuy.prototype.isEnabled = function(item) {
	if (!item) return false;
	if ($gameParty.hasMaxItems(item)) return false;
	const meta = $gameCurrency.meta(item);
	const reqItem = $gameCurrency.metaToItem(meta);
	const check = reqItem ? $gameParty.numItems(reqItem) : this._money;
    return this.price(item) <= check;
};

const wsb_makeList = Window_ShopBuy.prototype.makeItemList;
Window_ShopBuy.prototype.makeItemList = function() {
	wsb_makeList.call(this);
	this._price.forEach(e => { // removes items with no price
		if (e <= 0) {
			let index = this._price.indexOf(e);
			let item = this._data[index];
			this._data.remove(item);
			this._price.remove(e);
		}
	});
};

// overwrite
Window_ShopBuy.prototype.drawItem = function(index) {
	const item = this.itemAt(index);
	const meta = $gameCurrency.meta(item);
	const reqItem = $gameCurrency.metaToItem(meta);
    let price = this.price(item);
	if (Imported['LvMZEconomy']) {
		price = LordV.Economy.economicBuyPrice(price);
	}
    const rect = this.itemLineRect(index);
    this.changePaintOpacity(this.isEnabled(item));
    this.drawItemName(item, rect.x, rect.y, rect.width);
	if (reqItem) {
		price = Math.floor(price); // just in case (economicBuyPrice)
		this.drawAltCurrency(price, reqItem, rect);
	} else {
		const units = $gameCurrency.convertBase(price);
		this.drawCurrencies(units, rect);
	}
    this.changePaintOpacity(true);
};


// --- WINDOW SHOP_NUMBER ---
// overwrite
Window_ShopNumber.prototype.drawTotalPrice = function() {
	const meta = $gameCurrency.meta(this._item);
	const reqItem = $gameCurrency.metaToItem(meta);
	const total = this._price * this._number;
	const padding = this.itemPadding();
	const rect = {
		x: 0,
		y: this.totalPriceY(),
		width: this.innerWidth - padding * 2
	};
	if (reqItem) {
		this.drawAltCurrency(total, reqItem, rect);
	} else {
		const units = $gameCurrency.convertBase(total);
		this.drawCurrencies(units, rect);
	}
};


// --- CUSTOM WINDOWS ---
function Window_AltCurrency() {
	this.initialize(...arguments);
}

Window_AltCurrency.prototype = Object.create(Window_Selectable.prototype);
Window_AltCurrency.prototype.constructor = Window_AltCurrency;

Window_AltCurrency.prototype.initialize = function(rect) {
	if ($gameCurrency.exists()) {
		Window_Base.prototype.initialize.call(this, rect);
		const length = lvCur_curUnits.length - 1;
		const iw = ImageManager.iconWidth;
		const v1 = this.textWidth("00000000");
		const v2 = this.textWidth("00");
		const group1 = iw + (lvCur_curPadding * 3) + v1;
		const group2 = iw + (lvCur_curPadding * 3) + v2;
		rect.width = Math.ceil(group1 + group2 * length);
		rect.x = Graphics.boxWidth - rect.width;
	}
	Window_Selectable.prototype.initialize.call(this, rect);
	this._item = null;
};

Window_AltCurrency.prototype.colSpacing = function() {
    return 0;
};

Window_AltCurrency.prototype.setItem = function(item) {
	this._item = item;
	this.refresh();
};

Window_AltCurrency.prototype.refresh = function() {
    const rect = this.itemLineRect(0);
	const meta = $gameCurrency.meta(this._item);
	const reqItem = $gameCurrency.metaToItem(meta);
	this.contents.clear();
	this.drawAltCurrency(this.value(reqItem), reqItem, rect);
};

Window_AltCurrency.prototype.value = function(item) {
    return $gameParty.numItems(item);
};

})();
