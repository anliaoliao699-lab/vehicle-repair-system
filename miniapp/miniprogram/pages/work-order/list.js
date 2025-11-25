"use strict";

const { get } = require('../../services/request');

Page({
    data: {
        workOrders: [],
        filteredOrders: [],
        loading: false,
        page: 1,
        limit: 10000,
        total: 0,
        status: "all",
        currentStatusLabel: "全部",
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
        // 🔑 状态映射表
        statusColorMap: {
            'new': '#2c69e2ff',
            'assigned': '#fc7a23ff',
            'in_progress': '#d863e3ff',
            'completed': '#4fb252ff',
            'accepted': '#9c27b0',
            'paid': '#8bc34a',
            'closed': '#999999'
        },
        statusTextMap: {
            'new': '新建',
            'assigned': '已分配',
            'in_progress': '进行中',
            'completed': '已完成',
            'accepted': '已接受',
            'paid': '已支付',
            'closed': '已关闭'
        }
    },

    onLoad(options) {
        const userStr = wx.getStorageSync('user');
        const user = userStr ? JSON.parse(userStr) : {};
        const userId = user.id || wx.getStorageSync('userId') || 0;

        // 处理从 dashboard 传递过来的 status 参数
        let initialStatus = 'all';
        let initialStatusLabel = '全部';

        if (options && options.status) {
            const statusParam = options.status.toLowerCase();

            // 根据传入的状态参数设置初始筛选
            const statusMap = {
                'pending': { value: 'new', label: '新建' },
                'completed': { value: 'completed', label: '已完成' },
                'new': { value: 'new', label: '新建' },
                'assigned': { value: 'assigned', label: '已分配' },
                'in_progress': { value: 'in_progress', label: '进行中' }
            };

            if (statusMap[statusParam]) {
                initialStatus = statusMap[statusParam].value;
                initialStatusLabel = statusMap[statusParam].label;
            }
        }

        this.setData({
            userRole: user.role || '',
            userId: userId,
            status: initialStatus,
            currentStatusLabel: initialStatusLabel
        });

        console.log('========== 用户信息 ==========');
        console.log('用户角色:', user.role);
        console.log('用户ID:', userId);
        console.log('初始状态筛选:', initialStatus);
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

    // 🔑 获取状态颜色
    getStatusColor(status) {
        status = (status || 'new').toLowerCase();
        return this.data.statusColorMap[status] || '#999999';
    },

    // 🔑 获取状态文本
    getStatusText(status) {
        status = (status || 'new').toLowerCase();
        return this.data.statusTextMap[status] || '未知';
    },

    loadWorkOrders(append = false) {
        const userStr = wx.getStorageSync('user');
        const user = userStr ? JSON.parse(userStr) : {};
        const userId = Number(user.id || 0);

        if (userId === 0) {
            console.warn('❌ 未获取到有效用户ID，不查询');
            this.setData({ loading: false });
            return;
        }

        this.setData({ userId });

        const { page, limit, status, userRole } = this.data;
        const queryParams = { page, limit };

        if (userRole === 'worker') {
            queryParams.assigned_worker_id = userId;
            console.log('========== Worker模式 ==========');
            console.log('只加载分配给用户 ID:', userId, '的工单');
        }
        
        if (status !== "all") {
            queryParams.status = status;
        }

        console.log('🔵 发送请求参数:', queryParams);

        get('/work-orders', queryParams)
            .then(async (res) => {
                console.log('🟢 后端原始响应:', res);
                
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

                console.log(`📦 解析出 ${orders.length} 个工单`);
                
                if (orders.length > 0) {
                    console.log('📄 第一个工单的完整原始数据:', orders[0]);
                }

                // ✅ 性能优化：直接使用工单字段中的费用，避免 N+1 查询
                orders = orders.map((order, idx) => {
                    const vehicleInfo = order.vehicleInfo
                        || order.vehicle_info
                        || '未填写';

                    // ✅ 车主名字直接使用 description 字段
                    const customerName = order.description || '未填写';

                    const createdAt = this.formatDate(order.created_at || order.createdAt);
                    const updatedAt = this.formatDate(order.updated_at || order.updatedAt);

                    // ✅ 性能优化：直接使用字段费用，不再为每个工单单独请求 workItems
                    const actualCost = parseFloat(order.actual_cost ?? order.actualCost ?? 0);
                    const estimatedCost = parseFloat(order.estimated_cost ?? order.estimatedCost ?? 0);
                    const displayCost = actualCost > 0 ? actualCost : estimatedCost;

                    const status = (order.status || 'new').toLowerCase();

                    // 🔑 预处理状态颜色和文本，给WXML使用
                    const statusColor = this.data.statusColorMap[status] || '#999999';
                    const statusText = this.data.statusTextMap[status] || '未知';

                    if (idx === 0) {
                        console.log(`✅ 工单 ${order.id} 最终显示:`, {
                            customerName: customerName,
                            displayCost: displayCost,
                            vehicleInfo: vehicleInfo,
                            statusColor: statusColor,
                            statusText: statusText
                        });
                    }

                    return {
                        ...order,
                        vehicleInfo: vehicleInfo,
                        customerName: customerName,
                        createdAt: createdAt,
                        updatedAt: updatedAt,
                        displayCost: displayCost,          // ✅ 直接使用字段费用
                        status: status,
                        statusColor: statusColor,          // 🔑 添加预处理的颜色
                        statusText: statusText,            // 🔑 添加预处理的文本
                        description: order.description || ''
                    };
                });
                
                const allOrders = orders;
                
                console.log(`✅ 最终加载 ${allOrders.length} 个工单到页面`);
                
                this.setData({
                    workOrders: allOrders,
                    total: total,
                });
                
                this.filterWorkOrders();
                
                const roleText = userRole === 'worker' ? '我的' : '';
                wx.showToast({
                    title: `已加载${roleText}${orders.length}个工单`,
                    icon: "success",
                    duration: 1500,
                });
            })
            .catch((err) => {
                console.error("❌ 加载工单失败:", err);
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

    // 🔧 日期格式化函数
    // ✅ 修复：减少8小时解决时区问题
    formatDate(dateStr) {
        if (!dateStr) return '';
        
        try {
            let date;
            
            if (typeof dateStr === 'number') {
                date = new Date(dateStr);
            } 
            else if (typeof dateStr === 'string') {
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

    onStatusChange(e) {
        const picker = e.detail;
        const selectedOption = this.data.statusOptions[picker.value];
        const value = selectedOption?.value || "all";
        const label = selectedOption?.label || "全部";
        
        console.log('状态筛选:', value);
        this.setData({ 
            status: value, 
            currentStatusLabel: label,
            page: 1 
        });
        this.loadWorkOrders();
    },

    onSearchInput(e) {
        const searchText = e.detail.value;
        this.setData({ searchText: searchText });
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