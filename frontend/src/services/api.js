const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const api = {
  async postAgendamento(agendamentoData) {
    try {
      const response = await fetch(`${API_URL}/api/agendamentos-publicos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(agendamentoData),
      });
      return response.ok;
    } catch (error) {
      console.error('Erro na requisição da API:', error);
      return false;
    }
  },
  
  async getServicos() {
    try {
      const response = await fetch(`${API_URL}/api/business/services`);
      if (response.ok) {
        const data = await response.json();
        return data;
      }
      return [];
    } catch (error) {
      console.error('Erro ao buscar serviços:', error);
      return [];
    }
  },

  async getBusinessInfo() {
    try {
      const response = await fetch(`${API_URL}/api/business/info`);
      if (response.ok) {
        const data = await response.json();
        return data;
      }
      return null;
    } catch (error) {
      console.error('Erro ao buscar informações do negócio:', error);
      return null;
    }
  }
};

export default api;