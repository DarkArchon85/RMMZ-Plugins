// ============================================================================
//  LordValinar Plugin - Kill Quest Tracker
//  LvMZ_KillQuests.js
// ============================================================================

var Imported = Imported || {};
Imported["LvMZKillQuests"] = true;

/*:
 * @target MZ
 * @plugindesc [v1.0] Variable based kill quest progression system
 * @author LordValinar
 * @url https://github.com/DarkArchon85/RMMZ-Plugins
 *
 * @help
 * ----------------------------------------------------------------------------
 * Instructions
 * ----------------------------------------------------------------------------
 *
 * Place the following tag in an enemy's note field that you want to 
 * go towards your kill quest tracker. When an enemy with this tag dies,
 * a common event will run (where you can customize to your heart's content).
 * "KQS" is not case sensitive.
 *
 *   <KQS: eventId>
 *   -> eventId: The common event to run if the enemy dies.
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

const gameBattlerBase_die = Game_BattlerBase.prototype.die;
Game_BattlerBase.prototype.die = function() {
	gameBattlerBase_die.call(this);
	if (this.isEnemy()) {
		const tag = /<KQS:\s(\d+)>/i;
		const data = this.enemy().note.split(/[\r\n]+/);
		for (const meta of data) {
			if (meta.match(tag)) {
				let eventId = Number(RegExp.$1);
				$gameTemp.reserveCommonEvent(eventId);
			}
		}		
	}
};

})();