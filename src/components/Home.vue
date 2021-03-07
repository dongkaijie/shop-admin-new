/ 
<template>
  <el-container class="container">
    <!-- 头部 -->
  <el-header>
    <div class="title">
      <!-- <img src="../assets/heima.png" alt=""/> -->
      <span>缘来电商后台管理系统</span>
    </div>
     <el-button type="info" @click="logout">退出</el-button>
  </el-header>
  <el-container>
    <!-- 侧边栏 -->
    <el-aside :width="isCollapse ? '64px': '200px '">
      <div class="toggle-button" @click="toggleCollapse">|||</div>
       <el-menu
      class="el-menu-vertical-demo"
      background-color="#333744"
      text-color="#fff"
      active-text-color="#409EFF"
      unique-opened
      :collapse="isCollapse"
      :collapse-transition="false"
      router
      :default-active='activePath'
      >
      
      <!-- 一级菜单 -->
      <el-submenu :index="item.id+''" v-for="item in menulist" :key="item.id">
        <!-- 一级菜单模板 -->
        <template slot="title">
          <!-- 图标 -->
          <i :class="iconObj[item.id]"></i>
          <!-- 文本 -->
          <span>{{item.authName}}</span>
        </template>
        <!-- 二级菜单 -->
        <el-menu-item :index="'/'+ item2.path +''" v-for="item2 in item.children" :key="item2.id"
        @click="setNaveState('/'+ item2.path +'')">
          <template slot="title">
          <!-- 图标 -->
          <i class="el-icon-menu"></i>
          <!-- 文本 -->
          <span>{{item2.authName}}</span>
        </template>
        </el-menu-item>
      </el-submenu>
      
    </el-menu>
    </el-aside>
      <!-- 主体 -->
    <el-main>
      <!-- 占位符 -->
      <router-view></router-view>
    </el-main>
  </el-container>
</el-container>
</template>
<script>
export default {
  data(){
    return {
      menulist:[],
      iconObj:{
        "125":'iconfont icon-users',
        "103":'iconfont icon-3702mima',
        "102":'iconfont icon-shangpin',
        "101":'iconfont icon-danju',
        "145":'iconfont icon-baobiao',
      },
      isCollapse:false,
      // 被激活的链接地址
      activePath:""
    }
  },
  created(){
    this.getMenuList(),
    this.activePath=window.sessionStorage.getItem('activePath')
  },
  methods:{
    logout(){
      // 去除token
      window.sessionStorage.clear(),
      this.$router.push('/loign')
    },
     async getMenuList(){
      const {data:res}= await this.$http.get('menus')
      if(res.meta.status!==200) return this.$message.error(res.meta.msg)
      this.menulist=res.data
      // console.log(res)
    },
    // 切换菜单折叠
    toggleCollapse(){
      this.isCollapse=! this.isCollapse
    },
    // 保存链接的激活状态
    setNaveState(activePath){
      window.sessionStorage.setItem('activePath',activePath)
      // 重新赋值,在回点的时候就又有效果了
      this.activePath=activePath
    }
  }
}
</script>
<style lang="less" scoped>
  .container{
    height: 100%;
  }
  .el-header{
    background-color: #373d41;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-left: 0;
    color: #fff;
    font-size: 20px;
    .title{
      display: flex;
      align-items: center;
    }
    img {
      margin-right: 10px;
    }
 
  }
  .el-aside{
    background-color: #333744;
    .el-menu{
      border-right:none;
    }
  }
  .el-main{
    background-color: #eaedf1;
  }
  .iconfont{
    margin-right: 10px;
  }
  .toggle-button{
    background-color: #545c64;
    text-align: center;
    color: #fff;
    font-size: 10px;
    line-height: 24px;
    letter-spacing: 0.4em;
    cursor: pointer;
  }
</style>


