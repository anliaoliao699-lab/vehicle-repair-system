-- 检查工单 45 的分配情况
SELECT * FROM work_order_workers WHERE work_order_id = 45;

-- 检查工单 45 的基本信息
SELECT id, order_no, status, assigned_worker_id FROM work_orders WHERE id = 45;

-- 检查当前登录的员工信息（请替换为实际的员工ID）
-- SELECT id, name, role FROM users WHERE role = 'worker';
