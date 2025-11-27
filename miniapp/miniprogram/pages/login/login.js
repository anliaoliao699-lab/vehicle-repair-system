"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const auth_1 = require("../../services/auth");

Page({
    data: {
        phone: '',
        password: '',
        loading: false,
        showPassword: false,
    },

    onLoad() {
        const token = wx.getStorageSync('token');
        if (token) {
            wx.switchTab({
                url: '/pages/dashboard/dashboard',
            });
        }
    },

    onPhoneInput(e) {
        this.setData({
            phone: e.detail.value,
        });
    },

    onPasswordInput(e) {
        this.setData({
            password: e.detail.value,
        });
    },

    togglePasswordVisibility() {
        this.setData({
            showPassword: !this.data.showPassword,
        });
    },

    handleLogin() {
        const { phone, password } = this.data;

        if (!phone || !password) {
            wx.showToast({
                title: '请输入手机号和密码',
                icon: 'error',
                duration: 2000,
            });
            return;
        }

        if (phone.length !== 11) {
            wx.showToast({
                title: '请输入正确的手机号',
                icon: 'error',
                duration: 2000,
            });
            return;
        }

        if (password.length < 6) {
            wx.showToast({
                title: '密码至少6位',
                icon: 'error',
                duration: 2000,
            });
            return;
        }

        this.setData({ loading: true });

        (0, auth_1.login)(phone, password)
            .then((res) => {
                console.log('登录成功:', res);
                (0, auth_1.saveLoginInfo)(res.accessToken, res.user);

                wx.showToast({
                    title: '登录成功',
                    icon: 'success',
                    duration: 1500,
                });

                setTimeout(() => {
                    wx.switchTab({
                        url: '/pages/dashboard/dashboard',
                        fail: (err) => {
                            console.log('switchTab 失败，尝试 navigateTo');
                            wx.navigateTo({
                                url: '/pages/dashboard/dashboard',
                            });
                        }
                    });
                }, 1500);
            })
            .catch((err) => {
                console.error('登录失败:', err);
                
                if (err.code === 403 || err.type === 'ACCOUNT_DISABLED') {
                    wx.showModal({
                        title: '账号已被禁用',
                        content: err.message || '您的账号已被禁用，如有疑问请联系管理员',
                        showCancel: false,
                        confirmText: '知道了'
                    });
                } else {
                    wx.showToast({
                        title: err.message || '登录失败',
                        icon: 'error',
                        duration: 2000,
                    });
                }
            })
            .finally(() => {
                this.setData({ loading: false });
            });
    },

    handleForgotPassword() {
        wx.showModal({
            title: '忘记密码',
            content: '请联系管理员重置密码\n\n联系方式：\n电话：18246056923\n邮箱：2419196159@qq.com',
            showCancel: true,
            cancelText: '取消',
            confirmText: '复制电话',
            success: (res) => {
                if (res.confirm) {
                    wx.setClipboardData({
                        data: '18246056923',
                        success: () => {
                            wx.showToast({
                                title: '电话已复制',
                                icon: 'success',
                                duration: 2000,
                            });
                        }
                    });
                }
            }
        });
    },

    navigateToRegister() {
        wx.navigateTo({
            url: '/pages/register/register',
        });
    },
});
