// ============================================================================
//  LordValinar Plugin - Auto NPC Faces
//  LvMZ_AutoFaces.js
// ============================================================================

var Imported = Imported || {};
Imported["LvMZAutoFaces"] = true;

/*:
 * @target MZ
 * @plugindesc [v1.0] 
 * @author LordValinar
 *
 * @help
 * ----------------------------------------------------------------------------
 * Instructions
 * ----------------------------------------------------------------------------
 *
 * Three factors determine if a message will display the event's proper face 
 * set and index.
 * 1.) The character name and index (ex: Actor1, index1 = Reid), so therefor 
 *     it will get name: Actor1, index: 1  (Reid's face)
 *
 * 2.) The event must use a plugin command (autoFace) to start or stop 
 *     the auto-assignments.
 *
 * 3.) When using Show Text command, the face image must be blank (none).
 *
 * That's it! Now no matter which character set you use, the proper face 
 * will display with it! (Setting up custom characters and faces will also 
 * need to match appropriately.
 *
 * ----------------------------------------------------------------------------
 * Terms of Use
 * ----------------------------------------------------------------------------
 *
 * Free to use commercial and noncommercial games, with credit.
 * Edits are for personal use only, or sent to me for updates to this plugin.
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
 *
 * @command autoFace
 * @text Auto Event Face
 * @desc Determines if all blank face messages will grab 
 * a face based on their character spritesheet.
 *
 * @arg value
 * @text Switch
 * @type boolean
 * @on Start Auto Face
 * @off Stop Auto Face
 * @desc 
 * @default false
 */

(() => {
'use strict';

const pluginName = 'LvMZ_AutoFaces';
PluginManager.registerCommand(pluginName, 'autoFace', args => {
	$gameMessage._autoFace = eval(args.value);
});

/******************************************************************************
	rmmv_objects.js
******************************************************************************/

// -- GAME MESSAGE --
const gameMsg_init = Game_Message.prototype.initialize;
Game_Message.prototype.initialize = function() {
	gameMsg_init.call(this);
	this._autoFace = false;
};

Game_Message.prototype.autoFace = function() {
	if ($gameMessage.faceName() !== '') return false;
	return this._autoFace;
};


// -- GAME INTERPRETER --
// Show Text
const gameIntr_cmd101 = Game_Interpreter.prototype.command101;
Game_Interpreter.prototype.command101 = function(params) {
	if ($gameMessage.isBusy()) return false;
	const result = gameIntr_cmd101.call(this, params);
	if (!$gameMessage.autoFace()) return result;
	const event = $gameMap.event(this._eventId);
	if (event.page()) {
		const evName = event.characterName();
		const evIndex = event.characterIndex();
		$gameMessage.setFaceImage(evName, evIndex);
	}
	return result;
};

})();