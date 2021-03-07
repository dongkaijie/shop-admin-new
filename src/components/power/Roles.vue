<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card>
      <!-- 添加角色按钮 -->
      <el-row>
        <el-col>
        <el-button type="primary">添加角色</el-button>
        </el-col>
      </el-row>
      <!-- 列表 -->
      <el-table :data="rolesList" border stripe>
        <el-table-column type="expand">
          <!-- 拿数据 -->
          <template slot-scope="scope">
            <el-row   :class="['bdbottom',i1===0?'bdtop':'','hcenter']" v-for="(item1,i1) in scope.row.children" :key="item1.id">
              <!-- 渲染一级权限 -->
              <el-col :span="5">
               <el-tag closable @close="removeRightsById(scope.row,item1.id)">{{item1.authName}}</el-tag> 
               <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 渲染二级三级权限 -->
              <el-col :span="19">
                <!-- 通过for循环嵌套二级权限 -->
                <el-row :class="[i2===0?'':'bdtop']" v-for="(item2,i2) in item1.children" :key="item2.id">
                  <el-col :span="6">
                    <el-tag type="success" closable @close="removeRightsById(scope.row,item2.id)">{{item2.authName}}</el-tag> 
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18"> 
                        <el-tag v-for="(item3) in item2.children" closable 
                        :key="item3.id" type="warning" @close="removeRightsById(scope.row,item3.id)">{{item3.authName}}</el-tag> 
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
            <!-- <pre>
              {{scope.row}}
            </pre> -->
          </template>
        </el-table-column>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作" width="300px">
           <template slot-scope="scope">
            <!-- 编辑 这里的scope.row.id 是传递id-->
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.id)">编辑</el-button>
            <!-- 删除 -->
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeUserById(scope.row.id)">删除</el-button>
            <!-- 分配角色 -->
            <el-button type="warning" icon="el-icon-setting" size="mini" @click="showSetRightDialog(scope.row)">分配角色</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分配权限对话框 -->
      <el-dialog
        title="分配权限对话框"
        :visible.sync="setRightDialogVisible"
        width="50%"
        @close="setRightDialogClosed">
        <el-tree
          :data="rightsList"
          show-checkbox
          default-expand-all
          node-key="id"
          ref="treeRef"
          highlight-current
          :props="treetProps"
          :default-checked-keys="defkeys">
        </el-tree>
        <span slot="footer" class="dialog-footer">
          <el-button @click="setRightDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="allotRights">确 定</el-button>
        </span>
      </el-dialog>
    </el-card>
  </div>
</template>
<script>
export default {
  data(){
    return {
      rolesList:[],
      // 控制对话框的显示和隐藏
      setRightDialogVisible:false,
      rightsList:[],
      // 树型控件的属性绑定对象
      treetProps:{
        children:'children',
        label:'authName'
      },
      // 默认选中的节点Id值数组
      defkeys:[],

      // 当前即将分配权限的角色id
      roleId:''

    }
  },
  created(){
    this.getRolesList()
    
  },
  methods:{
     async getRolesList(){
       const{data:res}=await this.$http.get('roles')
       if(res.meta.status!==200) return this.$message.error('角色请求失败')
       this.$message.success('角色请求成功')
       this.rolesList=res.data
      //  console.log(this.rolesList)

    },
    // 根据id来删除对应的权限
    async removeRightsById(role,rightId){
      // 弹框提示用户是否要删除
      const comfirmResult = await this.$confirm('此操作是否将永久删除该用户, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(err=>  err)
        // console.log(comfirmResult)
        if(comfirmResult!== 'confirm') {
          return this.$message.info('已取消删除')
        }
        // console.log('确认了删除')
        const {data:res}=await this.$http.delete(`roles/${role.id}/rights/${rightId}`)
        console.log(res.data)
        if(res.meta.status!==200){
          return this.$message.error('删除权限失败')
        }
         this.$message.success('删除权限成功')
        //  this.getRolesList()
        // 防止整个列表刷新
        role.children= res.data
    },

    // 显示分配权限对话处理框
    async showSetRightDialog(role){
      this.roleId = role.id
      const {data:res}=await this.$http.get('rights/tree')
      // console.log(res.data)
      if(res.meta.status!==200){
        return this.$message.error('请求权限失败')
      }
      this.$message.success('请求权限成功')
      // 获取权限数据
      this.rightsList=res.data
      console.log(this.rightsList)

      // 递归获取三级节点的id
      this.getLeafkeys(role,this.defkeys)
      this.setRightDialogVisible=true
    },

    // 通过递归的形式,获取角色下所有三级权限的id，并保存到defkeys中
    // node来判断是否是三级节点,arr是来保存
    getLeafkeys(node,arr){
      // 如果当前节点不包含children属性，则是三级节点
      if(!node.children){
        return arr.push(node.id)
      }
      // 在不是三级节点的情况下
      node.children.forEach(item=> this.getLeafkeys(item,arr))
    },

    // 监听分配权限对话框的关闭事件
    setRightDialogClosed(){
      this.defkeys = []
    },
    // 点击为角色分配
    async allotRights(){
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ]
      console.log(keys)
      const idStr = keys.join(',')
      console.log(idStr)

      const {data:res}=await this.$http.post(`roles/${this.roleId}/rights`,{rids:idStr})
      console.log(res)
      if(res.meta.status!==200){
        return this.$message.error('分配权限失败')
      }
      this.$message.success('分配权限成功')
      this.getRolesList()
      this.setRightDialogVisible=false
    }
  }
}
</script>
<style lang="less" scoped>
  .el-tag{
    margin: 10px;
  }
  .bdtop {
    border-top:1px solid #eee;
  }
  .bdbottom {
    border-bottom:1px solid #eee;
  }
  .hcenter{
    display: flex;
    align-items: center;
  }
</style>


