import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from './components/MainLayout/MainLayout.jsx';
import Home from './pages/Home/Home.jsx';
import Agendamento from './pages/Agendamento/Agendamento.jsx';

function LoginPage() {
  return <h1>Tela de Login</h1>;
}

function ServicosPage() {
  return <h1>Tela de Servicos</h1>;
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/agendar" element={<Agendamento />} />
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Home />} />
        <Route path="servicos" element={<ServicosPage />} />
      </Route>
    </Routes>
  );
}

export default App;