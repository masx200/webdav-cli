"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRandomString = void 0;
function getRandomString(length) {
    return [...Array(Math.ceil(length / 8))]
        .map(() => Math.random().toString(36).slice(-8))
        .join("")
        .slice(-length);
}
exports.getRandomString = getRandomString;
