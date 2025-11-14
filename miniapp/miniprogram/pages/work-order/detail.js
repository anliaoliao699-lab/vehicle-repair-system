"use strict";
const { get, post } = require("../../services/request");

Page({
  data: {
    orderId: 0,
    workOrder: {},
    workItems: [],
    images: [],
    assignedWorkers: [],
    userRole: '',
    userId: 0,
    canEdit: false,
    canComplete: false,     // ✅ 是否可以完成工单(worker)
    showConfirm: false,
    showCompleteConfirm: false,  // ✅ 完成工单确认弹窗
    totalCost: 0,
    totalCostFixed: '0.00'
  },

  onLoad(options) {
    if (!options.id) {
      wx.showToast({ title: '参数错误', icon: 'error' });
      wx.navigateBack();
      return;
    }

    const orderId = parseInt(options.id);
    this.setData({ orderId });

    // 获取用户信息
    const userStr = wx.getStorageSync('user');
    const user = userStr ? JSON.parse(userStr) : {};
    const userRole = user.role || '';
    const userId = user.id || wx.getStorageSync('userId') || 0;

    this.setData({
      userRole,
      userId,
      canEdit: userRole === 'admin'
    });

    this.loadOrderDetail();
    this.loadWorkItems();
    this.loadOrderImages();
    this.loadAssignedWorkers();
  },

  onShow() {
    if (this.data.orderId) {
      this.loadOrderDetail();
      this.loadWorkItems();
      this.loadOrderImages();
      this.loadAssignedWorkers();
    }
  },

  async loadOrderDetail() {
    try {
      const res = await get("/work-orders/" + this.data.orderId);
      console.log('工单详情:', res);

      const fmt = (t) => {
        if (!t) return '';
        const d = new Date(t);
        return `${d.getFullYear()}-${(d.getMonth()+1)
          .toString().padStart(2, '0')}-${d.getDate()
          .toString().padStart(2, '0')} ${d.getHours()
          .toString().padStart(2, '0')}:${d.getMinutes()
          .toString().padStart(2, '0')}`;
      };

      res.createdAt = fmt(res.createdAt);
      res.updatedAt = fmt(res.updatedAt);
      
      const actualCost = parseFloat(res.actualCost) || 0;
      const estimatedCost = parseFloat(res.estimatedCost) || 0;
      
      res.estimatedCost = estimatedCost;
      res.actualCost = actualCost;
      res.cost = actualCost > 0 ? actualCost : estimatedCost;

      // ✅ 判断当前用户是否可以完成工单
      // 条件: 是worker 且 工单状态是 assigned 或 in_progress
      const canComplete = this.data.userRole === 'worker' && 
                         (res.status === 'assigned' || res.status === 'in_progress');

      this.setData({ 
        workOrder: res,
        canComplete
      });
      
      this.calculateTotalCost();
    } catch (err) {
      console.error('加载工单详情失败:', err);
      wx.showToast({ title: '加载失败', icon: 'error' });
    }
  },

  async loadAssignedWorkers() {
    try {
      const res = await get(`/work-orders/${this.data.orderId}/workers`);
      const workers = Array.isArray(res) ? res : (res.workers || res.data || []);
      
      const formattedWorkers = workers.map(worker => ({
        id: worker.id,
        username: worker.username || worker.name || `员工${worker.id}`,
        role: worker.role,
        phone: worker.phone || '',
        workerRole: worker.workerRole || worker.worker_role || '',
        assignedAt: worker.assignedAt || worker.assigned_at
      }));
      
      this.setData({ assignedWorkers: formattedWorkers });
      console.log('详情页-已分配员工:', formattedWorkers);
    } catch (err) {
      console.error('加载已分配员工失败:', err);
      this.setData({ assignedWorkers: [] });
    }
  },

  async loadWorkItems() {
    try {
      const res = await get(`/work-orders/${this.data.orderId}/items`);
      
      let workItems = [];
      if (Array.isArray(res)) {
        workItems = res;
      } else if (res.items && Array.isArray(res.items)) {
        workItems = res.items;
      } else if (res.data && Array.isArray(res.data)) {
        workItems = res.data;
      }

      workItems = workItems.map(item => ({
        id: item.id,
        itemName: item.item_name || item.itemName || '',
        description: item.description || '',
        price: parseFloat(item.price) || 0,
        status: item.status || 'pending',
        createdAt: item.created_at || item.createdAt || ''
      }));

      this.setData({ workItems });
      this.calculateTotalCost();
    } catch (err) {
      console.error('加载工作项失败:', err);
    }
  },

  calculateTotalCost() {
    const { workItems } = this.data;
    const totalCost = workItems.reduce((sum, item) => sum + (parseFloat(item.price) || 0), 0);
    
    this.setData({ 
      totalCost: totalCost,
      totalCostFixed: totalCost.toFixed(2)
    });
  },

  async loadOrderImages() {
    try {
      const res = await get("/uploads", {
        relatedType: 'work_order',
        relatedId: this.data.orderId
      });
      
      const images = Array.isArray(res) ? res : (res.items || res.data || []);
      
      const processedImages = images.map(i => ({
        id: i.id,
        url: i.url,
      }));
      
      this.setData({ images: processedImages });
    } catch (err) {
      console.error('加载图片失败:', err);
      this.setData({ images: [] });
    }
  },

  previewImage(e) {
    wx.previewImage({
      urls: this.data.images.map(i => i.url),
      current: e.currentTarget.dataset.url
    });
  },

  // ========== 管理员编辑 ==========
  
  showEditConfirm() {
    this.setData({ showConfirm: true });
  },

  cancelConfirm() {
    this.setData({ showConfirm: false });
  },

  confirmEdit() {
    this.setData({ showConfirm: false });
    wx.navigateTo({
      url: `/pages/work-order/edit?id=${this.data.orderId}`
    });
  },

  // ========== ✅ 员工完成工单 ==========
  
  /**
   * 显示完成工单确认弹窗
   */
  showCompleteConfirm() {
    this.setData({ showCompleteConfirm: true });
  },

  /**
   * 取消完成工单
   */
  cancelComplete() {
    this.setData({ showCompleteConfirm: false });
  },

  /**
   * 确认完成工单
   */
  async confirmComplete() {
    this.setData({ showCompleteConfirm: false });
    wx.showLoading({ title: '提交中...' });

    try {
      // 调用完成工单接口
      await post(`/work-orders/${this.data.orderId}/complete`, {});
      
      wx.hideLoading();
      wx.showToast({
        title: '工单已完成',
        icon: 'success',
        duration: 2000
      });

      // 延迟一下再刷新,确保后端状态已更新
      setTimeout(() => {
        this.loadOrderDetail();
      }, 500);

    } catch (err) {
      wx.hideLoading();
      console.error('完成工单失败:', err);
      wx.showToast({
        title: err.message || '操作失败',
        icon: 'error',
        duration: 2000
      });
    }
  },

  // ========== 辅助方法 ==========

  getStatusColor(status) {
    const map = {
      new: '#0066ff',
      assigned: '#ff9500',
      in_progress: '#ff6b6b',
      completed: '#07c160',
      accepted: '#13c2c2',
      paid: '#9254de',
      closed: '#999'
    };
    return map[status] || '#999';
  },

  getStatusText(status) {
    const map = {
      new: '新建',
      assigned: '已分配',
      in_progress: '进行中',
      completed: '已完成',
      accepted: '已接受',
      paid: '已支付',
      closed: '已关闭'
    };
    return map[status] || '未知状态';
  },

  getItemStatusColor(status) {
    const map = {
      pending: '#ffc069',
      in_progress: '#ff6b6b',
      completed: '#07c160'
    };
    return map[status] || '#999';
  },

  getItemStatusText(status) {
    const map = {
      pending: '待处理',
      in_progress: '进行中',
      completed: '已完成'
    };
    return map[status] || '未知';
  }
});