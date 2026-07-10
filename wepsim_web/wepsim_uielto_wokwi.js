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
         *  Wokwi External Device panel
         */

        /* jshint esversion: 6 */

        // 7-segment segment patterns: index by hex value (0-F)
        // Segment order: [A, B, C, D, E, F, G, DP]
        var WOKWI_SEG7_PATTERNS = [
            [1, 1, 1, 1, 1, 1, 0, 0], // 0
            [0, 1, 1, 0, 0, 0, 0, 0], // 1
            [1, 1, 0, 1, 1, 0, 1, 0], // 2
            [1, 1, 1, 1, 0, 0, 1, 0], // 3
            [0, 1, 1, 0, 0, 1, 1, 0], // 4
            [1, 0, 1, 1, 0, 1, 1, 0], // 5
            [1, 0, 1, 1, 1, 1, 1, 0], // 6
            [1, 1, 1, 0, 0, 0, 0, 0], // 7
            [1, 1, 1, 1, 1, 1, 1, 0], // 8
            [1, 1, 1, 1, 0, 1, 1, 0], // 9
            [1, 1, 1, 0, 1, 1, 1, 0], // A
            [0, 0, 1, 1, 1, 1, 1, 0], // b
            [1, 0, 0, 1, 1, 1, 0, 0], // C
            [0, 1, 1, 1, 1, 0, 1, 0], // d
            [1, 0, 0, 1, 1, 1, 1, 0], // E
            [1, 0, 0, 0, 1, 1, 1, 0], // F
        ];

        function wokwi_hex_to_segments(hex) {
            return WOKWI_SEG7_PATTERNS[hex & 0xF] || WOKWI_SEG7_PATTERNS[0];
        }

        function wokwi_get_value(store) {
            if (!store) return 0;
            if (typeof Vuex !== 'undefined' && store instanceof Vuex.Store) {
                return store.state.value;
            }
            return store.value;
        }

        function wokwi_set_value(store, value) {
            if (!store) return;
            if (typeof Vuex !== 'undefined' && store instanceof Vuex.Store) {
                store.commit('set_value', value);
            } else {
                store.value = value;
            }
        }

        function wokwi_subscribe(store, callback) {
            if (typeof Vuex !== 'undefined' && store instanceof Vuex.Store) {
                return store.subscribe(callback);
            }
            return function() {};
        }

        var wokwi_elementRefs = {};
        var wokwi_unsubscribeRefs = {};

        function wokwi_create_element(type, store, index) {
            var el;
            var wrapper;

            switch (type) {

                case 'led':
                    el = document.createElement('wokwi-led');
                    el.color = 'red';
                    el.value = wokwi_get_value(store) !== 0;
                    wokwi_unsubscribeRefs[index] = wokwi_subscribe(store, function(mutation, state) {
                        if (mutation.type === 'set_value') {
                            el.value = state.value !== 0;
                        }
                    });
                    el.addEventListener('click', function() {
                        var newVal = wokwi_get_value(store) ? 0 : 1;
                        wokwi_set_value(store, newVal);
                        webui_wokwi_sync();
                    });
                    return el;

                case 'button':
                    el = document.createElement('wokwi-pushbutton');
                    el.color = 'red';
                    el.pressed = wokwi_get_value(store) !== 0;
                    el.style.pointerEvents = 'none';
                    wrapper = document.createElement('div');
                    wrapper.style.cssText = 'position:relative;display:inline-block;';
                    wrapper.appendChild(el);
                    var overlay = document.createElement('div');
                    overlay.style.cssText = 'position:absolute;inset:0;cursor:pointer;z-index:1;';
                    overlay.addEventListener('click', function() {
                        var newVal = wokwi_get_value(store) ? 0 : 1;
                        wokwi_set_value(store, newVal);
                        webui_wokwi_sync();
                    });
                    wrapper.appendChild(overlay);
                    wokwi_unsubscribeRefs[index] = wokwi_subscribe(store, function(mutation, state) {
                        if (mutation.type === 'set_value') {
                            el.pressed = state.value !== 0;
                        }
                    });
                    return wrapper;

                case 'seg7':
                    el = document.createElement('wokwi-7segment');
                    el.digits = 1;
                    el.color = '#ff4444';
                    el.offColor = '#441111';
                    el.background = '#1a1a2e';
                    el.pins = 'none';
                    el.values = wokwi_hex_to_segments(wokwi_get_value(store));
                    wokwi_unsubscribeRefs[index] = wokwi_subscribe(store, function(mutation, state) {
                        if (mutation.type === 'set_value') {
                            el.values = wokwi_hex_to_segments(state.value);
                        }
                    });
                    el.addEventListener('click', function() {
                        var newVal = (wokwi_get_value(store) + 1) % 16;
                        wokwi_set_value(store, newVal);
                        webui_wokwi_sync();
                    });
                    return el;

                case 'buzzer':
                    el = document.createElement('wokwi-buzzer');
                    el.hasSignal = wokwi_get_value(store) !== 0;
                    wokwi_unsubscribeRefs[index] = wokwi_subscribe(store, function(mutation, state) {
                        if (mutation.type === 'set_value') {
                            el.hasSignal = state.value !== 0;
                        }
                    });
                    el.addEventListener('click', function() {
                        var newVal = wokwi_get_value(store) ? 0 : 1;
                        wokwi_set_value(store, newVal);
                        webui_wokwi_sync();
                    });
                    return el;

                case 'switch':
                    el = document.createElement('wokwi-slide-switch');
                    el.value = wokwi_get_value(store) !== 0 ? 1 : 0;
                    el.addEventListener('input', function() {
                        wokwi_set_value(store, el.value);
                        webui_wokwi_sync();
                    });
                    wokwi_unsubscribeRefs[index] = wokwi_subscribe(store, function(mutation, state) {
                        if (mutation.type === 'set_value') {
                            el.value = state.value !== 0 ? 1 : 0;
                        }
                    });
                    return el;

                case 'dipswitch':
                    el = document.createElement('wokwi-dip-switch-8');
                    var mask = wokwi_get_value(store);
                    var initValues = [];
                    for (var b = 0; b < 8; b++) {
                        initValues.push((mask >> b) & 1);
                    }
                    el.values = initValues;
                    el.addEventListener('switch-change', function() {
                        var newMask = 0;
                        for (var b = 0; b < 8; b++) {
                            if (el.values[b]) newMask |= (1 << b);
                        }
                        wokwi_set_value(store, newMask);
                        webui_wokwi_sync();
                    });
                    wokwi_unsubscribeRefs[index] = wokwi_subscribe(store, function(mutation, state) {
                        if (mutation.type === 'set_value') {
                            var m = state.value;
                            var newValues = [];
                            for (var b = 0; b < 8; b++) {
                                newValues.push((m >> b) & 1);
                            }
                            el.values = newValues;
                        }
                    });
                    return el;

                default:
                    return null;
            }
        }

        class ws_wokwi extends ws_uielto
        {
              constructor ()
              {
                    super();
              }

              render ( event_name )
              {
                    if (simhw_active() === null) {
                        return ;
                    }

                    var data = simhw_internalState('wokwi_data');
                    if (typeof data == "undefined") {
                        return ;
                    }

                    var o1 = '' ;

                    o1 += '<div id="config_WOKWI_' + this.name_str + '" ' +
                          'style="height:58vh;width:inherit;overflow-y:auto;">' ;

                    o1 += '<div class="container text-end mb-2">' +
                          '<span class="my-0" style="min-width:95%">' +
                          '<span data-langkey="Address Configuration">Addr Config</span>: ' +
                          '<a data-bs-toggle="collapse" href="#collapse-wokwcfg" aria-expanded="false" ' +
                          '   tabindex="0" class="m-auto" role="button">' +
                          '<strong class="fas fa-wrench text-secondary"></strong></a>' +
                          '</span>' +
                          '<table id="collapse-wokwcfg" ' +
                          '       class="table table-hover table-sm table-bordered m-0 collapse">' +
                          '<tr><th>Slot</th><th>Type</th><th>Name</th><th>Out Addr</th><th>In Addr</th></tr>' ;
                    for (var i = 0; i < data.config.length; i++) {
                        var c = data.config[i];
                        o1 += '<tr>' +
                              '<td>' + i + '</td>' +
                              '<td>' + c.type + '</td>' +
                              '<td>' + c.name + '</td>' +
                              '<td>' + (c.addr_out >= 0 ? '0x' + c.addr_out.toString(16) : '-') + '</td>' +
                              '<td>' + (c.addr_in >= 0 ? '0x' + c.addr_in.toString(16) : '-') + '</td>' +
                              '</tr>';
                    }
                    o1 += '</table></div>' ;

                    o1 += '<div class="container-fluid">' +
                          '<div class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-3">' ;

                    for (var i = 0; i < data.config.length; i++) {
                        var c = data.config[i];
                        o1 += '<div class="col">' +
                              '<div class="card h-100 border-secondary" style="background:#1a1a2e;">' +
                              '<div class="card-header text-white py-1 px-2" ' +
                              '     style="background:#16213e;font-size:0.85rem;">' +
                              '<span class="badge bg-secondary me-1">C' + i + '</span>' + c.name +
                              '</div>' +
                              '<div class="card-body text-center d-flex align-items-center ' +
                              '     justify-content-center py-2">' +
                              '<div class="wokwi-slot" id="wokwi_slot_' + i + '"></div>' +
                              '</div></div></div>';
                    }

                    o1 += '</div></div>' ;
                    o1 += '</div>' ;

                    for (var key in wokwi_unsubscribeRefs) {
                        if (typeof wokwi_unsubscribeRefs[key] === 'function') {
                            wokwi_unsubscribeRefs[key]();
                        }
                    }
                    wokwi_unsubscribeRefs = {};

                    this.innerHTML = o1 ;

                    for (var i = 0; i < data.config.length; i++) {
                        var c = data.config[i];
                        var slot = document.getElementById('wokwi_slot_' + i);
                        if (!slot) continue;
                        c.value = vue_observable_ifnotjetdone(c.value);
                        var element = wokwi_create_element(c.type, c.value, i);
                        if (element) {
                            slot.appendChild(element);
                            wokwi_elementRefs[i] = element;
                        }
                    }
              }
        }

        if (typeof window !== "undefined") {
            window.customElements.define('ws-wokwi', ws_wokwi) ;
        }


        function webui_wokwi_sync ()
        {
            compute_general_behavior('WOKWI_SYNC') ;
            return true ;
        }
