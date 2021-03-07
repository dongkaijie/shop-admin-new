<template>
  <div>
    <!-- 面包屑 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>管理商品</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片 -->
    <el-card>
      <el-alert title="添加商品信息" type="info" center show-icon :closable="false"> </el-alert>
      <!-- 步骤条区域 -->
      <el-steps :space="200" :active="activeIndex - 0" finish-status="success" align-center>
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>

    <!-- el-form表单包裹 -->
    <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px" label-position="top">
      <!-- tab栏区域 -->
      <el-tabs v-model="activeIndex" :tab-position="'left'"
       :before-leave="beforeTagLeave" @tab-click="tabClicked">
        <el-tab-pane label="基本信息" name="0">
          <el-form-item label="商品名称" prop="goods_name">
            <el-input v-model="addForm.goods_name"></el-input>
          </el-form-item>
          <el-form-item label="商品价格" prop="goods_price">
            <el-input v-model="addForm.goods_price" type="number"></el-input>
          </el-form-item>
          <el-form-item label="商品重量" prop="goods_weight">
            <el-input type="number" v-model="addForm.goods_weight"></el-input>
          </el-form-item>
          <el-form-item label="商品数量" prop="goods_number">
            <el-input  type="number" v-model="addForm.goods_number"></el-input>
          </el-form-item>
          <el-form-item label="商品分类" prop="goods_cat">
            <el-cascader
              expand-trigger="hover"
              v-model="addForm.goods_cat"
              :options="cateList"
              :props="catProps"
              @change="handleChange">
            </el-cascader>
          </el-form-item>
        </el-tab-pane>
        <el-tab-pane label="商品参数" name="1">
          <!-- 渲染表单的item项 -->
          <el-form-item :label="item.attr_name" v-for="item in manyTable" :key='item.attr_id'>
            <!-- 复选框组 -->
             <el-checkbox-group v-model="item.attr_vals" >
              <el-checkbox border :label="cb" v-for="(cb,i) in item.attr_vals" :key="i"></el-checkbox>
    
            </el-checkbox-group>
          </el-form-item>
        </el-tab-pane>
        <el-tab-pane label="商品属性" name="2">
          <el-form-item :label="item.attr_name" v-for="item in onlyTable" :key='item.attr_id'>
            <el-input v-model="item.attr_vals"></el-input>
          </el-form-item>
        </el-tab-pane>
        <el-tab-pane label="商品图片" name="3">
          <!-- action是图片上传后台api地址 -->
          <el-upload
            :action="uploadURL"
            :on-preview="handlePreview"
            :on-remove="handleRemove" 
            list-type="picture"
            :headers="hearderObj"
            :on-success="handleSuccess">
            <el-button size="small" type="primary">点击上传</el-button>
          </el-upload>
        </el-tab-pane>
        
        <el-tab-pane label="商品内容" name="4">
          <!-- 富文本编辑器 -->
        <quill-editor v-model="addForm.goods_introduce"></quill-editor>
        <!-- 添加商品按钮 -->
        <el-button type="primary" class="btnAdd" @click="addGoods">添加商品</el-button>
        </el-tab-pane>
        <el-tab-pane label="完成" name="5">完成</el-tab-pane>
      </el-tabs>
    </el-form>

      <!-- 图片预览对话框 -->
      <el-dialog title="提示" :visible.sync="previewDialogVisible" width="50%" >
        <img :src="previewPath" alt="" class="previewImg">
      </el-dialog>

      
    </el-card>
  </div>
</template>
<script>
import _ from 'lodash'

export default {
  data(){
    return {
      activeIndex:'0',
      addForm:{
        goods_name:"",
        goods_price:0,
        goods_weight:0,
        goods_number:0,
        // 商品所属的数组
        goods_cat:[],
        // 图片的数组
        pics:[],
        // 商品描述
        goods_introduce:'',
        attrs:[] 
      },
      addFormRules:{
        goods_name:[
           { required: true,message: '请输入商品名称', trigger: 'blur' }
        ],
        goods_price:[
           { required: true,message: '请输入商品价格', trigger: 'blur' }
        ],
        goods_weight:[
           { required: true,message: '请输入商品重量', trigger: 'blur' }
        ],
        goods_number:[
           { required: true,message: '请输入商品数量', trigger: 'blur' }
        ],
        goods_cat:[
           { required: true,message: '请选择商品分类', trigger: 'blur' }
        ]
      },
      cateList:[],
      catProps:{
        label:'cat_name',
        children:'children',
        value:'cat_id'
      },
      manyTable:[],
      onlyTable:[],
      uploadURL:'http://127.0.0.1:8888/api/private/v1/upload',
      // 上传图片请求头
      hearderObj:{
        Authorization:
          window.sessionStorage.getItem("token")
      },
      
      // 图片预览路径
      previewPath:'',
      previewDialogVisible:false
    }
  },
  created(){
    this.getCateList()
  },
  methods:{
     async getCateList(){
      const {data:res}= await this.$http.get('categories')
        if(res.meta.status!==200) return this.$message.error('请求商品列表请求失败')
        this.$message.success('请求商品成功')
        this.cateList = res.data
        console.log(this.cateList)
    },
    handleChange(){
      console.log(this.addForm.goods_cat)
      if(this.addForm.goods_cat.length!==3){
        this.addForm.goods_cat= []
      }
    },

    // 
    beforeTagLeave(activeName,oldActiveName){
      // console.log('即将离开的标签页名字:' + oldActiveName,'即将进入的标签页名字:' + activeName)
      // 阻止跳转
      if(oldActiveName!==1 && this.addForm.goods_cat.length!==3){
        this.$message.error('请选择商品分类')
        return false
      }
    },

    // 点击
    async tabClicked(){
      console.log(this.activeIndex)
      // 证明访问的是动态参数面板
      if(this.activeIndex === '1'){
         const{data:res}=await this.$http.get(`categories/${this.cateId}/attributes`,
          {params:{sel:'many'}})

        if(res.meta.status!==200){
          return this.$message('请求所有商品分类失败')
          }
        this.$message.success('请求所有商品分类成功')
        this.manyTable = res.data
        res.data.forEach(item=>{
          item.attr_vals=item.attr_vals.length===0?[]:
          item.attr_vals.split(' ')
        })
        console.log(this.manyTable)
          
      }else if(this.activeIndex === '2'){
        const{data:res}=await this.$http.get(`categories/${this.cateId}/attributes`,
          {params:{sel:'only'}})

        if(res.meta.status!==200){
          return this.$message('请求所有商品分类失败')
          }
        this.$message.success('请求所有商品分类成功')
        this.onlyTable = res.data
        console.log(this.onlyTable)
      }
    },
    // 预览图片
    handlePreview(file){
      console.log(file)
      this.previewPath=file.response.data.url
      this.previewDialogVisible=true
    },
    // 移除图片
    handleRemove(file){
      // 找到图片路径，然后找到索引值，然后splice
      console.log(file)
      const filePath = file.response.data.tmp_path
      const i = this.addForm.pics.findIndex(v=>v.pics === filePath)
      this.addForm.pics.splice(i,1)
      console.log(this.addForm)
    },
    // 监听图片上传成功的事件
    handleSuccess(response){
      console.log(response)
    // 拼接得到一个图片信息对象
      const picInfo = {
        pic: response.data.tmp_path
      }
      // 将图片信息对象push到pic中
      this.addForm.pics.push(picInfo)
      console.log(this.addForm)
    },

    async addGoods(){
      console.log(this.addForm)
      this.$refs.addFormRef.validate(valid=>{
        if(!valid){
          return this.$message.error('请校验必要的表单项')
        }
      })
      // 执行业务逻辑
      // 深拷贝 因为goods_cat级联选择器要数组，接口文档要字符串，产生冲突
     const form= _.cloneDeep(this.addForm)
     form.goods_cat = form.goods_cat.join(',')

      // 处理动态参数
      this.manyTable.forEach(item=>{
        const newInfo = {
          attr_id:item.attr_id,
          attr_value:item.attr_vals.join(' ')
        }
        this.addForm.attrs.push(newInfo)
      })
      // 处理和静态属性
      this.onlyTable.forEach(item=>{
        const newInfo = {
          attr_id:item.attr_id,
          attr_value:item.attr_vals
        }
        this.addForm.attrs.push(newInfo)
      })
      form.attrs= this.addForm.attrs
      console.log(form.attrs)

      // 发起请求添加商品 商品的名称必须是唯一的
      const {data:res} = await this.$http.post('goods',form)
        if(res.meta.status!==201){
          return this.$message.error('添加商品失败')
        }
          this.$message.success('添加商品成功')
          this.$router.push('/goods')
    }

  },

  computed:{
    cateId(){
      if(this.addForm.goods_cat.length===3){
        return this.addForm.goods_cat[2]
      }
      return null
    }
  },
  
}
</script>
<style lang="less" scoped>
  .el-checkbox {
    margin: 0 5px 0 0 !important;
  }
  .previewImg{
    width: 100%;
  }
</style>


