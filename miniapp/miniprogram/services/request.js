"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.request = request;
exports.get = get;
exports.post = post;
exports.put = put;           // 新增 put
exports.patch = patch;       // 可用作 patch
exports.deleteRequest = deleteRequest;
exports.uploadFile = uploadFile;

const API_CONFIG = {
    baseUrl: "https://vehicle-repair3-199253-5-1384604975.sh.run.tcloudbase.com",
    timeout: 30000,
};

function getToken() {
    const token = wx.getStorageSync("token");
    return token || "";
}

function request(url, options) {
    if (options === void 0) { options = {}; }
    return new Promise(function (resolve, reject) {
        const method = options.method || "GET";
        const header = options.header || {};
        const data = options.data;
        const timeout = options.timeout || API_CONFIG.timeout;
        
        const fullUrl = url.startsWith("http") ? url : API_CONFIG.baseUrl + url;
        
        const finalHeader = {
            "Content-Type": "application/json"
        };
        
        for (const key in header) {
            finalHeader[key] = header[key];
        }
        
        const token = getToken();
        if (token) {
            finalHeader["Authorization"] = "Bearer " + token;
        }
        
        console.log("请求:", { url: fullUrl, method: method, data: data });
        
        wx.request({
            url: fullUrl,
            method: method,
            header: finalHeader,
            data: data,
            timeout: timeout,
            success: function (res) {
                console.log("响应:", res.data);
                
                if (res.statusCode === 401) {
                    const response = res.data;
                    if (response.message && response.message.indexOf('禁用') !== -1) {
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
                    if (response.message && response.message.indexOf('禁用') !== -1) {
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
            fail: function (err) {
                console.error("请求失败:", err);
                reject(new Error("网络请求失败: " + err.errMsg));
            },
        });
    });
}

// GET 请求
function get(url, query) {
    let queryStr = "";
    if (query) {
        const params = [];
        for (const key in query) {
            const value = query[key];
            if (value !== null && value !== undefined) {
                params.push(key + "=" + encodeURIComponent(String(value)));
            }
        }
        queryStr = params.length > 0 ? "?" + params.join("&") : "";
    }
    return request(url + queryStr, { method: "GET" });
}

// POST 请求
function post(url, data) {
    return request(url, { method: "POST", data: data });
}

// PUT 请求（用于更新工单）
function put(url, data) {
    return request(url, { method: "PUT", data: data });
}


// PATCH 请求
function patch(url, data) {
    return request(url, { method: "PATCH", data: data });
}

// DELETE 请求
function deleteRequest(url) {
    return request(url, { method: "DELETE" });
}

// 上传文件
function uploadFile(filePath, relatedType, relatedId) {
    return new Promise(function (resolve, reject) {
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
        if (typeof filePath !== 'string') {
            reject(new Error(`filePath 必须是字符串`));
            return;
        }
        
        wx.uploadFile({
            url: uploadUrl,
            filePath: filePath,
            name: "file",
            header: header,
            success: function (res) {
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
            fail: function (err) {
                reject(new Error("文件上传失败: " + err.errMsg));
            },
        });
    });
}
