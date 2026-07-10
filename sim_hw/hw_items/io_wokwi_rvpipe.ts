/*
 *  Copyright 2015-2026 The WepSIM team (see docs/WEPSIM-TEAM.md)
 *
 *  This file is part of WepSIM.
 *
 *  WepSIM is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU Lesser General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  WepSIM is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU Lesser General Public License for more details.
 *
 *  You should have received a copy of the GNU Lesser General Public License
 *  along with WepSIM.  If not, see <http://www.gnu.org/licenses/>.
 *
 */


/*
 *  WOKWI External Devices (rvpipe style)
 *
 *  8 configurable component slots:
 *    - LEDs (output): write to addr_out sets value (0/1)
 *    - Buttons (input): read from addr_in returns value (0/1)
 *    - 7-segment display (output): write value (0-15) to display hex digit
 *    - Buzzer (output): write 1 = on, 0 = off
 *    - Switch (input): read from addr_in returns value (0/1)
 *    - DIP Switch (input): read 8-bit value
 *
 *  Default addresses (configurable via UI):
 *    Slot 0: LED 0      out=0x1300
 *    Slot 1: LED 1      out=0x1304
 *    Slot 2: Button 0   in=0x1310
 *    Slot 3: Button 1   in=0x1314
 *    Slot 4: 7-Segment  out=0x1320
 *    Slot 5: Buzzer     out=0x1324
 *    Slot 6: Switch     in=0x1328
 *    Slot 7: DIP Switch in=0x132C
 */

const WOKWI_NUM_SLOTS = 8;

const WOKWI_DEFAULT_CFG: Array<{
    type: string;
    name: string;
    addr_out: number;
    addr_in: number;
    default_value: number;
}> = [
        { type: "led", name: "LED 0", addr_out: 0x1300, addr_in: -1, default_value: 0 },
        { type: "led", name: "LED 1", addr_out: 0x1304, addr_in: -1, default_value: 0 },
        { type: "button", name: "Button 0", addr_out: -1, addr_in: 0x1310, default_value: 0 },
        { type: "button", name: "Button 1", addr_out: -1, addr_in: 0x1314, default_value: 0 },
        { type: "seg7", name: "7-Segment", addr_out: 0x1320, addr_in: -1, default_value: 0 },
        { type: "buzzer", name: "Buzzer", addr_out: 0x1324, addr_in: -1, default_value: 0 },
        { type: "switch", name: "Switch", addr_out: -1, addr_in: 0x1328, default_value: 0 },
        { type: "dipswitch", name: "DIP Switch", addr_out: -1, addr_in: 0x132C, default_value: 0 },
    ];

function io_wokwi_rvpipe_register(sim_p: Simulator): Simulator {
    const DEBUG = false;
    sim_p.components["WOKWI"] = {
        name: "WOKWI",
        version: "1",
        abilities: ["WOKWI"],

        details_name: ["WOKWI"],
        details_fire: [[]],

        write_state: function (vec: any): any {
            if (typeof vec["WOKWI"] == "undefined") {
                vec["WOKWI"] = {};
            }
            var data = sim_p.internal_states.wokwi_data;
            for (var i = 0; i < data.config.length; i++) {
                var c = data.config[i];
                var v = c.value.value;
                if (v != c.default_value) {
                    vec["WOKWI"]["C" + i] = {
                        "type": "wokwi",
                        "default_value": c.default_value,
                        "id": "C" + i,
                        "op": "==",
                        "value": v
                    };
                }
            }
            return vec;
        },
        read_state: function (vec: any, check: any): boolean {
            if (typeof vec["WOKWI"] == "undefined") {
                vec["WOKWI"] = {};
            }
            if ("WOKWI" == check.type.toUpperCase().trim()) {
                vec["WOKWI"][check.id] = {
                    "type": "wokwi",
                    "default_value": 0,
                    "id": check.id,
                    "op": check.condition,
                    "value": check.value
                };
                return true;
            }
            return false;
        },
        get_state: function (line: string): string | null {
            var data = sim_p.internal_states.wokwi_data;
            var index = parseInt(line.replace("C", ""));
            if (typeof data.config[index] != "undefined")
                return String(data.config[index].value.value);
            return null;
        },

        get_value: function (elto: any): string {
            var data = sim_p.internal_states.wokwi_data;
            return String(data.config[0].value.value);
        },
        set_value: function (elto: any, value: string): string {
            var data = sim_p.internal_states.wokwi_data;
            for (var i = 0; i < data.config.length; i++) {
                (sim_p.states["WOKWI_" + i] as SimState).value = data.config[i].value.value;
            }
            return value;
        }
    };

    /* Internal state - wokwi component data */
    var wokwi_data: any = {
        config: []
    };
    for (var i = 0; i < WOKWI_DEFAULT_CFG.length; i++) {
        wokwi_data.config.push({
            type: WOKWI_DEFAULT_CFG[i].type,
            name: WOKWI_DEFAULT_CFG[i].name,
            addr_out: WOKWI_DEFAULT_CFG[i].addr_out,
            addr_in: WOKWI_DEFAULT_CFG[i].addr_in,
            value: { value: WOKWI_DEFAULT_CFG[i].default_value },
            default_value: WOKWI_DEFAULT_CFG[i].default_value
        });
    }
    sim_p.internal_states.wokwi_data = wokwi_data;

    /* States - IO parameters */
    for (var i = 0; i < WOKWI_NUM_SLOTS; i++) {
        var c = wokwi_data.config[i];
        if (c.addr_out >= 0) {
            sim_p.internal_states.io_hash[c.addr_out] = "WOKWI_" + i;
        }
        if (c.addr_in >= 0) {
            sim_p.internal_states.io_hash[c.addr_in] = "WOKWI_" + i;
        }
    }

    /* States */
    for (var i = 0; i < WOKWI_NUM_SLOTS; i++) {
        sim_p.states["WOKWI_" + i] = {
            name: "WOKWI_" + i,
            verbal: wokwi_data.config[i].name,
            visible: false,
            nbits: "32",
            value: wokwi_data.config[i].default_value,
            default_value: wokwi_data.config[i].default_value,
            draw_data: []
        };
    }

    /* Behaviors */

    /* WOKWI_IOR: I/O Read - read from Wokwi input components */
    sim_p.behaviors["WOKWI_IOR"] = {
        nparameters: 4,
        types: ["E", "E", "E"],
        operation: function (s_expr: string[]): void {
            var bus_ab = get_value(sim_p.states[s_expr[1]]);
            var data = sim_p.internal_states.wokwi_data;
            if (DEBUG) console.log("[WOKWI_IOR] bus_ab=0x" + bus_ab.toString(16));
            for (var i = 0; i < data.config.length; i++) {
                var c = data.config[i];
                if (c.addr_in >= 0 && bus_ab == c.addr_in) {
                    set_value(sim_p.states[s_expr[2]], get_var(c.value) >>> 0);
                    if (DEBUG) console.log("[WOKWI_IOR] read " + c.name + " = " + get_var(c.value));
                    return;
                }
            }
        },
        verbal: function (s_expr: string[]): string {
            var bus_ab = get_value(sim_p.states[s_expr[1]]);
            var data = sim_p.internal_states.wokwi_data;
            for (var i = 0; i < data.config.length; i++) {
                var c = data.config[i];
                if (c.addr_in >= 0 && bus_ab == c.addr_in) {
                    return "Read from Wokwi " + c.name + ": " + get_var(c.value) + ". ";
                }
            }
            return "Read from Wokwi device. ";
        }
    };

    /* WOKWI_IOW: I/O Write - write to Wokwi output components */
    sim_p.behaviors["WOKWI_IOW"] = {
        nparameters: 4,
        types: ["E", "E", "E"],
        operation: function (s_expr: string[]): void {
            var bus_ab = get_value(sim_p.states[s_expr[1]]);
            var bus_db = get_value(sim_p.states[s_expr[2]]);
            var data = sim_p.internal_states.wokwi_data;
            if (DEBUG) console.log("[WOKWI_IOW] bus_ab=0x" + bus_ab.toString(16) + " bus_db=" + bus_db);
            for (var i = 0; i < data.config.length; i++) {
                var c = data.config[i];
                if (c.addr_out >= 0 && bus_ab == c.addr_out) {
                    set_var(c.value, bus_db >>> 0);
                    set_value(sim_p.states["WOKWI_" + i], bus_db >>> 0);
                    if (DEBUG) console.log("[WOKWI_IOW] write " + c.name + " = " + get_var(c.value));
                    return;
                }
            }
        },
        verbal: function (s_expr: string[]): string {
            var bus_ab = get_value(sim_p.states[s_expr[1]]);
            var data = sim_p.internal_states.wokwi_data;
            for (var i = 0; i < data.config.length; i++) {
                var c = data.config[i];
                if (c.addr_out >= 0 && bus_ab == c.addr_out) {
                    return "Write to Wokwi " + c.name + ": " + get_var(c.value) + ". ";
                }
            }
            return "Write to Wokwi device. ";
        }
    };

    /* WOKWI_SYNC: sync state from UI back to simulator */
    sim_p.behaviors["WOKWI_SYNC"] = {
        nparameters: 1,
        operation: function (): void {
            var data = sim_p.internal_states.wokwi_data;
            if (DEBUG) console.log("[WOKWI_SYNC] sync all");
            for (var i = 0; i < data.config.length; i++) {
                set_value(sim_p.states["WOKWI_" + i], get_var(data.config[i].value) >>> 0);
                if (DEBUG) console.log("[WOKWI_SYNC] slot " + i + " = " + get_var(data.config[i].value));
            }
        },
        verbal: function (): string {
            return "Sync Wokwi components. ";
        }
    };

    /* WOKWI_RESET: reset all components */
    sim_p.behaviors["WOKWI_RESET"] = {
        nparameters: 1,
        operation: function (): void {
            if (DEBUG) console.log("[WOKWI_RESET] reset");
            var data = sim_p.internal_states.wokwi_data;
            for (var i = 0; i < data.config.length; i++) {
                var dv = data.config[i].default_value;
                set_var(data.config[i].value, dv);
                set_value(sim_p.states["WOKWI_" + i], dv);
            }
        },
        verbal: function (): string {
            return "Reset all Wokwi components. ";
        }
    };

    /* Element */
    sim_p.elements["wokwi"] = {
        name: "Wokwi",
        description: "Wokwi External Devices",
        type: "subcomponent",
        belongs: "WOKWI",
        states: {},
        signals: {},
        states_inputs: [],
        states_outputs: [],
        signals_inputs: [],
        signals_output: [],
        states_mapping: []
    };

    return sim_p;
}
