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
 * @help
 * ----------------------------------------------------------------------------
 * Instructions
 * ----------------------------------------------------------------------------
 *
 * Have an event that you want to be the "activator" have a comment tag:
 * <Activate: Touch>
 *  exactly like that.. spaces and all!
 *
 * Any event of normal priority that it touches with a trigger other than 
 * AUTORUN or PARALLEL, will automatically run its page!
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

Game_Event.prototype.moveStraight = function(d) {
	Game_Character.prototype.moveStraight.call(this, d);
	if (this.isEventTouched() && this.touchActive()) {
		const x = $gameMap.roundXWithDirection(this.x, d);
		const y = $gameMap.roundYWithDirection(this.y, d);
		this.startMapEvent(x, y, [0,1,2], true);
	}
};

Game_Event.prototype.isEventTouched = function() {
	const d = this._direction;
	const x = $gameMap.roundXWithDirection(this.x, d);
    const y = $gameMap.roundYWithDirection(this.y, d);
	return this.isCollidedWithEvents(x, y);
};

Game_Event.prototype.touchActive = function() {
	if (!this.page()) return;
	const tag = /<ACTIVATE:[ ]TOUCH>/i;
	for (const ev of this.list()) {
		if ([108,408].contains(ev.code)) {
			let note = ev.parameters[0];
			if (note.match(tag)) return true;
		}
	}
	return false;
};

Game_Event.prototype.startMapEvent = function(x, y, triggers, normal) {
	for (const event of $gameMap.eventsXy(x, y)) {
		if (
			event.isTriggerIn(triggers) &&
			event.isNormalPriority() === normal
		) {
			event.start();
		}
	}
};

// -- For Debugging --
Game_Player.prototype.getFront = function() {
	const d = this._direction;
	const x = $gameMap.roundXWithDirection(this.x, d);
	const y = $gameMap.roundYWithDirection(this.y, d);
	return $gameMap.eventsXyNt(x, y);
};

})();
