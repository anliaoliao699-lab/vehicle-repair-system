"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const request_1 = require("../../services/request");
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
        statusOptions: [
            { value: "all", label: "全部" },
            { value: "new", label: "新建" },
            { value: "assigned", label: "已分配" },
            { value: "in_progress", label: "进行中" },
            { value: "on_hold", label: "暂停" },
            { value: "completed", label: "已完成" },
            { value: "accepted", label: "已接受" },
            { value: "paid", label: "已支付" },
            { value: "closed", label: "已关闭" },
        ],
    },
    onLoad() {
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
        return __awaiter(this, void 0, void 0, function* () {
            const { page, limit, status } = this.data;
            this.setData({ loading: true });
            try {
                const queryParams = {
                    page,
                    limit,
                };
                if (status !== "all") {
                    queryParams.status = status;
                }
                console.log("请求参数:", queryParams);
                const res = yield (0, request_1.get)("/work-orders", queryParams);
                console.log("API 返回数据:", res);
                const orders = res.items || [];
                const total = res.total || 0;
                const allOrders = append
                    ? [...this.data.workOrders, ...orders]
                    : orders;
                this.setData({
                    workOrders: allOrders,
                    total,
                });
                this.filterWorkOrders();
                if (!append) {
                    wx.showToast({
                        title: "已加载" + orders.length + "个工单",
                        icon: "success",
                        duration: 1500,
                    });
                }
            }
            catch (err) {
                console.error("加载工单失败:", err);
                wx.showToast({
                    title: err.message || "加载失败，请重试",
                    icon: "error",
                    duration: 2000,
                });
                if (!append && this.data.workOrders.length === 0) {
                    wx.showModal({
                        title: "提示",
                        content: "连接后端失败，是否使用模拟数据？",
                        success: (res) => {
                            if (res.confirm) {
                                this.setData({
                                    workOrders: this.getMockData(),
                                });
                                this.filterWorkOrders();
                            }
                        },
                    });
                }
            }
            finally {
                this.setData({ loading: false });
                wx.stopPullDownRefresh();
            }
        });
    },
    getMockData() {
        return [
            {
                id: 1,
                orderNo: "WO-2025-001",
                vehicleInfo: "丰田凯美瑞 2018",
                status: "in_progress",
                description: "年度保养+机油更换",
                estimatedCost: 500,
                actualCost: 450,
                createdAt: "2025-10-29",
                customerId: 1,
            },
            {
                id: 2,
                orderNo: "WO-2025-002",
                vehicleInfo: "本田思域 2020",
                status: "completed",
                description: "轮胎更换",
                estimatedCost: 800,
                actualCost: 750,
                createdAt: "2025-10-28",
                customerId: 2,
            },
            {
                id: 3,
                orderNo: "WO-2025-003",
                vehicleInfo: "大众帕萨特 2019",
                status: "new",
                description: "故障诊断",
                estimatedCost: 200,
                createdAt: "2025-10-27",
                customerId: 3,
            },
            {
                id: 4,
                orderNo: "WO-2025-004",
                vehicleInfo: "宝马 3 系 2021",
                status: "assigned",
                description: "刹车片更换",
                estimatedCost: 600,
                createdAt: "2025-10-26",
                customerId: 4,
            },
            {
                id: 5,
                orderNo: "WO-2025-005",
                vehicleInfo: "奥迪 A6 2020",
                status: "paid",
                description: "全车保养",
                estimatedCost: 1200,
                actualCost: 1100,
                createdAt: "2025-10-25",
                customerId: 5,
            },
        ];
    },
    onStatusChange(e) {
        const picker = e.detail;
        const value = this.data.statusOptions[picker.value]?.value || "all";
        this.setData({ status: value, page: 1 });
        this.loadWorkOrders();
    },
    onSearchInput(e) {
        const searchText = e.detail.value;
        this.setData({ searchText, page: 1 });
        this.filterWorkOrders();
    },
    filterWorkOrders() {
        const { workOrders, searchText } = this.data;
        let filtered = workOrders;
        if (searchText) {
            const text = searchText.toLowerCase();
            filtered = filtered.filter((order) => (order.orderNo && order.orderNo.toLowerCase().includes(text)) ||
                (order.vehicleInfo &&
                    order.vehicleInfo.toLowerCase().includes(text)) ||
                (order.description && order.description.toLowerCase().includes(text)));
        }
        this.setData({ filteredOrders: filtered });
    },
    getStatusColor(status) {
        const colors = {
            new: "#0066ff",
            assigned: "#ff9500",
            in_progress: "#ff6b6b",
            on_hold: "#ffc069",
            completed: "#07c160",
            accepted: "#13c2c2",
            paid: "#9254de",
            closed: "#999",
        };
        return colors[status] || "#999";
    },
    getStatusText(status) {
        const texts = {
            new: "新建",
            assigned: "已分配",
            in_progress: "进行中",
            on_hold: "暂停",
            completed: "已完成",
            accepted: "已接受",
            paid: "已支付",
            closed: "已关闭",
        };
        return texts[status] || status;
    },
    viewOrderDetail(e) {
        const orderId = e.currentTarget.dataset.id;
        wx.navigateTo({
            url: "/pages/work-order/detail?id=" + orderId,
        });
    },
    navigateToCreate() {
        wx.navigateTo({
            url: "/pages/work-order/create",
        });
    },
});
