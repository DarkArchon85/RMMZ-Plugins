// ============================================================================
//  LordValinar Plugin - Friendship-Romance System (FRS) Alternative
//  LvMZ_FRS_Alt.js
// ============================================================================

var Imported = Imported || {};
Imported["LvMZ_FRS_Alt"] = true;

// Only the essentials:
if (!Imported['LvMZ_Core']) {
	Number.prototype.percent = function() {
		return Number(this.toFixed(2)).clamp(-1,1);
	};
	
	function MapManager() {
		throw new Error('This is a static class');
	}
	
	MapManager.loadMapData = function(mapId, onLoad) {
		if (mapId > 0) {
			const src = 'Map%1.json'.format(mapId.padZero(3));
			const xhr = new XMLHttpRequest();
			const url = "data/" + src;
			xhr.open("GET", url);
			xhr.overrideMimeType("application/json");
			xhr.onload = () => this.onXhrLoad(xhr, onLoad);
			xhr.onerror = () => this.onXhrError();
			xhr.send();
		} else {
			const result = this.makeEmptyMap();
			onLoad.call(this, result);
		}
	};

	MapManager.onXhrLoad = function(xhr, onLoad) {
		if (xhr.status < 400) {
			const result = JSON.parse(xhr.responseText);
			onLoad.call(this, result);
		} else {
			this.onXhrError();
		}
	};
	
	MapManager.makeEmptyMap = function() {
		const map = {};
		map.data = [];
		map.events = [];
		map.width = 100;
		map.height = 100;
		map.scrollType = 3;
		return map;
	};

	MapManager.onXhrError = function() {
		console.log("Failed to load Map Data!");
	};
}

/*:
 * @target MZ
 * @plugindesc [v1.3] Develop friendship and romance between actors or events.
 * Alternative Version: Shows both friendship and romance bar.
 * @author LordValinar
 * @url https://github.com/DarkArchon85/RMMZ-Plugins
 * @orderAfter VisuMZ_1_MainMenuCore
 *
 * @param minLevel
 * @text Minimum Relations Level
 * @type number
 * @min -9999
 * @max 9998
 * @desc Lowest value friendship/romance can hit.
 * @default 0
 *
 * @param maxLevel
 * @text Maximum Relations Level
 * @type number
 * @min -9998
 * @max 9999
 * @desc Highest value friendship/romance can hit.
 * @default 100
 *
 * @param engagedIcon
 * @text Romanced Icon ID
 * @type number
 * @desc The icon index ID to use if an actor is currently
 * engaged with another actor (or event).
 * @default 84
 *
 * @param engagedMin
 * @text Lover's Romance Minimum
 * @type number
 * @desc The minimum romance value to be considered 'engaged'
 * Set to 0 to use the Minimum Relations Level instead.
 * @default 90
 *
 * @param engagedBuff
 * @text Lover's Buff
 * @type state
 * @desc The state to apply to all linked 'engaged' characters
 * within the current party.
 * @default 0
 *
 * @param paramBreak1
 * @text --------------------------
 * @default ----------------------------------
 *
 * @param memberAddFriend
 * @text New Member Friendship
 * @type number
 * @desc Automatically adds friendship points to all active
 * party members towards the new member added.
 * @default 0
 *
 * @param newMember
 * @text New Member Befriends Party
 * @type boolean
 * @on Mutual Friendship
 * @off Party(to member only)
 * @desc if New Member Friendship > 0 and this is true, then
 * the new member will also add the party to their friend list.
 * @default false
 *
 * @param evPreName
 * @text Event Prefix
 * @desc Prefix that appears on event names in the relation 
 * list. This helps separate which ones are actors/events.
 * @default (npc)
 *
 * @param evPostName
 * @text Event Postfix
 * @desc Postfix that appears on event names in the relation 
 * list. This helps separate which ones are actors/events.
 * @default 
 *
 * @param relationWindowText
 * @text Relation Window Text
 * @desc The text that appears for the current actor in the 
 * top window of the Relations scene.
 * @default Relations:
 *
 * @param paramBreak2
 * @text --------------------------
 * @default ----------------------------------
 *
 * @param immediateMenu
 * @text Disable Actor Relations Select
 * @type boolean
 * @on Leader Relations Opens
 * @off Choose Actor Relations
 * @desc By toggling this option, when selecting the Relations
 * menu option will go directly to leader's menu (if able).
 * @default false
 *
 * @param paramBreak3
 * @text --------------------------
 * @default ----------------------------------
 *
 * @param fc1
 * @text Friendship Bar Color 1
 * @desc Gradient colors (left) for the friendship bar.
 * NOTE: Use only hex code (rgb)
 * @default #00ff00
 *
 * @param fc1Alpha
 * @type number
 * @min 0
 * @max 100
 * @desc Alpha (percentage) of friendship bar 1.
 * @default 50
 *
 * @param fc2
 * @text Friendship Bar Color 2
 * @desc Gradient colors (right) for the friendship bar.
 * NOTE: Use only hex code (rgb)
 * @default #0096c8
 *
 * @param fc2Alpha
 * @type number
 * @min 0
 * @max 100
 * @desc Alpha (percentage) of friendship bar 2.
 * @default 80
 *
 * @param rc1
 * @text Romance Bar Color 1
 * @desc Gradient colors (left) for the romance bar.
 * NOTE: Use only hex code (rgb)
 * @default #ffc0cb
 *
 * @param rc1Alpha
 * @type number
 * @min 0
 * @max 100
 * @desc Alpha (percentage) of romance bar 1.
 * @default 50
 *
 * @param rc2
 * @text Romance Bar Color 2
 * @desc Gradient colors (right) for the romance bar.
 * NOTE: Use only hex code (rgb)
 * @default #ff1919
 *
 * @param rc2Alpha
 * @type number
 * @min 0
 * @max 100
 * @desc Alpha (percentage) of romance bar 2.
 * @default 80
 *
 * @ --------------------------------------------------------------------------
 *
 * @command changeRelations
 * @text Change Relationship Points
 * @desc Add or remove friendship/romance
 * 
 * @arg target
 * @text Target Type
 * @type select
 * @option Actor
 * @option Event
 * @desc Is the target an actor or event to befriend/romance?
 * @default Actor
 *
 * @arg type
 * @text Relation Type
 * @type select
 * @option Friend
 * @option Romance
 * @desc The type of relations between actor and target.
 * @default Friend
 *
 * @arg actorId
 * @text Actor ID
 * @desc ID of the target actor to befriend. Using 0 will get the 
 * party leader's actorID, -1 target befriends the entire party.
 * @default 0
 *
 * @arg value
 * @text Relation Value
 * @type number
 * @min -99999
 * @max 99999
 * @desc This is the amount (positive or negative) to change 
 * the current relation between leader and actor.
 * @default 0
 *
 * @arg reverse
 * @text Also Befriend Leader
 * @type boolean
 * @on Leader <-> Actor
 * @off Leader -> Actor Only
 * @desc If true, then target actor (actor only) will also add
 * the leader to their friend/romance lists. Ignores events.
 * @default false
 *
 * @arg cType
 * @text Condition Type
 * @type select
 * @option Disable
 * @option State
 * @option Skill
 * @desc Acquire a state or skill (id) if condition is met or 
 * lose them once the condition is no longer met. EVENTS ONLY!!
 * @default Disable
 *
 * @arg cValue
 * @text Condition Value
 * @type number
 * @desc The friend/romance value to compare. Activates if the
 * value is greater than or equal to this value. EVENTS ONLY!!
 * @default 0
 * 
 * @arg cID
 * @text State or Skill ID
 * @type number
 * @min 1
 * @max 1000
 * @desc The state or skill ID to apply or remove. EVENTS ONLY!!
 * @default 1 
 *
 * @ --------------------------------------------------------------------------
 *
 * @command disableFlag
 * @text Disable DoOnce Flag
 * @desc Makes it so a Do Once condition for a switch, variable, or 
 * common event can be run again.
 * 
 * @arg type
 * @text Flag Type
 * @type select
 * @option Event
 * @option Switch
 * @option Variable
 * @desc Which DoOnce Flag is to be reset?
 * @default 
 *
 * @arg actorId
 * @text Actor ID
 * @desc Of which actor's flags are we searching? Using 0 will get 
 * the party leader's actorID.
 * @default 0
 *
 * @arg typeId
 * @text Type ID
 * @type number
 * @min 1
 * @desc The ID of the common event, switch or variable.
 * @default 1
 *
 * @ --------------------------------------------------------------------------
 *
 * @command saveToVar
 * @text Save To Variable
 * @desc Save relation data of how <actor> feels about <target> in an 
 * integer. Can be loaded up in message boxes with \v[#].
 *
 * @arg type
 * @text Relation Type
 * @type select
 * @option Friend
 * @option Romance
 * @desc Are you retrieving friendship points or romance points?
 * @default Friend
 *
 * @arg actorId
 * @text Actor ID
 * @desc The actor ID from the database. Choose 0 for party leader.
 * actors or events.
 * @default 1
 *
 * @arg target
 * @text Target Type
 * @type select
 * @option Actor
 * @option Event
 * @desc The target(Actor/Event) to retrieve data from
 * @default Actor
 *
 * @arg targetId
 * @text Actor or Event ID
 * @desc The actor or event ID of <target>
 * @default 1
 *
 * @arg variableId
 * @text Variable ID
 * @type number
 * @min 1
 * @max 5000
 * @desc This is the variable to save the relation value to.
 * @default 1
 *
 *
 * @help
 * ----------------------------------------------------------------------------
 * Instructions
 * ----------------------------------------------------------------------------
 *
 * NOTE: Running VisuMZ Main Menu Core? Follow these steps:
 * 1) Open up VisuMZ_1_MainMenuCore plugin settings
 * 2) Open the Command Window List
 * 3) Open up a new command on the last line
 * 4) Go to the "Text" tab and REPLACE (meaning delete -> then paste new text)
 *    with the text provided in the download thread. Alternatively, you can 
 *    set the setting manually:
 *
 *  Symbol:            relations
 *  Icon:              84 (or whatever you choose)
 *  STR: Text     
 *  JS: Text           return 'Relations';
 *  JS: Show           return true;
 *  JS: Enable         return this.areRelationsEnabled();
 *  JS: Ext            return null;
 *  JS: Run Code       SceneManager._scene.commandPersonal();
 *  JS: Personal Code  SceneManager.push(Scene_Relations);
 *
 * ----------------------------------------------------------------------------
 * Note Tags
 * ----------------------------------------------------------------------------
 *   The following are the notetags you can use within the database to setup
 * repeatable or one-time use adjustments between the "user" and "target" and 
 * their relations (friendship or romance).
 *
 * [Items]
 *   Item notetags affect the relation status between the party leader (user)
 * and whoever the item is used on within the party menu (target). They can't
 * be used on the party leader however.
 *
 * <frsItem type value: mode>
 * TYPE   : friend | romance
 * VALUE  : value to add(+) or remove(-) from target (actor item is used on)
 * MODE   : true | false | self
 * -> true: Saves relation between leader <-> target
 * -> false: Saves relation between leader -> target only
 * -> self: Saves relation between target -> leader only
 * 
 * 
 * [Skills]
 *   Skills with this notetag will improve (or degrade if negative value)
 * the relations between the user and the actor(ID). If the skill is 
 * targeting another actor and you want to affect the relations between 
 * them, set the actorID to 0.
 *
 * <frsSkill type actorId: value>
 * TYPE   : friend | romance
 * ACTORID: Id of target actor to improve relations with leader
 * VALUE  : The value to adjust (+ or -) when using this skill
 * 
 *
 * [Actors]
 *   There are two sets of notetags for the actor tab in the database.
 * The repeatable ones that can add or remove states or skills when ever 
 * friendship or romance levels are added/removed; It will check the 
 * current levels compared to the notetag's value.
 *
 * <frsBuff type actorId value: stateId>
 * <frsSkill type actorId value: skillId>
 * -> These tags help give a state or skill when the condition 
 *    is met, or remove it when the condition doesn't.
 * <frsBattle: value>
 * -> If this tag exists, friendship with each active party 
 *    member increases by this <value> whenever they complete
 *    a battle together.
 *
 *   The other set of notetags only trigger once when the conditions 
 * are met. frsSet is used upon actor initialization, setting the 
 * starting values between that actor and the linked actor(ID).
 *
 * <frsEvent type actorId value: commonEventId>
 * <frsSwitch type actorId value: switchId true|false>
 * <frsVar type actorId value: variableId varValue>
 * -> These three tags will activate once when the condition is 
 *    met. You will need to use a script call or plugin command 
 *    to delete the DoOnce flag in order to use them again.
 * <frsSet type actorId: value>
 * -> Used when setting up the initial party members on start.
 *
 * ----------------------------------------------------------------------------
 * Plugin Commands & Script Calls
 * ----------------------------------------------------------------------------
 * >> PLUGIN COMMANDS:
 *
 * [Change Relations]
 *     This plugin command will alter the friendship or romance levels 
 *     between the party leader and a target actor or event.
 *
 * :target = Actor | Event
 *  -> Simply choose if the leader is relating to an actor or event
 *
 * :type = Friend | Romance
 *  -> Are we changing friendship or romance?
 *
 * :actorId = Number (between -1 to 1000)
 *  -> So first.. your options. If you want the target actor or event 
 *     to befriend your entire party (and not just your party leader),
 *     set this to: -1
 *  -> Setting to 0 will tell it to get the party leader, and therefore 
 *     nothing will happen. It won't befriend yourself :P 
 *  -> Setting it to 1 or more, will thus befriend/romance the target
 *     actor. If the actor does not exist, it will still default to the 
 *     party leader and this command will do nothing.
 * ::NEW!!:
 *  -> You can now substitute the number with one of the following tags:
 * v[#]: Retrieve an actorId with a variable!
 * a[#]: Retrieve the actorId from whichever actor is in this position
 *    example: a[1] = party leader's actorId, a[3] = 3rd actor's ID.
 *    NOTE: If there is no actor in that position, it will error out!
 *     So you will have to create the condition yourself.
 *
 * :value = Number (between -9999 to 9999)
 *  -> This value is what the friendship/romance will be lowered or 
 *     raised by (while still limited to their min/max levels you defined 
 *     in the parameters.
 *
 * :reverse = true | false
 *  -> If this parameter is set to true(on), then not only will the 
 *     leader's relations towards the target be set, but it will also 
 *     set the target's relation towards the leader.
 *
 * :conditions = The three following parameters help determine when 
 *     befriending a target event only. Does nothing if the target is 
 *     an actor. 
 * :cType = friend | romance
 * :cValue = Number (min to max)
 *  -> If the current (cType) value is >= this, it will add a state to 
 *     the leader, while if the current value is < this, it will remove 
 *     the state (if present)
 *
 * :cID = stateId
 *  -> This is the state ID from the database to add/remove 
 *
 *
 * [Disable DoOnce Flag]
 *     This plugin command will reset a DoOnce flag (set from a one-time
 *     relation condition being met from notetags)
 *
 * :type = Event | Switch | Variable
 * :actorId = Number (between 0 to 1000) 0 = party leader
 * ::NEW!!:
 *  -> You can now substitute the number with one of the following tags:
 * v[#]: Retrieve an actorId with a variable!
 * a[#]: Retrieve the actorId from whichever actor is in this position
 *    example: a[1] = party leader's actorId, a[3] = 3rd actor's ID.
 *    NOTE: If there is no actor in that position, it will error out!
 *     So you will have to create the condition yourself.
 *
 * :typeId = Database ID of the common event, switch or variable
 *
 *
 * [Save To Variable]
 *     This plugin command saves current relation data from the selected
 *     actor to a variable. This can then be retrieved however you need.
 *
 * :type = Friend | Romance
 * :actorId = Number (between 0 to 1000) 0 = party leader
 * :target = Actor | Event
 * :targetId = actor(0-1000) or event ID(1-999) to get
 * :variableId = Variable ID to store relation data to
 *
 * ::NEW!!:
 *  -> You can now substitute the actorId and targetId with one of the 
 *     following tags:
 * v[#]: Retrieve an actorId with a variable!
 * a[#]: Retrieve the actorId from whichever actor is in this position
 *    example: a[1] = party leader's actorId, a[3] = 3rd actor's ID.
 *    NOTE: If there is no actor in that position, it will error out!
 *     So you will have to create the condition yourself.
 * 
 * ============================================================================
 * >> SCRIPT CALLS:
 *     Use any of the following in an event's script call to set or get
 *     data (the latter being in a Conditional Branch script). 
 *
 * this.addFriendship(actorId, value, toLeader=false)
 *  -> Strictly between party leader and target actor (ID). Changes the 
 *     friendship values by [value](-9999 to 9999).
 *  -> :toLeader ( true | false ) determines whether or not the target's
 *     relation with the party leader is also adjusted.
 *
 * this.addRomance(actorId, value, toLeader=false)
 *  -> Similarily, alters leader's relation toward target actor. No 
 *     change from [toLeader].
 *
 * this.addEventFriendship(value, conditions=null, actorId=0)
 *  -> When you want to befriend a certain event (NPC).
 * :value = The amount of friendship to increase/decrease
 * :conditions = Either set as "null" (without quotes), or as an 
 *   array with 3 values: type, value, stateId.
 *   [type]: (friend | romance) {String}
 *   [value]: (-9999 to 9999) {Number}
 *   [stateId]: (1 to 1000) {Number}
 * Example: ["friend",15,0]  -will check if the friendship value 
 *   between the event and target actor is >= 15. If YES, it will add 
 *   the state (stateId) to the actor. If NOT, it will remove it.
 * :actorId = The actor ID to affect (0 = party leader). Also if the 
 *   selected actor by ID doesn't exist, it will default to party leader.
 *
 * this.addEventRomance(value, conditions=null, actorId=0)
 *  -> Same as above, but with romance values
 *
 * this.isEventFriend(actorId=0)
 *  -> Conditional Branch: Checks if the friendship value between 
 *     this event and selected actor (or party leader by default) is 
 *     greater than the minLevel (default: 0)
 *
 * this.isEventRomanced(actorId=0)
 *  -> Conditional Branch: Same as above, but checks event's romance 
 *     value towards selected actor (or party leader by default) is 
 *     greater than the minLevel (default: 0)
 *
 * this.isEventLover(actorId=0)
 *  -> Conditional Branch: Returns true if the event's romance level 
 *     is greater than or equal to the engagedMin (default: 90). If 
 *     the engagedMin is set to 0, it will use the minLevel insetad.
 *
 * this.frsFP(actorId=0)
 *  -> Returns value of friendship between event and actor(actorId)
 *  -> If actorId = 0, it will compare with party leader.
 *
 * this.frsRP(actorId=0)
 *  -> Returns value of romance between event and actor(actorId)
 *  -> If actorId = 0, it will compare with party leader.
 *
 * this.removeNPC(mapId, eventId, actorId=0)
 *  -> Deletes the NPC event data from the actor's relation list.
 *  -> If actorId = 0, it will compare with party leader.
 * 
 * this.removeAllFriends(toLeader = false)
 *  -> Removes all friends from the party leader's relation list.
 *  -> If toLeader = true, all friends of the party leader will 
 *     also remove the party leader from their relation list.
 *
 * this.removeAllRomance(toLeader = false)
 *  -> Removes all romanced actors and events from the party leader's
 *     relation list.
 *  -> If toLeader = true, all romanced actors and events of the 
 *     party leader will also remove them from their relation list.
 *
 * actor.friendLevel(actorId)
 *  -> Returns the friendship value between the target actor (actorId)
 *     and self. Must first define "actor".
 *
 * actor.romanceLevel(actorId)
 *  -> Returns the romance value between the target actor (actorId)
 *     and self. Must first define "actor".
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
 * v1.31 - Moved code to add menu option, only if not using VisuMZ Menu Core 
 *
 * v1.3 - Created this alternative version (shows both friendship and 
 *        romance bars on same actor)
 *
 * v1.2 - Hotfix #2 (small syntax error)
 *
 * v1.1 - Fixes and added an eval method for retrieving actorIDs with a 
 *        variable (v[#]) or other (a[#]), explained in Plugins section.
 *
 * v1.0 - Plugin finished!
 *
 * ----------------------------------------------------------------------------
 */

(() => {
'use strict';

const pluginName = 'LvMZ_FRS_Alt';
const lvParams   = PluginManager.parameters(pluginName);
const minLevel   = Number(lvParams['minLevel']);
const maxLevel   = Number(lvParams['maxLevel']);
const loverIcon  = Number(lvParams['engagedIcon']);
const loverMin   = Number(lvParams['engagedMin']);
const loverBuff  = Number(lvParams['engagedBuff']);
// -- 
const addMemberF = Number(lvParams['memberAddFriend']);
const newMember  = eval(lvParams['newMember']);
const evPrefix   = String(lvParams['evPreName']);
const evPostfix  = String(lvParams['evPostName']);
const relationText = String(lvParams['relationWindowText']);
// --
const leaderMenu = eval(lvParams['immediateMenu']);
// -- 
const fc1A 		 = (lvParams['fc1Alpha']/100).percent();
const colorFC1   = hexToRgba(lvParams['fc1'], fc1A);
const fc2A       = (lvParams['fc2Alpha']/100).percent();
const colorFC2   = hexToRgba(lvParams['fc2'], fc2A);
const rc1A       = (lvParams['rc1Alpha']/100).percent();
const colorRC1   = hexToRgba(lvParams['rc1'], rc1A);
const rc2A		 = (lvParams['rc2Alpha']/100).percent();
const colorRC2   = hexToRgba(lvParams['rc2'], rc2A);

/******************************************************************************
	private functions
******************************************************************************/

function hexToRgba(hex, alpha) {
	let r = parseInt(hex.slice(1, 3), 16),
		g = parseInt(hex.slice(3, 5), 16),
		b = parseInt(hex.slice(5, 7), 16);
	return "rgba("+r+", "+g+", "+b+", "+alpha+")";
}

function evalActorID(formula, absMin=0) {
	// Replace variable strings
	let regex = /v\[(\d+)\]/gi;
	if (formula.match(regex)) {
		let newValue = "$gameVariables.value("+RegExp.$1+")";
		formula = formula.replace(regex, newValue);
	}
	// Replace actor strings 
	// * (a[1] = party leader, a[3] = 3rd party member)
	// * Only returns the ActorID, not the actor
	regex = /a\[(\d+)\]/gi;
	if (formula.match(regex)) {
		let v = String(Number(RegExp.$1) - 1);
		let newValue = "$gameParty._actors["+v+"]";
		formula = formula.replace(regex, newValue);
	}
	try {
		const value = Number(eval(formula)).clamp(absMin, 1000);
		return isNaN(value) ? 0 : value;
	} catch(e) {
		return 0;
	}
}

/******************************************************************************
	plugin commands
******************************************************************************/

PluginManager.registerCommand(pluginName, 'changeRelations', args => {
	const target   = String(args.target).toLowerCase();
	const type     = String(args.type).toLowerCase();
	const actorId  = evalActorID(args.actorId, -1);
	const value    = Number(args.value);
	const toLeader = eval(args.reverse);
	const intr     = $gameMap._interpreter;
	if (target === 'actor') {
		switch (type) {
			case 'friend': intr.addFriendship(actorId, value, toLeader); break;
			case 'romance': intr.addRomance(actorId, value, toLeader); break;
		}
	} else if (target === 'event') {
		const cT = String(args.cType).toLowerCase();
		const cV = Number(args.cValue);
		const cI = Number(args.cID);
		const conditions = (cT !== "disable") ? [cT,cV,cI] : null;
		if (actorId < 0) { // befriends entire party
			const members = $gameParty.battleMembers();
			for (const actor of members) {
				const id = actor._actorId;
				switch (type) {
					case 'friend': intr.addEventFriendship(value, conditions, id); break;
					case 'romance': intr.addEventRomance(value, conditions, id); break;
				}
			}
		} else { // befriends actor-leader only
			switch (type) {
				case 'friend': intr.addEventFriendship(value, conditions, actorId); break;
				case 'romance': intr.addEventRomance(value, conditions, actorId); break;
			}
		}
	}
});

PluginManager.registerCommand(pluginName, 'disableFlag', args => {
	const type    = String(args.type).toLowerCase();
	const actorId = evalActorID(args.actorId);
	const actor   = actorId > 0 ? $gameActors.actor(actorId) : $gameParty.leader();
	const id      = String(args.typeId);
	let uID       = "";
	switch (type) {
		case 'event':    uID = "commEv"+id;   break;
		case 'switch':   uID = "switch"+id;   break;
		case 'variable': uID = "variable"+id; break;
	}
	if (actor && uID) delete actor._frsDoOnce[uID];
});

PluginManager.registerCommand(pluginName, 'saveToVar', args => {
	const type       = String(args.type).toLowerCase();
	const actorId    = evalActorID(args.actorId);
	const tType      = String(args.target).toLowerCase();
	const targetId   = evalActorID(args.targetId);
	const variableId = Number(args.variableId);
	const actor      = actorId > 0 ? $gameActors.actor(actorId) : $gameParty.leader();
	const intr       = $gameMap._interpreter;
	if (type == 'friend') {
		let value = tType == 'actor' ? actor.friendLevel(targetId) : intr.frsFP(actorId);
		$gameVariables.setValue(variableId, value);
	} else if (type == 'romance') {
		let value = tType == 'actor' ? actor.romanceLevel(targetId) : intr.frsRP(actorId);
		$gameVariables.setValue(variableId, value);
	}
});

/******************************************************************************
	rmmz_managers.js
******************************************************************************/

function cache(object, params) {
	const key = 'frsMeta';
	const type = params[0];
	object[key] = object[key] || {};
	object[key][type] = object[key][type] || [];
	switch (type) {
		case 'chgState': {
			object[key][type].push({
				type: params[1],
				actorId: params[2],
				value: params[3],
				stateId: params[4]
			});
		} break;
		case 'chgSkill': {
			object[key][type].push({
				type: params[1],
				actorId: params[2],
				value: params[3],
				skillId: params[4]
			});
		} break;
		case 'commEv': {
			object[key][type].push({
				type: params[1],
				actorId: params[2],
				value: params[3],
				eventId: params[4]
			});
		} break;
		case 'switch': {
			object[key][type].push({
				type: params[1],
				actorId: params[2],
				value: params[3],
				switchId: params[4],
				swValue: params[5]
			});
		} break;
		case 'var': {
			object[key][type].push({
				type: params[1],
				actorId: params[2],
				value: params[3],
				varId: params[4],
				varValue: params[5]
			});
		} break;
		case 'battle': {
			object[key][type] = params[1];
		} break;
		case 'useSkill': {
			object[key] = {
				type: params[1],
				actorId: params[2],
				value: params[3]
			};
		} break;
		case 'useItem': {
			object[key] = {
				type: params[1],
				value: params[2],
				mode: params[3]
			};
		} break;
	}
};

const dm_isDBLoaded = DataManager.isDatabaseLoaded;
DataManager.isDatabaseLoaded = function() {
	if (!dm_isDBLoaded.call(this)) return false;
	if (!this._frsMeta) {
		this.cacheFRS($dataActors);
		this.cacheFRS($dataSkills);
		this.cacheFRS($dataItems);
		this._frsMeta = true;
	}
	return true;
};

DataManager.cacheFRS = function(group) {
	// $dataActors
	const buffTag = /<FRSBUFF\s(FRIEND||ROMANCE)\s(\d+)\s(\d+):\s(\d+)>/i;
	const skillTag = /<FRSSKILL\s(FRIEND||ROMANCE)\s(\d+)\s(\d+):\s(\d+)>/i;
	const evTag = /<FRSEVENT\s(FRIEND||ROMANCE)\s(\d+)\s(\d+):\s(\d+)>/i;
	const swTag = /<FRSSWITCH\s(FRIEND||ROMANCE)\s(\d+)\s(\d+):\s(\d+)\s(true||false)>/i;
	const varTag = /<FRSVAR\s(FRIEND||ROMANCE)\s(\d+)\s(\d+):\s(\d+)\s([+-]*\d+)>/i;
	const battleTag = /<FRSBATTLE:\s([+-]*\d+)>/i;
	// $dataSkills
	const useSkillTag = /<FRSSKILL\s(FRIEND||ROMANCE)\s(\d+):\s([+-]*\d+)>/i;
	// $dataItems
	const useItemTag = /<FRSITEM\s(FRIEND||ROMANCE)\s([+-]*\d+):\s(TRUE||FALSE||SELF)>/i;
	
	for (const obj of group) {
		if (!obj) continue;
		const data = obj.note.split(/[\r\n]+/);
		for (const meta of data) {
			if (meta.match(buffTag)) {
				let params = [
					'chgState',
					RegExp.$1.toLowerCase(),
					Number(RegExp.$2),
					Number(RegExp.$3),
					Number(RegExp.$4)
				];
				cache(obj, params);
			}
			if (meta.match(skillTag)) {
				let params = [
					'chgSkill',
					RegExp.$1.toLowerCase(),
					Number(RegExp.$2),
					Number(RegExp.$3),
					Number(RegExp.$4)
				];
				cache(obj, params);
			}
			if (meta.match(evTag)) {
				let params = [
					'commEv',
					RegExp.$1.toLowerCase(),
					Number(RegExp.$2),
					Number(RegExp.$3),
					Number(RegExp.$4)
				];
				cache(obj, params);
			}
			if (meta.match(swTag)) {
				let params = [
					'switch',
					RegExp.$1.toLowerCase(),
					Number(RegExp.$2),
					Number(RegExp.$3),
					Number(RegExp.$4),
					eval(RegExp.$5)
				];
				cache(obj, params);
			}
			if (meta.match(varTag)) {
				let params = [
					'var',
					RegExp.$1.toLowerCase(),
					Number(RegExp.$2),
					Number(RegExp.$3),
					Number(RegExp.$4),
					Number(RegExp.$5)
				];
				cache(obj, params);
			}
			if (meta.match(battleTag)) {
				let params = ['battle', Number(RegExp.$1)];
				cache(obj, params);
			}
			if (meta.match(useSkillTag)) {
				let params = [
					'useSkill',
					RegExp.$1.toLowerCase(),
					Number(RegExp.$2),
					Number(RegExp.$3)
				];
				cache(obj, params);
			}
			if (meta.match(useItemTag)) {
				let params = [
					'useItem',
					RegExp.$1.toLowerCase(),
					Number(RegExp.$2),
					RegExp.$3.toLowerCase()
				];
				cache(obj, params);
			}
		}
	}
};

/******************************************************************************
	rmmz_objects.js
******************************************************************************/

// --- GAME ACTION ---
const gameAction_validEffects = Game_Action.prototype.hasItemAnyValidEffects;
Game_Action.prototype.hasItemAnyValidEffects = function(target) {
	const result = gameAction_validEffects.call(this, target);
	if (this._item.object().frsMeta) return true;
	return result;
};

const gameAction_applyItemUserEffect = Game_Action.prototype.applyItemUserEffect;
Game_Action.prototype.applyItemUserEffect = function(target) {
	gameAction_applyItemUserEffect.call(this, target);
	this.applyFRSeffects(target);
};

Game_Action.prototype.applyFRSeffects = function(target) {
	const user = this.subject(); // usually the party leader
	const actorId = user._actorId; 
	const meta = this._item.object().frsMeta || null;
	if (!meta || !user.isActor()) return;
	const iType = this._item._dataClass;
	let type, value, mode, id;
	switch (iType) {
		case 'item': {
			type = meta.type;
			value = meta.value;
			mode = meta.mode;
			id = Number(target._actorId);
			if (type === 'friend') {
				switch (mode) {
					case 'true': {
						user.addFriendship(id, value);
						target.addFriendship(actorId, value);
					} break;
					case 'false': {
						user.addFriendship(id, value);
					} break;
					case 'self': {
						target.addFriendship(actorId, value);
					} break;
				}
			} else if (type === 'romance') {
				switch (mode) {
					case 'true': {
						user.addRomance(id, value);
						target.addRomance(actorId, value);
					} break;
					case 'false': {
						user.addRomance(id, value);
					} break;
					case 'self': {
						target.addRomance(actorId, value);
					} break;
				}
			}
		} break;			
		case 'skill': {
			type = meta.type;
			id = meta.actorId;
			value = meta.value;
			if (target.isActor() && id === 0) {
				id = target._actorId;
			}
			if (type === 'friend') {
				user.addFriendship(id, value);
			} else if (type === 'romance') {
				user.addRomance(id, value);
			}
		} break;
	}
	const scene = SceneManager._scene;
	if (scene && scene.constructor === Scene_Item) {
		SceneManager.pop();
	}
};


// --- GAME ACTOR ---
const gameActor_initMembers = Game_Actor.prototype.initMembers;
Game_Actor.prototype.initMembers = function() {
	gameActor_initMembers.call(this);
	this._npcList     = []; // this._npcList[mapId][eventId]{fp:0,rp:0}
	this._friendsList = {}; // actorID: relationshipLevel (0 to 100)
	this._romanceList = {}; // actorID: romanceLevel (bar only appears if > 0)
	this._frsDoOnce   = {};	// flags to track switches/variables/common events
	this._frsStates   = []; // which states to display on FRS menu (max: 5)
};

Game_Actor.prototype.addFriendship = function(actorId, value) {
	if (this._actorId == actorId) return;
	const curValue = this.friendLevel(actorId);
	const newValue = (curValue + value).clamp(minLevel, maxLevel);
	this._friendsList[actorId] = newValue;
	this.frsCheckTags('friend', actorId, newValue);
};

Game_Actor.prototype.addRomance = function(actorId, value) {
	if (this._actorId == actorId) return;
	// If not in the friends list, just set it to 0
	this._friendsList[actorId] = this._friendsList[actorId] || 0;
	const curValue = this.romanceLevel(actorId);
	const newValue = (curValue + value).clamp(minLevel, maxLevel);
	this._romanceList[actorId] = newValue;
	// Lover's Buff - add or remove as necessary
	const inParty = $gameParty._actors.contains(actorId);
	if (inParty && loverBuff > 0) {
		const lMin = Math.max(loverMin, minLevel);
		if (newValue >= lMin) {
			this.addState(loverBuff);
			this.addFRSstate(loverBuff);
		} else {
			this.removeState(loverBuff);
			this._frsStates.remove(loverBuff);
		}
	}
	// --
	if (this._romanceList[actorId] === minLevel) {
		delete this._romanceList[actorId];
	}
	this.frsCheckTags('romance', actorId, newValue);
};

Game_Actor.prototype.frsCheckTags = function(type, actorId, value) {
	if (this._actorId == actorId) return;
	const actor = $dataActors[this._actorId];
	const group = ['chgState','chgSkill','commEv','switch','var'];
	for (const entry of group) {
		const data = actor.frsMeta ? actor.frsMeta[entry] || [] : [];
		for (const meta of data) {
			if (type !== meta.type) continue;
			if (actorId !== meta.actorId) continue;
			switch (entry) {
				case 'chgState': {
					if (value < meta.value) {
						this.removeState(meta.stateId);
						this._frsStates.remove(meta.stateId);
						continue;
					}
					this.addState(meta.stateId);
					this.addFRSstate(meta.stateId);
				} break;
				case 'chgSkill': {
					if (value < meta.value) {
						this.forgetSkill(meta.skillId);
						continue;
					}
					this.learnSkill(meta.skillId);
				} break;
				case 'commEv': {
					if (value < meta.value) continue;
					let uID = "commEv"+String(meta.eventId);
					if (this._frsDoOnce[uID]) continue;
					this._frsDoOnce[uID] = true; // Do Once flag
					$gameTemp.reserveCommonEvent(meta.eventId);
				} break;
				case 'switch': {
					if (value < meta.value) continue;
					let uID = "switch"+String(meta.switchId);
					if (this._frsDoOnce[uID]) continue;
					this._frsDoOnce[uID] = true; // Do Once flag 
					$gameSwitches.setValue(switchId, meta.swValue);
				} break;
				case 'var': {
					if (value < meta.value) continue;
					let uID = "variable"+String(meta.varId);
					if (this._frsDoOnce[uID]) continue;
					this._frsDoOnce[uID] = true; // Do Once flag
					value = $gameVariables.value(meta.varId) + meta.varValue;
					$gameVariables.setValue(meta.varId, value);
				} break;
			}			
		}
	}
};

Game_Actor.prototype.loseFriendship = function(actorId, value) {
	this.addFriendship(actorId, -value);
};

Game_Actor.prototype.loseRomance = function(actorId, value) {
	this.addRomance(actorId, -value);
};

Game_Actor.prototype.friendLevel = function(actorId) {
	return this._friendsList[actorId] || 0;
};

Game_Actor.prototype.romanceLevel = function(actorId) {
	return this._romanceList[actorId] || 0;
};

Game_Actor.prototype.friendList = function() {
	return Object.keys(this._friendsList).map(id => Number(id));
};

Game_Actor.prototype.romanceList = function() {
	return Object.keys(this._romanceList).map(id => Number(id));
};

Game_Actor.prototype.friends = function() {
	return Object.keys(this._friendsList).map(id => $gameActors.actor(id));
};

Game_Actor.prototype.romanced = function() {
	return Object.keys(this._romanceList).map(id => $gameActors.actor(id));
};

Game_Actor.prototype.npcEvents = function() {
	this._npcEvents = [];
	for (const map of this._npcList) {
		if (!map) continue;
		let mapId = this._npcList.indexOf(map);
		for (const ev of map) {
			if (!ev) continue;
			let eventId = map.indexOf(ev);
			let event = this.loadMapEvent(mapId, eventId);
			if (event) {
				let data = this._npcList[mapId][eventId];
				event.fp = data.fp;
				event.rp = data.rp;
				event._name = event.event().name;
				this._npcEvents.push(event);
			}
		}
	}
	return this._npcEvents;
};

Game_Actor.prototype.loadMapEvent = function(mapId, eventId) {
	if ($gameMap._mapId === mapId) {
		// current map - get existing event object
		return $gameMap.event(eventId);
	} else if (mapId > 0) {
		// other map - create a temporary event object
		return new LordV_Event(mapId, eventId);
	} else {
		return null;
	}
};

Game_Actor.prototype.addFRSstate = function(stateId) {
    if (this.isStateAffected(stateId)) {
        if (!this._frsStates.contains(stateId)) {
            this._frsStates.push(stateId);
        }
    }
};


// --- GAME PARTY ---
const gameParty_start = Game_Party.prototype.setupStartingMembers;
Game_Party.prototype.setupStartingMembers = function() {
	gameParty_start.call(this);
	const tag = /<FRSSET\s(FRIEND||ROMANCE)\s(\d+):\s(\d+)>/i;
	for (const id of this._actors) {
		let actor = $gameActors.actor(id);
		let data = $dataActors[id].note.split(/[\r\n]+/);
		for (const meta of data) {
			if (meta.match(tag)) {
				let type = String(RegExp.$1).toLowerCase();
				let targetId = Number(RegExp.$2);
				let value = Number(RegExp.$3);
				switch (type) {
					case 'friend': actor.addFriendship(targetId, value); break;
					case 'romance': actor.addRomance(targetId, value); break;
				}
			}
		}
	}
};

const gameParty_addActor = Game_Party.prototype.addActor;
Game_Party.prototype.addActor = function(actorId) {
	if (!this._actors.includes(actorId)) {
		const member = $gameActors.actor(actorId);
		// New Member Friendship
		if (addMemberF > 0) {
			for (const actor of this.battleMembers()) {
				// cycle through each CURRENT actor (before adding new one)
				// and add friendship points - if haven't done before
				if (actor.friendList().contains(actorId)) continue;
				actor.addFriendship(actorId, addMemberF);
				// also add to each friend as well 
				if (newMember && !member.friendList().contains(actor._actorId)) {
					member.addFriendship(actor._actorId, addMemberF);
				}
			}
		}
		// Lover's Buff - only if leader + new member are already lovers
		const lMin = Math.max(loverMin, minLevel);
		const isLover = this.leader().romanceLevel(actorId) >= lMin;
		if (isLover && loverBuff > 0) {
			this.leader().addState(loverBuff);
			this.leader().addFRSstate(loverBuff);
			member.addState(loverBuff);
			member.addFRSstate(loverBuff);
		}
	}
	gameParty_addActor.call(this, actorId);
};

const gameParty_remActor = Game_Party.prototype.removeActor;
Game_Party.prototype.removeActor = function(actorId) {
	// Lovers Buff - removes just in case
	let remBuff = false;
	const member = $gameActors.actor(actorId);
	if (member.isStateAffected(loverBuff)) {
		member.removeState(loverBuff);
		member._frsStates.remove(loverBuff);
		remBuff = true;
	}
	// Original method
	gameParty_remActor.call(this, actorId);
	// Lovers Buff
	if (remBuff) { // - recheck all *current* actors
		remBuff = false;
		for (const actor of this.battleMembers()) {
			let list = actor.romanceList(); // IDs
			for (const id of list) {
				// missing 1+ lover(s), removes buff
				if (!this._actors.includes(id)) { 
					remBuff = true;
					break;
				}
			}
			if (remBuff) {
				actor.removeState(loverBuff);
				actor._frsStates.remove(loverBuff);
			}
		}
	}
};


// --- GAME MAP ---
const gameMap_setup = Game_Map.prototype.setup;
Game_Map.prototype.setup = function(mapId) {
	gameMap_setup.call(this, mapId);
	this.updateNPCEvents();
};

Game_Map.prototype.updateNPCEvents = function() {
	this._frsEvents = []; // re-initialize
	const actor = $gameParty.leader();
	let refresh = false;
	for (const map of actor._npcList) {
		if (!map) continue;
		let mapId = actor._npcList.indexOf(map);
		if (mapId === this._mapId) continue;
		for (const ev of map) {
			let eventId = map.indexOf(ev);
			MapManager.loadMapData(mapId, dataMap => {
				this._frsEvents[eventId] = dataMap.events[eventId];
				refresh = true;
			});
		}
	}
	if (refresh) this.requestRefresh();
};


// --- GAME PLAYER ---
const gamePlayer_refresh = Game_Player.prototype.refresh;
Game_Player.prototype.refresh = function() {
	gamePlayer_refresh.call(this);
	$gameMap.updateNPCEvents();
};


// --- GAME INTERPRETER ---
Game_Interpreter.prototype.addEventFriendship = function(value, conditions = null, actorId = 0) {
	const data = this.frsNpcData(this._mapId, this._eventId, actorId);
	const min = data.rp > 0 ? minLevel + 1 : minLevel;
	data.fp = (data.fp + value).clamp(min, maxLevel);
	if (Array.isArray(conditions)) {
		const actor = $gameActors.actor(actorId) || $gameParty.leader();
		const type = conditions[0];
		const value = conditions[1];
		const id = conditions[2];
		if (data.fp >= value) {
			switch (type) {
				case 'state': actor.addState(id); break;
				case 'skill': actor.learnSkill(id); break;
			}
		} else {
			switch (type) {
				case 'state': actor.removeState(id); break;
				case 'skill': actor.forgetSkill(id); break;
			}
		}
	}
	if (data.fp === minLevel) {
		this.removeNPC(this._mapId, this._eventId, actorId);
	}
};

Game_Interpreter.prototype.addEventRomance = function(value, conditions = null, actorId = 0) {
	const data = this.frsNpcData(this._mapId, this._eventId, actorId);
	data.rp = (data.rp + value).clamp(minLevel, maxLevel);
	if (Array.isArray(conditions)) {
		const actor = $gameActors.actor(actorId) || $gameParty.leader();
		const type = conditions[0];
		const value = conditions[1];
		const id = conditions[2];
		if (data.rp >= value) {
			switch (type) {
				case 'state': actor.addState(id); break;
				case 'skill': actor.learnSkill(id); break;
			}
		} else {
			switch (type) {
				case 'state': actor.removeState(id); break;
				case 'skill': actor.forgetSkill(id); break;
			}
		}
	}
};

Game_Interpreter.prototype.isEventFriend = function(actorId = 0) {
	return this.frsFP(actorId) > minLevel;
};

Game_Interpreter.prototype.isEventRomanced = function(actorId = 0) {
	return this.frsRP(actorId) > minLevel;
};

Game_Interpreter.prototype.isEventLover = function(actorId = 0) {
	const lMin = Math.max(loverMin, minLevel);
	return this.frsRP(actorId) >= lMin;
};

Game_Interpreter.prototype.frsFP = function(actorId = 0) {
	const data = this.frsNpcData(this._mapId, this._eventId, actorId);
	return data.fp;
};

Game_Interpreter.prototype.frsRP = function(actorId = 0) {
	const data = this.frsNpcData(this._mapId, this._eventId, actorId);
	return data.rp;
};

Game_Interpreter.prototype.frsNpcData = function(mapId, eventId, actorId = 0) {
	const actor = $gameActors.actor(actorId) || $gameParty.leader();
	if (!actor._npcList[mapId]) actor._npcList[mapId] = [];
	if (!actor._npcList[mapId][eventId]) {
		actor._npcList[mapId][eventId] = { 
			fp: minLevel, 
			rp: minLevel
		};
	}
	return actor._npcList[mapId][eventId];
};

Game_Interpreter.prototype.removeNPC = function(mapId, eventId, actorId = 0) {
	const actor = actorId > 0 ? $gameActors.actor(actorId) : $gameParty.leader();
	const data = actor._npcList[mapId] || [];
	delete data[eventId];
	for (let i = data.length - 1; i > 0; i--) {
		if (data[i] === null) {
			data.splice(i, 1);
		} else {
			break;
		}
	}
};

// --

Game_Interpreter.prototype.addFriendship = function(actorId, value, toLeader = false) {
	const leader = $gameParty.leader();
	const actor = $gameActors.actor(actorId);
	leader.addFriendship(actorId, value);
	if (toLeader) actor.addFriendship(leader._actorId, value);
};

Game_Interpreter.prototype.addRomance = function(actorId, value, toLeader = false) {
	const leader = $gameParty.leader();
	const actor = $gameActors.actor(actorId);
	leader.addRomance(actorId, value);
	if (toLeader) actor.addRomance(leader._actorId, value);
};

Game_Interpreter.prototype.removeAllFriends = function(toLeader = false) {
	const leader = $gameParty.leader();
	if (toLeader) {
		for (const actor of leader.friends()) {
			delete actor._friendsList[leader._actorId];
		}
	}
	leader._friendsList = {};
	for (const map of leader._npcList) {
		if (!map) continue;
		let mapId = leader._npcList.indexOf(map);
		for (const ev of map) {
			if (!ev) continue;
			let eventId = map.indexOf(ev);
			let data = this.frsNpcData(mapId, eventId);
			if (data.rp > 0) {
				data.fp = minLevel + 1;
			} else {
				this.removeNPC(mapId, eventId);
			}
		}
	}
};

Game_Interpreter.prototype.removeAllRomance = function(toLeader = false) {
	const leader = $gameParty.leader();
	if (toLeader) {
		for (const actor of leader.romanced()) {
			delete actor._romanceList[leader._actorId];
		}
	}
	leader._romanceList = {};
	for (const map of leader._npcList) {
		if (!map) continue;
		let mapId = leader._npcList.indexOf(map);
		for (const ev of map) {
			if (!ev) continue;
			let eventId = map.indexOf(ev);
			let data = this.frsNpcData(mapId, eventId);
			data.rp = minLevel;
		}
	}
};

/******************************************************************************
	rmmz_scenes.js
******************************************************************************/

// --- SCENE MENU ---
const sceneMenu_creatCmdWindow = Scene_Menu.prototype.createCommandWindow;
Scene_Menu.prototype.createCommandWindow = function() {
	sceneMenu_creatCmdWindow.call(this);
	this._commandWindow.setHandler("relations", this.commandPersonal.bind(this));
};

const sceneMenu_cmdPersonal = Scene_Menu.prototype.commandPersonal;
Scene_Menu.prototype.commandPersonal = function() {
	const sym = this._commandWindow.currentSymbol();
	if (sym === "relations" && leaderMenu) {
		this._actor = $gameParty.leader();
		SceneManager.push(Scene_Relations);
	}
	sceneMenu_cmdPersonal.call(this);
};

const sceneMenu_onPersonalOk = Scene_Menu.prototype.onPersonalOk;
Scene_Menu.prototype.onPersonalOk = function() {
	const sym = this._commandWindow.currentSymbol();
	if (sym === "relations") {
		SceneManager.push(Scene_Relations);
	} else {
		sceneMenu_onPersonalOk.call(this);
	}
};


// --- SCENE BATTLE ---
const sceneBattle_terminate = Scene_Battle.prototype.terminate;
Scene_Battle.prototype.terminate = function() {
	const members = $gameParty.battleMembers();
	const list = $gameParty._actors;
	for (const actor of members) {
		// cycles through each actor in the party
		const actorId = actor._actorId;
		const dataActor = $dataActors[actorId];
		const value = dataActor.frsMeta 
			? dataActor.frsMeta['battle'] || 0 
			: 0;
		if (value !== 0) { // positive or negative number
			for (const id of list) { // All Members
				if (actorId === id) continue;
				actor.addFriendship(id, value);
			}
		}
	}
	sceneBattle_terminate.call(this);
};


// --- SCENE RELATIONS ---
function Scene_Relations() {
	this.initialize(...arguments);
}

Scene_Relations.prototype = Object.create(Scene_MenuBase.prototype);
Scene_Relations.prototype.constructor = Scene_Relations;

Scene_Relations.prototype.initialize = function() {
    Scene_MenuBase.prototype.initialize.call(this);
};

Scene_Relations.prototype.create = function() {
	Scene_MenuBase.prototype.create.call(this);
	this.createStatusWindow();
	this.createActorWindow();
};

Scene_Relations.prototype.createStatusWindow = function() {
	const rect = this.statusWindowRect();
	this._statusWindow = new Window_Relations(rect);
	this._statusWindow.setActor(this.actor());
	this._statusWindow.setHandler("ok", this.switchActor.bind(this));
	this._statusWindow.setHandler("cancel", this.popScene.bind(this));
	this.addWindow(this._statusWindow);
};

Scene_Relations.prototype.statusWindowRect = function() {
	const ww = Graphics.boxWidth - (Graphics.boxWidth / 4);
	const wh = Graphics.boxHeight - (Graphics.boxHeight / 4);
	const wx = (Graphics.boxWidth - ww) / 2;
	const wy = ((Graphics.boxHeight - wh) / 2) + this.offsetHeight();
	return new Rectangle(wx, wy, ww, wh);
};

Scene_Relations.prototype.offsetHeight = function() {
	return this.calcWindowHeight(1, true) / 2;
};

Scene_Relations.prototype.switchActor = function() {
	const item = this._statusWindow.item();
	if (item.type === 'actor') {
		this._statusWindow.setActor(item.actor);
		this._actorWindow.refresh(item.actor);
	} else {
		this._statusWindow.select(0);
		this._statusWindow.activate();
		SoundManager.playBuzzer();
		console.log("DebugError -> Can't switch out an actor for an event!");
	}
};

Scene_Relations.prototype.createActorWindow = function() {
	const rect = this.actorWindowRect();
	const actor = this._statusWindow._actor;
	this._actorWindow = new Window_CurrentActor(rect, actor);
	this.addWindow(this._actorWindow);
};

Scene_Relations.prototype.actorWindowRect = function() {
	const ww = this._statusWindow.width;
	const wh = this.calcWindowHeight(1, true);
	const wx = this._statusWindow.x;
	const wy = this._statusWindow.y - wh;
	return new Rectangle(wx, wy, ww, wh);
};

/******************************************************************************
	rmmz_windows.js
******************************************************************************/

// --- WINDOW BASE ---
Window_Base.prototype.sprite = function(actor) {
	const name = actor._characterName;
	const bitmap = ImageManager.loadCharacter(name);
    const big = ImageManager.isBigCharacter(name);
    const pw = bitmap.width / (big ? 3 : 12);
    const ph = bitmap.height / (big ? 4 : 8);
	return { width: pw, height: ph };
};


// --- WINDOW MENU_COMMAND ---
if (!Imported['VisuMZ_1_MainMenuCore']) {
	const wmc_optionalCommands = Window_MenuCommand.prototype.addOriginalCommands;
	Window_MenuCommand.prototype.addOriginalCommands = function() {
		wmc_optionalCommands.call(this);
		this.addRelationsCommand();
	};

	Window_MenuCommand.prototype.addRelationsCommand = function() {
		const enabled = this.areRelationsEnabled();
		this.addCommand("Relations", "relations", enabled);
	};
}

Window_MenuCommand.prototype.areRelationsEnabled = function() {
	const pc = $gameParty.leader();
	return pc.friends().length > 0 || pc.npcEvents().length > 0;
};


// --- WINDOW RELATIONS ---
function Window_Relations() {
	this.initialize(...arguments);
}

Window_Relations.prototype = Object.create(Window_StatusBase.prototype);
Window_Relations.prototype.constructor = Window_Relations;

Window_Relations.prototype.initialize = function(rect) {
	Window_StatusBase.prototype.initialize.call(this, rect);
	this._actor = null;
};

Window_Relations.prototype.setActor = function(actor) {
	if (!actor) {
		this._actor = null;
		SceneManager._scene.popScene();
	}
	const friends = actor.friends().length;
	const events = actor.npcEvents().length;
	if (!friends && !events) {
		this._actor = null;
		SceneManager._scene.popScene();
		console.log("DebugError -> Actor has no relations!");
	}
	if (this._actor !== actor) {
		this._actor = actor;
		this.refresh();
		this.select(0);
		this.activate();
	}
};

Window_Relations.prototype.maxItems = function() {
    return this._data ? this._data.length : 1;
};

Window_Relations.prototype.numVisibleRows = function() {
    return 9;
};

Window_Relations.prototype.itemHeight = function() {
    return Math.floor(this.innerHeight / this.numVisibleRows());
};

Window_Relations.prototype.item = function() {
    return this.itemAt(this.index());
};

Window_Relations.prototype.itemAt = function(index) {
    return this._data && index >= 0 ? this._data[index] : null;
};

Window_Relations.prototype.refresh = function() {
	this.makeItemList();
	Window_Selectable.prototype.refresh.call(this);
};

Window_Relations.prototype.makeItemList = function() {
	this._data = [];
	if (this._actor) {
		for (const friend of this._actor.friends()) {
			let data = { type: 'actor', actor: friend };
			this._data.push(data);
		}
		for (const event of this._actor.npcEvents()) {
			let data = { type: 'event', actor: event };
			this._data.push(data);
		}
	}
};

Window_Relations.prototype.drawItem = function(index) {
    const item = this.itemAt(index); // friend or lover
    const rect = this.itemLineRect(index);
	const sprite = this.sprite(item.actor);
	const spriteX = rect.x + (sprite.width / 2);
	const spriteY = rect.y + (sprite.height - 7);
	const nameX = rect.x + sprite.width;
	const nameW = rect.width / 3;
	const lMin = Math.max(loverMin, minLevel);
	this.changePaintOpacity(true);
	this.drawActorCharacter(item.actor, spriteX, spriteY);
	this.drawActorName(item, nameX, rect.y, rect.width);
	let curLevel = this.relation('friend', item); 
	let romLevel = this.relation('romance', item);
	let rate = curLevel > minLevel && maxLevel > 0 ? curLevel / maxLevel : 0;	
	let color1 = colorFC1; //"rgba(0, 200, 0, 0.5)";
	let color2 = colorFC2; //"rgba(0, 150, 200, 0.8)";
	let gaugeY = rect.y - 19;
	this.drawGauge(nameX + nameW, gaugeY, 200, 12, rate, color1, color2);
	rate = maxLevel > 0 ? romLevel / maxLevel : 0;
	color1 = colorRC1; //"rgba(255, 192, 203, 0.5)";
	color2 = colorRC2; //"rgba(255, 25, 25, 0.8)";
	gaugeY += 15;
	this.drawGauge(nameX + nameW, gaugeY, 200, 12, rate, color1, color2);
	if (romLevel >= lMin) { // icon for 'engaged' only
		const iconX = nameX + nameW + 208;
		this.drawIcon(loverIcon, iconX, rect.y + 2);
	}
	this.drawStates(item.actor, rect);
};

Window_Relations.prototype.relation = function(relation, item) {
	const actor = item.actor;
	switch (item.type) {
		case 'actor': {
			const id = actor._actorId;
			switch (relation) {
				case 'friend': return this._actor.friendLevel(id);
				case 'romance': return this._actor.romanceLevel(id);
				default: return 0;
			}
		} break;
		case 'event': {
			switch (relation) {
				case 'friend': return actor.fp;
				case 'romance': return actor.rp;
				default: return 0;
			}
		} break;
	}
};

Window_Relations.prototype.drawActorCharacter = function(actor, x, y) {
    this.drawCharacter(actor._characterName, actor._characterIndex, x, y);
};

Window_Relations.prototype.drawActorName = function(item, x, y, width) {
    width = width || 168;
	const actor = item.actor;
	const name = item.type === 'event' 
		? evPrefix + actor._name + evPostfix 
		: actor._name;
    this.changeTextColor(ColorManager.normalColor());
    this.drawText(name, x, y, width);
};

Window_Relations.prototype.drawGauge = function(x, y, width, height, rate, color1, color2) {
    y = y + this.lineHeight() - height;
	const fillW = Math.floor((width - 2) * rate);
	const fillH = height - 2;
	const color0 = ColorManager.gaugeBackColor();
    this.contents.fillRect(x, y, width, height, color0);
    this.contents.gradientFillRect(x + 1, y + 1, fillW, fillH, color1, color2);
};

Window_Relations.prototype.drawStates = function(actor, rect) {
	const arr = actor._frsStates || [];
	const iw = ImageManager.iconWidth;
	const x = rect.x;
	const y = rect.y;
	let width = rect.width;
	let counter = 0;
	for (let i = arr.length - 1; i >= 0; i--) {
		if (counter >= 5) break;
		let state = $dataStates[arr[i]];
		let iconIndex = state.iconIndex || 0;
		if (iconIndex > 0) {
			width -= iw;
			this.drawIcon(iconIndex, x + width, y + 2);
			counter++;
		}
	}
};


// -- WINDOW CURRENT_ACTOR --
function Window_CurrentActor() {
	this.initialize(...arguments);
}

Window_CurrentActor.prototype = Object.create(Window_Selectable.prototype);
Window_CurrentActor.prototype.constructor = Window_CurrentActor;

Window_CurrentActor.prototype.initialize = function(rect, actor) {
	Window_Selectable.prototype.initialize.call(this, rect);
	this.refresh(actor);
};

Window_CurrentActor.prototype.refresh = function(actor) {
	const rect = this.itemLineRect(0);
    const x = rect.x;
    const y = rect.y;
    const width = rect.width;
	const text = relationText;
	const sprite = this.sprite(actor);
	const spriteY = rect.y + (sprite.height - 7);
	const actorX = rect.x + this.textWidth(text) + 24;
	const nameX = rect.x + this.textWidth(text) + sprite.width;
    this.contents.clear();
	this.drawText(text, x, y, width);
	this.drawActorCharacter(actor, actorX, spriteY);
	this.drawActorName(actor, nameX, y, width);
};

Window_CurrentActor.prototype.drawActorCharacter = function(actor, x, y) {
    this.drawCharacter(actor.characterName(), actor.characterIndex(), x, y);
};

Window_CurrentActor.prototype.drawActorName = function(actor, x, y, width) {
    width = width || 168;
    this.changeTextColor(ColorManager.hpColor(actor));
    this.drawText(actor.name(), x, y, width);
};

})();

// --- OWN CLASSES ---
function LordV_Event() {
	this.initialize(...arguments);
}

LordV_Event.prototype = Object.create(Game_Event.prototype);
LordV_Event.prototype.constructor = LordV_Event;

LordV_Event.prototype.initialize = function(mapId, eventId) {
    Game_Event.prototype.initialize.call(this, mapId, eventId);
};

LordV_Event.prototype.event = function() {
	return $gameMap._frsEvents[this._eventId];
};
