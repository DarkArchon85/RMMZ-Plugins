// ============================================================================
//  LordValinar Plugin - Event Attachments
//  LvMZ_LinkEvents.js
// ============================================================================

var Imported = Imported || {};
Imported["LvMZ_LinkEvents"] = true;

/*:
 * @target MZ
 * @plugindesc [v1.0] Control Switches and Erasures of the interactable event will also effect the linked event.
 * @author LordValinar
 * @url https://github.com/DarkArchon85/RMMZ-Plugins
 *
 * @help
 * ----------------------------------------------------------------------------
 * Instructions
 * ----------------------------------------------------------------------------
 *
 * Setup a comment with the following notetag to link it to another 
 * event (example: Event001 as the bottom of a tree, interactable while 
 * Event002 as the top of the tree (top layer).
 *
 *   <eventLink: 2>
 *
 * That's it! Whenever you flip a control switch for Event001, or 
 * erase Event001, then that will effect Event002 as well!
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

const pluginName = 'LvMZ_LinkEvents';
const lvParams = PluginManager.parameters(pluginName);

/******************************************************************************
	rmmv_objects.js
******************************************************************************/

Game_Event.prototype.eventLink = function() {
	if (this.page()) {
		const tag = /<EVENTLINK:\s(\d+)>/i;
		for (const ev of this.list()) {
			if ([108,408].contains(ev.code)) {
				let note = ev.parameters[0];
				if (note.match(tag)) {
					return Number(RegExp.$1);
				}
			}
		}
	}
	return 0;
};

// Control Self Switch
const gameIntr_ctrlSelfSwitch = Game_Interpreter.prototype.command123;
Game_Interpreter.prototype.command123 = function(params) {
	// checks if event is linked with another
    if (this._eventId > 0) {
		const event = $gameMap.event(this._eventId);
		const linkId = event.eventLink();
		if (linkId > 0) {
			const key = [this._mapId, linkId, params[0]];
			$gameSelfSwitches.setValue(key, params[1] === 0);
		}
    }
    return gameIntr_ctrlSelfSwitch.call(this, params);
};

// Erase Event
const gameIntr_erase = Game_Interpreter.prototype.command214;
Game_Interpreter.prototype.command214 = function() {
    if (this.isOnCurrentMap() && this._eventId > 0) {
		const event = $gameMap.event(this._eventId);
		const linkId = event.eventLink();
		if (linkId > 0) $gameMap.eraseEvent(linkId);
    }
	return gameIntr_erase.call(this);
};

})();