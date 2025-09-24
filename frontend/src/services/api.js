const API_URL = import.meta.env.VITE_API_URL || '';

function buildUrl(path) {
  return `${API_URL}${path}`;
}

const api = {
  async postAgendamento(agendamentoData, handle = '') {
    try {
      const suffix = handle ? `/${encodeURIComponent(handle)}` : '';
      const response = await fetch(buildUrl(`/api/agendamentos-publicos${suffix}`), {
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
  async getServicos(handle = '') {
    try {
      const suffix = handle ? `/${encodeURIComponent(handle)}` : '';
      const response = await fetch(buildUrl(`/api/business${suffix}/services`));
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
  async getBusinessInfo(handle = '') {
    try {
      const suffix = handle ? `/${encodeURIComponent(handle)}` : '';
      const response = await fetch(buildUrl(`/api/business${suffix}/info`));
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