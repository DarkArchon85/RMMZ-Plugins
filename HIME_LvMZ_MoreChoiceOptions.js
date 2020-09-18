// ============================================================================
//  Collab Plugin - HIME and LordV's More Choice Options 
//  HIME_LvMZ_MoreChoiceOptions.js
// ============================================================================

var Imported = Imported || {};
Imported["HimeLordVChoiceOptions"] = true;

/*:
 * @target MZ
 * @plugindesc [v1.0] You can combine or set conditions in which your multiple choices shall appear. 
 * @author HIME, LordValinar
 *
 * @ --------------------------------------------------------------------------
 *
 * @command choiceText
 * @text Choice Text
 * @desc Replaces choice text if conditions are met.
 *
 * @arg num
 * @text Choice Number
 * @type number[]
 * @decimals 0
 * @desc Choice number(s) to change text for.
 * @default 
 *
 * @arg text
 * @text Choice Text
 * @desc The text to show when conditions are met.
 * @default 
 *
 * @arg formula
 * @text Choice Formula
 * @desc Custom formula to determine if the choice is disabled.
 * Leave blank if you want it to automatically set.
 * @default
 *
 * @ --------------------------------------------------------------------------
 *
 * @command disableChoice
 * @text Disable Choice
 * @desc Disables a choice from the choice list.
 *
 * @arg num
 * @text Choice Number
 * @type number[]
 * @decimals 0
 * @desc Number of choice to disable.
 * @default 
 *
 * @arg formula
 * @text Choice Formula
 * @desc Custom formula to determine if the choice is disabled
 * Leave blank if you want it to automatically set.
 * @default
 *
 * @ --------------------------------------------------------------------------
 *
 * @command hideChoice
 * @text Hide Choice
 * @desc Hides a specific choice from the choice list.
 *
 * @arg num
 * @text Choice Number
 * @type number[]
 * @decimals 0
 * @desc The choice number to hide.
 * @default 
 *
 * @arg formula
 * @text Choice Formula
 * @desc Custom formula to determine if the choice is disabled
 * Leave blank if you want it to automatically set.
 * @default
 *
 * @ --------------------------------------------------------------------------
 *
 * @help
 * ----------------------------------------------------------------------------
 * Introduction
 * ----------------------------------------------------------------------------
 *
 * RPG Maker grants you up to six options to choose from to have your events 
 * behave; However, it is only six choices. What if you wanted more? What if 
 * you wanted to disable or even hide a choice if a condition wasn't met?
 *
 * Now you can do all of that! Some of that! Or none of that! The choices..
 * pun intended.. are up to you.
 *
 * ----------------------------------------------------------------------------
 * Instructions
 * ----------------------------------------------------------------------------
 *
 * We present you two options for each method:
 *  - Plugin Command
 *  - Script Call
 *
 *  :: PLUGIN COMMANDS ::
 *
 * Choice Text:
 *  --> Choice Number
 *    (Number) List of all choices you want to be affected
 *  --> Choice Text
 *    (String) Text to replace original with
 *  --> Choice Formula
 *    (String) The condition in which for this to apply
 *             NOTE: Leave blank for no condition
 *
 *
 * Disable Choice:
 *  --> Choice Number[]
 *    (Number) List of all choices you want to be affected
 *  --> Choice Formula
 *    (String) The condition in which for this to apply
 *             NOTE: Leave blank for no condition
 *
 *
 * Hide Choice:
 *  --> Choice Number[]
 *    (Number) List of all choices you want to be affected
 *  --> Choice Formula
 *    (String) The condition in which for this to apply
 *             NOTE: Leave blank for no condition
 *
 *
 *  :: SCRIPT CALLS ::
 *
 * $gameMessage.setChoiceText(choiceNumber, text);
 *   A direct call to alter the choice text. "choiceNumber" in this 
 *  will refer to the index. (1st choice = 0, 2nd choice = 1, etc.)
 *
 * $gameMessage.choiceText(choiceNumber);
 *   Returns the custom text for the given choice.
 *
 * this.choice_text(choiceNumber, text, formula);
 *  (^ if called within an event or common event)
 *   The normal method that you might make to change a choice text 
 *  based on a condition (in this case, it is the formula). Unlike 
 *  the above call, choiceNumber refers the direct choice. (1st = 1)
 *
 * [Example]: this.choice_text(1, "???", "$gameVariables.value(1) < 2");
 *
 *
 * $gameMessage.disableChoice(choiceNumber, boolean);
 *   The direct call method, as above choiceNumber will refer to the 
 *  index. Boolean will be:  true  -or-  false
 *
 * $gameMessage.isChoiceDisabled(choiceNumber);
 *   Returns whether or not the given choice is disabled.
 *
 * this.disable_choice(choiceNumber, formula);
 *  (^ if called within an event or common event)
 *   Will disable the choice by number (referencing the direct choice)
 *  if the formula's condition is true.
 *
 *
 * $gameMessage.hideChoice(choiceNumber, boolean);
 *   The direct call method, as above choiceNumber will refer to the
 *  index. Boolean will be:  true  -or-  false
 *
 * $gameMessage.isChoiceHidden(choiceNumber);
 *   Returns whether or not the given choice is hidden.
 *
 * this.hide_choice(choiceNumber, formula);
 *  (^ if called within an event or common event)
 *   Will hide the choice completely from the choice list if the 
 *  formula's condition is true.
 *
 * ----------------------------------------------------------------------------
 * Terms of Use
 * ----------------------------------------------------------------------------
 *
 * Free for noncommercial use, with credit to both HIME and LordValinar
 * For commercial use, please contact HIME at any of the links below
 * Do NOT remove the Authors of this plugin
 *
 * Patreon: https://www.patreon.com/himeworks
 * Main Website: http://himeworks.com
 * Facebook: https://www.facebook.com/himeworkscom/
 * Twitter: https://twitter.com/HimeWorks
 * Youtube: https://www.youtube.com/c/HimeWorks
 * Tumblr: http://himeworks.tumblr.com/
 *
 * ----------------------------------------------------------------------------
 * Changelog
 * ----------------------------------------------------------------------------
 *
 * v1.0 - Plugin complete!
 *
 * ----------------------------------------------------------------------------
 */

(() => {
'use strict';

const pluginName = 'HIME_LvMZ_MoreChoiceOptions';

PluginManager.registerCommand(pluginName, 'choiceText', args => {
	const numbers = JSON.parse(args.num);
	const formula = args.formula.length > 0 ? eval(args.formula) : true;
	for (const num of numbers) {
		let choiceNum = Math.floor(num) - 1;
		if (formula) $gameMessage.setChoiceText(choiceNum, args.text);
	}
});

PluginManager.registerCommand(pluginName, 'disableChoice', args => {
	const numbers = JSON.parse(args.num);
	const formula = args.formula.length > 0 ? eval(args.formula) : true;
	for (const num of numbers) {
		let choiceNum = Math.floor(num) - 1;
		$gameMessage.disableChoice(choiceNum, formula);		
	}
});

PluginManager.registerCommand(pluginName, 'hideChoice', args => {
	const numbers = JSON.parse(args.num);
	const formula = args.formula.length > 0 ? eval(args.formula) : true;
	for (const num of numbers) {
		let choiceNum = Math.floor(num) - 1;
		$gameMessage.hideChoice(choiceNum, formula);
	}
});

/******************************************************************************
	rmmz_objects.js
******************************************************************************/

// --- GAME MESSAGE ---
const gameMsg_clear = Game_Message.prototype.clear;
Game_Message.prototype.clear = function() {
	gameMsg_clear.call(this);
	this._customChoiceText = {};
	this._disabledChoiceConditions = {};
	this._hiddenChoiceConditions = {};
    this._oldChoices = [];
};

const gameMsg_choices = Game_Message.prototype.choices;
Game_Message.prototype.choices = function() {
	gameMsg_choices.call(this);
	let res = gameMsg_choices.call(this);
    for (const key in this._customChoiceText) {
		res[key] = this._customChoiceText[key]
    }
    return res;
};

/* Returns the custom text for the given choice */
Game_Message.prototype.choiceText = function(choiceNum) {
	return this._customChoiceText[choiceNum];
};

/* Returns whether the specified choice is disabled */
Game_Message.prototype.isChoiceDisabled = function(choiceNum) {
	return this._disabledChoiceConditions[choiceNum];
};

/* Returns whether the specified choice is hidden */
Game_Message.prototype.isChoiceHidden = function(choiceNum) {
	return this._hiddenChoiceConditions[choiceNum];
};

Game_Message.prototype.backupChoices = function() {
	this._oldChoices = this._choices.clone();
};

Game_Message.prototype.restoreChoices = function() {
	this._choices = this._oldChoices.clone();
};

// -- Script Calls --
Game_Message.prototype.setChoiceText = function(choiceNum, text) {
	this._customChoiceText[choiceNum] = text;
};

Game_Message.prototype.disableChoice = function(choiceNum, bool) {
	this._disabledChoiceConditions[choiceNum] = bool;
};

Game_Message.prototype.hideChoice = function(choiceNum, bool) {
	this._hiddenChoiceConditions[choiceNum] = bool;
};


// --- GAME INTERPRETER ---
const gameIntr_setupChoices = Game_Interpreter.prototype.setupChoices;
Game_Interpreter.prototype.setupChoices = function(params) {
	params = this.combineChoices();
	gameIntr_setupChoices.call(this, params);
	$gameMessage.backupChoices();
};

Game_Interpreter.prototype.combineChoices = function() {  
	/* IMPORTANT If we don't clone this, we will modify the event permanently */
	this._list = JSON.parse(JSON.stringify(this._list))
	const currIndex = this._index;
	const firstCmd = this._list[this._index];
	let numChoices = 0;
	this._index++;
	while (this._index < this._list.length) {
		let cmd = this._list[this._index];
		let nextCmd = this._list[this._index+1];
		if (cmd.indent === this._indent)
			/* Reached "End Choices" command. See if next command is "Show Choices" */
			if (cmd.code === 404 && (nextCmd === undefined || nextCmd.code !== 102)) {
				break;
			} else if (cmd.code === 102) {
				/* Update cancel choice.
				* -2 is "cancel"
				* -1 is "disallow"
				* 0 to 5 are zero-indexed choices
				*/
				let cancelType = cmd.parameters[1];
				if (cancelType > -1) {
					firstCmd.parameters[1] = cancelType + numChoices;
				} else if (cancelType === -2) {
					firstCmd.parameters[1] = cancelType;            
				}
				/* Update default choice */
				let defaultType = cmd.parameters[2];
				if (defaultType > -1) {
					firstCmd.parameters[2] = defaultType + numChoices;
				}
				/* Add all of the parameters to the current command */
				let options = cmd.parameters[0];
				for (let i = 0; i < options.length; i++) {
					firstCmd.parameters[0].push(options[i]);
				}
				/* Delete the "end choice" and "show choice" commands */
				this._list.splice(this._index - 1, 2);
				this._index -= 2;
			} else if (cmd.code === 402) { /* Update the branch number */
				cmd.parameters[0] = numChoices;
				numChoices++;
			}
			this._index++;
	}
	/* Go back to where we left off */
	this._index = currIndex;    

	/* Return the new parameters for the first choice command */
	return firstCmd.parameters;
};

// -- Script Calls --
Game_Interpreter.prototype.choice_text = function(choiceNum, text, formula) {
	const num = Math.floor(choiceNum) - 1;    
	if (eval(formula)) $gameMessage.setChoiceText(num, text);
};

Game_Interpreter.prototype.disable_choice = function(choiceNum, formula) {
	const num = Math.floor(choiceNum) - 1;    
	$gameMessage.disableChoice(num, eval(formula));
};

Game_Interpreter.prototype.hide_choice = function(choiceNum, formula) {
    const num = Math.floor(choiceNum) - 1;    
    $gameMessage.hideChoice(num, eval(formula));
};

/******************************************************************************
	rmmz_windows.js
******************************************************************************/

/* After setting up choices, go and disable any that should be disabled */
const windowChoiceList_makeCommands = Window_ChoiceList.prototype.makeCommandList;
Window_ChoiceList.prototype.makeCommandList = function() {
	$gameMessage.restoreChoices();
	this.clearChoiceMap();
	windowChoiceList_makeCommands.call(this);
	
	// -- Disable Choice Conditions --
	for (let i = 0; i < this._list.length; i++) {
		if ($gameMessage.isChoiceDisabled(i)) {
			this._list[i].enabled = false;
		}
	}
	// -- Hidden Choice Conditions --
	/* Remove choices in reverse to avoid index issues */    
	let needsUpdate = false;
	for (let i = this._list.length; i > -1; i--) {
		if ($gameMessage.isChoiceHidden(i)) {
			this._list.splice(i, 1)
			$gameMessage._choices.splice(i, 1)        
			needsUpdate = true;
		} else { /* Add this to our choice map */
			this._choiceMap.unshift(i);
		}
	}
	/* If any choices were deleted, update our window placement/size */
	if (needsUpdate) this.updatePlacement();
};

/* Gray out disabled choices */
const windowChoiceList_drawItem = Window_ChoiceList.prototype.drawItem
Window_ChoiceList.prototype.drawItem = function(index) {
	this.changePaintOpacity(this.isCommandEnabled(index));
	windowChoiceList_drawItem.call(this, index);
}; 

/* Stores the choice numbers at each index */
Window_ChoiceList.prototype.clearChoiceMap = function() {
	this._choiceMap = [];
};

/* Overwrite. We need to get the choice number for our index
since the index no longer matches the choice number  */
Window_ChoiceList.prototype.callOkHandler = function() {
	$gameMessage.onChoice(this._choiceMap[this.index()]);
	this._messageWindow.terminateMessage();
	this.close();
};

})();