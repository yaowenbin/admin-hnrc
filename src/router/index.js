import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

/* Layout */
import Layout from '@/layout'

/**
 * Note: sub-menu only appear when route children.length >= 1
 * Detail see: https://panjiachen.github.io/vue-element-admin-site/guide/essentials/router-and-nav.html
 *
 * hidden: true                   if set true, item will not show in the sidebar(default is false)
 * alwaysShow: true               if set true, will always show the root menu
 *                                if not set alwaysShow, when item has more than one children route,
 *                                it will becomes nested mode, otherwise not show the root menu
 * redirect: noRedirect           if set noRedirect will no redirect in the breadcrumb
 * name:'router-name'             the name is used by <keep-alive> (must set!!!)
 * meta : {
    roles: ['admin','editor']    control the page roles (you can set multiple roles)
    title: 'title'               the name show in sidebar and breadcrumb (recommend set)
    icon: 'svg-name'             the icon show in the sidebar
    breadcrumb: false            if set false, the item will hidden in breadcrumb(default is true)
    activeMenu: '/example/list'  if set path, the sidebar will highlight the path you set
  }
 */

/**
 * constantRoutes
 * a base page that does not have permission requirements
 * all roles can be accessed
 */
export const constantRoutes = [
  {
    path: '/login',
    component: () => import('@/views/login/index'),
    hidden: true
  },

  {
    path: '/404',
    component: () => import('@/views/404'),
    hidden: true
  },

  // 财务管理 -- 核心模块 -- 涉及双方对账
  {
    path: '/',
    component: Layout,
    redirect: '/finance',
    meta: { title: '订单管理', icon: 'example' },
    children: [
      // 订单修改，要追踪记录，导出所有有修改记录的订单，财务核对时要明确责任
      {
        path: 'finance',
        name: 'Finance',
        component: () => import('@/views/finance/order'),
        meta: { title: '订单列表', icon: 'dashboard' }
      },
      // 采用电子发票 -- 目前开票流程需和客服沟通
      // 自主开票 & 后台开票 https://www.fapiao.com/dzfp-web/products_kp_01.html
      {
        path: 'ticket',
        name: 'Ticket',
        component: () => import('@/views/finance/ticket'),
        meta: { title: '发票配送', icon: 'dashboard' }
      }
    ]
  },

  // 学员管理
  {
    path: '/student',
    component: Layout,
    redirect: '/student/role',
    name: 'Exam',
    meta: { title: '学员管理', icon: 'example' },
    children: [
      {
        path: 'list',
        name: 'list',
        component: () => import('@/views/student/list'),
        meta: { title: '学员列表', icon: 'table' }
      },
      // 目前系统不支持线下报名，通过人工导入表格，容易出错效率也低
      {
        path: 'apply',
        name: 'apply',
        component: () => import('@/views/student/apply'),
        meta: { title: '线下报名', icon: 'table' }
      },
      {
        path: 'cert',
        name: 'cert',
        component: () => import('@/views/student/cert'),
        meta: { title: '学时(证书)审批', icon: 'table' }
      }
    ]
  },

  // 考试管理（拆分应用）
  {
    path: '/exam',
    component: Layout,
    redirect: '/exam/collect',
    name: 'Exam',
    meta: { title: '考试管理', icon: 'example' },
    children: [
      // 支持模拟题库训练、试卷可模糊搜索添加 ，需要为题目打tag
      // 目前对题库录入的要求较低，支持单选、多选、判断即可
      {
        path: 'collect',
        name: 'Collect',
        component: () => import('@/views/exam/collect'),
        meta: { title: '题库管理', icon: 'table' }
      },
      // 添加试卷，从题库中选题添加即可，提交题目id数组给后端即可生成试卷
      // 修改试卷，支持增删题目，但是不允许修改题目本身，修改题目只能从题库修改，保证数据唯一性
      // 试卷支持预览
      {
        path: 'page',
        name: 'Page',
        component: () => import('@/views/exam/page'),
        meta: { title: '试卷管理', icon: 'table' }
      }
    ]
  },

  // 系统管理
  {
    path: '/system',
    component: Layout,
    redirect: '/system/permisson/origin',
    name: 'Setting',
    meta: { title: '系统管理', icon: 'example' },
    children: [
      {
        path: 'permisson',
        name: 'Permisson',
        meta: { title: '权限管理' },
        component: () => import('@/views/system/permisson/index'), // Parent router-view
        children: [
          {
            path: 'origin',
            name: 'Origin',
            component: () => import('@/views/system/permisson/origin'),
            meta: { title: '机构管理', icon: 'table' }
          },
          {
            path: 'account',
            name: 'Account',
            component: () => import('@/views/system/permisson/account'),
            meta: { title: '帐号管理', icon: 'table' }
          },
          {
            path: 'role',
            name: 'Role',
            component: () => import('@/views/system/permisson/role'),
            meta: { title: '角色管理', icon: 'table' }
          }
        ]
      },
      {
        path: 'record',
        name: 'Record',
        meta: { title: '日志查看' },
        component: () => import('@/views/system/record/index'), // Parent router-view
        children: [
          {
            path: 'operate',
            name: 'Operate',
            component: () => import('@/views/system/record/operate'),
            meta: { title: '操作日志', icon: 'table' }
          },
          {
            path: 'pay',
            name: 'Pay',
            component: () => import('@/views/system/record/pay'),
            meta: { title: '支付日志', icon: 'table' }
          },
          {
            path: 'error',
            name: 'Error',
            component: () => import('@/views/system/record/error'),
            meta: { title: '错误日志', icon: 'table' }
          }
        ]
      }
    ]
  },

  // 404 page must be placed at the end !!!
  { path: '*', redirect: '/404', hidden: true }
]

const createRouter = () => new Router({
  // mode: 'history', // require service support
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRoutes
})

const router = createRouter()

// Detail see: https://github.com/vuejs/vue-router/issues/1234#issuecomment-357941465
export function resetRouter() {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher // reset router
}

export default router
