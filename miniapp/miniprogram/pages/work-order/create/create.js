"use strict";
const { get, post, uploadFile, deleteRequest } = require("../../../services/request");

Page({
  data: {
    // 工单信息
    workOrder: {
      vehicleId: '',
      vehicleInfo: '',
      customerName: '',
      description: '',
    },
    vehicles: [],
    
    // 维修项目
    workItems: [],
    newWorkItem: {
      itemName: '',
      description: '',
      price: ''
    },
    showWorkItemForm: false,
    
    // 图片
    images: [],
    uploadedImages: [],
    tempOrderId: 0,
    
    // UI状态
    showConfirm: false,
    loading: false,
    totalCost: 0,
    totalCostFixed: '0.00',
    descriptionLength: 0
  },

  onLoad() {
    this.setData({
      workItems: [],
      images: [],
      uploadedImages: [],
      vehicles: []
    });
    
    this.loadVehicles();
  },

  async loadVehicles() {
    try {
      const res = await get("/vehicles");
      let vehicles = [];
      
      if (Array.isArray(res)) {
        vehicles = res;
      } else if (res.items && Array.isArray(res.items)) {
        vehicles = res.items;
      } else if (res.data && Array.isArray(res.data)) {
        vehicles = res.data;
      }

      vehicles = vehicles.map(v => ({
        id: v.id,
        label: `${v.brand || ''} ${v.model || ''} (${v.plate_number || ''})`.trim(),
        vehicleInfo: `${v.brand || ''} ${v.model || ''} ${v.color || ''}`.trim()
      }));

      this.setData({ vehicles });
    } catch (err) {
      console.error('加载车辆列表失败:', err);
      this.setData({ vehicles: [] });
    }
  },

  onVehicleChange(e) {
    const index = parseInt(e.detail.value);
    if (index >= 0 && index < this.data.vehicles.length) {
      const vehicle = this.data.vehicles[index];
      this.setData({
        [`workOrder.vehicleId`]: vehicle.id,
        [`workOrder.vehicleInfo`]: vehicle.vehicleInfo
      });
    }
  },

  // ========== 工单基本信息操作 ==========

  onInput(e) {
    const field = e.currentTarget.dataset.field;
    const value = e.detail.value;
    
    this.setData({
      [`workOrder.${field}`]: value
    });

    if (field === 'description') {
      this.setData({
        descriptionLength: value.length
      });
    }
  },

  // ========== 维修项目操作 ==========

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

  closeWorkItemForm() {
    this.setData({ showWorkItemForm: false });
  },

  onWorkItemInput(e) {
    const field = e.currentTarget.dataset.field;
    const value = e.detail.value;
    this.setData({
      [`newWorkItem.${field}`]: value
    });
  },

  addWorkItem() {
    const { newWorkItem } = this.data;
    let { workItems } = this.data;
    
    if (!Array.isArray(workItems)) {
      workItems = [];
    }
    
    if (!newWorkItem.itemName.trim()) {
      wx.showToast({ title: '请输入项目名称', icon: 'none' });
      return;
    }

    if (!newWorkItem.price || parseFloat(newWorkItem.price) <= 0) {
      wx.showToast({ title: '请输入正确的金额', icon: 'none' });
      return;
    }

    const tempId = 'temp_' + Date.now();
    
    const newItem = {
      id: tempId,
      itemName: newWorkItem.itemName.trim(),
      description: newWorkItem.description.trim(),
      price: parseFloat(newWorkItem.price),
      isTemp: true
    };

    this.setData({
      workItems: [...workItems, newItem],
      showWorkItemForm: false
    });

    wx.showToast({ title: '已添加项目', icon: 'success' });
    this.calculateTotalCost();
  },

  deleteWorkItem(e) {
    const itemId = e.currentTarget.dataset.id;
    let { workItems } = this.data;
    
    if (!Array.isArray(workItems)) {
      workItems = [];
    }
    
    workItems = workItems.filter(item => item.id !== itemId);
    
    this.setData({ workItems });
    wx.showToast({ title: '已删除', icon: 'success' });
    this.calculateTotalCost();
  },

  calculateTotalCost() {
    let { workItems } = this.data;
    
    if (!Array.isArray(workItems)) {
      workItems = [];
    }
    
    const totalCost = workItems.reduce((sum, item) => sum + (parseFloat(item.price) || 0), 0);
    
    this.setData({ 
      totalCost: totalCost,
      totalCostFixed: totalCost.toFixed(2)
    });
    
    console.log('维修项目总费用:', totalCost);
  },

  // ========== 图片操作 ==========

  chooseImage() {
    wx.chooseImage({
      count: 9,
      sizeType: ['compressed'],
      success: (res) => {
        const tempFilePaths = res.tempFilePaths;
        const newImages = tempFilePaths.map((path, index) => ({
          id: 'temp_' + Date.now() + '_' + index,
          path: path,
          isTemp: true
        }));
        
        let { images } = this.data;
        if (!Array.isArray(images)) {
          images = [];
        }
        
        this.setData({
          images: [...images, ...newImages]
        });
        
        wx.showToast({ title: `已选择${tempFilePaths.length}张图片`, icon: 'success' });
      }
    });
  },

  previewImage(e) {
    const url = e.currentTarget.dataset.url;
    const isTemp = e.currentTarget.dataset.temp === 'true';
    
    let urls = [];
    if (isTemp) {
      let { images } = this.data;
      if (Array.isArray(images)) {
        urls = images.map(i => i.path);
      }
    } else {
      let { uploadedImages } = this.data;
      if (Array.isArray(uploadedImages)) {
        urls = uploadedImages.map(i => i.url);
      }
    }
    
    wx.previewImage({
      urls: urls,
      current: url
    });
  },

  deleteLocalImage(e) {
    const imageId = e.currentTarget.dataset.id;
    let { images } = this.data;
    
    if (!Array.isArray(images)) {
      images = [];
    }
    
    images = images.filter(img => img.id !== imageId);
    
    this.setData({ images });
    wx.showToast({ title: '已删除', icon: 'success' });
  },

  deleteUploadedImage(e) {
    const imageId = e.currentTarget.dataset.id;
    
    wx.showModal({
      title: '删除确认',
      content: '确定删除这张图片吗？',
      confirmColor: '#667eea',
      success: async (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '删除中...' });
          try {
            await deleteRequest(`/uploads/${imageId}`);
            wx.hideLoading();
            
            let { uploadedImages } = this.data;
            if (!Array.isArray(uploadedImages)) {
              uploadedImages = [];
            }
            uploadedImages = uploadedImages.filter(img => img.id !== imageId);
            
            this.setData({ uploadedImages });
            
            wx.showToast({ title: '已删除', icon: 'success' });
          } catch (err) {
            wx.hideLoading();
            console.error('删除失败:', err);
            wx.showToast({ title: '删除失败', icon: 'error' });
          }
        }
      }
    });
  },

  // ========== 保存工单 ==========

  showSaveConfirm() {
    console.log('当前工单数据:', this.data.workOrder);
    
    if (!this.data.workOrder.vehicleInfo || !this.data.workOrder.vehicleInfo.trim()) {
      wx.showToast({ title: '请填写车辆信息', icon: 'none' });
      return;
    }

    if (!this.data.workOrder.customerName || !this.data.workOrder.customerName.trim()) {
      wx.showToast({ title: '请填写车主名字', icon: 'none' });
      return;
    }

    let { workItems } = this.data;
    if (!Array.isArray(workItems)) {
      workItems = [];
    }

    if (workItems.length === 0) {
      wx.showModal({
        title: '提示',
        content: '该工单还没有任何维修项目，是否继续保存？',
        confirmColor: '#667eea',
        success: (res) => {
          if (res.confirm) {
            this.setData({ showConfirm: true });
          }
        }
      });
      return;
    }

    this.setData({ showConfirm: true });
  },

  cancelConfirm() {
    this.setData({ showConfirm: false });
  },

  /**
   * ✅ 确认保存工单
   * 关键点：
   * 1. 车主名字 → description 字段
   * 2. 费用 → actual_cost 和 estimated_cost 字段
   */
  async confirmSave() {
    this.setData({ showConfirm: false });
    wx.showLoading({ title: "保存中..." });
    
    try {
      // 第一步：创建工单
      const workOrderPayload = {
        vehicle_info: this.data.workOrder.vehicleInfo.trim(),
        description: this.data.workOrder.customerName.trim(),    // ✅ 车主名字存入 description
        actual_cost: this.data.totalCost,                         // ✅ 总费用存入 actual_cost
        estimated_cost: this.data.totalCost,                      // ✅ 总费用也存入 estimated_cost
      };

      console.log('📤 创建工单，发送数据:', workOrderPayload);
      const workOrderRes = await post('/work-orders', workOrderPayload);
      const orderId = workOrderRes.id || workOrderRes.orderId;

      if (!orderId) {
        throw new Error('创建工单失败：未获得工单ID');
      }

      console.log('✅ 工单创建成功，ID:', orderId);

      // 第二步：保存维修项目
      let workItems = this.data.workItems;
      if (!Array.isArray(workItems)) {
        workItems = [];
      }

      for (const item of workItems) {
        try {
          const itemPayload = {
            item_name: item.itemName,
            description: item.description,
            price: item.price,
            status: 'pending'
          };
          
          await post(`/work-orders/${orderId}/items`, itemPayload);
          console.log('✅ 维修项目保存成功:', item.itemName);
        } catch (err) {
          console.error('⚠️ 保存维修项目失败:', err);
        }
      }

      // 第三步：上传图片（可选）
      let images = this.data.images;
      if (!Array.isArray(images)) {
        images = [];
      }

      if (images.length > 0) {
        console.log('📷 开始上传', images.length, '张图片');
        
        let uploadSuccess = 0;
        let uploadFail = 0;

        for (const img of images) {
          try {
            if (typeof img.path !== 'string') {
              console.error('❌ filePath 不是字符串:', typeof img.path);
              uploadFail++;
              continue;
            }

            await uploadFile(img.path, 'work_order', orderId);
            uploadSuccess++;
          } catch (err) {
            console.error('❌ 图片上传失败:', err);
            uploadFail++;
          }
        }

        console.log(`📊 图片上传完成：成功${uploadSuccess}张，失败${uploadFail}张`);
      }

      wx.hideLoading();
      wx.showToast({ title: "创建成功", icon: "success" });
      
      setTimeout(() => {
        wx.reLaunch({
          url: '/pages/work-order/list'
        });
      }, 1000);

    } catch (err) {
      console.error('❌ 保存失败:', err);
      wx.hideLoading();
      
      const errorMsg = err.message || '未知错误';
      wx.showModal({
        title: '保存失败',
        content: `错误: ${errorMsg}`,
        showCancel: false
      });
    }
  },

  cancelCreate() {
    wx.showModal({
      title: '提示',
      content: '确定要放弃创建吗？',
      confirmColor: '#667eea',
      success: (res) => {
        if (res.confirm) {
          wx.navigateBack();
        }
      }
    });
  },

  preventTouchMove() {
    return false;
  },

  doNothing() {
    return false;
  },

  getVehicleDisplay() {
    const { vehicles, workOrder } = this.data;
    if (!workOrder.vehicleId) {
      return '请选择或输入车辆信息';
    }
    const vehicle = vehicles.find(v => v.id === workOrder.vehicleId);
    return vehicle ? vehicle.label : workOrder.vehicleInfo;
  }
});