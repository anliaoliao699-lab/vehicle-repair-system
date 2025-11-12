"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const auth_1 = require("../../services/auth");

// 管理员验证码（固定值）
const ADMIN_VERIFICATION_CODE = "20251031";

Page({
    data: {
        phone: '',
        password: '',
        confirmPassword: '',
        name: '',
        role: 'owner',
        roleIndex: 0,
        roleOptions: [
            { value: 'owner', label: '车主 🚗' },
            { value: 'worker', label: '员工 🔧' },
            { value: 'admin', label: '管理员 👨‍💼' }
        ],
        adminCode: '',
        loading: false,
        showPassword: false,
        showConfirmPassword: false,
    },

    onRoleChange(e) {
        const index = e.detail.value;
        const selectedRole = this.data.roleOptions[index];
        this.setData({
            roleIndex: index,
            role: selectedRole.value,
            adminCode: ''
        });
        console.log('选择的身份:', selectedRole);
    },

    onAdminCodeInput(e) {
        this.setData({
            adminCode: e.detail.value,
        });
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

    onConfirmPasswordInput(e) {
        this.setData({
            confirmPassword: e.detail.value,
        });
    },

    onNameInput(e) {
        this.setData({
            name: e.detail.value,
        });
    },

    togglePasswordVisibility() {
        this.setData({
            showPassword: !this.data.showPassword,
        });
    },

    toggleConfirmPasswordVisibility() {
        this.setData({
            showConfirmPassword: !this.data.showConfirmPassword,
        });
    },

    handleRegister() {
        const { phone, password, confirmPassword, name, role, adminCode } = this.data;

        // 验证管理员验证码
        if (role === 'admin') {
            if (!adminCode) {
                wx.showToast({
                    title: '请输入管理员验证码',
                    icon: 'error',
                    duration: 2000,
                });
                return;
            }

            if (adminCode !== ADMIN_VERIFICATION_CODE) {
                wx.showToast({
                    title: '管理员验证码错误',
                    icon: 'error',
                    duration: 2000,
                });
                return;
            }
        }

        // 验证手机号
        if (!phone) {
            wx.showToast({
                title: '请输入手机号',
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

        // 验证密码
        if (!password) {
            wx.showToast({
                title: '请输入密码',
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

        // 验证确认密码
        if (!confirmPassword) {
            wx.showToast({
                title: '请确认密码',
                icon: 'error',
                duration: 2000,
            });
            return;
        }

        if (password !== confirmPassword) {
            wx.showToast({
                title: '两次密码不一致',
                icon: 'error',
                duration: 2000,
            });
            return;
        }

        // 验证姓名
        if (!name) {
            wx.showToast({
                title: '请输入姓名',
                icon: 'error',
                duration: 2000,
            });
            return;
        }

        this.setData({ loading: true });

        console.log('注册数据:', { phone, name, role, type: 'phone' });

        // 调用注册接口
        (0, auth_1.register)({
            phone,
            password,
            name,
            role,
            type: 'phone'
        })
            .then((res) => {
                console.log('注册成功:', res);

                const roleLabel = this.data.roleOptions[this.data.roleIndex].label;
                
                wx.showModal({
                    title: '注册成功',
                    content: '您已成功注册为' + roleLabel + '，请登录',
                    showCancel: false,
                    success: () => {
                        wx.navigateBack();
                    }
                });
            })
            .catch((err) => {
                console.error('注册失败:', err);

                wx.showToast({
                    title: err.message || '注册失败',
                    icon: 'error',
                    duration: 2000,
                });
            })
            .finally(() => {
                this.setData({ loading: false });
            });
    },

    navigateToLogin() {
        wx.navigateBack();
    },
});
