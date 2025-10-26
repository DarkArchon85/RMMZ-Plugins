// ============================================================================
//  LordValinar Plugin - Economy System
//  LvMZ_Economy.js
// ============================================================================

var Imported = Imported || {};
if (!Imported['LvMZ_Core']) {
	throw new Error("LvMZ_Economy requires plugin 'LvMZ_Core'!");
}
Imported["LvMZ_Economy"] = true;

/*:
 * @target MZ
 * @plugindesc [v1.8] Gives life to the world and its merchants by varying up
 * their prices based on several factors (including relations and supply).
 * @author LordValinar
 * @url https://github.com/DarkArchon85/RMMZ-Plugins
 * @orderAfter VisuMZ_1_ItemsEquipsCore
 * @orderAfter LvMZ_Core
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
 *   merchant.. it'll still be there! At least until they're reset) This 
 *   includes having multiple types of shops on the same NPC (such as a 
 *   shady merchant with 'special' stock?)
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
 * So... what the heck does all of that mean? Basically you set a minimum 
 * and maximum value as your threshold. If the amount of items the merchant 
 * has exceeds (above or below) this threshold, then the prices of those 
 * items will change.
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
 *  - Multiple demand tags can be used for the same item to be 
 *    changed based on different regions (as of v1.4 update). You
 *    must list each demand on a new line, for example:
 *
 * > ITEM: "First Aid Kit"
 * <Demand: War>
 * <Demand: Healing>
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
 *    a shop or other menu. The item name is also changed to red 
 *    ( or color 2 from the Windowskin pallette ).
 * 
 * : Stolen Value Markdown
 *  - This is the percentage the item price drops down by if stolen.
 *
 * : Shops Buy Stolen Items
 *  - 3 modes here "Always", "Varies", and "Never":
 *   ALWAYS - Every shop will buy stolen goods. Plain and simple.
 *   VARIES - Only shops with <BuyStolenItems> comment tag to buy them.
 *   NEVER  - No shop will buy stolen items.
 *
 * : Stolen Self Switch
 *  - When you steal an item from an area, it's most likely an Event,
 *    in which case you should use Self Switches to make them "Disappear".
 *    When using either the plugin command or script call to return 
 *    stolen items, this is the Self Switch the plugin will look for 
 *    in addition to the mapId it was stolen from, and which eventId 
 *    was the actual item.
 *  - Stealing from NPCs, Self Switch can control dialogue or other 
 *    options when dealing with that NPC again.
 *
 *
 * >> STOLEN GOLD (NEW in 1.8) <<
 *
 * If you want to track stolen gold (or other coin with LvMZ_Currencies)
 * use the stealGold() or stealItem() functions. When this ITEM is picked 
 * up it will be added to a separate tracker (in case you are caught by 
 * the authorities and they need to remove only the stolen coin).
 *  - Use a Fence to "clean" your stolen money by using the necessary
 *    plugin command or script call
 *  - Script Call:  $gameParty.cleanGold();
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
 * [rmmz_objects.js]
 *  - Game_Party.prototype.gainGold
 * [rmmz_scenes.js]
 *  - Scene_Shop.prototype.goldWindowRect
 *  - Scene_Shop.prototype.buyingPrice
 *  - Scene_Shop.prototype.sellingPrice
 * [rmmz_windows.js]
 *  - Window_ItemList.prototype.makeItemList
 *  - Window_Gold.prototype.refresh
 *  - Window_ShopBuy.prototype.isEnabled
 *  - Window_ShopBuy.prototype.makeItemList
 *  - Window_ShopBuy.prototype.drawItem
 *
 * ----------------------------------------------------------------------------
 * Terms of Use
 * ----------------------------------------------------------------------------
 *
 * Free to use and modify for commercial and noncommercial games, with credit.
 * Do NOT remove my name from the Author of this plugin
 * Do NOT reupload this plugin (modified or otherwise) anywhere other than the 
 * RPG Maker Web main forums: https://forums.rpgmakerweb.com/index.php
 *
 * ----------------------------------------------------------------------------
 * Changelog
 * ----------------------------------------------------------------------------
 *
 * v1.8 - Added a separate tracker for stolen gold and a method to clean it 
 *
 * v1.7 - Updates to new LvMZ plugin formats + minor fixes with demo
 *
 * v1.6 - Fixed not accounting for an invalid item when reading for stolen
 *
 * v1.5 - Fixed "logStolenItem()": Method to check arrays didn't work so 
 *        I implimented a function that WILL work.
 *
 * v1.4 - Fixed demands to be case-insensitive (as originally instructed),
 *      - Item notetags now allow for multiple <Demand: name> tags to 
 *        be searched per region.
 *      - Added fixed price adjustments for demands (can stack with the 
 *        rate percentage and vice versa).
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
 * @default 90
 *
 * @param stolenMerch
 * @text Shops Buy Stolen Items
 * @type select
 * @option Always
 * @option Varies
 * @option Never
 * @desc Decide whether or not shops can buy stolen items, 
 * or if they must be independently set ON or OFF
 * @default Varies
 *
 * @param stolenSelfSw
 * @text Stolen Self Switch
 * @desc The Self Switch of each stolen item EVENT to reset
 * if the script or plugin is called: A  B  C  D
 * @default A
 *
 * @param stolenTagDesc
 * @text Tag Stolen Description
 * @type boolean
 * @on Tag Description
 * @off Leave Default
 * @desc Set to TRUE if you want (stolen) marked in an 
 * item, armor, or weapon description.
 * @default false
 *
 * @param paramBreak2
 * @text --------------------------
 * @default ----------------------------------
 *
 * @param setBuyPrice
 * @text Buy Price
 * @type number
 * @decimals 1
 * @desc The percentage(%) of an item, weapon, or armor price
 * listed in the Database when buying.
 * @default 100.0
 *
 * @param setSellPrice
 * @text Sell Price
 * @type number
 * @decimals 1
 * @desc The percentage(%) of an item, weapon, or armor price
 * listed in the Database when selling.
 * @default 50.0
 *
 * @param markUp
 * @text Price Markup
 * @desc Number or JS code to adjust buying price.
 * See "Help" section for examples.
 * @default 0
 *
 * @param markDown
 * @text Price Markdown
 * @desc Number or JS code to adjust selling price.
 * See "Help" section for examples.
 * @default 0
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
 * NOTE: Case-Sensitive!
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
 * @command setTaxRate
 * @text Set Tax Rate
 * @desc Determines the tax rate for this region.
 *
 * @arg name
 * @text Region Name
 * @desc Name of the region to change taxes for.
 * NOTE: Case-Sensitive and must exist in paramters!
 * @default
 *
 * @arg value
 * @text Change Amount
 * @type number
 * @decimals 0
 * @min 0
 * @max 100
 * @desc The amount to set the current tax rate (percentage)
 * @default 0
 *
 * @ --------------------------------------------------------------------------
 *
 * @command addDemand
 * @text Add Demand Category
 * @desc Sets a new demand to a region.
 *
 * @arg name
 * @text Demand Tag
 * @desc The name of the Demand to add. Remember that items
 * must be premade in the database to match this.
 * @default 
 *
 * @arg region
 * @text Region Name
 * @desc Name of the region to set a Demand for. 
 * No set region gets current region by default.
 * @default 
 *
 * @arg rate
 * @text Price Adjustment
 * @type number
 * @decimals 0
 * @min -100
 * @max 100
 * @desc The price adjustment (percentage) when this demand 
 * is higher or lower than 0. Can stack with adj(fixed).
 * @default 0
 * 
 * @arg adj
 * @text Price Adjustment
 * @type number
 * @decimals 0
 * @min -999999
 * @max 999999
 * @desc The price adjustment (fixed rate) when this demand 
 * is higher or lower than 0. Can stack with rate (%).
 * @default 0
 *
 * @ --------------------------------------------------------------------------
 *
 * @command removeDemand
 * @text Remove Demand Category
 * @desc Removes a demand from the region
 *
 * @arg name
 * @text Demand Tag
 * @desc The name of the Demand tag to remove.
 * @default 
 *
 * @region
 * @text Region Name
 * @desc Name of the region to remove the Demand from.
 * @default 
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
 * @command stealGold
 * @text Steal Gold
 * @desc Add a certain amount of stolen gold to the party
 * 
 * @arg value
 * @text Gold Amount
 * @type number
 * @decimals 0
 * @min 1
 * @desc How much stolen gold is being added to the party?
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
 * 
 * @ --------------------------------------------------------------------------
 *
 * @command shopItem
 * @text Add Shop Item
 * @desc Add an item to the shop
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
 * @arg type
 * @text Item Type
 * @type select
 * @option Item
 * @option Weapon
 * @option Armor
 * @desc Item type to retrieve from the database.
 * @default Item
 *
 * @arg id
 * @text Item Database ID
 * @type number
 * @decimals 0
 * @min 1
 * @max 2000
 * @desc The database ID for the item, weapon, or armor.
 * @default 1
 *
 * @arg num
 * @text Item Amount
 * @type number
 * @decimals 0
 * @min 1
 * @desc How many of Items to create?
 * @default 1
 * 
 * @ --------------------------------------------------------------------------
 *
 * @command resetShop
 * @text Reset Shop
 * @desc Refreshes vendor money and stock
 *
 * @arg mapId
 * @text Map ID
 * @desc Which map ID is the shop on to reset?
 * You can use "this" or numerical value 1-999
 * @default this
 *
 * @arg eventId
 * @text Event ID
 * @desc ID of event (shop) to reset.
 * You can use "this" or numerical value 1-999
 * @default this
 *
 * @ --------------------------------------------------------------------------
 *
 * @command cleanGold
 * @text Clean Stolen Money
 * @desc Turns all stolen coin into legitimate currency
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
 * is higher or lower than 0. Can stack with adj(fixed).
 * @default 0
 *
 * @param adj
 * @text Price Adjustment
 * @type number
 * @decimals 0
 * @min -999999
 * @max 999999
 * @desc The price adjustment (fixed rate) when this demand 
 * is higher or lower than 0. Can stack with rate (%).
 * @default 0
 */
// ============================================================================

var LvMZ = LvMZ || {};
LvMZ.Economy = {
	name: "Economy",
	desc: "Adds shop gold and other enhancements!",
	version: 1.8
};

(() => {
"use strict";

const pluginName   = "LvMZ_Economy";
const params       = new LvParams(pluginName);
const lvGoldIcon   = params.value('goldIcon','num');
// - Stolen Items Settings -
const stolenIcon   = params.value('stolenIcon','num');
const stolenValue  = params.value('stolenValue','%');
const stolenMerch  = params.value('stolenMerch');
const stolenSelfSw = params.value('stolenSelfSw','strU');
const stolenDesc   = params.value('stolenTagDesc','bool');
// - Direct Shop Manipulation -
const defaultBuy   = params.value('setBuyPrice','%');
const defaultSell  = params.value('setSellPrice','%');
const markUp 	   = params.value('markUp');
const markDown     = params.value('markDown');
const shopFunds    = params.value('ShopFunds','num');
const variance     = params.value('ShopVariance','num');
// - Supply & Demand -
const SnD          = params.value('supplyDemand','obj');
const minSupply    = Number(SnD.supplyMin);
const maxSupply    = Number(SnD.supplyMax);
const offSupply    = Number(SnD.supplyOffset);
const adjSupply    = Number(SnD.supplyRate);
// - Other Generic Settings -
const shopCloseEv  = params.value('shopCloseEv','num');

// Actor-Based Inventories Compatability
const invName = "LvMZ_Inventories";
const params2 = Imported[invName] ? new LvParams(invName) : null;
const ExcessStacks = params2 ? params2.value('stacks','bool') : false;
const ExcessMax = 2147483647; //32-bit max integer

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

PluginManager.registerCommand(pluginName, 'setTaxRate', args => {
	$gameSystem.setTaxRate(args.name, Number(args.value));
});

PluginManager.registerCommand(pluginName, 'addDemand', args => {
	const rate = Number(args.rate);
	const adj = Number(args.adj);
	$gameSystem.addDemand(args.name, rate, adj, args.region);
});

PluginManager.registerCommand(pluginName, 'removeDemand', args => {
	$gameSystem.removeDemand(args.name, args.region);
});

PluginManager.registerCommand(pluginName, 'stealItem', args => {
	const item = itemGroup(args.type, Number(args.itemId));
	const amount = Number(args.value);
	$gameParty.stealItem(item, amount);
});

PluginManager.registerCommand(pluginName, 'stealGold', args => {
	$gameParty.stealGold(Number(args.value));
});

PluginManager.registerCommand(pluginName, 'resetStolen', () => {
	$gameMap.recoverStolenItems();
});

PluginManager.registerCommand(pluginName, 'changeShop', args => {
	const id = Number(args.shopId);
	const ev = MapManager.event();
	if (ev) ev.switchShops(id);
});

PluginManager.registerCommand(pluginName, 'shopGold', args => {
	const mapId = Number(args.mapId);
	const eventId = Number(args.eventId);
	const value = Number(args.value);
	const mapData = $gameMap._shopData[mapId];
	const shop = mapData ? mapData[eventId] : null;
	if (shop) shop.addGold(value);
});

PluginManager.registerCommand(pluginName, 'shopItem', args => {
	const mapId = Number(args.mapId);
	const eventId = Number(args.eventId);
	const mapData = $gameMap._shopData[mapId];
	const shop = mapData ? mapData[eventId] : null;
	if (shop) {
		const item = itemGroup(args.type, Number(args.id));
		const amount = Number(args.num);
		shop.addGoods(item, amount);
	}
});

PluginManager.registerCommand(pluginName, 'resetShop', args => {
	const mapId = args.mapId !== "this" 
		? Number(args.mapId).clamp(1,999)
		: $gameMap.mapId();
	const eventId = args.eventId !== "this" 
		? Number(args.eventId).clamp(1,999)
		: $gameMap._interpreter.eventId();
	const mapData = $gameMap._shopData[mapId];
	const shop = mapData ? mapData[eventId] : null;
	if (shop) shop.refresh();
});

PluginManager.registerCommand(pluginName, 'cleanGold', () => {
	$gameParty.cleanGold();
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
	this._region = "";
	this._regionData = [];
	const regionList = JSON.parse(SnD.regions).map(e => JSON.parse(e));
	regionList.forEach(r => {
		let cat = JSON.parse(r.categories).map(e => JSON.parse(e));
		this.addRegion(r.name, r.rate, cat);
	});
};

Game_System.prototype.addRegion = function(region, rate, categories) {
	this._regionData.push({
		name: region,
		taxRate: Number(rate),
		demands: this.initDemands(categories)
	});
};

Game_System.prototype.initDemands = function(categories) {
	return categories.reduce((r,c) => {
		r.push({
			name: c.name.toLowerCase(),
			rate: c.rate ? Number(c.rate) : 0,
			adj: c.adj ? Number(c.adj) : 0
		});
		return r;
	},[]);
};

Game_System.prototype.removeRegion = function(region) {
	if (region === undefined) region = this._region;
	if (this.validRegion(region)) {
		const index = this._regionData.indexByKey("name", region);
		this._regionData.splice(index, 1);
		// Clear if current region
		if (this._region === region) this._region = "";
	}
};

Game_System.prototype.changeRegion = function(region) {
	if (this.validRegion(region)) this._region = region;
};

Game_System.prototype.taxRate = function(region) {
	if (region === undefined) region = this._region;
	if (this.validRegion(region)) {
		const index = this._regionData.indexByKey("name", region);
		return (this._regionData[index].taxRate / 100).percent();
	}
	return 0;
};

Game_System.prototype.setTaxRate = function(region, amount) {
	if (region === undefined) region = this._region;
	if (this.validRegion(region)) {
		const index = this._regionData.indexByKey("name", region);
		this._regionData[index].taxRate = amount.clamp(0,100);
	}
};

Game_System.prototype.demand = function(index) {
	const event = MapManager.event();
	const shop = event ? event.shopData() : null;
	const item = shop ? shop._goods[index] : null;
	if (!item || !this.validRegion(this._region)) return [0,0];
	if (Lv.checkTag(item, /<DEMAND[: ]+([^>]+)>/i)) {
		let name = RegExp.$1.toLowerCase();
		let index = this._regionData.indexByKey("name", this._region);
		const list = this._regionData[index].demands;
		if (list.map(e => e.name).includes(name)) {
			index = list.indexByKey('name', name);
			const rate = (list[index].rate / 100).percent();
			const adj = list[index].adj;
			return [rate, adj];
		}
	}
	return [0,0];
};

Game_System.prototype.addDemand = function(name, rate, adj, region) {
	if (region === undefined) region = this._region;
	if (!this.validRegion(region)) return;
	let index = this._regionData.indexByKey("name", region);
	const list = this._regionData[index].demands;
	index = list.length;
	list[index] = {};
	list[index].name = name;
	list[index].rate = Number(rate).clamp(-100, 100);
	list[index].adj = Number(adj).clamp(-999999, 999999);
};

Game_System.prototype.removeDemand = function(name, region) {
	if (region === undefined) region = this._region;
	if (!this.validRegion(region)) return;
	let index = this._regionData.indexByKey("name", region);
	const list = this._regionData[index].demands;
	if (list.map(e => e.name).includes(name)) {
		index = list.indexByKey('name', name);
		list.splice(index, 1);
	}
};

Game_System.prototype.validRegion = function(region) {
	return this._regionData.map(e => e.name).includes(region);
};

Game_System.prototype.markUp = function() {
	const value = params.eval(markUp);
	return defaultBuy + (value / 100).percent();
};

Game_System.prototype.markDown = function() {
	const value = params.eval(markDown);
	return defaultSell - (value / 100).percent();
};


// --- GAME PARTY ---
const gameParty_init = Game_Party.prototype.initialize;
Game_Party.prototype.initialize = function() {
	gameParty_init.call(this);
	this.initStolenGoods();
	this._contraband = {};
};

const gameParty_gold = Game_Party.prototype.gold;
Game_Party.prototype.gold = function() {
	const value = gameParty_gold.call(this);
	return value + this._stolenGold;
};

const gameParty_gainItem = Game_Party.prototype.gainItem;
Game_Party.prototype.gainItem = function(item, amount, includeEquip) {
	if (item && item.stolenType) {
		this.stealItem(item, amount, includeEquip);
	} else {
		gameParty_gainItem.call(this, item, amount, includeEquip);
	}
};

// Overwrite - Filters between normal and stolen gold to 
//  get the correct amounts, including removing all gold 
//  and any leftovers to remove from the stolen pile.
// * Place any plugins that alias gainGold() after this one!
Game_Party.prototype.gainGold = function(amount) {
	// Filter amount if it goes over cap (with stolen gold)
	if (amount > 0) {
		const limit = this.maxGold() - (this._gold + this._stolenGold);
		if (amount > limit) amount = limit;
	} 
	// If losing gold, account for stolen gold too if over limit
	const diff = amount < 0 && Math.abs(amount) > this._gold
		? (Math.abs(amount) - this._gold).clamp(0, this.maxGold())
		: 0;
	if (diff > 0) {
		this._gold = 0;
		this.stealGold(-diff);
	} else {
		// Original method
		this._gold = (this._gold + amount).clamp(0, this.maxGold());
	}
};

Game_Party.prototype.initStolenGoods = function() {
	this._stolenGold = 0;
	this._stolenItems = {};
	this._stolenWeapons = {};
	this._stolenArmors = {};
};

Game_Party.prototype.stolenItems = function() {
	return Object.keys(this._stolenItems).reduce((r,id) => {
		const item = JSON.parse(JSON.stringify($dataItems[id]));
		item.price -= item.price * stolenValue;
		item.stolenType = 'item';
		if (stolenDesc) {
			item.description = '(stolen)'+item.description;
		}
		if (ExcessStacks) {
			const max = this.maxItems();
			let n = this._stolenItems[id];
			while (n >= max) {
				n -= max;
				r.push(item);
			}
			if (n > 0) r.push(item);
		} else {
			r.push(item);
		}
		return r;
	},[]);
};

Game_Party.prototype.stolenWeapons = function() {
	return Object.keys(this._stolenWeapons).reduce((r,id) => {
		const item = JSON.parse(JSON.stringify($dataWeapons[id]));
		item.price -= item.price * stolenValue;
		item.stolenType = 'weapon';
		if (stolenDesc) {
			item.description = '(stolen)'+item.description;
		}
		if (ExcessStacks) {
			const max = this.maxItems();
			let n = this._stolenWeapons[id];
			while (n >= max) {
				n -= max;
				r.push(item);
			}
			if (n > 0) r.push(item);
		} else {
			r.push(item);
		}
		return r;
	},[]);
};

Game_Party.prototype.stolenArmors = function() {
	return Object.keys(this._stolenArmors).reduce((r,id) => {
		const item = JSON.parse(JSON.stringify($dataArmors[id]));
		item.price -= item.price * stolenValue;
		item.stolenType = 'armor';
		if (stolenDesc) {
			item.description = '(stolen)'+item.description;
		}
		if (ExcessStacks) {
			const max = this.maxItems();
			let n = this._stolenArmors[id];
			while (n >= max) {
				n -= max;
				r.push(item);
			}
			if (n > 0) r.push(item);
		} else {
			r.push(item);
		}
		return r;
	},[]);
};

Game_Party.prototype.stolenEquips = function() {
	return this.stolenWeapons().concat(this.stolenArmors());
};

Game_Party.prototype.allStolen = function() {
	return this.stolenItems().concat(this.stolenEquips());
};

Game_Party.prototype.stealGold = function(amount) {
	const max = this.maxGold() - this._gold; // remaining cap
	this._stolenGold = (this._stolenGold + amount).clamp(0, max);
};

Game_Party.prototype.stealItem = function(item, amount, includeEquip) {
	const container = this.stolenGoods(item);
	if (container) {
		const max = ExcessStacks ? ExcessMax : this.maxItems();
		const newValue = this.numStolenGoods(item) + amount;
		container[item.id] = newValue.clamp(0, max);
		if (container[item.id] === 0) {
			delete container[item.id];
		}
		if (includeEquip && newValue < 0) {
			$gameParty.discardMembersEquip(item, -newValue);
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
	if (!item) return 0;
	const num = gameParty_numItems.call(this, item);
	const stolen = this.numStolenGoods(item);
	if (this._showAll) {
		this._showAll = false;
		return num + stolen;
	}
	return item.stolenType ? stolen : num;
};

// This will temporarily remove the party's inventory and 
// equipment and store it in a separate array to be retrieved
// later ($gameParty.retrieveGear())
// * recover{boolean}: Can reset stolen item events in the world
Game_Party.prototype.storeGear = function(mapId, eventId, recover = false) {
	// - First we Unequip the party's equipment -
	for (const actor of this.battleMembers()) {
		actor.clearEquipments();
	}
	// - Then we store the legit equipment -
	if (this.gearStored()) {
		// store items, weapons, and armors
		mergeData(this._storage[0], this._items);
		mergeData(this._storage[1], this._weapons);
		mergeData(this._storage[2], this._armors);
		// store gold
		const max = this.maxGold();
		this._storage[3] = (this._storage[3] + this._gold).clamp(0, max);
	} else {
		this._storage = [this._items, this._weapons, this._armors, this._gold];
	}
	// - Dealing with the stolen items (return or storage)
	if (recover) {
		$gameMap.recoverStolenItems();
	} else {
		const cache = this.contraband(mapId, eventId);
		cache.mergeItems(this._stolenItems);
		cache.mergeWeapons(this._stolenWeapons);
		cache.mergeArmors(this._stolenArmors);
		cache.addGold(this._stolenGold);
	}
	// - Finally, we Clear (re-initialize) -
	this._gold = 0;
	this.initAllItems();
	this.initStolenGoods();
};

// NOTE: use Game_Interpreter.prototype.retrieveCache for contraband cache
Game_Party.prototype.retrieveGear = function() {
	// If nothing to retrieve - exit
	if (!this.gearStored()) return;
	// Otherwise merge each category
	mergeData(this._items, this._storage[0]);
	mergeData(this._weapons, this._storage[1]);
	mergeData(this._armors, this._storage[2]);
	this.gainGold(this._storage[3]);
	// Then of course, CLEAR the storage
	this._storage = [];
};

// Use in conditional branches
Game_Party.prototype.gearStored = function() {
	if (!this._storage) return false;
	return this._storage.length > 0;
};

Game_Party.prototype.contraband = function(mapId, eventId) {
	const cache = this._contraband[mapId] ??= {};
	return cache[eventId] ??= new Game_Contraband();
};

// Clean out stolen coin
Game_Party.prototype.cleanGold = function() {
	const amount = this._stolenGold;
	this._stolenGold = 0;
	this.gainGold(amount);
};


// --- GAME MAP ---
const gameMap_init = Game_Map.prototype.initialize;
Game_Map.prototype.initialize = function() {
	gameMap_init.call(this);
	this._stolenItems = [];
	this._shopData = {};
};

Game_Map.prototype.shopData = function(mapId) {
	return mapId > 0 ? this._shopData[mapId] ??= {} : null;
};

Game_Map.prototype.recoverStolenItems = function() {
	for (const key of this._stolenItems) {
		$gameSelfSwitches.setValue(key, false);
	}
	this._stolenItems = [];
};


// --- GAME EVENT ---
const gameEv_initMembers = Game_Event.prototype.initMembers;
Game_Event.prototype.initMembers = function() {
	gameEv_initMembers.call(this);
	this._isShop = false;
	this._shopId = 0;
};

const gameEv_clear = Game_Event.prototype.clearPageSettings;
Game_Event.prototype.clearPageSettings = function() {
	gameEv_clear.call(this);
	this._isShop = false;
	this._shopId = 0;
};

const gameEv_setup = Game_Event.prototype.setupPageSettings;
Game_Event.prototype.setupPageSettings = function() {
	gameEv_setup.call(this);
	this._isShop = false;
	for (const command of this.list()) {
		if (command.code == 302) {
			this._isShop = true;
			break;
		}
	}
	this.initShopSettings();
};

Game_Event.prototype.initShopSettings = function() {
	if (!this.page() || !this.isShop()) return;	
	const shop = this.shopData();
	// Manual call required (Game_Interpreter.prototype.resetShop)
	if (shop.needsRefresh()) return;
	// First Time Setup (or refreshed)
	const tagSET = /<COUNT[: ]+SET\s(ITEM||WEAPON||ARMOR)[ ](\d+)>/i;
	const tagRAND = /<COUNT[: ]+RANDOM\s(ITEM||WEAPON||ARMOR)[ ](\d+)-(\d+)>/i;
	const tagINF = /<COUNT[: ]+UNLIMITED>/i;
	const tBuyStolen = /<BUYSTOLENITEMS>/i;
	const tagFUNDS = /<SHOPGOLD[: ]+(\d+)[ ](\d+)>/i;
	for (const command of this.list()) {
		if (![108,408].contains(command.code)) continue;
		let note = command.parameters[0];
		if (note.match(tagSET)) {
			let type = RegExp.$1;
			let value = Number(RegExp.$2);
			switch (type.toLowerCase()) {
				case 'item': shop._count[0] = value; break;
				case 'weapon': shop._count[1] = value; break;
				case 'armor': shop._count[2] = value; break;
			}
		} else if (note.match(tagRAND)) {
			let type = RegExp.$1;
			let min = Number(RegExp.$2);
			let max = Number(RegExp.$3);
			switch (type.toLowerCase()) {
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
			let startVariance = Number(RegExp.$2);
			shop.initShopVault(startGold, startVariance);
		}
	}
	if (shop._money === 0) {
		// Was not setup in comments - setup with default amount
		shop.initShopVault(shopFunds, variance);		
	}
	// Finish initialization (manual refresh call required from here on)
	shop._needsRefresh = true;
};

Game_Event.prototype.isShop = function() {
	return this._isShop;
};

Game_Event.prototype.shopData = function() {
	const mapData = $gameMap.shopData(this._mapId);
	return mapData[this._eventId] ??= this.createNewShop();
};

Game_Event.prototype.createNewShop = function() {
	this._shopId = 1;
	this._shopData = {};
	const data = {
		merch: stolenMerch,
		supply: {
			min: minSupply,
			max: maxSupply,
			off: offSupply,
			adj: adjSupply
		}
	};
	return new LvMZ_Shop(data);
};
	
Game_Event.prototype.switchShops = function(id) {
	if (!this.isShop() || this._shopId === id) return;	
	// First, store current data 
	const shop = this.shopData();
	this._shopData[this._shopId] = {
		items:  shop._goods,
		prices: shop._costs,
		num:    shop._stock,
		count:  shop._count,
		gold:   shop._money
	};
	this._shopId = id;
	// check for existing data - switch over if present
	const sData = this._shopData[id];
	if (sData) {
		shop._goods = sData.items;
		shop._costs = sData.prices;
		shop._stock = sData.num;
		shop._count = sData.count;
		shop._money = sData.gold;
	} else { // otherwise - reset
		shop.refresh();
	}
};


// --- GAME INTERPRETER ---
Game_Interpreter.prototype.shop = function(type) {
	const event = $gameMap.event(this._eventId);
	if (event.isShop()) {
		const shop = event.shopData();
		switch (type) {
			case 'items':  return shop._goods;
			case 'prices': return shop._costs;
			case 'num':    return shop._stock;
			case 'count':  return shop._count;
			case 'gold':   return shop._money;
			default:       return shop;
		}
	}
	return null;
};

Game_Interpreter.prototype.checkPurchased = function() {
	const shop = this.shop();
	return shop ? !shop._windowShopper : false;
};

Game_Interpreter.prototype.resetShop = function() {
	const shop = this.shop();
	if (shop) shop.refresh();
};

// Can be used with Control Variables, to return an amount 
// of stolen goods from that area (good for theft detectors)
// :Control Variables[variableId]
//  > set = script: this.logStolenItem()
Game_Interpreter.prototype.logStolenItem = function() {
	const key = [this._mapId, this._eventId, stolenSelfSw];
	const data = $gameMap._stolenItems;
	if (!data.hasStolenItem(key)) data.push(key);
	return data.filter(key => key[0] === this._mapId).length;
};

Array.prototype.hasStolenItem = function(search) {
	for (const array of this) {
		if (array.equals(search)) return true;
	}
	return false;
};

Object.defineProperty(Array.prototype, "hasStolenItem", {
    enumerable: false
});

// When the party steals their stolen stuff back..
Game_Interpreter.prototype.retrieveCache = function() {
	const cache = $gameParty.contraband(this._mapId, this._eventId);
	if (cache.count("item") > 0) {
		mergeData($gameParty._stolenItems, cache._items);
	}
	if (cache.count("weapon") > 0) {
		mergeData($gameParty._stolenWeapons, cache._weapons);
	}
	if (cache.count("armor") > 0) {
		mergeData($gameParty._stolenArmors, cache._armors);
	}
	if (cache.count("gold") > 0) {
		$gameParty.stealGold(cache._gold);
	}
	// - Now clear it
	delete $gameParty._contraband[this._mapId][this._eventId];
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
	if (shop) goods = shop.checkStock(goods);
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
	if (Imported["VisuMZ_1_ItemsEquipsCore"]) {
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
if (Imported["VisuMZ_1_ItemsEquipsCore"]) {
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

const sceneShop_doBuy = Scene_Shop.prototype.doBuy;
Scene_Shop.prototype.doBuy = function(number) {
	sceneShop_doBuy.call(this, number);
	this.doShopBuy(number);
};

const sceneShop_doSell = Scene_Shop.prototype.doSell;
Scene_Shop.prototype.doSell = function(number) {
	sceneShop_doSell.call(this, number);
	this.doShopSell(number);
};

const sceneShop_maxBuy = Scene_Shop.prototype.maxBuy;
Scene_Shop.prototype.maxBuy = function() {
	const max = sceneShop_maxBuy.call(this);
	const shop = MapManager.event().shopData();
	const index = this._buyWindow.index();
	const num = shop._stock[index];
	return Math.min(max, num);
};

const sceneShop_maxSell = Scene_Shop.prototype.maxSell;
Scene_Shop.prototype.maxSell = function() {
	const max = sceneShop_maxSell.call(this);
	const shop = MapManager.event().shopData();
	const index = this._sellWindow.index();
	const price = economicSellPrice(this._item.price, index);
	const num = Math.floor(shop.gold() / price);
	return Math.min(max, num);
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
	if (!item || !item.stolenType) {
		return winBase_drawItemName.call(this, item, x, y, width);
	}
	this.drawStolenItemName(item, x, y, width);
};

Window_Base.prototype.drawStolenItemName = function(item, x, y, width) {
	const iconY = y + (this.lineHeight() - ImageManager.iconHeight) / 2;
	const textMargin = ImageManager.iconWidth + 4;
	const itemWidth = Math.max(0, width - textMargin);
	const icon = stolenIcon > 0 ? stolenIcon : item.iconIndex;
	this.drawIcon(icon, x, iconY);
	this.processColorChange(2); // stolen item!
	this.drawText(item.name, x + textMargin, y, itemWidth); /*
	if (stolenIcon > 0) {
		const stolenX = x + textMargin + this.textWidth(item.name) + 6;
		this.drawIcon(stolenIcon, stolenX, iconY);
	}*/
	this.resetFontSettings();
};


// --- WINDOW SELECTABLE ---
const winSel_select = Window_Selectable.prototype.select;
Window_Selectable.prototype.select = function(index) {
	winSel_select.call(this, index);
	this.processActiveRefresh();
};

Window_Selectable.prototype.processActiveRefresh = function() {
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
    if (this.includes(null)) this._data.push(null); 
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
	let value = this.value();
	switch (sym) {
        case "buy": {
			this.processColorChange(10);
			this.drawNewGoldValue(value - total, unit, x, y, w);
		} break;
        case "sell": {
			this.processColorChange(24);
			this.drawNewGoldValue(value + total, unit, x, y, w);
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
		if (shopCloseEv > 0) {
			$gameTemp.reserveCommonEvent(shopCloseEv);
		}
		SceneManager.pop();
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
	const shop = this.shop();
	this._data = shop._goods;
	this._price = shop._costs;
	this._stock = shop._stock;
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
	const nCount = this.itemCount(index);
	if (nCount === 255) return; // unlimited
	const item = this.itemAt(index);
	const iw = ImageManager.iconWidth;
	/* Temporarily removed (testing options)
	const sw = item.stolenType ? iw + 6 : 0;
	*/
	const nameWidth = iw + this.textWidth(item.name) + 8; // + sw;
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
	const shop = this.shop();
	const min = shop.sMin();
	const max = shop.sMax();
	const os  = shop.sOffset();
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
	const price = economicSellPrice(item.price, this.index());
	const shop = this.shop();
	if (!shop._buysStolen && item.stolenType) return false;
	if (shop._money < Math.floor(price)) return false;
	return wss_isEnabled.call(this, item);
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


// ============================================================================
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
		lw += ImageManager.iconWidth + 4;
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
	let value = this.value();
	switch (sym) {
        case "buy":
			this.processColorChange(24);
			this.drawText(value + total, x, y, width-2, 'right');
			break;
        case "sell":
			this.processColorChange(10);
			this.drawText(value - total, x, y, width-2, 'right');
			break;
    }
	this.processColorChange(16);
	this.drawText(unit, x + lw, y, width);
	this.resetFontSettings();
};


// ============================================================================
// --- CUSTOM FUNCTIONS ---
function LvMZ_Shop() {
	this.initialize(...arguments);
}

LvMZ_Shop.prototype.initialize = function(data) {
	this.clear();
	this.setItemCount();
	this.initBuysStolen(data ? data.merch : null);
	this.initSupply(data ? data.supply : null);
	this._money = 0;
	this._needsRefresh = false;
};

LvMZ_Shop.prototype.clear = function() {
	this._goods = []; // items
	this._costs = []; // prices
	this._stock = []; // amount
};

LvMZ_Shop.prototype.setItemCount = function(items=0, weapons=0, armors=0) {
	this._count = [items, weapons, armors];
};

LvMZ_Shop.prototype.initBuysStolen = function(stolenMerch) {
	if (!stolenMerch) {
		// loads from plugin parameters
		const params = new LvParams("LvMZ_Economy");
		stolenMerch = params.value('stolenMerch');
	}
	this._buysStolen = stolenMerch.toLowerCase() === "always";
};

LvMZ_Shop.prototype.initSupply = function(data) {
	if (!data) {
		// loads from plugin parameters
		const params = new LvParams("LvMZ_Economy");
		const SnD = params.value('supplyDemand','obj');
		this._supplyMin = Number(SnD.supplyMin);
		this._supplyMax = Number(SnD.supplyMax);
		this._supplyOffset = Number(SnD.supplyOffset);
		this._supplyAdjust = Number(SnD.supplyRate);
	} else {
		this._supplyMin = data.min;
		this._supplyMax = data.max;
		this._supplyOffset = data.off;
		this._supplyAdjust = data.adj;
	}
};

LvMZ_Shop.prototype.initShopVault = function(shopFunds=0, variance=0) {
	const change = variance > 0 ? Math.randomInt(variance) + 1 : 0;
	const value = Math.randomInt(2) > 0 ? shopFunds + change : shopFunds - change;
	this._money = value.clamp(0, this.maxGold());
};

LvMZ_Shop.prototype.needsRefresh = function() {
	return !!this._needsRefresh;
};

LvMZ_Shop.prototype.refresh = function() {
	this.clear();
	this.setItemCount();
	this._money = 0;
	this._needsRefresh = false;
	$gameMap.requestRefresh();
};

//--

LvMZ_Shop.prototype.checkStock = function(shopGoods) {
	this._windowShopper = true;
	if (this._goods.length === 0) {
		this.setupStock(shopGoods);
	}
	return this.goods();
};

LvMZ_Shop.prototype.setupStock = function(shopGoods) {
	this.clear();
	shopGoods = shopGoods.sortByColumn(0,1);
	for (const goods of shopGoods) {
		const item = this.goodsToItem(goods);
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

LvMZ_Shop.prototype.goodsToItem = function(goods) {
    switch (goods[0]) {
        case 0: return $dataItems[goods[1]];
        case 1: return $dataWeapons[goods[1]];
        case 2: return $dataArmors[goods[1]];
    }
	return null;
};

// {Array} = [0:Items, 1:Weapons, 2:Armors]
LvMZ_Shop.prototype.itemCount = function(index) {
	let n = this._count[index];
	if (Array.isArray(n)) {
		const min = Math.ceil(n[0]);
		const max = Math.floor(n[1]);
		n = ~~(Math.random() * (max - min + 1) + min);
	}
	return n;
};

LvMZ_Shop.prototype.sortStock = function() {
	for (let i = 0; i < this._goods.length; i++) {
		const nextItem = this._goods[i+1];
		if (this._goods[i] === nextItem) {
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

LvMZ_Shop.prototype.maxStock = function() {
	return 99;
};

LvMZ_Shop.prototype.addGoods = function(item, amount) {
	item = itemProxy(item);
	if (Array.isArray(amount)) {
		const min = Math.ceil(amount[0]);
		const max = Math.floor(amount[1]);
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

LvMZ_Shop.prototype.loseGoods = function(item, amount) {
	for (let i = this._goods.length - 1; i >= 0; i--) {
		if (this._goods[i] === item) {
			if (this._stock[i] > amount) {
				this._stock[i] -= amount; 
				break;
			}
			amount -= this._stock[i];
			this.remove(i);
		}
	}
};

LvMZ_Shop.prototype.remove = function(index) {
	this._goods.splice(index, 1);
	this._costs.splice(index, 1);
	this._stock.splice(index, 1);
};

LvMZ_Shop.prototype.goods = function() {
	// [type,itemId,1,price,num]  <-- format to export
	const list = [];
	for (let i = 0; i < this._goods.length; i++) {
		let item = this._goods[i];
		let price = this._costs[i];
		let num = this._stock[i];
		let type = this.itemType(item);
		if ([0,1,2].includes(type)) {
			list.push([type,item.id,1,price,num]);
		}
	}
	return list;
};

LvMZ_Shop.prototype.itemType = function(item) {
	if (!item) return -1;
	if (DataManager.isItem(item)) return 0;
	if (DataManager.isWeapon(item)) return 1;
	if (DataManager.isArmor(item)) return 2;
	return -1;
};

// Compatibility with LvMZ_Currencies.js
LvMZ_Shop.prototype.checkPrice = function(item) {
	if (!item) return false;
	if (Imported["LvMZ_Currencies"]) {
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

LvMZ_Shop.prototype.gold = function() {
	return this._money;
};

LvMZ_Shop.prototype.maxGold = function() {
	return $gameParty.maxGold();
};

LvMZ_Shop.prototype.addGold = function(amount) {
	this._money = (this._money + amount).clamp(0, this.maxGold());
};

LvMZ_Shop.prototype.loseGold = function(amount) {
	this.addGold(-amount);
};

// --

LvMZ_Shop.prototype.sMin = function() {
	return this._supplyMin || 1;
};

LvMZ_Shop.prototype.sMax = function() {
	return this._supplyMax || 99;
};

LvMZ_Shop.prototype.sOffset = function() {
	return this._supplyOffset || 0;
};

LvMZ_Shop.prototype.sAdjust = function() {
	return this._supplyAdjust || 0;
};


// --- GAME CONTRABAND ---
function Game_Contraband() {
	this.initialize(...arguments);
}

Game_Contraband.prototype.initialize = function() {
	this._gold = 0;
	this._items = {};
	this._weapons = {};
	this._armors = {};
};

Game_Contraband.prototype.count = function(type) {
	switch (type.toLowerCase()) {
		case "item": return Object.keys(this._items).length;
		case "weapon": return Object.keys(this._weapons).length;
		case "armor": return Object.keys(this._armors).length;
		case "gold": return this._gold;
	}
	return 0;
};

Game_Contraband.prototype.addGold = function(amount) {
	this._gold = (this._gold + amount).clamp(0, $gameParty.maxGold());
};

Game_Contraband.prototype.loseGold = function(amount) {
	this.addGold(-amount);
};

Game_Contraband.prototype.mergeItems = function(items) {
	mergeData(this._items, items);
};

Game_Contraband.prototype.mergeWeapons = function(weapons) {
	mergeData(this._weapons, weapons);
};

Game_Contraband.prototype.mergeArmors = function(armors) {
	mergeData(this._armors, armors);
};


// ============================================================================
// -- Global Functions --

function economicBuyPrice(price, index) {
	price *= $gameSystem.markUp();		// Buy price
	const min = Math.floor(price / 2);	// Half buy price
	let adj = 0;						// Total price adjustment
	// Supply & Demand
	const demand = $gameSystem.demand(index);
	adj += supplyCheck(index);
	adj += demand[0]; 					// Rate(%)
	adj += demand[1]; 					// Fixed Adjustment
	// Faction, Race, Gender, Fame, Relation, Titles, and Age
	//  * Positive numbers become discounts here!
	if (Imported["LvMZ_Factions"]) {
		const ev = MapManager.event();
		const pc = $gameParty.leader();
		adj += ev.lvGet('priceAdjust',[pc,'faction']) * -1;
		adj += ev.lvGet('priceAdjust',[pc,'race']) * -1;
		adj += ev.lvGet('priceAdjust',[pc,'gender']) * -1;
		adj += ev.lvGet('priceAdjust',[pc,'reputation']) * -1;
		adj += ev.lvGet('priceAdjust',[pc,'relation']) * -1;
		adj += ev.lvGet('priceAdjust',[pc,'romance']) * -1;
		adj += ev.lvGet('priceAdjust',[pc,'title']) * -1;
		adj += ev.lvGet('priceAdjust',[pc,'age']) * -1;
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
	const demand = $gameSystem.demand(index);
	adj += supplyCheck(index);
	adj += demand[0]; 					// Rate(%)
	adj += demand[1]; 					// Fixed Adjustment
	// Faction, Race, Gender, Fame, Relation, and Titles
	if (Imported["LvMZ_Factions"]) {
		const ev = MapManager.event();
		const pc = $gameParty.leader();
		adj += ev.lvGet('priceAdjust',[pc,'faction']);
		adj += ev.lvGet('priceAdjust',[pc,'race']);
		adj += ev.lvGet('priceAdjust',[pc,'gender']);
		adj += ev.lvGet('priceAdjust',[pc,'reputation'])
		adj += ev.lvGet('priceAdjust',[pc,'relation']);
		adj += ev.lvGet('priceAdjust',[pc,'romance']);
		adj += ev.lvGet('priceAdjust',[pc,'title']);
		adj += ev.lvGet('priceAdjust',[pc,'age']);
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
		adjust = (Math.floor((stock - max) / os) * rate) * -1;
	}
	return (adjust / 100).percent();
};

function itemProxy(item) {
	if (!item) return null;
	if (!item.stolenType) return item;
	return itemGroup(item.stolenType, item.id);
};