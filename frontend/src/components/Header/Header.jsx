import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import './Header.css';
import logoImage from '../../assets/images/logo.png';

function Header() {
  return (
    <header className="main-header">
      <div className="container">
        <Link to="/" className="logo-link">
          <img src={logoImage} alt="Logo AugendaPet" className="logo-image" />
          <span className="logo-text">AugendaPet</span>
        </Link>
        <div className="nav-and-button-group">
          <nav className="main-nav">
            <ul>
              <li>
                <NavLink to="/" exact>Início</NavLink>
              </li>
              <li>
                <NavLink to="/servicos">Serviços</NavLink>
              </li>
            </ul>
          </nav>
          <Link to="/login" className="btn-login">
            Entrar
          </Link>
        </div>
      </div>
    </header>
  );
}

export default Header;