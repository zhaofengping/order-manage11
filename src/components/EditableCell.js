import { Form, Row, Col, Input, Button, Icon,Select,Modal,Table,InputNumber } from 'antd';
import style from '../styles/editCell.css';
const FormItem = Form.Item;
const Search = Input.Search;

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

class EditableCell extends React.Component {

  state = {
    value: this.props.value,
    editable: false,
    type:this.props.type,
    itemVisible:false,
    itemDataSource:[],
  }
  handleChange = (e) => {
    const value = e.target.value;
    this.setState({ value });
  }

  OnNumberChange=(value)=>{
    this.setState({ value });
  }

  check = () => {
    this.setState({ editable: false });
    if (this.props.onChange) {
      this.props.onChange(this.state.value);
    }
  }

  edit = () => {
    this.setState({ editable: true });
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
    this.setState({
      itemVisible: false,
      editable:false,
      value:record.itemCode
    });
    if (this.props.onChange) {
      let item={itemCode:record.inventoryItemId,
                inventoryItemId:record.inventoryItemId,
                itemDescription:record.itemDescription,
                itemUom:record.itemUom};
      this.props.onChange(item);
    }
  }
  //关闭Lov
  handleCancel = (e) => {
    this.setState({
      itemVisible:false,
      editable:false
    });
  }

  render() {
    const { getFieldDecorator} = this.props.form;
    const { editable,type,itemVisible,itemDataSource} = this.state;
    const { value} = this.props;

    return (
      <div className={style.editableCell}>
        {
          editable ?
            <div className={style.editableCellInputWrapper}>
              {
                type=='lov'?
                    (  <Search
                        placeholder={value}
                        style={{ width:'100%'}}
                        onSearch={this.showItemModal}
                        onChange={this.handleChange}
                    />)
                :type=='number'?
                  <div>
                    <InputNumber min={0}  defaultValue={value} onChange={this.OnNumberChange}/>
                    <Icon type="check" className={style.editableCellIconCheck} onClick={this.check}/>
                  </div>
                :
                  <div>
                    <Input defaultValue={value} onChange={this.handleChange} onPressEnter={this.check}/>
                    <Icon type="check" className={style.editableCellIconCheck} onClick={this.check}/>
                  </div>
              }
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
                        <FormItem label="物料编码" labelCol={{span:7}} wrapperCol={{span:16}}>
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
                        <FormItem  label="物料描述" labelCol={{span:7}} wrapperCol={{span:16}}>
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
            </div>
            :
            <div className={style.editableCellTextWrapper} onClick={this.edit}>
              {value || ' '}
            </div>
        }
      </div>
    );
  }
}

const newEditableCell = Form.create()(EditableCell);

export default newEditableCell;

