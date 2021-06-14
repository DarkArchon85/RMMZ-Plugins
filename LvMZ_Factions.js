// ============================================================================
//  LordValinar Plugin - Factions, Races, Relations and Titles
//  LvMZ_Factions.js
// ============================================================================

var Imported = Imported || {};
Imported["LvMZFactions"] = true;

// Only acquire the essentials
if (!Imported['LvMZCore']) {
	/**
	* Formats a percentile number to remove all trails
	*
	* @memberof JsExtensions
	* @returns {number} A formatted number
	*/
	Number.prototype.percent = function() {
		return Number(this.toFixed(2)).clamp(-1,1);
	};

	/**
	 * Searches an array filled with objects to find the index
	 *   by key and value.
	 *
	 * @memberof JsExtensions
	 * @param {string} key object to map
	 * @param {any} value the value to match in the mapped array
	 * @returns {number} Index of the array by key and value
	 */
	Array.prototype.indexByKey = function(key, value) {
		let count = 0;
		return this.filter(entry => {
			if (!entry) count++;
			return entry !== null;
		}).map(ob => obj[key]).indexOf(value) + count;
	};
	
	/**
	 * Retrieves an actor for event lists
	 *
	 * @memberof JsExtensions
	 * @param {number} Index of actor in party
	 * @returns {object} Game_Actor
	 */
	Game_Interpreter.prototype.actor = function(index=0) {
		return $gameParty.battleMembers()[index];
	};
}

/*:
 * @target MZ
 * @plugindesc [v1.2] Core Plugin - Required for other plugins interacting
 * with factions, relationship, genders or titles (ex: LvMZ_Economy.js)
 * @author LordValinar
 * @url https://github.com/DarkArchon85/RMMZ-Plugins
 *
 * @help
 * ----------------------------------------------------------------------------
 * Introduction
 * ----------------------------------------------------------------------------
 *
 * Have you ever wanted to align yourself with the Thieves Guild? Or perhaps
 * identify as an Elf? Make friends with the local merchant? Show off your 
 * title as a Hero?
 *
 * This plugin provides you the tools you need (script calls and plugin 
 * commands) to manipulate that data; however, it does not act upon that 
 * data. That will be up to you to decide on how to execute. For example,
 * does being a pirate mean no access to town, or any NPC with the 'Guard'
 * faction will approach you to apprehend you on sight? (Event detectors).
 * These will all have to be supplied externally.
 *
 * This plugin is part of a set, but can be used independently.
 *
 * == THE ECONOMICS TRINITY ==
 *  - LvMZ_Factions.js
 *  - LvMZ_Economy.js
 *  - LvMZ_Currencies.js
 *
 * ----------------------------------------------------------------------------
 * Instructions
 * ----------------------------------------------------------------------------
 *
 * This plugin comes pre-ready with factions, races, relation states, 
 * and titles to use, but you can customize them however you want. A 
 * few things to be aware of:
 *
 *  -> You cannot set a race if using VisuStella's ElementStatesCore.
 *     You will need to set the race using their plugin commands, although
 *     you can still use the script calls to get the race trait here.
 *
 *  -> All functionality only works for ACTORS and EVENTS. A couple will
 *     allow setting to the whole PARTY however.
 *
 *  -> When setting or retrieving data such as a Faction, Race, or 
 *     Title name, formatting matters! If the name in the parameters
 *     is set to something like "High Elf", and you want to use a 
 *     plugin command to change the actor's race to that race, make 
 *     sure it is spelled exactly the same, with capitals and the space.
 *
 *
 * -- Actor Notetags --
 *
 * You can preset actors with a Faction, Race, and Title (or multiple)
 * Use the following notetags:
 *
 * <Faction: name>
 *   - Name: Must match one setup in the parameters.
 *
 * <Race: name>
 *   - Name: Must match one setup in the paramters.
 *
 * <Gender: name>
 *   - Name; Must match one setup in the parameters.
 *
 * <Title: name>
 *   - Name: Must match one setup in the parameters.
 *     Can setup multiple titles by adding new lines.
 *
 *
 * -- Event Comment Tags --
 *
 * You can setup factions, races, and titles to events as well!
 * Create a comment and setup the tags as above; however, unlike
 * actors, you will require 1 more tag BEFORE calling the others:
 *   <NPC>      - This will identify the event to use faction data.
 *
 * In addition, you can setup shop NPCs with initial adjustments 
 * to prices towards a peticular faction, race, relation, or title.
 *   <Init: type name amount>
 *     Type: Faction | Race | Relation | Title | Gender
 *     Name: Name of the type(above) that exists in the parameters.
 *     Amount: -100 to 100 to adjust current values
 *   Example: If current relations with High Elves is 5% and you 
 *   want to increase it to 10% you would use:
 *   <Init: Race High Elf 5>
 * 
 *
 * -- Using Plugin Commands --
 *
 * These are pretty straight forward, and most come with mini-help 
 * instructions already.
 * >> Regarding target Types and IDs:
 *   Type: As mentioned, this plugin will target either an Actor or Event.
 *     Setting faction status and titles can target the Party.
 *
 *   ID: When regarding to Actors, this is in order (starting from 1)
 *     of the party (either top -> down, or left -> right). So the 
 *     Party Leader is always #1. Regarding to events, this is just 
 *     their event ID on the current map (1-999).
 *
 * >> Regarding the "Change Relation" plugin command:
 *   By adjusting up (positive numbers) or down (negative), the only 
 *     direct limits are what you setup in the plugin parameters.
 *     Otherwise it defaults to a range of -9999 to 9999.
 *
 *   This value will determine what the relation "name" that can be 
 *     displayed, and what price adjustments are made. In the example 
 *     "Lovers" get a 5% discount when the relationship value is 
 *     greater than or equal to 91, and also less than or equal to 100.
 *
 * >> Using Variables For Names
 *   For the 5 plugin commands: Set Faction, Set Race, Set Gender, 
 *     Add Title and Remove Title, you can substitute the faction names 
 *     with a variable. (Example: \v[13])
 *
 *   Keep in mind however, that the rules on formatting applies to the 
 *     variable value as well. So if you have variable 13 = "Human"
 *     when calling \v[13] for Set Race, then it will be correct where 
 *     as variable 13 = "Highelf" will be incorrect (unless of course 
 *     you have a race with "Highelf" as the name).
 *
 * ----------------------------------------------------------------------------
 * Script Calls
 * ----------------------------------------------------------------------------
 *
 * Here are the following script calls that you can use in an event.
 * "this" refers to the interpreter so the function can hook to what 
 * actual function it needs (->  object.lvSet / object.lvGet), which 
 * you can use as well for a more direct method. (see further below)
 *
 * > "object" must be an actor ( ie. $gameParty.leader() ) or an Event
 *   ( ie. $gameMap.event(id) )
 *
 * > "this" (without quotes) can be used in substitution of "object" 
 *   if the data you want to retrieve is from the event running the script.
 *
 * > Likewise 'pc' (with quotes) can be used in substitution of "object"
 *   if the data you want to retrieve is from the party leader.
 *
 * > "source" is the source object, and the main object that is being 
 *   checked/compared to "target". Both objects must be either an 
 *   Actor or Event, as usual.
 * 
 * this.getFaction(object)                      - Returns a string
 * this.getFactionHidden(object)                - Returns a boolean
 * this.isFactionLeader(object, name)           - Returns a boolean
 * this.getRace(object)                         - Returns a string
 * this.getGender(object)                       - Returns a string
 * this.isMonsterRace(object)                   - Returns a boolean
 * this.racesMatch(object)                      - Returns a boolean
 * this.getRelationValue(source, target)        - Returns a number
 * this.getRelationName(source, target)         - Returns a string
 * this.checkTitle(object, name)                - Returns a boolean
 *
 *
 * - = { For More Advanced Users } = -
 *
 * The functions lvSet and lvGet are available for both the Game_Actor 
 *   and the Game_Event classes. There are 2 main parameters:
 * - MethodName   {string}
 * - MethodParams {array}
 *
 * Example:
 *  actor.lvSet('setFaction', [name, isLeader]);
 *
 * 'setFaction':  The method name (LordV_Factions.prototype.setFaction)
 * [name,..]:     The name of the faction ("Villagers")
 * [..,isLeader]: Boolean to set if actor is leader of said faction.
 * 
 * Here is the complete list of methodNames and their parameter types:
 *  >> lvSet <<
 *
 * setPriceAdjust       [target{object}, type{string}, amount{number}]
 *   - Target: The actor or event to compare with
 *   - Type:   'faction', 'race', 'relation', or 'title'
 *   - Amount: Positive/Negative number to adjust current value
 *
 * setFaction           [name{string}, leader{boolean}]
 *   - Name:   The faction name to set (Case-Sensitive and must exist!)
 *   - Leader: Determines if the source object calling this is the leader 
 *
 * setRelation          [target{object}, amount{number}]
 *   - Target: The actor or event to compare with
 *   - Amount: Positive/Negative number to adjust current value
 *
 * setRace              [name{string}]
 *   - Name:   The name of the race (Case-Sensitive and must exist!)
 *
 * setGender            [name{string}]
 *   - Name:   The name of the gender (Case-Sensitive and must exist!)
 *
 * addTitle             [name{string}]
 *   - Name:   The name of the title (Case-Sensitive and must exist!)
 *
 * removeTitle          [name{string}]
 *   - Name:   The name of the title (Case-Sensitive and must exist!)
 *
 * setHiddenFaction     [hidden{boolean}]
 *   - Hidden: If hidden, members of this faction aren't affected by prices.
 *
 * resetSettings        no parameters
 *   - Clears the Actor or Event's faction, race, relationships, and 
 *     titles; Re-initializes from what they have in note/comment tags.
 *
 *
 *  >> lvGet <<
 *
 * priceAdjust          [target{object}, type{string}]
 *   - Target: The actor or event to compare with
 *   - Type:   'faction', 'race', 'relation', or 'title'
 *
 * relationValue        [target{object}]
 *   - Target: The actor or event to compare with
 *
 * checkTitle           [name{string}]
 *   - Name:   Name of the title to check
 *
 * relationName         [value{number}]
 *   - Value:  The relationship value to compare and retrieve the name.
 *
 * factionLeader        [name{string}]
 *   - Name:   Name of the faction to check leader status of
 *
 * The following have no need of parameters:
 * isFactionHidden      n/a
 * factionValid         n/a
 * curFaction           n/a
 * race                 n/a
 * gender               n/a
 * isMonster            n/a
 * firstTitle           n/a
 * nextTitle            n/a
 * prevTitle            n/a
 * lastTitle            n/a
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
 * v1.2 - Fixed the event conditions to include original checks (updated demo)
 * v1.1 - Added gender-related list, script calls, and plugin commands
 * v1.0 - Finished plugin
 *
 * ----------------------------------------------------------------------------
 *
 * @param FactionList
 * @text Faction Relations
 * @type struct<Faction>[]
 * @desc List of possible factions. If the player is in one of 
 * these factions (or even the leader), they get discounts.
 * @default ["{\"Name\":\"Imperium\",\"RelationList\":\"[\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Imperium\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"10\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Nobles\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Guards\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Merchants\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Villagers\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Thieves Guild\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"-5\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Pirates\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"-5\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Nature\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"None\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\"]\",\"hiddenFac\":\"false\"}","{\"Name\":\"Nobles\",\"RelationList\":\"[\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Imperium\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"5\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Nobles\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"5\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Guards\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Merchants\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Villagers\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"-1\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Thieves Guild\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"-5\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Pirates\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"-5\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Nature\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"None\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\"]\",\"hiddenFac\":\"false\"}","{\"Name\":\"Guards\",\"RelationList\":\"[\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Imperium\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Nobles\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Guards\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Merchants\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Villagers\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Thieves Guild\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Pirates\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Nature\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"None\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\"]\",\"hiddenFac\":\"false\"}","{\"Name\":\"Merchants\",\"RelationList\":\"[\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Imperium\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Nobles\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Guards\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Merchants\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"5\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Villagers\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"1\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Thieves Guild\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"-5\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Pirates\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"-5\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Nature\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"None\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\"]\",\"hiddenFac\":\"false\"}","{\"Name\":\"Villagers\",\"RelationList\":\"[\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Imperium\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"-5\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Nobles\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"-1\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Guards\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Merchants\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Villagers\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Thieves Guild\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"-5\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Pirates\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"-5\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Nature\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"None\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\"]\",\"hiddenFac\":\"false\"}","{\"Name\":\"Thieves Guild\",\"RelationList\":\"[\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Imperium\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"-5\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Nobles\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Guards\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Merchants\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Villagers\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"-1\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Thieves Guild\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"5\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Pirates\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Nature\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"None\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\"]\",\"hiddenFac\":\"true\"}","{\"Name\":\"Pirates\",\"RelationList\":\"[\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Imperium\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"-5\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Nobles\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Guards\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"-5\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Merchants\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Villagers\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Thieves Guild\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Pirates\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"5\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Nature\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"None\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\"]\",\"hiddenFac\":\"false\"}","{\"Name\":\"Nature\",\"RelationList\":\"[\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Imperium\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"-5\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Nobles\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Guards\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Merchants\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Villagers\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Thieves Guild\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Pirates\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Nature\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"None\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\"]\",\"hiddenFac\":\"false\"}","{\"Name\":\"None\",\"RelationList\":\"[\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Imperium\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Nobles\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Guards\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Merchants\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Villagers\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Thieves Guild\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Pirates\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Nature\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"None\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\"]\",\"hiddenFac\":\"false\"}"]
 *
 * @param RaceList
 * @text Racial Relations
 * @type struct<Race>[]
 * @desc List of Races and their relations with each other.
 * Compatable with ElementsStatesCore (VisuStella)
 * @default ["{\"Name\":\"Human\",\"RelationList\":\"[\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Human\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"5\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"High Elf\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Wood Elf\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Dark Elf\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"-5\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Dwarf\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"5\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Gnome\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"5\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Halfling\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"5\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Wolfkin\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"-5\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Felyne\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"-5\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Lizardman\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"-5\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Vampire\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\"]\",\"isMonster\":\"false\"}","{\"Name\":\"High Elf\",\"RelationList\":\"[\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Human\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"High Elf\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"10\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Wood Elf\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"5\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Dark Elf\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"-5\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Dwarf\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"-5\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Gnome\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Halfling\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Wolfkin\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Felyne\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Lizardman\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"-5\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Vampire\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\"]\",\"isMonster\":\"false\"}","{\"Name\":\"Wood Elf\",\"RelationList\":\"[\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Human\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"-5\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"High Elf\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"5\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Wood Elf\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"5\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Dark Elf\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"-5\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Dwarf\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"-5\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Gnome\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Halfling\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Wolfkin\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"5\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Felyne\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"5\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Lizardman\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"-5\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Vampire\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\"]\",\"isMonster\":\"false\"}","{\"Name\":\"Dark Elf\",\"RelationList\":\"[\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Human\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"High Elf\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"-5\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Wood Elf\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"-5\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Dark Elf\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"10\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Dwarf\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Gnome\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Halfling\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Wolfkin\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Felyne\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Lizardman\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Vampire\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\"]\",\"isMonster\":\"false\"}","{\"Name\":\"Dwarf\",\"RelationList\":\"[\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Human\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"5\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"High Elf\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"-5\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Wood Elf\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"-5\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Dark Elf\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"-5\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Dwarf\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"10\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Gnome\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"5\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Halfling\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Wolfkin\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Felyne\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Lizardman\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"-5\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Vampire\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\"]\",\"isMonster\":\"false\"}","{\"Name\":\"Gnome\",\"RelationList\":\"[\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Human\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"High Elf\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Wood Elf\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Dark Elf\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Dwarf\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"5\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Gnome\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"5\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Halfling\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"5\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Wolfkin\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"-5\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Felyne\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"-5\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Lizardman\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"-5\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Vampire\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\"]\",\"isMonster\":\"false\"}","{\"Name\":\"Halfling\",\"RelationList\":\"[\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Human\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"5\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"High Elf\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Wood Elf\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Dark Elf\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"-5\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Dwarf\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Gnome\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Halfling\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"5\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Wolfkin\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Felyne\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Lizardman\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"-5\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Vampire\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\"]\",\"isMonster\":\"false\"}","{\"Name\":\"Wolfkin\",\"RelationList\":\"[\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Human\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"-5\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"High Elf\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Wood Elf\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Dark Elf\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Dwarf\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Gnome\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Halfling\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Wolfkin\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"10\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Felyne\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"-5\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Lizardman\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Vampire\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\"]\",\"isMonster\":\"true\"}","{\"Name\":\"Felyne\",\"RelationList\":\"[\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Human\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"-5\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"High Elf\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Wood Elf\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Dark Elf\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Dwarf\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Gnome\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Halfling\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Wolfkin\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"-5\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Felyne\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"10\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Lizardman\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Vampire\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\"]\",\"isMonster\":\"true\"}","{\"Name\":\"Lizardman\",\"RelationList\":\"[\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Human\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"-5\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"High Elf\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Wood Elf\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Dark Elf\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Dwarf\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"-5\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Gnome\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"-5\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Halfling\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Wolfkin\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"5\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Felyne\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"-5\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Lizardman\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"15\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Vampire\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\"]\",\"isMonster\":\"true\"}","{\"Name\":\"Vampire\",\"RelationList\":\"[\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Human\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"High Elf\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Wood Elf\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Dark Elf\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Dwarf\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Gnome\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Halfling\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Wolfkin\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Felyne\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Lizardman\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Vampire\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\"]\",\"isMonster\":\"true\"}"]
 *
 * @param RelationScale
 * @text Relationship Scale
 * @type struct<Relationship>[]
 * @desc List of name and value of each relationship status.
 * From hostile to friendly, or otherwise defined by you!
 * @default ["{\"Name\":\"Lovers\",\"MinValue\":\"91\",\"MaxValue\":\"100\",\"Value\":\"5\"}","{\"Name\":\"Best Friends\",\"MinValue\":\"75\",\"MaxValue\":\"90\",\"Value\":\"3\"}","{\"Name\":\"Friends\",\"MinValue\":\"50\",\"MaxValue\":\"74\",\"Value\":\"2\"}","{\"Name\":\"Acquaintances\",\"MinValue\":\"25\",\"MaxValue\":\"49\",\"Value\":\"1\"}","{\"Name\":\"Just Met\",\"MinValue\":\"6\",\"MaxValue\":\"24\",\"Value\":\"0\"}","{\"Name\":\"Unknown\",\"MinValue\":\"0\",\"MaxValue\":\"5\",\"Value\":\"0\"}","{\"Name\":\"Rivals\",\"MinValue\":\"-1\",\"MaxValue\":\"-5\",\"Value\":\"0\"}","{\"Name\":\"Frienemies\",\"MinValue\":\"-6\",\"MaxValue\":\"-25\",\"Value\":\"-1\"}","{\"Name\":\"Enemies\",\"MinValue\":\"-26\",\"MaxValue\":\"-85\",\"Value\":\"-3\"}","{\"Name\":\"Nemesis\",\"MinValue\":\"-86\",\"MaxValue\":\"-100\",\"Value\":\"-5\"}"]
 *
 * @param TitleList
 * @text Title Relations
 * @type struct<Title>[]
 * @desc List of titles
 * @default ["{\"Name\":\"Monarch\",\"Value\":\"100\"}","{\"Name\":\"Royal\",\"Value\":\"50\"}","{\"Name\":\"Heir\",\"Value\":\"25\"}","{\"Name\":\"Noble\",\"Value\":\"15\"}","{\"Name\":\"Knight\",\"Value\":\"5\"}","{\"Name\":\"Hero\",\"Value\":\"1\"}","{\"Name\":\"Criminal\",\"Value\":\"-5\"}"]
 *
 * @param GenderList
 * @text Gender Relations
 * @type struct<Gender>[]
 * @desc List of Genders and their relations with each other.
 * @default ["{\"Name\":\"Male\",\"GenderList\":\"[\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Male\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Female\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Both\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"None\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Other\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\"]\"}","{\"Name\":\"Female\",\"GenderList\":\"[\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Male\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Female\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Both\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"None\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Other\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\"]\"}","{\"Name\":\"Both\",\"GenderList\":\"[\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Male\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Female\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Both\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"None\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Other\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\"]\"}","{\"Name\":\"None\",\"GenderList\":\"[\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Male\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Female\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Both\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"None\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Other\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\"]\"}","{\"Name\":\"Other\",\"GenderList\":\"[\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Male\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Female\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Both\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"None\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Other\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\"]\"}"]
 *
 * @ --------------------------------------------------------------------------
 *
 * @command setFaction
 * @text Set Target Faction
 * @desc Sets a target to be part of a specific faction.
 *
 * @arg target
 * @text Target
 * @type select
 * @option Actor
 * @option Party
 * @option Event
 * @desc Choose whether an actor or event gets this.
 * Setting to Party ignores targetId
 * @default Actor
 *
 * @arg targetId
 * @text Target ID
 * @type number
 * @decimals 0
 * @min 1
 * @max 999
 * @desc The player or event ID (player ID refers to order 
 * in the party menu: 1 = party leader).
 * @default 1
 *
 * @arg factionName
 * @text Choose Faction
 * @desc Faction name to be assigned.
 * Reminder: Case-Sensitive and the faction must exist!
 * @default 
 *
 * @arg leader
 * @text Set Leader
 * @type boolean
 * @on Leader
 * @off Member
 * @desc Set whether or not Target is the leader of the faction.
 * If using PARTY, this defaults to false
 * @default false
 *
 * @ --------------------------------------------------------------------------
 *
 * @command facStatus
 * @text Set Faction Status
 * @desc Setting the hidden status of the target's faction.
 * Can also set for whole party (targetID is ignored)
 *
 * @arg target
 * @text Target Type
 * @type select
 * @option Actor
 * @option Party
 * @option Event
 * @desc Choose an Actor or Event to affect.
 * NOTE: targetID ignored if using "Party"
 * @default Actor
 *
 * @arg targetId
 * @text Target ID
 * @type number
 * @decimals 0
 * @min 1
 * @max 999
 * @desc The player or event ID (player ID refers to order 
 * in the party menu: 1 = party leader).
 * @default 1
 *
 * @arg status
 * @text Set Status
 * @type boolean
 * @on Hide
 * @off Reveal
 * @desc Do you with to hide or reveal the faction status for 
 * the target?
 * @default false
 *
 * @ --------------------------------------------------------------------------
 *
 * @command setRace
 * @text Set Target Race
 * @desc Sets a target to be a specific race.
 * Reminder: Case-Sensitive and the race must exist!
 *
 * @arg target
 * @text Target
 * @type select
 * @option Actor
 * @option Event
 * @desc Choose whether an actor or event gets this.
 * @default Actor
 *
 * @arg targetId
 * @text Target ID
 * @type number
 * @decimals 0
 * @min 1
 * @max 999
 * @desc The player or event ID (player ID refers to order 
 * in the party menu: 1 = party leader).
 * @default 1
 *
 * @arg raceName
 * @text Choose Race
 * @desc The name of the race to switch to. This will only 
 * work if NOT using VisuStella's ElementStatesCore!
 * @default 
 *
 * @ --------------------------------------------------------------------------
 *
 * @command setRelation
 * @text Change Relation
 * @desc Changes the relationship between Origin and Target.
 * See (instructions) for details.
 *
 * @arg source
 * @text Origin
 * @type select
 * @option Actor
 * @option Event
 * @desc Choose how (actor or event) feels about target.
 * @default Actor
 *
 * @arg sourceId
 * @text Origin ID
 * @type number
 * @decimals 0
 * @min 1
 * @max 999
 * @desc The player or event ID (player ID refers to order 
 * in the party menu: 1 = party leader).
 * @default 1
 *
 * @arg target
 * @text Target
 * @type select
 * @option Actor
 * @option Party
 * @option Event
 * @desc Choose the actor or event that Origin feels about.
 * @default Actor
 *
 * @arg targetId
 * @text Target ID
 * @type number
 * @decimals 0
 * @min 1
 * @max 999
 * @desc The player or event ID (player ID refers to order 
 * in the party menu: 1 = party leader).
 * @default 1
 *
 * @arg value
 * @text Adjustment
 * @type number
 * @decimals 0
 * @min -9999
 * @max 9999
 * @desc How much to adjust the relationship between Origin 
 * has with Target.
 * @default 0
 *
 * @ --------------------------------------------------------------------------
 *
 * @command addTitle
 * @text Add Title
 * @desc Gives the target a title! Can have multiple.
 * Reminder: Case-Sensitive and the title must exist!
 *
 * @arg target
 * @text Target
 * @type select
 * @option Actor
 * @option Party
 * @option Event
 * @desc Choose whether an actor or event gets this.
 * NOTE: targetID ignored if using "Party"
 * @default Actor
 *
 * @arg targetId
 * @text Target ID
 * @type number
 * @decimals 0
 * @min 1
 * @max 999
 * @desc The player or event ID (player ID refers to order 
 * in the party menu: 1 = party leader).
 * @default 1
 *
 * @arg titleName
 * @text Choose Title
 * @desc The title to bestow.
 * Reminder: Case-Sensitive and the title must exist!
 * @default 
 *
 * @ --------------------------------------------------------------------------
 *
 * @command remTitle
 * @text Remove Title
 * @desc Remove an unwanted title
 *
 * @arg target
 * @text Target
 * @type select
 * @option Actor
 * @option Party
 * @option Event
 * @desc Choose whether an actor or event gets this.
 * NOTE: targetID ignored if using "Party"
 * @default Actor
 *
 * @arg targetId
 * @text Target ID
 * @type number
 * @decimals 0
 * @min 1
 * @max 999
 * @desc The player or event ID (player ID refers to order 
 * in the party menu: 1 = party leader).
 * @default 1
 *
 * @arg titleName
 * @text Title Name
 * @desc The title by name.
 * NOTE: Case-Sensitive and must already exist on target.
 * @default 
 *
 * @ --------------------------------------------------------------------------
 *
 * @command clearTitles
 * @text Clear All Titles
 * @desc Removes ALL titles from target
 *
 * @arg target
 * @text Target
 * @type select
 * @option Actor
 * @option Party
 * @option Event
 * @desc Choose whether an actor or event gets this.
 * NOTE: targetID ignored if using "Party"
 * @default Actor
 *
 * @arg targetId
 * @text Target ID
 * @type number
 * @decimals 0
 * @min 1
 * @max 999
 * @desc The player or event ID (player ID refers to order 
 * in the party menu: 1 = party leader).
 * @default 1
 *
 * @ --------------------------------------------------------------------------
 *
 * @command resetAll
 * @text Reset Settings
 * @desc Resets the target's settings based on note/comment
 * tags (faction, race, titles); clears the rest.
 * 
 * @arg target
 * @text Target
 * @type select
 * @option Actor
 * @option Party
 * @desc Choose an actor or the whole party.
 * NOTE: targetID ignored if using "Party"
 * @default Actor
 *
 * @arg targetId
 * @text Target ID
 * @type number
 * @decimals 0
 * @min 1
 * @max 999
 * @desc The player ID in party order (1 = party leader).
 * @default 1
 *
 * @ --------------------------------------------------------------------------
 *
 * @command setGender
 * @text Set Target Gender
 * @desc Sets a target to be a specific gender.
 * Reminder: Case-Sensitive and the gender must exist!
 *
 * @arg target
 * @text Target
 * @type select
 * @option Actor
 * @option Event
 * @desc Choose whether an actor or event gets this.
 * @default Actor
 *
 * @arg targetId
 * @text Target ID
 * @type number
 * @decimals 0
 * @min 1
 * @max 999
 * @desc The player or event ID (player ID refers to order 
 * in the party menu: 1 = party leader).
 * @default 1
 *
 * @arg genderName
 * @text Choose Gender
 * @desc The name of the gender to switch to.
 * @default 
 */
// ============================================================================
/*~struct~Faction:
 * @param Name
 * @text Faction Name
 * @desc What is the name of this faction?
 * @default 
 *
 * @param RelationList
 * @text Relations
 * @type struct<FacRelation>[]
 * @desc List of relations to this faction. Friends or foe?
 * @default []
 *
 * @param hiddenFac
 * @text Hidden Faction
 * @type boolean
 * @on Hidden
 * @off Known
 * @desc Adjustments for this faction don't happen until
 * it is declared for that actor or event.
 * @default false
 */
// ============================================================================
/*~struct~FacRelation:
 * @param Relation
 * @text Relation Name
 * @desc Name of the faction.
 * @default 
 *
 * @param Value
 * @text Shop Price Adjustment
 * @type number
 * @decimals 0
 * @min -100
 * @max 100
 * @desc Percentile value of prices to be changed in shops.
 * Positive numbers are discounts!
 * @default 0
 */
// ============================================================================
/*~struct~Race:
 * @param Name
 * @text Race Name
 * @desc What is the name of this race?
 * @default 
 *
 * @param RelationList
 * @text Relations
 * @type struct<RaceRelation>[]
 * @desc List of relations to this race. Friends or foe?
 * A value of 0 = neutral.
 * @default []
 *
 * @param isMonster
 * @text Monster Race
 * @type boolean
 * @on Monster
 * @off Normal
 * @desc Is this race considered a "monster" by others? This
 * can be used for certain NPC behaviors (ie. Flee or Attack)
 * @default false
 */
// ============================================================================
/*~struct~RaceRelation:
 * @param Relation
 * @text Relation Name
 * @desc Name of the race.
 * @default 
 *
 * @param Value
 * @text Shop Price Adjustment
 * @type number
 * @decimals 0
 * @min -100
 * @max 100
 * @desc Percentile value of prices to be changed in shops.
 * Positive numbers are discounts!
 * @default 0
 */
// ============================================================================
/*~struct~Relationship:
 * @param Name
 * @text Relationship Name
 * @desc The name to describe this level of friendship.
 * @default 
 *
 * @param MinValue
 * @text Minimum Value
 * @type number
 * @decimals 0
 * @min -9999
 * @max 9999
 * @desc Minimum value to enter this relationship
 * @default 0
 *
 * @param MaxValue
 * @text Maximum Value
 * @type number
 * @decimals 0
 * @min -9999
 * @max 9999
 * @desc Maximum value of being in this relationship
 * @default 0
 *
 * @param Value
 * @text Price Adjustment
 * @type number
 * @decimals 0
 * @min -100
 * @max 100
 * @desc Price adjustment (percentile) for this relationship.
 * Positive numbers are discounts!
 * @default 0
 */
// ============================================================================
/*~struct~Title:
 * @param Name
 * @text Title Name
 * @desc What is the name of the title bestowed?
 * @default 
 *
 * @param Value
 * @text Price Adjustment
 * @type number
 * @decimals 0
 * @min -100
 * @max 100
 * @desc The amount (percentile) to adjust prices in shops to 
 * those that have this title. Positive numbers are discounts!
 * @default 0
 */
// ============================================================================
/*~struct~Gender:
 * @param Name
 * @text Gender Name
 * @desc What is the name of this gender?
 * 
 * @param GenderList
 * @text Relations
 * @type struct<GenderRelation>[]
 * @desc List of relations to this gender. Friends or foe?
 * A value of 0 = neutral.
 * @default []
 */
// ============================================================================
/*~struct~GenderRelation:
 * @param Relation
 * @text Relation Name
 * @desc Name of the gender.
 * @default 
 *
 * @param Value
 * @text Shop Price Adjustment
 * @type number
 * @decimals 0
 * @min -100
 * @max 100
 * @desc Percentile value of prices to be changed in shops.
 * Positive numbers are discounts!
 * @default 0
 */

(() => {
'use strict';

const pluginName = 'LvMZ_Factions';
const lvParams = PluginManager.parameters(pluginName);
const facList = JSON.parse(lvParams['FactionList']).map(e => JSON.parse(e));
const raceList = JSON.parse(lvParams['RaceList']).map(e => JSON.parse(e));
const relateList = JSON.parse(lvParams['RelationScale']).map(e => JSON.parse(e));
const titleList = JSON.parse(lvParams['TitleList']).map(e => JSON.parse(e));
const genderList = JSON.parse(lvParams['GenderList']).map(e => JSON.parse(e));

/******************************************************************************
	plugin commands
******************************************************************************/
//PluginManager.registerCommand(pluginName, '', args => {});
PluginManager.registerCommand(pluginName, 'setFaction', args => {
	const id = Number(args.targetId);
	const isLeader = eval(args.leader);
	const tag = /\\V\[(\d+)\]/i;
	let name = args.factionName;
	if (name.match(tag)) {
		name = $gameVariables.value(parseInt(RegExp.$1));
	}
	let target = null;
	switch (args.target) {
		case 'Actor': {
			target = $gameParty.battleMembers()[id - 1];
			target.lvSet('setFaction', [name, isLeader]);
		} break;
		case 'Party': {
			for (const actor of $gameParty.battleMembers()) {
				actor.lvSet('setFaction', [name, false]);
			}
		} break;
		case 'Event': {
			target = $gameMap.event(id);
			target.lvSet('setFaction', [name, isLeader]);
		} break;
	}
});

PluginManager.registerCommand(pluginName, 'facStatus', args => {
	const id = Number(args.targetId);
	const value = eval(args.status);
	let target = null;
	switch (args.target) {
		case 'Actor': {
			target = $gameParty.battleMembers()[id - 1];
			target.lvSet('setHiddenFaction', [value]);
		} break;
		case 'Party': {
			for (const actor of $gameParty.battleMembers()) {
				actor.lvSet('setHiddenFaction', [value]);
			}
		} break;
		case 'Event': {
			target = $gameMap.event(id);
			target.lvSet('setHiddenFaction', [value]);
		} break;
	}
});

PluginManager.registerCommand(pluginName, 'setRace', args => {
	const id = Number(args.targetId)
	const tag = /\\V\[(\d+)\]/i;
	let target = null;
	if (args.target == 'Actor') {
		target = $gameParty.battleMembers()[id - 1];
	} else {
		target = $gameMap.event(id);
	}
	let name = args.raceName;
	if (name.match(tag)) {
		name = $gameVariables.value(parseInt(RegExp.$1));
	}
	target.lvSet('setRace', [name]);
});

PluginManager.registerCommand(pluginName, 'setGender', args => {
	const id = Number(args.targetId);
	const tag = /\\V\[(\d+)\]/i;
	let target = null;
	if (args.target == 'Actor') {
		target = $gameParty.battleMembers()[id - 1];
	} else {
		target = $gameMap.event(id);
	}
	let name = args.genderName;
	if (name.match(tag)) {
		name = $gameVariables.value(parseInt(RegExp.$1));
	}
	target.lvSet('setGender', [name]);
});

PluginManager.registerCommand(pluginName, 'setRelation', args => {
	const sID = Number(args.sourceId);
	const tID = Number(args.targetId);
	const value = Number(args.value);
	let source = null;
	let target = null;
	if (args.source == 'Actor') {
		source = $gameParty.battleMembers()[sID - 1];
	} else {
		source = $gameMap.event(sID);
	}
	if (args.target == 'Actor') {
		target = $gameParty.battleMembers()[tID - 1];
	} else {
		target = $gameMap.event(tID);
	}
	source.lvSet('setRelation', [target, value]);
});

PluginManager.registerCommand(pluginName, 'addTitle', args => {
	const id = Number(args.targetId);
	const tag = /\\V\[(\d+)\]/i;
	let target = null;
	let name = args.titleName;
	if (name.match(tag)) {
		name = $gameVariables.value(parseInt(RegExp.$1));
	}
	switch (args.target) {
		case 'Actor': {
			target = $gameParty.battleMembers()[id - 1];
			target.lvSet('addTitle', [name]);
		} break;
		case 'Party': {
			for (const actor of $gameParty.battleMembers()) {
				actor.lvSet('addTitle', [name]);
			}
		} break;
		case 'Event': {
			target = $gameMap.event(id);
			target.lvSet('addTitle', [name]);
		} break;
	}
});

PluginManager.registerCommand(pluginName, 'remTitle', args => {
	const id = Number(args.targetId);
	const tag = /\\V\[(\d+)\]/i;
	let target = null;
	let name = args.titleName;
	if (name.match(tag)) {
		name = $gameVariables.value(parseInt(RegExp.$1));
	}
	switch (args.target) {
		case 'Actor': {
			target = $gameParty.battleMembers()[id - 1];
			target.lvSet('removeTitle', [name]);
		} break;
		case 'Party': {
			for (const actor of $gameParty.battleMembers()) {
				actor.lvSet('removeTitle', [name]);
			}
		} break;
		case 'Event': {
			target = $gameMap.event(id);
			target.lvSet('removeTitle', [name]);
		} break;
	}
});

PluginManager.registerCommand(pluginName, 'clearTitles', args => {
	const id = Number(args.targetId);
	let target = null;
	switch (args.target) {
		case 'Actor': {
			target = $gameParty.battleMembers()[id - 1];
			target._titles = [];
			target._fData._titleIndex = -1;
		} break;
		case 'Party': {
			for (const actor of $gameParty.battleMembers()) {
				actor._titles = [];
				actor._fData._titleIndex = -1;
			}
		} break;
		case 'Event': {
			target = $gameMap.event(id);
			target._titles = [];
			target._fData._titleIndex = -1;
		} break;
	}
});

PluginManager.registerCommand(pluginName, 'resetAll', args => {
	const id = Number(args.targetId);
	switch (args.target) {
		case 'Actor': {
			const target = $gameParty.battleMembers()[id - 1];
			target.initFactionSettings();
		} break;
		case 'Party': {
			for (const actor of $gameParty.battleMembers()) {
				actor.initFactionSettings();
			}
		} break;
	}
});

/******************************************************************************
	rmmv_objects.js
******************************************************************************/

// --- GAME ACTOR ---
const gameActor_init = Game_Actor.prototype.initialize;
Game_Actor.prototype.initialize = function(actorId) {
	gameActor_init.call(this, actorId);
	this.initFactionSettings(actorId);
};

Game_Actor.prototype.initFactionSettings = function() {
	this._fData = new LordV_Factions(this);
	// check actor notetags for pre-setup factions, races, and titles
	const actor = $dataActors[this._actorId];
	const tag = /<(FACTION||RACE||TITLE||GENDER):\s([^>]*)>/i;
	const data = actor.note.split(/[\r\n]+/);
	for (const meta of data) {
		if (meta.match(tag)) {
			const type = String(RegExp.$1).toLowerCase();
			const name = String(RegExp.$2);
			switch (type) {
				case 'faction': this._fData.setFaction(this, name); break;
				case 'race': this._fData.setRace(this, name); break;
				case 'title': this._fData.addTitle(this, name); break;
				case 'gender': this._fData.setGender(this, name); break;
			}
		}
	}
};

Game_Actor.prototype.lvSet = function(methodName, params) {
	if (typeof this._fData[methodName] === 'function') {
		switch (methodName) {
			case 'setPriceAdjust':
				this._fData[methodName](this,
					params[0], params[1], params[2]
				);
				break;
			case 'setFaction': 
			case 'setRelation':
				this._fData[methodName](this,
					params[0], params[1]
				);
				break;
			case 'setRace': 
			case 'setGender':
			case 'addTitle':
			case 'removeTitle':
			case 'setHiddenFaction':
				this._fData[methodName](this, params[0]);
				break;
		}
	}
}

Game_Actor.prototype.lvGet = function(methodName, params) {
	if (typeof this._fData[methodName] === 'function') {
		switch (methodName) {
			case 'priceAdjust':
				return this._fData[methodName](this,
					params[0], params[1]
				);
			case 'factionLeader': 
			case 'relationValue':
			case 'checkTitle':
				return this._fData[methodName](this, params[0]);
			case 'isFactionHidden': 
			case 'factionValid': 
			case 'curFaction': 
			case 'race': 
			case 'gender':
			case 'isMonster':
			case 'firstTitle':
			case 'nextTitle':
			case 'prevTitle':
			case 'lastTitle':
				return this._fData[methodName](this);
			case 'relationName':
				return this._fData[methodName](params[0]);
		}
	}
};



// --- GAME CHARACTER_BASE ---
Game_CharacterBase.prototype.isActor = function() {
	return false;
};


// --- GAME EVENTS ---
const gameEvent_meetsConditions = Game_Event.prototype.meetsConditions;
Game_Event.prototype.meetsConditions = function(page) {
	// First - setup the NPC if haven't already:
	this.initNPC(page);
	const c = page.conditions;
	const sw = $dataSystem.switches;
	const v = $dataSystem.variables;
	let name = "";
	let callBack = true;
	if (c.switch1Valid) {
		name = sw[c.switch1Id];
		if (this.matchSwitchName(name)) {
			callBack = false;
		}
	}
	if (c.switch2Valid) {
		name = sw[c.switch2Id];
		if (this.matchSwitchName(name)) {
			callBack = false;
		}
	}
	if (c.variableValid) {
		name = v[c.variableId];
		if (name.match(/\[RELATION\]/i)) {
			if (this.lvGet('relationValue',[this,pc]) >= c.variableValue) {
				callBack = false;
			}
		}
	}
	
	if (callBack) {
		return gameEvent_meetsConditions.call(this, page);
	}
	
	// If any custom check above changes the callBack flag, we add in 
	// the original (non switch/var) checks
	if (c.selfSwitchValid) {
        const key = [this._mapId, this._eventId, c.selfSwitchCh];
        if ($gameSelfSwitches.value(key) !== true) {
            return false;
        }
    }
    if (c.itemValid) {
        const item = $dataItems[c.itemId];
        if (!$gameParty.hasItem(item)) {
            return false;
        }
    }
    if (c.actorValid) {
        const actor = $gameActors.actor(c.actorId);
        if (!$gameParty.members().includes(actor)) {
            return false;
        }
    }
	return true;
};

Game_Event.prototype.matchSwitchName = function(value) {
	const pc = $gameParty.leader();
	const tagSw = /\[(FACTION||RACE||RELATION||TITLE||GENDER)\](.*)/i;
	let source = false;
	let target = false;
	if (value.match(tagSw)) {
		// now return if the player matches
		const type = String(RegExp.$1).toLowerCase();
		const name = String(RegExp.$2);
		switch (type) {
			case 'faction': 
				source = this.lvGet('curFaction') === name;
				target = pc.lvGet('curFaction') === name;
				break;
			case 'race':
				source = this.lvGet('race') === name;
				target = pc.lvGet('race') === name;
				break;
			case 'relation':
				source = this.lvGet('relationName',[this.pc]) === name;
				target = true;
				break;
			case 'title':
				source = true;
				target = pc.lvGet('checkTitle',[name]);
				break;
			case 'gender':
				source = true;
				target = pc.lvGet('gender') === name;
				break;
		}
	}
	return source && target;
};

Game_Event.prototype.initNPC = function(page) {
	if (this._fData) return;
	const facTag = /<FACTION:\s([^>]*)>/i;
	const racTag = /<RACE:\s([^>]*)>/i;
	const titleTag = /<TITLE:\s([^>]*)>/i;
	const genderTag = /<GENDER:\s([^>]*)>/i;
	const setupTag = /<INIT:\s(FACTION||RACE||RELATION||TITLE||GENDER)\s([^>]*)\s(\d+)>/i;
	for (const ev of page.list) {
		if ([108,408].contains(ev.code)) {
			let note = ev.parameters[0];
			if (note.match(/<NPC>/i) && !this._fData) {
				this._fData = new LordV_Factions(this);
			} else if (note.match(facTag)) {
				this._fData.setFaction(this, RegExp.$1);
			} else if (note.match(racTag)) {
				this._fData.setRace(this, RegExp.$1);
			} else if (note.match(titleTag)) {
				this._fData.addTitle(this, RegExp.$1);
			} else if (note.match(genderTag)) {
				this._fData.setGender(this, RegExp.$1);
			} else if (note.match(setupTag)) {
				let type = String(RegExp.$1).toLowerCase();
				let name = String(RegExp.$2);
				let value = parseInt(RegExp.$3);
				this.initAdjustment(type, name, value);
			}
		}
	}
};

Game_Event.prototype.initAdjustment = function(type, name, amount) {
	let check = this._fData.getSource(this, type);
	let value = this._fData.compare(check, name, type);
	if (value) value.price = (value.price + amount).clamp(-100,100);
};

Game_Event.prototype.lvSet = function(methodName, params) {
	if (typeof this._fData[methodName] === 'function') {
		switch (methodName) {
			case 'setPriceAdjust':
				this._fData[methodName](this,
					params[0], params[1], params[2]
				);
				break;
			case 'setFaction':
			case 'setRelation':
				this._fData[methodName](this,
					params[0], params[1]
				);
				break;
			case 'setRace':
			case 'setGender':
			case 'addTitle':
			case 'removeTitle':
			case 'setHiddenFaction':
				this._fData[methodName](this, params[0]);
				break;
		}
	}
}

Game_Event.prototype.lvGet = function(methodName, params) {
	if (typeof this._fData[methodName] === 'function') {
		switch (methodName) {
			case 'priceAdjust':
				return this._fData[methodName](this,
					params[0], params[1]
				);
			case 'factionLeader': 
			case 'relationValue':
			case 'checkTitle':
				return this._fData[methodName](this, params[0]);
			case 'isFactionHidden': 
			case 'factionValid': 
			case 'curFaction': 
			case 'race': 
			case 'gender':
			case 'isMonster':
			case 'firstTitle':
			case 'nextTitle':
			case 'prevTitle':
			case 'lastTitle':
				return this._fData[methodName](this);
			case 'relationName':
				return this._fData[methodName](params[0]);
		}
	}
};


// --- GAME INTERPRETER ---
Game_Interpreter.prototype.loaded = function(/*plugin*/) {
	return true;
};

// Wrapper methods to use in events (conditional branches)
Game_Interpreter.prototype.getFaction = function(object) {
	if (object === this) object = $gameMap.event(this._eventId);
	if (object === 'pc') object = $gameParty.leader();
	return object.lvGet('curFaction');
};

Game_Interpreter.prototype.getFactionHidden = function(object) {
	if (object === this) object = $gameMap.event(this._eventId);
	if (object === 'pc') object = $gameParty.leader();
	return object.lvGet('isFactionHidden');
};

Game_Interpreter.prototype.isFactionLeader = function(object, name) {
	if (object === this) object = $gameMap.event(this._eventId);
	if (object === 'pc') object = $gameParty.leader();
	return object.lvGet('factionLeader', name);
};

Game_Interpreter.prototype.getRace = function(object) {
	if (object === this) object = $gameMap.event(this._eventId);
	if (object === 'pc') object = $gameParty.leader();
	return object.lvGet('race');
};

Game_Interpreter.prototype.isMonsterRace = function(object) {
	if (object === this) object = $gameMap.event(this._eventId);
	if (object === 'pc') object = $gameParty.leader();
	return object.lvGet('isMonster');
};

Game_Interpreter.prototype.getRelationValue = function(source, target) {
	if (source === target) return 0;
	if (source === this) source = $gameMap.event(this._eventId);
	if (target === this) target = $gameMap.event(this._eventId);
	if (source === 'pc') source = $gameParty.leader();
	if (target === 'pc') target = $gameParty.leader();
	return source.lvGet('relationValue', [target]);
};

Game_Interpreter.prototype.getRelationName = function(source, target) {
	if (source === target) return 'Narcissist';
	if (source === this) source = $gameMap.event(this._eventId);
	if (target === this) target = $gameMap.event(this._eventId);
	if (source === 'pc') source = $gameParty.leader();
	if (target === 'pc') target = $gameParty.leader();
	const value = source.lvGet('relationValue', [target]);
	return source.lvGet('relationName', [value]);
};

Game_Interpreter.prototype.checkTitle = function(object, name) {
	if (object === this) object = $gameMap.event(this._eventId);
	if (object === 'pc') object = $gameParty.leader();
	return object.lvGet('checkTitle', [name]);
};

Game_Interpreter.prototype.getGender = function(object) {
	if (object === this) object = $gameMap.event(this._eventId);
	if (object === 'pc') object = $gameParty.leader();
	return object.lvGet('gender');
};


// --- CUSTOM FUNCTIONS ---
function LordV_Factions() {
	this.initialize(...arguments);
}

LordV_Factions.prototype.initialize = function(subject) {
	this._factions = this.initFactionData(facList);
	this._races = this.initRaceData(raceList);
	this._relations = this.initRelationData(relateList);
	this._titles = this.initTitleData(titleList);
	this._genders = this.initGenderData(genderList);
	this.clear(subject);
};

LordV_Factions.prototype.clear = function(subject) {
	subject._faction = 'None';
	subject._factionLeader = false;
	if (!Imported.VisuMZ_1_ElementStatusCore) {
		subject._race = '';
	}
	subject._gender = '';
	subject._relations = {};
	subject._titles = [];
	this._titleIndex = -1;
};

LordV_Factions.prototype.initFactionData = function(faction) {
	let arr = [];
	for (const entry of faction) {
		let list = JSON.parse(entry.RelationList).map(e => JSON.parse(e));
		list.forEach(e => {
			let data = {
				name: entry.Name,
				vs: e.Relation,
				price: Number(e.Value),
				hidden: eval(entry.hiddenFac)
			};
			arr.push(data);
		});
	}
	return arr;
};

LordV_Factions.prototype.initRaceData = function(races) {
	let arr = [];
	for (const entry of races) {
		let list = JSON.parse(entry.RelationList).map(e => JSON.parse(e));
		list.forEach(e => {
			let data = {
				name: entry.Name,
				vs: e.Relation,
				price: Number(e.Value),
				monster: eval(entry.isMonster)
			};
			arr.push(data);
		});
	}
	return arr;
};

LordV_Factions.prototype.initGenderData = function(genders) {
	let arr = [];
	for (const entry of genders) {
		let list = JSON.parse(entry.GenderList).map(e => JSON.parse(e));
		list.forEach(e => {
			let data = {
				name: entry.Name,
				vs: e.Relation,
				price: Number(e.Value)
			};
			arr.push(data);
		});
	}
	return arr;
};

LordV_Factions.prototype.initRelationData = function(relations) {
	this._minRelation = 0;
	this._maxRelation = 0;
	let arr = [];
	for (const entry of relations) {
		let data = {
			name: entry.Name,
			min: Number(entry.MinValue),
			max: Number(entry.MaxValue),
			price: Number(entry.Value)
		};
		this._minRelation = Math.min(this._minRelation, data.max);
		this._maxRelation = Math.max(this._maxRelation, data.max);
		arr.push(data);
	}
	return arr;
};

LordV_Factions.prototype.initTitleData = function(titles) {
	let arr = [];
	for (const entry of titles) {
		let data = {
			name: entry.Name,
			price: Number(entry.Value)
		};
		arr.push(data);
	}
	return arr;
};

// ----------------------------------------------------------------------------
// Faction Methods: Everything to do with factions only

// leader {boolean}
LordV_Factions.prototype.setFaction = function(object, name, leader) {
	object._faction = this.list('faction').includes(name) ? name : 'None';
	if (this.factionValid(object) && leader !== undefined) {
		object._factionLeader = !!leader;
		$gameMap.requestRefresh();
	}
};

LordV_Factions.prototype.factionLeader = function(object, name) {
	if (this.curFaction(object) === name) {
		if (object._factionLeader) {
			if (this.factionValid(object)) return true;
			object._factionLeader = false;
		}
	}
	return false;
};

LordV_Factions.prototype.factionValid = function(object) {
	const faction = this.curFaction(object);
	return (
		this.list('faction').includes(faction) &&
		faction !== 'None'
	);
};

LordV_Factions.prototype.setHiddenFaction = function(object, value) {
	const faction = this.curFaction(object);
	const index = this._factions.indexByKey('name', faction);
	this._factions[index].hidden = value;
	$gameMap.requestRefresh();
};

LordV_Factions.prototype.isFactionHidden = function(object) {
	const faction = this.curFaction(object);
	const index = this._factions.indexByKey('name', faction);
	return !!this._factions[index].hidden;
};

LordV_Factions.prototype.curFaction = function(object) {
	return object._faction || 'None';
};

// ----------------------------------------------------------------------------
// Race Methods: Everything to do with races 

LordV_Factions.prototype.setRace = function(object, name) {
	// VisuStella's plugin methods override these ones.
	if (object.isActor() && Imported.VisuMZ_1_ElementStatusCore) return;
	if (this.list('race').includes(name)) {
		object._race = name;
		$gameMap.requestRefresh();
	}
};

LordV_Factions.prototype.isMonster = function(object) {
	const race = this.race(object);
	if (this.list('race').includes(race)) {
		const index = this._races.indexByKey('name', race);
		return !!this._races[index].monster;
	}
	return false;
};

LordV_Factions.prototype.race = function(object) {
	if (object.isActor() && Imported.VisuMZ_1_ElementStatusCore) {
		return object.getTraitSet('Race');
	}
	return object._race || '';
};

// ----------------------------------------------------------------------------
// Gender Methods: Everything to do with genders

LordV_Factions.prototype.setGender = function(object, name) {
	this._gender = this.list('gender').includes(name) ? name : '';
	$gameMap.requestRefresh();
};

LordV_Factions.prototype.gender = function(object) {
	return object._gender || '';
};

// ----------------------------------------------------------------------------
// Relation Methods: Everything to do with relationships

LordV_Factions.prototype.setRelation = function(oSource, oTarget, nValue) {
	if (oSource === oTarget) return; // can't friend yourself..
	const name = oTarget.isActor() ? oTarget.name() : oTarget.event().name;
	const cv = this.relationValue(oSource, oTarget);
	const min = this._minRelation;
	const max = this._maxRelation;
	oSource._relations[name] = (cv + nValue).clamp(min, max);
	$gameMap.requestRefresh();
};

LordV_Factions.prototype.relationValue = function(oSource, oTarget) {
	if (oSource === oTarget) return 0;
	const name = oTarget.isActor() ? oTarget.name() : oTarget.event().name;
	return oSource._relations[name] || 0;
};

LordV_Factions.prototype.relationName = function(nValue) {
	const value = this.compare(null, nValue, 'relation');
	return value ? value.name : '';
};

// ----------------------------------------------------------------------------
// Title Methods: Everything to do with titles 

LordV_Factions.prototype.addTitle = function(object, name) {
	if (this.list('title').includes(name)) {
		if (this.checkTitle(object, name)) return; // already have it
		object._titles.push(name);
		$gameMap.requestRefresh();
	}
};

LordV_Factions.prototype.firstTitle = function(object) {
	this._titleIndex = 0;
	return object._titles[this._titleIndex] || 'None';
};

LordV_Factions.prototype.nextTitle = function(object) {
	this._titleIndex++;
	if (this._titleIndex >= object._titles.length) {
		this._titleIndex = -1;
		return 'None'; // end of list
	}
	return object._titles[this._titleIndex] || 'None';
};

LordV_Factions.prototype.prevTitle = function(object) {
	this._titleIndex--;
	if (this._titleIndex < 0) {
		this._titleIndex = -1;
		return 'None'; // end of list
	}
	return object._titles[this._titleIndex] || 'None';
};

LordV_Factions.prototype.lastTitle = function(object) {
	this._titleIndex = object._titles.length - 1;
	return object._titles[this._titleIndex] || 'None';
};

LordV_Factions.prototype.removeTitle = function(object, name) {
	if (this._titleIndex > 0) this._titleIndex--;
	const index = object._titles.indexOf(name);
	object._titles.splice(index, 1);
	$gameMap.requestRefresh();
};

LordV_Factions.prototype.checkTitle = function(object, name) {
	return object._titles.includes(name);
};

// ----------------------------------------------------------------------------
// Price methods

// Adjustment: Gets the current price adjustment value
LordV_Factions.prototype.priceAdjust = function(oSource, oTarget, sType) {
	if (oSource === oTarget || this.isFactionHidden(oTarget)) return 0;
	const source = this.getSource(oSource, sType);
	const target = this.getTarget(oSource, oTarget, sType);
	const value = this.compare(source, target, sType);
	return value ? (value.price / 100).percent() : 0;
};

// Adjustment: Sets the price adjustment value to the new amount
LordV_Factions.prototype.setPriceAdjust = function(oSource, oTarget, sType, nAmount) {
	if (oSource === oTarget) return;
	const source = this.getSource(oSource, sType);
	const target = this.getTarget(oSource, oTarget, sType);
	const value = this.compare(source, target, sType);
	if (value) value.price = (value.price + nAmount).clamp(-100,100);
};

// ----------------------------------------------------------------------------
//  * Passive methods (used in others, not to be called directly)

LordV_Factions.prototype.getSource = function(oSource, sType) {
	switch (sType) {
		case 'faction': return this.curFaction(oSource);
		case 'race': return this.race(oSource);
		case 'gender': return this.gender(oSource);
		default: return null;
	}
};

LordV_Factions.prototype.getTarget = function(oSource, oTarget, sType) {
	switch (sType) {
		case 'faction': return this.curFaction(oTarget);
		case 'race': return this.race(oTarget);
		case 'relation': return this.relationValue(oSource, oTarget);
		case 'title': return this.lastTitle(oTarget);
		case 'gender': return this.gender(oTarget);
	}
};

// source {string} target {string} type {string}
LordV_Factions.prototype.compare = function(source, target, type) {
	let list = this.data(type);
	switch (type) {
		case 'faction': case 'race': case 'gender': {
			list = list.filter(e => e.name === source);
			list = list.filter(e => e.vs === target);
		} break;
		case 'relation': {
			list = list.filter(e => Number(target) >= e.min);
			list = list.filter(e => Number(target) <= e.max);
		} break;
		case 'title': {
			list = list.filter(e => e.name === target);
		} break;
	}
	return list.length > 0 ? list[0] : null;
};

LordV_Factions.prototype.list = function(type) {
	switch (type) {
		case 'faction': return facList.map(e => e.Name);
		case 'race': return raceList.map(e => e.Name);
		case 'relation': return relateList.map(e => e.Name);
		case 'title': return titleList.map(e => e.Name);
		case 'gender': return genderList.map(e => e.Name);
	}
	return [];
};

LordV_Factions.prototype.data = function(type) {
	switch (type) {
		case 'faction': return this._factions;
		case 'race': return this._races;
		case 'relation': return this._relations;
		case 'title': return this._titles;
		case 'gender': return this._genders;
	}
	return [];
};

})();
