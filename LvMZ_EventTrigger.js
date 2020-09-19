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
 * @ --------------------------------------------------------------------------
 *
 * @help
 * ----------------------------------------------------------------------------
 * Instructions
 * ----------------------------------------------------------------------------
 *
 * Have an event with a parallel page to detect if:
 *   this.eventTouch()
 *
 * If it returns "true" then it will do what you want it to.
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

(() => {
'use strict';

Game_Interpreter.prototype.eventTouch = function() {
	const ev = $gameMap.event(this._eventId);
	const x2 = $gameMap.roundXWithDirection(ev.x, ev._direction);
    const y2 = $gameMap.roundYWithDirection(ev.y, ev._direction);
	console.log("eventTouch:", ev.isCollidedWithEvents(x2, y2));
	return ev.isCollidedWithEvents(x2, y2);
};

})();