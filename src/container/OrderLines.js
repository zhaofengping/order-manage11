import React,{Component} from 'react'
import FormLines from '../components/FormLines';
import TabsOrderLine from '../container/TabsOrderLine';
import style from '../styles/ordermanage.css';
import  {stringify} from  'qs';

const columns = [{
  title: '销售订单号',
  dataIndex: 'orderNumber',
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
];

class OrderLines extends Component{
  constructor(props){
    super(props);
    this.state= {
      headerId: -1,
      companyId:-1,
      tableEditable:true,
    }
  }

  componentWillMount(){
    let headerId = this.props.match.params.headerId;
    this.setState({headerId});
  }

  saveHeader=({headerId,companyId}) =>{
    this.setState({headerId,companyId});
  }

  changeEditable=(boolean)=>{
    this.setState({tableEditable:boolean});
  }

  render(){
    const {headerId,companyId,tableEditable}=this.state;
    return (
      <div>
        <span className={style.rightHeader}>订单行表</span>
        <hr/>
        <div className={style.rightContent}>
           <FormLines headerId={headerId}  onSave={this.saveHeader} onEditable={this.changeEditable}/>
           <TabsOrderLine headerId={headerId} companyId={companyId} tableEditable={tableEditable}/>
        </div>

      </div>
    )
  }
}
export default OrderLines
