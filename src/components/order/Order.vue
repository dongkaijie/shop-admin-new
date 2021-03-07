<template>
  <div>
    <!-- 面包屑 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片 -->
    <el-card>
       <el-row :gutter="20">
        <el-col :span="12">
            <el-input placeholder="请输入内容"  clearable  >
              <el-button slot="append" icon="el-icon-search"></el-button>            
            </el-input>
        </el-col>
       </el-row>

       <!-- table表格 -->
       <el-table :data="orderlist" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="订单编号" prop="order_number"></el-table-column>
        <el-table-column label="订单价格" prop="order_price" width="110px"></el-table-column>
        <el-table-column label="是否付款" prop="order_pay" width="110px">
          <template slot-scope="scope">
            <el-tag type="success" v-if="scope.row.order_pay==='1'">已付款</el-tag>
            <el-tag type="danger" v-else>未付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="是否发现" prop="is_send" width="110px"></el-table-column>
        <el-table-column label="下单时间" prop="create_time" width="170px">
          <template slot-scope="scope">
            {{scope.row.create_time | dateFormat}}
          </template>
        </el-table-column>
         <el-table-column label="操作" width="130px">
          <template slot-scope="scope">
            <!-- 编辑 这里的scope.row.id 是传递id-->
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="showBox"></el-button>
            <!-- 删除 -->
            <el-button icon="el-icon-location" size="mini" type='success' @click="showProgress"></el-button>
          </template>
          </el-table-column>
       </el-table>

       <!-- 分页 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page=queryInfo.pagenum
        :page-sizes="[2, 5, 10, 20]"
        :page-size=queryInfo.pagesize
        layout="total, sizes, prev, pager, next, jumper"
        :total= total>
      </el-pagination>

      <!-- 编辑对话框 -->
      <el-dialog
        title="编辑对话框"
        :visible.sync="addressFormDialog"
        width="50%"
        @close="addressFormClosed">
        <!-- 表单 -->
        <el-form :model="addressForm" :rules="addressFormRules" ref="addressFormRef" label-width="100px">
          <el-form-item label="省市区/县" prop="address1">
            
              <!-- 级联选择器 -->
                <el-cascader
                  v-model="addressForm.address1"
                  :options="cityData">
                   
                </el-cascader>
            
            </el-form-item>
            <el-form-item label="详细地址" prop="address2">
            <el-input v-model="addressForm.address2"></el-input>
            </el-form-item>
        </el-form>
          
        <span slot="footer" class="dialog-footer">
          <el-button @click="addressFormDialog = false">取 消</el-button>
          <el-button type="primary" @click="addressFormDialog = false">确 定</el-button>
        </span>
      </el-dialog>


      <!-- 物流对话框 -->
      <el-dialog
        title="物流进度框"
        :visible.sync="progressDialogVisible"
        width="50%">
        <!-- 时间线 -->
        <el-timeline>
          <el-timeline-item
            v-for="(activity, index) in progressList"
            :key="index"
            :timestamp="activity.time">
            {{activity.context}}
          </el-timeline-item>
        </el-timeline>
      </el-dialog>
    </el-card>
  </div>

  
</template>
<script>
import cityData from './citydata.js'
export default {
  data(){
    return{
      queryInfo:{
        query:'',
        // 当前页码
        pagenum: 1,
        // 每页显示多少个数
        pagesize: 10
      },
      orderlist:[],
      total:0,
      addressFormDialog:false,
      addressForm:{
        address1:[],
        address2:""
      },
      addressFormRules:{
        address1:[
          {required:true,message:'请输入省市区县',trigger:'blur'}
        ],
        address2:[
          {required:true,message:'请输入详细地址',trigger:'blur'}
        ]
      },

      cityData,
      progressDialogVisible:false,
      progressList:[]

    }
  },
  created(){
    this.getOrderList()
  },
  methods:{
    // 获取列表数据
    async getOrderList(){
      const {data:res} = await this.$http.get('orders',{params:this.queryInfo})
       if(res.meta.status!==200){
          return this.$message.error('订单请求失败')
        }
          this.$message.success('订单请求成功')
          this.orderlist = res.data.goods
          console.log(this.orderlist)
          this.total=res.data.total
    },
    // 分页
    handleSizeChange(newSize){
      this.queryInfo.pagesize=newSize
      this.getOrderList()
    },
    handleCurrentChange(newPage){
      this.queryInfo.pagenum=newPage
      this.getOrderList()
    },

    // 显示编辑框
    showBox(){
      this.addressFormDialog=true
    },
    // 关闭对话框
    addressFormClosed(){
      this.$refs.addressFormRef.resetFields()
    },
    // 显示物流进度
    async showProgress(){
      this.progressDialogVisible=true
      const {data:res}=await this.$http.get('/kuaidi/1106975712662')
        if(res.meta.status!==200){
        return this.$message.error('请求进度失败')
      }
      this.$message.success('请求进度成功')
      this.progressList= res.data
      console.log(this.progressList)
    }
    
  }
}
</script>
<style lang="less" scoped>
@import './timeline/timeline.css';
@import './timeline-item/timeline-item.css';
  .el-cascader{
    width: 100%;
  }
</style>


