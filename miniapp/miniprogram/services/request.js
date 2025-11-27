"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.request = request;
exports.get = get;
exports.post = post;
exports.put = put;
exports.patch = patch;
exports.deleteRequest = deleteRequest;
exports.uploadFile = uploadFile;

// ✅ 云托管配置
const API_CONFIG = {
    envId: "vehicle-repair-5g5oqe5gf67b75cf",
    serviceName: "vehicle-repair3",
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
        
        const finalHeader = {
            "X-WX-SERVICE": API_CONFIG.serviceName,
            "Content-Type": "application/json"
        };
        
        for (const key in header) {
            finalHeader[key] = header[key];
        }
        
        const token = getToken();
        if (token) {
            finalHeader["Authorization"] = "Bearer " + token;
        }
        
        console.log("请求:", { path: url, method: method, data: data });
        
        wx.cloud.callContainer({
            config: {
                env: API_CONFIG.envId
            },
            path: url,
            method: method,
            header: finalHeader,
            data: data,
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
                reject(new Error("网络请求失败: " + (err.errMsg || err.message || "未知错误")));
            },
        });
    });
}

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

function post(url, data) {
    return request(url, { method: "POST", data: data });
}

function put(url, data) {
    return request(url, { method: "PUT", data: data });
}

function patch(url, data) {
    return request(url, { method: "PATCH", data: data });
}

function deleteRequest(url) {
    return request(url, { method: "DELETE" });
}

/**
 * ✅ 云托管版本的 uploadFile 函数
 * 使用微信云存储上传，然后保存记录到后端数据库
 */
function uploadFile(filePath, relatedType, relatedId) {
    return new Promise(function (resolve, reject) {
        if (typeof filePath !== 'string') {
            reject(new Error("filePath 必须是字符串，当前类型: " + typeof filePath));
            return;
        }
        
        if (!filePath.trim()) {
            reject(new Error('filePath 不能为空'));
            return;
        }

        console.log('📤 开始上传文件:', {
            filePath: filePath,
            relatedType: relatedType,
            relatedId: relatedId
        });

        // 生成唯一的云存储路径
        const timestamp = Date.now();
        const randomStr = Math.random().toString(36).substring(2, 8);
        const extension = filePath.split('.').pop() || 'jpg';
        const cloudPath = "uploads/" + timestamp + "_" + randomStr + "." + extension;

        // 第一步：上传到微信云存储
        wx.cloud.uploadFile({
            cloudPath: cloudPath,
            filePath: filePath,
            success: function (uploadRes) {
                console.log('☁️ 云存储上传成功:', uploadRes.fileID);
                
                // 第二步：获取临时访问链接
                wx.cloud.getTempFileURL({
                    fileList: [uploadRes.fileID],
                    success: function (urlRes) {
                        if (urlRes.fileList && urlRes.fileList[0] && urlRes.fileList[0].tempFileURL) {
                            const fileUrl = urlRes.fileList[0].tempFileURL;
                            console.log('🔗 获取临时链接成功:', fileUrl);
                            
                            // ✅ 第三步：调用后端保存图片记录到数据库
                            const token = getToken();
                            const header = {
                                "X-WX-SERVICE": API_CONFIG.serviceName,
                                "Content-Type": "application/json"
                            };
                            if (token) {
                                header["Authorization"] = "Bearer " + token;
                            }

                            wx.cloud.callContainer({
                                config: {
                                    env: API_CONFIG.envId
                                },
                                path: "/uploads/cloud",
                                method: "POST",
                                header: header,
                                data: {
                                    fileID: uploadRes.fileID,
                                    url: fileUrl,
                                    cloudPath: cloudPath,
                                    relatedType: relatedType || null,
                                    relatedId: relatedId || null
                                },
                                success: function (res) {
                                    console.log('✅ 后端保存图片记录成功:', res.data);
                                    if (res.statusCode === 200 || res.statusCode === 201) {
                                        const data = res.data;
                                        resolve(data.data || data);
                                    } else {
                                        // 即使后端保存失败，也返回云存储的 URL
                                        console.warn('⚠️ 后端保存失败，使用云存储URL');
                                        resolve({
                                            url: fileUrl,
                                            fileID: uploadRes.fileID,
                                            cloudPath: cloudPath
                                        });
                                    }
                                },
                                fail: function (err) {
                                    // 即使通知后端失败，也返回云存储的 URL
                                    console.warn('⚠️ 通知后端失败，使用云存储URL:', err);
                                    resolve({
                                        url: fileUrl,
                                        fileID: uploadRes.fileID,
                                        cloudPath: cloudPath
                                    });
                                }
                            });
                        } else {
                            reject(new Error("获取文件临时链接失败"));
                        }
                    },
                    fail: function (err) {
                        console.error('❌ 获取临时链接失败:', err);
                        reject(new Error("获取文件链接失败: " + (err.errMsg || "未知错误")));
                    }
                });
            },
            fail: function (err) {
                console.error('❌ 云存储上传失败:', err);
                reject(new Error("文件上传失败: " + (err.errMsg || err.message || "未知错误")));
            }
        });
    });
}