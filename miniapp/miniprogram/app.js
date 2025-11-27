// app.js
App({
  globalData: { 
    heartbeatTimer: null 
  },

  onLaunch() {
    console.log('App Launch');
    
    // ✅ 初始化云环境（必须加这一行！）
    wx.cloud.init({
      env: 'vehicle-repair-5g5oqe5gf67b75cf',
      traceUser: true
    });
    
    // 心跳检测
    const { get } = require('./services/request');
    this.globalData.heartbeatTimer = setInterval(async () => {
      try {
        await get('/health');
      } catch (err) {
        console.warn('心跳失败:', err);
      }
    }, 30000);  // 每30秒
  },
  
  onShow() {
    console.log('App Show');
  },
  
  onHide() {
    console.log('App Hide');
  },
  
  onUnload() {
    if (this.globalData.heartbeatTimer) {
      clearInterval(this.globalData.heartbeatTimer);
    }
  }
});