// ============================================================================
//  LordValinar Plugin - Fishing Shop
//  LvMZ_FishShop.js
// ============================================================================

var Imported = Imported || {};
Imported["LvMZ_FishShop"] = true;

//: only the essentials
if (!Imported['LvMZ_Core']) {
// -- 
function MapManager() {
	throw new Error("This is a static class");
}

MapManager.event = function() {
	const intr = $gameMap._interpreter;
	return intr ? $gameMap.event(intr._eventId) : null;
};
} // End of Import

/*:
 * @target MZ
 * @plugindesc [v1.0] Allows a merchant NPC to only buy caught fish 
 * from the player.
 * @author LordValinar
 * @url https://github.com/DarkArchon85/RMMZ-Plugins
 *
 * @ --------------------------------------------------------------------------
 *
 * @command catchFish
 * @text Fish Caught Event
 * @desc This marks the fish you've caught to sell.
 *
 * @arg itemId
 * @text Fish Item ID
 * @type item
 * @desc Database ID of the fish to catch
 * @default 
 *
 * @arg amount
 * @text Fish Amount
 * @desc If any perks to increase number of fish, you 
 * can use a static number or formula here.
 *
 * @arg append
 * @text Unique Name
 * @desc You can add a unique name to your fish here 
 * such as (caught) or (Trout), etc.
 * @default 
 *
 * @arg desc
 * @text Unique Description
 * @type note
 * @desc You can change the fish's description here 
 * with a custom one! "Wow! A world record!" etc.
 * @default That's a whopper! You should sell it.
 *
 *
 * @help
 * ----------------------------------------------------------------------------
 * Instructions
 * ----------------------------------------------------------------------------
 *
 * Call the "catchFish" plugin command when you catch a fish in whatever 
 * system you are using. Choose the base fish itemID to catch, and an 
 * amount. This amount can be a static number (ex: 1, 5, 10) or even a 
 * formula (ex: Math.randomInt(3) + 1).
 *
 * Lastly, setup your shop keeper to either have a:
 * -- Note Tag --
 * <fishOnly>   (not case-sensitive)
 *   This will be event-wide, regardless of which page it's on.
 * Use this if your event isn't convoluted with note tags already.
 *
 * -- Comment Tag --
 * <fishOnly>   (not case-sensitive)
 *   Use this if you want the shop keeper to buy caught fish when 
 * on a certain page.
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
 * v1.0 - Plugin finished!
 *
 * ----------------------------------------------------------------------------
 */

(() => {
'use strict';

/******************************************************************************
	internal functions
******************************************************************************/

function evalCaught(text) {
	try {
		// replace variables (use v[2]  not \v[2])
		text = text.replace(/V\[(\d+)\]/gi, (_, p1) =>
			$gameVariables.value(parseInt(p1))
		);
		const value = Math.max(eval(text), 0);
		return isNaN(value) ? 0 : value;
	} catch(e) {
		return 0;
	}
}

/******************************************************************************
	rmmz_managers.js
******************************************************************************/

// --- PLUGIN MANAGER ---
PluginManager.registerCommand('LvMZ_FishShop', 'catchFish', args => {
	const itemId = Number(args.itemId);
	const amount = evalCaught(args.amount);
	const fish = JSON.parse(JSON.stringify($dataItems[itemId]));
	const data = $gameParty.fishData(itemId+2000);
	if (args.append.length > 0) {
		fish.name += args.append;
		data.name = fish.name.replace(/["]/g, '');
	}
	if (args.desc.length > 0) {
		fish.description = args.desc;
		data.desc = fish.description.replace(/["]/g, '');
	}
	fish.id += 2000;
	fish.caughtFish = true;
	$gameParty.gainItem(fish, amount);
});


// --- DATA MANAGER ---
const dm_isItem = DataManager.isItem;
DataManager.isItem = function(item) {
    return dm_isItem.call(this, itemProxy(item));
};

function itemProxy(item) {
	if (!item) return null;
	if (item.id <= 2000) return item;
	return $dataItems[item.id - 2000];
};

/******************************************************************************
	rmmz_objects.js
******************************************************************************/

// --- GAME PARTY ---
const gameParty_init = Game_Party.prototype.initAllItems;
Game_Party.prototype.initAllItems = function() {
	gameParty_init.call(this);
	this._caughtFish = {}; // container
	this._fishData = {};   // appended names and descriptions
};

const gameParty_allItems = Game_Party.prototype.allItems;
Game_Party.prototype.allItems = function() {
	return gameParty_allItems.call(this).concat(this.fish());
};

const gameParty_container = Game_Party.prototype.itemContainer;
Game_Party.prototype.itemContainer = function(item) {
	if (item && DataManager.isItem(item) && item.caughtFish) {
		return this._caughtFish;
	}
	return gameParty_container.call(this, item);
};

Game_Party.prototype.fishData = function(itemId) {
	if (!this._fishData[itemId]) {
		this._fishData[itemId] = {name: "", desc: ""};
	}
	return this._fishData[itemId];
};

Game_Party.prototype.fish = function() {
	return Object.keys(this._caughtFish).reduce((r,id) => {
		const item = $dataItems[id-2000]; // original item
		const fish = JSON.parse(JSON.stringify(item));
		fish.id = Number(id); // keep unique ID separate from normal fish
		fish.caughtFish = true;
		fish.description = this.fishData(id).desc;
		fish.name = this.fishData(id).name;
		r.push(fish);
		return r;
	},[]);
};

/******************************************************************************
	rmmz_scenes.js
******************************************************************************/

// -- WINDOW SHOP_SELL ---
const winShopSell_isEnabled = Window_ShopSell.prototype.isEnabled;
Window_ShopSell.prototype.isEnabled = function(item) {
	if (item && this.fishOnly(MapManager.event())) {
		if (!item.caughtFish) return false;
	}
    return winShopSell_isEnabled.call(this, item);
};

Window_ShopSell.prototype.fishOnly = function(event) {
	if (!event) return false; // not called from an event
	const tag = /<FISHONLY>/i;
	// check note tag
	const note = event.event().note;
	if (note.match(tag)) return true;
	// check comment tags
	for (const ev of event.list()) {
		if ([108,408].contains(ev.code)) {
			if (ev.parameters[0].match(tag)) {
				return true;
			}
		}
	}
};

})();