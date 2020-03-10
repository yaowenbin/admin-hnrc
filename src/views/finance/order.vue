<template>
  <div class="app-container">
    <div class="filter-container">
      <!-- 时间段 -->
      <el-date-picker
        v-model="listQuery.startTime"
        type="datetime"
        placeholder="选择开始时间"
        align="right"
        class="filter-item"
        style="width: 200px;"
        :picker-options="pickerOptions"
      />
      <el-date-picker
        v-model="listQuery.endTime"
        type="datetime"
        placeholder="选择结束时间"
        align="right"
        class="filter-item"
        style="width: 200px;"
        :picker-options="pickerOptions"
      />
      <!-- 机构id -->
      <el-cascader
        v-model="listQuery.orgId"
        placeholder="所在地区"
        :options="origin"
        class="filter-item"
        style="width: 200px;"
        @change="filterOrg"
      />
      <!-- 单位 -->
      <el-autocomplete
        v-model="listQuery.unit"
        :fetch-suggestions="queryUnitAsync"
        placeholder="所在单位"
        style="width: 200px;"
        class="filter-item"
        @select="filterUnit"
      />
      <!-- 姓名 -->
      <el-autocomplete
        v-model="listQuery.user"
        :fetch-suggestions="queryUserAsync"
        placeholder="姓名/身份证"
        style="width: 200px;"
        class="filter-item"
        @select="filterUser"
      />
      <!-- 支付渠道 -->
      <el-select v-model="listQuery.channel" style="width: 200px;" class="filter-item" placeholder="支付渠道">
        <el-option
          v-for="item in payType"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
      <!-- 订单状态分类：https://www.pmcaff.com/discuss/index/1000000000145961?pmc_param=1 -->
      <el-select v-model="listQuery.statu" style="width: 200px;" class="filter-item" placeholder="订单状态">
        <el-option
          v-for="item in statuType"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
      <!-- 订单号 客户复制 or 客服手打？ 客服习惯这功能嘛？？-->
      <!-- <el-input v-model="listQuery.id" placeholder="订单号" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" /> -->

      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        搜索
      </el-button>

      <el-button v-waves :loading="downloadLoading" class="filter-item" type="primary" icon="el-icon-download" @click="handleDownload">
        导出
      </el-button>
    </div>

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
      <el-table-column label="订单号" width="150px" align="center">
        <template slot-scope="scope">
          {{ scope.row.timestamp }}
        </template>
      </el-table-column>
      <!-- 交易状态 支付状态能否合并？ -->
      <el-table-column label="状态" width="110px" align="center">
        <template slot-scope="{row}">
          <el-tag :type="row.status | statusFilter">
            {{ row.status| statusTxtFilter }}
          </el-tag>
        </template>
      </el-table-column>
      <!-- 红色高亮 -->
      <el-table-column label="金额" width="80px" align="center">
        <template>
          <span style="color:red">$100</span>
        </template>
      </el-table-column>
      <el-table-column label="支付方式" width="110px" align="center">
        <template>
          支付宝
        </template>
      </el-table-column>
      <el-table-column label="开具发票" width="110px" align="center">
        <template>
          是
        </template>
      </el-table-column>
      <el-table-column label="支付时间" width="200px" align="center">
        <template slot-scope="scope">
          {{ scope.row.display_time }}
        </template>
      </el-table-column>
      <el-table-column label="商品名" width="200px">
        <template>
          《西方政治学》 <el-tag>班级</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="机构" width="150px">
        <template>
          湖南省-株洲市-天元区
        </template>
      </el-table-column>
      <el-table-column label="单位" width="150px">
        <template>
          湖南新领航检测技术有限公司
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
          <el-button :disabled="row.status!='draft'" size="mini" @click="handleModifyStatus(row,'draft')">
            详情
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />

    <!-- 修改订单 这种神操作  是否应该继续保留 -->
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="70px" style="width: 400px; margin-left:50px;">
        <el-form-item label="Type" prop="type">
          <el-select v-model="temp.type" class="filter-item" placeholder="Please select">
            <el-option v-for="item in calendarTypeOptions" :key="item.key" :label="item.display_name" :value="item.key" />
          </el-select>
        </el-form-item>
        <el-form-item label="Date" prop="timestamp">
          <el-date-picker v-model="temp.timestamp" type="datetime" placeholder="Please pick a date" />
        </el-form-item>
        <el-form-item label="Title" prop="title">
          <el-input v-model="temp.title" />
        </el-form-item>
        <el-form-item label="Status">
          <el-select v-model="temp.status" class="filter-item" placeholder="Please select">
            <el-option v-for="item in statusOptions" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>

      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
          Cancel
        </el-button>
        <el-button type="primary" @click="dialogStatus==='create'?createData():updateData()">
          Confirm
        </el-button>
      </div>
    </el-dialog>

    <el-dialog :visible.sync="dialogPvVisible" title="Reading statistics">
      <el-table :data="pvData" border fit highlight-current-row style="width: 100%">
        <el-table-column prop="key" label="Channel" />
        <el-table-column prop="pv" label="Pv" />
      </el-table>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="dialogPvVisible = false">Confirm</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { fetchOrderList } from '@/api/order'
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
      showReviewer: false,
      temp: {
        id: undefined,
        importance: 1,
        remark: '',
        timestamp: new Date(),
        title: '',
        type: '',
        status: 'published'
      },
      dialogFormVisible: false,
      dialogStatus: '',

      textMap: {
        editor: '编辑'
      },
      dialogPvVisible: false,
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
      // 查询条件均由后端返回
      pickerOptions: {
        shortcuts: [{
          text: '今天',
          onClick(picker) {
            picker.$emit('pick', new Date())
          }
        }, {
          text: '昨天',
          onClick(picker) {
            const date = new Date()
            date.setTime(date.getTime() - 3600 * 1000 * 24)
            picker.$emit('pick', date)
          }
        }, {
          text: '一周前',
          onClick(picker) {
            const date = new Date()
            date.setTime(date.getTime() - 3600 * 1000 * 24 * 7)
            picker.$emit('pick', date)
          }
        }]
      },
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
      payType: [{
        value: '1',
        label: '微信-h5'
      }, {
        value: '2',
        label: '支付宝-h5'
      }, {
        value: '3',
        label: '微信-pc'
      }, {
        value: '4',
        label: '支付宝-pc'
      }, {
        value: '5',
        label: '微信-小程序'
      }, {
        value: '6',
        label: '管理员开通'
      }, {
        value: '7',
        label: '线下支付'
      }],
      // 是否考虑实物商品
      statuType: [{
        value: '1',
        label: '待支付'
      }, {
        value: '2',
        label: '已取消' // 待支付订单可取消
      }, {
        value: '3',
        label: '已支付'
      }, {
        value: '4',
        label: '已退款' // 退款渠道 - 客服退款 or 客户端主动申请 人工审核
      }, {
        value: '5',
        label: '已失效' // 24小时订单失效
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

      fetchOrderList(this.listQuery).then(response => {
        this.list = response.data.items
        this.total = response.data.total

        // Just to simulate the time of the request
        setTimeout(() => {
          this.listLoading = false
        }, 1.5 * 1000)
      })
    },
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

    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          this.temp.id = parseInt(Math.random() * 100) + 1024 // mock a id
          this.temp.author = 'vue-element-admin'
          createArticle(this.temp).then(() => {
            this.list.unshift(this.temp)
            this.dialogFormVisible = false
            this.$notify({
              title: 'Success',
              message: 'Created Successfully',
              type: 'success',
              duration: 2000
            })
          })
        }
      })
    },
    // 编辑订单
    handleUpdate(row) {
      // 注入表单数据
      this.temp = Object.assign({}, row) // copy obj
      this.temp.timestamp = new Date(this.temp.timestamp)

      this.dialogStatus = 'editor'
      this.dialogFormVisible = true

      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.temp)
          tempData.timestamp = +new Date(tempData.timestamp) // change Thu Nov 30 2017 16:41:05 GMT+0800 (CST) to 1512031311464
          updateArticle(tempData).then(() => {
            for (const v of this.list) {
              if (v.id === this.temp.id) {
                const index = this.list.indexOf(v)
                this.list.splice(index, 1, this.temp)
                break
              }
            }
            this.dialogFormVisible = false
            this.$notify({
              title: 'Success',
              message: 'Update Successfully',
              type: 'success',
              duration: 2000
            })
          })
        }
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
