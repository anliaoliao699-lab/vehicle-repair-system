const API_CONFIG = {
  baseUrl: "http://localhost:3000",
  timeout: 30000,
}

function getToken(): string {
  const token = wx.getStorageSync("token")
  return token || ""
}

export function request(url: string, options: any = {}): Promise<any> {
  return new Promise((resolve: any, reject: any) => {
    const {
      method = "GET",
      header = {},
      data,
      timeout = API_CONFIG.timeout,
    } = options

    const fullUrl = url.startsWith("http")
      ? url
      : API_CONFIG.baseUrl + url

    const finalHeader: any = {
      "Content-Type": "application/json",
      ...header,
    }

    const token = getToken()
    if (token) {
      finalHeader["Authorization"] = "Bearer " + token
    }

    console.log("===== 完整请求信息 =====")
    console.log("URL:", fullUrl)
    console.log("Method:", method)
    console.log("Headers:", finalHeader)
    console.log("请求体 data:", JSON.stringify(data, null, 2))
    console.log("========================")

    wx.request({
      url: fullUrl,
      method: method as any,
      header: finalHeader,
      data,
      timeout,
      success: (res: any) => {
        console.log("===== 完整响应信息 =====")
        console.log("状态码:", res.statusCode)
        console.log("响应体:", JSON.stringify(res.data, null, 2))
        console.log("========================")

        if (res.statusCode === 401) {
          const response = res.data as any

          if (response.message?.includes('禁用')) {
            const error: any = new Error(response.message || "账号已被禁用")
            error.code = 403
            error.type = 'ACCOUNT_DISABLED'
            reject(error)
            return
          }

          wx.removeStorageSync("token")
          wx.removeStorageSync("user")
          wx.navigateTo({ url: "/pages/login/login" })
          reject(new Error(response.message || "登录已过期"))
          return
        }

        if (res.statusCode >= 400) {
          const response = res.data as any

          if (response.message?.includes('禁用')) {
            const error: any = new Error(response.message || "账号已被禁用")
            error.code = 403
            error.type = 'ACCOUNT_DISABLED'
            reject(error)
            return
          }

          reject(new Error(response.message || response.error || "请求失败"))
          return
        }

        const response = res.data as any

        if (response.code !== undefined) {
          if (response.code !== 0) {
            if (response.code === 403 || response.message?.includes('禁用')) {
              const error: any = new Error(response.message || "账号已被禁用")
              error.code = 403
              error.type = 'ACCOUNT_DISABLED'
              reject(error)
              return
            }

            reject(new Error(response.message || "请求失败"))
            return
          }
          resolve(response.data)
        } else {
          resolve(response)
        }
      },
      fail: (err: any) => {
        console.error("请求失败:", err)
        reject(new Error("网络请求失败: " + err.errMsg))
      },
    })
  })
}

export function get(url: string, query?: any): Promise<any> {
  let queryStr = ""
  if (query) {
    const params = Object.entries(query)
      .filter(([_, v]: any) => v !== null && v !== undefined)
      .map(([k, v]: any) => k + "=" + encodeURIComponent(String(v)))
      .join("&")
    queryStr = params ? "?" + params : ""
  }
  return request(url + queryStr, { method: "GET" })
}

export function post(url: string, data?: any): Promise<any> {
  return request(url, { method: "POST", data })
}

export function patch(url: string, data?: any): Promise<any> {
  return request(url, { method: "POST", data })
}

export function deleteRequest(url: string): Promise<any> {
  return request(url, { method: "DELETE" })
}

export function uploadFile(
  filePath: string,
  relatedType?: string,
  relatedId?: number
): Promise<any> {
  return new Promise((resolve: any, reject: any) => {
    const token = getToken()
    const header: any = {}

    if (token) {
      header["Authorization"] = "Bearer " + token
    }

    let uploadUrl = API_CONFIG.baseUrl + "/uploads"
    if (relatedType) {
      uploadUrl += "?relatedType=" + relatedType
      if (relatedId) {
        uploadUrl += "&relatedId=" + relatedId
      }
    }

    wx.uploadFile({
      url: uploadUrl,
      filePath,
      name: "file",
      header,
      success: (res: any) => {
        if (res.statusCode === 200 || res.statusCode === 201) {
          const data = JSON.parse(res.data)
          if (data.code === 0 || !data.code) {
            resolve(data.data || data)
          } else {
            reject(new Error(data.message || "上传失败"))
          }
        } else {
          reject(new Error("上传失败: " + res.statusCode))
        }
      },
      fail: (err: any) => {
        reject(new Error("文件上传失败: " + err.errMsg))
      },
    })
  })
}
