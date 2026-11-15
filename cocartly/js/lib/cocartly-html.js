/* Context-aware output only. Stored records and IDs are never rewritten. */
(function (global) {
    'use strict';
    const fragments = new WeakMap();
    const entities = {'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;', '`':'&#96;'};
    function escape(value) {
        return String(value).replace(/[&<>"'`]/g, ch => entities[ch]);
    }
    function render(value) {
        return value && typeof value === 'object' && fragments.has(value)
            ? fragments.get(value) : escape(value);
    }
    function fragment(value) {
        const result = Object.freeze({toString() { throw new TypeError('Render Cocartly HTML explicitly'); }});
        fragments.set(result, value);
        return result;
    }
    // Only literal template markup is trusted; interpolated values are text by default.
    function html(strings, ...values) {
        let output = strings[0];
        for (let index = 0; index < values.length; index++) output += render(values[index]) + strings[index + 1];
        return fragment(output);
    }
    function concat(...values) {
        return fragment(values.map(render).join(''));
    }
    // Existing inline handlers use a single-quoted JS argument in a double-quoted
    // HTML attribute. Encode EVERY UTF-16 unit: no quote, tag or entity delimiter
    // from an ID can become handler source. The click still receives the exact ID.
    function jsString(value) {
        const text = String(value);
        let output = '';
        for (let index = 0; index < text.length; index++) output += '\\u' + text.charCodeAt(index).toString(16).padStart(4, '0');
        return output;
    }
    function replace(text, placeholder, value) {
        const source = String(text), at = source.indexOf(placeholder);
        if (at < 0) return fragment(escape(source));
        return fragment(escape(source.slice(0, at)) + render(value) + escape(source.slice(at + placeholder.length)));
    }
    global.CocartlyHTML = Object.freeze({html, render, concat, jsString, replace});
})(window);
