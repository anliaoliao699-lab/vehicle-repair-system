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
    canComplete: false,
    showConfirm: false,
    showCompleteConfirm: false,
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

      const createdAt = this.formatDate(res.created_at || res.createdAt);
      const updatedAt = this.formatDate(res.updated_at || res.updatedAt);
      
      // ✅ 费用处理：确保正确提取
      const actualCost = (() => {
        const ac = res.actual_cost ?? res.actualCost;
        const parsed = parseFloat(ac);
        return !isNaN(parsed) ? parsed : 0;
      })();
      
      const estimatedCost = (() => {
        const ec = res.estimated_cost ?? res.estimatedCost;
        const parsed = parseFloat(ec);
        return !isNaN(parsed) ? parsed : 0;
      })();
      
      const displayCost = actualCost > 0 ? actualCost : estimatedCost;
      
      res.createdAt = createdAt;
      res.updatedAt = updatedAt;
      res.actualCost = actualCost;
      res.estimatedCost = estimatedCost;
      res.cost = displayCost;
      
      // ✅ 车主名字直接使用 description 字段
      res.customerName = res.description || '未填写';

      console.log('💰 工单费用:', {
        actualCost: actualCost,
        estimatedCost: estimatedCost,
        displayCost: displayCost,
        customerName: res.customerName
      });

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


  formatDate(dateStr) {
    if (!dateStr) return '';
    
    try {
      let date;
      
      if (typeof dateStr === 'number') {
        date = new Date(dateStr);
      } else if (typeof dateStr === 'string') {
        date = new Date(dateStr);
        
        if (isNaN(date.getTime())) {
          const cleanStr = dateStr.replace('Z', '');
          date = new Date(cleanStr);
        }
      }
      
      if (!date || isNaN(date.getTime())) {
        return '';
      }
      
      // ✅ 修复：减少8小时（时区偏差）
      const chineseDate = new Date(date.getTime() - 8 * 60 * 60 * 1000);
      
      const year = chineseDate.getFullYear();
      const month = String(chineseDate.getMonth() + 1).padStart(2, '0');
      const day = String(chineseDate.getDate()).padStart(2, '0');
      const hours = String(chineseDate.getHours()).padStart(2, '0');
      const minutes = String(chineseDate.getMinutes()).padStart(2, '0');
      
      return `${year}-${month}-${day} ${hours}:${minutes}`;
    } catch (e) {
      console.error('日期格式化异常:', dateStr, e);
      return '';
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

  showCompleteConfirm() {
    this.setData({ showCompleteConfirm: true });
  },

  cancelComplete() {
    this.setData({ showCompleteConfirm: false });
  },

  async confirmComplete() {
    this.setData({ showCompleteConfirm: false });
    wx.showLoading({ title: '提交中...' });

    try {
      await post(`/work-orders/${this.data.orderId}/complete`, {});
      
      wx.hideLoading();
      wx.showToast({
        title: '工单已完成',
        icon: 'success',
        duration: 2000
      });

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