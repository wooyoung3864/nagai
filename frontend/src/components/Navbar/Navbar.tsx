import logo from '../../assets/imgs/nagai_logo.png';
import { useUser } from '../../contexts/UserContext';

import './Navbar.css';
import { useNavigate } from 'react-router-dom';

export default function Navbar() {
  const { name } = useUser();

  const navigate = useNavigate();

  const navigateMyPage = () => {
    navigate('/mypage')
  }

  const navigateMain = () => {
    navigate('/main')
  }
  
  return (
    <div className="nagai-navbar">
      <button className="logo" onClick={navigateMain}>
        <img src={logo} alt="nagAI logo" className="logo-img" />
      </button>
      <button className="username" onClick={navigateMyPage}>{name || 'Guest'}</button>
    </div>
  );
}
