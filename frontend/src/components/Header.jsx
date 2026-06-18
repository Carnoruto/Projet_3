import "./Header.css";
import logo from "../assets/Logo_Montreal.png";
import user from "../assets/user.png";

function Header() {
  return (
    <header className="header">
      <div className="header-left">
        <img src={logo} alt="Logo de Montréal" className="logo" />
        
      </div>

      <div className="header-right">
        <img src={user} alt="Utilisateur" className="user-icon" />
        <a href="#" className="compte">Mon compte</a>
      </div>
    </header>
  );
}

export default Header;