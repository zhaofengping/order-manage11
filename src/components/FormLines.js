import { Form, Row, Col, Input, Button, Icon,Select,DatePicker,Modal,Table} from 'antd';
import style from '../styles/ordermanage.css';
import  {stringify} from  'qs';
import moment from 'moment';
const FormItem = Form.Item;
const dateFormat = 'YYYY-MM-DD HH:mm:ss';
const Search = Input.Search;

//公司名称模态框表格列定义
const companyColumns = [{
  title: '公司代码',
  dataIndex: 'companyNumber',
  key: 'companyNumber',
},{
  title: '公司名称',
  dataIndex: 'companyName',
  key: 'companyName',
}];

//客户名称模态框表格列定义
const customerColumns = [{
  title: '客户编号',
  dataIndex: 'customerNumber',
  key: 'customerNumber',
},{
  title: '客户名称',
  dataIndex: 'customerName',
  key: 'customerName',
}];

class OrderLineForm extends React.Component {

  constructor(props){
    super(props);
    this.state={
      headerId:this.props.headerId,
      buttonState:{
        save:false,
        submit:false,
        approval:true,
        reject:true,
        deleteAll:false,
        print:false
      },
      Formdisabled:false,
      orderStatus:'DEFAULT',
      companyVisible: false,
      companyDataSource:[],
      customerVisible:false,
      customerDataSource:[],
    }
  }

  //获得headerId
  componentWillMount(){
    let headerId=this.state.headerId;
    if(headerId!=-1){
      this.loadOrderHeaderInfo(headerId);
    }else{
      this.changeButtonState('DEFAULT');
    }
    this.props.form.setFieldsValue({orderDate:moment(new Date(), dateFormat)});
  }

  //加载与订单头有关的信息
  loadOrderHeaderInfo(headerId){
    let body={headerId};
    fetch(`http://hand.tunnel.echomod.cn/api/public/exam/header/query`, {
      method: "post",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded;utf-8",
      },
      body:stringify(body)
    }).then(response=>response.json()).then(data=>{
      //将值自动当如到列表中
      let orderHeader=data.rows[0];
      this.setState({orderStatus:orderHeader.orderStatus});
      this.props.form.setFieldsValue({
        orderNumber:orderHeader.orderNumber,
        companyName1:orderHeader.companyName,
        companyId:orderHeader.companyId,
        customerName1:orderHeader.customerName,
        customerId:orderHeader.customerId,
        orderDate:moment(orderHeader.orderDate,dateFormat),
        orderAmount:orderHeader.orderAmount,
        orderStatus:orderHeader.orderStatus
      });
      //改变按钮的状态
      this.changeButtonState(orderHeader.orderStatus);
    }).catch(()=>{
      console.log('error');
    });
  }

  //新建或修改订单头
  saveOrderHeader=()=>{
    var headerId=this.state.headerId;
    this.props.form.validateFields((err, values) =>{
      if(err){
        return;
      }
      const {orderNumber,companyId,customerId,orderDate,orderStatus}=values;
      let body={orderNumber,companyId,customerId,orderDate:moment(orderDate).format(dateFormat),orderStatus:orderStatus[0]};
      //新增订单头
      if(headerId==-1){
        fetch(`http://hand.tunnel.echomod.cn/api/public/exam/header/add`, {
          method: "post",
          headers: {
            "Content-Type": "application/json",
          },
          body:JSON.stringify(body)
        }).then(response=>response.json()).then(data=>{
          if(data.success){
            let orderHeader=data.rows[0];
            let headerId=orderHeader.headerId;
            let orderStatus=orderHeader.orderStatus;
            this.setState({headerId,orderStatus});
            alert('保存成功');
            this.changeButtonState(orderStatus);
            // 传递数据给父组件
            if(this.props.onSave){
              this.props.onSave(orderHeader);
            }
          }else{
            alert(data.message);
          }
        });
      }
      //修改订单头
      else{
        body={...body,headerId};
        fetch(`http://hand.tunnel.echomod.cn/api/public/exam/header/update`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body:JSON.stringify(body)
        }).then(response=>response.json()).then(data=>{
          if(data.success){
            let orderHeader=data.rows[0];
            let orderStatus=orderHeader.orderStatus;
            this.setState({orderStatus});
            alert('修改成功');
            this.changeButtonState(orderStatus);
            //传递数据给父组件
            if(this.props.onSave){
              this.props.onSave(orderHeader);
            }
          }else{
            alert(data.message);
          }
        }).catch(()=>{
          alert('服务器出错了');
        });
      }
    })
  }

  //提交、审批、拒绝订单头
  handleHeader=(action)=>{
    this.props.form.validateFields((err, values) =>{
      let headerId=this.state.headerId;
      const {orderNumber,companyId,customerId,orderDate}=values;
      let body={
        headerId,
        orderNumber,
        companyId,
        customerId,
        orderDate:moment(orderDate).format(dateFormat),
        orderStatus:action
      };
      fetch(`http://hand.tunnel.echomod.cn/api/public/exam/header/update`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body:JSON.stringify(body)
      }).then(response=>response.json()).then(data=>{
        if(data.success){
          let orderHeader=data.rows[0];
          let orderStatus=orderHeader.orderStatus;
          this.setState({orderStatus});
          if(action=='SUBMITED'){
            alert('提交成功');
          }else if(action=='APPROVED'){
            alert('审批成功');
          }else{
            alert('拒绝成功');
          }
          this.changeButtonState(orderStatus);
          this.props.form.setFieldsValue({orderStatus});
        }else{
          alert(data.message);
        }
      }).catch(()=>{
        alert('服务器出错了');
      });
    })
  }

  //删除订单头
  deleteAll(){
    let headerId=this.state.headerId;
    fetch(`http://hand.tunnel.echomod.cn/api/public/exam/header/delete/${headerId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      }
    }).then(response=>response.json()).then(data=>{
      if(data.success){
        alert("删除成功");
        history.back();
      }else{
        alert(data.message);
      }
    }).catch(()=>{
      alert('服务器出错了');
    });
  }

  //控制按钮的编辑状态
  changeButtonState(orderStatus){
    switch(orderStatus) {
      case 'DEFAULT':
        this.setState({
          Formdisabled: false,
          buttonState:{
            save:false,
            submit:true,
            approval:true,
            reject:true,
            deleteAll:true,
            print:true
          }
        });
        if(this.props.onEditable){
          this.props.onEditable(true);
        }
        break;
      case 'NEW':
        this.setState({
          Formdisabled: false,
          buttonState:{
            save:false,
            submit:false,
            approval:true,
            reject:true,
            deleteAll:false,
            print:false
          }
        })
        if(this.props.onEditable){
          this.props.onEditable(true);
        }
        break;
      case 'SUBMITED':
        this.setState({
          Formdisabled: true,
          buttonState:{
            save:true,
            submit:true,
            approval:false,
            reject:false,
            deleteAll:true,
            print:false
          }
        })
        if(this.props.onEditable){
          this.props.onEditable(false);
        }
        break;
      case 'APPROVED':
        this.setState({
          Formdisabled: true,
          buttonState:{
            save:true,
            submit:true,
            approval:true,
            reject:true,
            deleteAll:true,
            print:false
          }
        })
        if(this.props.onEditable){
          this.props.onEditable(false);
        }
        break;
      case 'REJECTED':
        this.setState({
          Formdisabled: false,
          buttonState:{
            save:false,
            submit:false,
            approval:true,
            reject:true,
            deleteAll:false,
            print:false
          }
        })
        if(this.props.onEditable){
          this.props.onEditable(true);
        }
        break;
    }
  }

  //模态框内部查询
  handleSearch = (action) => {
    var url;
    var urlCompany='http://hand.tunnel.echomod.cn/api/public/exam/company/query';
    var urlCustomer='http://hand.tunnel.echomod.cn/api/public/exam/customer/query';
    var urlItem='http://hand.tunnel.echomod.cn/api/public/exam/inventory/query';

    //根据action判断是哪个查询按钮被点击
    //Company 公司查询
    //Customer 客户名称
    //Item  物料查询
    if(action=='Company'){
      url=urlCompany;
    }else if(action=='Customer'){
      url=urlCustomer;
    }else if(action=='Item'){
      url=urlItem;
    }
    this.props.form.validateFields((err, values) => {
      //查询数据
      fetch(url, {
        method: "post",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded;utf-8",
        },
        body:stringify(values)
      }).then(response=>response.json()).then(data=>{
        var dataSource=data.rows;
        if(action=='Company'){
          this.setState({companyDataSource:dataSource});
        }else if(action=='Customer'){
          this.setState({customerDataSource:dataSource});
        }else if(action=='Item'){
          this.setState({itemDataSource:dataSource});
        }
      }).catch(()=>{
        console.log('error');
      });

    });
  }

  //显示公司名称lov
  showCompanyModal = () => {
    fetch(`http://hand.tunnel.echomod.cn/api/public/exam/company/query`, {
      method: "post",
      headers: {
        "Content-Type": "application/json",
      }
    }).then(response=>response.json()).then(data=>{
      let dataTemp=[];
      data.rows.map((item,index)=>{
        Object.assign(item,{key:index});
        dataTemp.push(item);
      });
      this.setState({companyDataSource:dataTemp});
    }).catch(()=>{
      console.log('error');
    });
    this.setState({
      companyVisible: true
    });
  }
  //保存公司名称lov
  autoCompleteCompany(record, index, event){
    this.props.form.setFieldsValue({
      companyId:record.companyId,
      companyName1:record.companyName
    });
    this.setState({
      companyVisible: false,
    });
  }

  //显示客户名称lov
  showCustomerModal = () => {
    fetch(`http://hand.tunnel.echomod.cn/api/public/exam/customer/query`, {
      method: "post",
      headers: {
        "Content-Type": "application/json",
      }
    }).then(response=>response.json()).then(data=>{
      let dataTemp=[];
      data.rows.map((item,index)=>{
        Object.assign(item,{key:index});
        dataTemp.push(item);
      });
      this.setState({customerDataSource:dataTemp});
    }).catch(()=>{
      console.log('error');
    });
    this.setState({
      customerVisible: true
    });
  }
  //保存客户名称lov
  autoCompleteCustomer(record, index, event){
    this.props.form.setFieldsValue({
      customerId:record.customerId,
      customerName1:record.customerName
    });
    this.setState({
      customerVisible: false,
    });
  }

  //关闭Lov
  handleCancel = (e) => {
    this.setState({
      companyVisible: false,
      customerVisible:false,
      itemVisible:false
    });
  }

  //设置2016年以前的数据都不能选
  disabledDate=(current)=>{
    let minData=new Date('2015-12-31');
     return current && current.valueOf() < moment(minData, dateFormat);
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    const {companyVisible,companyDataSource}=this.state;
    const {customerVisible,customerDataSource}=this.state;
    const formItemLayout = {
      labelCol: { span: 7 },
      wrapperCol: { span: 14 },
    };
    //时间为moment类型，所以校验需要预处理
    const config = {
      rules: [{ type: 'object', whitespace:true,required: true, message: '请选择订单日期!' }],
    };
    return (
      <Form onSubmit={this.handleSearch} >
        <Row gutter={40}>
          {/*订单编号*/}
          <Col span={8}>
            <FormItem{...formItemLayout} label="订单编号">
              {  getFieldDecorator('orderNumber',{ rules: [{ required: true, whitespace:true,message: '请输入订单编号'}]})
              (<Input placeholder="订单编号" style={{ width: '100%',backgroundColor:'rgb(245,230,160)'}} disabled={this.state.Formdisabled}/>)
              }
            </FormItem>
          </Col>
          {/*公司名称*/}
          <Col span={8}>
            <FormItem{...formItemLayout} label="公司名称">
              {  getFieldDecorator('companyName1',{ rules: [{ required: true, whitespace:true,message: '请选择公司'}]})
              (  <Search
                placeholder="公司名称"
                style={{ width:'100%',backgroundColor:'rgb(245,230,160)'}}
                onSearch={this.showCompanyModal}
                disabled={this.state.Formdisabled}
              />)
              }
              {  getFieldDecorator('companyId')
              (  <Search
                style={{ width:'100%',display:'none'}}
              />)
              }
            </FormItem>
            {/*公司名称模态框*/}
            <Modal title="公司名称"
                   visible={companyVisible}
                   onCancel={this.handleCancel}
                   footer={null}
            >
              <div>
                <Form>
                  <Row>
                    <Col span={19}>
                      <FormItem {...formItemLayout} label="公司名称" labelCol={{span:7}} wrapperCol={{span:16}}>
                        {  getFieldDecorator('companyName')
                        (<Input placeholder="公司名称" style={{ width:'100%'}}/>)
                        }
                      </FormItem>
                    </Col>
                    <Col span={5}>
                      <Button type="primary" icon="search" onClick={()=>this.handleSearch('Company')}>查询</Button>
                    </Col>
                  </Row>
                  <Row>
                    <Col span={19}>
                      <FormItem{...formItemLayout} label="公司代码" labelCol={{span:7}} wrapperCol={{span:16}}>
                        {  getFieldDecorator('companyNumber')
                        (<Input placeholder="公司代码" style={{ width:'100%'}}/>)
                        }
                      </FormItem>
                    </Col>
                  </Row>
                </Form>
                <Table
                  dataSource={companyDataSource}
                  columns={companyColumns}
                  bordered size="middle"
                  onRowDoubleClick={this.autoCompleteCompany.bind(this)}
                />
              </div>
            </Modal>
          </Col>
          {/*客户名称*/}
          <Col span={8}>
            <FormItem{...formItemLayout} label="客户名称">
              {  getFieldDecorator('customerName1',{ rules: [{ required: true, whitespace:true,message: '请选择客户名称'}]})
              (  <Search
                placeholder="客户名称"
                style={{ width:'100%',backgroundColor:'rgb(245,230,160)'}}
                onSearch={this.showCustomerModal}
                disabled={this.state.Formdisabled}
              />)
              }
              {  getFieldDecorator('customerId')
              (  <Search style={{ width:'100%',display:'none'}}/>)
              }
            </FormItem>
            {/*客户名称模态框*/}
            <Modal title="客户名称"
                   visible={customerVisible}
                   onCancel={this.handleCancel}
                   footer={null}
            >
              <div>
                <Form>
                  <Row>
                    <Col span={19}>
                      <FormItem{...formItemLayout} label="客户名称" labelCol={{span:7}} wrapperCol={{span:16}}>
                        {  getFieldDecorator('customerName')
                        (<Input placeholder="客户名称" style={{ width:'100%'}}/>)
                        }
                      </FormItem>
                    </Col>
                    <Col span={5}>
                      <Button type="primary" icon="search" onClick={()=>{this.handleSearch('Customer')}}>查询</Button>
                    </Col>
                  </Row>
                  <Row>
                    <Col span={19}>
                      <FormItem {...formItemLayout} label="客户编号" labelCol={{span:7}} wrapperCol={{span:16}}>
                        {  getFieldDecorator('customerNumber')
                        (<Input placeholder="客户编号" style={{ width:'100%'}}/>)
                        }
                      </FormItem>
                    </Col>
                  </Row>
                </Form>
                <Table
                  dataSource={customerDataSource}
                  columns={customerColumns}
                  bordered size="middle"
                  onRowDoubleClick={this.autoCompleteCustomer.bind(this)}
                />
              </div>
            </Modal>
          </Col>
          {/*订单日期*/}
          <Col span={8}>
            <FormItem{...formItemLayout} label="订单日期">
              {  getFieldDecorator('orderDate', {initialValue:moment(new Date(), dateFormat)},config,)
              (<DatePicker style={{backgroundColor:'rgb(245,230,160)'}}
                           format={dateFormat}
                           disabled={this.state.Formdisabled}
                           disabledDate={this.disabledDate}
                />
              )
              }
            </FormItem>
          </Col>
          {/*订单总金额*/}
          <Col span={8}>

            <FormItem{...formItemLayout} label="订单总金额">
              {  getFieldDecorator('orderAmount')
              (<Input placeholder="订单总金额" style={{ width: '100%' }} disabled/>)
              }
            </FormItem>
          </Col>
          {/*订单状态*/}
          <Col span={8}>

            <FormItem{...formItemLayout} label="订单状态">
              {  getFieldDecorator('orderStatus',{
                initialValue:['NEW']})
              (  <Select  style={{ width: '100%' }} placeholder="订单状态" value={this.state.orderStatus} disabled>
                  <Option value="NEW">新建</Option>
                  <Option value="SUBMITED">已提交</Option>
                  <Option value="APPROVED">已审批</Option>
                  <Option value="REJECTED">已拒绝</Option>
                </Select>
              )
              }
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={13} style={{ textAlign: 'center' }}>
            <Button type="primary" onClick={this.saveOrderHeader.bind(this)} disabled={this.state.buttonState.save}>保存</Button>
            <Button type="primary" onClick={()=>this.handleHeader('SUBMITED')} disabled={this.state.buttonState.submit} className={style.queryButton} >提交</Button>
            <Button type="primary" onClick={()=>this.handleHeader('APPROVED')} disabled={this.state.buttonState.approval} className={style.queryButton} >审批</Button>
            <Button type="primary" onClick={()=>this.handleHeader('REJECTED')} disabled={this.state.buttonState.reject} className={style.queryButton} >拒绝</Button>
            <Button type="primary" onClick={this.deleteAll.bind(this)} disabled={this.state.buttonState.deleteAll} className={style.queryButton} >整单删除</Button>
            <Button type="primary" disabled={this.state.buttonState.print} className={style.queryButton} onClick={this.print}>单据打印</Button>
            <Button type="primary" className={style.queryButton} onClick={()=>history.back()}>返回</Button>
          </Col>
        </Row>
      </Form>
    );
  }
}

const FormOrderLine = Form.create()(OrderLineForm);

export default FormOrderLine;

