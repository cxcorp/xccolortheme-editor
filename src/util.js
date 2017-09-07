export function clamp(min, max, val) {
    return val < min
        ? min
        : (val > max ? max : val)
}

// 0.0 => 0, 0.5 => 127, 1.0 => 255
export const normalizedComponentToRgb = (c) => clamp(0, 255, Math.round(c * 255))
// 0 => 0, 127 => 7f, 255 => ff
const rgbComponentToHex = (c) => {
    const hex = c.toString(16)
    return hex.length === 1 ? `0${hex}` : hex
}

export function decimalRgbToHex(r, g, b) {
    return [r, g, b]
        .map(normalizedComponentToRgb)
        .map(rgbComponentToHex)
        .join('')
}

export function hexToDecimalRgb(hex) {
    // original by Tim Down, https://stackoverflow.com/a/5624139/996081

    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
    var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, function(m, r, g, b) {
        return r + r + g + g + b + b;
    });

    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16) / 255,
        g: parseInt(result[2], 16) / 255,
        b: parseInt(result[3], 16) / 255
    } : undefined;
}