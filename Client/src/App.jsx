import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

import Login from './Components/Auth/Login';
import SignUp from './Components/Auth/SignUp';
import ForgotPassword from './Components/Auth/ForgotPassword';
import VerifyEmail from './Components/Auth/VerifyEmail';

import Account from './Components/Account/Account';
import SearchMembers from './Components/Account/SearchMembers/SearchMembers';
import FriendsOfChat from './Components/Account/Chat/FriendsOfChat';
import Chat from './Components/Account/Chat/Chat';

function App() {
  return (
    <Router>
      <Routes>
        <Route path='/' element={<Login />} />
        <Route path='/SignUp' element={<SignUp />} />
        <Route path='/forgotPassword' element={<ForgotPassword/>} />
        <Route path='/verifyEmail' element={<VerifyEmail/>} />
        <Route path='/Account/members' element={<Account com={<SearchMembers/>} />} />
        <Route path='/Account/friends' element={<Account com={<FriendsOfChat/>} />} />
        <Route path='/Account/chat/:TargetMember' element={<Account com={<Chat/>} />} />
      </Routes>
    </Router>
  );
}

export default App;