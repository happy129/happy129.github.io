import Service from '@/util/axios';



// 查询六合彩预开盘口信息 当前盘口信息
export function marksixIssueQueryAdvanceIssue(params) {
    return Service.post('/config-admin-api/marksixIssue/getNextIssueInfo', {
        body: params
    })
}