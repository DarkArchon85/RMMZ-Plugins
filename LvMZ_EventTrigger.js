// ============================================================================
//  LordValinar Plugin - Event Trigger Check
//  LvMZ_EventTrigger.js
// ============================================================================

var Imported = Imported || {};
Imported["LvMZEventTrigger"] = true;

/*:
 * @target MZ
 * @plugindesc [v1.0] Plugin to have events detect if they run into other events.
 * @author LordValinar
 * @url https://github.com/DarkArchon85/RMMZ-Plugins
 *
 * @param moveCont
 * @text Continue Move Route
 * @type struct<Route>[]
 * @desc Once the event stops, you can have it do something
 * else again by way of self switch, switch, or variable.
 * @default []
 *
 * @help
 * ----------------------------------------------------------------------------
 * Instructions
 * ----------------------------------------------------------------------------
 *
 * There will be 2 types of events:
 *  -> The "Activator" and the "Triggered"
 *
 * Have an event that you want to be the "activator", have either a 
 * notetag (always active) or a comment tag (active page only):
 * <Activate: Touch>
 *  ( not case-sensitive and space not required )
 *
 * Any Triggered event of normal priority that the Activator touches
 * with a trigger other than AUTORUN or PARALLEL, will automatically 
 * run the Triggered's page!
 *
 * >> Continue Move Route Params
 * Although the parameters are straight forward, keep in mind that 
 * the variable values ADDs to the current value (so setting this 
 * to a negative number will still subtract the original value).
 *   ex: variable(1) value(5) +(ADD) newValue(-10) = -5
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
 * v1.0 - Plugin finished!
 *
 * ----------------------------------------------------------------------------
 */
/*~struct~Route:
 * @param type
 * @text Trigger Type
 * @type select
 * @option None
 * @option Self Switch
 * @option Switch
 * @option Variable
 * @desc The triggering type
 * @default None
 *
 * @param id
 * @text Trigger ID
 * @desc SelfSw{string} A,B,C,D 
 * Switch/Var{number} 1-5000
 * @default 
 *
 * @param value
 * @text Trigger Value
 * @desc SelfSw/Switch{boolean} true,false
 * Variable{number} -99999999 to 99999999
 */

(() => {
'use strict';

const pluginName = "LvMZ_EventTrigger";
const lvParams = PluginManager.parameters(pluginName);
const moveCont = JSON.parse(lvParams['moveCont']).map(e => JSON.parse(e));
const vMax = 99999999; // For variables

function evalVar(formula) {
	try {
		// First replace any variable shorthands (ie \v[1])
		let regex = /\\v\[(\d+)\]/gi;
		formula = formula.replace(regex, (_, p1) =>
			$gameVariables.value(parseInt(p1))
		);
		const value = Math.max(eval(formula), 0);
        return isNaN(value) ? 0 : value;
	} catch(e) {
		return 0;
	}
}

// === GAME EVENT =============================================================
Game_Event.prototype.checkEventTriggerTouch = function(x, y) {
	if (this.touchActive()) {
		this.startMapEvent(x, y, [0,1,2], true);
		this.processRouteEnd();
		this.processNextAction();
	}
};

Game_Event.prototype.processNextAction = function() {
	let id, value;
	for (const action of moveCont) {
		switch (action.type) {
			case "Self Switch": {
				id = action.id.toUpperCase();
				value = action.value.toLowerCase() === "true";
				let key = [this._mapId, this._eventId, id];
				$gameSelfSwitches.setValue(key, value);
			} break;
			case "Switch": {
				id = Number(action.id).clamp(1, 5000);
				value = action.value.toLowerCase() === "true";
				$gameSwitches.setValue(id, value);
			} break;
			case "Variable": {
				id = Number(action.id).clamp(1, 5000);
				let newVal = $gameVariables.value(id) + evalVar(action.value);
				value = newVal.clamp(-1 * vMax, vMax);
				$gameVariables.setValue(id, value);
			} break;
		}
	}
};

Game_Event.prototype.touchActive = function() {
	const tag = /<ACTIVATE:[ ]*TOUCH>/i;
	// Notetag check (event wide)
	if (this.event().note.match(tag)) return true;
	// Comment tag check (active page only)
	for (const ev of this.list()) {
		if ([108,408].contains(ev.code)) {
			const note = ev.parameters[0];
			if (note.match(tag)) return true;
		}
	}
	return false;
};

Game_Event.prototype.startMapEvent = function(x, y, triggers, normal) {
	if (!$gameMap.isEventRunning()) {
        for (const event of $gameMap.eventsXy(x, y)) {
            if (
                event.isTriggerIn(triggers) &&
                event.isNormalPriority() === normal
            ) {
                event.start();
            }
        }
    }
};

})();
