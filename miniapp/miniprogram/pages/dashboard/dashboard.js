"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const auth_1 = require("../../services/auth");
const { get } = require('../../services/request');

Page({
    data: {
        user: {
            name: "用户",
            role: "admin",
        },
        recentOrders: [],
        stats: {
            totalOrders: 0,
            assignedOrders: 0,
            completedOrders: 0,
        },
        isWorker: false,
        isAdmin: false,
    },
    onLoad() {
        console.log("Dashboard onLoad");
        this.loadUserInfo();
        this.loadDashboardData();
    },
    onShow() {
        console.log("Dashboard onShow");
        this.loadDashboardData();
    },
    loadUserInfo() {
        const user = (0, auth_1.getLocalUser)();
        console.log("用户信息:", user);
        if (user) {
            const isWorker = user.role === 'worker';
            const isAdmin = user.role === 'admin';
            this.setData({
                user,
                isWorker,
                isAdmin
            });
        }
    },
    async loadDashboardData() {
        try {
            const user = (0, auth_1.getLocalUser)();
            if (!user) return;

            // 获取所有工单统计
            // ✅ 后端已经根据角色过滤了数据，前端直接使用即可
            const allOrders = await get('/work-orders', { limit: 10000 });
            const orders = Array.isArray(allOrders) ? allOrders : (allOrders.items || []);

            // 统计数据
            const totalOrders = orders.length;
            const assignedOrders = orders.filter(o =>
                (o.status || '').toLowerCase() === 'assigned'
            ).length;
            const completedOrders = orders.filter(o =>
                (o.status || '').toLowerCase() === 'completed'
            ).length;

            this.setData({
                stats: {
                    totalOrders,
                    assignedOrders,
                    completedOrders,
                },
            });

            console.log('📊 Dashboard统计:', { totalOrders, assignedOrders, completedOrders });
        } catch (err) {
            console.error('❌ 加载Dashboard数据失败:', err);
        }
    },
    // 跳转到工单列表（全部）
    navigateToOrders() {
        wx.navigateTo({
            url: "/pages/work-order/list",
        });
    },
    // 跳转到工单列表（已分配）
    navigateToAssigned() {
        wx.navigateTo({
            url: "/pages/work-order/list?status=assigned",
        });
    },
    // 跳转到工单列表（已完成）
    navigateToCompleted() {
        wx.navigateTo({
            url: "/pages/work-order/list?status=completed",
        });
    },
    // ✅ 创建工单（仅管理员）
    navigateToCreateOrder() {
        wx.navigateTo({
            url: "/pages/work-order/create/create",
        });
    },
    navigateToProfile() {
        wx.showToast({
            title: "功能开发中",
            icon: "none",
        });
    },
    viewOrderDetail(e) {
        const orderId = e.currentTarget.dataset.id;
        wx.navigateTo({
            url: `/pages/work-order/detail?id=${orderId}`,
        });
    },
    handleLogout() {
        wx.showModal({
            title: "确认退出",
            content: "确定要退出登录吗？",
            success: (res) => {
                if (res.confirm) {
                    (0, auth_1.clearLoginInfo)();
                    wx.redirectTo({
                        url: "/pages/login/login",
                    });
                }
            },
        });
    },
});