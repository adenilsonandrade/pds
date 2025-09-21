import React from 'react';
import { Link } from 'react-router-dom';
import Card from '../../components/Card/Card.jsx';
import './Home.css';

// Dados dos benefícios da plataforma
const platformBenefits = [
  {
    title: "Gestão Completa de Clientes",
    description: "Centralize todas as informações de seus clientes e pets em um único lugar."
  },
  {
    title: "Controle Financeiro Descomplicado",
    description: "Monitore receitas e despesas com relatórios simples e objetivos."
  },
  {
    title: "Página de Agendamento Personalizada",
    description: "Tenha um site de agendamento com a marca do seu negócio, sem código."
  }
];

// Dados dos diferenciais do AugendaPet
const trustData = [
  {
    title: "Profissionalismo Garantido",
    description: "Sua marca ganha credibilidade com um sistema de agendamento moderno e confiável."
  },
  {
    title: "Segurança de Dados",
    description: "Implementamos o que há de mais moderno em segurança para proteger você e seus clientes."
  },
  {
    title: "Suporte Total",
    description: "Estamos aqui para ajudar. Conte com nosso suporte para qualquer dúvida ou problema."
  }
];

function Home() {
  return (
    <div className="home-container">
      
      {/* Seção Hero - Agora sobre a plataforma AugendaPet */}
      <section className="hero-section">
        <div className="hero-content">
          <h1>Transforme a Gestão do seu Negócio Pet</h1>
          <p>
            O AugendaPet é a plataforma white-label para agendamentos e controle financeiro do seu estabelecimento.
          </p>
          {/* O link agora é para a página de login, onde os donos de negócio se autenticam */}
          <Link to="/login" className="btn-primary-action">
            Fazer Login
          </Link>
        </div>
      </section>

      {/* Seção de Funcionalidades para o Dono do Negócio */}
      <section className="services-section">
        <h2>Funcionalidades da Plataforma</h2>
        <div className="services-grid">
          {platformBenefits.map((benefit, index) => (
            <Card key={index}>
              <h3>{benefit.title}</h3>
              <p>{benefit.description}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Seção de Confiança - Sobre o AugendaPet */}
      <section className="trust-section">
        <h2>Por que escolher AugendaPet?</h2>
        <div className="trust-grid">
          {trustData.map((feature, index) => (
            <Card key={index}>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </Card>
          ))}
        </div>
      </section>
      
    </div>
  );
}

export default Home;