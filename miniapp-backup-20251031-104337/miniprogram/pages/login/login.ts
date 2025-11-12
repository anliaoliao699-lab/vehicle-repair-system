
import { login, wxLogin, saveLoginInfo } from '../../services/auth'

Page({
  data: {
    phone: '',
    password: '',
    loading: false,
    showPassword: false,
  },

  onLoad() {
    const token = wx.getStorageSync('token')
    if (token) {
      wx.redirectTo({
        url: '/pages/dashboard/dashboard',
      })
    }
  },

  onPhoneInput(e: any) {
    this.setData({
      phone: e.detail.value,
    })
  },

  onPasswordInput(e: any) {
    this.setData({
      password: e.detail.value,
    })
  },

  togglePasswordVisibility() {
    this.setData({
      showPassword: !this.data.showPassword,
    })
  },

  handleLogin() {
    const { phone, password } = this.data

    if (!phone || !password) {
      wx.showToast({
        title: '请输入手机号和密码',
        icon: 'error',
        duration: 2000,
      })
      return
    }

    if (phone.length !== 11 || !/^1[3-9]\d{9}$/.test(phone)) {
      wx.showToast({
        title: '请输入正确的手机号',
        icon: 'error',
        duration: 2000,
      })
      return
    }

    if (password.length < 6) {
      wx.showToast({
        title: '密码至少6位',
        icon: 'error',
        duration: 2000,
      })
      return
    }

    this.setData({ loading: true })

    login(phone, password)
      .then((res: any) => {
        console.log('登录成功:', res)
        saveLoginInfo(res.accessToken, res.user)

        wx.showToast({
          title: '登录成功',
          icon: 'success',
          duration: 1500,
        })

        setTimeout(() => {
          wx.redirectTo({
            url: '/pages/dashboard/dashboard',
          })
        }, 1500)
      })
      .catch((err: any) => {
        console.error('登录失败:', err)
        
        if (err.code === 403 || err.type === 'ACCOUNT_DISABLED') {
          wx.showModal({
            title: '账号已被禁用',
            content: err.message || '您的账号已被禁用，如有疑问请联系管理员',
            showCancel: false,
            confirmText: '知道了'
          })
        } else {
          wx.showToast({
            title: err.message || '登录失败',
            icon: 'error',
            duration: 2000,
          })
        }
      })
      .finally(() => {
        this.setData({ loading: false })
      })
  },

  handleWxLogin() {
    this.setData({ loading: true })

    wx.login({
      success: (res: any) => {
        wxLogin(res.code)
          .then((result: any) => {
            saveLoginInfo(result.accessToken, result.user)

            wx.showToast({
              title: '登录成功',
              icon: 'success',
              duration: 1500,
            })

            setTimeout(() => {
              wx.redirectTo({
                url: '/pages/dashboard/dashboard',
              })
            }, 1500)
          })
          .catch((err: any) => {
            if (err.code === 403 || err.type === 'ACCOUNT_DISABLED') {
              wx.showModal({
                title: '账号已被禁用',
                content: err.message || '您的微信关联账号已被禁用',
                showCancel: false,
                confirmText: '知道了'
              })
            } else {
              wx.showToast({
                title: err.message || '微信登录失败',
                icon: 'error',
                duration: 2000,
              })
            }
          })
          .finally(() => {
            this.setData({ loading: false })
          })
      },
      fail: () => {
        wx.showToast({
          title: '微信登录失败',
          icon: 'error',
          duration: 2000,
        })
        this.setData({ loading: false })
      },
    })
  },

  navigateToRegister() {
    wx.navigateTo({
      url: '/pages/register/register',
    })
  },

  testLogin() {
    console.log('使用测试账户登录...')
    this.setData({ loading: true })

    login('10000000001', 'hashed_pwd')
      .then((res: any) => {
        console.log('测试登录成功:', res)
        saveLoginInfo(res.accessToken, res.user)

        wx.showToast({
          title: '登录成功',
          icon: 'success',
          duration: 1500,
        })

        setTimeout(() => {
          wx.redirectTo({
            url: '/pages/dashboard/dashboard',
          })
        }, 1500)
      })
      .catch((err: any) => {
        console.error('测试登录失败:', err)
        
        if (err.code === 403 || err.type === 'ACCOUNT_DISABLED') {
          wx.showModal({
            title: '测试账号已被禁用',
            content: '当前测试账号已被禁用，请联系管理员或使用其他账号',
            showCancel: false,
            confirmText: '知道了'
          })
        } else {
          wx.showToast({
            title: err.message || '登录失败',
            icon: 'error',
            duration: 2000,
          })
        }
      })
      .finally(() => {
        this.setData({ loading: false })
      })
  },
})
