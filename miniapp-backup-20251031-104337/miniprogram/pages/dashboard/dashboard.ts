import { getLocalUser, clearLoginInfo } from "../../services/auth"

Page({
  data: {
    user: {
      name: "用户",
      role: "admin",
    },
    recentOrders: [],
    stats: {
      totalOrders: 0,
      pendingOrders: 0,
      completedOrders: 0,
    },
  },

  onLoad() {
    console.log("Dashboard onLoad")
    this.loadUserInfo()
    this.loadDashboardData()
  },

  onShow() {
    console.log("Dashboard onShow")
  },

  loadUserInfo() {
    const user = getLocalUser()
    console.log("用户信息:", user)

    if (user) {
      this.setData({ user })
    }
  },

  loadDashboardData() {
    this.setData({
      recentOrders: [],
      stats: {
        totalOrders: 12,
        pendingOrders: 3,
        completedOrders: 8,
      },
    })
  },

  navigateToOrders() {
    wx.navigateTo({
      url: "/pages/work-order/list",
    })
  },

  navigateToVehicles() {
    wx.showToast({
      title: "功能开发中",
      icon: "none",
    })
  },

  navigateToCreateOrder() {
    wx.showToast({
      title: "功能开发中",
      icon: "none",
    })
  },

  navigateToProfile() {
    wx.showToast({
      title: "功能开发中",
      icon: "none",
    })
  },

  viewOrderDetail(e) {
    wx.showToast({
      title: "功能开发中",
      icon: "none",
    })
  },

  handleLogout() {
    wx.showModal({
      title: "确认退出",
      content: "确定要退出登录吗？",
      success: (res) => {
        if (res.confirm) {
          clearLoginInfo()
          wx.redirectTo({
            url: "/pages/login/login",
          })
        }
      },
    })
  },
})