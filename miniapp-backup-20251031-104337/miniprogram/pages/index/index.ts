const app = getApp()

Component({
  data: {
    motto: 'Hello World',
    userInfo: {
      avatarUrl: '',
      nickName: '',
    },
    hasUserInfo: false,
    canIUseGetUserProfile: wx.canIUse('getUserProfile'),
    canIUseNicknameComp: wx.canIUse('input.type.nickname'),
  },
  methods: {
    bindViewTap() {
      wx.navigateTo({
        url: '../logs/logs',
      })
    },
    onChooseAvatar(e) {
      const { avatarUrl } = e.detail
      const { userInfo } = this.data
      userInfo.avatarUrl = avatarUrl
      this.setData({
        userInfo,
      })
    },
    onInputChange(e) {
      const { value } = e.detail
      const { userInfo } = this.data
      userInfo.nickName = value
      this.setData({
        userInfo,
      })
    },
    getUserProfile() {
      wx.getUserProfile({
        desc: '展示用户信息',
        success: (res) => {
          console.log(res)
          const { userInfo } = res
          this.setData({
            userInfo,
            hasUserInfo: true,
          })
        },
      })
    },
  },
})
