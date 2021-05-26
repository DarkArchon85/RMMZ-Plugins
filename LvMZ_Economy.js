// ============================================================================
//  LordValinar Plugin - Economy System
//  LvMZ_Economy.js
// ============================================================================

var Imported = Imported || {};
Imported["LvMZEconomy"] = true;

// Only acquire the essentials:
if (!Imported['LvMZCore']) {
	/**
	* Formats a percentile number to remove all trails
	*
	* @memberof JsExtensions
	* @returns {number} A formatted number
	*/
	Number.prototype.percent = function() {
		return Number(this.toFixed(2)).clamp(-1,1);
	};
	
	/**
	 * Searches an array filled with objects to find the index
	 *   by key and value.
	 *
	 * @memberof JsExtensions
	 * @param {string} key object to map
	 * @param {any} value the value to match in the mapped array
	 * @returns {number} Index of the array by key and value
	 */
	Array.prototype.indexByKey = function(key, value) {
		return this.map(e => e[key]).indexOf(value);
	};
	
	/**
	 * Sorts an array with multiple columns
	 *
	 * @memberof JsExtensions
	 * @param {number} cA Index of column A
	 * @param {number} cB Index of column B
	 * @returns {array} Sorted array by multiple columns
	 */
	Array.prototype.sortByColumn = function(cA, cB) {
		return this.sort((a,b) => {
			return a[cA] === b[cA] ? a[cB] - b[cB] : a[cA] - b[cA];
		});
	};
	
	function MapManager() {
		throw new Error("This is a static class!");
	}

	MapManager.event = function() {
		const intr = $gameMap._interpreter;
		return intr ? $gameMap.event(intr._eventId) : null;
	};
}

/*:
 * @target MZ
 * @plugindesc [v1.3] Gives life to the world and its merchants by varying up
 * their prices based on several factors (including relations and supply).
 * @author LordValinar
 * @url https://github.com/DarkArchon85/RMMZ-Plugins
 * @orderAfter VisuMZ_1_ItemsEquipsCore
 * @orderAfter LvMZ_Factions
 *
 * @help
 * ----------------------------------------------------------------------------
 * Introduction
 * ----------------------------------------------------------------------------
 *
 * This plugin is designed to change shops in a major way (May not be
 * compatible with many plugins that also change the shop).
 *
 * - The first and major change is giving shops a limited stock to sell  
 *   to the player and purchase things from the player.
 *
 * - The second is a persistent inventory (If you sell something to that 
 *   merchant.. it'll still be there!) This includes having multiple 
 *   types of shops on the same NPC (a shady merchant with 'special' 
 *   stock?)
 *
 * In addition, there are also "Regions" which can represent different 
 * states, countries, kingdoms, and so on - each with their own tax rate 
 * and subsection controlling Demand. Supply is handled on the merchants
 * themselves.
 *
 * This plugin is part of a set, but can be used independently.
 *
 * == THE ECONOMICS TRINITY ==
 *  - LvMZ_Factions.js
 *  - LvMZ_Economy.js
 *  - LvMZ_Currencies.js
 *
 * ----------------------------------------------------------------------------
 * Instructions
 * ----------------------------------------------------------------------------
 *
 * First and foremost, is the setup. I will try to explain the best I can
 * in regards to each section. So we'll go in order:
 *
 * >> SUPPLY & DEMAND <<
 *
 * Supply settings allow a variance on shop prices based on if the shop has 
 * a certain number of items within your parameter's threshold, and even 
 * then only if they exceed every Nth of your offset parameter.
 *
 * : Min and Max Supply Limits
 *  - These are the thresholds that an item count must exceed before a 
 *    check is made to determine if the price should be adjusted.
 *
 * : Excess Offset
 *  - When an item count is every Nth amount below or above the threshold,
 *    the price is adjusted. So if the offset is 2 and the minimum is 8,
 *    then when the count reaches 6, 4, and 2, the price increases by 
 *    the assigned Price Adjustment.
 *
 * : Price Adjustment
 *  - The amount (in percentage) added or removed from the original 
 *    price of the item.
 *
 * : Regions
 *  - Regions allow you a degree of control over the "Demand" portion.
 *    In addition, tax rates are also set here.
 *  You start by giving a Region a name, a tax rate, and then list what 
 *  Demand Categories you want for items (if any). This way if an item 
 *  has the proper notetag, it will be affected by the prices.
 *  NOTE: Demand adjustments only affect normal currencies/gold rates,
 *   and not alternate currencies (LvMZ_Currencies)
 *
 *  - To set a region, use a plugin parameter (Change Region). 
 *  - To set an item for a demand, use the following notetag:
 * <Demand: name>         
 *  : name being the demand category (case-insensitive)
 *
 *
 * >> GOLD ICON ID <<
 *
 * Fairly straight-forward. Changes the default window with an icon.
 * NOTE: If using VisuStella's Core plugin, you can ignore this.
 *
 *
 * >> STOLEN ITEMS <<
 *
 * This plugin also comes complete with the option to keep track of 
 * stolen items! Sell them back to a shop that is willing (a fence?)
 * or get caught and go to jail! Restore stolen items at any point you 
 * choose (if ever), change prices of stolen items.. and lastly the 
 * ability to temporarily store the party gear if they DO get caught 
 * and need to "put it away" in a lockup or something.
 *
 * : Stolen Item Icon
 *  - This is the icon ID to use in item naming schemes when you are in 
 *    a shop or other menu. The item name is also changed to red ( or 
 *    color 2 from the Windowskin pallette ).
 * 
 * : Stolen Value Markdown
 *  - This is the percentage the item price drops down by if stolen.
 *
 * : Shops Buy Stolen Items
 *  - 3 modes here "Always", "Varies", and "Never":
 *   ALWAYS - Every shop will buy stolen goods. Plain and simple.
 *   VARIES - Only shops with <StolenItems: Allow> comment tag to buy them.
 *   NEVER  - No shop will buy stolen items.
 *
 * : Stolen Self Switch
 *  - When you steal an item from an area, it's most likely an Event,
 *    in which case you should use Self Switches to make them "Disappear".
 *    When using either the plugin command or script call to return 
 *    stolen items, this is the Self Switch the plugin will look for 
 *    in addition to the mapId it was stolen from, and which eventId 
 *    was the actual item.
 *
 *
 * >> PRICING & SHOP FUNDS <<
 *
 * By default prices are 100% of whatever the database item is, and 
 * selling them gets you 50% of their database price.
 *
 * As long as the item is being purchased or sold with the default 
 * currency method (meaning no <AltCurrency:> selections), it will 
 * use the markup or markdown as a base before calculating the taxes
 * (and possibly adjustments from LvMZ_Factions)!
 * NOTE: With LvMZ_Currencies, it is possible to get decimals in 
 * the calculations, which will be converted if you have multiple 
 * currencies (see LvMZ_Currencies documentation for more detail).
 *
 * : Starting Funds
 *  - The shop will begin with this much money to purchase items 
 *    from players. It will be up to the developer (you) to determine 
 *    when the shop (if ever) gets more money aside from items.
 *
 *  - You can use a plugin command or script call to add more funds.
 *    Or even remove them..
 *
 *
 * : Starting Funds Variance
 *  - Adds or subtracts a random amount from this, to the shop's 
 *    starting funds. Setting to 0 will obviously give no variance.
 *
 * ----------------------------------------------------------------------------
 * The following functions have been overwritten
 * ----------------------------------------------------------------------------
 *
 * [rmmz_scenes.js]
 *  - Scene_Shop.prototype.goldWindowRect
 *  - Scene_Shop.prototype.buyingPrice
 *  - Scene_Shop.prototype.sellingPrice
 *  - Scene_Shop.prototype.doBuy
 *  - Scene_Shop.prototype.doSell
 * [rmmz_windows.js]
 *  - Window_ItemList.prototype.makeItemList
 *  - Window_Gold.prototype.refresh
 *  - Window_ShopBuy.prototype.isEnabled
 *  - Window_ShopBuy.prototype.makeItemList
 *  - Window_ShopBuy.prototype.drawItem
 * [LvMZ_Factions.js]
 *  - Game_Interpreter.prototype.loaded
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
 * v1.3 - Now stores party inventory multiple times (instead of overriding) if
 *        caught stealing. Retrieving gear takes the first set each time the 
 *        method is called (until array is empty);
 * 	    - Added option to run an event if you buy out a shop's stock.
 *      - supplyCheck method's adjustment wasn't multiplying properly
 *      - Added gender checks from LvMZ_Factions(v1.1)
 *
 * v1.2 - Added individual shop funds
 *
 * v1.1 - Fixed random item count (wasn't randomizing for EACH item)
 *
 * v1.0 - Plugin finished!
 *
 * ----------------------------------------------------------------------------
 *
 * @param supplyDemand
 * @text Supply & Demand
 * @type struct<SnD>
 * @desc Data stored for each region, including taxes, and the 
 * supply and demand settings for each.
 * @default {}
 *
 * @param goldIcon
 * @text Gold Icon ID
 * @type number
 * @min 0
 * @desc Spice up the gold windows for both the party and the 
 * shop! Setting to 0 uses unit text only.
 * @default 314
 *
 * @param paramBreak1
 * @text --------------------------
 * @default ----------------------------------
 *
 * @param stolenIcon
 * @text Stolen Item Icon
 * @type number
 * @decimals 0
 * @min 0
 * @desc The icon to display in menus for stolen items.
 * @default 19
 *
 * @param stolenValue
 * @text Stolen Value Markdown
 * @type number
 * @decimals 0
 * @min 0
 * @max 100
 * @desc How much does the price drop by (percentage) for 
 * stolen items. (ie [90%] of a 100g potion = 10g buy price)
 * @default 0
 *
 * @param stolenMerch
 * @text Shops Buy Stolen Items
 * @type select
 * @option Always
 * @option Varies
 * @option Never
 * @desc Decide whether or not shops can buy stolen items, 
 * or if they must be independently set ON or OFF
 * @default Always
 *
 * @param stolenSelfSw
 * @text Stolen Self Switch
 * @desc The Self Switch of each stolen item EVENT to reset
 * if the script or plugin is called: A  B  C  D
 * @default A
 *
 * @param paramBreak2
 * @text --------------------------
 * @default ----------------------------------
 *
 * @param Markup
 * @text Price Markup
 * @type number
 * @decimals 0
 * @desc Multiplies the price of an item, weapon, or armor 
 * by this amount for buying items in shops.
 * @default 100
 *
 * @param Markdown
 * @text Price Markdown
 * @type number
 * @decimals 0
 * @desc Multiplies the price of an item, weapon, or armor 
 * by this amount for selling items to shops.
 * @default 50
 *
 * @param ShopFunds
 * @text Starting Funds
 * @type number
 * @decimals 0
 * @min 0
 * @desc Shops with limited money to purchase player goods.
 * @default 5000
 *
 * @param ShopVariance
 * @text Starting Funds Variance
 * @type number
 * @decimals 0
 * @min 0
 * @desc Add or subtract a random amount of this value from the 
 * shop's starting funds.
 * @default 1000
 *
 * @param breakEnd
 * @text --------------------------
 * @default ----------------------------------
 *
 * @param shopCloseEv
 * @text Shop Closed Event
 * @type number
 * @min 0
 * @max 2000
 * @desc Buying out a store closes it and runs a common event
 * Select 0 to not run any common event on close.
 * @default 0
 *
 * @ --------------------------------------------------------------------------
 *
 * @command chngRegion
 * @text Change Region
 * @desc Regions control tax rates and the supply and demand
 * for merchant stock. 
 * 
 * @arg name
 * @text Region Name
 * @desc Name of the region to change to. Must exist from 
 * setup. Case-Sensitive and must exist!.
 * @default 
 *
 * @ --------------------------------------------------------------------------
 *
 * @command addRegion
 * @text Add Region
 * @desc Create a new region to control tax, supply and 
 * demand for merchant stock.
 *
 * @arg name
 * @text Region Name
 * @desc The name to assign this region.
 * NOTE: Case-Sensitive and must exist in paramters!
 * @default 
 *
 * @arg rate
 * @text Tax Rate
 * @type number
 * @decimals 0
 * @min 0
 * @max 100
 * @desc The tax rate (percentage) to apply to merchants in 
 * this region. (Buying)
 * @default 0
 *
 * @arg cat
 * @text Categories
 * @type struct<Demand>[]
 * @desc List of Demand categories for item pricing. Higher 
 * the demand, the more expensive the item!
 * @default []
 *
 * @ --------------------------------------------------------------------------
 *
 * @command removeRegion
 * @text Remove Region
 * @desc Removes a region from the available list
 *
 * @arg name
 * @text Region Name
 * @desc The name to assign this region.
 * NOTE: Case-Sensitive and must exist in paramters!
 * @default 
 *
 * @ --------------------------------------------------------------------------
 *
 * @command chngTaxRate
 * @text Change Tax Rate
 * @desc Do you want to raise or lower taxes for this 
 * region?
 *
 * @arg name
 * @text Region Name
 * @desc Name of the region to change taxes for.
 * NOTE: Case-Sensitive and must exist in paramters!
 * @default 
 *
 * @arg type
 * @text Change Type
 * @type select
 * @option Raise
 * @option Lower
 * @desc Are you raising or lowering the taxes?
 * @default Raise
 *
 * @arg value
 * @text Change Amount
 * @type number
 * @decimals 0
 * @min 1
 * @max 100
 * @desc The amount to change the current tax rate by.
 * @default 1
 *
 * @ --------------------------------------------------------------------------
 *
 * @command stealItem
 * @text Steal Item
 * @desc Adds an item to the party's inventory, but unlike
 * the others, will be marked as "Stolen"!! You thief!
 *
 * @arg type
 * @text Item Type
 * @type select
 * @option Item
 * @option Weapon
 * @option Armor
 * @desc Item type to retrieve from the database.
 * @default Item
 *
 * @arg itemId
 * @text Item Database ID
 * @type number
 * @decimals 0
 * @min 1
 * @max 2000
 * @desc The database ID for the item, weapon, or armor.
 * @default 1
 *
 * @arg value
 * @text Item Amount
 * @type number
 * @decimals 0
 * @min 1
 * @desc How many of the item(s) are you stealing?
 * @default 1
 *
 * @ --------------------------------------------------------------------------
 *
 * @command resetStolen
 * @text Recover Stolen Items
 * @desc Resets all stolen items in every map
 * 
 * @ --------------------------------------------------------------------------
 *
 * @command changeShop
 * @text Change Shop
 * @desc Call this before changing an event's page to an alternate
 * shop. It will store the data first before changing.
 *
 * @arg shopId
 * @text Shop ID
 * @type number
 * @decimals 0
 * @min 1
 * @max 99
 * @desc The shop ID to change to on the current event. 
 * 1 = the default (starting) shop used.
 * @default 1
 * 
 * @ --------------------------------------------------------------------------
 *
 * @command shopGold
 * @text Adjust Shop Gold
 * @desc Add or remove gold from the shop
 *
 * @arg mapId
 * @text Map ID
 * @type number
 * @decimals 0
 * @min 1
 * @max 999
 * @desc The map ID where the shop is
 * @default 1
 *
 * @arg eventId
 * @text Event ID
 * @type number
 * @decimals 0
 * @min 1
 * @max 999
 * @desc The event ID of where the shop is
 * @default 1
 *
 * @arg value
 * @text Gold Amount
 * @type number
 * @decimals 0
 * @min -99999999
 * @max 99999999
 * @desc How much gold to add or subtract from the shop?
 * @default 0
 */
// ============================================================================
/*~struct~SnD:
 * @param -- Supply Settings --
 *
 * @param supplyMin
 * @text Min Supply Limit
 * @parent -- Supply Settings --
 * @type number
 * @desc Lower threshold before prices increase for the rarity
 * of items of this amount. (Less Than)
 * @default 40
 *
 * @param supplyMax
 * @text Max Supply Limit
 * @parent -- Supply Settings --
 * @type number
 * @desc Upper threshold before prices decrease for items of 
 * this amount. (Greater Than)
 * @default 60
 *
 * @param supplyOffset
 * @text Excess Offset
 * @parent -- Supply Settings --
 * @type number
 * @desc For every Nth of this amount of items that pass the 
 * supply limits (min/max), we adjust prices by the rate.
 * @default 5
 *
 * @param supplyRate
 * @text Supply Price Adjustment
 * @parent -- Supply Settings --
 * @type number
 * @decimals 0
 * @min 0
 * @max 100
 * @desc Amount (percentage) to adjust prices for rarer or 
 * more common items. (use positive number only).
 * @default 1
 *
 * @param -- Regions --
 *
 * @param regions
 * @text Region Settings
 * @parent -- Regions --
 * @type struct<Region>[]
 * @desc Controls taxes and factional demand from 'regions' -
 * the designation for states, kingdoms, countries, etc.
 * @default []
 */
// ============================================================================
/*~struct~Region:
 * @param name
 * @text Region Name
 * @desc The name of the region to control
 * @default 
 *
 * @param rate
 * @text Tax Rate
 * @type number
 * @decimals 0
 * @min 0
 * @max 100
 * @desc The tax rate (in percentage) for this region.
 * @default 0
 *
 * @param categories
 * @text Demand Categories
 * @type struct<Demand>[]
 * @desc Demand categories to control the market for select 
 * items designated with the proper notetag.
 * @default []
 */
// ============================================================================
/*~struct~Demand:
 * @param name
 * @text Category Name
 * @desc The name to assign and check item tags for.
 * @default 
 *
 * @param rate
 * @text Price Adjustment
 * @type number
 * @decimals 0
 * @min -100
 * @max 100
 * @desc The price adjustment (percentage) when this demand 
 * is higher or lower than 0.
 * @default 0
 */

(() => {
'use strict';

const pluginName = 'LvMZ_Economy';
const lvParams = PluginManager.parameters(pluginName);
const lvGoldIcon = Number(lvParams['goldIcon']);
// - Stolen Items Settings -
const stolenIcon = Number(lvParams['stolenIcon']);
const stolenValue = (Number(lvParams['stolenValue'])/100).percent();
const stolenMerch = String(lvParams['stolenMerch']);
const stolenSelfSw = String(lvParams['stolenSelfSw']).toUpperCase();
// - Direct Shop Manipulation -
const markUp = (Number(lvParams['Markup'])/100).percent();
const markDown = (Number(lvParams['Markdown'])/100).percent();
const shopFunds = Number(lvParams['ShopFunds']);
const variance = Number(lvParams['ShopVariance']);
// - Supply & Demand -
const SnD = JSON.parse(lvParams['supplyDemand']);
const minSupply = Number(SnD.supplyMin);
const maxSupply = Number(SnD.supplyMax);
const offSupply = Number(SnD.supplyOffset);
const adjSupply = Number(SnD.supplyRate);
// - Other Generic Settings -
const shopCloseEv = Number(lvParams['shopCloseEv']);

/******************************************************************************
	plugin commands
******************************************************************************/

PluginManager.registerCommand(pluginName, 'chngRegion', args => {
	$gameSystem.changeRegion(args.name);
});

PluginManager.registerCommand(pluginName, 'addRegion', args => {
	const rate = Number(args.rate);
	const categories = JSON.parse(args.cat).map(e => JSON.parse(e));
	$gameSystem.addRegion(args.name, rate, categories);
});

PluginManager.registerCommand(pluginName, 'removeRegion', args => {
	$gameSystem.removeRegion(args.name);
});

PluginManager.registerCommand(pluginName, 'chngTaxRate', args => {
	const type = String(args.type).toLowerCase();
	const amount = Number(args.value);
	switch (type) {
		case 'raise': 
			$gameSystem.increaseTaxRate(args.name, amount); 
			break;
		case 'lower': 
			$gameSystem.decreaseTaxRate(args.name, amount); 
			break;
	}
});

PluginManager.registerCommand(pluginName, 'stealItem', args => {
	const id = Number(args.itemId);
	const item = itemGroup(args.type)[id];
	const amount = Number(args.value);
	$gameParty.stealItem(item, amount);
});

PluginManager.registerCommand(pluginName, 'resetStolen', args => {
	$gameMap.recoverStolenItems();
});

PluginManager.registerCommand(pluginName, 'changeShop', args => {
	const id = Number(args.shopId);
	MapManager.event().switchShops(id);
});

PluginManager.registerCommand(pluginName, 'shopGold', args => {
	const mapData = $gameMap._shopData[Number(args.mapId)];
	if (mapData) {
		const shop = mapData[Number(args.eventId)];
		if (shop) shop.addGold(Number(args.value));
	}
});

/******************************************************************************
	rmmv_managers.js
******************************************************************************/

const db_isItem = DataManager.isItem;
DataManager.isItem = function(item) {
    return db_isItem.call(this, itemProxy(item));
};

const db_isWeapon = DataManager.isWeapon;
DataManager.isWeapon = function(item) {
    return db_isWeapon.call(this, itemProxy(item));
};

const db_isArmor = DataManager.isArmor;
DataManager.isArmor = function(item) {
    return db_isArmor.call(this, itemProxy(item));
};

/******************************************************************************
	rmmv_objects.js
******************************************************************************/

// --- GAME SYSTEM ---
const gameSys_init = Game_System.prototype.initialize;
Game_System.prototype.initialize = function() {
	gameSys_init.call(this);
	this.initRegions();
};

Game_System.prototype.initRegions = function() {
	this._region = '';
	this._regionData = [];
	const regionList = JSON.parse(SnD.regions).map(e => JSON.parse(e));
	regionList.forEach(r => {
		let cat = JSON.parse(r.categories).map(e => JSON.parse(e));
		this._regionData.push({
			name: r.name,
			taxRate: Number(r.rate),
			demands: this.initDemands(cat)
		});
	});
};

Game_System.prototype.initDemands = function(categories) {
	return categories.reduce((r,c) => {
		r.push({ name:c.name, rate:Number(c.rate) });
		return r;
	},[]);
};

Game_System.prototype.addRegion = function(region, rate, categories) {
	this._regionData.push({
		name: region,
		taxRate: Number(rate).clamp(0,100),
		demands: this.initDemands(categories)
	});
};

Game_System.prototype.removeRegion = function(region) {
	if (this.validRegion(region)) {
		const index = this._regionData.indexByKey("name", region);
		this._regionData.splice(index, 1);
	}
};

Game_System.prototype.changeRegion = function(region) {
	if (this.validRegion(region)) {
		this._region = region;
	}
};

Game_System.prototype.taxRate = function(region) {
	if (region === undefined) region = this._region;
	if (this.validRegion(region)) {
		const index = this._regionData.indexByKey("name", region);
		return (this._regionData[index].taxRate / 100).percent();
	}
	return 0;
};

Game_System.prototype.increaseTaxRate = function(region, amount) {
	if (this.validRegion(region)) {
		const index = this._regionData.indexByKey("name", region);
		const cv = this._regionData[index].taxRate;
		this._regionData[index].taxRate = (cv + amount).clamp(0,100);
	}
};

Game_System.prototype.decreaseTaxRate = function(region, amount) {
	this.increaseTaxRate(region, -amount);
};

Game_System.prototype.demandRate = function(index) {
	const item = MapManager.event().shopData()._goods[index];
	if (!item || !this.validRegion(this._region)) return 0;
	const tag = /<DEMAND:\s([^>]*)>/i;
	if (item.note.match(tag)) {
		let name = RegExp.$1;
		let index = this._regionData.indexByKey("name", this._region);
		const list = this._regionData[index].demands;
		if (list.map(e => e.name).includes(name)) {
			index = list.indexByKey('name', name);
			return (list[index].rate / 100).percent();
		}
	}
	return 0;
};

Game_System.prototype.validRegion = function(region) {
	return this._regionData.map(e => e.name).includes(region);
};

Game_System.prototype.markUp = function() {
	return markUp;
};

Game_System.prototype.markDown = function() {
	return markDown;
};


// --- GAME PARTY ---
const gameParty_init = Game_Party.prototype.initialize;
Game_Party.prototype.initialize = function() {
	gameParty_init.call(this);
	this.initStolenGoods();
};

Game_Party.prototype.initStolenGoods = function() {
	this._stolenItems = {};
	this._stolenWeapons = {};
	this._stolenArmors = {};
};

Game_Party.prototype.stolenItems = function() {
	return Object.keys(this._stolenItems).reduce((r,id) => {
		const item = JSON.parse(JSON.stringify($dataItems[id]));
		item.price -= item.price * stolenValue;
		item.stolen = 'item';
		item.description = '(stolen) '+item.description;
		r.push(item);
		return r;
	},[]);
};

Game_Party.prototype.stolenWeapons = function() {
	return Object.keys(this._stolenWeapons).reduce((r,id) => {
		const item = JSON.parse(JSON.stringify($dataWeapons[id]));
		item.price -= item.price * stolenValue;
		item.stolen = 'weapon';
		item.description = '(stolen) '+item.description;
		r.push(item);
		return r;
	},[]);
};

Game_Party.prototype.stolenArmors = function() {
	return Object.keys(this._stolenArmors).reduce((r,id) => {
		const item = JSON.parse(JSON.stringify($dataArmors[id]));
		item.price -= item.price * stolenValue;
		item.stolen = 'armor';
		item.description = '(stolen) '+item.description;
		r.push(item);
		return r;
	},[]);
};

Game_Party.prototype.allStolen = function() {
	return this.stolenItems()
		.concat(this.stolenWeapons())
		.concat(this.stolenArmors());
};

Game_Party.prototype.stealItem = function(item, amount, includeEquip) {
	const container = this.stolenGoods(item);
	if (container) {
		const newValue = this.numStolenGoods(item) + amount;
		container[item.id] = newValue.clamp(0, this.maxItems());
		if (container[item.id] === 0) {
			delete container[item.id];
		}
		if (includeEquip && newValue < 0) {
			this.discardMembersEquip(item, -newValue);
		}
		$gameMap.requestRefresh();
	}
};

Game_Party.prototype.stolenGoods = function(item) {
	if (!item) return null;
	if (DataManager.isItem(item)) return this._stolenItems;
	if (DataManager.isWeapon(item)) return this._stolenWeapons;
	if (DataManager.isArmor(item)) return this._stolenArmors;
	return null;
};

Game_Party.prototype.numStolenGoods = function(item) {
	const container = this.stolenGoods(item);
	return container ? container[item.id] || 0 : 0;
}

const gameParty_numItems = Game_Party.prototype.numItems;
Game_Party.prototype.numItems = function(item) {
	const num = gameParty_numItems.call(this, item);
	const stolen = this.numStolenGoods(item);
	if (this._showAll) {
		this._showAll = false;
		return num + stolen;
	}
	return item.stolen ? stolen : num;
};

const gameParty_gainItem = Game_Party.prototype.gainItem;
Game_Party.prototype.gainItem = function(item, amount, includeEquip) {
	if (item && item.stolen) return this.stealItem(item, amount, includeEquip);
	gameParty_gainItem.call(this, item, amount, includeEquip);
};

// This will temporarily remove the party's inventory and 
// equipment and store it in a separate array to be retrieved
// later ($gameParty.retrieveGear())
// * recover{boolean}: Can reset stolen item events in the world
Game_Party.prototype.storeGear = function(recover = false) {
	this._storage = this._storage || [];
	// - First we Unequip the party's equipment -
	for (const actor of this.battleMembers()) {
		actor.clearEquipments();
	}
	// - Then we store every legit equipment -
	const data = [this._items, this._weapons, this._armors, this._gold];
	this._storage.unshift(data);
	// - Finally, we Clear (re-initialize) -
	this._gold = 0;
	this.initAllItems();
	this.initStolenGoods();
	if (recover) $gameMap.recoverStolenItems();
};

// NOTE: Only retrieves the last stored gear
Game_Party.prototype.retrieveGear = function() {
	// If nothing to retrieve - exit
	if (!this._storage || this._storage.length <= 0) return;
	const storage = this._storage.shift();
	// Gain Old Items
	const items = storage[0];
	for (const key in items) {
		this._items[key] = this._items[key] || 0;
		this._items[key] += items[key];
	}
	// Gain Old Weapons
	const weapons = storage[1];
	for (const key in weapons) {
		this._weapons[key] = this._weapons[key] || 0;
		this._weapons[key] += weapons[key];
	}
	// Gain Old Armors
	const armors = storage[2];
	for (const key in armors) {
		this._armors[key] = this._armors[key] || 0;
		this._armors[key] += armors[key];
	}
	// Gain Old Gold
	const gold = storage[3];
	this._gold = (this._gold + gold).clamp(0, this.maxGold());
};

// Use in conditional branches
Game_Party.prototype.gearStored = function() {
	if (!this._storage) return false;
	return this._storage.length > 0;
};


// --- GAME MAP ---
const gameMap_init = Game_Map.prototype.initialize;
Game_Map.prototype.initialize = function() {
	gameMap_init.call(this);
	this._shopData = [];
	this._stolenItems = [];
};

Game_Map.prototype.recoverStolenItems = function() {
	for (const key of this._stolenItems) {
		$gameSelfSwitches.setValue(key, false);
		this._stolenItems.remove(key);
	}
};

Game_Map.prototype.shops = function(mapId) {
	mapId = mapId.clamp(1, 999);
	if (!this._shopData[mapId]) {
		this._shopData[mapId] = [];
	}
	return this._shopData[mapId];
};


// --- GAME EVENT ---
const gameEv_setup = Game_Event.prototype.setupPageSettings;
Game_Event.prototype.setupPageSettings = function() {
	if (!this.page() || !this.isShop()) return gameEv_setup.call(this);
	gameEv_setup.call(this);
	const shop = this.shopData();
	const tagSET = /<COUNT:[ ]SET\s(ITEM||WEAPON||ARMOR)[ ](\d+)>/i;
	const tagRAND = /<COUNT:[ ]RANDOM\s(ITEM||WEAPON||ARMOR)[ ](\d+)-(\d+)>/i;
	const tagINF = /<COUNT:[ ]UNLIMITED>/i;
	const tBuyStolen = /<STOLENITEMS:[ ]ALLOW>/i;
	const tagFUNDS = /<SHOPGOLD:[ ](\d+)[ ](\d+)>/i;
	for (const ev of this.list()) {
		if ([108,408].contains(ev.code)) {
			let note = ev.parameters[0];
			if (note.match(tagSET)) {
				let type = String(RegExp.$1).toLowerCase();
				let value = Number(RegExp.$2);
				switch (type) {
					case 'item': shop._count[0] = value; break;
					case 'weapon': shop._count[1] = value; break;
					case 'armor': shop._count[2] = value; break;
				}
			} else if (note.match(tagRAND)) {
				let type = String(RegExp.$1).toLowerCase();
				let min = Number(RegExp.$2);
				let max = Number(RegExp.$3);
				switch (type) {
					case 'item': shop._count[0] = [min,max]; break;
					case 'weapon': shop._count[1] = [min,max]; break;
					case 'armor': shop._count[2] = [min,max]; break;
				}
			} else if (note.match(tagINF)) {
				shop.setItemCount(255, 255, 255);
			} else if (note.match(tBuyStolen) && stolenMerch == 'Varies') {
				shop._buysStolen = true;
			} else if (note.match(tagFUNDS) && shop._money === 0) {
				let startGold = Number(RegExp.$1);
				let startVariance = Number(RegExp.$2) || 0;
				shop.initShopVault(startGold, startVariance);
			}
		}
	}
	if (shop._money === 0) {
		// Was not setup - setup with default amount
		shop.initShopVault(shopFunds, variance);
	}
};

Game_Event.prototype.switchShops = function(id) {
	if (!this._shopId) this._shopId = 1;
	if (this._shopId === id || !this.isShop()) return;
	// First, store current data 
	const shop = this.shopData();
	const data = {
		items: shop._goods,
		prices: shop._costs,
		num: shop._stock,
		count: shop._count
	};
	this._shopData = this._shopData || {};
	this._shopData[this._shopId] = data;
	this._shopId = id;
	// check for existing data - switch over if present
	const sData = this._shopData[id];
	if (sData) {
		shop._goods = sData.items;
		shop._costs = sData.prices;
		shop._stock = sData.num;
		shop._count = sData.count;
	} else { // otherwise - reset
		shop.clear();
		shop.setItemCount();
	}
};

Game_Event.prototype.shopData = function() {
	const mapData = $gameMap.shops(this._mapId);
	if (!mapData[this._eventId]) {
		mapData[this._eventId] = this.createNewShop();
	}
	return mapData[this._eventId];
};

Game_Event.prototype.isShop = function() {
	for (const ev of this.list()) {
		if (ev.code == 302) return true;
	}
	return false;
};

Game_Event.prototype.createNewShop = function() {
	this._shopId = 1;
	this._shopData = {};
	const shop = new LordV_Shop();
	const supplyData = {
		min: minSupply,
		max: maxSupply,
		offset: offSupply,
		adj: adjSupply
	};
	shop.initSupply(supplyData);
	return shop;
};


// --- GAME INTERPRETER ---
Game_Interpreter.prototype.loaded = function(plugin) {
	switch (plugin.toLowerCase()) {
		case 'factions': return Imported['LvMZFactions'];
		case 'economy': return true;
	}
	return Imported[plugin];
};

Game_Interpreter.prototype.shop = function(type) {
	const shop = $gameMap.event(this._eventId).shopData();
	if (!type) return shop;
	switch (type) {
		case 'items': return shop._goods;
		case 'prices': return shop._costs;
		case 'num': return shop._stock;
	}
	return null;
};

Game_Interpreter.prototype.checkPurchased = function() {
	return !this.shop()._windowShopper;
};

// Can be used with Control Variables, to return an amount 
// of stolen goods from that area (good for theft detectors)
Game_Interpreter.prototype.logStolenItem = function() {
	const key = [this._mapId, this._eventId, stolenSelfSw];
	const data = $gameMap._stolenItems;
	if (!data.includes(key)) data.push(key);
	return data.filter(key => key[0] === this._mapId).length;
};

/******************************************************************************
	rmmv_scenes.js
******************************************************************************/

// --- SCENE SHOP ---
Scene_Shop.prototype.createHelpWindow = function() {
	const rect = this.helpWindowRect();
	rect.y -= this.calcWindowHeight(1, true);
	this._helpWindow = new Window_Help(rect);
    this.addWindow(this._helpWindow);
};

const sceneShop_prepare = Scene_Shop.prototype.prepare;
Scene_Shop.prototype.prepare = function(goods, purchaseOnly) {
	const shop = MapManager.event().shopData();
	goods = shop.checkStock(goods);
	sceneShop_prepare.call(this, goods, purchaseOnly);
};

const sceneShop_create = Scene_Shop.prototype.create;
Scene_Shop.prototype.create = function() {
	sceneShop_create.call(this);
	this.createShopGoldWindow();
};

// overwrite
Scene_Shop.prototype.goldWindowRect = function() {
	const ww = this.statusWidth();
	const wh = this.calcWindowHeight(1, true);
	const wx = Graphics.boxWidth - ww;
	const wy = Graphics.boxHeight - wh;
	return new Rectangle(wx, wy, ww, wh);
};

const sceneShop_commandRect = Scene_Shop.prototype.commandWindowRect;
Scene_Shop.prototype.commandWindowRect = function() {
	const rect = sceneShop_commandRect.call(this);
	rect.width = Graphics.boxWidth;
	if (Imported.VisuMZ_1_ItemsEquipsCore) {
		rect.width -= this.statusWidth();
	}
	return rect;
};

const sceneShop_dummyRect = Scene_Shop.prototype.dummyWindowRect;
Scene_Shop.prototype.dummyWindowRect = function() {
	const rect = sceneShop_dummyRect.call(this);
	rect.height -= this.calcWindowHeight(1, true);
	return rect;
};
	
// -- Compatibility: VisuMZ ItemsEquipsCore --
if (Imported.VisuMZ_1_ItemsEquipsCore) {
	const sceneShop_statusRect = Scene_Shop.prototype.statusWindowRect;
	Scene_Shop.prototype.statusWindowRect = function() {
		const rect = sceneShop_statusRect.call(this);
		rect.y -= this.calcWindowHeight(1, true);
		return rect;
	};
	
	const sceneShop_buyWindowRect = Scene_Shop.prototype.buyWindowRect;
	Scene_Shop.prototype.buyWindowRect = function() {
		const rect = sceneShop_buyWindowRect.call(this);
		rect.height -= this.calcWindowHeight(1, true);
		return rect;
	};
}

const sceneShop_sellRect = Scene_Shop.prototype.sellWindowRect;
Scene_Shop.prototype.sellWindowRect = function() {
	const rect = sceneShop_sellRect.call(this);
	rect.height -= this.calcWindowHeight(1, true);
	return rect;
};

const sceneShop_catCancel = Scene_Shop.prototype.onCategoryCancel;
Scene_Shop.prototype.onCategoryCancel = function() {
	sceneShop_catCancel.call(this);
	this._buyWindow.refresh();
};

// --
Scene_Shop.prototype.createShopGoldWindow = function() {
	const rect = this.shopGoldRect();
	this._shopGoldWindow = new Window_ShopGold(rect);
	this.addWindow(this._shopGoldWindow);
};

Scene_Shop.prototype.shopGoldRect = function() {
	const wx = 0;
	const wh = this.calcWindowHeight(1, true);
	const wy = Graphics.boxHeight - wh;
	const ww = Graphics.boxWidth - this.statusWidth();
	return new Rectangle(wx, wy, ww, wh);
};

// overwrite
Scene_Shop.prototype.buyingPrice = function() {
	const price = this._buyWindow.price(this._item);
	const index = this._buyWindow.index();
	return Math.floor(economicBuyPrice(price, index));
};

// overwrite
Scene_Shop.prototype.sellingPrice = function() {
	const price = this._item.price;
	const index = this._sellWindow.index();
	return Math.floor(economicSellPrice(price, index));
};

// overwrite
Scene_Shop.prototype.doBuy = function(number) {
	this.doBuy_gold(number);
	this.doBuy_item(number);
	this.doShopBuy(number);
};

// overwrite
Scene_Shop.prototype.doSell = function(number) {
	this.doSell_gold(number);
	this.doSell_item(number);
	this.doShopSell(number);
};

const sceneShop_maxBuy = Scene_Shop.prototype.maxBuy;
Scene_Shop.prototype.maxBuy = function() {
	const shop = MapManager.event().shopData();
	const max = sceneShop_maxBuy.call(this);
	const index = this._buyWindow.index();
	const num = shop._stock[index];
	return Math.min(max, num);
};

const sceneShop_maxSell = Scene_Shop.prototype.maxSell;
Scene_Shop.prototype.maxSell = function() {
	const shop = MapManager.event().shopData();
	const max = sceneShop_maxSell.call(this);
	const index = this._sellWindow.index();
	const price = economicSellPrice(this._item.price, index);
	const num = Math.floor(shop.gold() / price);
	return Math.min(max, num);
};

// --

Scene_Shop.prototype.doBuy_gold = function(number) {
	$gameParty.loseGold(number * this.buyingPrice());
};

Scene_Shop.prototype.doBuy_item = function(number) {
	$gameParty.gainItem(this._item, number);
};

// --

Scene_Shop.prototype.doSell_gold = function(number) {
	$gameParty.gainGold(number * this.sellingPrice());
};

Scene_Shop.prototype.doSell_item = function(number) {
	if (this._item.stolen) {
		return $gameParty.stealItem(this._item, -number);
	}
	$gameParty.loseItem(this._item, number);
};

// --

// To be overwritten by LvMZ_Currencies
Scene_Shop.prototype.doShopBuy = function(number) {
	const shop = MapManager.event().shopData();
	shop._windowShopper = false;
	if (shop._stock.includes(255)) return; // unlimited
	shop.addGold(number * this.buyingPrice());
	shop.loseGoods(this._item, number);
};

// To be overwritten by LvMZ_Currencies
Scene_Shop.prototype.doShopSell = function(number) {
	const shop = MapManager.event().shopData();
	shop._windowShopper = false;
	if (shop._stock.includes(255)) return; // unlimited
	shop.loseGold(number * this.sellingPrice());
	shop.addGoods(this._item, number);
};

/******************************************************************************
	rmmv_windows.js
******************************************************************************/

// --- WINDOW BASE ---
Window_Base.prototype.shop = function() {
	return MapManager.event().shopData();
};

// For use of Window_ShopBuy outside of the namespace
Window_Base.prototype.goldIcon = function() {
	return lvGoldIcon;
};

Window_Base.prototype.currencyWidth = function(value) {
	const unitWidth = this.textWidth(TextManager.currencyUnit);
	const width = lvGoldIcon > 0 ? ImageManager.iconWidth + 2 : unitWidth;
	return width + this.textWidth(value) + 4;
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

const winBase_drawItemName = Window_Base.prototype.drawItemName;
Window_Base.prototype.drawItemName = function(item, x, y, width) {
	if (!item || !item.stolen) {
		return winBase_drawItemName.call(this, item, x, y, width);
	}
	this.drawStolenItemName(item, x, y, width);
};

Window_Base.prototype.drawStolenItemName = function(item, x, y, width) {
	const iconY = y + (this.lineHeight() - ImageManager.iconHeight) / 2;
	const textMargin = ImageManager.iconWidth + 4;
	const itemWidth = Math.max(0, width - textMargin);
	this.drawIcon(item.iconIndex, x, iconY);
	this.processColorChange(2); // stolen item!
	this.drawText(item.name, x + textMargin, y, itemWidth);
	if (stolenIcon > 0) {
		const stolenX = x + textMargin + this.textWidth(item.name) + 6;
		this.drawIcon(stolenIcon, stolenX, iconY);
	}
	this.resetFontSettings();
};


// --- WINDOW SELECTABLE ---
const winSel_select = Window_Selectable.prototype.select;
Window_Selectable.prototype.select = function(index) {
	winSel_select.call(this, index);
	const scene = SceneManager._scene;
	if (scene.constructor === Scene_Shop) {
		const buy = scene._buyWindow ? scene._buyWindow.active : false;
		const sell = scene._sellWindow ? scene._sellWindow.active : false;
		const num = scene._numberWindow ? scene._numberWindow.active : false;
		if (num) {
			scene._goldWindow.numWindowRefresh();
			scene._shopGoldWindow.numWindowRefresh();
		} else if (buy || sell) {
			scene._goldWindow.refresh();
			scene._shopGoldWindow.refresh();
		}
	}
};


// --- WINDOW ITEM_LIST ---
// overwrite
Window_ItemList.prototype.makeItemList = function() {
	this._data = $gameParty.allItems()
		.concat($gameParty.allStolen())
		.filter(item => this.includes(item));
    if (this.includes(null)) {
        this._data.push(null);
    }
};


// --- WINDOW GOLD ---
// overwrite
Window_Gold.prototype.refresh = function() {
	const rect = this.itemLineRect(0);
	const unit = this.currencyUnit();
	this.contents.clear();
	this.resetTextColor();
	this.drawNewGoldValue(this.value(), unit, rect.x, rect.y, rect.width);
};

Window_Gold.prototype.numWindowRefresh = function() {
	const scene = SceneManager._scene;
	const sym = scene._commandWindow.currentSymbol();
	const numWindow = scene._numberWindow;
	const total = numWindow._price * numWindow.number();
	const unit = this.currencyUnit();
	const rect = this.itemLineRect(0);
	const x = rect.x;
	const y = rect.y;
	const w = rect.width;
	this.contents.clear();
	switch (sym) {
        case "buy": {
            let value = this.value() - total;
			this.processColorChange(10);
			this.drawNewGoldValue(value, unit, x, y, w);
		} break;
        case "sell": {
            let value = this.value() + total;
			this.processColorChange(24);
			this.drawNewGoldValue(value, unit, x, y, w);
		} break;
    }
	this.resetFontSettings();
};


// --- WINDOW SHOP_BUY ---
const wsb_refresh = Window_ShopBuy.prototype.refresh;
Window_ShopBuy.prototype.refresh = function() {
	wsb_refresh.call(this);
	// Auto-Close Shop (nothing left to sell)
	if (this._data.length === 0) {
		SceneManager.pop();
		if (shopCloseEv > 0) {
			$gameSystem.reserveCommentEvent(shopCloseEv);
		}
	}
};

// overwrite (use economicBuyPrice)
Window_ShopBuy.prototype.isEnabled = function(item) {
	if (!item || $gameParty.hasMaxItems(item)) return false;
	const price = economicBuyPrice(this.price(item), this.index());
	return Math.floor(price) <= this._money;
};

// overwrite
Window_ShopBuy.prototype.makeItemList = function() {
	this._data = this.shop()._goods;
	this._price = this.shop()._costs;
	this._stock = this.shop()._stock;
};

// overwrite - alias the sub-methods to make compatible
Window_ShopBuy.prototype.drawItem = function(index) {
	const item = this.itemAt(index);
	const rect = this.itemLineRect(index);
	this.changePaintOpacity(this.isEnabled(item));
	this.drawItemName(item, rect.x, rect.y, rect.width);
	this.drawShopBuyPrice(index, rect);
	this.drawItemCount(index, rect);
	this.changePaintOpacity(true);
	this.resetFontSettings();
};

Window_ShopBuy.prototype.drawShopBuyPrice = function(index, rect) {
	this.resetTextColor();
	this.contents.fontSize -= 2;
	const item = this.itemAt(index);
	const price = Math.floor(economicBuyPrice(this.price(item), index));
	const iw = ImageManager.iconWidth;
	const unit = TextManager.currencyUnit;
	const cx = lvGoldIcon > 0 ? iw : this.textWidth(unit);
	const x = rect.x;
	const y = rect.y;
	let w = rect.width;
	if (lvGoldIcon > 0) {
		this.drawIcon(lvGoldIcon, x + w - iw, y + 2);
	} else {
		this.processColorChange(16); // system color
		this.drawText(unit, x, y, w, 'right');
	}
	this.drawText(price, x, y, w - cx - 4, 'right');
	this.resetFontSettings();
};

Window_ShopBuy.prototype.drawItemCount = function(index, rect) {
	const item = this.itemAt(index);
	const iw = ImageManager.iconWidth;
	const sw = item.stolen ? iw + 6 : 0;
	const nameWidth = iw + this.textWidth(item.name) + 8 + sw;
	const nCount = this.itemCount(index);
	if (nCount === 255) return; // unlimited
	// - Removed (might use in future)
	//const mcl = Math.max(2, String(nCount).length);
	//const countName = "("+nCount.padZero(mcl)+")";
	const countName = "("+nCount.padZero(2)+")";
	const countWidth = Math.max(0, rect.width - nameWidth);
	const countX = rect.x + nameWidth;
	this.changePaintOpacity(false);
	this.setItemCountColor(nCount);
	this.drawText(countName, countX, rect.y, countWidth);
	this.changePaintOpacity(true);
	this.resetFontSettings();
};

Window_ShopBuy.prototype.itemCount = function(index) {
	return this._stock[index] || 0;
};

Window_ShopBuy.prototype.setItemCountColor = function(count) {
	const min = this.shop().sMin();
	const max = this.shop().sMax();
	const os  = this.shop().sOffset();
	if (count <= (min-os)) {
		this.processColorChange(10); // danger red
	} else if (count <= min) {
		this.processColorChange(14); // warning yellow
	} else if (count >= (max+os)) {
		this.processColorChange(24); // excess green
	}
};


// --- WINDOW SHOP_SELL ---
const wss_isEnabled = Window_ShopSell.prototype.isEnabled;
Window_ShopSell.prototype.isEnabled = function(item) {
	const ret = wss_isEnabled.call(this, item);
	if (ret) {
		if (!this.shop()._buysStolen && item.stolen) return false;
		const price = economicSellPrice(item.price, this.index());
		if (this.shop()._money < Math.floor(price)) return false;
	}
	return ret;
};


// --- WINDOW SHOP_NUMBER ---
const wsn_refresh = Window_ShopNumber.prototype.refresh;
Window_ShopNumber.prototype.refresh = function() {
	wsn_refresh.call(this);
	const scene = SceneManager._scene;
	scene._goldWindow.numWindowRefresh();
	scene._shopGoldWindow.numWindowRefresh();
};


// --- WINDOW SHOP_STATUS ---
const winShopStat_drawPoss = Window_ShopStatus.prototype.drawPossession;
Window_ShopStatus.prototype.drawPossession = function(x, y) {
    $gameParty._showAll = true;
	winShopStat_drawPoss.call(this, x, y);
};

})();


// --- CUSTOM WINDOWS ---
function Window_ShopGold() {
	this.initialize(...arguments);
}

Window_ShopGold.prototype = Object.create(Window_Selectable.prototype);
Window_ShopGold.prototype.constructor = Window_ShopGold;

Window_ShopGold.prototype.initialize = function(rect) {
	Window_Selectable.prototype.initialize.call(this, rect);
	this.refresh();
};

Window_ShopGold.prototype.colSpacing = function() {
	return 0;
};

Window_ShopGold.prototype.refresh = function() {
	const rect = this.itemLineRect(0);
	this.contents.clear();
	this.drawShopCurrency(this.value(), this.currencyUnit(), rect);
};

Window_ShopGold.prototype.drawShopCurrency = function(value, unit, rect) {
	this.resetTextColor();
	this.contents.fontSize -= 2;
	const x = rect.x;
	const y = rect.y;
	const width = rect.width;
	const lw = this.drawFancyIcon(x, y, width);
	this.drawText(value, x, y, width-2, 'right');
	this.processColorChange(16);
	this.drawText(unit, x + lw, y, width);
	this.resetFontSettings();
};

Window_ShopGold.prototype.drawFancyIcon = function(x, y, width) {
	const icon = this.goldIcon();
	let lw = this.textWidth("Shop: ");
	this.drawText("Shop:", x, y, width);
	if (icon > 0) {
		this.drawIcon(icon, x + lw, y + 2);
		lw += ImageManager.iconWidth;
		lw += 4;
	}
	return lw;
};

Window_ShopGold.prototype.value = function() {
	return this.shop()._money;
};

Window_ShopGold.prototype.currencyUnit = function() {
	return TextManager.currencyUnit;
};

Window_ShopGold.prototype.numWindowRefresh = function() {
	const scene = SceneManager._scene;
	const sym = scene._commandWindow.currentSymbol();
	const numWindow = scene._numberWindow;
	const total = numWindow._price * numWindow.number();
	const unit = this.currencyUnit();
	const rect = this.itemLineRect(0);
	const x = rect.x;
	const y = rect.y;
	const width = rect.width;
	this.contents.clear();
	this.contents.fontSize -= 2;
	let lw = this.drawFancyIcon(x, y, width);
	switch (sym) {
        case "buy": {
            let value = this.value() + total;
			this.processColorChange(24);
			this.drawText(value, x, y, width-2, 'right');
		} break;
        case "sell": {
            let value = this.value() - total;
			this.processColorChange(10);
			this.drawText(value, x, y, width-2, 'right');
		} break;
    }
	this.processColorChange(16);
	this.drawText(unit, x + lw, y, width);
	this.resetFontSettings();
};

// ============================================================================
// --- CUSTOM FUNCTIONS ---
function LordV_Shop() {
	this.initialize(...arguments);
}

LordV_Shop.prototype.initialize = function() {
	this.clear();
	this.setItemCount();
	this._money = 0;
	this._supplyMin = 1;
	this._supplyMax = 99;
	this._supplyOffset = 0;
	this._supplyAdjust = 0;
	this._buysStolen = false;
};

LordV_Shop.prototype.setItemCount = function(items=0, weapons=0, armors=0) {
	this._count = [items, weapons, armors];
};

LordV_Shop.prototype.initShopVault = function(shopFunds, variance) {
	const change = variance > 0 ? Math.randomInt(variance) + 1 : 0;
	this._money = shopFunds > 0 ? Math.randomInt(2) > 0 ? shopFunds + change : shopFunds - change : 0;
};

LordV_Shop.prototype.initSupply = function(data) {
	this._supplyMin = data.min;
	this._supplyMax = data.max;
	this._supplyOffset = data.offset;
	this._supplyAdjust = data.adj;
};
//--
LordV_Shop.prototype.checkStock = function(shopGoods) {
	this._windowShopper = true;
	if (this._goods.length === 0) {
		this.setupStock(shopGoods);
	}
	return this.goods();
};

LordV_Shop.prototype.setupStock = function(shopGoods) {
	this.clear();
	shopGoods = shopGoods.sortByColumn(0,1);
	for (const goods of shopGoods) {
		let item = this.goodsToItem(goods);
		const price = item ? goods[2] === 0 ? item.price : goods[3] : 0;
		const checkNum = goods[4] ? typeof goods[4] === 'number' : false;
		const count = checkNum ? goods[4] : this.itemCount(goods[0]);
		if (this.checkPrice(item) && count > 0) {
			this._goods.push(item);
			this._costs.push(price);
			this._stock.push(count);
		}
	}
	this.sortStock();
};

LordV_Shop.prototype.clear = function() {
	this._goods = []; // items
	this._costs = []; // prices
	this._stock = []; // amount
};

LordV_Shop.prototype.goodsToItem = function(goods) {
    switch (goods[0]) {
        case 0: return $dataItems[goods[1]];
        case 1: return $dataWeapons[goods[1]];
        case 2: return $dataArmors[goods[1]];
        default: return null;
    }
};

// {Array} = [0:Items, 1:Weapons, 2:Armors]
LordV_Shop.prototype.itemCount = function(index) {
	let n = this._count[index];
	if (Array.isArray(n)) {
		n = ~~(Math.random() * (n[1] - n[0] + 1) + n[0]);
	}
	return n;
};

LordV_Shop.prototype.sortStock = function() {
	for (let i = 0; i < this._goods.length; i++) {
		const item = this._goods[i];
		if (this.nextItemInStock(i) == item) {
			let total = this._stock[i] + this._stock[i+1];
			if (total > this.maxStock()) {
				let diff = this.maxStock() - this._stock[i];
				this._stock[i] += diff;
				this._stock[i+1] -= diff;
			} else {
				this._stock[i+1] = total;
				this.remove(i);
			}
		}
	}
};

LordV_Shop.prototype.nextItemInStock = function(index) {
	return this._goods[index + 1] || null;
};

LordV_Shop.prototype.maxStock = function() {
	return 99;
};

LordV_Shop.prototype.addGoods = function(item, amount) {
	item = itemProxy(item);
	if (Array.isArray(amount)) {
		const min = amount[0];
		const max = amount[1];
		amount = ~~(Math.random() * (max - min + 1) + min);
	}
	if (this.checkPrice(item) && amount > 0) {
		this._goods.push(item);
		this._costs.push(item.price);
		this._stock.push(amount);
		// export to goods, and re-setup shop
		const shopGoods = this.goods();
		this.setupStock(shopGoods);
	}
};

LordV_Shop.prototype.loseGoods = function(item, amount) {
	for (let i = this._goods.length - 1; i >= 0; i--) {
		if (this._goods[i] !== item) continue;
		if (this._stock[i] > amount) {this._stock[i] -= amount; break;}
		amount -= this._stock[i];
		this.remove(i);
	}
};

LordV_Shop.prototype.remove = function(index) {
	this._goods.splice(index, 1);
	this._costs.splice(index, 1);
	this._stock.splice(index, 1);
};

LordV_Shop.prototype.goods = function() {
	// [type,itemId,1,price,num]  <-- format to export
	let list = [];
	for (let i = 0; i < this._goods.length; i++) {
		let item = this._goods[i];
		let price = this._costs[i];
		let num = this._stock[i];
		let type = this.itemType(item);
		list.push([type,item.id,1,price,num]);
	}
	return list;
};

LordV_Shop.prototype.itemType = function(item) {
	if (!item) return -1;
	if (DataManager.isItem(item)) return 0;
	if (DataManager.isWeapon(item)) return 1;
	if (DataManager.isArmor(item)) return 2;
	return -1;
};

// Compatibility with LvMZ_Currencies.js
LordV_Shop.prototype.checkPrice = function(item) {
	if (!item) return false;
	if (Imported['LvMZCurrencies']) {
		const note = item.note;
		const tagID = /<ALTCURRENCY:\s(VAR||ITEM||WEAPON||ARMOR)\s(\d+)\s(BUY||SELL)\s(\d+)>/gi;
		const tagNAME = /<ALTCURRENCY:\s(ITEM||WEAPON||ARMOR)\s([^>]*)\s(BUY||SELL)\s(\d+)>/gi;
		if (note.match(tagID) || note.match(tagNAME) || item.clone) {
			return true; // regardless of price
		}
	}
	return item.price > 0;
};

// --

LordV_Shop.prototype.gold = function() {
	return this._money;
};

LordV_Shop.prototype.addGold = function(amount) {
	this._money = (this.gold() + amount).clamp(0, $gameParty.maxGold());
};

LordV_Shop.prototype.loseGold = function(amount) {
	this.addGold(-amount);
};

// --

LordV_Shop.prototype.sMin = function(set) {
	if (set !== undefined) {
		this._supplyMin = set;
	}
	return this._supplyMin;
};

LordV_Shop.prototype.sMax = function(set) {
	if (set !== undefined) {
		this._supplyMax = set;
	}
	return this._supplyMax;
};

LordV_Shop.prototype.sOffset = function(set) {
	if (set !== undefined) {
		this._supplyOffset = set;
	}
	return this._supplyOffset;
};

LordV_Shop.prototype.sAdjust = function(set) {
	if (set !== undefined) {
		this._supplyAdjust = set;
	}
	return this._supplyAdjust;
};

// -- Global Functions --

function economicBuyPrice(price, index) {
	price *= $gameSystem.markUp();		// Buy price
	const min = Math.floor(price / 2);	// Half buy price
	let adj = 0;						// Total price adjustment
	// Supply & Demand
	adj += supplyCheck(index);
	adj += $gameSystem.demandRate(index);
	// Factions, Races, Relations, and Titles
	//  * Positive numbers become discounts here!
	if (Imported['LvMZFactions']) {
		const ev = MapManager.event();
		const pc = $gameParty.leader();
		adj += ev.lvGet('priceAdjust',[pc,'faction']) * -1;
		adj += ev.lvGet('priceAdjust',[pc,'race']) * -1;
		adj += ev.lvGet('priceAdjust',[pc,'relation']) * -1;
		adj += ev.lvGet('priceAdjust',[pc,'title']) * -1;
		adj += ev.lvGet('priceAdjust',[pc,'gender']) * -1;
	}
	// Taxes
	adj += $gameSystem.taxRate();
	// Apply Adjustments
	price += (price * adj).percent();
	return Math.max(min, price);
};

function economicSellPrice(price, index) {
	price *= $gameSystem.markDown();    // Sell Price
	const max = (price * 2); 			// Double Sell Price
	let adj = 0;						// Total Price Adjustment
	// Supply & Demand
	adj += supplyCheck(index);
	adj += $gameSystem.demandRate(index);
	// Factions, Races, Relations, and Titles
	if (Imported['LvMZFactions']) {
		const ev = MapManager.event();
		const pc = $gameParty.leader();
		adj += ev.lvGet('priceAdjust',[pc,'faction']);
		adj += ev.lvGet('priceAdjust',[pc,'race']);
		adj += ev.lvGet('priceAdjust',[pc,'relation']);
		adj += ev.lvGet('priceAdjust',[pc,'title']);
		adj += ev.lvGet('priceAdjust',[pc,'gender']);
	}
	// Taxes
	adj -= $gameSystem.taxRate();
	// Apply Adjustments
	price += (price * adj).percent();
	return price.clamp(1, max);
};

function supplyCheck(index) {
	const shop = MapManager.event().shopData();
	const stock = shop._stock[index];
	const min = shop.sMin();
	const max = shop.sMax();
	const os  = shop.sOffset();
	const rate = shop.sAdjust();
	let adjust = 0;
	if (stock < min) {
		adjust = Math.floor((min - stock) / os) * rate;
	} else if (stock > max) {
		adjust = Math.floor((stock - max) / os) * rate;
		adjust *= -1;
	}
	return (adjust / 100).percent();
};

function itemGroup(type) {
	switch (type.toLowerCase()) {
		case 'item': return $dataItems;
		case 'weapon': return $dataWeapons;
		case 'armor': return $dataArmors;
	}
	return null;
};

function itemProxy(item) {
	if (!item) return null;
	if (!item.stolen) return item;
	return itemGroup(item.stolen)[item.id];
};
