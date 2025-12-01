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
            pendingOrders: 0,    // ✅ 新增：待分配（new状态）
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
            const allOrders = await get('/work-orders', { limit: 10000 });
            const orders = Array.isArray(allOrders) ? allOrders : (allOrders.items || []);

            // 统计数据
            const totalOrders = orders.length;
            // ✅ 新增：待分配（new状态）
            const pendingOrders = orders.filter(o =>
                (o.status || '').toLowerCase() === 'new'
            ).length;
            const assignedOrders = orders.filter(o =>
                (o.status || '').toLowerCase() === 'assigned'
            ).length;
            const completedOrders = orders.filter(o =>
                (o.status || '').toLowerCase() === 'completed'
            ).length;

            this.setData({
                stats: {
                    totalOrders,
                    pendingOrders,      // ✅ 新增
                    assignedOrders,
                    completedOrders,
                },
            });

            console.log('📊 Dashboard统计:', { totalOrders, pendingOrders, assignedOrders, completedOrders });
        } catch (err) {
            console.error('❌ 加载Dashboard数据失败:', err);
        }
    },
    // 跳转到工单列表（全部）
    navigateToOrders() {
        wx.switchTab({
            url: "/pages/work-order/list",
            success: () => {
                // ✅ 通过事件通知 list 页面刷新并设置状态
                setTimeout(() => {
                    const pages = getCurrentPages();
                    const listPage = pages.find(p => p.route === 'pages/work-order/list');
                    if (listPage) {
                        listPage.setData({ status: 'all', currentStatusLabel: '全部' });
                        listPage.loadWorkOrders();
                    }
                }, 100);
            }
        });
    },
    // ✅ 新增：跳转到工单列表（待分配/新建）
    navigateToPending() {
        wx.switchTab({
            url: "/pages/work-order/list",
            success: () => {
                setTimeout(() => {
                    const pages = getCurrentPages();
                    const listPage = pages.find(p => p.route === 'pages/work-order/list');
                    if (listPage) {
                        listPage.setData({ status: 'new', currentStatusLabel: '待分配' });
                        listPage.loadWorkOrders();
                    }
                }, 100);
            }
        });
    },
    // 跳转到工单列表（已分配）
    navigateToAssigned() {
        wx.switchTab({
            url: "/pages/work-order/list",
            success: () => {
                setTimeout(() => {
                    const pages = getCurrentPages();
                    const listPage = pages.find(p => p.route === 'pages/work-order/list');
                    if (listPage) {
                        listPage.setData({ status: 'assigned', currentStatusLabel: '已分配' });
                        listPage.loadWorkOrders();
                    }
                }, 100);
            }
        });
    },
    // 跳转到工单列表（已完成）
    navigateToCompleted() {
        wx.switchTab({
            url: "/pages/work-order/list",
            success: () => {
                setTimeout(() => {
                    const pages = getCurrentPages();
                    const listPage = pages.find(p => p.route === 'pages/work-order/list');
                    if (listPage) {
                        listPage.setData({ status: 'completed', currentStatusLabel: '已完成' });
                        listPage.loadWorkOrders();
                    }
                }, 100);
            }
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