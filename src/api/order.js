// 订单系统
import request from '@/utils/request'

export function fetchOrderList(query) {
  return request({
    url: '/article/list',
    method: 'get',
    params: query
  })
}
