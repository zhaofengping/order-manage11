import React,{Component} from 'react'
import MainLayout from '../components/Layout/MainLayout';
import Left from '../components/Left';
import Right from '../components/Right';
import {BrowserRouter as Router} from 'react-router-dom';

class Index extends Component{
  render(){
    return (
      <MainLayout>
        <Router history={history}>
          <div>
            <Left/>
            <Right/>
          </div>
        </Router>
      </MainLayout>
    )
  }
}
export default Index
