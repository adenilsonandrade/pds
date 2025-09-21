// Dados dos serviços, agora vindo do backend
const getServicosDisponiveis = async () => {
    // Esta URL precisará ser configurada no backend
    try {
        const response = await api.get('/api/servicos-disponiveis');
        return response.data;
    } catch (error) {
        console.error("Erro ao buscar os serviços:", error);
        return [];
    }
};

export default { getServicosDisponiveis };