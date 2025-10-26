// ============================================================================
//  LordValinar Plugin - Core
//  LvMZ_Core.js
// ============================================================================

var Imported = Imported || {};
Imported["LvMZ_Core"] = true;

// ============================================================================
//  List of public functions
// ============================================================================

/**
 * Main namespace for LordValinar functions
 *
 * @namespace LvCore
 */
/**
 * Formats a string to have the first letter capitalized 
 *
 * @memberof LvCore
 * @param allWords {boolean} If you want all words in a string 
 *  to be capitalized or just the first word
 * @returns {string} A formatted string
 */
String.prototype.capFirst = function(allWords=false) {
	if (allWords) {
		let toSort = [];
		for (const word of this.split(" ")) {
			let text = word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
			toSort.push(text);
		}
		return toSort.join(" ");
	}
	return this.charAt(0).toUpperCase() + this.slice(1).toLowerCase();
};

/**
 * Formats a percentile number to remove trails but two
 * You may define a custom min and max, otherwise the 
 *   default is -100% to 100% (min -1, max 1).
 *
 * @memberof LvCore
 * @param min {number} Minimum number to clamp for percentile
 * @param max {number} Maximum number to clamp for percentile
 * @returns {number} A formatted number
 */
Number.prototype.percent = function(min = -1, max = 1) {
	return Number(this.toFixed(2)).clamp(min, max);
};

/**
 * Searches an array filled with objects to find the index
 *   by key and value.
 *
 * @memberof LvCore
 * @param key {string} object key to map
 * @param value {any} the value to match in the mapped array
 * @returns {number} Index of the array by key and value
 */
Array.prototype.indexByKey = function(key, value) {
	return this.map(obj => obj ? obj[key] : "").indexOf(value);
};

Object.defineProperty(Array.prototype, "indexByKey", {
    enumerable: false
});

/**
 * Sorts an array with multiple columns
 *
 * @memberof LvCore
 * @param cA {number} Index of column A
 * @param cB {number} Index of column B
 * @returns {array} Sorted array by multiple columns
 */
Array.prototype.sortByColumn = function(cA, cB) {
	return this.sort((a,b) => {
		return a[cA] === b[cA] ? a[cB] - b[cB] : a[cA] - b[cA];
	});
};

Object.defineProperty(Array.prototype, "sortByColumn", {
    enumerable: false
});

/**
 * Matches keys and values of each element in an array
 *
 * @memberof LvCore
 * @param array {array} Second array to compare with
 * @returns {boolean} Whether the two arrays match or not
 */
Array.prototype.matches = function(array) {
	if (!Array.isArray(array) || this.length !== array.length) return false;
    for (let i = 0; i < this.length; i++) {
		const typeA = Object.prototype.toString.call(this[i]);
		const typeB = Object.prototype.toString.call(array[i]);
		if (typeA !== typeB || this[i] !== array[i]) return false;
		if (!this[i].matches(array[i])) return false;
    }
    return true;
};

Object.defineProperty(Array.prototype, "matches", {
    enumerable: false
});

/**
 * Matches keys and values of each element in an object
 *
 * @memberof LvCore
 * @param obj {object} Second object to compare with
 * @returns {boolean} Whether the two objects match or not
 */
Object.prototype.matches = function(obj) {
	return Object.keys(this).every(key => {
		return (this[key] instanceof Array && obj[key] instanceof Array)
			? this[key].matches(obj[key])
			: this[key] === obj[key];
	});
};

/**
 * Merges numerical data by key between two objects
 *
 * @memberof LvCore
 * @param source {object} Source object
 * @param target {object} Target object to merge with Source
 * @returns {object} Combined Source object
 */
function mergeData(source, target) {
	for (const key in target) {
		source[key] = source[key] || 0;
		source[key] += target[key];
	}
	return source;
}

/**
 * Searches for the common event Id based on name tag
 *
 * @memberof LvCore
 * @param nameTag {string} The name to search for (can use RegEx)
 * @return {number} ID of the common event or 0 if not found
 */
function commonEventId(nameTag) {
	const list = $dataCommonEvents.filter(e => !!e && e.name.length > 0);
	for (const commonEvent of list) {
		if (commonEvent.name.match(nameTag)) {
			return commonEvent.id;
		}
	}
	return 0;
}

/**
 *  Retrieves database item by Type and ID
 *
 * @memberof LvCore
 * @param type {string} Item, Weapon, or Armor
 * @param id {number} Database ID of the object
 * @return {object} Database Object
 */
function itemGroup(type, id) {
	switch (type.toLowerCase()) {
		case 'item': return $dataItems[id];
		case 'weapon': return $dataWeapons[id];
		case 'armor': return $dataArmors[id];
	}
	return null;
}

/**
 * Retrieves an actor for event lists
 *
 * @memberof LvCore
 * @param index {number} Index of actor in party
 * @returns {object} Game_Actor
 */
Game_Interpreter.prototype.actor = function(index=0) {
	return $gameParty.battleMembers()[index];
};


// --- MAP MANAGER ---
function MapManager() {
	throw new Error('This is a static class');
}

/**
 * Loads map data not on current $gameMap and then 
 *   executes a function based on this loaded data
 *
 * @memberof LvCore
 * @param mapId {number} ID of the map to load
 * @param callBack {function} The callback function to load data with
 */
MapManager.loadMapData = function(mapId, callBack) {
	if (mapId > 0) {
		const src = 'Map%1.json'.format(mapId.padZero(3));
		const xhr = new XMLHttpRequest();
		const url = "data/" + src;
		xhr.open("GET", url);
		xhr.overrideMimeType("application/json");
		xhr.onload = () => this.onXhrLoad(xhr, callBack);
		xhr.onerror = () => this.onXhrError(callBack);
		xhr.send();
	} else {
		this.onXhrError(callBack);
	}
};

MapManager.onXhrLoad = function(xhr, callBack) {
	if (xhr.status < 400) {
		const result = JSON.parse(xhr.responseText);
		DataManager.onLoad(result);
		callBack(result);
	} else {
		this.onXhrError(callBack);
	}
};

MapManager.onXhrError = function(callBack) {
	if ($gameTemp.isPlaytest()) {
		console.log("ERROR :: MapManager :: Failed to load Map Data!");
	}
	const result = this.makeEmptyMap();
	callBack(result);
};

MapManager.makeEmptyMap = function() {
	const map = {};
	map.data = [];
	map.events = [];
	map.meta = {};
	map.width = 100;
	map.height = 100;
	map.scrollType = 3;
	return map;
};

/**
 * Grabs the map event that is running
 *
 * @memberof LvCore
 * @return {function} The event running
 */
MapManager.event = function() {
	const intr = $gameMap._interpreter;
	if (!intr) {
		if ($gameTemp.isPlaytest()) {
			alert("ERROR(MapManager): No event running!");
		}
		return null;
	}
	return $gameMap.event(intr._eventId);
};

/**
 * Checks all directions
 *
 * @memberof LvCore
 * @param x {number} X position of tile
 * @param y {number} Y position of tile
 * @return {boolean} Returns true if at least 1 direction is valid
 */
MapManager.isTilePassable = function(x, y) {
	for (let i = 0; i < 4; i++) {
		const d = 2 + i * 2;
		const x2 = $gameMap.roundXWithDirection(x, d);
		const y2 = $gameMap.roundYWithDirection(y, d);
		const d2 = 10 - d; // reverse
		if ($gameMap.isPassable(x, y, d) && $gameMap.isPassable(x2, y2, d2)) {
			return true;
		}
	}
	return false;
};

/**
 * Returns an events array from another map
 *
 * @memberof LvCore
 * @param mapId {number} ID of the map object
 * @return {array} Map events both standard and custom
 */
MapManager.simulateEvents = function(mapId) {
	if ($gameMap.mapId() == mapId) return $gameMap.events();
	let list = DataManager.map(mapId).events.filter(ev => !!ev);
	// Replicates Game_Map's method to setup events
	const events = [];
	for (const event of list) {
		events[event.id] = new LvMZ_RemoteEvent(mapId, event.id);
	}
	if (Imported["LvMZ_CustomEvents"]) {
		// Load up custom events
		list = $gameMap.loadEvents(mapId).filter(ev => !!ev);
		for (const event of list) {
			if (event.custom) {
				let gameClass = event.custom;
				events[event.id] = new gameClass(mapId, event.id);
			} else {
				events[event.id] = new Game_CustomEvent(mapId, event.id);
			}
		}
	}
	return events;
};


// --- PLUGIN MANAGER ---
function LvParams() {
	this.initialize(...arguments);
}

LvParams.prototype.initialize = function(pluginName) {
	this._data = PluginManager.parameters(pluginName);
};

LvParams.prototype.value = function(key, type='') {
	switch (type) {
		case 'arr':  return this._data[key].split(",");
		case 'bool': return this._data[key].toLowerCase() === "true";
		case 'eval': return eval(this._data[key]);
		case 'jnum': return JSON.parse(this._data[key]).map(e => Number(e));
		case 'json': return JSON.parse(this._data[key]).map(e => JSON.parse(e));
		case 'num':  return Number(this._data[key]);
		case 'obj':  return JSON.parse(this._data[key]);
		case 'strL': return this._data[key].toLowerCase();
		case 'strU': return this._data[key].toUpperCase();
		case '%':    return (Number(this._data[key])/100).percent();
	}
	return this._data[key];
};

LvParams.prototype.hex = function(rgb, alpha) {
	let value = '#' + rgb.match(/[0-9]+/g).map((x) => {
		return parseInt(x).toString(16).padZero(2)
	}).join('');
	if (alpha) {
		alpha = alpha.clamp(0,1) * 255;
		value += parseInt(alpha).toString(16);
	}
	return value;
};

LvParams.prototype.rgb = function(key, alpha) {
	let hex = this._data[key];
	let r = parseInt(hex.slice(1, 3), 16),
		g = parseInt(hex.slice(3, 5), 16),
		b = parseInt(hex.slice(5, 7), 16);
	return (alpha ? "rgba(" : "rgb(")+r+", "+g+", "+b
		 + (alpha ? ", "+alpha+")" : ")");
};

LvParams.prototype.eval = function(text) {
	if (text.match(/RANDOM[: ]+(\d+)[\-~, ](\d+)/gi)) {
		const min = Math.ceil(Number(RegExp.$1));
		const max = Math.floor(Number(RegExp.$2));
		return ~~(Math.random() * (max - min + 1) + min);
	}
	text = text.replace(/[\\]*(A|V)\[(\d+)\]/gi, (_, p1, p2) => {
		switch (p1.toUpperCase()) {
			case 'A': return "$gameParty._actors["+Number(p2-1)+"]";
			case 'V': return "$gameVariables.value("+p2+")";
		}
	});
	try {
		const value = eval(text);
		return isNaN(value) ? 0 : Math.max(value, 0);
	} catch(e) {
		console.log("---ERROR(LvParams.prototype.eval)---");
		console.log("Eval: " + text);
		return 0;
	}
};

LvParams.prototype.parseSE = function(obj) {
	return obj ? {
		name:   obj.name || "",
		pan:    Number(obj.pan || 0).clamp(-100, 100),
		pitch:  Number(obj.pitch || 100).clamp(50, 150),
		volume: Number(obj.volume || 90).clamp(0, 100)
	} : null;
};

LvParams.prototype.loadBGMData = function(key) {
	const obj = JSON.parse(this._data[key]);
	return this.parseSE(obj);
};

LvParams.prototype.loadSFXData = function(key, addDelay=false) {
	const obj = JSON.parse(this._data[key]);
	const value = this.parseSE(obj);
	if (addDelay && obj.delay) {
		value.delay = Math.max(0, Number(obj.delay));
	}
	return value;
};

LvParams.prototype.validEventId = function(x, y) {
	const list = $gameMap.eventsXy(x,y).filter(ev => !ev._erased);
	return list.length > 0 ? list[0].eventId() : 0;
};

LvParams.prototype.targetFromPos = function(x, y, create=false) {
	const eventId = this.validEventId(x, y);
	if (eventId > 0) {
		return $gameMap.event(eventId);
	} else if ($gamePlayer.pos(x, y)) {
		return $gamePlayer;
	} else if (Imported["LvMZ_CustomEvents"] && create) {
		const event = $gameMap.blankEvent("CustomEvent", x, y);
		if (event) {
			event._isCustom = true;
			return event;
		}
	}
	return null;
};

// --

const Lv = new class {
	constructor() {
		this._data = {};
	}
	
	plugin(pluginName) {
		pluginName = pluginName.replace(/LVMZ_/i, '');
		if (!LvMZ[pluginName] && $gameTemp.isPlaytest()) {
			alert("LvError("+pluginName+"): This plugin doesn't exist!");
		}
		return LvMZ[pluginName] || {
			name: "Invalid",
			desc: "This plugin doesn't exist",
			version: 0
		};
	}
	
	loadDataFile(src, callBack, fileDir='data/') {
		const xhr = new XMLHttpRequest();
		const url = fileDir + src;
		xhr.open('GET', url);
		xhr.overrideMimeType('application/json');
		xhr.onload = () => this.onXhrSuccessLoad(xhr, src, callBack);
		xhr.onerror = () => this.onXhrErrorReturn(src);
		xhr.send();
	}
	
	onXhrSuccessLoad(xhr, src, callBack) {
		if (xhr.status < 400) {
			const result = JSON.parse(xhr.responseText);
			callBack(result);
		} else {
			this.onXhrErrorReturn(src);
		}
	}
	
	onXhrErrorReturn(src) {
		console.log("Failure to load file: " + src);
	}
	
	saveDataFile(fileNameExt, object, fileDir='data/') {
		const json = StoreManager.objectToJson(object);
		const dirPath = this.filePath(fileDir);
		const filePath = dirPath + fileNameExt;
		const backupFilePath = filePath + "_";
		return new Promise((resolve, reject) => {
			StorageManager.fsMkdir(dirPath);
			StorageManager.fsUnlink(backupFilePath);
			StorageManager.fsRename(filePath, backupFilePath);
			try {
				StorageManager.fsWriteFile(filePath, json);
				StorageManager.fsUnlink(backupFilePath);
				resolve();
			} catch (e) {
				try {
					StorageManager.fsUnlink(filePath);
					StorageManager.fsRename(backupFilePath, filePath);
				} catch (e2) {
					//
				}
				reject(e);
			}
		});
	}
	
	filePath(fileDir='data/') {
		const path = require("path");
		const base = path.dirname(process.mainModule.filename);
		return path.join(base, fileDir);
	}
	
	fileExists(fileNameExt, fileDir='data/') {
		if (!fileNameExt) return false;
		const dirPath = this.filePath(fileDir);
		const file = dirPath + fileNameExt;
		const fs = require("fs");
		return fs.existsSync(file);
	}

	debug(id, text, wait=60) {
		if (!this._data[id]) {
			this._data[id] = Math.max(0, wait);
			console.log(text);
		}
	}
	
	update() {
		for (const id in this._data) {
			let wait = this._data[id] || 0;
			if (wait > 0) {
				this._data[id] -= 1;
			} else {
				delete this._data[id];
			}
		}
	}
	
	clearDebug() {
		this._data = {};
	}
	
	checkTag(object, noteTag) {
		if (!object) return false;
		const data = (object.note || "").split(/[\r\n]+/);
		for (const meta of data) {
			if (meta.match(noteTag)) return true;
		}
		return false;
	}
	
	checkComment(event, noteTag) {
		if (!event || !event.page()) return false;
		for (const command of event.list()) {
			if (![108,408].contains(command.code)) continue;
			const note = command.parameters[0];
			if (note.match(noteTag)) return true;
		}
		return false;
	}
};

//=============================================================================
/*:
 * @target MZ
 * @plugindesc [v1.0] Core functionality and quality of life settings.
 * @author LordValinar
 * @url https://github.com/DarkArchon85/RMMZ-Plugins
 *
 * @param -- General Settings ------
 * @default ----------------------------------
 *
 * @param startDir
 * @text Starting Direction
 * @parent -- General Settings --
 * @type select
 * @option Down
 * @option Left
 * @option Right
 * @option Up
 * @desc Change the starting direction when you load up 
 * the game for the first time. Default: Down
 * @default Down
 *
 * @param debugMode
 * @text Debug Mode
 * @parent -- General Settings --
 * @type boolean
 * @on Debug Mode ON
 * @off Debug Mode OFF
 * @desc ON has map update automatically remove any Lv.debug() 
 * commands used (stores debug info)
 * @default false
 *
 * @param removeTitle
 * @text Remove Title Screen
 * @parent -- General Settings --
 * @type boolean
 * @on Remove Title Screen
 * @off Keep Default
 * @desc Skips the title and splash screen.
 * @default false
 *
 * @param permaDeath
 * @text Permanent Actor Death
 * @parent -- General Settings --
 * @type boolean
 * @on PermaDeath ON
 * @off No PermaDeath
 * @desc If an actor falls in combat, they are removed from the 
 * party. "If he dies.. he dies."
 * @default false
 *
 * @param maxLevelControl
 * @text Manual Level Control
 * @parent -- General Settings --
 * @type boolean
 * @on Manual Control
 * @off Leave as Default
 * @desc Do you want to cap your max level manually, or let the 
 * default (or other plugins) control it?
 * @default false
 *
 * @param maxLevel
 * @text Starting Level Cap
 * @parent -- General Settings --
 * @parent MaxLevelControl
 * @type number
 * @min 1
 * @desc What is the starting max level for a character? Only 
 * works if Manual Level Control is turned ON.
 * @default 99
 *
 * @param autoEquip
 * @text Auto Equip
 * @parent -- General Settings --
 * @type struct<EquipItem>[]
 * @desc Re-Equip an armor or weapon if leaving an empty slot.
 * @default []
 *
 * @param dualWielder
 * @text Two Weapon Fighting State
 * @parent -- General Settings --
 * @type state
 * @desc State ID to add dual wielder trait
 * NOTE: See help for details
 * @default 0
 *
 * @param usePartyLimit
 * @text Toggle Party Limit
 * @parent -- General Settings --
 * @type boolean
 * @on Use This Method
 * @off Use Default Or Other
 * @desc If not using VisuStella's party plugin, then you can 
 * set the desired party size limit with this option.
 * @default false 
 *
 * @param partyLimit
 * @text Party Size Limit
 * @parent -- General Settings --
 * @parent UsePartyLimit
 * @type number
 * @min 1
 * @desc Decide the max size of your party.
 * @default 4
 *
 * @param dirTurn
 * @text Turn By DIR Input
 * @parent -- General Settings --
 * @type boolean
 * @on Delay Move After Turn
 * @off Move Immediately (default)
 * @desc If using input (WASD or arrows), the character will 
 * turn first, delaying the movment of that direction.
 * @default false
 *
 * @param turnDelay
 * @text Frame Delay To Move
 * @parent -- General Settings --
 * @parent dirTurn
 * @type number
 * @min 1
 * @max 9999
 * @desc The delay (in frames) between turning and moving.
 * @default 30
 *
 * @param -- Advisor ---------------
 * @default ----------------------------------
 *
 * @param advisorName
 * @text Name of Advisor
 * @parent -- Advisor --
 * @default Shows in the name window. Leave blank to ignore.
 * @default \\c[7][\\c[10]Advisor\\c[7]]
 * 
 * @param advisorFace
 * @text Advisor Face Image
 * @parent -- Advisor --
 * @type file
 * @dir img/faces/
 * @desc The filename of the face graphic to use
 * @default Evil
 *
 * @param advisorIndex
 * @text Face Image Index
 * @parent -- Advisor --
 * @type number
 * @min 0
 * @max 7
 * @desc Index of the face graphic to use.
 * @default 7
 *
 * @param msgBg
 * @text Message Background
 * @parent -- Advisor --
 * @type number
 * @min 0
 * @max 2
 * @desc 0(windowed) 1(dim) 2(transparent)
 * @default 1
 *
 * @param msgPos
 * @text Message Position
 * @parent -- Advisor --
 * @min 0
 * @max 2
 * @desc 0(top) 1(middle) 2(bottom)
 * @default 0
 *
 * @param useAdvisor
 * @text Use Advisor Messages
 * @parent -- Advisor --
 * @type boolean
 * @on Display Advisor Messages
 * @off Hide Advisor Messages
 * @desc Display or Hide advisor from certain functions.
 * See Help(usage); LvMZ_Core(settings)
 * @default false
 *
 * @ --------------------------------------------------------------------------
 *
 * @command setLimit
 * @text Party Limit
 * @desc Change party limit size
 * 
 * @arg set
 * @text Set Party Size Limit
 * @type number
 * @min 1
 * @desc What size do you want to make your party limit?
 * @default 4
 *
 * @ --------------------------------------------------------------------------
 *
 * @command setLevel
 * @text Level Cap
 * @desc Sets the current maximum level
 *
 * @arg actorId
 * @text Actor ID
 * @type number
 * @min 1
 * @desc Which actor to affect max level
 * @default 1
 *
 * @arg value
 * @text Value
 * @type number
 * @min 1
 * @desc What is the new maximum level for that actor?
 * @default 99
 *
 * @ --------------------------------------------------------------------------
 *
 * @command selfSwitch
 * @text Set Self Switch
 * @desc Sets a self switch value
 * Needs: MapID, EventId, and CharID (A, B, C, D)
 *
 * @arg mapId
 * @type number
 * @min 1
 * @max 999
 * @desc 
 * @default 1
 *
 * @arg eventId 
 * @type number
 * @min 1
 * @max 999
 * @desc 
 * @default 1
 *
 * @arg charId
 * @type select
 * @option A
 * @option B
 * @option C
 * @option D
 * @desc 
 * @default A
 * 
 * @arg value
 * @type boolean
 * @desc 
 * @default true
 *
 * @ --------------------------------------------------------------------------
 *
 * @command selfSwitchAll
 * @text Self All SelfSwitches
 * @desc Sets a self switch value to all events
 * Needs: MapId and CharID (A, B, C, D)
 *
 * @arg mapId
 * @type number
 * @min 1
 * @max 999
 * @desc 
 * @default 1
 *
 * @arg charId
 * @type select
 * @option A
 * @option B
 * @option C
 * @option D
 * @desc 
 * @default A
 * 
 * @arg value
 * @type boolean
 * @desc 
 * @default true
 *
 * @ --------------------------------------------------------------------------
 *
 * @command setAdvisor
 * @text Toggle Advisor
 * @desc Set whether or not advisor messages are displayed
 *
 * @arg value
 * @text Display Value
 * @type boolean
 * @on Display Advisor Messages
 * @off Hide Advisor Messages
 * @desc Display or Hide advisor from certain functions.
 * See Help(usage); LvMZ_Core(settings)
 * @default true
 *
 *
 * @help
 * ----------------------------------------------------------------------------
 * Introduction
 * ----------------------------------------------------------------------------
 *
 * This plugin is to help make my projects (and hopefully yours) easier with
 * quality of life functions. First we'll go over the settings and end with 
 * the available global functions.
 *
 * -- General Settings --
 * 
 * Starting Direction (default: Down): Which direction do you want the 
 * player character to start facing? Normally RPG Maker has you start
 * facing Down, but you might want the party leader facing East after
 * a cutscene?
 *
 * Debug Mode: Turned OFF by default, but if you want to use LvMZ_Core
 * for debugging messages in your own plugins, you can use the following
 * script call:
 *
 *  Lv.debug(id, text, wait);
 *   - ID: Any value really, unique to each debugging messages to prevent
 *         overlap and keep them organized.
 *   - Text: This is the console message you want displayed (F8)
 *   - Wait: How many frames in delay before this debug command(by ID) can
 *         work again? Helpful in preventing spammed debugging in loops.
 *
 * Remove Title Screen: Turn this ON if you want to skip directly to 
 * Scene_Map (maybe using a map for title screen, or you want a title in 
 * later, etc.
 *
 * Permanent Actor Death: If turned ON, then when an Actor perishes in 
 * combat, they are removed from the party entirely. However, there are 
 * a couple ways you can add "Lives" to the actor to prevent this.
 *
 *  <Immortal>  (notetag indicating they cannot die and will be put to 1hp)
 *  <Lives: #>  (notetag giving this actor a number of lives)
 *   - #(number): Number of lives available (on actor setup)
 *
 * Manual Level Control: Turn this ON if you want to exceed the 99 level cap
 * and - or want to control the level cap dynamically. Leaving this OFF will
 * keep it at whatever level cap you set it in the Database.
 *
 * Auto Equip: For games where you want your character to always have 
 * -something- equipped, you can use this setting. Example games have the
 * actor wearing some form of underwear.
 *
 * Two Weapon Fighting State: This will require you to create a State that 
 * adds the Dual Wielder trait (slot type), and then put that State ID here.
 * What this does is allow
 *
 * Toggle Party Limit: Turn this ON if you want to be able to decide the 
 * maximum size of your party. Probably wise not to go TOO high..
 *  - If you are using VisuMZ party plugin, you can leave this OFF.
 * 
 * Turn By DIR Input: Turn this ON if you want to have a character turn 
 * towards your movement input FIRST with a delay before moving in that 
 * direction.
 *
 *
 * -- Advisor Settings --
 *
 * Displays a message window and can be used either for an Advisor NPC
 * (as intended), or just a generic message/warning for the player.
 *
 * Name: This is the name window of the message (leave blank for no name).
 *  You can also use message tags to add color or formatting.
 *
 * Face Image: The filename of the Face image.
 * 
 * Face Index: The index (0-7) of the Face image.
 * 
 * Message Background: Windowed(0), Dim(1), or Transparent(2)
 *
 * Message Position: Top(0), Middle(1), or Bottom(2)
 * 
 * Use Advisor Messages: Turn this ON to use the advisor system by default.
 * Alternatively you can toggle it using the $advisor variable:
 *  $advisor.setActive(true);
 *
 * 
 * ===== GLOBAL FUNCTIONS =====
 *
 * String.prototype.capFirst = function(allWords) {};
 *   
 *   This function formats a string to have the first letter capitalized.
 *   - allWords: If TRUE, then it breaks down the string and capitalizes
 *               every word in that string.
 *   Example: "hello world".capFirst(true) => "Hello World"
 *   Example: "foget me not".capFirst() => "Forget me not"
 *
 *
 * Number.prototype.percent = function(min = -1, max = 1) {};
 *
 *   This function converts a number to a 2-decimal string, then back into
 *   a number before ensuring it doesn't exceed the min/max limitations.
 *   Example: (15 / 100).percent() => 0.15
 *
 *
 * Array.prototype.indexByKey = function(key, value) {};
 *
 *   Searches an array of objects by key, for the index of value.
 *   Example: [{name:"John"},{name:"Jane"}].indexByKey('name',"Jane")
 *    - The following example would return an index of: 1
 *
 *
 * Array.prototype.sortByColumn = function(cA, cB) {};
 *
 *   Generally just designed to be used in LvMZ_Economy.js, but in short:
 *   This function sorts an array by its "column" (or indices) such as 
 *   the default use in LvMZ_Economy, Index 0(item type) and Index 1(ID)
 *   Example(LvMZ_Economy): shopGoods = shopGoods.sortByColumn(0,1);
 *
 *
 * Array.prototype.matches = function(array) {};
 *
 *   A better search function to match up arrays with various data inside.
 *   An example could be an event's List (array with objects, arrays, and 
 *   numbers). Array.prototype.equals isn't enough to handle that kind of 
 *   search.
 *    - This function is in combinatin with Object.prototype.matches.
 *
 * 
 * Object.prototype.matches = function(obj) {};
 *
 *   Similar to the Array.prototype.matches function, this one has a better
 *   search method for comparing two objects, but can also reference back to 
 *   Array.prototype.matches when the values are arrays.
 *
 *
 * function mergeData(source, target) {}
 *
 *   This merges numerical data by Key between two objects. A useful example
 *   would be merging party inventory (Item, Weapon, Armor) with another.
 *   Example:
 *     const items = {1:2};
 *     mergeData(items, {1:3, 2:1});
 *
 *     Result(items) = {1:5, 2:1};
 *
 *
 * function commonEventId(nameTag) {};
 *
 *   Searches and returns a Common Event ID if the "nameTag" was found.
 *   You can use a regular string or Regular Expression:
 *   Example: value = commonEventId("Game Over");
 *   Example: value = commonEventId(/GAME[ ]*OVER/i);
 *
 *
 * function itemGroup(type, id) {}
 *
 *   This function gets your database object based on TYPE and ID
 *   Example: item = itemGroup("Item", 5);
 *   Eaxmple: invalid = itemGroup("Variable", 1);
 *
 *
 * Game_Interpreter.prototype.actor = function(index=0) {};
 *
 *   Script call used in the event editor to get party leader or other.
 *   Index refers to the position of the actor in the party list, like:
 *   0..3 - or higher if max party limit is greater than the default 4.
 *   Example: this.actor();  (party leader since index is 0 by default)
 *
 *
 * -- MAP MANAGER --
 *
 * This class is to help load and use data from a map that you are not on.
 *
 * MapManager.loadMapData = function(mapId, callBack) {};
 *
 *   Load the map data from (mapId) and immediately call a function to do 
 *   something with that data (callBack). LvMZ_Core has - by default - 
 *   preloaded all map data to an array you can retrieve by calling:
 *     DataManager.map(mapId)
 *
 *   Example:
 *    MapManager.loadMapData(5, result => {
 *      for (const event of result.events.filter(ev => !!ev)) {
 *        console.log(event.name);
 *      }
 *    });
 *
 *
 * MapManager.event = function();
 *
 *   Retrieves the active event (call from the event manager).
 *
 *
 * MapManager.isTilePassable = function(x, y) {};
 *
 *   Checks the location tile if passable from at least ONE direction.
 *
 *
 * MapManager.simulateEvents = function(mapId) {};
 *
 *   Mainly used to obtain events from other maps to either change data 
 *   with, or to check certain data from those events that are only active
 *   when a Game_Event() object is created.
 *   - Compatible with my LvMZ_CustomEvents plugin!
 *   Example:
 *   const maps = $dataMapInfos
 *     .filter(obj => !!obj)
 *     .map(map => Number(map.id));
 *   for (const mapId of maps) {
 *     const list = DataManager.simulateEvents(mapId);
 *     for (const event of list) {
 *       console.log(event.name);
 *     }
 *   }
 *
 *
 * ===== LvPARAMS =====
 *
 * In short, this is the new plugin manager handler for cleaner code.
 * Example:
 * const pluginName = "LvMZ_Core";
 * const params = new LvParams(pluginName);
 * const aValueHere = params.value("paramId","num");
 *
 * Note: I setup pluginName separately to also use in plugin commands
 * PluginManager.registerCommand(pluginName, 'commandName', args => {});
 *
 * LvParams.prototype.value = function(key, type='') {};
 *   Available Types:
 *    - arr:  When the parameter is text split with ","
 *    - bool: When the parameter is a boolean type
 *    - eval: When the parameter is javascript code
 *    - jnum: When the parameter is an array with numbers to parse
 *    - json: When the parameter is an array with objects to parse
 *    - num:  When the parameter is a number
 *    - obj:  When the parameter is an object to parse
 *    - strL: When the parameter is a string to lowercase all
 *    - strU: When the parameter is a string to capitalize all
 *    - %:    When the parameter is a number with decimals
 *   default: Returns the parameter text unchanged
 *
 *
 * LvParams.prototype.hex = function(rgb, alpha) {};
 *
 *   When you want to return a hex formatted string (ie. #00ffff) with or 
 *   without an alpha channel.
 *   Example:
 *     const params = new LvParams("LvMZ_Core");
 *     const hex = params.hex("255,255,0", 0.5);
 *   Becomes: "#ffff007f"  (the '7f' being the alpha channel)
 *
 *
 * LvParams.prototype.rgb = function(key, alpha) {};
 *
 *   Pull the hex code(text) and convert it into an RPG Maker color format.
 *   Useful in Window classes.
 *   Example: 
 *     const params = new LvParams("LvMZ_Core");
 *     const color1 = params.rgb("#00ff00", 0.5);
 *   Becomes: "rgba(0, 200, 0, 0.5)"
 *
 *
 * LvParams.prototype.eval = function(text) {};
 *
 *   A useful function for taking a formula (text) and using certain tags
 *   to get a specific numerical value quickly.
 *   Example Uses:
 *     const params = new LvParams("LvMZ_Core");
 *     const randomValue = params.eval("random: 1-100");
 *     const actorId = params.eval("\a[1]");
 *     const variable = params.eval("\v[5]");
 *     const other = params.eval("$gameActors.actor(\a[1]).atk + 10");
 *
 *
 * LvParams.prototype.loadBGMData = function(key) {};
 * LvParams.prototype.loadSFXData = function(key, addDelay=false) {};
 *
 *    These two functions are plugin dependent, if you are loading any of 
 *    thsoe types of values. They parse the data into a nice Sound Effect
 *    object.
 *
 *
 * LvParams.prototype.validEventId = function(x, y) {};
 *
 *   Retrieves list of events (if any) that have not been erased from that 
 *   location (x,y).
 *
 * LvParams.prototype.targetFromPos = function(x, y, create=false) {};
 * 
 *   Retrieves the player or event at the position. If LvMZ_CustomEvents 
 *   is loaded, you can set "create" to TRUE and if nothing found at that 
 *   location, it will create a blank event for you.
 *
 *
 * ===== LV (class) =====
 *
 * This class is primarily for data handling such as loading plugin info,
 * loading, checking, or saving for data files (.json), and also has the 
 * debugging functions or checking an object/event's note tags and an 
 * event's comments for specific regular expressions.
 *
 * Going to just shorthand these notes on which ones are free to try
 * without much worry about breaking anything:
 *  - Lv.plugin(pluginName) = gets LV plugin info (name, desc, version)
 *  - Lv.debug(id, text, wait=60) = already went over this one
 *  - Lv.checkTag(object, noteTag) = RegExp check for database object
 *  - Lv.checkComment(event, noteTag) = RegExp check for events
 * 
 * These are JSON file handlers (load and run callBack function, or Save)
 *  - Lv.loadDataFile(src, callBack, fileDir='data/')
 *  - Lv.saveDataFile(fileNameExt, object, fileDir='data/')
 * 
 * Check if a file exists before doing something
 *  -  Lv.fileExists(fileNameExt, fileDir='data/')
 * 
 *
 * ===== LOCAL FUNCTIONS =====
 *
 * DataManager.map = function(mapId) {};
 *
 *   Loads the preloaded map data within DataManager
 *
 *
 * Game_Temp.prototype.random = function(value1, value2) {};
 *
 *   Get a random number between the two values.
 *
 *
 * Game_Message.prototype.joinString = function(text) {};
 *
 *   Combines a lowercase string with no spaces.
 *
 *
 * Game_Actors.prototype.clear = function(value) {};
 *
 *   Value(undefined): Clears all actor data
 *   Value(array): Removes actor data from a list
 *   Value(number): Removes a single actor data by ID
 *
 *
 * Game_Player.prototype.frontX = function() {};
 * Game_Player.prototype.frontY = function() {};
 *
 *   Gets the tile's X/Y position in front of player.
 *
 *
 * Game_Player.prototype.extendActivate = function(length = 1) {};
 *
 *   Can be used to activate another event (length) away. Similar to how
 *   counters still activate the shopkeeper behind them, you can use this
 *   to activate something all the way across the map!
 *
 *
 * Game_Event.prototyep.name = function() {};
 *
 *   Checks for the event name, first by notetag, then comment, and finally
 *   loads it from the map data.
 *
 *
 * Game_Event.prototype.objectId = function(pageIndex = false) {};
 *
 *   Returns an array of event data. By default comes with the Map ID
 *   and Event ID. Set pageIndex to true to get the pageIndex as well.
 *
 *
 * ===== GLOBAL VARIABLES =====
 *
 * $advisor  (uses the Game_Advisor class)
 *  - setup(pluginName) = use IF calling new settings from another plugin
 *  - clear()           = wipe all advisor data (prep for manual settings?)
 *  - setName(name)
 *  - setFaceImage(name, index)
 *  - setBackground(background)
 *  - setPositionType(position)
 *  - setActive(bool)
 *  - speak(text)       = the MAIN function of this class
 *
 * $gameSelfVar (uses the Game_SelfVariables class)
 *  - value(key)        = [mapId, eventId, type, variableId]
 *    Type: "SelfVar" or "SelfSwitch"
 *  - setValue(key, value) = use key above, and an appropriate value
 *    "SelfVar" = numerical or string data
 *    "SelfSwitch" = true or false
 *  - clear()           = Wipes all data 
 * 
 * ----------------------------------------------------------------------------
 * Instructions
 * ----------------------------------------------------------------------------
 *
 *
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
 * v1.0 - Plugin complete!
 *
 * ----------------------------------------------------------------------------
 */
/*~struct~EquipItem:
 * @param actorId
 * @text Check Actor
 * @type actor
 * @desc The Database Actor ID to check when changing equips
 * @default 1
 *
 * @param type
 * @text Equip Type ID
 * @type number
 * @min 1
 * @max 9999
 * @desc This is the slot to check and re-equip
 * @default 4
 *
 * @param id
 * @text Equip Item
 * @type number
 * @min 1
 * @max 9999
 * @desc Database Weapon or Armor(by ID) to retrieve
 * Returns weapon if type = 1, else returns armor
 * @default 1
 */
/*~struct~BGM:
 * @param name
 * @type file
 * @dir audio/bgm/
 * @desc 
 * @default 
 *
 * @param pan
 * @type number
 * @min -100
 * @max 100
 * @desc 
 * @default 0
 *
 * @param pitch
 * @type number
 * @min 50
 * @max 150
 * @desc 
 * @default 100
 *
 * @param volume
 * @type number
 * @desc 
 * @default 90
 */
/*~struct~SFX:
 * @param name
 * @type file
 * @dir audio/bgm/
 * @desc 
 * @default 
 *
 * @param pan
 * @type number
 * @min -100
 * @max 100
 * @desc 
 * @default 0
 *
 * @param pitch
 * @type number
 * @min 50
 * @max 150
 * @desc 
 * @default 100
 *
 * @param volume
 * @type number
 * @desc 
 * @default 90
 *
 * @param delay
 * @type number
 * @desc Delay (in frames) before running the sound again. Having a 
 * low delay may cause issues. Reminder: ~60 frames = 1 second.
 * @default 120
 */

var LvMZ = {};
LvMZ.Core = {
	name: "LvMZ_Core",
	desc: "Core functionality and quality of life settings.",
	version: 1.0
};

// -- Global Variables
var $advisor = null;
var $gameSelfVar = null;

// ============================================================================
(() => {
'use strict';

const pluginName  = "LvMZ_Core";
const params      = new LvParams(pluginName);
const startDir    = params.value('startDir');
const debug       = params.value('debugMode','bool');
const skipTitle   = params.value('removeTitle','bool');
const permaDeath  = params.value('permaDeath','bool');
const maxLvCtrl   = params.value('maxLevelControl','bool');
const levelCap    = params.value('maxLevel','num');
const autoEquips  = params.value('autoEquip','json');
const dualWield	  = params.value('dualWielder','num');
const partyLimit  = params.value('usePartyLimit','bool');
const defSize     = params.value('partyLimit','num');
const useDirMove  = params.value('dirTurn','bool');
const useDirDelay = params.value('turnDelay','num');

/******************************************************************************
	plugin commands
******************************************************************************/
//PluginManager.registerCommand(pluginName, '', args => {});
PluginManager.registerCommand(pluginName, 'setLevel', args => {
	const actor = $gameActors.actor(Number(args.actorId));
	if (actor) actor.setMaxLevel(Number(args.value));
});

PluginManager.registerCommand(pluginName, 'setLimit', args => {
	$gameParty.setPartyLimit(Number(args.set));
});

PluginManager.registerCommand(pluginName, 'selfSwitch', args => {
	const mapId = Number(args.mapId);
	const eventId = Number(args.eventId);
	const key = [mapId, eventId, args.charId];
	const value = args.value.toLowerCase() === "true";
	$gameSelfSwitches.setValue(key, value);
});

PluginManager.registerCommand(pluginName, 'selfSwitchAll', args => {
	const mapId = Number(args.mapId);
	const value = args.value.toLowerCase() === "true";
	const list = MapManager.simulateEvents(mapId);
	for (const event of list) {
		let key = [mapId, event.id, args.charId];
		$gameSelfSwitches.setValue(key, value);
	}
});

PluginManager.registerCommand(pluginName, 'setAdvisor', args => {
	const value = args.value.toLowerCase() === "true";
	$advisor.setActive(value);
});

/******************************************************************************
	rmmz_managers.js
******************************************************************************/

// --- DATA MANAGER -----------------------------------------------------------
const dm_loadDB = DataManager.loadDatabase;
DataManager.loadDatabase = function() {
	dm_loadDB.call(this);
	this._preloadedMaps = [];
	const maps = $dataMapInfos.filter(obj => !!obj).map(map => Number(map.id));
	for (const mapId of maps) {
		MapManager.loadMapData(mapId, result => {
			this._preloadedMaps[mapId] = result;
		});
	}
};

const dataManager_create = DataManager.createGameObjects;
DataManager.createGameObjects = function() {
	$advisor = new Game_Advisor(pluginName);
	$gameSelfVar = new Game_SelfVariables();
	// --
	dataManager_create.call(this);
};

const dataManager_saveContents = DataManager.makeSaveContents;
DataManager.makeSaveContents = function() {
	const contents = dataManager_saveContents.call(this);
	contents.advisor = $advisor;
	contents.selfvar = $gameSelfVar;
	return contents;
};

const dataManager_extractContents = DataManager.extractSaveContents;
DataManager.extractSaveContents = function(contents) {
	dataManager_extractContents.call(this, contents);
	$advisor = contents.advisor;
	$gameSelfVar = contents.selfvar;
};

DataManager.map = function(mapId) {
	return this._preloadedMaps[mapId] || MapManager.makeEmptyMap();
};


// --- BATTLE MANAGER ---------------------------------------------------------
const bm_updateBattleEnd = BattleManager.updateBattleEnd
BattleManager.updateBattleEnd = function() {
	this.checkPermaDeath();
	const deathEvent = commonEventId(/GAME[\-_ ]*OVER/i);
	if (!this._escaped && $gameParty.isAllDead() && deathEvent > 0) {
		$gameTemp.reserveCommonEvent(deathEvent);
		this._phase = "";
	} else {
		bm_updateBattleEnd.call(this);
	}
};

BattleManager.checkPermaDeath = function() {
	if (this.isBattleTest() || this._canLose) return;
	const members = $gameParty.battleMembers().filter(member => member.isDead());
	for (const battler of members) {
		const actor = battler.actor();
		// Immortals revive automatically
		if (actor.meta.Immortal) { battler.setHp(1); continue; }
		// Number of Lives before truly dead
		if (actor._numOfLives > 0) {
				actor._numOfLives--;
				battler.setHp(1); // revive
				continue;
			}
		}
		// All others will be permanently removed from the party
		$gameParty.removeActor(battler.actorId());
	}
};


// --- SCENE MANAGER ----------------------------------------------------------
const sm_updateMain = SceneManager.updateMain;
SceneManager.updateMain = function() {
	sm_updateMain.call(this);
	if (debug) Lv.update();
};

/******************************************************************************
	rmmz_objects.js
******************************************************************************/
// --- GAME TEMP --------------------------------------------------------------
Game_Temp.prototype.random = function(value1, value2) {
	const min = Math.ceil(Number(value1));
	const max = Math.floor(Number(value2));
	return ~~(Math.random() * (max - min + 1) + min);
};


// --- GAME VARIABLES ---------------------------------------------------------
const gameVar_value = Game_Variables.prototype.value;
Game_Variables.prototype.value = function(variableId) {
	const name = $dataSystem.variables[variableId];
	if (name.match(/<SELF[: >]*/i)) {
		const mapId = $gameMap.mapId();
		const eventId = $gameMap._interpreter.eventId();
		const key = [mapId, eventId, "SelfVar", variableId];
		return $gameSelfVar.value(key);
	} else if (name.match(/JS:[ ]?(.*)/i)) {
		return eval(RegExp.$1);
	}
	return gameVar_value.call(this, variableId);
};
	
const gameVar_setValue = Game_Variables.prototype.setValue;
Game_Variables.prototype.setValue = function(variableId, value) {
	const name = $dataSystem.variables[variableId];
	if (name.match(/<SELF[: >]*/i)) {
		const mapId = $gameMap.mapId();
		const eventId = $gameMap._interpreter.eventId();
		const key = [mapId, eventId, "SelfVar", variableId];
		$gameSelfVar.setValue(key, value);
	} else {
		gameVar_setValue.call(this, variableId, value);
	}
};


// --- GAME SWITCHES ----------------------------------------------------------
const gameSw_value = Game_Switches.prototype.value;
Game_Switches.prototype.value = function(switchId) {
	const name = $dataSystem.switches[switchId];
	if (name.match(/<SELF[: >]*/i)) {
		const mapId = $gameMap.mapId();
		const eventId = $gameMap._interpreter.eventId();
		const key = [mapId, eventId, "SelfSwitch", switchId];
		return $gameSelfVar.value(key);
	} else if (name.match(/JS:[ ]?(.*)/i)) {
		return !!eval(RegExp.$1);
	}
	return gameSw_value.call(this, switchId);
};

const gameSw_setValue = Game_Switches.prototype.setValue;
Game_Switches.prototype.setValue = function(switchId, value) {
	const name = $dataSystem.switches[switchId];
	if (name.match(/<SELF[: >]*/i)) {
		const mapId = $gameMap.mapId();
		const eventId = $gameMap._interpreter.eventId();
		const key = [mapId, eventId, "SelfSwitch", switchId];
		$gameSelfVar.setValue(key, value);
	} else {
		gameSw_setValue.call(this, switchId, value);
	}
};


// --- GAME ITEM --------------------------------------------------------------
Game_Item.prototype.allTraits = function() {
	return this.object() ? this.object().traits || [] : [];
};

Game_Item.prototype.traits = function(code) {
    return this.allTraits().filter(trait => trait.code === code);
};

Game_Item.prototype.traitsWithId = function(code, id) {
    return this.allTraits().filter(
        trait => trait.code === code && trait.dataId === id
    );
};


// --- GAME MESSAGE -----------------------------------------------------------
Game_Message.prototype.joinString = function(text) {
	return text.replace(/[\r\n ]+/g, '').toLowerCase();
};


// --- GAME ACTORS ------------------------------------------------------------
Game_Actors.prototype.clear = function(value) {
	if (value === undefined) { 
		// Remove - All
		this._data = [];
	} else if (typeof value === "number" && value > 0) {
		// Remove - Single actorId
		this._data.remove(value);
	} else if (Array.isArray(value)) {
		// Remove - List of actor IDs
		for (const actorId of value) {
			this._data.remove(actorId);
		}
	}
};


// --- GAME ACTOR -------------------------------------------------------------
const gameActor_setup = Game_Actor.prototype.setup;
Game_Actor.prototype.setup = function(actorId) {
	gameActor_setup.call(this, actorId);
	if (Lv.checkTag(this.actor(), /<LIVES[: ]+(\d+)>/i;)) {
		this._numOfLives = Math.max(0, Number(RegExp.$1));
	} else {
		this._numOfLives = 0;
	}
};

const gameActor_changeEquip = Game_Actor.prototype.changeEquip;
Game_Actor.prototype.changeEquip = function(slotId, item) {
	const oldItem = this.equips()[slotId];
	const autoItem = this.autoEquipItem(slotId);
	gameActor_changeEquip.call(this, slotId, item);
	if (dualWield > 0) {
		this.twoHandedCheck(oldItem, slotId, item);
	}
	if (oldItem && autoItem) {
		if (!this.equips()[slotId]) { // unequip
			if (oldItem != autoItem) $gameParty.gainItem(autoItem, 1);
			this.changeEquip(slotId, autoItem);
		} else { // swapping equips
			$gameParty.loseItem(oldItem, 1);
		}
	}
};

Game_Actor.prototype.twoHandedCheck = function(oldItem, slotId, newItem) {
	if (!this.equips()[slotId]) {
		// Re-add the Two Weapon Fighting state|trait
		if (this.weapon2H(oldItem) && !!this._dualWielder) {
			this._dualWielder = false;
			this.addState(dualWield);
		}
	} else {
		// Two Handed Weapons: If a 2h weapon is equipped, 
		// we remove Dual Wielder (if applicable)
		if (this.weapon2H(newItem)) {
			if (this.isStateAffected(dualWield)) {
				// Allows re-equip of the Two Weapon Fighting state after no 
				// longer wielding a Two Handed Weapon!
				this._dualWielder = true;
			}
			this.removeState(dualWield);
		} else if (!!this._dualWielder) {
			// If equipping a normal weapon, we can re-add the state|trait
			this._dualWielder = false;
			this.addState(dualWield);
		}
	}
};

Game_Actor.prototype.weapon2H = function(item) {
	return (
		item && DataManager.isWeapon(item) &&
		Lv.checkTag(item, /<TWO[\-_ ]*HANDED>/i)
	);
};

Game_Actor.prototype.autoEquipItem = function(slotId) {
	const etypeId = this.equipSlots()[slotId];
	const equips = autoEquips.filter(e => 
		Number(e.actorId) === this._actorId && 
		Number(e.type) === etypeId
	)[0];
	return equips 
		? etypeId === 1 
		? $dataWeapons[equips.id] 
		: $dataArmors[equips.id] 
		: null;
};

// ===========================================================================
//  * Max Level Control 

// Alias - Add on our data to the default setup
const gameActor_setup = Game_Actor.prototype.setup;
Game_Actor.prototype.setup = function(actorId) {
	gameActor_setup.call(this, actorId);
	this._maxLevel = maxLvCtrl ? levelCap : undefined;
};

// Alias - 
const gameActor_maxLevel = Game_Actor.prototype.maxLevel;
Game_Actor.prototype.maxLevel = function() {
	return maxLvCtrl ? this._maxLevel : gameActor_maxLevel.call(this);
};

// New - Control what max level it should be (min: 1)
Game_Actor.prototype.setMaxLevel = function(value) {
	this._maxLevel = maxLvCtrl ? Math.max(1, value) : undefined;
};
// ===========================================================================

// --- GAME PARTY ---
const gameParty_init = Game_Party.prototype.initialize;
Game_Party.prototype.initialize = function() {
	gameParty_init.call(this);
	this.setPartyLimit(defSize);
};

const gameParty_maxBattleMembers = Game_Party.prototype.maxBattleMembers;
Game_Party.prototype.maxBattleMembers = function() {
	const callback = gameParty_maxBattleMembers.call(this);
	return this._partySizeLimit || callback;
};

Game_Party.prototype.setPartyLimit = function(value) {
	this._partySizeLimit = (partyLimit && !Imported['VisuMZ_2_PartySystem']) ? value : 0;
};

const gameParty_highestLevel = Game_Party.prototype.highestLevel;
Game_Party.prototype.highestLevel = function(allMembers = true) {
	if (allMembers) return gameParty_highestLevel.call(this);
	return Math.max(...this.battleMembers().map(actor => actor.level));
};

Game_Party.prototype.averageLevel = function(allMembers = true) {
	const members = allMembers ? this.members() : this.battleMembers();
	const levels = members.map(actor => actor.level);
	return levels.reduce((a,b) => a + b, 0) / levels.length;
};

Game_Party.prototype.lowestLevel = function(allMembers = true) {
	const members = allMembers ? this.members() : this.battleMembers();
	return Math.min(...members.map(actor => actor.level));
};


// --- GAME PLAYER ------------------------------------------------------------
const gamePlayer_init = Game_Player.prototype.initialize;
Game_Player.prototype.initialize = function() {
	gamePlayer_init.call(this);
	this._turnCount = 0;
};

const gamePlayer_setupForNewGame = Game_Player.prototype.setupForNewGame;
Game_Player.prototype.setupForNewGame = function() {
	gamePlayer_setupForNewGame.call(this);
	// Override new direction
	switch (startDir) {
		case "Down":  this._newDirection = 2; break;
		case "Left":  this._newDirection = 4; break;
		case "Right": this._newDirection = 6; break;
		case "Up":    this._newDirection = 8; break;
	}
};

const gamePlayer_moveByInput = Game_Player.prototype.moveByInput;
Game_Player.prototype.moveByInput = function() {
	if (useDirMove && this._turnCount > 0) {
		this._turnCount--;
	} else {
		gamePlayer_moveByInput.call(this);
	}
};

const gamePlayer_execMove = Game_Player.prototype.executeMove;
Game_Player.prototype.executeMove = function(direction) {
	if (!this.executeTurn(direction)) {
		gamePlayer_execMove.call(this, direction);
	}
};

Game_Player.prototype.executeTurn = function(direction) {
	if (!this.isMoving() && this.canMove() && useDirMove && this.direction() !== direction) {
		this.setDirection(direction);
		this._turnCount = useDirDelay;
		return true;
	}
	return false;
};

Game_Player.prototype.frontX = function() {
	return $gameMap.roundXWithDirection(this.x, this._direction);
};

Game_Player.prototype.frontY = function() {
	return $gameMap.roundYWithDirection(this.y, this._direction)
};

Game_Player.prototype.extendActivate = function(length = 1) {
	if (this.canStartLocalEvents()) {
		const d = this.direction();
		let x = $gameMap.roundXWithDirection(this.x, d);
		let y = $gameMap.roundYWithDirection(this.y, d);
		while (--length >= 0) {
			// Failsafe (check if out of bounds)
			let x1 = $gameMap.roundXWithDirection(x, d);
			let y1 = $gameMap.roundYWithDirection(y, d);
			if (!$gameMap.isValid(x1, y1)) {
				if ($gameTemp.isPlaytest()) {
					console.log("ERROR: Out of Bounds! $gamePlayer.extendActivate");
					console.log(" - X: " + x1 + " , Y: " + y1 + " , Length: " + length);
					console.log(" - Returning previous position: " + x + "," + y);
				}
				break;
			}
			x = x1;
			y = y1;
		}
		this.startMapEvent(x, y, [0,1,2], true);
	}
};


// --- GAME EVENT -------------------------------------------------------------
Game_Event.prototype.name = function() {
	const tag = /<NAME[: ]+([A-Z]+)>/i;
	if (Lv.checkTag(this.event(), tag)) return RegExp.$1;
	if (Lv.checkComment(this, tag)) return RegExp.$1;
	return this.event().name;
};

Game_Event.prototype.objectId = function(pageIndex = false) {
	const value = [this._mapId, this._eventId];
	if (includePage) value.push(this._pageIndex);
	return value;
};


// --- GAME INTERPRETER -------------------------------------------------------
// Game Over
const gameIntr_gameOver = Game_Interpreter.prototype.command353;
Game_Interpreter.prototype.command353 = function() {
	const deathEvent = commonEventId(/GAME[\-_ ]*OVER/i);
	if (deathEvent > 0) {
		$gameTemp.reserveCommonEvent(deathEvent);
		return true;
	}
	return gameIntr_gameOver.call(this);
};

// Return to Title Screen
const gameIntr_command354 = Game_Interpreter.prototype.command354;
Game_Interpreter.prototype.command354 = function() {
	if (skipTitle) {
		SceneManager._scene.fadeOutAll();
		DataManager.setupNewGame();
		SceneManager.goto(Scene_Map);
		return true;
	}
	return gameIntr_command354.call(this);
};

/******************************************************************************
	rmmv_scenes.js
******************************************************************************/

// --- SCENE BASE -------------------------------------------------------------
// Alias - Ran through a common event (map transfer)
const sceneBase_checkGameover = Scene_Base.prototype.checkGameover;
Scene_Base.prototype.checkGameover = function() {
	const deathEvent = commonEventId(/GAME[\-_ ]*OVER/i);
    if ($gameParty.isAllDead() && deathEvent > 0) {
        $gameTemp.reserveCommonEvent(deathEvent);
    } else {
		sceneBase_checkGameover.call(this);
	}
};


// --- SCENE BOOT -------------------------------------------------------------
const sceneBoot_startNormalGame = Scene_Boot.prototype.startNormalGame;
Scene_Boot.prototype.startNormalGame = function() {
	if (skipTitle) {
		this.checkPlayerLocation();
		DataManager.setupNewGame();
		SceneManager.goto(Scene_Map);
	} else {
		sceneBoot_startNormalGame.call(this);
	}
};


// --- SCENE GAME_END ---------------------------------------------------------
const sceneGameEnd_commandToTitle = Scene_GameEnd.prototype.commandToTitle;
Scene_GameEnd.prototype.commandToTitle = function() {
	if (skipTitle) {
		this.fadeOutAll();
		DataManager.setupNewGame();
		SceneManager.goto(Scene_Map);
	} else {
		sceneGameEnd_commandToTitle.call(this);
	}
};


// --- SCENE GAMEOVER ---------------------------------------------------------
const sceneGameOver_gotoTitle = Scene_Gameover.prototype.gotoTitle;
Scene_Gameover.prototype.gotoTitle = function() {
	if (skipTitle) {
		this.fadeOutAll();
		DataManager.setupNewGame();
		SceneManager.goto(Scene_Map);
	} else {
		sceneGameOver_gotoTitle.call(this);
	}
};

})();

/******************************************************************************
	Custom-Public Classes
******************************************************************************/

//-----------------------------------------------------------------------------
// LvMZ_RemoteEvent
//
// Used to create a Game_Event loading data from another map.

function LvMZ_RemoteEvent() {
	this.initialize(...arguments);
}

LvMZ_RemoteEvent.prototype = Object.create(Game_Event.prototype);
LvMZ_RemoteEvent.prototype.constructor = LvMZ_RemoteEvent;

LvMZ_RemoteEvent.prototype.initialize = function(mapId, eventId) {
	Game_Character.prototype.initialize.call(this);
    this._mapId = mapId;
    this._eventId = eventId;
	this.locate(-1, -1);
	this.refresh();
};

LvMZ_RemoteEvent.prototype.event = function() {
	return DataManager.map(this._mapId).events[this._eventId];
};

LvMZ_RemoteEvent.prototype.refresh = function() {
	this._pageIndex = this._erased ? -1 : this.findProperPageIndex();
};


// --- GAME ADVISOR -----------------------------------------------------------
function Game_Advisor() {
	this.initialize(...arguments);
}

Object.defineProperties(Game_Advisor.prototype, {
	name: {
		get: function() {
			return this._speakerName;
		}, configurable: true
	},
	face: {
		get: function() {
			return this._faceName;
		}, configurable: true
	},
	index: {
		get: function() {
			return this._faceIndex;
		}, configurable: true
	},
	bg: {
		get: function() {
			return this._background;
		}, configurable: true
	},
	pos: {
		get: function() {
			return this._positionType;
		}, configurable: true
	},
	active: {
		get: function() {
			return this._active;
		}, configurable: true
	}
});

Game_Advisor.prototype.initialize = function(pluginName) {
	if (pluginName) {
		this.setup(pluginName);
	} else {
		this.clear();
	}
};

Game_Advisor.prototype.clear = function() {
	this._speakerName  = "";
	this._faceName     = "";
	this._faceIndex    = 0;
	this._background   = 0;
	this._positionType = 2;
	this._active       = false;
};

Game_Advisor.prototype.setup = function(pluginName) {
	const params       = new LvParams(pluginName);
	this._speakerName  = params.value('advisorName');
	this._faceName     = params.value('advisorFace');
	this._faceIndex    = params.value('advisorIndex','num');
	this._background   = params.value('msgBg','num');
	this._positionType = params.value('msgPos','num');
	this._active       = params.value('useAdvisor','bool');
};

Game_Advisor.prototype.setName = function(name) {
	this._speakerName = name;
};

Game_Advisor.prototype.setFaceImage = function(name, index) {
	this._faceName = name;
	this._faceIndex = index;
};

Game_Advisor.prototype.setBackground = function(background) {
	this._background = background;
};

Game_Advisor.prototype.setPositionType = function(position) {
	this._positionType = position;
};

Game_Advisor.prototype.setActive = function(value) {
	this._active = Boolean(value);
};

Game_Advisor.prototype.speak = function(text) {
	if (!this._active) return;
	$gameMessage.newPage();
	$gameMessage.setSpeakerName(this._speakerName);
	$gameMessage.setFaceImage(this._faceName, this._faceIndex);
	$gameMessage.setBackground(this._background);
	$gameMessage.setPositionType(this._positionType);
	$gameMessage.add(text);
};


// --- GAME SELF_VARIABLE -----------------------------------------------------
function Game_SelfVariables() {
	this.initialize(...arguments);
}

Game_SelfVariables.prototype.initialize = function() {
    this.clear();
};

Game_SelfVariables.prototype.clear = function() {
    this._data = {};
};

Game_SelfVariables.prototype.value = function(key) {
	// - We really just need a length of 3 (to get the TYPE)
	// - Example: [mapId, eventId, "SelfVar", variableId]
	// - variableId makes the Key more unique (but optional)
	const type = (key[2] || "").toLowerCase();
	switch (type) {
		case "selfvar":    return this._data[key] || 0;
		case "selfswitch": return !!this._data[key];
	}
	return undefined;
};

Game_SelfVariables.prototype.setValue = function(key, value) {
	if (typeof key === "string") key = key.split(","); // failsafe
	if (!Array.isArray(key) || key.length < 3) return;
	switch (key[2].toLowerCase()) {
		case "selfvar":
			if (typeof value === "number") {
				value = Math.floor(value);
			}
			this._data[key] = value;
			break;
		case "selfswitch":
			if (value) {
				this._data[key] = true;
			} else {
				delete this._data[key];
			}
			break;
    }
	this.onChange();
};

Game_SelfVariables.prototype.onChange = function() {
	$gameMap.requestRefresh();
};