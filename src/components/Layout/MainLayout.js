import { Layout } from 'antd';
const { Header, Content, Footer} = Layout;
import style from '../../styles/ordermanage.css';

const MainLayout = ({ children, location }) => {
  return (
    <Layout>
      <Header className={style.header}>
        订单管理系统
      </Header>
      <Content className={style.content}>
        {children}
      </Content>
    </Layout>
  );
};

export default MainLayout;
