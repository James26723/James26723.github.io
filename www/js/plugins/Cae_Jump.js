// ==================================================
// Cae_Jump.js
// ==================================================

/**
 * @file Cae_Jump.js (RMMZ)
 * Various options: jump to, jump speed/height/passability, etc.
 * @author Caethyril
 * @version 1.1
 */

//#region Plugin header
/*:
 * @target MZ
 * @plugindesc v1.1 - Various options: jump to, jump speed/height/passability, etc.
 * @author Caethyril
 * @url https://forums.rpgmakerweb.com/index.php?threads/caethyrils-mz-plugins.125657/
 * 
 * @help Features:
 *   Each feature is optional!
 * 
 *   - Adjust the default jump speed.
 *   - Adjust or remove the jump height: 0 height = straight line jumps.
 *   - Forbid jumps landing in impassable terrain if Through is off.
 *   - Turn on a switch when a jump fails.
 *   - Let (0, 0) jumps re-trigger touch events on landing.
 *   - Hopping movement options.
 * 
 *   - Jump to a specific tile using a script call.
 *   - Define custom per-character jump settings with script calls.
 * 
 * Script calls:
 * 
 *   In a move route (change values as desired):
 *     this.jumpTo(3, 5);
 *       - the moved character will jump to x = 3, y = 5.
 *     this._jumpSpeedMult = 1.2;
 *       - the moved character will jump 20% faster than default.
 *     this._jumpHeightMult = 0.5;
 *       - the moved character will jump 50% as high as default.
 *     this._hopMove = true;
 *       - the moved character will move in hops until further notice.
 *     delete this._jumpSpeedMult;
 *       - the moved character will have their jump speed reset to default.
 * 
 *   In a Script command in an event (change values as desired):
 *     $gamePlayer.jumpTo(10, 4);
 *       - the player will jump to x = 10, y = 4.
 *     this.character(5)._jumpSpeedMult = 0.8;
 *       - map event 5 on this map will jump 20% slower than default.
 *       - swap the 5 for a 0 to reference "This Event";
 *         swap the 5 for -1 to reference the player.
 *     this.character(0)._jumpHeightMult = 1.25;
 *       - this event will jump 25% higher than default.
 *     this.character(-1)._hopMove = true;
 *       - the player will move in hops until further notice.
 *     delete $gameMap.event(3)._hopMove;
 *       - map event 3 will now walk around rather than hopping.
 * 
 *   Per-character values will override the plugin parameter settings.
 *   Note that typically event values will reset when leaving the map.
 * 
 * Plugin Command:
 *   Change Jump Speed  - adjust the jump speed mid-game.
 *   Change Jump Height - adjust the jump height mid-game.
 *   Reset Jump Speed   - reset jump speed to default value.
 *   Reset Jump Height  - reset jump height to default value.
 *
 *  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
 * Terms of use:
 *   This plugin is free to use and/or modify, under these conditions:
 *     - None of the original plugin header is removed.
 *     - Credit is given to Caethyril for the original work.
 * 
 *  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
 * Compatibility:
 *   Aliases:   Game_CharacterBase:
 *                jump, jumpHeight, updateJump,
 *                isMoving, moveStraight, moveDiagonally
 *              Game_Player:
 *                updateJump
 *              Game_Follower:
 *                update
 *              DataManager:
 *                createGameObjects, makeSaveContents, extractSaveContents
 *   Defines:   Game_CharacterBase:
 *                jumpTo (customisable via plugin parameter)
 *   This plugin adds data to save files iff its Add Save Data param = true.
 * 
 *  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
 * Changelog:
 *   v1.1 (2020-09-09): Fixed - custom jumpTo name no longer crashes on hop.
 *   v1.0 (2020-09-08): Initial release! Merge/extension of my RMMV plugins.
 * 
 * @command Change Jump Speed
 * @desc Change the jump speed multiplier.
 * 
 * @arg Jump Speed Multiplier
 * @type number
 * @min 0.01
 * @decimals 2
 * @desc Multiplies jump speed.
 * Default: 1
 * @default 1.00
 * 
 * @command Reset Jump Speed
 * @desc Resets the jump speed multiplier to the value defined in this plugin's parameters.
 * 
 * @command Change Jump Height
 * @desc Change the jump height multiplier.
 * 
 * @arg Jump Height Multiplier
 * @type number
 * @min -10000
 * @decimals 2
 * @desc Multiplies jump height. 0 = straight-line jumps.
 * Default: 1
 * @default 1.00
 * 
 * @command Reset Jump Height
 * @desc Resets the jump height multiplier to the value defined in this plugin's parameters.
 * 
 * @param --- Jump Movement ---
 * @type select
 * @desc Options determining the default speed and height of jumps.
 * 
 * @param Jump Speed Multiplier
 * @parent --- Jump Movement ---
 * @type number
 * @min 0.01
 * @decimals 2
 * @desc Initial multiplier for jump speed.
 * Default: 1
 * @default 1.00
 * 
 * @param Jump Height Multiplier
 * @parent --- Jump Movement ---
 * @type number
 * @min -10000
 * @decimals 2
 * @desc Initial multiplier for jump height. 0 = straight-line jumps.
 * Default: 1
 * @default 1.00
 * 
 * @param --- Jump Rules ---
 * @type select
 * @desc Options determining when jumps can or cannot be made.
 * 
 * @param Jumps Obey Passability
 * @parent --- Jump Rules ---
 * @type boolean
 * @desc If true, jumps landing on an impassable tile will fail.
 * @default false
 * 
 * @param Jump Zones
 * @parent --- Jump Rules ---
 * @type struct<JumpZoneType>[]
 * @desc A list of region IDs & "jump zones": jumps between different zones are forbidden unless Through is on.
 * @default []
 * 
 * @param Failed Jump in Place
 * @parent --- Jump Rules ---
 * @type boolean
 * @desc If true, failed jumps will do a (0, 0) jump. If false, no motion will occur.
 * @default true
 * 
 * @param Failed Jump Switch
 * @parent --- Jump Rules ---
 * @type switch
 * @desc When a jump fails, this switch will turn on.
 * Does not process for hopping moves.
 * @default 0
 * 
 * @param --- Move Options ---
 * @type select
 * @desc Options relating to jumping vs standard movement.
 * 
 * @param Jump in Place Triggers
 * @parent --- Move Options ---
 * @type boolean
 * @desc If true, (0, 0) jumps will re-trigger present touch events on landing.
 * @default false
 * 
 * @param Hopping Movement
 * @parent --- Move Options ---
 * @type boolean
 * @desc If true, default movement will be hopping, i.e. jump every tile. This will obey standard move rules.
 * @default false
 * 
 * @param Add Save Data
 * @type boolean
 * @desc If true, plugin data will be added to save files.
 * Only necessary if using the plugin command(s).
 * @default false
 * 
 * @param --- Advanced ---
 * @type select
 * @desc Advanced internal configuration options.
 * 
 * @param Property: jumpTo
 * @parent --- Advanced ---
 * @type string
 * @desc The name of the new "jump to" method on Game_CharacterBase.
 * @default jumpTo
 * 
 * @param Property: jumpSpeedMult
 * @parent --- Advanced ---
 * @type string
 * @desc The map character property used to store personal jump speed multiplier value. Default: _jumpSpeedMult.
 * @default _jumpSpeedMult
 * 
 * @param Property: jumpHeightMult
 * @parent --- Advanced ---
 * @type string
 * @desc The map character property used to store personal jump height multiplier value. Default: _jumpHeightMult.
 * @default _jumpHeightMult
 * 
 * @param Property: hopMove
 * @parent --- Advanced ---
 * @type string
 * @desc The map character property, true iff the character is supposed to hop around. Default: _hopMove.
 * @default _hopMove
 * 
 * @param Property: Save
 * @parent --- Advanced ---
 * @type string
 * @desc The name of the property under which data is stored in save files.
 * @default Cae_JumpSettings
 */
// ==================================================
/*~struct~JumpZoneType:
 * @param Region ID
 * @type number
 * @min 1
 * @max 255
 * @desc A region ID.
 * @default
 * 
 * @param Jump Zone
 * @type number
 * @min -10000
 * @desc A "jump zone" identifier. Jumps from one zone to a different zone are forbidden.
 * @default 0
 */
//#endregion

(function() {
'use strict';

    const NAMESPACE   = 'Jump';
    const PLUGIN_NAME = 'Cae_' + NAMESPACE;
    const ERR_PRE     = PLUGIN_NAME + '.js ';
    const ERR_NOPARAM = ERR_PRE + 'could not find its parameters!\nCheck the plugin file is named correctly and try again.';
    const WARN_BADVAL = ERR_PRE + 'could not use %1 name "%2", reverting to default: "%3".';

    window.CAE = window.CAE || {};      // Author namespace

    (($, U) => {

        Object.defineProperty($, 'VERSION', { value: 1.1 });    // Version declaration
        window.Imported = window.Imported || {};                // Import namespace
        Imported[PLUGIN_NAME] = $.VERSION;                      // Import declaration

    // ======== Utility (share) ======== //
    // ======== Parameter stuff ======== //

        void (p => {

            if (!p) { SceneManager.showDevTools(); throw new Error(ERR_NOPARAM); };

            $.parse = {
                int:   function(name) { return parseInt(p[name], 10) || 0 },
                float: function(name) { return Number(p[name]) || 0; },
                bool:  function(name) { return p[name] === 'true'; },
                arr:   function(name) { return JSON.parse(p[name] || '[]'); },
                zones: function(name) {
                    const res = $.parse.arr(name).map(JSON.parse);
                    res.forEach(o => { ['Region ID','Jump Zone'].forEach(k => o[k] = parseInt(o[k], 10) || 0); });
                    return res;
                },
                prop:  function(name, dFault = '_' + name) {
                    const prop = p['Property: ' + name];
                    if (!prop) {
                        console.warn(WARN_BADVAL.format('property', prop, dFault));
                        return dFault;
                    }
                    return prop;
                },
                tag:   function(name, dFault = name) {
                    const tag = p['Notetag: ' + name];
                    if (!tag || String(tag).includes('>')) {
                        console.warn(WARN_BADVAL.format('notetag', tag, dFault));
                        return dFault;
                    }
                    return tag;
                }
            };

            $.def = {
                v: $.parse.float('Jump Speed Multiplier'),
                h: $.parse.float('Jump Height Multiplier')
            };

            /**
             * Converts multiplier to additive speed.
             * @param {Number} mult - Jump speed multiplier
             * @returns {Number} Additive jump speed per frame
             */
            $.speedMulToAdd = function(mult) { return Math.max(mult, 0.01) - 1; };

            /**
             * Sets additive jump speed to a value appropriate for input multiplier.
             * @param {Number} mult - Jump speed multiplier
             */
            $.setJumpSpeed = function(mult = $.def.v) { $.addV = $.speedMulToAdd(mult); };

            /**
             * Sets jump height multiplier.
             * @param {Number} mult - Jump height multiplier
             */
            $.setJumpHeight = function(mult = $.def.h) { $.mulH = mult; };

            $.rule = {
                pass:      $.parse.bool('Jumps Obey Passability'),
                zones:     $.parse.zones('Jump Zones'),
            //  short:     $.parse.bool('Shorten Failed Jumps'),   // LoS stuff again... Y-Y
                stayJumpy: $.parse.bool('Failed Jump in Place'),
                failSw:    $.parse.int('Failed Jump Switch')
            };

            $.juadev = $.parse.bool('Jump in Place Triggers');     // "jump-up-and-down-event" ._.
            $.allHop = $.parse.bool('Hopping Movement');
            $.save   = $.parse.bool('Add Save Data');

            Object.defineProperty($, 'M_JUMPTO',  { value: $.parse.prop('jumpTo', 'jumpTo') });
            Object.defineProperty($, 'P_SPEED',   { value: $.parse.prop('jumpSpeedMult') });
            Object.defineProperty($, 'P_HEIGHT',  { value: $.parse.prop('jumpHeightMult') });
            Object.defineProperty($, 'P_HOP',     { value: $.parse.prop('hopMove') });
            Object.defineProperty($, 'SAVE_PROP', { value: $.parse.prop('Save', PLUGIN_NAME) });

        })($.params = PluginManager.parameters(PLUGIN_NAME));

    // ========= Init Routines ========= //

        /** Resets jump speed/height values to default. */
        $._init = function() {
            $.setJumpSpeed();
            $.setJumpHeight();
        };
        $._init();

    // ======== Utility (local) ======== //

        /**
         * Gets appropriate jump speed additional value.
         * Checks for relevant property on character; if it exists, return that, else return global value.
         * @param {Game_CharacterBase} char - Game_CharacterBase instance to reference.
         * @returns {Number} Additive offset for jump speed progression per frame.
         */
        $.getJumpSpeedAdd = function(char) {
            const myVal = char?.[$.P_SPEED];
            if (myVal !== undefined) return $.speedMulToAdd(myVal);
            return $.addV;
        };

        /**
         * Gets appropriate jump height multiplier value.
         * Checks for relevant property on character; if it exists, return that, else return global value.
         * @param {Game_CharacterBase} char - Game_CharacterBase instance to reference.
         * @returns {Number} Multiplicative value for jump height.
         */
        $.getJumpHeightMul = function(char) {
            const myVal = char?.[$.P_HEIGHT];
            if (myVal !== undefined) return myVal;
            return $.mulH;
        };

        /**
         * Offsets a given tile coordinate by a given amount.
         * Accounts for looped maps.
         * @param {Number} start - Starting tile coordinate
         * @param {Number} plus - Number of tiles to offset
         * @param {Boolean} isX - True iff offset is in the x direction
         * @returns {Number} Target tile coordinate.
         */
        $.getTargetTile = function(start, plus, isX) {
            if (!plus) return start;
            const dir = isX ? (plus > 0 ? 6 : 4) : (plus > 0 ? 2 : 8);
            const method = 'round' + (isX ? 'X' : 'Y') + 'WithDirection';
            let res = start;
            for (let n = Math.abs(plus); n--;) res = $gameMap[method](res, dir);
            return res;
        };

        /**
         * @param {Number} regionId - Region ID (1~255)
         * @returns {Number} Corresponding "jump zone" identifier.
         */
        $.getZoneFromRegion = function(regionId) {
            return $.rule.zones.find(z => z['Region ID'] === regionId)?.['Jump Zone'];
        };

        /**
         * Used to check whether target tile is available for a jump landing.
         * Custom setup to accommodate 1-tile islands.
         * @param {Game_CharacterBase} char - Game_CharacterBase reference
         * @param {Number} x - X-coordinate of target tile
         * @param {Number} y - Y-coordinate of target tile
         * @returns {Boolean} True iff target tile can be moved onto from an adjacent tile.
         */
        $.checkPassage = function(char, x, y) {
            if (!$.rule.pass) return true;
            if (char.pos(x, y)) return true;
            if (char.isThrough()) return true;
            if (!$gameMap.isValid(x, y)) return false;
            if (char.isCollidedWithCharacters(x, y)) return false;
            if (![2,4,6,8].some(d => $gameMap.isPassable(x, y, d))) return false;
            return true;
        };

        /**
         * @param {Number} sx - Starting X
         * @param {Number} sy - Starting Y
         * @param {Number} tx - Target X
         * @param {Number} ty - Target Y
         * @returns {Boolean} True iff not jumping from one jump zone to a different jump zone.
         */
        $.checkJumpZones = function(sx, sy, tx, ty) {
            if (!$.rule.zones.length) return true;
            const rs = $gameMap.regionId(sx, sy);
            const rt = $gameMap.regionId(tx, ty);
            if (rs === rt) return true;
            const zs = $.getZoneFromRegion(rs);
            const zt = $.getZoneFromRegion(rt);
            return (zs && zt) ? zs === zt : true;
        };

        /**
         * @param {Game_CharacterBase} char - Game_CharacterBase reference
         * @param {Number} sx - Starting X
         * @param {Number} sy - Starting Y
         * @param {Number} tx - Target X
         * @param {Number} ty - Target Y
         * @returns {Boolean} True iff the character should be able to jump there.
         */
        $.checkJump = function(char, sx, sy, tx, ty) {
            return char.isThrough() || ($.checkPassage(char, tx, ty) && $.checkJumpZones(sx, sy, tx, ty));
        };

        /**
         * @param {Object} contents - Aggregate data to save to file
         * @returns {Object} Save data including this plugin's data.
         */
        $.mkSave = function(contents) {
            contents[$.SAVE_PROP] = { addV: $.addV, mulH: $.mulH };
            return contents;
        };

        /**
         * Extracts this plugin's data from provided save data.
         * @param {Object} contents - Save data loaded from file
         */
        $.exSave = function(contents) {
            $._init();
            const data = contents[$.SAVE_PROP];
            if (data) [$.addV, $.mulH] = [data.addV, data.mulH];
        };

        /**
         * @param {Game_CharacterBase} char - Game_CharacterBase reference
         * @returns {Boolean} True iff this character is hoppin' around.
         */
        $.isHopMove = function(char) { return !!($.allHop || char[$.P_HOP]); };

        /**
         * Applies hop effect to qualifying characters.
         * @param {Game_CharacterBase} char - Game_CharacterBase reference
         */
        $.doHop = function(char) {
            if (!char) return;
            if (!$.isHopMove(char)) return;
            if (!char.isMovementSucceeded() && !$.rule.stayJumpy) return;
            char[$.M_JUMPTO](char.x, char.y);
        };

    // ======== Plugin Commands ======== //

        $.com = {
            /**
             * Plugin command! Sets the global jump speed.
             * @param {{"Jump Speed Multiplier":Number}} args - Plugin command arguments
             */
            setV: function(args) { $.setJumpSpeed(args['Jump Speed Multiplier']); },
            /**
             * Plugin command! Sets the global jump height.
             * @param {{"Jump Height Multiplier":Number}} args - Plugin command arguments
             */
            setH: function(args) { $.setJumpHeight(args['Jump Height Multiplier']); },
            /**
             * Plugin command! Reset jump speed to default.
             * @param {{}} [args] - [This command has no arguments]
             */
            rstV: function(args) { $.setJumpSpeed(); },
            /**
             * Plugin command! Reset jump height to default.
             * @param {{}} [args] - [This command has no arguments]
             */
            rstH: function(args) { $.setJumpHeight(); }
        };
        PluginManager.registerCommand(PLUGIN_NAME, 'Change Jump Speed',  $.com.setV);
        PluginManager.registerCommand(PLUGIN_NAME, 'Reset Jump Speed',   $.com.rstV);
        PluginManager.registerCommand(PLUGIN_NAME, 'Change Jump Height', $.com.setH);
        PluginManager.registerCommand(PLUGIN_NAME, 'Reset Jump Height',  $.com.rstH);

    // ============ Extends ============ //

        /**
         * Jumps this character to the specified tile coordinates.
         * @param {Number} x - Target X
         * @param {Number} y - Target Y
         */
        Game_CharacterBase.prototype[$.M_JUMPTO] = function(x, y) {
            const [mapW, mapH] = [$gameMap.width(), $gameMap.height()];
            let dx = x - this.x;
            if ($gameMap.isLoopHorizontal() && dx > mapW / 2) dx = mapW - dx;
            let dy = y - this.y;
            if ($gameMap.isLoopVertical() && dy > mapH / 2) dy = mapH - dy;
            this.jump(dx, dy);
        };

    // ========== Alterations ========== //

        $.alias = $.alias || {};        // This plugin's alias namespace

        // Alias! Offset jump progression rate.
        void (alias => {
            Game_CharacterBase.prototype.updateJump = function() {
                this._jumpCount -= $.getJumpSpeedAdd(this);
                if (this._jumpCount < 1) this._jumpCount = 1;
                alias.apply(this, arguments);
            };
        })($.alias.Game_CharacterBase_updateJump = Game_CharacterBase.prototype.updateJump);

        $.juadTriggers = [1, 2];        // <- jump-up-and-down triggers
        // Alias! Re-trigger touch events on landing after a (0,0) jump.
        void (alias => {
            Game_Player.prototype.updateJump = function() {
                alias.apply(this, arguments);
                if ($.juadev && this._jumpCount === 0) {
                    this.checkEventTriggerHere($.juadTriggers);
                }
            };
        })($.alias.Game_Player_updateJump = Game_Player.prototype.updateJump);

        // Alias! Multiply default jump height.
        void (alias => {
            Game_CharacterBase.prototype.jumpHeight = function() {
                return $.getJumpHeightMul(this) * alias.apply(this, arguments);
            };
        })($.alias.Game_CharacterBase_jumpHeight = Game_CharacterBase.prototype.jumpHeight);

        // Alias! Insert checks for jump validity & failed jumps.
        void (alias => {
            Game_CharacterBase.prototype.jump = function(xPlus, yPlus, ...args) {
                const tx = $.getTargetTile(this.x, xPlus, true);
                const ty = $.getTargetTile(this.y, yPlus, false);
                if ($.checkJump(this, this.x, this.y, tx, ty)) alias.apply(this, arguments);
                else {
                    if ($.rule.stayJumpy) alias.call(this, 0, 0, ...args);
                    if ($.rule.failSw) $gameSwitches.setValue($.rule.failSw, true);
                }
            };
        })($.alias.Game_CharacterBase_jump = Game_CharacterBase.prototype.jump);

        // Alias! Also sync jump speed/height of followers to player values.
        void (alias => {
            Game_Follower.prototype.update = function() {
                alias.apply(this, arguments);
                const [s, h] = [$gamePlayer[$.P_SPEED], $gamePlayer[$.P_HEIGHT]];
                if (s === undefined) delete this[$.P_SPEED];  else this[$.P_SPEED] = s;
                if (h === undefined) delete this[$.P_HEIGHT]; else this[$.P_HEIGHT] = h;
            };
        })($.alias.Game_Follower_update = Game_Follower.prototype.update);

        // Alias! Hop if appropriate.
        void (alias => {
            Game_CharacterBase.prototype.moveStraight = function(d) {
                alias.apply(this, arguments);
                $.doHop(this);
            };
        })($.alias.Game_CharacterBase_moveStraight = Game_CharacterBase.prototype.moveStraight);

        // Alias! Hop if appropriate.
        void (alias => {
            Game_CharacterBase.prototype.moveDiagonally = function() {
                alias.apply(this, arguments);
                $.doHop(this);
            };
        })($.alias.Game_CharacterBase_moveDiagonally = Game_CharacterBase.prototype.moveDiagonally);

        // Alias! Count initiated but unlaunched jumps as "moving".
        // Important to avoid glitchy two-tile moves with player-controlled hops.
        void (alias => {
            Game_CharacterBase.prototype.isMoving = function() {
                return this.isJumping() || alias.apply(this, arguments);
            };
        })($.alias.Game_CharacterBase_isMoving = Game_CharacterBase.prototype.isMoving);

        // Alias! Initialise plugin values on new game.
        void (alias => {
            DataManager.createGameObjects = function() {
                alias.apply(this, arguments);
                $._init();
            };
        })($.alias.DataManager_createGameObjects = DataManager.createGameObjects);

        void (() => { if (!$.save) return;

            // Alias! Add this plugin's data to save file.
            void (alias => {
                DataManager.makeSaveContents = function() {
                    const contents = alias.apply(this, arguments);
                    return $.mkSave(contents);
                };
            })($.alias.DataManager_makeSaveContents = DataManager.makeSaveContents);

            // Alias! Extract this plugin's data from save file.
            void (alias => {
                DataManager.extractSaveContents = function(contents) {
                    alias.apply(this, arguments);
                    $.exSave(contents);
                };
            })($.alias.DataManager_extractSaveContents = DataManager.extractSaveContents);

        })();

    })(CAE[NAMESPACE] = CAE[NAMESPACE] || {}, CAE.Utils = CAE.Utils || {});

})();