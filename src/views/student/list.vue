<template>
  <div class="app-container">
    <!-- // TODO: 学员用户不允许后台创建，管理系统账户创建放系统配置内，超级管理员才能创建 -->
    <div class="filter-container">
      <!-- 机构id -->
      <el-cascader
        v-model="listQuery.orgId"
        placeholder="所在地区"
        :options="origin"
        class="filter-item"
        style="width: 200px;"
        @change="filterOrg"
      />

      <!-- 姓名 -->
      <el-autocomplete
        v-model="listQuery.name"
        :fetch-suggestions="queryUserAsync"
        placeholder="用户名/姓名/身份证"
        style="width: 200px;"
        class="filter-item"
        @select="filterUser"
      />
      <!-- 手机号 -->
      <el-autocomplete
        v-model="listQuery.phone"
        :fetch-suggestions="queryUserAsync"
        placeholder="手机号"
        style="width: 200px;"
        class="filter-item"
        @select="filterUser"
      />

      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        搜索
      </el-button>

      <el-button v-waves :loading="downloadLoading" class="filter-item" type="primary" icon="el-icon-download" @click="handleDownload">
        导出
      </el-button>
    </div>
    <!-- 用户名 、密码弱化 -->
    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%;"
    >
      <el-table-column label="序号" width="70px" align="center">
        <template slot-scope="scope">
          {{ scope.row.id }}
        </template>
      </el-table-column>
      <el-table-column label="用户名" width="150px" align="center">
        <template slot-scope="scope">
          {{ scope.row.userName }}
        </template>
      </el-table-column>
      <el-table-column label="姓名" width="110px" align="center">
        <template slot-scope="{row}">
          {{ row.cardName }}
        </template>
      </el-table-column>
      <el-table-column label="电话" width="150px" align="center">
        <template slot-scope="{row}">
          <span style="color:red">${{ row.phone }}</span>
        </template>
      </el-table-column>
      <el-table-column label="身份证" width="200px" align="center">
        <template slot-scope="{row}">
          {{ row.cardId }}
        </template>
      </el-table-column>
      <el-table-column label="注册时间" width="200px">
        <template slot-scope="{row}">
          {{ row.registerTm }}
        </template>
      </el-table-column>
      <el-table-column label="机构" min-width="200px">
        <template slot-scope="{row}">
          {{ row.orgNm }}
        </template>
      </el-table-column>

      <el-table-column label="操作" align="center" width="250px" class-name="small-padding fixed-width">
        <template slot-scope="{row}">
          <!-- 按钮权限 由列表返回 -->
          <el-button type="primary" size="mini" @click="handleUpdate(row)">
            编辑
          </el-button>
          <el-button :disabled="row.status!='published'" size="mini" type="success" @click="handleModifyStatus(row,'published')">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />

    <!-- 编辑修改 | 详情预览 -->
    <!-- 用户信息应保持统一，所有接口均需要从用户中心查询 -->
    <!-- 1. 未绑定手机的用户，账密登录后要求绑定手机，校验设备，异地登录也需要验证手机号
         2. 用户端可解绑和绑定，需原手机可用
         3. 若原手机不可用，则需联系客服后台修改
         4. 不允许修改性别，所有性别均以身份证识别为主
         5. 选填信息，只预览，管理端不允许修改
         6. 展示头像信息 -->
    <el-dialog :title="'编辑'" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="70px" style="width: 400px; margin-left:50px;">
        <el-form-item label="用户名" prop="userName">
          <el-input v-model="temp.userName" :disabled="true" />
        </el-form-item>
        <el-form-item label="密码" prop="userName">
          <el-input v-model="temp.passWord" :disabled="true" />
        </el-form-item>
        <el-form-item label="机构">
          <el-cascader
            :placeholder="temp.orgNm"
            :options="origin"
            class="filter-item"
            style="width: 200px;"
            @change="filterOrg"
          />
        </el-form-item>
      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
          取消
        </el-button>
        <el-button type="primary" @click="dialogFormVisible===false">
          确认
        </el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>
import waves from '@/directive/waves' // waves directive
import { parseTime } from '@/utils'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination

// 标签过滤
const calendarTypeOptions = [
  { key: 'CN', display_name: 'China' },
  { key: 'US', display_name: 'USA' },
  { key: 'JP', display_name: 'Japan' },
  { key: 'EU', display_name: 'Eurozone' }
]

// arr to obj, such as { CN : "China", US : "USA" }
const calendarTypeKeyValue = calendarTypeOptions.reduce((acc, cur) => {
  acc[cur.key] = cur.display_name
  return acc
}, {})

export default {
  name: 'ComplexTable',
  components: { Pagination },
  directives: { waves },
  filters: {
    // 状态过滤
    statusTxtFilter(status) {
      const statusMap = {
        published: '已付款',
        draft: '已取消',
        deleted: '待支付'
      }
      return statusMap[status]
    },
    statusFilter(status) {
      const statusMap = {
        published: 'success',
        draft: 'info',
        deleted: 'danger'
      }
      return statusMap[status]
    },
    typeFilter(type) {
      return calendarTypeKeyValue[type]
    }
  },
  data() {
    return {
      tableKey: 0,
      calendarTypeOptions,
      statusOptions: ['published', 'draft', 'deleted'],

      temp: {
        id: 1,
        phone: '152312312',
        passWord: '123456', // 用户数据加密
        userName: 'wbe123',
        cardName: '好好',
        cardId: '330582934923492',
        registerTm: '2019-02-02 18:00:00',
        orgNm: '湖南省-株洲市-天元区'
      },
      dialogFormVisible: false,
      dialogStatus: '',

      pvData: [],
      rules: {
        type: [{ required: true, message: 'type is required', trigger: 'change' }],
        timestamp: [{ type: 'date', required: true, message: 'timestamp is required', trigger: 'change' }],
        title: [{ required: true, message: 'title is required', trigger: 'blur' }]
      },
      downloadLoading: false,

      // 单位模糊搜索
      unitResult: [],
      userResult: [],
      state: '',
      timeout: null,

      origin: [{
        value: '1',
        label: '长沙',
        children: [{
          value: '12',
          label: '雨花区'
        }, {
          value: '13',
          label: '天心区'
        }]
      }],

      list: null,
      total: 0,
      listLoading: true,
      // 查询参数
      listQuery: {
        page: 1,
        limit: 20,
        importance: undefined,
        title: undefined,
        type: undefined,
        sort: '+id',
        startTime: '',
        endTime: ''
      }
    }
  },
  created() {
    this.getList()
  },
  mounted() {
    // 输入建议，可模糊匹配内容，监听change即可
    this.unitResult = this.loadAllUnit()
    this.userResult = this.loadAllUser()
  },
  methods: {
    // 管理系统 检索引擎的选择？
    /* ---------------- 单位枚举 -- 按搜索热度排序，支持模糊搜索 start------------*/
    // 选中候选组
    filterUnit(item) {
      this.listQuery.unit = item.value
    },
    // 用户名|身份证|姓名
    filterUser(item) {
      console.log(item)
      this.listQuery.user = item.value
    },
    // 机构
    filterOrg(item) {
      this.listQuery.orgId = item[1]
    },
    // 模糊匹配单位
    queryUnitAsync(queryString, cb) {
      var unitResult = this.unitResult
      var results = queryString ? unitResult.filter(this.createStateFilter(queryString)) : unitResult

      clearTimeout(this.timeout)

      this.timeout = setTimeout(() => {
        cb(results)
      }, 1000)
    },
    // 模糊匹配姓名/身份证
    queryUserAsync(queryString, cb) {
      var userResult = this.userResult
      var results = queryString ? userResult.filter(this.createStateFilter(queryString)) : userResult

      clearTimeout(this.timeout)

      this.timeout = setTimeout(() => {
        cb(results)
      }, 1000)
    },
    // 公共函数
    createStateFilter(queryString) {
      return (state) => {
        return (state.value.toLowerCase().indexOf(queryString.toLowerCase()) === 0)
      }
    },
    // 远程获取单位数据 -- 需作节流处理
    loadAllUnit() {
      return [
        { 'value': '湖南工业职业技术学院', 'sortId': '1' },
        { 'value': '长沙市生态环境局天心分局', 'sortId': '2' },
        { 'value': '湖南湘钢洪盛物流有限公司', 'sortId': '3' },
        { 'value': '武冈市人民医院', 'sortId': '4' },
        { 'value': '湖南城市学院', 'sortId': '5' },
        { 'value': '邵阳市人民政府房屋征收办', 'sortId': '6' }
      ]
    },
    loadAllUser() {
      return [
        { 'value': '张三', 'sortId': '1' },
        { 'value': '李四', 'sortId': '2' },
        { 'value': '赵武', 'sortId': '3' }
      ]
    },
    /* ---------------- 单位枚举 -- 按搜索热度排序，支持模糊搜索 end------------*/

    // 匹配列表数据
    getList() {
      this.listLoading = true

      // 字段设计 -- 对应表字段
      this.list = [{
        id: 1,
        phone: '152312312',
        userName: 'wbe123',
        cardName: '好好',
        cardId: '330582934923492',
        registerTm: '2019-02-02 18:00:00',
        orgNm: '湖南省-株洲市-天元区'
      }]
      this.total = 100

      // Just to simulate the time of the request
      setTimeout(() => {
        this.listLoading = false
      }, 1.5 * 1000)
    },

    // 分页
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },

    // 删除订单
    handleModifyStatus(row, status) {
      this.$message({
        message: '操作Success',
        type: 'success'
      })
      row.status = status
    },

    // 编辑订单
    handleUpdate(row) {
      // 注入表单数据
      this.temp = Object.assign({}, row) // copy obj
      this.temp.timestamp = new Date(this.temp.timestamp)

      this.dialogFormVisible = true

      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },

    // 导出exel
    handleDownload() {
      this.downloadLoading = true
      import('@/vendor/Export2Excel').then(excel => {
        const tHeader = ['timestamp', 'title', 'type', 'importance', 'status']
        const filterVal = ['timestamp', 'title', 'type', 'importance', 'status']
        const data = this.formatJson(filterVal, this.list)
        excel.export_json_to_excel({
          header: tHeader,
          data,
          filename: 'table-list'
        })
        this.downloadLoading = false
      })
    },

    // 格式化日期
    formatJson(filterVal, jsonData) {
      return jsonData.map(v => filterVal.map(j => {
        if (j === 'timestamp') {
          return parseTime(v[j])
        } else {
          return v[j]
        }
      }))
    }
  }
}
</script>
