import React,{Component} from 'react'
import FormHeader from '../components/FormHeader';
import { Table,Icon,Button} from 'antd';
import {Link} from 'react-router-dom';
import style from '../styles/ordermanage.css';
import  {stringify} from  'qs';

class OrderHeader extends Component{

  constructor(){
    super();
    this.state={
      columns:[{
        title: '销售订单号',
        dataIndex: 'orderNumber',
        render: (text, record, index) => {
          return (
            <Link  to={`/orderLine/${record.headerId}`}>{text}</Link>
          )
        }
      },
        {  title: '公司名称',
          width:200,
          dataIndex: 'companyName'},
        {
          title: '客户名称',
          dataIndex: 'customerName'},
        {
          title: '订单日期',
          dataIndex: 'orderDate'},
        {
          title: '订单状态',
          dataIndex: 'orderStatus',
          render: (text, record, index) => {
            return (
              <div>
                {text=='NEW'?'新建':text=='SUBMITED'?'已提交':text=='APPROVED'?'已审批':'已拒绝'}
              </div>
            )
          }
        },
        {
          title: '订单金额',
          dataIndex: 'orderAmount'},
      ],
      loading: false,
      dataSource:[],
      pagination:{
        current:1,
        total:1,
        pageSize:6,
      },
      searchflag:1,//1为全部列表,2为部分查询
      searchCurrent:1,
      searchValues:null,
    }
  }

  componentWillMount(){
    this.setState({ loading: true });
    this.loadOrderHeaderList(this.state.pagination.current);
  }

  //加载订单头信息
  loadOrderHeaderList(value){
    let body ={
      "page": value,
      "pageSize": this.state.pagination.pageSize,
    };
    fetch(`http://hand.tunnel.echomod.cn/api/public/exam/header/query`, {
      method: "post",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded;utf-8",
      },
      body:stringify(body)
    }).then(response=>response.json()).then(data=>{
      let dataTemp=data.rows;
      dataTemp.map((item,index)=>{
        Object.assign(item,{key:index});
      });
      this.setState({dataSource:dataTemp,
                     pagination:{...this.state.pagination,total:data.total},
                     loading: false});
    }).catch(()=>{
      console.log('error');
    });
  }

  //分页处理
  handleTableChange = (pagination, filters, sorter) => {
    this.setState({ loading: true });
    const current = pagination.current;
    this.setState({pagination:{...this.state.pagination,current}});
    if(this.state.searchflag==1){
      this.loadOrderHeaderList(current);
    }else{
      this.setState({searchCurrent:current});
      this.loadOrderHeaderSearchList(current,null);
    }
  };

  //查询数据
  handleSearch(values){
    this.setState({searchflag:2,searchValues:values,pagination:{...this.state.pagination,current:0}});
    this.loadOrderHeaderSearchList(this.state.searchCurrent,values);
  }

  //加载查询列表
  loadOrderHeaderSearchList(searchCurrent,values){

    var searchValues=this.state.searchValues;
    if(values != null){
      searchValues=values;
    }

    let searchData={...searchValues,page:searchCurrent,pageSize:this.state.pagination.pageSize};
    fetch('http://hand.tunnel.echomod.cn/api/public/exam/header/query', {
      method: "post",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded;utf-8",
      },
      body:stringify(searchData)
    }).then(response=>response.json()).then(data=>{
       this.setState({
        dataSource:data.rows,
        pagination:{...this.state.pagination,total:data.total}
      })
    }).catch(()=>{
      console.log('error');
    });
  }

  render(){
    const {dataSource,pagination,columns}=this.state;
    return (
      <div>
        <span  className={style.rightHeader}>订单头表</span>
        <hr className={style.hr}/>
        <div className={style.rightContent}>
          <FormHeader onSearch={this.handleSearch.bind(this)}/>
          <div>
            <Table
                   columns={columns}
                   className={style.headerTable}
                   dataSource={dataSource}
                   onChange={this.handleTableChange}
                   pagination={pagination}
                   style={{marginTop:20}}
                   loading={this.state.loading}
                   bordered
                   size="middle"
                   title={() =>{return(<span><Icon type="plus"/><Link  to={`/orderLine/-1`}>新建</Link></span>)}}/>
          </div>
        </div>
      </div>
    )
  }
}
export default OrderHeader
