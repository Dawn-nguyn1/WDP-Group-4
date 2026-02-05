import React from 'react'
import { Outlet } from 'react-router-dom'
import Header from './components/layout/header'
import Footer from './components/layout/footer'
// import { getAccountAPI } from './services/api.service'

function App() {
  // const { setUser } = useContext(AuthContext);

  // useEffect(() => {
  //   fetchUserInfo();
  // }, []);

  // const fetchUserInfo = async () => {
  //   const res =  await getAccountAPI();
  //   if (res.data){
  // setUser(res.data.user);
  //     console.log("CHECK THONG TIN NGUOI DUNG", res.data);
  //   }
  // }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Header />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <Outlet />
        </div>
        <Footer />
      </div>
    </div>
  )
}

export default App
