import React,{Component} from 'react'
import { Tabs,Row,Col,Button,Table} from 'antd';
import  {stringify} from  'qs';
import EditableCell from '../components/EditableCell';
import style from '../styles/ordermanage.css';
const TabPane = Tabs.TabPane;

//附件信息列数据
const columns2 = [{
    title: '附件信息1',
    dataIndex: 'addition1',
  },
  {
    title: '附件信息2',
    dataIndex: 'addition2',
  },
  {
    title: '附件信息3',
    dataIndex: 'addition3',
  },
  {
    title: '附件信息4',
    dataIndex: 'addition4',
  },
  {
    title: '附件信息5',
    dataIndex: 'addition5',
  }
];

class TabsOrderLine extends Component{
  constructor(props){
    super(props);
    this.state={
       lineMaxNumber:-1,
       loading: false,
       dataSource:[],
       pagination:{
         current:1,
         total:1,
         pageSize:4,
        },
      //主要信息列数据
      columns1:[{
        title: '行号',
        dataIndex: 'lineNumber',
        width:50,
       },
        {
          title: '物料编码',
          width:150,
          dataIndex: 'inventoryItemId',
          render: (text, record, index) => (
            (this.props.tableEditable)?
             (<div>
               <EditableCell
                 value={record.itemCode} type={'lov'}
                 onChange={this.onCellChange(index, 'inventoryItemId')}
               />
             </div>)
              :
             (<div>{record.itemCode}</div>)
          )
        },
        {
          title: '物料描述',
          width:150,
          dataIndex: 'itemDescription'},
        {
          title: '产品单位',
          width:80,
          dataIndex: 'orderQuantityUom'},
        {
          title: '数量',
          width:100,
          dataIndex: 'orderdQuantity',
          render: (text, record, index) => (
            //根据不同状态控制是否可编辑
            this.props.tableEditable?
              (<div>
                <EditableCell
                  value={text} type={'number'}
                  onChange={this.onCellChange(index, 'orderdQuantity')}
                />
              </div>)
              :
              (<div>{text}</div>)
          )
        },
        {
          title: '销售单价',
          width:100,
          dataIndex: 'unitSellingPrice',
          render: (text, record, index) => (
            this.props.tableEditable?
              (<div>
                <EditableCell
                  value={text} type={'number'}
                  onChange={this.onCellChange(index, 'unitSellingPrice')}
                />
              </div>)
              :
              (<div>{text}</div>)
          )
        },
        {
          title: '金额',
          dataIndex: 'orderMoney',
          width:100,
          render: (text, record, index) => {
            var orderMoney=0;
            if(record.hasOwnProperty('orderdQuantity')&&record.hasOwnProperty('unitSellingPrice')) {
              orderMoney=record.orderdQuantity * record.unitSellingPrice;
            }
            return (
              <span>{orderMoney.toFixed(2)}</span>
            )
          }
        },
        {
          title: '备注',
          dataIndex: 'description',
          render: (text, record, index) => (
            this.props.tableEditable?
              (<div>
                <EditableCell
                  value={text}
                  onChange={this.onCellChange(index, 'description')}
                />
              </div>)
              :
              (<div>{text}</div>)
          )
        },
      ],
      selectedRowKeys: [],
      selectedRows:[],
    }
  }

  componentWillMount(){
     let headerId=this.props.headerId;
     if(headerId!=-1){
       this.setState({ loading: true });
       this.loadOrderLinesList(this.state.pagination.current,headerId);
       this.loadMaxNumber(headerId);
     }
  }

  //加载订单行信息
  loadOrderLinesList(value,headerId){
    let body ={
      "page": value,
      "pageSize": this.state.pagination.pageSize,
    };
    fetch(`http://hand.tunnel.echomod.cn/api/public/exam/line/query/${headerId}`, {
      method: "post",
      headers: {
        "Content-Type": "application/json",
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
      this.setState({loading: false});
    });
  }

  //加载最大行号
  loadMaxNumber(headerId){
    fetch(`http://hand.tunnel.echomod.cn/api/public/exam/line/queryMaxLineNumber/${headerId}`, {
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },
    }).then(response=>response.json()).then(data=>{
      this.setState({lineMaxNumber:data});
    }).catch(()=>{
      console.log('error');
    });
  }

  //分页处理
  handleTableChange = (pagination, filters, sorter) => {
    const current = pagination.current;
    this.setState({pagination:{...this.state.pagination,current}});
    this.loadOrderHeaderList(current);
  };

  //单元行选择改变时，记录选中行
  onSelectChange = (selectedRowKeys,selectedRows) => {
    this.setState({ selectedRowKeys,selectedRows});
  };

  //根据可编辑单元格的值改变dataSource
  onCellChange = (index, key) => {
    if(key=='inventoryItemId'){
      return (item) => {
        const dataSource = [...this.state.dataSource];
        dataSource[index]['inventoryItemId'] = item.inventoryItemId;
        dataSource[index]['itemCode'] = item.itemCode;
        dataSource[index]['itemDescription'] = item.itemDescription;
        dataSource[index]['orderQuantityUom'] = item.itemUom;
        this.setState({ dataSource });
      };
    }
    else{
      return (value) => {
        const dataSource = [...this.state.dataSource];
        dataSource[index][key] = value;
        this.setState({ dataSource });
      };
    }
  };

  //新建订单行时，表格新增一行
  handleAdd = () => {
    const {dataSource,lineMaxNumber,pagination} = this.state;
    const newData = {
      key:0,
      lineNumber:lineMaxNumber+1,
      inventoryItemId:'',
      itemDescription:'',
      orderQuantityUom:'',
      orderdQuantity:'',
      unitSellingPrice:'',
      description:''
    };
    dataSource.map((item,index)=>{
       Object.assign(item,{key:index+1});
    });
    dataSource.unshift(newData);
    console.log(dataSource);
    this.setState({dataSource,lineMaxNumber:lineMaxNumber+1,pagination:{...pagination,total:pagination.total+1}});
  };

  //新增或修改订单行
  handleSave=()=>{
    const dataSource = [...this.state.dataSource];
    const selectedRowKeys=[...this.state.selectedRowKeys];
    const selectedRows=[...this.state.selectedRows];
    var state;
    var str;
    var flag=0;

    //检测是否有选中行
    if(selectedRowKeys.length==0){
      alert("请选择要保存的数据");
      return;
    }
    //检测是否有订单头
    if(this.props.headerId==-1){
      alert('订单头不能为空');
      return;
    }
    //非空校验
    selectedRows.map(item=>{
      if(item.description==''||item.description==null){
        flag=1;
        str='备注不能为空';
      }
      if(item.orderdQuantity==''||item.orderdQuantity==null){
        flag=1;
        str='数量不能为空';
      }
      if(item.unitSellingPrice==''||item.unitSellingPrice==null){
        flag=1;
        str='单价不能为空';
      }
      if(item.inventoryItemId==''||item.inventoryItemId==null){
        flag=1;
        str='物料编码不能为空';
      }
    });
    //必输字段为空值时的处理
    if(flag==1){
      alert(str);
      flag=0;
      return;
    }

    //判断是新增还是修改
    selectedRows.map(item=>{
      if(item.hasOwnProperty("lineId")){
        state='update';
      }else{
        state='add';
        Object.assign(item,{headerId:this.props.headerId,companyId:this.props.companyId});
      }
      //增加修改或新增标志
      Object.assign(item,{__status:state});
    });

    console.log(selectedRows);
    fetch(`http://hand.tunnel.echomod.cn/api/public/exam/line/submit`, {
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },
      body:JSON.stringify(selectedRows)
    }).then(response=>response.json()).then(data=>{
      if(data.success){
        alert("保存成功");
      }else {
        alert(data.message);
      }
    }).catch(()=>{
      console.log('error');
    });
  }

  //删除订单行
  handleDelete = () => {
    const dataSource = [...this.state.dataSource];
    const selectedRowKeys=[...this.state.selectedRowKeys];
    const selectedRows=[...this.state.selectedRows];

    if(selectedRowKeys.length==0){
       alert("请选择要删除的数据");
       return;
    }
    //增加删除标志
    selectedRows.map(item=>{
       Object.assign(item,{__status:'delete'});
    });

    fetch(`http://hand.tunnel.echomod.cn/api/public/exam/line/delete`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body:JSON.stringify(selectedRows)
    }).then(response=>response.json()).then(data=>{
      if(data.success){
        alert("删除成功");
        console.log(selectedRowKeys);
        //在页面渲染删除
        selectedRows.map(item=>{
          console.log(item);
          dataSource.splice(item, 1);
        });
        let pagination=this.state.pagination;
        this.setState({dataSource,pagination:{...pagination,total:pagination.total-selectedRowKeys.length},selectedRowKeys:[],selectedRows:[]});
      }else {
        alert("删除失败");
      }
    }).catch(()=>{
      console.log('error');
    });
  };

  render(){

    const {dataSource,pagination,columns1,selectedRowKeys,selectedRows}=this.state;
    const rowSelection = {
      selectedRowKeys,
      selectedRows,
      onChange: this.onSelectChange,
    };
    return (
      <div>
        <Tabs style={{margin:'20px auto',width:"95%"}}>
          <TabPane tab="主要" key="1">
            <Row>
              <Col span={6} style={{ textAlign: 'center' }}>
                <Button disabled={!this.props.tableEditable} type="primary" onClick={this.handleAdd}>新建</Button>
                <Button disabled={!this.props.tableEditable} type="primary" onClick={this.handleSave} style={{ marginLeft: 8 }} >保存</Button>
                <Button disabled={!this.props.tableEditable} type="primary" onClick={this.handleDelete} style={{ marginLeft: 8 }} >删除</Button>
              </Col>
            </Row>
            <Table columns={columns1}
                   style={{margin:'10px auto',width:'98%'}}
                   dataSource={dataSource}
                   onChange={this.handleTableChange}
                   pagination={pagination}
                   bordered
                   size="middle"
                   rowSelection={rowSelection}
                   loading={this.state.loading}
                   className={style.lineTable}
            />
          </TabPane>
          <TabPane tab="其他" key="2">
            <Row>
              <Col span={6} style={{ textAlign: 'center' }}>
                <Button disabled={!this.props.tableEditable} type="primary">新建</Button>
                <Button disabled={!this.props.tableEditable} type="primary" style={{ marginLeft: 8 }} >保存</Button>
                <Button disabled={!this.props.tableEditable} type="primary" style={{ marginLeft: 8 }} >删除</Button>
              </Col>
            </Row>
            <Table columns={columns2}
                   style={{margin:'10px auto',width:'98%'}}
                   dataSource={dataSource}
                   onChange={this.handleTableChange}
                   pagination={pagination}
                   bordered
                   size="middle"
                   rowSelection={rowSelection}
                   loading={this.state.loading}
                   className={style.headerTable}
            />
          </TabPane>
        </Tabs>
      </div>
    )
  }
}
export default TabsOrderLine;

