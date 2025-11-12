"use strict";
const { get, post, put, uploadFile, deleteRequest } = require("../../services/request");
Page({
  data: {
    orderId: 0,
    workOrder: {},
    workItems: [],
    newWorkItem: {
      itemName: '',
      description: '',
      price: ''
    },
    images: [],
    showConfirm: false,
    showWorkItemForm: false,
    editingItemId: null,
    totalCost: 0,
    userRole: '',
    // ✅ 派工相关的数据字段
    assignedWorkers: [],             // 已分配的员工列表
    availableWorkers: [],            // 可用员工列表
    showAssignModal: false,          // 派工弹窗显示状态
    selectedWorkers: {},             // 选中的员工 {workerId: true/false}
    selectedRoles: {},               // 选中员工的工种 {workerId: '钣金'}
    assignLoading: false,            // 派工加载状态
    selectedWorkerCount: 0,          // 已选择的员工数量
    roleOptions: ['钣金', '喷漆', '其他']  // ✅ 工种选项
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
    this.setData({ userRole: user.role || '' });

    this.loadOrderDetail();
    this.loadWorkItems();
    this.loadOrderImages();
    this.initAssignFeature();  // 初始化派工功能
  },

  /**
   * 加载工单详情
   */
  async loadOrderDetail() {
    wx.showLoading({ title: '加载中...' });
    try {
      const res = await get(`/work-orders/${this.data.orderId}`);
      console.log('工单详情:', res);
      
      const workOrder = {
        vehicleInfo: res.vehicleInfo || res.vehicle_info || '',
        description: res.description || '',
        estimatedCost: parseFloat(res.estimatedCost || res.estimated_cost || 0),
        actualCost: parseFloat(res.actualCost || res.actual_cost || 0),
        status: res.status || ''
      };
      
      this.setData({ workOrder });
      wx.hideLoading();
    } catch (err) {
      wx.hideLoading();
      console.error('加载工单详情失败:', err);
      wx.showToast({ title: "加载失败", icon: "error" });
      setTimeout(() => wx.navigateBack(), 1500);
    }
  },

  /**
   * 加载维修项目列表
   */
  async loadWorkItems() {
    try {
      const res = await get(`/work-items/work-orders/${this.data.orderId}/items`);
      
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
        status: item.status || 'pending'
      }));

      this.setData({ workItems });
      this.calculateTotalCost();
    } catch (err) {
      console.error('加载维修项目失败:', err);
    }
  },

  /**
   * 计算总费用
   */
  calculateTotalCost() {
    const total = this.data.workItems.reduce((sum, item) => sum + item.price, 0);
    this.setData({ totalCost: total });
  },

  /**
   * 加载工单图片
   */
  async loadOrderImages() {
    try {
      const res = await get(`/work-orders/${this.data.orderId}/images`);

      let images = [];
      if (Array.isArray(res)) {
        images = res;
      } else if (res.images && Array.isArray(res.images)) {
        images = res.images;
      } else if (res.data && Array.isArray(res.data)) {
        images = res.data;
      } else if (res.items && Array.isArray(res.items)) {
        images = res.items;
      }

      console.log('加载到的图片:', images);
      this.setData({ images });
    } catch (err) {
      console.error('加载图片失败:', err);
    }
  },


  /**
   * 输入事件处理
   */
  onInput(e) {
    const field = e.currentTarget.dataset.field;
    const value = e.detail.value;
    this.setData({
      [`workOrder.${field}`]: value
    });
  },

  /**
   * 显示保存确认
   */
  showSaveConfirm() {
    this.setData({ showConfirm: true });
  },

  /**
   * 取消确认
   */
  cancelConfirm() {
    this.setData({ showConfirm: false });
  },

  /**
   * 确认保存
   */
  async confirmSave() {
    const { workOrder } = this.data;

    if (!workOrder.vehicleInfo || !workOrder.vehicleInfo.trim()) {
      wx.showToast({ title: '请填写车辆信息', icon: 'none' });
      this.cancelConfirm();
      return;
    }

    wx.showLoading({ title: '保存中...' });

    try {
      const updateData = {
        vehicleInfo: workOrder.vehicleInfo,
        description: workOrder.description || '',
        estimatedCost: workOrder.estimatedCost || 0,
        actualCost: workOrder.actualCost || 0
      };

      await put(`/work-orders/${this.data.orderId}`, updateData);
      
      wx.hideLoading();
      wx.showToast({
        title: '保存成功',
        icon: 'success',
        duration: 1500
      });
      
      this.cancelConfirm();
      
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    } catch (err) {
      wx.hideLoading();
      console.error('保存失败:', err);
      wx.showToast({
        title: '保存失败',
        icon: 'error'
      });
    }
  },

  /**
   * 取消编辑
   */
  cancelEdit() {
    wx.showModal({
      title: '确认取消',
      content: '确定要放弃修改吗？',
      success: (res) => {
        if (res.confirm) {
          wx.navigateBack();
        }
      }
    });
  },

  /**
   * 显示维修项目表单
   */
  showWorkItemForm() {
    this.setData({
      showWorkItemForm: true,
      newWorkItem: {
        itemName: '',
        description: '',
        price: ''
      }
    });
  },

  /**
   * 关闭维修项目表单
   */
  closeWorkItemForm() {
    this.setData({ showWorkItemForm: false });
  },

  /**
   * 维修项目输入
   */
  onWorkItemInput(e) {
    const field = e.currentTarget.dataset.field;
    const value = e.detail.value;
    this.setData({
      [`newWorkItem.${field}`]: value
    });
  },

  /**
   * 添加维修项目
   */
  async addWorkItem() {
    const { newWorkItem, orderId } = this.data;

    if (!newWorkItem.itemName || !newWorkItem.itemName.trim()) {
      wx.showToast({ title: '请输入项目名称', icon: 'none' });
      return;
    }

    if (!newWorkItem.price || isNaN(newWorkItem.price) || parseFloat(newWorkItem.price) <= 0) {
      wx.showToast({ title: '请输入有效金额', icon: 'none' });
      return;
    }

    wx.showLoading({ title: '添加中...' });

    try {
      const data = {
        workOrderId: orderId,
        itemName: newWorkItem.itemName.trim(),
        description: newWorkItem.description.trim(),
        price: parseFloat(newWorkItem.price)
      };

      await post('/work-items', data);
      
      wx.hideLoading();
      wx.showToast({ title: '添加成功', icon: 'success' });
      
      this.closeWorkItemForm();
      this.loadWorkItems();
    } catch (err) {
      wx.hideLoading();
      console.error('添加项目失败:', err);
      wx.showToast({ title: '添加失败', icon: 'error' });
    }
  },

  /**
   * 删除维修项目
   */
  async deleteWorkItem(e) {
    const id = e.currentTarget.dataset.id;

    wx.showModal({
      title: '确认删除',
      content: '确定要删除这个维修项目吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            await deleteRequest(`/work-items/${id}`);
            wx.showToast({ title: '删除成功', icon: 'success' });
            this.loadWorkItems();
          } catch (err) {
            console.error('删除失败:', err);
            wx.showToast({ title: '删除失败', icon: 'error' });
          }
        }
      }
    });
  },

  /**
   * 选择图片
   */
  chooseImage() {
    const maxCount = 9 - this.data.images.length;
    
    wx.chooseMedia({
      count: maxCount,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        this.uploadImages(res.tempFiles);
      }
    });
  },

async uploadImages(files) {
  if (!files || files.length === 0) return;

  wx.showLoading({ title: '上传中...', mask: true });

  try {
    const { orderId } = this.data;

    // ✅ 使用 Promise.all 一次性并发上传
    await Promise.all(
      files.map(file =>
        uploadFile(file.tempFilePath, 'work_order', orderId)
      )
    );

    wx.showToast({ title: '上传成功', icon: 'success' });

    // ✅ 确保刷新最新图片（可加 loading 避免闪烁）
    wx.showLoading({ title: '刷新图片中...' });
    await this.loadOrderImages();
    wx.hideLoading();

  } catch (err) {
    console.error('上传失败:', err);
    wx.showToast({ title: '上传失败', icon: 'error' });
    wx.hideLoading();
  }
},


  /**
   * 预览图片
   */
  previewImage(e) {
    const url = e.currentTarget.dataset.url;
    const urls = this.data.images.map(img => img.url);

    wx.previewImage({
      current: url,
      urls: urls
    });
  },

  /**
   * 删除图片
   */
  async deleteImage(e) {
    const id = e.currentTarget.dataset.id;

    wx.showModal({
      title: '确认删除',
      content: '确定要删除这张图片吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            await deleteRequest(`/uploads/${id}`);
            wx.showToast({ title: '删除成功', icon: 'success' });
            this.loadOrderImages();
          } catch (err) {
            console.error('删除图片失败:', err);
            wx.showToast({ title: '删除失败', icon: 'error' });
          }
        }
      }
    });
  },

  doNothing() {
    // 阻止事件冒泡
  },

  // ==================== 派工功能 ====================

  /**
   * 初始化派工功能
   */
  initAssignFeature() {
    if (this.data.userRole === 'admin') {
      this.loadAssignedWorkers();
    }
  },

  /**
   * 加载已分配的员工
   */
  async loadAssignedWorkers() {
    try {
      const res = await get(`/work-orders/${this.data.orderId}/workers`);

      const workers = Array.isArray(res) ? res : (res.workers || res.data || []);
      
      // ✅ 格式化已分配员工数据
      const formattedWorkers = workers.map(worker => ({
        id: worker.id,
        username: worker.username || worker.name || `员工${worker.id}`,
        role: worker.role,
        phone: worker.phone || '',
        workerRole: worker.workerRole || '',
        assignedAt: worker.assignedAt
      }));
      
      this.setData({ assignedWorkers: formattedWorkers });
      console.log('已分配员工:', formattedWorkers);
    } catch (err) {
      console.error('加载已分配员工失败:', err);
      this.setData({ assignedWorkers: [] });
    }
  },

  /**
   * 加载可用员工列表
   */
  async loadAvailableWorkers() {
    try {
      const res = await get(`/users/available-workers`);
      const workers = Array.isArray(res) ? res : (res.workers || res.data || []);
      
      // ✅ 格式化员工数据,确保有 username
      const formattedWorkers = workers.map(worker => ({
        id: worker.id,
        username: worker.username || worker.name || `员工${worker.id}`,
        role: worker.role,
        phone: worker.phone || '',
        shopId: worker.shopId
      }));
      
      this.setData({ availableWorkers: formattedWorkers });
      console.log('可用员工:', formattedWorkers);
    } catch (err) {
      console.error('加载员工列表失败:', err);
      this.setData({ availableWorkers: [] });
    }
  },

  /**
   * 打开派工弹窗
   */
  openAssignModal() {
    this.loadAvailableWorkers();
    
    this.setData({
      showAssignModal: true,
      selectedWorkers: {},
      selectedRoles: {},
      selectedWorkerCount: 0
    });
  },

  /**
   * 关闭派工弹窗
   */
  closeAssignModal() {
    this.setData({
      showAssignModal: false,
      selectedWorkers: {},
      selectedRoles: {},
      selectedWorkerCount: 0
    });
  },

  /**
   * 选择/取消选择员工
   */
  toggleWorker(e) {
    const workerId = parseInt(e.currentTarget.dataset.id);
    const selectedWorkers = { ...this.data.selectedWorkers };
    const currentSelected = selectedWorkers[workerId] || false;

    selectedWorkers[workerId] = !currentSelected;

    // 如果取消选择，清除工种
    if (!selectedWorkers[workerId]) {
      const selectedRoles = { ...this.data.selectedRoles };
      delete selectedRoles[workerId];
      this.setData({ selectedRoles });
    }

    // 计算选中的员工数量
    const selectedWorkerCount = Object.keys(selectedWorkers).filter(id => selectedWorkers[id]).length;

    this.setData({ 
      selectedWorkers,
      selectedWorkerCount
    });
    console.log('更新后的选择:', selectedWorkers, '数量:', selectedWorkerCount);
  },

  /**
   * ✅ 选择工种
   */
  selectRole(e) {
    const workerId = parseInt(e.currentTarget.dataset.workerId);
    const roleIndex = parseInt(e.detail.value);
    const role = this.data.roleOptions[roleIndex];

    const selectedWorkers = { ...this.data.selectedWorkers };
    const selectedRoles = { ...this.data.selectedRoles };

    // 必须先选中员工
    if (!selectedWorkers[workerId]) {
      selectedWorkers[workerId] = true;
    }

    selectedRoles[workerId] = role;

    // 计算选中的员工数量
    const selectedWorkerCount = Object.keys(selectedWorkers).filter(id => selectedWorkers[id]).length;

    this.setData({ 
      selectedWorkers, 
      selectedRoles,
      selectedWorkerCount
    });
    console.log(`员工 ${workerId} 选择工种:`, role);
  },

  /**
   * ✅ 确认派工 - 使用新接口
   */
  async confirmAssign() {
    const { selectedWorkers, selectedRoles } = this.data;

    // 验证至少选择一个员工
    const selectedIds = Object.keys(selectedWorkers)
      .filter(id => selectedWorkers[id])
      .map(id => parseInt(id));

    if (selectedIds.length === 0) {
      wx.showToast({ title: '请至少选择一个员工', icon: 'none' });
      return;
    }

    // 检查是否都选择了工种
    const workersWithoutRole = selectedIds.filter(id => !selectedRoles[id]);
    if (workersWithoutRole.length > 0) {
      wx.showToast({ title: '请为所有员工选择工种', icon: 'none' });
      return;
    }

    // ✅ 使用新的数据格式
    const workerIds = selectedIds;
    const roles = {};
    selectedIds.forEach(workerId => {
      roles[workerId] = selectedRoles[workerId] || '其他';
    });

    console.log('准备派工:', { workerIds, roles });
    
    // 调用新的派工接口
    await this.assignWorkersNew(workerIds, roles);
  },

  /**
   * ✅ 新的派工接口
   */
  async assignWorkersNew(workerIds, roles) {
    const API_BASE_URL = 'http://localhost:3000';
    const token = wx.getStorageSync('token');

    if (!this.data.orderId) {
      wx.showToast({ title: '工单ID缺失', icon: 'error' });
      return;
    }

    this.setData({ assignLoading: true });

    try {
      const res = await new Promise((resolve, reject) => {
        wx.request({
          url: `${API_BASE_URL}/work-orders/${this.data.orderId}/workers`,
          method: 'POST',
          header: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          data: { workerIds, roles },
          success: (res) => {
            if (res.statusCode === 200 || res.statusCode === 201) {
              resolve(res.data);
            } else {
              reject(new Error(res.data?.message || '派工失败'));
            }
          },
          fail: reject
        });
      });

      console.log('派工成功:', res);
      
      wx.showToast({
        title: '派工成功',
        icon: 'success',
        duration: 1500
      });
      
      this.closeAssignModal();
      this.loadAssignedWorkers();
      
    } catch (error) {
      console.error('派工失败:', error);
      wx.showToast({
        title: error.message || '派工失败',
        icon: 'none',
        duration: 2000
      });
    } finally {
      this.setData({ assignLoading: false });
    }
  },

  /**
   * 移除派工员工
   */
  async removeWorker(e) {
    const workerId = e.currentTarget.dataset.id;

    wx.showModal({
      title: '确认移除',
      content: '确定要移除该员工吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            const API_BASE_URL = 'http://localhost:3000';
            const token = wx.getStorageSync('token');

            await new Promise((resolve, reject) => {
              wx.request({
                url: `${API_BASE_URL}/work-orders/${this.data.orderId}/workers/${workerId}`,
                method: 'DELETE',
                header: {
                  Authorization: `Bearer ${token}`
                },
                success: (res) => {
                  if (res.statusCode === 200) {
                    resolve(res.data);
                  } else {
                    reject(new Error('移除失败'));
                  }
                },
                fail: reject
              });
            });

            wx.showToast({ title: '移除成功', icon: 'success' });
            this.loadAssignedWorkers();
          } catch (err) {
            console.error('移除员工失败:', err);
            wx.showToast({ title: '移除失败', icon: 'error' });
          }
        }
      }
    });
  },

  /**
   * 获取员工状态颜色
   */
  getWorkerStatusColor(status) {
    const colors = {
      'assigned': '#FF9500',
      'in_progress': '#007AFF',
      'completed': '#34C759'
    };
    return colors[status] || '#999';
  },

  /**
   * 获取员工状态文本
   */
  getWorkerStatusText(status) {
    const texts = {
      'assigned': '已分配',
      'in_progress': '进行中',
      'completed': '已完成'
    };
    return texts[status] || '未知';
  }
});