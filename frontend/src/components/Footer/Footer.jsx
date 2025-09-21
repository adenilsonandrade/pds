import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

function Footer() {
  return (
    <footer className="main-footer">
      <div className="container footer-content">
        <div className="footer-section brand-info">
          <Link to="/" className="footer-logo">
            AugendaPet
          </Link>
          <p className="copyright">&copy; 2025 AugendaPet. Todos os direitos reservados.</p>
        </div>

        <div className="footer-section footer-links">
          <h3>Links Rápidos</h3>
          <ul>
            <li><Link to="/">Início</Link></li>
            <li><Link to="/agendar">Agendar</Link></li>
          </ul>
        </div>

        <div className="footer-section contact-info">
          <h3>Contato</h3>
          <p>Email: contato@augendapet.com</p>
          <p>Telefone: (51) 99999-9999</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;