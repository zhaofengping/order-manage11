import { Form, Row, Col, Input, Button, Icon,Select,Modal,Table} from 'antd';
import style from '../styles/ordermanage.css';
import  {stringify} from  'qs';
const FormItem = Form.Item;
const Option = Select.Option;
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

//物料模态框表格列定义
const itemColumns = [{
  title: '物料ID',
  dataIndex: 'inventoryItemId',
  key: 'inventoryItemId'
},{
  title: '物料编码',
  dataIndex: 'itemCode',
  key: 'itemCode'
},{
  title: '物料描述',
  dataIndex: 'itemDescription',
  key: 'itemDescription'
}];

class AdvancedSearchForm extends React.Component {

  constructor(props){
    super(props);
    this.state={
      companyVisible: false,
      companyDataSource:[],
      customerVisible:false,
      customerDataSource:[],
      itemVisible:false,
      itemDataSource:[],
    }
  }

  //所有查询
  handleSearch = (action) => {
    var url;
    var urlCompany='http://hand.tunnel.echomod.cn/api/public/exam/company/query';
    var urlCustomer='http://hand.tunnel.echomod.cn/api/public/exam/customer/query';
    var urlItem='http://hand.tunnel.echomod.cn/api/public/exam/inventory/query';

    this.props.form.validateFields((err, values) => {
        //根据action判断是哪个查询按钮被点击
        //All 整个表单查询  传递数据给父组件
        //Company 公司查询
        //Customer 客户名称
        //Item  物料查询
        if(action=='All'){
          this.transmitDataParent(values);
          return;
        }else if(action=='Company'){
          url=urlCompany;
        }else if(action=='Customer'){
          url=urlCustomer;
        }else if(action=='Item'){
          url=urlItem;
        }
        //查询其他数据
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

  //传送查询得到的数据给父组件
  transmitDataParent(data){
    if(this.props.onSearch){
      this.props.onSearch(data);
    }
  }

  //重置功能
  handleReset = () => {
    this.props.form.resetFields();
  }

  //当查询按钮的lov数据被手动改变时，隐藏的ID应该被清空
  //问题：参数引用有问题，不能直接引用参数
  handleResetForm=(type)=>{
    // this.props.form.setFieldsValue({type:''});
    if(type=='companyId'){
      this.props.form.setFieldsValue({companyId:''});
    }
    if(type=='customerId'){
      this.props.form.setFieldsValue({customerId:''});
    }
    if(type=='inventoryItemId'){
      this.props.form.setFieldsValue({inventoryItemId:''});
    }
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

  //显示物料编码lov
  showItemModal = () => {
    fetch(`http://hand.tunnel.echomod.cn/api/public/exam/inventory/query`, {
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
      this.setState({itemDataSource:dataTemp});
    }).catch(()=>{
      console.log('error');
    });
    this.setState({
      itemVisible: true
    });
  }
  //保存物料编码lov
  autoCompleteItem(record, index, event){
    this.props.form.setFieldsValue({
      inventoryItemId:record.inventoryItemId,
      itemDescription1:record.itemDescription
    });
    this.setState({
      itemVisible: false,
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

  render() {
    const { getFieldDecorator} = this.props.form;
    const {companyVisible,companyDataSource,customerVisible,customerDataSource,itemVisible,itemDataSource}=this.state;
    const formItemLayout = {
      labelCol: { span: 7 },
      wrapperCol: { span: 14 },
    };
    return (
      <Form>
        <Row gutter={40}>
          <Col span={8}>
            <FormItem{...formItemLayout} label="公司名称">
              {  getFieldDecorator('companyId')
              (  <Search
                  style={{ width:'100%',display:'none'}}
                />)
              }
              {  getFieldDecorator('companyName1')
              (  <Search
                 placeholder="公司名称"
                 style={{ width:'100%'}}
                 onSearch={this.showCompanyModal}
                 onChange={()=>{this.handleResetForm('companyId')}}
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
          <Col span={8}>
            <FormItem{...formItemLayout} label="客户名称">
              {  getFieldDecorator('customerId')
                (  <Search style={{ width:'100%',display:'none'}}/>)
              }
              {  getFieldDecorator('customerName1')
              (  <Search
                  placeholder="客户名称"
                  style={{ width:'100%'}}
                  onSearch={this.showCustomerModal}
                  onChange={()=>{this.handleResetForm('customerId')}}
                />)
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
          <Col span={8}>
            <FormItem{...formItemLayout} label="销售订单号">
              {  getFieldDecorator('orderNumber')
                 (<Input prefix={
                   <Icon type="orderNumber" style={{ fontSize: 13 }} />
                 } placeholder="销售订单号" style={{ width: '100%' }} />)
              }
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem{...formItemLayout} label="物料">
              {  getFieldDecorator('inventoryItemId')
              (  <Search style={{ width:'100%',display:'none'}}/>)
              }
              {  getFieldDecorator('itemDescription1')
              (  <Search
                placeholder="物料描述"
                style={{ width:'100%'}}
                onSearch={this.showItemModal}
                onChange={()=>{this.handleResetForm('inventoryItemId')}}
              />)
              }
            </FormItem>
            {/*物料模态框*/}
            <Modal title="物料"
                   visible={itemVisible}
                   onCancel={this.handleCancel}
                   footer={null}
            >
              <div>
                <Form>
                  <Row>
                    <Col span={19}>
                      <FormItem{...formItemLayout} label="物料编码" labelCol={{span:7}} wrapperCol={{span:16}}>
                        {  getFieldDecorator('itemCode')
                        (<Input placeholder="物料编码" style={{ width:'100%'}}/>)
                        }
                      </FormItem>
                    </Col>
                    <Col span={5}>
                      <Button type="primary" icon="search" onClick={()=>{this.handleSearch('Item')}}>查询</Button>
                    </Col>
                  </Row>
                  <Row>
                    <Col span={19}>
                      <FormItem {...formItemLayout} label="物料描述" labelCol={{span:7}} wrapperCol={{span:16}}>
                        {  getFieldDecorator('itemDescription')
                        (<Input placeholder="物料描述" style={{ width:'100%'}}/>)
                        }
                      </FormItem>
                    </Col>
                  </Row>
                </Form>
                <Table
                  dataSource={itemDataSource}
                  columns={itemColumns}
                  bordered size="middle"
                  onRowDoubleClick={this.autoCompleteItem.bind(this)}
                />
              </div>
            </Modal>
          </Col>
          <Col span={8}>
            <FormItem{...formItemLayout} label="订单状态">
              {  getFieldDecorator('orderStatus')
              (  <Select defaultValue="NEW" style={{ width: '100%' }} placeholder="订单状态">
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
          <Col span={5} style={{ textAlign: 'center' }}>
            <Button type="primary" icon="search" onClick={()=>this.handleSearch('All')}>查询</Button>
            <Button type="primary" icon="edit" className={style.queryButton}  onClick={this.handleReset}>重置</Button>
          </Col>
        </Row>
      </Form>
    );
  }
}

const WrappedAdvancedSearchForm = Form.create()(AdvancedSearchForm);

export default WrappedAdvancedSearchForm;
