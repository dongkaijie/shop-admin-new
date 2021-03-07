<template>
  <div>
    <!-- 面包屑 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card>
      <!-- 输入框 -->
      <el-row :gutter="20">
        <el-col :span="12">
            <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getGoodsList">
              <el-button slot="append" icon="el-icon-search" @click="getGoodsList"></el-button>
            </el-input>
        </el-col>
        <!-- 添加用户 -->
        <el-col :span="4">
          <el-button type="primary" @click="goAddpage">添加商品</el-button>
        </el-col>
      </el-row>

      <!-- tab表格 -->
       <el-table :data="goodsList" style="width: 100%" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column prop="goods_name" label="商品名称"></el-table-column>
        <el-table-column prop="goods_price" label="商品价格(元)" width="100px"></el-table-column>
        <el-table-column prop="goods_weight" label="商品重量" width="80px"></el-table-column>
        <el-table-column prop="add_time" label="创建时间" width="180px">
          <template slot-scope="scope">
            {{scope.row.add_time | dateFormat}}
          </template>
        </el-table-column>
        <el-table-column prop="goods_weight" label="操作" width="130px">
          <template slot-scope="scope">
          <!-- 编辑 这里的scope.row.id 是传递id-->
          <el-button type="primary" icon="el-icon-edit" size="mini"></el-button>
          <!-- 删除 -->
          <el-button type="danger" icon="el-icon-delete" size="mini" 
          @click="removeById(scope.row.goods_id)"></el-button>

          
          </template>
        </el-table-column>
          
        
       </el-table>

       <!-- 分页 -->
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="queryInfo.pagenum"
          :page-sizes="[10, 30 ,50, 100, ]"
          :page-size="queryInfo.pagenum"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total" background>
        </el-pagination>
    </el-card>
  </div>
</template>
<script>
export default {
  data(){
    return {
      queryInfo:{
        query:'',
        pagenum:1,
        pagesize:10
      },
      goodsList:[],
      total:0
    }
  },
  created(){
    this.getGoodsList()
  },
  methods:{
    // 获取列表数据
    async getGoodsList(){
      const {data:res}= await this.$http.get('goods',{params:this.queryInfo})
      if(res.meta.status!==200){
        return this.$message.error('请求所有商品列表失败')
      }
      this.$message.success('请求所有商品列表成功')
      console.log(res.data)
      this.goodsList = res.data.goods
      this.total = res.data.total
      console.log(this.goodsList,this.total)
    },

    // 分页
    handleSizeChange(newSize){
      this.queryInfo.pagesize = newSize
      this.getGoodsList()
    },

    handleCurrentChange(newPage){
      this.queryInfo.pagenum = newPage
      this.getGoodsList()
    },

    // 删除
    async removeById(id){
      const confirmResult = await this.$confirm('此操作将永久删除该商品, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(err => err)
        console.log(confirmResult)
        if(confirmResult !== 'confirm'){
          return this.$message.info('取消删除')
        }

        const{data:res}= await this.$http.delete(`goods/${id}`)
        if(res.meta.status!==200){
          return this.$message.error('删除请求失败')
        }
        this.$message.success('删除请求成功')
        this.getGoodsList()
    },

    // 添加商品
    goAddpage(){
      this.$router.push('/goods/addgoods')
    }

  }
}
</script>
<style lang="less" scoped>

</style>


