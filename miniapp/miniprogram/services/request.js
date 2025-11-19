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

/**
 * ✅ 修复后的 uploadFile 函数
 * 
 * 功能：上传文件到服务器
 * 
 * 参数说明：
 * @param {string} filePath - 文件路径（必填，来自 wx.chooseImage 或其他文件选择）
 * @param {string} relatedType - 关联类型（可选，如 'work_order'）
 * @param {number} relatedId - 关联ID（可选，如工单ID）
 * 
 * 调用示例：
 * ✅ 正确：await uploadFile(img.path, 'work_order', orderId)
 * ❌ 错误（旧方式）：await uploadFile({ filePath: img.path, url: '...', name: '...' })
 * 
 * 返回值：Promise，解析为 { url: '...', ... } 或完整的响应数据
 */
function uploadFile(filePath, relatedType, relatedId) {
    return new Promise(function (resolve, reject) {
        // ✅ 参数验证：确保 filePath 是字符串
        if (typeof filePath !== 'string') {
            reject(new Error(`filePath 必须是字符串，当前类型: ${typeof filePath}`));
            return;
        }
        
        if (!filePath.trim()) {
            reject(new Error('filePath 不能为空'));
            return;
        }
        
        const token = getToken();
        const header = {};
        
        if (token) {
            header["Authorization"] = "Bearer " + token;
        }
        
        // ✅ 构建完整的上传 URL（支持关联类型和ID）
        let uploadUrl = API_CONFIG.baseUrl + "/uploads";
        if (relatedType) {
            uploadUrl += "?relatedType=" + encodeURIComponent(relatedType);
            if (relatedId) {
                uploadUrl += "&relatedId=" + encodeURIComponent(String(relatedId));
            }
        }
        
        console.log('📤 开始上传文件:', {
            filePath: filePath,
            relatedType: relatedType,
            relatedId: relatedId,
            uploadUrl: uploadUrl
        });
        
        wx.uploadFile({
            url: uploadUrl,
            filePath: filePath,
            name: "file",
            header: header,
            success: function (res) {
                console.log('📥 上传响应状态码:', res.statusCode);
                console.log('📥 上传响应数据:', res.data);
                
                if (res.statusCode === 200 || res.statusCode === 201) {
                    try {
                        const data = JSON.parse(res.data);
                        console.log('✅ 上传成功，解析后数据:', data);
                        
                        // ✅ 支持两种响应格式
                        if (data.code === 0 || data.code === undefined) {
                            // 格式1：{ code: 0, data: { url: '...', ... } }
                            // 格式2：{ url: '...', ... } 或其他直接返回数据
                            resolve(data.data || data);
                        } else {
                            reject(new Error(data.message || "上传失败"));
                        }
                    } catch (parseErr) {
                        console.error('❌ JSON 解析失败:', parseErr);
                        reject(new Error("上传响应解析失败: " + parseErr.message));
                    }
                } else {
                    reject(new Error("上传失败，状态码: " + res.statusCode + "，响应: " + res.data));
                }
            },
            fail: function (err) {
                console.error('❌ 上传请求失败:', err);
                reject(new Error("文件上传失败: " + (err.errMsg || err.message || "未知错误")));
            },
        });
    });
}