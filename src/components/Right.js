import React,{Component} from 'react';
import style from '../styles/ordermanage.css';
import {Route} from 'react-router-dom';
import OrderHeader from '../container/OrderHeader';
import OrderLines from '../container/OrderLines';

class Right extends Component{
  render(){
    return(
      <div className={style.right}>
        <Route exact path="/" component={OrderHeader}/>
        <Route exact path="/orderLine/:headerId" component={OrderLines}/>
      </div>
    )
  }
}
export default Right;
