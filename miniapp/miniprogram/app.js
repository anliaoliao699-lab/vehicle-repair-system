// app.js
App({
  onLaunch() {
    console.log('App Launch');
  },
  onShow() {
    console.log('App Show');
  },
  onHide() {
    console.log('App Hide');
  },
 globalData: { heartbeatTimer: null },
  

 
  onLaunch() {
    const { get } = require('./services/request');
    this.globalData.heartbeatTimer = setInterval(async () => {
      try {
        await get('/health');
      } catch (err) {
        console.warn('心跳失败:', err);
      }
    }, 30000);  // 每30秒
  },
  
  onUnload() {
    if (this.globalData.heartbeatTimer) {
      clearInterval(this.globalData.heartbeatTimer);
    }
  }
});
