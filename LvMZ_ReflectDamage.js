// ============================================================================
//  LordValinar Plugin - Reflect Damage State
//  LvMZ_ReflectDamage.js
// ============================================================================

var Imported = Imported || {};
Imported["LvMZ_ReflectDamage"] = true;

// Only the essentials:
if (!Imported["LvMZ_Core"]) {
	/**
	* Formats a percentile number to remove all trails
	*
	* @memberof JsExtensions
	* @returns {number} A formatted number
	*/
	Number.prototype.percent = function() {
		return Number(this.toFixed(2)).clamp(-1,1);
	};
}

/*:
 * @target MZ
 * @plugindesc [v1.0] Specific states can reflect a certain amount of damage back at your attackers
 * @author LordValinar
 * @url https://github.com/DarkArchon85/RMMZ-Plugins
 *
 * @param states
 * @text State ID List
 * @type number[]
 * @desc List of State IDs that include the reflect note tags
 * @default []
 * 
 * @help
 * ----------------------------------------------------------------------------
 * Instructions
 * ----------------------------------------------------------------------------
 *
 * Create a state that will reflect damage when applied to a battler. Give
 * that state the following notetag:
 *  <reflect:formula>
 * 
 * The formula can be a simple number (ie: <reflect:50>) or a more complicated
 * line of code (ie: <reflect:5 * \v[2] - 1>)
 * v[#] will obtain the variable value of that variableID(#).
 * a.<param> will get the attacker's parameter (atk, def, mat, mdf, agi, luk)
 * b.<param> will get the defender's parameter (atk, def, mat, mdf, agi, luk)
 * Example: <reflect:Math.floor((b.mdf-10) / 2)>
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

const pluginName = 'LvMZ_ReflectDamage';
const lvParams = PluginManager.parameters(pluginName);
const stateList = JSON.parse(lvParams['states']).map(id => Number(id));

const gameAction_hpDmg = Game_Action.prototype.executeHpDamage;
Game_Action.prototype.executeHpDamage = function(target, value) {
	gameAction_hpDmg.call(this, target, value);
	// Does target have a reflect type state?
	const user = this.subject();
	for (const stateId of stateList) {
		const state = $dataStates[stateId];
		if (!target.isStateAffected(stateId)) continue;
		if (!state.meta.reflect) continue;
		// It is -> grab the percent reflection rate
		let rate = this.damageReflectionRate(target, state, value);
		// Now inflict this damage upon the user
		user.gainHp(-rate);
		if (value > 0) {
			user.onDamage(rate);
		}
	}
};

Game_Action.prototype.damageReflectionRate = function(target, state, value) {
	try {
		// convert formula values
		let formula = state.meta.reflect;
		const a = this.subject(); // eslint-disable-line no-unused-vars
        const b = target; // eslint-disable-line no-unused-vars
		const v = $gameVariables._data; // eslint-disable-line no-unused-vars
		// get the damage percentage
        const trueValue = Math.floor((eval(formula) / 100).percent() * value);
        return isNaN(trueValue) ? 0 : trueValue;
	} catch(e) {
		return 0;
	}
}

})();