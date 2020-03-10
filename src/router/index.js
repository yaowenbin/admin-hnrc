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

  // 财务管理 -- 核心模块 -- 涉及双方对账，
  {
    path: '/',
    component: Layout,
    redirect: '/finance',
    meta: { title: '订单管理', icon: 'example' },
    children: [
      // 订单从理论上来说，不允许删除，涉及到财务对账
      // 状态 完成、待支付、取消失效、退费
      {
        path: 'finance',
        name: 'Finance',
        component: () => import('@/views/finance/order'),
        meta: { title: '订单列表', icon: 'dashboard' }
      },
      // 发票这里采用电子发票or实体发票？类似滴滴，邮箱发送电子发票 -- 接入第三方开票平台 即可实现用户自主开票
      // 优化客户端开票流程，购买商品时填写发票信息，支付成功为订单生成一个发票（个人、单位），用户可下载发票or发送到指定邮箱
      {
        path: 'ticket',
        name: 'Ticket',
        component: () => import('@/views/finance/ticket'),
        meta: { title: '发票配送', icon: 'dashboard' }
      }
    ]
  },

  // 运营工具 === 偷懒工具 文案、图标、banner等丢给运营维护
  // {
  //   path: '/operate',
  //   component: Layout,
  //   redirect: '/operate/portal',
  //   meta: { title: '运营工具', icon: 'example' },
  //   children: [
  //     {
  //       path: 'portal',
  //       meta: { title: '站点管理' },
  //       component: () => import('@/views/operate/portal/index'), // Parent router-view
  //       children: [
  //         // 网站名称、 logo、公众号二维码 脚注信息、是否打开网站、导航、seo设置、
  //         {
  //           path: 'nav',
  //           component: () => import('@/views/operate/news'),
  //           meta: { title: '基本设置', icon: 'table' }
  //         },
  //         {
  //           path: 'news',
  //           name: 'News',
  //           component: () => import('@/views/operate/news'),
  //           meta: { title: '短信模板', icon: 'table' }
  //         },
  //         {
  //           path: 'news',
  //           name: 'News',
  //           component: () => import('@/views/operate/news'),
  //           meta: { title: '网站通告', icon: 'table' }
  //         }

  //       ]
  //     },
  //     {
  //       path: 'content',
  //       meta: { title: '内容管理' },
  //       component: () => import('@/views/operate/content/index'), // Parent router-view
  //       children: [
  //         {
  //           path: 'news',
  //           name: 'News',
  //           component: () => import('@/views/operate/news'),
  //           meta: { title: '证书模板', icon: 'table' }
  //         },
  //         {
  //           path: 'news',
  //           name: 'News',
  //           component: () => import('@/views/operate/news'),
  //           meta: { title: 'banner广告', icon: 'table' }
  //         }
  //       ]
  //     }
  //   ]
  // },

  // 学员管理
  // {
  //   path: '/approve',
  //   component: Layout,
  //   redirect: '/approve/role',
  //   name: 'Exam',
  //   meta: { title: '学员管理', icon: 'example' },
  //   children: [
  //     // 支持模拟题库训练、试卷可模糊搜索添加 ，需要为题目打tag
  //     // 目前对题库录入的要求较低，支持单选、多选、判断即可
  //     // 修改、查询用户信息的唯一入口
  //     // 新增用户这种操作，是否应该屏蔽，添加学员账户不允许、添加管理账户可通过系统配置新增
  //     {
  //       path: 'role',
  //       name: 'Role',
  //       component: () => import('@/views/approve/role'),
  //       meta: { title: '学员列表', icon: 'table' }
  //     },
  //     // 目前系统不支持线下报名，通过人工导入表格，容易出错效率也低
  //     {
  //       path: 'role',
  //       name: 'Role',
  //       component: () => import('@/views/approve/role'),
  //       meta: { title: '线下报名', icon: 'table' }
  //     },
  //     {
  //       path: 'role',
  //       name: 'Role',
  //       component: () => import('@/views/approve/role'),
  //       meta: { title: '学时审批', icon: 'table' }
  //     }
  //   ]
  // },

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

  // 审核系统：开班、班级关联课程（分配学时、考试）、申请证书（获取学时）均需要二次审核
  // 学时策略有疑问！！
  // {
  //   path: '/approve',
  //   component: Layout,
  //   redirect: '/approve/role',
  //   name: 'Exam',
  //   meta: { title: '审核管理', icon: 'example' },
  //   children: [
  //     // 支持模拟题库训练、试卷可模糊搜索添加 ，需要为题目打tag
  //     // 目前对题库录入的要求较低，支持单选、多选、判断即可
  //     {
  //       path: 'role',
  //       name: 'Role',
  //       component: () => import('@/views/approve/role'),
  //       meta: { title: '帐号审批', icon: 'table' }
  //     }, {
  //       path: 'role',
  //       name: 'Role',
  //       component: () => import('@/views/approve/role'),
  //       meta: { title: '帐号审批', icon: 'table' }
  //     }
  //   ]
  // },

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
            path: 'user',
            name: 'User',
            component: () => import('@/views/system/permisson/user'),
            meta: { title: '用户管理', icon: 'table' }
          },
          // 面向b端仅需要录入资料，面向c端，需要增加讲师招募、设置分润、信息审核
          {
            path: 'teacher',
            name: 'Teacher',
            component: () => import('@/views/system/permisson/teacher'),
            meta: { title: '师资管理', icon: 'table' }
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
