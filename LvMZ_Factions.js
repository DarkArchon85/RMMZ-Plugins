// ============================================================================
//  LordValinar Plugin - Various Data for Actors and Events
//  LvMZ_Factions.js
// ============================================================================

var Imported = Imported || {};
if (!Imported['LvMZ_Core']) {
	throw new Error("LvMZ_Factions requires plugin 'LvMZ_Core'!");
}
Imported["LvMZ_Factions"] = true;

/*:
 * @target MZ
 * @plugindesc [v1.7] Core Plugin - Required for other plugins interacting
 * with factions, relationship, genders or titles (ex: LvMZ_Economy.js)
 * @author LordValinar
 * @url https://github.com/DarkArchon85/RMMZ-Plugins
 * @orderAfter LvMZ_Core
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
 * This plugin is part of a set, but can be used independently of each other,
 * but each still requires LvMZ_Core.js!
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
 *   - Name: Must match one setup in the parameters.
 *
 * <Reputation: value>
 *   - Value: Minimum and Maximum defined in parameters.
 *
 * <Title: name>
 *   - Name: Must match one setup in the parameters.
 *     Can setup multiple titles by adding new lines.
 *
 * <Age: value1>  or  <Age: value1: value2>
 *   - Value1: Age to set (minimum defined in parameters)
 *   - Value2: Maximum Lifespan to set
 *
 * <Type: target [IDs] value>
 *	 - Type: Friends or Romanced  (relations with actor(s) or 
 *     event(s) from the start!)
 *   - Target: Actor or Event     (which ID list are we getting?)
 *   - IDs: List of actor or event IDs to set relations with
 *   - Value: How much to add (or subtract)
 *
 * Example: <Friends: Actor [2,3,4] 25>
 *	 - Will start that Actor with 25 friendship points with all 
 *     of the other actors 2, 3, and 4!
 *
 *
 * -- Event Comment Tags --
 *
 * You can setup factions, races, and titles to events as well!
 * Create a comment and setup the tags as above; however, unlike
 * actors, you will require 1 more tag BEFORE calling the others:
 *   <NPC>      - This will identify the event to use faction data.
 *
 * Alternatively you can use <NPC> or <NPC: anything-here> in the 
 * note field of the event.
 *
 * In addition, you can setup shop NPCs with initial adjustments 
 * to prices towards a peticular faction, race, relation, or title.
 *   <Init Type: Name Amount>
 *     Type: Faction | Gender | Race | Reputation | Relation | Title | Age
 *     Name: Name of the type(above) that exists in the parameters.
 *     Amount: -100 to 100 to adjust current values
 *   Example: If current relations with High Elves is 5% and you 
 *   want to increase it to 10% you would use:
 *   <Init Race: High Elf 5>
 * 
 *
 * -- Using Plugin Commands --
 *
 * These are pretty straight forward, and most come with mini-help 
 * instructions already.
 * >> Regarding target Types and IDs:
 *   Type: For most plugin commands, you'll be able to choose:
 *     Actor, Event, or Party. Party choices will skip over the 
 *     origin Actor if they were chosen to befriend their own party.
 *
 *   ID: When regarding to Actors, this is in order (starting from 1)
 *     of the party (either top -> down, or left -> right). So the 
 *     Party Leader is always #1. Regarding to events, this is just 
 *     their event ID on the current map (1-999).
 *
 * >> Regarding the "Change Relation" plugin command:
 *   ID: Changed to become the Actor ID, or an Event ID that can be
 *     from the current or other maps. If you use "this" for the 
 *     player, it will get the party leader. If you use "this" for 
 *     an event, it will get the currently running event.
 *     You can also use syntax (\V[#] and \A[#]) for a variable 
 *     value or actor ID based on position like normal.
 *
 *   MapID: You can use "this" for current map, javascript (using 
 *     \V[#] or \A[#] like above), or any other number which will 
 *     be clamped between 1 and 999 (normal map limits).
 *
 *   Value: By adjusting up (positive numbers) or down (negative), 
 *     the only direct limits are what you setup in the plugin 
 *     parameters. Otherwise it defaults to a range of -9999 to 9999.
 *
 *   This value will determine what the relation "name" that can be 
 *     displayed, and what price adjustments are made. In the example 
 *     "Lovers" get a 3% discount when the relationship value is 
 *     greater than or equal to 81, and also less than or equal to 100.
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
 * > "object" must be an actor ( ie. $gameParty.leader() )
 *   or an Event ( ie. $gameMap.event(id) )
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
 * this.isFactionHidden(object)                 - Returns a boolean
 * this.isFactionLeader(object, name)           - Returns a boolean
 * this.getRace(object)                         - Returns a string
 * this.getGender(object)                       - Returns a string
 * this.getReputation(object)					- Returns a string
 * this.isMonsterRace(object)                   - Returns a boolean
 * this.racesMatch(source, target)              - Returns a boolean
 * this.getRelationValue(source, target)        - Returns a number
 * this.getRelationName(source, target)         - Returns a string
 * this.getRomanceValue(source, target)			- Returns a number
 * this.getRomanceName(source, target) 			- Returns a string
 * this.checkTitle(object, name)                - Returns a boolean
 * this.getPriceAdjust(source, target, type)	- Returns a number
 * this.getAge(object)							- Returns a number
 * this.getLifespan(object) 					- Returns a number
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
 * 'setFaction':  The method name (Game_Factions.prototype.setFaction)
 * [name,..]:     The name of the faction ("Villagers")
 * [..,isLeader]: Boolean to set if actor is leader of said faction.
 * 
 * Here is the complete list of methodNames and their parameter types:
 *  >> lvSet <<
 *
 * setPriceAdjust       [name{string}, type{string}, amount{number}]
 *   - Name: Name of target value (faction, race, relation, etc.)
 *      You can use $lvFactions.getTarget(object) to get the name value
 *      where "object" is the target (actor or event) object.
 *   - Type: You can use any of the following:
 *       faction
 *       race
 *       gender
 *       reputation
 *       relation
 *       romance
 *       title
 *       age
 *   - Amount: Positive/Negative number to adjust current value
 *  NOTE: Only events can use this function
 *
 * setFaction           [name{string}, leader{boolean}]
 *   - Name:   The faction name to set (Case-Sensitive and must exist!)
 *   - Leader: Determines if the source object calling this is the leader 
 *
 * setReputation        [target{object}, amount{number}]
 *   - Target: The actor or event to adjust reputation
 *   - Amount: Positive/Negative number to adjust current value
 *
 * setRelation          [target{object}, amount{number}, reset{boolean}]
 *   - Target: The actor or event to compare with
 *   - Amount: Positive/Negative number to adjust current value
 *   - Reset:  Set to: true | false 
 *
 * setRomance 			[target{object}, amount{number}, reset{boolean}]
 *   - Target: The actor or event to compare with
 *   - Amount: Positive/Negative number to adjust current value
 *   - Reset:  Set to: true | false 
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
 * clearTitles 			no parameters
 *   - Clears all available titles and resets index to -1
 *
 * setAge               [value{number}]
 *   - Value:  The age to set target to (limited by max lifespan)
 *
 * setLife              [value{number}]
 *   - Value:  The maximum lifespan to set target to
 *
 *
 *  >> lvGet <<
 *
 * priceAdjust     		[target{object}, type{string}]
 *   - Target: The actor or event to compare with
 *   - Type:   You can use any of the following:
 *       faction
 *       race
 *       gender
 *       reputation
 *       relation
 *       romance
 *       title
 *       age
 *  NOTE: Only events can use this function
 *
 * relationValue        [target{object}]
 *   - Target: The actor or event to compare with
 *
 * romanceValue   		[target{object}]
 *   - Target: The actor or event to compare with
 *
 * checkTitle           [name{string}]
 *   - Name:   Name of the title to check
 *
 * relationName         [target{object}]
 *   - Target: The actor or event to compare with
 *
 * romanceName 			[target{object}]
 *   - Target: The actor or event to compare with
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
 * reputationValue		n/a
 * reputationName 		n/a
 * isMonster            n/a
 * firstTitle           n/a
 * nextTitle            n/a
 * prevTitle            n/a
 * lastTitle            n/a
 * ageValue             n/a
 * maxLife              n/a
 * 
 * ----------------------------------------------------------------------------
 * The following functions have been overwritten
 * ----------------------------------------------------------------------------
 *
 * [rmmz_objects.js]
 *  - Game_Event.prototype.meetsConditions
 *
 * ----------------------------------------------------------------------------
 * Terms of Use
 * ----------------------------------------------------------------------------
 *
 * Free to use and modify for commercial and noncommercial games, with credit.
 * Do NOT remove my name from the Author of this plugin
 * Do NOT reupload this plugin (modified or otherwise) anywhere other than the 
 * RPG Maker Web main forums: https://forums.rpgmakerweb.com/index.php
 *
 * ----------------------------------------------------------------------------
 * Changelog
 * ----------------------------------------------------------------------------
 *
 * v1.7 - Added reputation(aka the "Fame" system), Age and Lifespan
 * v1.6 - Added Romance options with Relations settings
 * v1.5 - Minor convenience and syntax fixes
 * v1.4 - Overhaul on data handling plus other fixes
 * v1.3 - Change a method name (getFactionHidden -> isFactionHidden)
 * v1.2 - Fixed the event conditions to include original checks (updated demo)
 * v1.1 - Added gender-related list, script calls, and plugin commands
 * v1.0 - Finished plugin
 *
 * ----------------------------------------------------------------------------
 *
 * @param -- General Settings --
 * @default ----------------------------------
 *
 * @param ageSelfVar
 * @text Age Variable
 * @type variable
 * @desc Variable ID to store Event age and lifespan
 * @default 1
 *
 * @param -- List Settings --
 * @default ----------------------------------
 *
 * @param FactionList
 * @text Faction Relations
 * @parent -- List Settings --
 * @type struct<Faction>[]
 * @desc List of possible factions. If the player is in one of 
 * these factions (or even the leader), they get discounts.
 * @default ["{\"Name\":\"Imperium\",\"RelationList\":\"[\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Imperium\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"10\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Nobles\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Guards\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Merchants\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Villagers\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Thieves Guild\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"-5\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Pirates\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"-5\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Nature\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"None\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\"]\",\"hiddenFac\":\"false\"}","{\"Name\":\"Nobles\",\"RelationList\":\"[\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Imperium\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"5\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Nobles\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"5\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Guards\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Merchants\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Villagers\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"-1\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Thieves Guild\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"-5\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Pirates\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"-5\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Nature\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"None\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\"]\",\"hiddenFac\":\"false\"}","{\"Name\":\"Guards\",\"RelationList\":\"[\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Imperium\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Nobles\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Guards\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Merchants\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Villagers\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Thieves Guild\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"-5\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Pirates\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"-5\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Nature\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"None\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\"]\",\"hiddenFac\":\"false\"}","{\"Name\":\"Merchants\",\"RelationList\":\"[\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Imperium\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Nobles\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Guards\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Merchants\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"5\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Villagers\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"1\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Thieves Guild\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"-5\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Pirates\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"-5\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Nature\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"None\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\"]\",\"hiddenFac\":\"false\"}","{\"Name\":\"Villagers\",\"RelationList\":\"[\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Imperium\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"-5\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Nobles\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"-1\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Guards\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Merchants\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Villagers\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Thieves Guild\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"-5\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Pirates\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"-5\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Nature\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"None\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\"]\",\"hiddenFac\":\"false\"}","{\"Name\":\"Thieves Guild\",\"RelationList\":\"[\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Imperium\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"-5\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Nobles\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Guards\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"-5\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Merchants\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Villagers\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Thieves Guild\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"5\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Pirates\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Nature\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"None\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\"]\",\"hiddenFac\":\"true\"}","{\"Name\":\"Pirates\",\"RelationList\":\"[\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Imperium\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"-5\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Nobles\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Guards\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"-5\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Merchants\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Villagers\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Thieves Guild\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Pirates\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"5\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Nature\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"None\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\"]\",\"hiddenFac\":\"false\"}","{\"Name\":\"Nature\",\"RelationList\":\"[\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Imperium\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"-5\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Nobles\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Guards\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Merchants\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Villagers\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Thieves Guild\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Pirates\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Nature\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"None\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\"]\",\"hiddenFac\":\"false\"}","{\"Name\":\"None\",\"RelationList\":\"[\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Imperium\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Nobles\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Guards\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Merchants\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Villagers\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Thieves Guild\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Pirates\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Nature\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"None\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\"]\",\"hiddenFac\":\"false\"}"]
 *
 * @param RaceList
 * @text Racial Relations
 * @parent -- List Settings --
 * @type struct<Race>[]
 * @desc List of Races and their relations with each other.
 * Compatable with ElementsStatesCore (VisuStella)
 * @default ["{\"Name\":\"Human\",\"RelationList\":\"[\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Human\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"5\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"High Elf\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Wood Elf\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Dark Elf\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"-5\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Dwarf\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"5\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Gnome\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"5\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Halfling\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"5\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Wolfkin\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"-5\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Felyne\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"-5\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Lizardman\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"-5\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Vampire\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\"]\",\"isMonster\":\"false\"}","{\"Name\":\"High Elf\",\"RelationList\":\"[\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Human\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"High Elf\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"10\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Wood Elf\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"5\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Dark Elf\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"-5\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Dwarf\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"-5\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Gnome\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Halfling\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Wolfkin\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Felyne\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Lizardman\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"-5\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Vampire\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\"]\",\"isMonster\":\"false\"}","{\"Name\":\"Wood Elf\",\"RelationList\":\"[\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Human\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"-5\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"High Elf\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"5\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Wood Elf\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"5\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Dark Elf\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"-5\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Dwarf\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"-5\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Gnome\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Halfling\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Wolfkin\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"5\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Felyne\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"5\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Lizardman\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"-5\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Vampire\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\"]\",\"isMonster\":\"false\"}","{\"Name\":\"Dark Elf\",\"RelationList\":\"[\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Human\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"High Elf\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"-5\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Wood Elf\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"-5\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Dark Elf\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"10\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Dwarf\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Gnome\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Halfling\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Wolfkin\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Felyne\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Lizardman\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Vampire\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\"]\",\"isMonster\":\"false\"}","{\"Name\":\"Dwarf\",\"RelationList\":\"[\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Human\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"5\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"High Elf\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"-5\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Wood Elf\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"-5\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Dark Elf\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"-5\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Dwarf\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"10\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Gnome\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"5\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Halfling\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Wolfkin\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Felyne\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Lizardman\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"-5\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Vampire\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\"]\",\"isMonster\":\"false\"}","{\"Name\":\"Gnome\",\"RelationList\":\"[\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Human\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"High Elf\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Wood Elf\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Dark Elf\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Dwarf\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"5\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Gnome\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"5\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Halfling\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"5\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Wolfkin\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"-5\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Felyne\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"-5\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Lizardman\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"-5\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Vampire\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\"]\",\"isMonster\":\"false\"}","{\"Name\":\"Halfling\",\"RelationList\":\"[\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Human\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"5\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"High Elf\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Wood Elf\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Dark Elf\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"-5\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Dwarf\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Gnome\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Halfling\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"5\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Wolfkin\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Felyne\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Lizardman\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"-5\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Vampire\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\"]\",\"isMonster\":\"false\"}","{\"Name\":\"Wolfkin\",\"RelationList\":\"[\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Human\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"-5\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"High Elf\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Wood Elf\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Dark Elf\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Dwarf\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Gnome\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Halfling\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Wolfkin\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"10\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Felyne\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"-5\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Lizardman\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Vampire\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\"]\",\"isMonster\":\"true\"}","{\"Name\":\"Felyne\",\"RelationList\":\"[\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Human\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"-5\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"High Elf\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Wood Elf\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Dark Elf\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Dwarf\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Gnome\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Halfling\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Wolfkin\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"-5\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Felyne\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"10\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Lizardman\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Vampire\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\"]\",\"isMonster\":\"true\"}","{\"Name\":\"Lizardman\",\"RelationList\":\"[\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Human\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"-5\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"High Elf\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Wood Elf\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Dark Elf\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Dwarf\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"-5\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Gnome\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"-5\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Halfling\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Wolfkin\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"5\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Felyne\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"-5\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Lizardman\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"15\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Vampire\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\"]\",\"isMonster\":\"true\"}","{\"Name\":\"Vampire\",\"RelationList\":\"[\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Human\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"High Elf\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Wood Elf\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Dark Elf\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Dwarf\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Gnome\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Halfling\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Wolfkin\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Felyne\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Lizardman\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Vampire\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\"]\",\"isMonster\":\"true\"}"]
 *
 * @param GenderList
 * @text Gender Relations
 * @parent -- List Settings --
 * @type struct<Gender>[]
 * @desc List of Genders and their relations with each other.
 * @default ["{\"Name\":\"Male\",\"GenderList\":\"[\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Male\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Female\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Both\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"None\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Other\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\"]\"}","{\"Name\":\"Female\",\"GenderList\":\"[\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Male\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Female\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Both\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"None\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Other\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\"]\"}","{\"Name\":\"Both\",\"GenderList\":\"[\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Male\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Female\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Both\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"None\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Other\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\"]\"}","{\"Name\":\"None\",\"GenderList\":\"[\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Male\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Female\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Both\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"None\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Other\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\"]\"}","{\"Name\":\"Other\",\"GenderList\":\"[\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Male\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Female\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Both\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"None\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Other\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\"]\"}"]
 *
 * @param ReputationList
 * @text Reputations
 * @parent -- List Settings --
 * @type struct<Reputation>[]
 * @desc List of reputations (famous/infamous) or possibly
 * heroic/villain, etc. Price adjustments available.
 * @default ["{\"Name\":\"Good\",\"MinValue\":\"26\",\"MaxValue\":\"100\",\"RelationList\":\"[\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Good\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"5\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Neutral\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Evil\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"-5\\\\\\\"}\\\"]\"}","{\"Name\":\"Neutral\",\"MinValue\":\"-25\",\"MaxValue\":\"25\",\"RelationList\":\"[\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Good\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Neutral\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"5\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Evil\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"-5\\\\\\\"}\\\"]\"}","{\"Name\":\"Evil\",\"MinValue\":\"-100\",\"MaxValue\":\"-26\",\"RelationList\":\"[\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Good\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"-5\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Neutral\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\",\\\"{\\\\\\\"Relation\\\\\\\":\\\\\\\"Evil\\\\\\\",\\\\\\\"Value\\\\\\\":\\\\\\\"0\\\\\\\"}\\\"]\"}"]
 *
 * @param RelationScale
 * @text Relationship Scale
 * @parent -- List Settings --
 * @type struct<Relationship>[]
 * @desc List of name and value of each relationship status.
 * From hostile to friendly, or otherwise defined by you!
 * @default ["{\"Name\":\"Best Friends\",\"MinValue\":\"91\",\"MaxValue\":\"100\",\"Value\":\"5\"}","{\"Name\":\"Great Friends\",\"MinValue\":\"75\",\"MaxValue\":\"90\",\"Value\":\"3\"}","{\"Name\":\"Friends\",\"MinValue\":\"50\",\"MaxValue\":\"74\",\"Value\":\"2\"}","{\"Name\":\"Acquaintances\",\"MinValue\":\"25\",\"MaxValue\":\"49\",\"Value\":\"1\"}","{\"Name\":\"Just Met\",\"MinValue\":\"6\",\"MaxValue\":\"24\",\"Value\":\"0\"}","{\"Name\":\"Unknown\",\"MinValue\":\"0\",\"MaxValue\":\"5\",\"Value\":\"0\"}","{\"Name\":\"Rivals\",\"MinValue\":\"-1\",\"MaxValue\":\"-5\",\"Value\":\"0\"}","{\"Name\":\"Frienemies\",\"MinValue\":\"-6\",\"MaxValue\":\"-25\",\"Value\":\"-1\"}","{\"Name\":\"Enemies\",\"MinValue\":\"-26\",\"MaxValue\":\"-85\",\"Value\":\"-3\"}","{\"Name\":\"Nemesis\",\"MinValue\":\"-86\",\"MaxValue\":\"-100\",\"Value\":\"-5\"}"]
 *
 * @param RomanceScale
 * @text Romanceable Scale
 * @parent -- List Settings --
 * @type struct<Relationship>[]
 * @desc List of name and value of each romance status.
 * From acquaintances to lovers, or otherwise defined.
 * @default ["{\Name\":\"Life Partners\",\"MinValue\":\"81\",\"MaxValue\":\"100\",\"Value\":\"5\"}","{\Name\":\"Lovers\",\"MinValue\":\"61\",\"MaxValue\":\"80\",\"Value\":\"3\"}","{\Name\":\"Courting\",\"MinValue\":\"41\",\"MaxValue\":\"60\",\"Value\":\"2\"}","{\Name\":\"Romantic Interests\",\"MinValue\":\"21\",\"MaxValue\":\"40\",\"Value\":\"1\"}","{\Name\":\"Acquaintances\",\"MinValue\":\"1\",\"MaxValue\":\"20\",\"Value\":\"0\"}"]
 *
 * @param TitleList
 * @text Title Relations
 * @parent -- List Settings --
 * @type struct<Title>[]
 * @desc List of titles
 * @default ["{\"Name\":\"Monarch\",\"Value\":\"100\"}","{\"Name\":\"Royal\",\"Value\":\"50\"}","{\"Name\":\"Heir\",\"Value\":\"25\"}","{\"Name\":\"Noble\",\"Value\":\"15\"}","{\"Name\":\"Knight\",\"Value\":\"5\"}","{\"Name\":\"Hero\",\"Value\":\"1\"}","{\"Name\":\"Criminal\",\"Value\":\"-5\"}"]
 *
 * @param AgeList
 * @text Age Relations
 * @parent -- List Settings --
 * @type struct<Age>[]
 * @desc List of Ages and value adjustments (LvMZ_Economy)
 * @default []
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
 * @desc Choose an actor, event, or the whole party.
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
 * If PARTY, first member becomes leader.
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
 * @desc Choose an actor, event, or the whole party.
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
 * @arg setStatus
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
 * @desc Actor or Event ID of source object.
 * You may also use javascript (see Help)
 * @default this
 *
 * @arg target
 * @text Target
 * @type select
 * @option Actor
 * @option Event
 * @option Party
 * @desc Origin changes relation with a single actor, event,
 * or the entire actor party (see Help)
 * @default Event
 *
 * @arg targetId
 * @text Target ID
 * @desc Actor or Event ID of target object.
 * You may also use javascript (see Help)
 * @default this
 *
 * @arg mapId
 * @text Event Map ID
 * @desc Numerical(1-999) or Javascript; If getting an 
 * event from another map (see Help)
 * @default this
 *
 * @arg type
 * @text Relation Type
 * @type select
 * @option Friendship
 * @option Romance
 * @desc Choose the relation type to adjust
 * @default Friendship
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
 * @arg reset
 * @text Reset Relations
 * @type boolean
 * @on Reset
 * @off Default
 * @desc Resetting will return standing to 0 ignoring the value 
 * adjustment argument in this command.
 * @default false
 *
 * @ --------------------------------------------------------------------------
 *
 * @command setReputation
 * @text Change Reputation
 * @desc Alters the target's reputation
 *
 * @arg target
 * @text Target
 * @type select
 * @option Actor
 * @option Event
 * @desc Choose which one will get reputation adjustment.
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
 * @text Adjusted Value
 * @type number
 * @min -9999
 * @max 9999
 * @desc The amount to add or subtract current actor's 
 * reputation value from. 0 does nothing
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
 * @desc Choose an actor, event, or the whole party.
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
 * @desc Choose an actor, event, or the whole party.
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
 * @desc Choose an actor, event, or the whole party.
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
 *
 * @ --------------------------------------------------------------------------
 *
 * @command setAge
 * @text Set Target Age
 * @desc Adjusts the target age to <value>.
 * 
 * @arg target
 * @text Target
 * @type select
 * @option Actor
 * @option Event
 * @desc Choose actor or event to adjust age.
 * @default Actor
 *
 * @arg targetId
 * @text Target ID
 * @desc Actor or Event ID of target object.
 * You may also use javascript (see Help)
 * @default this
 *
 * @arg mapId
 * @text Event Map ID
 * @desc Numerical(1-999) or Javascript; If getting an 
 * event from another map (see Help)
 * @default this
 *
 * @arg value
 * @text Age
 * @type number
 * @decimals 0
 * @desc Min-Max determiend by plugin parameters and adjustments.
 * Default Age(15) - Default Lifespan(85)
 * @default 0
 *
 * @arg lifespan
 * @text Max Lifespan Adjustment
 * @type number
 * @decimals 0
 * @min 0
 * @desc Number of years to add onto the defaultLife parameter.
 * Leave at 0 for no adjustment.
 * @default 0
 *
 * @ --------------------------------------------------------------------------
 *
 * @command resetAge
 * @text Reset Target Age
 * @desc Returns target age and lifespan to defaults.
 * 
 * @arg target
 * @text Target
 * @type select
 * @option Actor
 * @option Event
 * @desc Choose actor or event to adjust
 * @default Actor
 *
 * @arg targetId
 * @text Target ID
 * @desc Actor or Event ID of target object
 * You may also use javascript (see Help)
 * @default this
 *
 * @arg mapId
 * @text Event Map ID
 * @desc Numerical(1-999) or Javascript; If getting an 
 * event from another map (see Help)
 * @default this
 *
 * @ --------------------------------------------------------------------------
 *
 * @command setPriceAdjust
 * @text Set Price Adjustment
 * @desc Adjusts a price by percentage(%) from the merchant
 * (this event) towards the party leader.
 *
 * @arg type
 * @text Adjustment Type
 * @type select
 * @option Faction
 * @option Race
 * @option Gender
 * @option Reputation
 * @option Relation
 * @option Romance
 * @option Title
 * @option Age
 * @desc The adjustment value type to change.
 * Original values are not touched.
 * @default Faction
 *
 * @arg value
 * @text Adjustment Value
 * @type number
 * @decimals 0
 * @min -200
 * @max 200
 * @desc Adjust the percentage(%) value that the source
 * feels about the target. 0 Does nothing.
 * @default 0
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
/*~struct~Reputation:
 * @param Name
 * @text Reputation Name
 * @desc Name of this reputation.
 * @default 
 *
 * @param MinValue
 * @text Minimum Value
 * @type number
 * @decimals 0
 * @min -9999
 * @max 9999
 * @desc Minimum value to enter this reputation
 * @default 0
 *
 * @param MaxValue
 * @text Maximum Value
 * @type number
 * @decimals 0
 * @min -9999
 * @max 9999
 * @desc Maximum value of being in this reputation
 * @default 0
 *
 * @param RelationList
 * @text Relations
 * @type struct<FameRelation>[]
 * @desc List of how other reputations interact with this.
 * For price adjustments (if any)
 * @default []
 */
// ============================================================================
/*~struct~FameRelation:
 * @param Relation
 * @text Reputation Name
 * @desc Name of the reputation.
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
/*~struct~Age:
 * @param Name
 * @text Age Descriptor
 * @desc What is the name for this age group?
 * Examples: Elder, Adult, Young Adult, Teen, etc.
 * @default 
 *
 * @param minRange
 * @text Age Range (Minimum)
 * type number
 * @decimals 0
 * @desc Minimum age for this price adjustment.
 * Absolute minimum equals "defaultAge" parameter.
 * @default 15
 *
 * @param maxRange
 * @text Age Range (Maximum)
 * @type number
 * @decimals 0
 * @desc Maximum age for this price adjustment.
 * Aboslute maximum equals "defaultLife" parameter.
 * @default 85
 *
 * @param Value
 * @text Price Adjustment
 * @type number
 * @decimals 0
 * @min -100
 * @max 100
 * @desc The amount (percentile) to adjust prices in shops to
 * @those that are in this age range. Positive = discounts!
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
// ============================================================================

var LvMZ = LvMZ || {};
LvMZ.Factions = {
	name: "Various Data for Actors and Events",
	desc: "Database of functions dealing with: Factions, Races, Genders, Fame, Relations and Titles!",
	version: 1.7
};

// -- Global Variables --------------------------------------------------------
var $lvFactions = null;

(() => {
'use strict';

const pluginName = "LvMZ_Factions";
const params = new LvParams(pluginName);
const ageVariable = params.value('ageSelfVar','num');

/******************************************************************************
	plugin commands
******************************************************************************/
//PluginManager.registerCommand(pluginName, '', args => {});
PluginManager.registerCommand(pluginName, 'setFaction', args => {
	const id = Number(args.targetId);
	const isLeader = args.leader.toLowerCase() === "true";
	const name = args.factionName.replace(/[\\]*V\[(\d+)\]/gi, (_, p1) =>
		$gameVariables.value(parseInt(p1))
	);
	switch (args.target) {
		case 'Actor': {
			let target = $gameParty.battleMembers()[id - 1];
			target.lvSet('setFaction', [name, isLeader]);
		} break;
		case 'Party': {
			for (const actor of $gameParty.battleMembers()) {
				let set = isLeader && actor.index() === 0;
				actor.lvSet('setFaction', [name, set]);
			}
		} break;
		case 'Event': {
			let target = $gameMap.event(id);
			target.lvSet('setFaction', [name, isLeader]);
		} break;
	}
});

PluginManager.registerCommand(pluginName, 'facStatus', args => {
	const id = Number(args.targetId);
	const value = args.setStatus.toLowerCase() === "true";
	switch (args.target) {
		case 'Actor': {
			let target = $gameParty.battleMembers()[id - 1];
			target.lvSet('setHiddenFaction', [value]);
		} break;
		case 'Party': {
			for (const actor of $gameParty.battleMembers()) {
				actor.lvSet('setHiddenFaction', [value]);
			}
		} break;
		case 'Event': {
			let target = $gameMap.event(id);
			target.lvSet('setHiddenFaction', [value]);
		} break;
	}
});

PluginManager.registerCommand(pluginName, 'setRace', args => {
	const id = Number(args.targetId)
	const target = args.target === 'Actor' 
		? $gameParty.battleMembers()[id - 1] 
		: $gameMap.event(id);
	const name = args.raceName.replace(/[\\]*V\[(\d+)\]/gi, (_, p1) =>
		$gameVariables.value(parseInt(p1))
	);
	target.lvSet('setRace', [name]);
});

PluginManager.registerCommand(pluginName, 'setGender', args => {
	const id = Number(args.targetId);
	const target = args.target === 'Actor'
		? $gameParty.battleMembers()[id - 1]
		: $gameMap.event(id);
	const name = args.genderName.replace(/[\\]*V\[(\d+)\]/gi, (_, p1) =>
		$gameVariables.value(parseInt(p1))
	);
	target.lvSet('setGender', [name]);
});

PluginManager.registerCommand(pluginName, 'setReputation', args => {
	const id = Number(args.targetId);
	const value = Number(args.value);
	const target = args.target === 'Actor' 
		? $gameParty.battleMembers()[id - 1] 
		: $gameMap.event(id);
	target.lvSet('setReputation', [value]);
});

PluginManager.registerCommand(pluginName, 'setRelation', args => {
	const intr = $gameMap._interpreter;
	const sID = args.sourceId.toLowerCase() === "this" 
		? args.source === 'Actor'
		? $gameParty._actors[0]
		: intr.eventId()
		: params.eval(args.sourceId);
	const tID = args.targetId.toLowerCase() === "this"
		? args.target === 'Actor'
		? $gameParty._actors[0]
		: intr.eventId()
		: params.eval(args.targetId);
	const mapId = args.mapId.toLowerCase() === "this"
		? intr._mapId
		: params.eval(args.mapId).clamp(1,999);
	// Source: Actor or Event
	const source = args.source === 'Actor'
		? $gameActors.actor(sID)
		: $gameMap.mapId() !== mapId
		? new LvMZ_RemoteEvent(mapId, sID)
		: $gameMap.event(sID);
	// Target: Actor, Event, or Party
	if (args.target === "Party") {
		for (const actor of $gameParty.battleMembers()) {
			if (source === actor) continue;
			this.chooseAction(source, actor, args);
		}
	} else {
		const target = args.target === 'Actor'
			? $gameActors.actor(tID)
			: $gameMap.mapId() !== mapId
			? new LvMZ_RemoteEvent(mapId, tID)
			: $gameMap.event(tID);
		this.chooseAction(source, target, args);
	}
});
// -- Private Function: setRelation -------------------------------------------
PluginManager.chooseAction = function(source, target, args) {
	// Set or Reset
	const type = (args.reset.toLowerCase() === "true") ? "reset" : "set";
	const myParams = [target];
	if (type === "set") myParams.push(Number(args.value));
	switch (args.type) {
		case "Friendship":
			source.lvSet(type+"Relation", myParams);
			break;
		case "Romance":
			source.lvSet(type+"Romance", myParams);
			break;
	}
};

PluginManager.registerCommand(pluginName, 'addTitle', args => {
	const id = Number(args.targetId);
	const name = args.titleName.replace(/[\\]*V\[(\d+)\]/gi, (_, p1) =>
		$gameVariables.value(parseInt(p1))
	);
	switch (args.target) {
		case 'Actor': {
			let target = $gameParty.battleMembers()[id - 1];
			target.lvSet('addTitle', [name]);
		} break;
		case 'Party': {
			for (const actor of $gameParty.battleMembers()) {
				actor.lvSet('addTitle', [name]);
			}
		} break;
		case 'Event': {
			let target = $gameMap.event(id);
			target.lvSet('addTitle', [name]);
		} break;
	}
});

PluginManager.registerCommand(pluginName, 'remTitle', args => {
	const id = Number(args.targetId);
	const name = args.titleName.replace(/[\\]*V\[(\d+)\]/gi, (_, p1) =>
		$gameVariables.value(parseInt(p1))
	);
	switch (args.target) {
		case 'Actor': {
			let target = $gameParty.battleMembers()[id - 1];
			target.lvSet('removeTitle', [name]);
		} break;
		case 'Party': {
			for (const actor of $gameParty.battleMembers()) {
				actor.lvSet('removeTitle', [name]);
			}
		} break;
		case 'Event': {
			let target = $gameMap.event(id);
			target.lvSet('removeTitle', [name]);
		} break;
	}
});

PluginManager.registerCommand(pluginName, 'clearTitles', args => {
	const id = Number(args.targetId);
	switch (args.target) {
		case 'Actor': {
			let target = $gameParty.battleMembers()[id - 1];
			target.lvSet('clearTitles');
		} break;
		case 'Party': {
			for (const actor of $gameParty.battleMembers()) {
				actor.lvSet('clearTitles');
			}
		} break;
		case 'Event': {
			let target = $gameMap.event(id);
			target.lvSet('clearTitles');
		} break;
	}
});

// -- Other commands
PluginManager.registerCommand(pluginName, 'setAge', args => {
	const intr = $gameMap._interpreter;
	const tID = args.targetId.toLowerCase() === "this"
		? args.target === 'Actor'
		? $gameParty._actors[0]
		: intr.eventId()
		: params.eval(args.targetId);
	const mapId = args.mapId.toLowerCase() === "this"
		? intr._mapId
		: params.eval(args.mapId).clamp(1,999);
	const target = args.target === 'Actor'
		? $gameActors.actor(tID)
		: $gameMap.mapId() !== mapId
		? new LvMZ_RemoteEvent(mapId, tID)
		: $gameMap.event(tID);
	const lifeAdjust = Number(args.lifespan);
	if (lifeAdjust > 0) {
		const maxLifespan = target.lvGet('maxLife') + lifeAdjust;
		target.lvSet('setLife', [maxLifespan]);
	}
	const value = Number(args.value);
	target.lvSet('setAge', [value]);
	if (target.updateAge) {
		const newValue = value - target.lvGet('ageValue');
		target.updateAge(newValue);
	}
});

PluginManager.registerCommand(pluginName, 'resetAge', args => {
	const intr = $gameMap._interpreter;
	const tID = args.targetId.toLowerCase() === "this"
		? args.target === 'Actor'
		? $gameParty._actors[0]
		: intr.eventId()
		: params.eval(args.targetId);
	const mapId = args.mapId.toLowerCase() === "this"
		? intr._mapId
		: params.eval(args.mapId).clamp(1,999);
	const target = args.target === 'Actor'
		? $gameActors.actor(tID)
		: $gameMap.mapId() !== mapId
		? new LvMZ_RemoteEvent(mapId, tID)
		: $gameMap.event(tID);
	target.lvSet('setLife', [defaultLife]);
	target.lvSet('setAge', [defaultAge]);
	if (target.updateAge) {
		const newValue = defaultAge - target.lvGet('ageValue');
		target.updateAge(newValue);
	}
});

PluginManager.registerCommand(pluginName, 'setPriceAdjust', args => {
	// Failsafe - the source event must be an interactable NPC!
	const source = MapManager.event();
	if (!source._DLL) return;
	// Passed - Adjust as normal
	const target = $gameParty.leader();
	const type = args.type.toLowerCase();
	const amount = Number(args.value);
	const name = $lvFactions.getTarget(source, target, type);
	source.lvSet('setPriceAdjust', [type, name, amount]);
});

/******************************************************************************
	rmmz_managers.js
******************************************************************************/
const dm_createObj = DataManager.createGameObjects;
DataManager.createGameObjects = function() {
	$lvFactions = new Game_Factions();
	dm_createObj.call(this);
};

const dm_saveContents = DataManager.makeSaveContents;
DataManager.makeSaveContents = function() {
	const contents = dm_saveContents.call(this);
	contents.library = $lvFactions;
	return contents;
};

const dm_extractContents = DataManager.extractSaveContents;
DataManager.extractSaveContents = function(contents) {
	dm_extractContents.call(this, contents);
	$lvFactions = contents.library;
};

/******************************************************************************
	rmmz_objects.js
******************************************************************************/

// --- GAME ACTOR ---
const gameActor_setup = Game_Actor.prototype.setup;
Game_Actor.prototype.setup = function(actorId) {
	gameActor_setup.call(this, actorId);
	this.initFactionSettings();
};

Game_Actor.prototype.initFactionSettings = function() {
	// check actor notetags for pre-setup factions, races, and titles
	this._DLL = $lvFactions.initData();
	const facTag = /<(FACTION|RACE|TITLE|GENDER)[: ]+([^>]+)>[: ]*(LEADER)?/i;
	const frsTag = /<(FRIENDS|ROMANCED)[: ]+(ACTOR|EVENT)[ ]?\[([\d, ]+)\][ ]?(\d+)>[ ]?(\d+)?/i;
	const repTag = /<(?:FAME|REPUTATION)[: ]+(\d+)>/i;
	const ageTag = /<AGE[: ]+(\d+)[: ]*(\d+)?>/i;
	const data = this.actor().note.split(/[\r\n]+/);
	for (const meta of data) {
		if (meta.match(facTag)) {
			const type = RegExp.$1;
			const name = RegExp.$2;
			const set  = RegExp.$3 ? true : false;
			switch (type.toLowerCase()) {
				case 'faction': this.lvSet('setFaction', [name, set]); break;
				case 'race':	this.lvSet('setRace', [name]);   	   break;
				case 'title':	this.lvSet('addTitle', [name]);        break;
				case 'gender':	this.lvSet('setGender', [name]);	   break;
			}
		} else if (meta.match(frsTag)) {
			let type = RegExp.$1.toLowerCase();
			let list = RegExp.$3
				.replace(/([, ]+)/g, "-")
				.split("-")
				.map(id => Number(id))
				.remove(0);
			let value = Number(RegExp.$4);
			let mapId = RegExp.$5 ? Number(RegExp.$5) : 0;
			for (const id of list) {
				let actor = RegExp.$2.toLowerCase() === "actor"
					? $gameActors.actor(id)
					: mapId > 0 && $gameMap.mapId() !== mapId
					? new LvMZ_RemoteEvent(mapId, id)
					: $gameMap.event(id);
				switch (type) {
					case 'friends':
						this.lvSet('setRelation', [actor, value]);
						break;
					case 'romanced':
						this.lvSet('setRomance', [actor, value]);
						break;
				}
			}
		} else if (meta.match(repTag)) {
			let value = Number(RegExp.$1);
			this.lvSet('setReputation', [value]);
		} else if (meta.match(ageTag)) {
			let age = Number(RegExp.$1);
			let limit = RegExp.$2 ? Number(RegExp.$2) : 0;
			if (limit > 0) {
				this.lvSet('setLife', [limit]);
			}
			this.lvSet('setAge', [age]);
		}
	}
};

Game_Actor.prototype.lvSet = function(methodName, params) {
	if (!$lvFactions || !this._DLL) return;
	if (typeof $lvFactions[methodName] === 'function') {
		switch (methodName) {
			case 'setFaction': 			case 'setRelation':
			case 'setRomance':			case 'resetRelation':
			case 'resetRomance':		case 'setReputation':
			case 'setRace': 			case 'setGender':
			case 'addTitle':			case 'removeTitle':
			case 'setHiddenFaction':	case 'setAge':
			case 'setLife':
				$lvFactions[methodName](this, ...params);
				break;
			case 'clearTitles':
			case 'leaveFaction':
				$lvFactions[methodName](this);
				break;
		}
	}
}

Game_Actor.prototype.lvGet = function(methodName, params) {
	if (!$lvFactions || !this._DLL) return null;
	if (typeof $lvFactions[methodName] === 'function') {
		switch (methodName) {
			case 'factionLeader': 	case 'relationValue':
			case 'relationName':  	case 'romanceValue':
			case 'romanceName':   	case 'checkTitle':
				return $lvFactions[methodName](this, ...params);
			case 'isFactionHidden': case 'factionValid': 
			case 'curFaction': 		case 'race': 
			case 'gender':			case 'isMonster':
			case 'firstTitle':		case 'nextTitle':
			case 'prevTitle':		case 'lastTitle':
			case 'reputationValue':	case 'reputationName':
			case 'ageValue':		case 'maxLife':
				return $lvFactions[methodName](this);
		}
	}
	return null;
};


// --- GAME EVENTS ---
const gameEvent_clearPage = Game_Event.prototype.clearPageSettings;
Game_Event.prototype.clearPageSettings = function() {
	gameEvent_clearPage.call(this);
	this._DLL = null;
};

// Overwrite - Includes this plugin's library functions and data
Game_Event.prototype.meetsConditions = function(page) {
	this._DLL = this.loadDLL(page);
	// --
	const c = page.conditions;
	const sw = $dataSystem.switches;
	const v = $dataSystem.variables;
	const pc = $gameParty.leader();
	let name = "";
	if (c.switch1Valid) {
		name = sw[c.switch1Id];
		if (!this.matchSwitchName(name) && !$gameSwitches.value(c.switch1Id)) {
			return false;
		}
	}
	if (c.switch2Valid) {
		name = sw[c.switch2Id];
		if (!this.matchSwitchName(name) && !$gameSwitches.value(c.switch2Id)) {
			return false;
		}
	}
	if (c.variableValid) {
		name = v[c.variableId];
		if (name.match(/\[(AGE|RELATION|ROMANCE|REPUTATION)\]/i)) {
			let type = RegExp.$1.toLowerCase() + "Value";
			if (this.lvGet(type, [pc]) < c.variableValue) {
				return false;
			}
		} else if ($gameVariables.value(c.variableId) < c.variableValue) {
			return false;
		}
	}
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
	const tagSw = /\[(FACTION|RACE|GENDER|REPUTATION|RELATION|ROMANCE|TITLE)\](.*)/i;
	let source = false;
	let target = false;
	if (value.match(tagSw)) {
		// now return if the player matches
		const type = RegExp.$1.toLowerCase();
		const name = RegExp.$2;
		switch (type) {
			case 'faction': 
				source = this.lvGet('curFaction') === name;
				target = pc.lvGet('curFaction') === name;
				break;
			case 'race':
				source = this.lvGet('race') === name;
				target = pc.lvGet('race') === name;
				break;
			case 'gender':
				source = true;
				target = pc.lvGet('gender') === name;
				break;
			case 'reputation':
				source = true;
				target = pc.lvGet('reputationName') === name;
				break;
			case 'relation':
				source = this.lvGet('relationName',[pc]) === name;
				target = true;
				break;
			case 'romance':
				source = this.lvGet('romanceName',[pc]) === name;
				target = true;
				break;
			case 'title':
				source = true;
				target = pc.lvGet('checkTitle',[name]);
				break;
		}
	}
	return source && target;
};

Game_Event.prototype.loadDLL = function(page) {
	const noteTag = /<(FACTION|RACE|GENDER|TITLE)[: ]+([^>]+)>[: ]*(LEADER)?/i;
	const setupTag = /<INIT[: ]+(FACTION|RACE|GENDER|REPUTATION|TITLE)[: ]+([^:>]*)[: ]+(\d+)>/i;
	const frsTag = /<(FRIENDS|ROMANCED)[: ]+(ACTOR|EVENT)[ ]?\[([\d, ]+)\][ ]?(\d+)>[ ]?(\d+)?/i;
	const repTag = /<(?:FAME|REPUTATION)[: ]+(\d+)>/i;
	this._DLL = null;
	if (this.checkComment(/<NPC[: >]?/i, page)) {
		this._DLL = $lvFactions.initData();
		this.initPricePlus();
	}
	if (this._DLL && this.checkComment(noteTag, page)) {
		let type = RegExp.$1.toLowerCase();
		let value = RegExp.$2;
		let set = RegExp.$3 ? true : false;
		switch (type) {
			case "faction": this.lvSet('setFaction', [value, set]); break;
			case "race":    this.lvSet('setRace', [value]);			break;
			case "gender":	this.lvSet('setGender', [value]);		break;
			case "title":	this.lvSet('addTitle', [value]);		break;
		}
	}
	if (this._DLL && this.checkComment(setupTag, page)) {
		let type = RegExp.$1.toLowerCase();
		let name = RegExp.$2;
		let value = Number(RegExp.$3);
		this.lvSet('setPriceAdjust', [type, name, value]);
	}
	if (this._DLL && this.checkComment(frsTag, page)) {
		let type = RegExp.$1.toLowerCase();
		let list = RegExp.$3
			.replace(/([, ]+)/g, "-")
			.split("-")
			.map(id => Number(id))
			.remove(0);
		let value = Number(RegExp.$4);
		let mapId = RegExp.$5 ? Number(RegExp.$5) : 0;
		for (const id of list) {
			let actor = RegExp.$2.toLowerCase() === "actor" 
				? $gameActors.actor(id)
				: mapId > 0 && $gameMap.mapId() !== mapId
				? new LvMZ_RemoteEvent(mapId, id)
				: $gameMap.event(id);
			switch (type) {
				case "friends": 
					this.lvSet('setRelation', [actor, value]);
					break;
				case "romanced":
					this.lvSet('setRomance', [actor, value]);
					break;
			}
		}
	}
	if (this._DLL && this.checkComment(repTag, page)) {
		let value = Number(RegExp.$1);
		this.lvSet('setReputation', [value]);
	}
	// Restore Age and Lifespan (stored by Self Variables: LvMZ_Core)
	if (this._DLL) {
		const key = [this._mapId, this._eventId, "SelfVar", ageVariable];
		const value = $gameSelfVar.value(key);
		const age = value ? Number(value.split(",")[0]) : defaultAge;
		const limit = value ? Number(value.split(",")[1]) : defaultLife;
		if (limit !== defaultLife) {
			this.lvSet('setLife', [limit]);
		}
		this.lvSet('setAge', [age]);
	}
	return this._DLL;
};

Game_Event.prototype.checkComment = function(noteTag, page) {
	const list = page ? page.list : this.list();
	for (const command of list) {
		if (![108,408].contains(command.code)) continue;
		const note = command.parameters[0];
		if (note.match(noteTag)) return true;
	}
	return false;
};

Game_Event.prototype.updateAge = function(years) {
	if (this._DLL) {
		const key = [this._mapId, this._eventId, "SelfVar", ageVariable];
		const oldValue = $gameSelfVar.value(key);
		if (oldValue) {
			const currentAge = Number(oldValue.split(",")[0]);
			const maxLifespan = Number(oldValue.split(",")[1]);
			const newAge = Math.max(defaultAge, currentAge + years);
			// Now convert the numbers BACK into a string, and save it
			const newValue = newAge + "," + maxLifespan;
			$gameSelfVar.setValue(key, newValue);
		} else {
			// Saving the variable for the first time
			const newAge = Math.max(defaultAge, defaultAge + years);
			const setValue = newAge + "," + this.lvGet('maxLife');
			$gameSelfVar.setValue(key, setValue);
		}
	}
};

// -- PRICE PLUS: Adjusts merchant prices without modifying original data
Game_Event.prototype.initPricePlus = function() {
	if (!this._DLL) return;
	this._DLL.priceAdjust = {};
	const data = ["faction","race","gender","reputation","relation","romance","title","age"];
	for (const type of data) {
		this._DLL.priceAdjust[type] = {};
		const list = $lvFactions.nameList(type);
		for (const name of list) {
			this._DLL.priceAdjust[type][name] = 0;
		}
	}
};

Game_Event.prototype.lvSet = function(methodName, params) {
	if (!$lvFactions || !this._DLL) return;
	if (typeof $lvFactions[methodName] === 'function') {
		switch (methodName) {
			case 'setPriceAdjust':		case 'setFaction': 
			case 'setRelation':			case 'setRomance':
			case 'setReputation':		case 'resetRelation':
			case 'resetRomance':		case 'setRace': 
			case 'setGender':			case 'addTitle':
			case 'removeTitle':			case 'setHiddenFaction':
			case 'setAge':				case 'setLife':
				$lvFactions[methodName](this, ...params);
				break;
			case 'clearTitles':			case 'leaveFaction':
				$lvFactions[methodName](this);
				break;
		}
	}
}

Game_Event.prototype.lvGet = function(methodName, params) {
	if (!$lvFactions || !this._DLL) return null;
	if (typeof $lvFactions[methodName] === 'function') {
		switch (methodName) {
			case 'priceAdjust':		case 'factionLeader': 
			case 'relationValue':	case 'relationName':
			case 'romanceValue':	case 'romanceName':
			case 'checkTitle':
				return $lvFactions[methodName](this, ...params);
			case 'isFactionHidden': case 'factionValid': 
			case 'curFaction': 		case 'race': 
			case 'gender':			case 'isMonster':
			case 'firstTitle':		case 'nextTitle':
			case 'prevTitle':		case 'lastTitle':
			case 'reputationValue':	case 'reputationName':
			case 'ageValue':		case 'maxLife':
				return $lvFactions[methodName](this);
		}
	}
	return null;
};


// --- GAME INTERPRETER ---
// Wrapper methods to use in events (conditional branches)

Game_Interpreter.prototype.getFaction = function(object) {
	if (object === this) object = $gameMap.event(this._eventId);
	if (object === 'pc') object = $gameParty.leader();
	return object.lvGet('curFaction');
};

Game_Interpreter.prototype.isFactionHidden = function(object) {
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

Game_Interpreter.prototype.racesMatch = function(source, target) {
	if (source === target) return true;
	if (source === this) source = $gameMap.event(this._eventId);
	if (target === this) target = $gameMap.event(this._eventId);
	if (source === 'pc') source = $gameParty.leader();
	if (target === 'pc') target = $gameParty.leader();
	return source.lvGet('race') === target.lvGet('race');
};

Game_Interpreter.prototype.getGender = function(object) {
	if (object === this) object = $gameMap.event(this._eventId);
	if (object === 'pc') object = $gameParty.leader();
	return object.lvGet('gender');
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
	return source.lvGet('relationName', [target]);
};

Game_Interpreter.prototype.getRomanceValue = function(source, target) {
	if (source === target) return 0;
	if (source === this) source = $gameMap.event(this._eventId);
	if (target === this) target = $gameMap.event(this._eventId);
	if (source === 'pc') source = $gameParty.leader();
	if (target === 'pc') target = $gameParty.leader();
	return source.lvGet('romanceValue', [target]);
};

Game_Interpreter.prototype.getRomanceName = function(source, target) {
	if (source === target) return 'Narcissist';
	if (source === this) source = $gameMap.event(this._eventId);
	if (target === this) target = $gameMap.event(this._eventId);
	if (source === 'pc') source = $gameParty.leader();
	if (target === 'pc') target = $gameParty.leader();
	return source.lvGet('romanceName', [target]);
};

Game_Interpreter.prototype.getReputationValue = function(object) {
	if (object === this) object = $gameMap.event(this._eventId);
	if (object === 'pc') object = $gameParty.leader();
	return object.lvGet('reputationValue');
};

Game_Interpreter.prototype.getReputationName = function(object) {
	if (object === this) object = $gameMap.event(this._eventId);
	if (object === 'pc') object = $gameParty.leader();
	return object.lvGet('reputationName');
};

Game_Interpreter.prototype.checkTitle = function(object, name) {
	if (object === this) object = $gameMap.event(this._eventId);
	if (object === 'pc') object = $gameParty.leader();
	return object.lvGet('checkTitle', [name]);
};

Game_Interpreter.prototype.getAge = function(object) {
	if (object === this) object = $gameMap.event(this._eventId);
	if (object === 'pc') object = $gameParty.leader();
	return object.lvGet('ageValue');
};

Game_Interpreter.prototype.getLifespan = function(object) {
	if (object === this) object = $gameMap.event(this._eventId);
	if (object === 'pc') object = $gameParty.leader();
	return object.lvGet('maxLife');
};

Game_Interpreter.prototype.getPriceAdjust = function(source, target, type) {
	if (source === target) return 0;
	if (source === this) source = $gameMap.event(this._eventId);
	if (target === this) target = $gameMap.event(this._eventId);
	if (source === 'pc') source = $gameParty.leader();
	if (target === 'pc') target = $gameParty.leader();
	return source.lvGet('priceAdjust', [target, type.toLowerCase()]);
};

})();

/******************************************************************************
	public functions
******************************************************************************/

// --- GAME FACTIONS ---
function Game_Factions() {
	this.initialize(...arguments);
}

Game_Factions.prototype.initialize = function() {
	const params      = new LvParams("LvMZ_Factions");
	this.facList      = params.value('FactionList','json');
	this.raceList     = params.value('RaceList','json');
	this.genderList   = params.value('GenderList','json');
	this.repList      = params.value('ReputationList','json');
	this.relateList   = params.value('RelationScale','json');
	this.loveList     = params.value('RomanceScale','json');
	this.titleList    = params.value('TitleList','json');
	this.ageList      = params.value('AgeList','json');
	this._factions    = this.initFactionData();
	this._races       = this.initRaceData();
	this._genders     = this.initGenderData();
	this._reputations = this.initReputationData();
	this._relations   = this.initRelationData();
	this._romances    = this.initRomanceData();
	this._titles      = this.initTitleData();
	this._ages   	  = this.initAgeData();
};

Game_Factions.prototype.initData = function() {
	return {
		faction: "None",
		factionLeader: false,
		race: "",
		gender: "",
		reputation: 0,
		relations: {},
		romances: {},
		titles: [],
		titleIndex: -1,
		age: defaultAge,
		lifespan: defaultLife
	};
};

Game_Factions.prototype.initFactionData = function() {
	return this.facList.reduce((r,v) => {
		const data = { 
			name: v.Name, 
			hidden: v.hiddenFac.toLowerCase() === "true",
			vs: {}
		};
		const list = JSON.parse(v.RelationList).map(e => JSON.parse(e));
		for (const obj of list) {
			data.vs[obj.Relation] = Number(obj.Value);
		}
		r.push(data);
		return r;
	},[]);
};

Game_Factions.prototype.initRaceData = function() {
	return this.raceList.reduce((r,v) => {
		const data = { 
			name: v.Name, 
			monster: v.isMonster.toLowerCase() === "true",
			vs: {}
		};
		const list = JSON.parse(v.RelationList).map(e => JSON.parse(e));
		for (const obj of list) {
			data.vs[obj.Relation] = Number(obj.Value);
		}
		r.push(data);
		return r;
	},[]);
};

Game_Factions.prototype.initGenderData = function() {
	return this.genderList.reduce((r,v) => {
		const data = { name: v.Name, vs: {} };
		const list = JSON.parse(v.GenderList).map(e => JSON.parse(e));
		for (const obj of list) {
			data.vs[obj.Relation] = Number(obj.Value);
		}
		r.push(data);
		return r;
	},[]);
};

Game_Factions.prototype.initReputationData = function() {
	return this.repList.reduce((r,v) => {
		const data = {
			name: v.Name,
			min: Number(v.MinValue),
			max: Number(v.MaxValue),
			vs: {}
		};
		const list = JSON.parse(v.RelationList).map(e => JSON.parse(e));
		for (const obj of list) {
			data.vs[obj.Relation] = Number(obj.Value);
		}
		r.push(data);
		return r;
	},[]);
};

Game_Factions.prototype.initRelationData = function() {
	return this.relateList.reduce((r,v) => {
		r.push({
			name: v.Name,
			min: Number(v.MinValue),
			max: Number(v.MaxValue),
			price: Number(v.Value)
		});
		return r;
	},[]);
};

Game_Factions.prototype.initRomanceData = function() {
	return this.loveList.reduce((r,v) => {
		r.push({
			name: v.Name,
			min: Number(v.MinValue),
			max: Number(v.MaxValue),
			price: Number(v.Value)
		});
		return r;
	},[]);
};

Game_Factions.prototype.initTitleData = function() {
	return this.titleList.reduce((r,v) => {
		r.push({ name: v.Name, price: Number(v.Value) });
		return r;
	},[]);
};

Game_Factions.prototype.initAgeData = function() {
	return this.ageList.reduce((r,v) => {
		r.push({ 
			name: v.Name,
			min: Number(v.minRange),
			max: Number(v.maxRange),
			price: Number(v.Value)
		});
		return r;
	},[]);
};

// ----------------------------------------------------------------------------
// Faction Methods: Everything to do with factions only

Game_Factions.prototype.leaveFaction = function(object) {
	object._DLL.faction = "";
	object._DLL.factionLeader = false;
	$gameMap.requestRefresh();
};

Game_Factions.prototype.setFaction = function(object, name, isLeader) {
	if (this.nameList('faction').includes(name)) {
		object._DLL.faction = name;
		object._DLL.factionLeader = Boolean(isLeader);
		$gameMap.requestRefresh();
	}
};

Game_Factions.prototype.factionLeader = function(object, name) {
	if (this.curFaction(object) !== name) return false;
	if (!this.factionValid(object)) {
		// Invalid faction - set leader to false
		object._DLL.factionLeader = false;
	}
	return object._DLL.factionLeader;
};

Game_Factions.prototype.setHiddenFaction = function(object, value) {
	if (this.factionValid(object)) {
		const faction = this.curFaction(object);
		const index = this._factions.indexByKey('name', faction);
		this._factions[index].hidden = Boolean(value);
		$gameMap.requestRefresh();
	}
};

Game_Factions.prototype.isFactionHidden = function(object) {
	if (this.factionValid(object)) {
		const faction = this.curFaction(object);
		const index = this._factions.indexByKey('name', faction);
		return !!this._factions[index].hidden;
	}
	return false;
};

Game_Factions.prototype.factionValid = function(object, faction="") {
	if (!faction) faction = this.curFaction(object);
	return this.nameList('faction').includes(faction) && faction !== 'None';
};

Game_Factions.prototype.curFaction = function(object) {
	return object._DLL.faction || "None";
};

// --- Direct calls (not usd in lvGet or lvSet)
Game_Factions.prototype.registerFaction = function(name, isHidden) {
	const factionList = this.nameList('faction');
	if (!factionList.includes(name)) {
		const data = { 
			name: name, 
			hidden: Boolean(isHidden), 
			vs: {} 
		};
		factionList.forEach(name => data.vs[name] = 0);
		this._factions.push(data);
	}
};

Game_Factions.prototype.removeFaction = function(name) {
	// Failsafe - Invalid Faction; Do Nothing
	if (!this.factionValid(null, name)) return;
	// Cycles through all actors - Remove from this faction
	for (const actor of $gameParty.allMembers()) {
		if (this.curFaction(actor) === name) {
			actor._DLL.faction = "";
			actor._DLL.factionLeader = false;
		}
	}
	// Cycle through all current map events - Remove from this faction
	for (const event of $gameMap.events()) {
		if (this.curFaction(event) === name) {
			event._DLL.faction = "";
			event._DLL.factionLeader = false;
		}
	}
	// Remove this faction from the data
	const index = this._factions.indexByKey('name', name);
	this._factions.splice(index, 1);
	$gameMap.requestRefresh();
};

Game_Factions.prototype.setFactionVsPrice = function(source, target, value) {
	if (this.factionValid(null, source) && this.factionValid(null, target)) {
		const index = this._factions.indexByKey('name', source);
		this._factions[index].vs[target] = Math.floor(value).clamp(-100,100);
	}
};

// ----------------------------------------------------------------------------
// Race Methods: Everything to do with races 

Game_Factions.prototype.setRace = function(object, name) {
	// VisuStella's methods have priority
	// - If using ElementStatusCore, use VisuMZ's plugin 
	//   commands instead.
	if (this.checkVisuMZ(object)) {
		if ($gameTemp.isPlaytest()) {
			alert("VisuMZ ElementStatusCore in use - use their plugin commands");
		}
		return;
	}
	if (this.nameList('race').includes(name)) {
		object._DLL.race = name;
		$gameMap.requestRefresh();
	}
};

Game_Factions.prototype.setMonster = function(object, value) {
	const race = this.race(object);
	if (this.nameList('race').includes(race)) {
		const index = this._races.indexByKey('name', race);
		this._races[index].monster = Boolean(value);
		$gameMap.requestRefresh();
	}
};

Game_Factions.prototype.isMonster = function(object) {
	const race = this.race(object);
	if (this.nameList('race').includes(race)) {
		const index = this._races.indexByKey('name', race);
		return !!this._races[index].monster;
	}
	return false;
};

Game_Factions.prototype.race = function(object) {
	if (this.checkVisuMZ(object)) {
		return object.getTraitSet('Race');
	}
	return object._DLL.race || "";
};

Game_Factions.prototype.raceValid = function(object) {
	const race = this.race(object);
	return this.nameList('race').includes(race);
};

Game_Factions.prototype.setRaceVsPrice = function(source, target, value) {
	if (this.raceValid(source) && this.raceValid(target)) {
		const sRace = this.race(source);
		const tRace = this.race(target);
		const index = this._races.indexByKey('name', sRace);
		this._races[index].vs[tRace] = Math.floor(value).clamp(-100,100);
	}
};

// ----------------------------------------------------------------------------
// Gender Methods: Everything to do with genders

Game_Factions.prototype.setGender = function(object, name) {
	// VisuStella's methods have priority
	// - If using ElementStatusCore, use VisuMZ's plugin 
	//   commands instead.
	if (this.checkVisuMZ(object)) {
		if ($gameTemp.isPlaytest()) {
			alert("VisuMZ ElementStatusCore in use - use their plugin commands");
		}
		return;
	}
	if (this.nameList('gender').includes(name)) {
		object._DLL.gender = name;
		$gameMap.requestRefresh();
	}
};

Game_Factions.prototype.gender = function(object) {
	if (this.checkVisuMZ(object)) {
		return object.getTraitSet('Gender');
	}
	return object._DLL.gender || "";
};

Game_Factions.prototype.genderValid = function(object) {
	const value = this.gender(object);
	return this.nameList('gender').includes(value);
};

Game_Factions.prototype.setGenderVsPrice = function(source, target, value) {
	if (this.genderValid(source) && this.genderValid(target)) {
		const sGender = this.gender(source);
		const tGender = this.gender(target);
		const index = this._genders.indexByKey('name', sGender);
		this._genders[index].vs[tGender] = Math.floor(value).clamp(-100,100);
	}
};

// ----------------------------------------------------------------------------
// Relation Methods: Everything to do with relationships

Game_Factions.prototype.setRelation = function(source, target, value) {
	if (source === target) return; // can't befriend yourself..
	const name = target.name();
	const cv = source._DLL.relations[name] || 0;
	const min = this.min('relation');
	const max = this.max('relation');
	source._DLL.relations[name] = (cv + value).clamp(min, max);
	if (source._DLL.relations[name] === 0) {
		delete source._DLL.relations[name];
	}
	$gameMap.requestRefresh();
};

Game_Factions.prototype.relationValue = function(source, target) {
	if (source === target) return 0;
	return source._DLL.relations[target.name()] || 0;
};

Game_Factions.prototype.relationName = function(source, target) {
	if (source === target) return "Narcissist";	
	const value = this.relationValue(source, target);
	const data = this.compare(null, value, 'relation');
	return data ? data.name : "";
};

Game_Factions.prototype.resetRelation = function(source, target) {
	delete source._DLL.relations[target.name()];
	$gameMap.requestRefresh();
};

Game_Factions.prototype.setRomance = function(source, target, value) {
	if (source === target) return; // can't romance yourself..
	const name = target.name();
	const cv = source._DLL.romances[name] || 0;
	const min = this.min('romance');
	const max = this.max('romance');
	source._DLL.romances[name] = (cv + value).clamp(min, max);
	if (source._DLL.romances[name] === 0) {
		delete source._DLL.romances[name];
	}
	$gameMap.requestRefresh();
};

Game_Factions.prototype.romanceValue = function(source, target) {
	if (source === target) return 0;
	return source._DLL.romances[target.name()] || 0;
};

Game_Factions.prototype.romanceName = function(source, target) {
	if (source === target) return "Narcissist";
	const value = this.romanceValue(source, target);
	const data = this.compare(null, value, 'romance');
	return data ? data.name : "";
};

Game_Factions.prototype.resetRomance = function(source, target) {
	delete source._DLL.romances[target.name()];
	$gameMap.requestRefresh();
};

Game_Factions.prototype.friends = function(source) {
	return this.relateList(source._DLL.relations);
};

Game_Factions.prototype.romanced = function(source) {
	return this.relateList(source._DLL.romances);
};

Game_Factions.prototype.relateList = function(data) {
	const list = [];
	for (const actor of $gameParty.allMembers()) {
		let value = data[actor.name()];
		if (isNaN(value)) continue;
		list.push({
			objectId: actor._actorId,
			value: value
		});
	}
	const mapList = $dataMapInfos.filter(obj => !!obj).map(map => Number(map.id));
	for (const mapId of mapList) {
		const evList = MapManager.simulateEvents(mapId);
		for (const event of evList) {
			let value = data[event.name];
			if (isNaN(value)) continue;
			list.push({
				objectId: [mapId, event.id],
				value: value
			});
		}
	}
	return list;
};

// ----------------------------------------------------------------------------
// Reputation Methods: Everything to do with reputation

Game_Factions.prototype.setReputation = function(object, value) {
	if (value) {
		const cv = this.reputationValue(object);
		const min = this.min('reputation');
		const max = this.max('reputation');
		object._DLL.reputation = (cv + value).clamp(min, max);
		$gameMap.requestRefresh();
	}
};

Game_Factions.prototype.reputationName = function(object) {
	const v = this.reputationValue(object);
	const list = this._reputations.filter(e => v >= e.min && v <= e.max);
	return list.length > 0 ? list[0].name : "";
};

Game_Factions.prototype.reputationValue = function(object) {
	return object._DLL.reputation || 0;
};

Game_Factions.prototype.reputationValid = function(object) {
	const value = this.reputationName(object);
	return this.nameList('reputation').includes(value);
};

Game_Factions.prototype.setReputationVsPrice = function(source, target, value) {
	if (this.reputationValid(source) && this.reputationValid(target)) {
		const sFame = this.reputationName(source);
		const tFame = this.reputationName(target);
		const index = this._reputations.indexByKey('name', sFame);
		this._reputations[index].vs[tFame] = Math.floor(value).clamp(-100,100);
	}
};

// ----------------------------------------------------------------------------
// Title Methods: Everything to do with titles 

Game_Factions.prototype.firstTitle = function(object) {
	object._DLL.titleIndex = 0;
	return object._DLL.titles[0] || "None";
};

Game_Factions.prototype.nextTitle = function(object) {
	const index = ++object._DLL.titleIndex;
	const maxLength = object._DLL.titles.length;
	if (index >= maxLength) {
		object._DLL.titleIndex = -1;
		return "None"; // end of list
	}
	return object._DLL.titles[index] || "None";
};

Game_Factions.prototype.prevTitle = function(object) {
	const index = --object._DLL.titleIndex;
	if (index < 0) {
		object._DLL.titleIndex = -1;
		return "None"; // end of list
	}
	return object._DLL.titles[index] || "None";
};

Game_Factions.prototype.lastTitle = function(object) {
	const index = object._DLL.titles.length - 1;
	object._DLL.titleIndex = index;
	return object._DLL.titles[index] || "None";
};

Game_Factions.prototype.addTitle = function(object, name) {
	if (!this.nameList('title').includes(name)) return;
	if (this.checkTitle(object, name)) return;
	object._DLL.titles.push(name);
	$gameMap.requestRefresh();
};

Game_Factions.prototype.removeTitle = function(object, name) {
	if (!this.checkTitle(object, name)) return;
	if (object._DLL.titleIndex >= 0) object._DLL.titleIndex--;
	const index = object._DLL.titles.indexOf(name);
	object._DLL.titles.splice(index, 1);
	$gameMap.requestRefresh();
};

Game_Factions.prototype.clearTitles = function(object) {
	object._DLL.titles = [];
	object._DLL.titleIndex = -1;
	$gameMap.requestRefresh();
};

Game_Factions.prototype.checkTitle = function(object, name) {
	return object._DLL.titles.includes(name);
};

// ----------------------------------------------------------------------------
// Age methods - Everything to do with ages and max lifespan

Game_Factions.prototype.maxLife = function(object) {
	return object._DLL.lifespan;
};

Game_Factions.prototype.ageValue = function(object) {
	return object._DLL.age;
};

Game_Factions.prototype.setLife = function(object, value) {
	object._DLL.lifespan = Math.max(defaultAge, Math.floor(value));
	this.checkAge(object);
};

Game_Factions.prototype.setAge = function(object, value) {
	object._DLL.age = Math.max(defaultAge, Math.floor(value));
	this.checkAge(object);
};

Game_Factions.prototype.ageName = function(object) {
	const value = this.ageValue(object);
	const data = this.compare(null, value, 'age');
	return data ? data.name : "";
};

Game_Factions.prototype.checkAge = function(object) {
	if (this.ageValue(object) > this.maxLife(object)) {
		// Dies - WIP
	}
};

Game_Factions.prototype.ageAllActors = function(value) {
	for (const actor of $gameParty.allMembers()) {
		let newValue = this.ageValue(actor) + value;
		this.setAge(actor, newValue);
	}
};

Game_Factions.prototype.ageAllEvents = function(value) {
	const maps = $dataMapInfos.filter(obj => !!obj).map(map => Number(map.id));
	for (const mapId of maps) {
		const events = MapManager.simulateEvents(mapId);
		for (const event of events) {
			let newValue = this.ageValue(event) + value;
			this.setAge(event, newValue);
			event.updateAge(value); // LvMZ_Core: Self Variable
		}
	}
};

// ----------------------------------------------------------------------------
// Price methods

// Adjustment: Sets the price adjustment value (locally on Game_Event)
Game_Factions.prototype.setPriceAdjust = function(source, name, type, value) {
	if (source instanceof Game_Event && this.nameList(type).includes(name)) {
		const price = Number(value).clamp(-200,200); // failsafe
		source._DLL.priceAdjust[type][name] = Math.floor(price);
	}
};

// Adjustment: Gets the current price adjustment value
Game_Factions.prototype.priceAdjust = function(source, target, type) {
	const sourceValue = this.getSource(source, type);
	const targetValue = this.getTarget(source, target, type);
	const data = this.compare(sourceValue, targetValue, type);
	if (data) {
		const adj = this.pricePlus(source, type, targetValue);
		const price = data.vs ? data.vs[targetValue] || 0 : data.price;
		return (price + adj).clamp(-100,100);
	}
	return 0;
};

Game_Factions.prototype.pricePlus = function(source, type, name) {
	if (source instanceof Game_Event) {
		const price = source._DLL.priceAdjust[type.toLowerCase()];
		return price ? price[name] || 0 : 0;
	}
	return 0;
};

// ----------------------------------------------------------------------------
//  * Passive methods (used in others, not to be called out of scope)

Game_Factions.prototype.checkVisuMZ = function(object) {
	const isActor = object instanceof Game_Actor;
	return isActor && Imported["VisuMZ_1_ElementStatusCore"];
};

Game_Factions.prototype.getSource = function(object, type) {
	switch (type.toLowerCase()) {
		case 'faction': return this.curFaction(object);
		case 'race': return this.race(object);
		case 'gender': return this.gender(object);
		case 'reputation': return this.reputationName(object);
	}
	return null;
};

Game_Factions.prototype.getTarget = function(source, target, type) {
	switch (type.toLowerCase()) {
		case 'faction': return this.curFaction(target);
		case 'race': return this.race(target);
		case 'gender': return this.gender(target);
		case 'reputation': return this.reputationName(target);
		case 'relation': return this.relationValue(source, target);
		case 'romance': return this.romanceValue(source, target);
		case 'title': return this.lastTitle(target);
		case 'age': return this.ageValue(target);
	}
	return null;
};

Game_Factions.prototype.compare = function(source, target, type) {
	let list = this.data(type);
	switch (type.toLowerCase()) {
		case 'faction': case 'race': case 'gender': case 'reputation':
			list = list.filter(e => e.name === source);
			break;
		case 'age': case 'relation': case 'romance': 
			list = list.filter(e => Number(target) >= e.min);
			list = list.filter(e => Number(target) <= e.max);
			break;
		case 'title':
			list = list.filter(e => e.name === target);
			break;
	}
	return list.length > 0 ? list[0] : null;
};

Game_Factions.prototype.min = function(type) {
	const list = ["age","reputation","relation","romance"];
	if (list.includes(type.toLowerCase())) {
		const data = this.data(type);
		return Math.min(...data.map(obj => obj.min));
	}
	return 0;
};

Game_Factions.prototype.max = function(type) {
	const list = ["age","reputation","relation","romance"];
	if (list.includes(type.toLowerCase())) {
		const data = this.data(type);
		return Math.max(...data.map(obj => obj.max));
	}
	return 0;
};

Game_Factions.prototype.nameList = function(type) {
	switch (type.toLowerCase()) {
		case 'faction':    return this.facList.map(obj => obj.Name);
		case 'race':       return this.raceList.map(obj => obj.Name);
		case 'gender':     return this.genderList.map(obj => obj.Name);
		case 'reputation': return this.repList.map(obj => obj.Name);
		case 'relation':   return this.relateList.map(obj => obj.Name);
		case 'romance':    return this.loveList.map(obj => obj.Name);
		case 'title':      return this.titleList.map(obj => obj.Name);
		case 'age':		   return this.ageList.map(obj => obj.Name);
	}
	return [];
};

Game_Factions.prototype.data = function(type) {
	switch (type.toLowerCase()) {
		case 'faction':    return this._factions;
		case 'race':       return this._races;
		case 'gender':     return this._genders;
		case 'reputation': return this._reputations;
		case 'relation':   return this._relations;
		case 'romance':    return this._romances;
		case 'title':      return this._titles;
		case 'age':		   return this._ages;
	}
	return [];
};