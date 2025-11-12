"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.request = request;
exports.get = get;
exports.post = post;
exports.patch = patch;
exports.deleteRequest = deleteRequest;
exports.uploadFile = uploadFile;
const API_CONFIG = {
    baseUrl: "http://localhost:3000",
    timeout: 30000,
};
function getToken() {
    const token = wx.getStorageSync("token");
    return token || "";
}
function request(url, options = {}) {
    return new Promise((resolve, reject) => {
        const { method = "GET", header = {}, data, timeout = API_CONFIG.timeout, } = options;
        const fullUrl = url.startsWith("http")
            ? url
            : API_CONFIG.baseUrl + url;
        const finalHeader = Object.assign({ "Content-Type": "application/json" }, header);
        const token = getToken();
        if (token) {
            finalHeader["Authorization"] = "Bearer " + token;
        }
        console.log("请求:", { url: fullUrl, method, data });
        wx.request({
            url: fullUrl,
            method: method,
            header: finalHeader,
            data,
            timeout,
            success: (res) => {
                console.log("响应:", res.data);
                if (res.statusCode === 401) {
                    const response = res.data;
                    if (response.message?.includes('禁用')) {
                        const error = new Error(response.message || "账号已被禁用");
                        error.code = 403;
                        error.type = 'ACCOUNT_DISABLED';
                        reject(error);
                        return;
                    }
                    wx.removeStorageSync("token");
                    wx.removeStorageSync("user");
                    wx.navigateTo({ url: "/pages/login/login" });
                    reject(new Error(response.message || "登录已过期"));
                    return;
                }
                if (res.statusCode >= 400) {
                    const response = res.data;
                    if (response.message?.includes('禁用')) {
                        const error = new Error(response.message || "账号已被禁用");
                        error.code = 403;
                        error.type = 'ACCOUNT_DISABLED';
                        reject(error);
                        return;
                    }
                    reject(new Error(response.message || response.error || "请求失败"));
                    return;
                }
                const response = res.data;
                if (response.code !== undefined) {
                    if (response.code !== 0) {
                        reject(new Error(response.message || "请求失败"));
                        return;
                    }
                    resolve(response.data);
                }
                else {
                    resolve(response);
                }
            },
            fail: (err) => {
                console.error("请求失败:", err);
                reject(new Error("网络请求失败: " + err.errMsg));
            },
        });
    });
}
function get(url, query) {
    let queryStr = "";
    if (query) {
        const params = Object.entries(query)
            .filter(([_, v]) => v !== null && v !== undefined)
            .map(([k, v]) => k + "=" + encodeURIComponent(String(v)))
            .join("&");
        queryStr = params ? "?" + params : "";
    }
    return request(url + queryStr, { method: "GET" });
}
function post(url, data) {
    return request(url, { method: "POST", data });
}
function patch(url, data) {
    return request(url, { method: "POST", data });
}
function deleteRequest(url) {
    return request(url, { method: "DELETE" });
}
function uploadFile(filePath, relatedType, relatedId) {
    return new Promise((resolve, reject) => {
        const token = getToken();
        const header = {};
        if (token) {
            header["Authorization"] = "Bearer " + token;
        }
        let uploadUrl = API_CONFIG.baseUrl + "/uploads";
        if (relatedType) {
            uploadUrl += "?relatedType=" + relatedType;
            if (relatedId) {
                uploadUrl += "&relatedId=" + relatedId;
            }
        }
        wx.uploadFile({
            url: uploadUrl,
            filePath,
            name: "file",
            header,
            success: (res) => {
                if (res.statusCode === 200 || res.statusCode === 201) {
                    const data = JSON.parse(res.data);
                    if (data.code === 0 || !data.code) {
                        resolve(data.data || data);
                    }
                    else {
                        reject(new Error(data.message || "上传失败"));
                    }
                }
                else {
                    reject(new Error("上传失败: " + res.statusCode));
                }
            },
            fail: (err) => {
                reject(new Error("文件上传失败: " + err.errMsg));
            },
        });
    });
}
