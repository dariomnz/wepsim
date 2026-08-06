// Centralized registration of all WepSIM custom elements
// No more module-level side effects — call registerWebComponents() during bootstrap

import { register_uielto } from './wepsim_uielto.js';

import { ws_about } from './wepsim_uielto_about.js';
import { ws_bin_asm } from './wepsim_uielto_bin_asm.js';
import { ws_bin_mc } from './wepsim_uielto_bin_mc.js';
import { ws_cachememory } from './wepsim_uielto_cache.js';
import { ws_cache_config } from './wepsim_uielto_cache_config.js';
import { ws_compilationbar } from './wepsim_uielto_compilationbar.js';
import { ws_config } from './wepsim_uielto_index_config.js';
import { ws_console } from './wepsim_uielto_console.js';
import { ws_cpu } from './wepsim_uielto_cpu.js';
import { ws_cpucu_got } from './wepsim_uipacker_cpu_cu.js';
import { ws_cpusvg } from './wepsim_uielto_cpusvg.js';
import { ws_ctoasm } from './wepsim_uipacker_cto_asm.js';
import { ws_dbg_mc } from './wepsim_uielto_dbg_mc.js';
import { ws_dbg_mp } from './wepsim_uielto_dbg_asm.js';
import { ws_ddown_info } from './wepsim_uipacker_ddown_info.js';
import { ws_ddown_sel } from './wepsim_uipacker_ddown_sel.js';
import { ws_edit_as } from './wepsim_uielto_editas.js';
import { ws_edit_mc } from './wepsim_uielto_editmc.js';
import { ws_executionbar } from './wepsim_uielto_executionbar.js';
import { ws_examples } from './wepsim_uielto_index_examples.js';
import { ws_flash_asm } from './wepsim_uielto_flash_asm.js';
import { ws_flash_fpga } from './wepsim_uielto_flash_fpga.js';
import { ws_help } from './wepsim_uielto_index_help.js';
import { ws_help_hweltos } from './wepsim_uielto_help_hweltos.js';
import { ws_help_swset } from './wepsim_uielto_help_swset.js';
import { ws_hw } from './wepsim_uielto_hw.js';
import { ws_io_config } from './wepsim_uielto_timer_config.js';
import { ws_io_info } from './wepsim_uielto_timer_info.js';
import { ws_l3d } from './wepsim_uielto_l3d.js';
import { ws_ledm } from './wepsim_uielto_ldm.js';
import { ws_list_cfg } from './wepsim_uielto_listcfg.js';
import { ws_list_example } from './wepsim_uielto_listexample.js';
import { ws_list_processor } from './wepsim_uielto_listprocessor.js';
import { ws_load_file } from './wepsim_uielto_loadfile.js';
import { ws_load_link } from './wepsim_uielto_loadlink.js';
import { ws_mainmemory } from './wepsim_uielto_mem.js';
import { ws_mem_config } from './wepsim_uielto_mem_config.js';
import { ws_notifications } from './wepsim_uielto_notifications.js';
import { ws_recordbar } from './wepsim_uielto_recordbar.js';
import { ws_registers } from './wepsim_uielto_registers.js';
import { ws_save_file } from './wepsim_uielto_savefile.js';
import { ws_save_files } from './wepsim_uielto_savefiles.js';
import { ws_save_files_option } from './wepsim_uielto_savefiles.js';
import { ws_segments } from './wepsim_uielto_segments.js';
import { ws_share_link } from './wepsim_uielto_sharelink.js';
import { ws_simmicasm } from './wepsim_uipacker_sim_mic_asm.js';
import { ws_slider_cpucu } from './wepsim_uielto_slider_cpucu.js';
import { ws_slider_details } from './wepsim_uielto_slider_details.js';
import { ws_sound } from './wepsim_uielto_sound.js';
import { ws_states } from './wepsim_uielto_states.js';
import { ws_toolbar } from './wepsim_uielto_toolbar.js';
import { ws_topbar } from './wepsim_uielto_topbar.js';
import { ws_uiscreen_classic } from './wepsim_uiscreen_classic.js';
import { ws_uiscreen_compact } from './wepsim_uiscreen_compact.js';
import { ws_web_main } from './wepsim_uiscreen_main.js';

var WSL_COMPONENTS = [
    // main (root)
    ['ws-web-main', ws_web_main],
    // main: top bar
    ['ws-topbar', ws_topbar],
    // main: screens
    ['ws-screen-classic', ws_uiscreen_classic],
    ['ws-screen-compact', ws_uiscreen_compact],
    // screen: common toolbars
    ['ws-toolbar', ws_toolbar],
    ['ws-slider-cpucu', ws_slider_cpucu],
    ['ws-slider-details', ws_slider_details],
    // screen: left panel (classic) -> processor / assembly debugger
    ['ws-ctoasm', ws_ctoasm],
    ['ws-cpucu_got', ws_cpucu_got],
    ['ws-hw', ws_hw],
    ['ws-cpusvg', ws_cpusvg],
    ['ws-dbg-mp', ws_dbg_mp],
    // screen: left panel (compact) -> simulator / microcode / assembly
    ['ws-simmicasm', ws_simmicasm],
    ['ws-executionbar', ws_executionbar],
    ['ws-ddown-sel', ws_ddown_sel],
    // screen: right panel -> details (ws-ddown-info)
    ['ws-ddown-info', ws_ddown_info],
    ['ws-registers', ws_registers],
    ['ws-mainmemory', ws_mainmemory],
    ['ws-dbg-mc', ws_dbg_mc],
    ['ws-console', ws_console],
    ['ws-io-info', ws_io_info],
    ['ws-cpu', ws_cpu],
    ['ws-mem-config', ws_mem_config],
    ['ws-io-config', ws_io_config],
    ['ws-l3d', ws_l3d],
    ['ws-ledm', ws_ledm],
    ['ws-cachememory', ws_cachememory],
    ['ws-cache-config', ws_cache_config],
    ['ws-sound', ws_sound],
    // screen: editors (microcode/assembly)
    ['ws-edit-mc', ws_edit_mc],
    ['ws-edit-as', ws_edit_as],
    ['ws-compilationbar', ws_compilationbar],
    // main: record bar
    ['ws-recordbar', ws_recordbar],
    // dialogs
    ['ws-about', ws_about],
    ['ws-notifications', ws_notifications],
    ['ws-examples', ws_examples],
    ['ws-config', ws_config],
    ['ws-help', ws_help],
    ['ws-help-hweltos', ws_help_hweltos],
    ['ws-help-swset', ws_help_swset],
    ['ws-states', ws_states],
    ['ws-save-file', ws_save_file],
    ['ws-load-file', ws_load_file],
    ['ws-save-files', ws_save_files],
    ['ws-save-files-option', ws_save_files_option],
    ['ws-share-link', ws_share_link],
    ['ws-load-link', ws_load_link],
    ['ws-flash-asm', ws_flash_asm],
    ['ws-flash-fpga', ws_flash_fpga],
    ['ws-bin-asm', ws_bin_asm],
    ['ws-bin-mc', ws_bin_mc],
    ['ws-list-cfg', ws_list_cfg],
    ['ws-list-example', ws_list_example],
    ['ws-list-processor', ws_list_processor],
    ['ws-segments', ws_segments],
];

export const WSL_COMPONENTS_LENGTH = WSL_COMPONENTS.length;

export async function wepsim_web_register_components(on_each)
{
    for (let i = 0; i < WSL_COMPONENTS.length; i++)
    {
        const pair = WSL_COMPONENTS[i];
        register_uielto(pair[0], pair[1]);
        if (on_each) await on_each(i, WSL_COMPONENTS.length);
    }
}
