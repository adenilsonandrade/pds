import api from './api';

const getServicosDisponiveis = async () => {
    try {
        const data = await api.getServicos();
        return data || [];
    } catch (error) {
        console.error('Erro ao buscar os serviços:', error);
        return [];
    }
};

export default { getServicosDisponiveis };