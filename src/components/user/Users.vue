<template>
  <div>
    <!-- 面包屑 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 输入框 -->
      <el-row :gutter="20">
        <el-col :span="12">
            <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getUserList">
              <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
            </el-input>
        </el-col>
        <!-- 添加用户 -->
        <el-col :span="4">
          <el-button type="primary" @click="addDialogVisible =true">添加用户</el-button>
        </el-col>
      </el-row>
      <!-- 用户列表区域 -->
      <el-table :data="userlist" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="姓名" prop="username"></el-table-column>
        <el-table-column label="邮箱" prop="email"></el-table-column>
        <el-table-column label="电话" prop="mobile"></el-table-column>
        <el-table-column label="角色" prop="role_name"></el-table-column>
        <el-table-column label="状态" >
          <template slot-scope="scope">
            <!-- {{scope.row}} -->
            <el-switch
              v-model="scope.row.mg_state" @change="userStateChanged(scope.row)">
            </el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="190px">
          <template slot-scope="scope">
            <!-- 编辑 这里的scope.row.id 是传递id-->
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.id)"></el-button>
            <!-- 删除 -->
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeUserById(scope.row.id)"></el-button>
            <!-- 分配角色 -->
            <el-tooltip effect="dark" content="分配角色" placement="top" :enterable="false">
              <el-button type="warning" icon="el-icon-setting" size="mini"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
        <div class="block">
          <el-pagination
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="queryInfo.pagenum"
            :page-sizes="[1 , 2 , 5, 10]"
            :page-size="queryInfo.pagesize"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total">
          </el-pagination>
        </div>


      <!-- 添加用户对话框 -->
      <el-dialog
        title="添加用户"
        :visible.sync="addDialogVisible"
        width="50%" @close="addDialogClosed">
        
        <!-- 主题区域 -->
        <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="70px">
          <el-form-item label="用户名" prop="username">
            <el-input v-model="addForm.username"></el-input>
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input v-model="addForm.password"></el-input>
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="addForm.email"></el-input>
          </el-form-item>
          <el-form-item label="手机" prop="mobile">
            <el-input v-model="addForm.mobile"></el-input>
          </el-form-item>
        </el-form>
        <!-- 底部区域 -->
        <span slot="footer" class="dialog-footer">
          <el-button @click="addDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="addUser">确 定</el-button>
        </span>
      </el-dialog>

      <!-- 编辑用户对话框 -->
      <el-dialog
        title="编辑用户"
        :visible.sync="editDialogVisible"
        width="50%" @close="editDialogClosed">
        <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="70px">
          <el-form-item label="用户名">
            <el-input v-model="editForm.username" disabled></el-input>
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="editForm.email"></el-input>
          </el-form-item>
          <el-form-item label="电话" prop="mobile">
            <el-input v-model="editForm.mobile"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="editDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="editUserInfo">确 定</el-button>
        </span>
      </el-dialog>

      <!-- 提示信息 -->

    </el-card>
  </div>

</template>
<script>
export default {
  data(){

    return{
      // 用户列表参数对象 queryInfo
      queryInfo:{
        query:'',
        // 当前页码
        pagenum: 1,
        // 每页显示多少个数
        pagesize: 10
      },
      userlist:[],
      total:0,
      // 控制添加用户对话框的显示与隐藏
      addDialogVisible:false,
      
      // 添加用户的表单数据
      addForm:{
        username:'',
        password:'',
        email:'',
        mobile:''
      },
      // 添加表单的验证规则对象
      addFormRules:{
        username:[
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
        ],
        password:[
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 3, max: 9, message: '长度在 3 到 9 个字符', trigger: 'blur' }
        ],
        email:[
            { required: true,message: '请输入邮箱', trigger: 'blur' },
            {pattern: /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,message: '请输入正确邮箱格式', trigger: 'blur'} 
        ],
        mobile:[
           { required: true, message: '请输入电话号码', trigger: 'blur' },
           {pattern: /^(?:(?:\+|00)86)?1(?:(?:3[\d])|(?:4[5-7|9])|(?:5[0-3|5-9])|(?:6[5-7])|(?:7[0-8])|(?:8[\d])|(?:9[1|8|9]))\d{8}$/,message: '请输入正确电话格式',trigger: 'blur'}
        ]
      },
      // 控制编辑用户对话框的显示与隐藏
       editDialogVisible:false,
      // 查询用户的信息对象
       editForm:{
         username:'',
         email:'',
         mobile:''
       },
      //  修改表单的验证规则对象
       editFormRules:{
        email:[
            { required: true,message: '请输入邮箱', trigger: 'blur' },
            {pattern: /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,message: '请输入正确邮箱格式', trigger: 'blur'} 
        ],
        mobile:[
           { required: true, message: '请输入电话号码', trigger: 'blur' },
           {pattern: /^(?:(?:\+|00)86)?1(?:(?:3[\d])|(?:4[5-7|9])|(?:5[0-3|5-9])|(?:6[5-7])|(?:7[0-8])|(?:8[\d])|(?:9[1|8|9]))\d{8}$/,message: '请输入正确电话格式',trigger: 'blur'}
        ]
       }
    }
  },
    created(){
      this.getUserList()
    },
    methods:{
      // 更新列表
      async getUserList(){
        const {data:res}=await this.$http.get('users',{params:this.queryInfo})
        // console.log(res)
        if(res.meta.status!==200) return this.$message.error('获取用户列表请求失败')
        this.userlist= res.data.users
        this.total = res.data.total
      },

      // 监听pagesize 改变的事件
      handleSizeChange(newsize){
        this.queryInfo.pagesize=newsize
        this.getUserList()
      },
      // 监听页码值改变的事件
      handleCurrentChange(newPage){
        this.queryInfo.pagenum=newPage
        this.getUserList()
      },
      // 监听switch开关状态改变
      async userStateChanged(userinfo){
        console.log(userinfo)
        // 拿到最新状态值调用API接口，保存用户最新状态
        const{data:res}=await this.$http.put(`users/${userinfo.id}/state/${userinfo.mg_state}`)
        console.log(res)
        if(res.meta.status!==200) {
          userinfo.mg_state =!userinfo.mg_state //取反保证页面状态没有变化
          return this.$message.error('更新用户状态失败')
        }
        this.$message.success('更新用户状态成功')
      },


      // 监听添加用户对话框的关闭时间
      addDialogClosed(){
        this.$refs.addFormRef.resetFields()
      },

      //点击按钮添加新用户
       addUser(){
        this.$refs.addFormRef.validate(async valid=>{
          console.log(valid)
          if(!valid) return 
          // 可以发送真正的网络请求
          const{data:res}= await this.$http.post('users',this.addForm)
          console.log(res)
          if(res.meta.status!==201){
            this.$message.error('添加任务失败')
            return
          }
            this.$message.success('添加任务成功')
            // 隐藏对话框
            this.addDialogVisible=false,
            // 重新获取用户的列表
          this.getUserList()
        })
      },

      // 展示编辑用户对话框  这里的id是接收的id
      async showEditDialog(id){
        this.editDialogVisible= true
        // console.log(id)
        const{data:res}= await this.$http.get('users/' + id)
        if(res.meta.status!==200) return this.$message.error('查询失败')
        this.$message.success('查询成功')
        this.editForm=res.data
        console.log(res)
      },
      // 重置编辑框
      editDialogClosed(){
        this.$refs.editFormRef.resetFields()
      },
      // 修改用户信息点击确定
       editUserInfo(){
        this.$refs.editFormRef.validate(async valid=>{
          console.log(valid)
          if(!valid) return this.$message('请输入正确格式')
          // 发起请求
          const {data:res}=await this.$http.put('users/' + this.editForm.id,
            this.editForm
          )
          console.log(res)
          if(res.meta.status!==200) return this.$message.error('更新用户信息失败')
          // 提示成功
          this.$message.success('更新用户信息成功')
          // 关闭对话框
          this.editDialogVisible= false
          // 刷新列表
          this.getUserList
        })
      },

      // 提示信息 res返回的是promise所以用async await
      async removeUserById(id){
        console.log(id)
        const comfirmResult = await this.$confirm('此操作是否将永久删除该用户, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(err=>  err)
        console.log(comfirmResult)
        

        if(comfirmResult!== 'confirm') {
          return this.$message.info('已取消删除')
        }
        
        const { data:res}= await this.$http.delete('users/' + id)
        console.log(res)
        if(res.meta.status!==200){
          return this.$message.error('删除任务失败')
        }
        this.$message.success('删除任务成功')
        this.getUserList()
      }
    } 
}
</script>
<style lang="less" scoped>

</style>
