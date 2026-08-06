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
import $ from 'jquery';
import { ws_uielto } from './wepsim_uielto.js';
import { onClick } from './wepsim_web_actions.js';
import { get_cfg, cfg_show_control_memory_delay } from '../sim_core/sim_cfg.js';
import { get_simware } from '../sim_core/sim_adt_core.js';
import { get_value } from '../sim_core/sim_core_values.js';
import { simhw_internalState, simhw_sim_ctrlStates_get, simhw_sim_state } from '../sim_hw/sim_hw_index.js';
import { control_memory_lineToString, control_memory_set } from '../sim_core/sim_adt_ctrlmemory.js';
import { element_scroll_setRelative } from '../sim_core/sim_core_ui.js';
import { sim_core_breakpointicon_get } from '../wepsim_core/wepsim_dbg_breakpointicons.js';
import { simcore_record_append_new } from '../sim_core/sim_core_record.js';
import { wepsim_execute_toggle_microbreakpoint } from '../wepsim_core/wepsim_execute.js';
import { wepsim_notify_do_notify } from '../wepsim_core/wepsim_notify.js';

/*
         *  DBG-MC
         */
/* jshint esversion: 6 */
export class ws_dbg_mc extends ws_uielto
{
    constructor ()
    {
        // parent
        super();
    }

    render (event_name)
    {
        // html holder
        var o1 = "<div id='memory_MC' " +
            "     style='height:60vh; width:inherit; overflow-y:scroll; -webkit-overflow-scrolling:touch;'>" +
            '</div>' ;

        this.innerHTML = o1 ;
    }
}

//
//  Breakpoints and show_dbg_mpc
//

export function dbg_set_breakpoint(addr)
{
    // toggle
    var hexaddr  = '0x' + parseInt(addr).toString(16) ;
    var bp_state = wepsim_execute_toggle_microbreakpoint(hexaddr) ;

    // toggle UI
    dbg_set_breakpoint_ui(addr, bp_state) ;

    // notify if dbg_level...
    var dbg_level = get_cfg('DBG_level') ;
    if (bp_state && ('instruction' === dbg_level))
    {
        wepsim_notify_do_notify('<strong>INFO</strong>',
                                'Please remember to change configuration to execute at microinstruction level.',
                                'success',
                                get_cfg('NOTIF_delay')) ;
    }

    // add if recording
    simcore_record_append_new('Set firmware breakpoint at ' + addr,
                              'dbg_set_breakpoint(' + addr + ');\n') ;
}

export function dbg_set_breakpoint_ui(addr, bp_state)
{
    var o1_content = '&nbsp;' ;
    if (false == bp_state)
    {
        var icon_theme = get_cfg('ICON_theme') ;
        o1_content     = sim_core_breakpointicon_get(icon_theme) ;
    }

    var o1       = document.getElementById('mcpin' + addr) ;
    o1.innerHTML = o1_content ;
}

export function wepsim_show_dbg_mpc()
{
    var maddr_name = simhw_sim_ctrlStates_get().mpc.state ;
    var reg_maddr  = get_value(simhw_sim_state(maddr_name)) ;

    light_refresh_control_memory(simhw_internalState('MC'), reg_maddr) ;
}

//
//  Control Memory UI
//

export var show_control_memory_deferred = null;

export function wepsim_show_control_memory(memory, index, redraw)
{
    if (null !== show_control_memory_deferred)
    {
        return;
    }

    show_control_memory_deferred = setTimeout(function ()
    {
        if (false === redraw)
            light_refresh_control_memory(memory, index);
        else hard_refresh_control_memory(memory, index, redraw);
        show_control_memory_deferred = null;
    }, cfg_show_control_memory_delay);
}

export function hard_refresh_control_memory(memory, index, redraw)
{
    var o1      = '' ;
    var SIMWARE = get_simware() ;

    // in case of empty control memory...
    if (typeof memory[index] == 'undefined')
    {
        control_memory_set(memory, index, { value: {}, comments: [] }) ;
    }

    // build and load HTML
    for (var key in memory)
    {
        o1 += control_memory_showrow(memory, key, (key == index), SIMWARE.hash_labels_firm_rev) ;
    }

    o1 = "<center><table class='table table-hover table-sm'>" +
        "<tbody id='none'>" + o1 + '</tbody>' +
        '</table></center>' ;

    $('#memory_MC').html(o1) ;

    // scroll up/down to index element...
    if (redraw)
    {
        element_scroll_setRelative('#memory_MC', '#maddr' + index, 0) ;
    }

    // update old_mc_add for light_update
    old_mc_addr = index;
}

export var old_mc_addr = 0;

export function light_refresh_control_memory(memory, index)
{
    // if not visible -> skip
    var o1 = $('#memory_MC') ;
    if (o1.is(':visible') == false)
    {
        return ;
    }

    o1 = $('#maddr' + old_mc_addr + ' td') ;
    if (o1.is(':visible'))
    {
        // o1.css('color', 'black') ;
        o1.removeClass('text-primary').addClass('text-body-emphasis') ;
        // o1.css('font-weight', 'normal') ;
        o1.removeClass('fw-bold').addClass('fw-normal') ;
    }

    old_mc_addr = index ;

    o1 = $('#maddr' + old_mc_addr + ' td') ;
    if (o1.is(':visible'))
    {
        // o1.css('color', 'blue') ;
        o1.removeClass('text-body-emphasis').addClass('text-primary') ;
        // o1.css('font-weight', 'bold') ;
        o1.removeClass('fw-normal').addClass('fw-bold') ;
    }
}

export function control_memory_showrow(memory, key, is_current, revlabels)
{
    var o1 = '' ;

    var value = control_memory_lineToString(memory, key) ;
    var maddr = '0x' + parseInt(key).toString(16) ;
    if (typeof revlabels[key] !== 'undefined')
    {
        var htmllabel = revlabels[key] ;
        var htmlfill  = 5 - htmllabel.length ;
        if (htmlfill > 0)
        {
            for (var i = 0; i < htmlfill; i++)
            {
                htmllabel = htmllabel + '&nbsp;' ;
            }
        }

        maddr = '<span>' +
            '<span class="badge rounded-pill text-bg-info font-monospace" ' +
            '      style="position:relative;top:4px;">' + htmllabel + '</span>' +
            '<span style="border:1px solid gray;">' + maddr + '</span>' +
            '</span>' ;
    }

    // trpin + wcolor
    var trpin = '&nbsp;' ;
    if (typeof memory[key] !== 'undefined')
    {
        if (true == memory[key].breakpoint)
        {
            var icon_theme = get_cfg('ICON_theme') ;
            trpin          = sim_core_breakpointicon_get(icon_theme) ;
        }
    }

    // wcolor
    var wcolor = 'text-body-emphasis fw-normal ' ;
    if (is_current)
    {
        wcolor = 'text-primary       fw-bold ' ;
    }

    o1 += "<tr id='maddr" + key + "' class='d-flex' " +
        "    style='font-size:small;' " +
        "    data-bind='click' data-action='set-breakpoint' data-addr='" + key + "'>" +
        "<td             class='col-3 col-md-2 py-0 " + wcolor + "' align='right'>" + maddr + '</td>' +
        "<td width='1%'  class='col-auto py-0 px-0  " + wcolor + "' id='mcpin" + key + "'>" + trpin + '</td>' +
        "<td             class='col py-0            " + wcolor + "'>" + value + '</td>' +
        '</tr>' ;
    onClick('set-breakpoint', (el) =>
    {
        dbg_set_breakpoint(el.dataset.addr) ; if (el.stopPropagation) el.stopPropagation() ;
    }) ;
    // return HTML
    return o1 ;
}

