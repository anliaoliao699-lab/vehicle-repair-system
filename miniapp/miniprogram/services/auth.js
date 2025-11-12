"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = login;
exports.register = register;
exports.wxLogin = wxLogin;
exports.getCurrentUser = getCurrentUser;
exports.saveLoginInfo = saveLoginInfo;
exports.clearLoginInfo = clearLoginInfo;
exports.getLocalUser = getLocalUser;
exports.isLoggedIn = isLoggedIn;
const request_1 = require("./request");
async function login(phone, password) {
    return (0, request_1.post)("/auth/login", {
        username: phone,
        password,
        type: "phone"
    });
}
async function register(data) {
    return (0, request_1.post)("/auth/register", data);
}
async function wxLogin(code) {
    return (0, request_1.post)("/auth/wx-login", { code });
}
async function getCurrentUser() {
    return (0, request_1.get)("/auth/me");
}
function saveLoginInfo(token, user) {
    wx.setStorageSync("token", token);
    wx.setStorageSync("user", JSON.stringify(user));
}
function clearLoginInfo() {
    wx.removeStorageSync("token");
    wx.removeStorageSync("user");
}
function getLocalUser() {
    const userStr = wx.getStorageSync("user");
    return userStr ? JSON.parse(userStr) : null;
}
function isLoggedIn() {
    return !!wx.getStorageSync("token");
}
