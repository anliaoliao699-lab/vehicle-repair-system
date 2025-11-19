"use strict";

const { get } = require('../../services/request');

Page({
    data: {
        workOrders: [],
        filteredOrders: [],
        loading: false,
        page: 1,
        limit: 20,
        total: 0,
        status: "all",
        searchText: "",
        userRole: '',
        userId: 0,
        statusOptions: [
            { value: "all", label: "全部" },
            { value: "new", label: "新建" },
            { value: "assigned", label: "已分配" },
            { value: "in_progress", label: "进行中" },
            { value: "completed", label: "已完成" },
            { value: "accepted", label: "已接受" },
            { value: "paid", label: "已支付" },
            { value: "closed", label: "已关闭" },
        ],
    },

    onLoad() {
        const userStr = wx.getStorageSync('user');
        const user = userStr ? JSON.parse(userStr) : {};
        const userId = user.id || wx.getStorageSync('userId') || 0;
        
        this.setData({
            userRole: user.role || '',
            userId: userId
        });
        
        console.log('========== 用户信息 ==========');
        console.log('用户角色:', user.role);
        console.log('用户ID:', userId);
        console.log('完整用户信息:', user);
        console.log('============================');
        
        this.loadWorkOrders();
    },

    onShow() {
        this.loadWorkOrders();
    },

    onPullDownRefresh() {
        this.setData({ page: 1 });
        this.loadWorkOrders();
    },

    onReachBottom() {
        const { page, limit, total, workOrders } = this.data;
        if (workOrders.length < total) {
            this.setData({ page: page + 1 });
            this.loadWorkOrders(true);
        }
    },

    loadWorkOrders(append = false) {

    // 1. 重新解析，确保是数字
        const userStr = wx.getStorageSync('user');
        const user = userStr ? JSON.parse(userStr) : {};
        const userId = Number(user.id || 0);

        // 2. 如果还是 0，说明没登录或缓存异常，直接 return
        if (userId === 0) {
            console.warn('❌ 未获取到有效用户ID，不查询');
            this.setData({ loading: false });
            return;
        }

        this.setData({ userId }); // 写回 data

        const { page, limit, status, userRole } = this.data;
        const queryParams = { page, limit };

       
        if (userRole === 'worker') {
            queryParams.assigned_worker_id = this.data.userId;
            console.log('========== Worker模式 ==========');
            console.log('只加载分配给用户 ID:', userId, '的工单');
        }
        
        if (status !== "all") {
            queryParams.status = status;
        }

        console.log('========== 请求参数 ==========');
        console.log(queryParams);
        console.log('============================');

        get('/work-orders', queryParams)
            .then((res) => {
                console.log('========== API 返回 ==========');
                console.log('原始响应:', res);
                
                let orders = [];
                let total = 0;
                
                if (Array.isArray(res)) {
                    orders = res;
                    total = res.length;
                } else if (res.items && Array.isArray(res.items)) {
                    orders = res.items;
                    total = res.total || 0;
                } else if (res.data && Array.isArray(res.data)) {
                    orders = res.data;
                    total = res.total || orders.length;
                }

                console.log('解析后的工单数量:', orders.length);
                
                // ✅ 打印每个工单的关键信息（显示原始字段）
                orders.forEach((order, index) => {
                    console.log(`工单 ${index + 1} (原始数据):`, {
                        id: order.id,
                        status: order.status,
                        vehicle_info: order.vehicle_info,
                        estimated_cost: order.estimated_cost,
                        actual_cost: order.actual_cost,
                        created_at: order.created_at
                    });
                });

                // 🔧 格式化字段：将蛇形命名转换为驼峰命名，并处理时间和费用字段
                orders = orders.map(order => {
                    // 🚀 关键修复：支持蛇形命名法的字段，并提前提取
                    const vehicleInfo = order.vehicleInfo 
                        || order.vehicle_info 
                        || '未填写车辆信息';
                    
                    const createdAt = this.formatDate(order.created_at || order.createdAt);
                    const updatedAt = this.formatDate(order.updated_at || order.updatedAt);
                    
                    const estimatedCost = parseFloat(order.estimated_cost) 
                        || parseFloat(order.estimatedCost) 
                        || 0;
                    
                    const actualCost = parseFloat(order.actual_cost) 
                        || parseFloat(order.actualCost) 
                        || 0;
                    

                    const status = (order.status || 'new').toLowerCase();
                    
                    const formatted = {
                        ...order,
                        // 统一使用驼峰命名（为了前端模板兼容性）
                        vehicleInfo: vehicleInfo,
                        createdAt: createdAt,
                        updatedAt: updatedAt,
                        estimatedCost: estimatedCost,
                        actualCost: actualCost,
                        status: status
                    };
                    
                    console.log('✅ 格式化后的工单:', {
                        id: formatted.id,
                        vehicleInfo: formatted.vehicleInfo,
                        estimatedCost: formatted.estimatedCost,
                        createdAt: formatted.createdAt,
                        status: formatted.status
                    });
                    
                    return formatted;
                });
                
                const allOrders = append
                    ? [...this.data.workOrders, ...orders]
                    : orders;
                
                console.log('最终设置的工单数量:', allOrders.length);
                console.log('============================');
                
                this.setData({
                    workOrders: allOrders,
                    total: total,
                });
                
                this.filterWorkOrders();
                
                if (!append) {
                    const roleText = userRole === 'worker' ? '我的' : '';
                    wx.showToast({
                        title: `已加载${roleText}${orders.length}个工单`,
                        icon: "success",
                        duration: 1500,
                    });
                }
            })
            .catch((err) => {
                console.error("========== 加载失败 ==========");
                console.error("错误信息:", err);
                console.error("============================");
                wx.showToast({
                    title: "加载失败: " + err.message,
                    icon: "error",
                    duration: 2000,
                });
            })
            .finally(() => {
                this.setData({ loading: false });
                wx.stopPullDownRefresh();
            });
    },

    // 🔧 改进的日期格式化函数：支持更多格式
    formatDate(dateStr) {
        if (!dateStr) return '';
        
        try {
            let date;
            
            // 支持时间戳（数字类型）
            if (typeof dateStr === 'number') {
                date = new Date(dateStr);
            } 
            // 支持字符串类型
            else if (typeof dateStr === 'string') {
                date = new Date(dateStr);
                
                // 如果无效，尝试其他格式
                if (isNaN(date.getTime())) {
                    // 尝试移除 'Z' 并重新解析（处理 ISO 8601 格式）
                    const cleanStr = dateStr.replace('Z', '');
                    date = new Date(cleanStr);
                }
            }
            
            // 验证日期有效性
            if (!date || isNaN(date.getTime())) {
                console.warn('⚠️ 日期格式无法识别:', dateStr);
                return '';
            }
            
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            
            return `${year}-${month}-${day} ${hours}:${minutes}`;
        } catch (e) {
            console.error('❌ 日期格式化异常:', dateStr, e);
            return '';
        }
    },

    onStatusChange(e) {
        const picker = e.detail;
        const value = this.data.statusOptions[picker.value]?.value || "all";
        console.log('状态筛选:', value);
        this.setData({ status: value, page: 1 });
        this.loadWorkOrders();
    },

    onSearchInput(e) {
        const searchText = e.detail.value;
        this.setData({ searchText: searchText, page: 1 });
        this.filterWorkOrders();
    },

    filterWorkOrders() {
        const { workOrders, searchText } = this.data;
        let filtered = workOrders;
        if (searchText) {
            const text = searchText.toLowerCase();
            filtered = filtered.filter((order) => 
                (order.orderNo && order.orderNo.toLowerCase().includes(text)) ||
                (order.order_no && order.order_no.toLowerCase().includes(text)) ||
                (order.vehicleInfo && order.vehicleInfo.toLowerCase().includes(text)) ||
                (order.vehicle_info && order.vehicle_info.toLowerCase().includes(text)) ||
                (order.description && order.description.toLowerCase().includes(text))
            );
        }
        
        console.log('过滤后的工单数量:', filtered.length);
        this.setData({ filteredOrders: filtered });
    },

    viewOrderDetail(e) {
        const orderId = e.currentTarget.dataset.id;
        wx.navigateTo({
            url: "/pages/work-order/detail?id=" + orderId,
        });
    },

    navigateToCreate() {
        wx.navigateTo({
            url: '/pages/work-order/create/create'
        });
    }
});