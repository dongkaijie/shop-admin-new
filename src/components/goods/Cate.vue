<template>
  <div>
       <!-- 面包屑 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 添加角色按钮 -->
      <el-row>
        <el-col>
        <el-button type="primary" @click="showAddCateDialog">添加角色</el-button>
        </el-col>
      </el-row>

      <!-- 表格 -->
      <tree :data="catelist"  :show-index="true" :columns="columns" :selection-type="false" :expand-type="false">
        <!-- slot-scope="scope"这里表示接收自定义插槽的数据 -->
        <template slot="isok" slot-scope="scope">
          <i class="el-icon-success" style="color:green" v-if="scope.row.cat_deleted === false"></i>
          <i class="el-icon-error" style="color:red" v-else></i>
      </template>
      <template slot="order" slot-scope="scope">
          <el-tag size="mini"
          v-if="scope.row.cat_level===0">一级</el-tag>
          <el-tag type="success" size="mini"
          v-else-if="scope.row.cat_level===1">二级</el-tag>
          <el-tag size="mini" type="warning"
          v-else>三级</el-tag>
      </template>
     <template slot="option">
       <el-button type="primary" icon="el-icon-edit" size="mini">编辑</el-button>
       <el-button type="danger" icon="el-icon-delete" size="mini">删除</el-button>
     </template>
      </tree>

      <!-- 分页 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="querInfo.pagenum"
        :page-sizes="[2, 5, 10, 20]"
        :page-size="querInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="this.total">
      </el-pagination>

      <!-- 添加分类弹出框 -->
      <el-dialog
        title="添加分类"
        :visible.sync="addCateDialogVisible"
        width="50%" 
        @close="addCateDialogClosed">
        <!-- 添加分类表单 -->
        <el-form :model="addCateForm" :rules="addCateFormRules" ref="addCateFormRef" label-width="100px">
          <el-form-item label="分类名称" prop="cat_name">
            <el-input v-model="addCateForm.cat_name"></el-input>
          </el-form-item>
          <el-form-item label="父级分类">
             <el-cascader
              v-model="selectedKeys"
              :options="parentCateList"
              expand-trigger="hover"
              :props="cascaderChange"
              @change="parentCateChanged"
              clearable
              >
            </el-cascader>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="addCateDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="addCate">确 定</el-button>
        </span>
      </el-dialog>
    </el-card>
  </div>
</template>
<script>
export default {
  data(){
    return {
      querInfo:{
        type:3,
        pagenum:1,
        pagesize:5
      },
      // 商品分类的数据列表
      catelist:[],
      // 分页
      total:0,
      // 为table指定列的定义
      columns:[{
          label:'分类名称',
          prop:'cat_name'
        },
        {
          label:'是否有效',
          // 当前定义的模板列以及模板名称
          type:'template',
          template:'isok'
        },
        {
          label:'排序',
          type:'template',
          template:'order'
        },
        {
          label:'操作',
          type:'template',
          template:'option'
        }
      ],
      // 控制显示与隐藏
      addCateDialogVisible:false,
      // 添加分类的表单数据
      addCateForm:{
        // 将要添加分类的名称
        cat_name:'',
        // 父级分类的id
        cat_pid:0,
        // 分类的等级
        cat_level:0
      },
      // 添加分类表单的验证对象
      addCateFormRules:{
        cat_name:[
          {required:true,message:'请输入分类名称',trigger:'blur'}
        ]
      },
      // 父级分类数组
      parentCateList:[],

      cascaderChange:{
        value:'cat_id',
        label:'cat_name',
        children:'children'
      },
      selectedKeys:[]

    }
  },
  created(){
    this.getCateList()
  },
  methods:{
    async getCateList(){
      const {data:res}= await this.$http.get('categories',{params:this.querInfo})
      console.log(res)
      if(res.meta.status!==200){
        return this.$message.error('请求商品分类失败')
      }
      this.$message.success('请求商品分类成功')
      // 赋值
        this.catelist= res.data.result
        this.total = res.data.total
        console.log(this.catelist)
    },

    // 监听pagesize改变
    handleSizeChange(newSize){
      this.querInfo.pagesize=newSize
      this.getCateList()
    },

    // 当前pagenum变化
    handleCurrentChange(newPage){
      this.querInfo.pagenum = newPage
      this.getCateList()
    },
    // 点击显示对话框
    showAddCateDialog(){
      // 先获取父级分类数据的列表
      this.getParentCateList()
      // 再展示出对话框
      this.addCateDialogVisible=true
    },

    // 获取父级分类的数据列表
   async getParentCateList(){
    const{data:res}= await this.$http.get('categories',{params:{type:2}})
    if(res.meta.status!==200){
      return this.$message.error('获取父级分类数据失败')
    }
    console.log(res.data)
      
    this.parentCateList=res.data
  },
  // 选择项发送变化触发这个函数
  parentCateChanged(){
    console.log(this.selectedKeys)
    // 如果数组length>0
    if(this.selectedKeys.length>0){
      // 父级id
      this.addCateForm.cat_pid = this.selectedKeys
      [this.selectedKeys.length-1]
      // 当前分类的等级赋值
      this.addCateForm.cat_level = this.selectedKeys.length
    }else{
      this.addCateForm.cat_pid = 0
      this.addCateForm.cat_level = 0
    }
  },

  // 点击按钮添加新的分类
  addCate(){
    this.$refs.addCateFormRef.validate(async valid =>{
      if(!valid) return 
      const {data:res}= await this.$http.post('categories',this.addCateForm)
      if(res.meta.status!==201) {return this.$message.error('请求添加分类失败')}
      this.$message.success('请求添加分类成功')
      this.getCateList()
      this.addCateDialogVisible=false
    })
  },

  // 重置表单
  addCateDialogClosed(){
    this.$refs.addCateFormRef.resetFields()
    this.selectedKeys=[]
    this.addCateForm.cat_pid = 0
    this.addCateForm.cat_level = 0
  }
  }
}
</script>
<style lang="less" scoped>
  .el-row{
    margin-bottom: 10px;
  }
  .el-cascader{
    width: 100%;
  }
</style>


