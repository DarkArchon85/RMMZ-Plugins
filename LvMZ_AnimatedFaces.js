// ============================================================================
//  LordValinar Plugin - Animated Faces
//  LvMZ_AnimatedFaces.js
// ============================================================================

var Imported = Imported || {};
Imported["LvMZAnimatedFaces"] = true;

//=============================================================================
/*:
 * @target MZ
 * @plugindesc [v1.3] Animates face sets to appear as if speaking. Or when 
 * idle, it will run that animation too (blinking).
 * @author LordValinar
 * @url https://github.com/DarkArchon85/RMMZ-Plugins
 *
 * @help
 * ============================================================================
 * Introduction
 * ============================================================================
 *
 *  This plugin will allow you to have animated faces when using Show Text 
 * commands. The face must have a prefix (default: 'anim_') in order to be 
 * considered "animated" by the plugin. There are default settings in case 
 * you wish to just "plug n' play", but they can also be altered, or even 
 * changed via a plugin command on the fly with events!
 *
 *  Minor setup required. You will have to setup a face set with the top 
 * row for "Idle" animations (typically blinking eyes), and the bottom row 
 * for "Speaking".
 *
 * ============================================================================
 * Plugin Commands
 * ============================================================================
 *
 * The plugin comes pre-packaged and ready to go; however, if at any time you 
 * with to alter the idle animations or maximum amount of frames for idle or 
 * speaking animations, then you can change them on the fly!
 *
 * ---
 *
 * Idle Delay:
 *   Set a minimum and maximum for the delay between idle animations. The 
 *   actual amount is random chosen from these numbers. 
 *
 * ---
 *
 * Max Frames:
 *   Set a maximum number of frames for the Idle and Speaking animations.
 *   There is technically no limit, just have the face set's width match 
 *   the maximum possible frames (each frame = 48x48 pixels).
 *
 * ============================================================================
 * Terms of Use
 * ============================================================================
 *
 * Free to use and modify for commercial and noncommercial games, with credit.
 * Do NOT remove my name from the Author of this plugin
 * Do NOT reupload this plugin (modified or otherwise) anywhere other than the 
 * RPG Maker MV main forums: https://forums.rpgmakerweb.com/index.php
 *
 * ============================================================================
 * Credits
 * ============================================================================
 *
 * Myself (LordValinar) and Fogomax (for the original source from the 
 * TTKMessagePlus plugin). 
 *
 * ============================================================================
 * Changelog
 * ============================================================================
 *
 *  v1.3 - Fixed previous version the idle animation stopped working, and 
 *         also fixed the animation delay wasn't working!
 *
 *  v1.2 - Fixed error with "this.pause" and added in battle scene animations.
 *         Also fixed an error when using wait codes, the image disappeared.
 *
 *  v1.1 - Added in a 'stop' to animations when "waiting" in the message.
 *
 *  v1.0 - Plugin Converted from MV
 *
 * ============================================================================
 *
 * @param AnimFacePrefix
 * @text Animated Faces Prefix
 * @desc Prefix to determine an animated face set.
 * @default anim_
 *
 * @param MinAnimDelay
 * @text Minimum Animation Delay
 * @type number
 * @min 0
 * @max 9999
 * @desc Random delay before next animation
 * @default 90
 *
 * @param MaxAnimDelay
 * @text Maximum Animation Delay
 * @type number
 * @min 0
 * @max 9999
 * @desc Random delay before next animation
 * @default 240
 *
 * @param MaxIdleFrames
 * @text Maximum Idle Frames
 * @type number
 * @decimals 0
 * @min 1
 * @desc How many frames to run an idle face animation
 * @default 2
 *
 * @param MaxSpeakFrames
 * @text Maximum Speak Frames
 * @type number
 * @decimals 0
 * @min 1
 * @desc How many frames to run speaking face animation
 * @default 3
 *
 * @ --------------------------------------------------------------------------
 *
 * @command setDelay
 * @text Set Idle Delay
 * @desc Choose a minimum and maximum delay for the idle
 * face animation (top row of the face set).
 *
 * @arg minDelay
 * @text Minimum Delay
 * @type number
 * @desc What is the minimum amount of frames to wait 
 * before cycling through the idle face animation?
 * @default 90
 *
 * @arg maxDelay
 * @text Maximum Delay
 * @type number
 * @desc What is the maximum amount of frames to wait 
 * before cycling through the idle face animation?
 * @default 240
 *
 * @ --------------------------------------------------------------------------
 *
 * @command setFrames
 * @text Set Face Frames
 * @desc Choose a maximum amount of frames for the idle
 * (top row) and speaking (bottom row).
 * 
 * @arg idleFrames
 * @text Idle Frames
 * @type number
 * @min 1
 * @desc How many frames is the idle animation?
 * It cycles from left to right and back again.
 * @default 2
 *
 * @arg speakFrames
 * @text Speaking Frames
 * @type number
 * @min 1
 * @desc How many frames is the speaking animation?
 * It cycles from left to right and back again.
 * @default 3
 *
 * @ --------------------------------------------------------------------------
 *
 * @command reset
 * @text Reset Settings
 * @desc Reset delay and max frame settings.
 *
 */
//=============================================================================

(() => {
'use strict';

const pluginName = 'LvMZ_AnimatedFaces';
const lvParams = PluginManager.parameters(pluginName);
const animPrefix = lvParams['AnimFacePrefix'];
const minAnimDelay = Number(lvParams['MinAnimDelay']);
const maxAnimDelay = Number(lvParams['MaxAnimDelay']);
const idleFrames = Number(lvParams['MaxIdleFrames']);
const speakFrames = Number(lvParams['MaxSpeakFrames']);

/******************************************************************************
	rmmv_managers.js
/*****************************************************************************/
	
PluginManager.registerCommand(pluginName, 'setDelay', args => {
	$gameMessage.setAnimationDelay(args.minDelay, args.maxDelay);
});

PluginManager.registerCommand(pluginName, 'setFrames', args => {
	$gameMessage.setAnimationFrames(args.idleFrames, args.speakFrames);
});

PluginManager.registerCommand(pluginName, 'reset', () => {
	$gameMessage.setAnimationDelay(minAnimDelay, maxAnimDelay);
	$gameMessage.setAnimationFrames(idleFrames, speakFrames);
});

/******************************************************************************
	rmmv_objects.js
******************************************************************************/

// --- GAME MESSAGE ---
const gameMsg_init = Game_Message.prototype.initialize;
Game_Message.prototype.initialize = function() {
	gameMsg_init.call(this);
	this._minAnimDelay = minAnimDelay;
	this._maxAnimDelay = maxAnimDelay;
	this._animIdleFrames = idleFrames - 1;
	this._animSpeakFrames = speakFrames - 1;
};

Game_Message.prototype.setAnimationDelay = function(min, max) {
	this._minAnimDelay = min;
	this._maxAnimDelay = max;
};

Game_Message.prototype.setAnimationFrames = function(idle, speak) {
	this._animIdleFrames = idle - 1;
	this._animSpeakFrames = speak - 1;
}

Game_Message.prototype.animatedFace = function() {
	const length = animPrefix.length;
	return this._faceName.substring(0, length) === animPrefix;
};

/******************************************************************************
	rmmv_scenes.js
******************************************************************************/

const sceneMap_update = Scene_Map.prototype.update;
Scene_Map.prototype.update = function() {
	sceneMap_update.call(this);
	if ($gameMessage.hasText() && $gameMessage.animatedFace()) {
		this._messageWindow.updateFaceAnimation();
	}
};

const sceneBattle_update = Scene_Battle.prototype.update;
Scene_Battle.prototype.update = function() {
	sceneBattle_update.call(this);
	if ($gameMessage.hasText() && $gameMessage.animatedFace()) {
		this._messageWindow.updateFaceAnimation();
	}
};

/******************************************************************************
	rmmv_windows.js
******************************************************************************/

const windowMsg_init = Window_Message.prototype.initialize;
Window_Message.prototype.initialize = function(rect) {
	windowMsg_init.call(this, rect);
	this._animFaceSide = 'left';
	this._afIdleY		 = -1;
	this._afSpeakY 		 = -1;
	this._afMaxFrames    = 0;
	this._afSpeakFrames  = 0;
	this._afDelay 		 = [0,0];
	this._animFaceIndex	 = 0;
	this._afTick 		 = 0;
};

// New - Where the magic happens! (Credit: Fogomax for the original function I altered from)
Window_Message.prototype.updateFaceAnimation = function() {
	if (this._waitCount > 0) {
		this._animFaceSide = 'left';
		this._animFaceIndex = 0;
		this._animFaceWait = 0;
		this._afTick = 0;
		this.drawMessageFace();
	} else if (this._animFaceWait > 0) {
		this._animFaceWait--;
	} else {
		this._afTick++;
		if (this._afTick >= 6) {
			this._afTick = 0;
			if (this._animFaceSide == 'left') {
				this._animFaceIndex++;
				if ((this._animFaceIndex >= this._afMaxFrames && !this._textState) || 
				    (this._animFaceIndex >= this._afSpeakFrames && this._textState)) {
					this._animFaceSide = 'right';
				}
			} else {
				this._animFaceIndex--;
				if (this._animFaceIndex <= 0) {
					this._animFaceSide = 'left';
					if (this._afDelay[1] > 0 && (this._textState == null || this._afSpeakY < 0)) {
						let min = Math.ceil(this._afDelay[0]);
						let max = Math.floor(this._afDelay[1]);
						this._animFaceWait = ~~(Math.random() * (max - min + 1) + min);
					}
				}
			}
			this.drawMessageFace();
		}
	}
};

// Alias - For each message, we ensure the values are updated so it is ongoing
const windowMsg_start = Window_Message.prototype.startMessage;
Window_Message.prototype.startMessage = function() {
	windowMsg_start.call(this);
	if ($gameMessage.animatedFace()) {
		this._animFaceIndex = 0;
		this._animFaceWait = 0;
		this._afIdleY = 0;
		this._afSpeakY = 1;
		this._afDelay[0] = $gameMessage._minAnimDelay;
		this._afDelay[1] = $gameMessage._maxAnimDelay;
		this._afMaxFrames = $gameMessage._animIdleFrames;
		this._afSpeakFrames = $gameMessage._animSpeakFrames;
	}
};

// Alias - Animated faces update index by frame
const windowMsg_drawMsgFace = Window_Message.prototype.drawMessageFace;
Window_Message.prototype.drawMessageFace = function() {
	if ($gameMessage.animatedFace()) {
		const faceName = $gameMessage.faceName();
		$gameMessage.setFaceImage(faceName, this._animFaceIndex);
	}
	windowMsg_drawMsgFace.call(this);
};

// Alias - Animated faces get drawn specifically
const windowBase_drawFace = Window_Base.prototype.drawFace;
Window_Base.prototype.drawFace = function(faceName, faceIndex, x, y, width, height) {
	let anim = $gameMessage.animatedFace();
	if (anim) {
		width = width || ImageManager.faceWidth;
		height = height || ImageManager.faceHeight;
		const bitmap = ImageManager.loadFace(faceName);
		const pw = ImageManager.faceWidth;
		const ph = ImageManager.faceHeight;
		const sw = Math.min(width, pw);
		const sh = Math.min(height, ph);
		const dx = Math.floor(x + Math.max(width - pw, 0) / 2);
		const dy = Math.floor(y + Math.max(height - ph, 0) / 2);
		const sx = faceIndex * pw;
		let sy;
		if (this._afSpeakY >= 0 && this._textState) {
			sy = ph * this._afSpeakY;
		} else if (this._afIdleY >= 0 && !this._textState) {
			sy = ph * this._afIdleY;
		}
		this.contents.clearRect(dx, dy, pw, ph);
		this.contents.blt(bitmap, sx, sy, sw, sh, dx, dy);
	} else {
		windowBase_drawFace.call(this, faceName, faceIndex, x, y, width, height);
	}
};

})();
