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
 *  Reactive primitive
 *
 *  - reads are allocation-free (no wrapper object is built per access)
 *  - writes are dirty-checked and notified asynchronously (coalesced in a
 *    microtask at the end of the current synchronous turn)
 *  - subscriptions are keyed so re-binding replaces instead of accumulates
 */

export function is_reactive (obj)
{
    return (obj !== null && typeof obj === 'object' && obj.__is_reactive === true) ;
}

class ReactiveStore
{
    constructor (initial_value)
    {
        this.__is_reactive = true ;
        this._value        = initial_value ;
        this._listeners    = new Map() ;
    }

    get value ()
    {
        return this._value ;
    }

    set value (v)
    {
        if (this._value !== v)
        {
            this._value = v ; this.notify() ;
        }
    }

    notify ()
    {
        batch_pending.add(this) ;
        schedule_flush() ;
    }

    /*
     *  Listeners are keyed by the DOM selector (or an explicit key): calling
     *  subscribe() again with the same key replaces the previous listener
     *  instead of stacking it, so re-rendering the same view never leaks
     *  stale listeners.
     */
    subscribe (fn, key)
    {
        this._listeners.set(key, fn) ;
    }
}

/*
 *  Writes notify asynchronously: every dirty store is collected and flushed
 *  once, in a microtask at the end of the current synchronous turn. This
 *  coalesces the many writes of a simulation step into a single DOM update
 *  per store.
 */
var batch_pending = new Set() ;
var scheduled     = false ;

function schedule_flush ()
{
    if (scheduled)
    {
        return ;
    }

    scheduled = true ;
    queueMicrotask(flush) ;
}

function flush ()
{
    scheduled = false ;

    var stores = [...batch_pending] ;
    batch_pending.clear() ;

    for (const store of stores)
    {
        store._listeners.forEach(function (fn, key)
        {
            try
            {
                fn() ;
            }
            // keep the remaining listeners running
            catch (err)
            {
                console.trace(err);
            }
        }) ;
    }
}

/*
 *  Wrap a value or sim object so its .value forwards to a reactive store
 *
 *  - primitives/plain values become a bare reactive store
 *  - sim objects (states/signals) keep their identity but reading/writing
 *    .value hits the store, so no is_reactive() branch is needed in
 *    get_value()/set_value()
 *  - re-invoking on an already wrapped object returns the existing store
 */
export function reactive_wrap (element)
{
    // plain value
    if (element === null || typeof element !== 'object')
    {
        return new ReactiveStore(element) ;
    }

    // already reactive: either the element is a store itself
    // or we already wrapped it (__store holds the store)
    var store = is_reactive(element) ? element : element.__store ;
    if (store)
    {
        return store ;
    }

    var wrapped_store = new ReactiveStore(element.value) ;

    Object.defineProperty(element, '__store', {
        value:        wrapped_store,
        writable:     true,
        configurable: true,
    }) ;

    Object.defineProperty(element, 'value', {
        get: function ()
        {
            return wrapped_store.value ;
        },
        set: function (v)
        {
            if (v !== wrapped_store)
            {
                wrapped_store.value = v ;
            }
        },
        enumerable:   true,
        configurable: true,
    }) ;

    return wrapped_store ;
}

/*
 *  Get/Set value
 */

export function get_value (sim_obj)
{
    return sim_obj.value ;
}

export function set_value (sim_obj, value)
{
    if (sim_obj.value != value)
    {
        sim_obj.value   = value ;
        sim_obj.changed = true ;
    }
}

export function reset_value (sim_obj)
{
    // reset object value (e.g.: REG_MICROINS)
    if (typeof sim_obj.default_value == 'object')
    {
        sim_obj.changed = true ;
        sim_obj.value   = Object.create(sim_obj.default_value) ;
        return ;
    }

    // reset array (e.g.: BR)
    if (sim_obj instanceof Array)
    {
        sim_obj.changed = true ;
        for (var i = 0; i < sim_obj.length; i++)
        {
            set_value(sim_obj[i], sim_obj[i].default_value) ;
        }
        return ;
    }

    // reset value
    set_value(sim_obj, sim_obj.default_value) ;
}

export function update_value (sim_obj)
{
    // forceUpdate value with reactive store
    if (sim_obj.__store)
    {
        sim_obj.__store.notify() ;
        return ;
    }

    // forceUpdate value
    sim_obj.changed = true ;
}

/*
 *  Get/Set variable
 */

export function get_var (sim_var)
{
    return sim_var.value ;
}

export function set_var (sim_var, value)
{
    sim_var.value = value ;
}

/*
 *  value toString
 */

export function value_toString (elto_v)
{
    if (typeof elto_v == 'undefined')
    {
        return '-' ;
    }

    if (is_reactive(elto_v))
    {
        elto_v = elto_v.value ;
    }

    if (typeof elto_v == 'object')
    {
        return 'object' ;
    }

    if (typeof elto_v != 'number')
    {
        return String(elto_v) ;
    }

    elto_v = '0x' + (elto_v >>> 0).toString(16) ;
    return elto_v ;
}

/*
 *  DOM binding helpers
 *
 *  Each binding registers with the DOM selector as key, so re-rendering the
 *  same view replaces the previous listener instead of stacking a new one.
 */

function reactive_bind_el (store, selector, key, f_update)
{
    var el = typeof selector === 'string' ? document.querySelector(selector) : selector ;
    if (!el) return null ;

    var update = function ()
    {
        f_update(el, store.value) ;
    } ;

    store.subscribe(update, key) ;
    update() ;

    return el ;
}

export function reactive_bind_text (store, selector, f_computed_value)
{
    if (typeof f_computed_value === 'undefined')
    {
        f_computed_value = function (value)
        {
            return value ;
        } ;
    }

    reactive_bind_el(store, selector, 'text:' + selector, function (el, value)
    {
        el.textContent = f_computed_value(value, selector) ;
    }) ;
}

export function reactive_bind_input (store, selector)
{
    var el = reactive_bind_el(store, selector, 'input:' + selector, function (el, value)
    {
        el.value = value ;
    }) ;

    if (el)
    {
        el.addEventListener('change', function ()
        {
            store.value = el.value ;
        }) ;
    }
}

export function reactive_bind_class (store, selector, f_class)
{
    reactive_bind_el(store, selector, 'class:' + selector, function (el, value)
    {
        var cls = f_class(value) ;
        if (typeof cls === 'string')
        {
            el.className = cls ;
        }
        else if (typeof cls === 'object')
        {
            for (var c in cls)
            {
                if (cls[c]) el.classList.add(c) ;
                else el.classList.remove(c) ;
            }
        }
    }) ;
}
