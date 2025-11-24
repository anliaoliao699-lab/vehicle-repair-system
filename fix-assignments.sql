-- 修复脚本：为所有有 assigned_worker_id 但没有 work_order_workers 记录的工单添加记录

-- 首先查看有多少工单需要修复
SELECT
    wo.id,
    wo.order_no,
    wo.assigned_worker_id,
    wo.status
FROM work_orders wo
WHERE wo.assigned_worker_id IS NOT NULL
  AND wo.assigned_worker_id != 0
  AND NOT EXISTS (
    SELECT 1 FROM work_order_workers wow
    WHERE wow.work_order_id = wo.id
      AND wow.worker_id = wo.assigned_worker_id
  );

-- 执行修复：为这些工单添加 work_order_workers 记录
INSERT INTO work_order_workers (work_order_id, worker_id, worker_role, assigned_at)
SELECT
    wo.id,
    wo.assigned_worker_id,
    '维修员',  -- 默认角色
    COALESCE(wo.updated_at, wo.created_at, NOW())  -- 使用工单更新时间或创建时间
FROM work_orders wo
WHERE wo.assigned_worker_id IS NOT NULL
  AND wo.assigned_worker_id != 0
  AND NOT EXISTS (
    SELECT 1 FROM work_order_workers wow
    WHERE wow.work_order_id = wo.id
      AND wow.worker_id = wo.assigned_worker_id
  );

-- 验证修复结果
SELECT COUNT(*) as fixed_count FROM work_order_workers;
