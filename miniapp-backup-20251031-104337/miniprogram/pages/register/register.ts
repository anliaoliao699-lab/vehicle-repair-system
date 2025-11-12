import { register, saveLoginInfo } from "../../services/auth"

Page({
  data: {
    name: "",
    phone: "",
    password: "",
    confirmPassword: "",
    loading: false,
    showPassword: false,
  },

  onNameInput(e: any) {
    this.setData({ name: e.detail.value })
  },

  onPhoneInput(e: any) {
    this.setData({ phone: e.detail.value })
  },

  onPasswordInput(e: any) {
    this.setData({ password: e.detail.value })
  },

  onConfirmPasswordInput(e: any) {
    this.setData({ confirmPassword: e.detail.value })
  },

  togglePasswordVisibility() {
    this.setData({ showPassword: !this.data.showPassword })
  },

  async handleRegister() {
    const { name, phone, password, confirmPassword } = this.data

    // 校验
    if (!name || !phone || !password || !confirmPassword) {
      wx.showToast({
        title: "请填写所有字段",
        icon: "error",
        duration: 2000,
      })
      return
    }

    if (phone.length !== 11 || !/^1[3-9]\d{9}$/.test(phone)) {
      wx.showToast({
        title: "请输入正确的手机号",
        icon: "error",
        duration: 2000,
      })
      return
    }

    if (password.length < 6) {
      wx.showToast({
        title: "密码至少6位",
        icon: "error",
        duration: 2000,
      })
      return
    }

    if (password !== confirmPassword) {
      wx.showToast({
        title: "两次密码不一致",
        icon: "error",
        duration: 2000,
      })
      return
    }

    this.setData({ loading: true })

    try {
      const res = await register({
        name,
        phone,
        password,
        role: "customer",
      })

      wx.showToast({
        title: "注册成功",
        icon: "success",
        duration: 1500,
      })

      setTimeout(() => {
        wx.redirectTo({
          url: "/pages/login/login",
        })
      }, 1500)
    } catch (err: any) {
      wx.showToast({
        title: err.message || "注册失败",
        icon: "error",
        duration: 2000,
      })
    } finally {
      this.setData({ loading: false })
    }
  },

  navigateToLogin() {
    wx.navigateTo({
      url: "/pages/login/login",
    })
  },
})