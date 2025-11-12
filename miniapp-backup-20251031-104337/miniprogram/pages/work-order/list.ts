import { get } from "../../services/request"

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
    this.loadWorkOrders()
  },

  onPullDownRefresh() {
    this.setData({ page: 1 })
    this.loadWorkOrders()
  },

  onReachBottom() {
    // 滚动到底部时加载下一页
    const { page, limit, total, workOrders } = this.data
    if (workOrders.length < total) {
      this.setData({ page: page + 1 })
      this.loadWorkOrders(true)
    }
  },

  async loadWorkOrders(append = false) {
    const { page, limit, status } = this.data

    this.setData({ loading: true })

    try {
      // 构建查询参数
      const queryParams: any = {
        page,
        limit,
      }

      // 如果选择了具体的状态，添加到查询参数
      if (status !== "all") {
        queryParams.status = status
      }

      console.log("请求参数:", queryParams)

      // 调用后端 API
      const res = await get("/work-orders", queryParams)

      console.log("API 返回数据:", res)

      // 处理返回数据（后端返回 { items: [...], total: number }）
      const orders = res.items || []
      const total = res.total || 0

      // 如果是追加模式（分页加载），合并数据
      const allOrders = append
        ? [...this.data.workOrders, ...orders]
        : orders

      this.setData({
        workOrders: allOrders,
        total,
      })

      this.filterWorkOrders()

      if (!append) {
        wx.showToast({
          title: `已加载 ${orders.length} 个工单`,
          icon: "success",
          duration: 1500,
        })
      }
    } catch (err: any) {
      console.error("加载工单失败:", err)

      // 如果 API 失败，显示错误信息但继续使用已有数据
      wx.showToast({
        title: err.message || "加载失败，请重试",
        icon: "error",
        duration: 2000,
      })

      // 第一次加载失败时，使用模拟数据
      if (!append && this.data.workOrders.length === 0) {
        wx.showModal({
          title: "提示",
          content: "连接后端失败，是否使用模拟数据?",
          success: (res) => {
            if (res.confirm) {
              this.setData({
                workOrders: this.getMockData(),
              })
              this.filterWorkOrders()
            }
          },
        })
      }
    } finally {
      this.setData({ loading: false })
      wx.stopPullDownRefresh()
    }
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
    ]
  },

  onStatusChange(e: any) {
    const picker = e.detail
    const value = this.data.statusOptions[picker.value]?.value || "all"
    this.setData({ status: value, page: 1 })
    this.loadWorkOrders()
  },

  onSearchInput(e: any) {
    const searchText = e.detail.value
    this.setData({ searchText, page: 1 })
    this.filterWorkOrders()
  },

  filterWorkOrders() {
    const { workOrders, searchText } = this.data

    let filtered = workOrders

    // 按搜索文本筛选（工单号、车辆信息、描述）
    if (searchText) {
      const text = searchText.toLowerCase()
      filtered = filtered.filter(
        (order: any) =>
          (order.orderNo && order.orderNo.toLowerCase().includes(text)) ||
          (order.vehicleInfo &&
            order.vehicleInfo.toLowerCase().includes(text)) ||
          (order.description && order.description.toLowerCase().includes(text))
      )
    }

    this.setData({ filteredOrders: filtered })
  },

  getStatusColor(status: string) {
    const colors: any = {
      new: "#0066ff",
      assigned: "#ff9500",
      in_progress: "#ff6b6b",
      on_hold: "#ffc069",
      completed: "#07c160",
      accepted: "#13c2c2",
      paid: "#9254de",
      closed: "#999",
    }
    return colors[status] || "#999"
  },

  getStatusText(status: string) {
    const texts: any = {
      new: "新建",
      assigned: "已分配",
      in_progress: "进行中",
      on_hold: "暂停",
      completed: "已完成",
      accepted: "已接受",
      paid: "已支付",
      closed: "已关闭",
    }
    return texts[status] || status
  },

  viewOrderDetail(e: any) {
    const orderId = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/work-order/detail?id=${orderId}`,
    })
  },

  navigateToCreate() {
    wx.navigateTo({
      url: "/pages/work-order/create",
    })
  },
})