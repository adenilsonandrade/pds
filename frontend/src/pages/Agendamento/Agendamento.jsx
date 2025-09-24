import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../services/api';
import './Agendamento.css';
import Card from '../../components/Card/Card.jsx';
import { getTodayDate } from '../../utils/dateHelpers.js';
import FormGroup from '../../components/FormGroup/FormGroup.jsx';
import logoImage from '../../assets/images/logo_dark.png';
import PageLoader from '../../utils/PageLoader.jsx';

function Agendamento() {
  const [agendamentoData, setAgendamentoData] = useState({
    nomePet: '',
    especie: '',
    nomeCliente: '',
    telefone: '',
    servico: '',
    data: '',
    hora: '',
    observacoes: '',
  });

  const [servicosDisponiveis, setServicosDisponiveis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [businessInfo, setBusinessInfo] = useState({
    brandName: null,
    logoUrl: null,
    location: null,
    mapsUrl: null
  });
  const todayDate = getTodayDate();
  const { handle = '' } = useParams();

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [servicesResponse, businessResponse] = await Promise.all([
          api.getServicos(handle),
          api.getBusinessInfo(handle)
        ]);

        setServicosDisponiveis(servicesResponse || []);
        if (servicesResponse && servicesResponse.length > 0) {
          setAgendamentoData(prevData => ({ ...prevData, servico: servicesResponse[0].id }));
        }

        if (businessResponse) {
          setBusinessInfo({
            brandName: businessResponse.brand_name,
            logoUrl: businessResponse.logo_url,
            location: businessResponse.location,
            mapsUrl: businessResponse.maps_url
          });
        }
      } catch (error) {
        console.error("Erro ao carregar dados iniciais:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAgendamentoData({ ...agendamentoData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

  const success = await api.postAgendamento(agendamentoData, handle);

    if (success) {
      alert('Agendamento confirmado com sucesso!');
      setAgendamentoData({
        nomePet: '', especie: '', nomeCliente: '', telefone: '',
        servico: servicosDisponiveis.length > 0 ? servicosDisponiveis[0].id : '',
        data: '', hora: '', observacoes: '',
      });
    } else {
      alert('Erro ao agendar. Por favor, tente novamente.');
    }
  };

  return (
    <>
      <PageLoader loading={loading} />

      {!loading && (
        <div className="agendamento-container">
          <Card>
            {businessInfo.logoUrl && (
              <img
                src={businessInfo.logoUrl}
                alt="Logo do Negócio"
                className="logo-businesses"
              />
            )}
          </Card>

          <Card>
            <h2>Agende o Banho do Seu Pet</h2>
            <p className="subtitle">
              Preencha o formulário para garantir o melhor cuidado.
            </p>
            <form onSubmit={handleSubmit}>
              <div className="form-section">
                <h3 className="section-title">Informações do Pet</h3>
                <div className="form-row">
                  <FormGroup
                    label="Nome do Pet"
                    name="nomePet"
                    value={agendamentoData.nomePet}
                    onChange={handleChange}
                    required
                  />
                  <FormGroup
                    label="Espécie"
                    name="especie"
                    value={agendamentoData.especie}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-section">
                <h3 className="section-title">Informações do Tutor</h3>
                <div className="form-row">
                  <FormGroup
                    label="Seu Nome"
                    name="nomeCliente"
                    value={agendamentoData.nomeCliente}
                    onChange={handleChange}
                    required
                  />
                  <FormGroup
                    label="Telefone"
                    name="telefone"
                    type="tel"
                    value={agendamentoData.telefone}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-section">
                <h3 className="section-title">Detalhes do Agendamento</h3>
                <FormGroup
                  label="Serviço"
                  name="servico"
                  type="select"
                  value={agendamentoData.servico}
                  onChange={handleChange}
                  options={servicosDisponiveis}
                />
                <div className="form-row">
                  <FormGroup
                    label="Data"
                    name="data"
                    type="date"
                    value={agendamentoData.data}
                    onChange={handleChange}
                    min={todayDate}
                    required
                  />
                  <FormGroup
                    label="Hora"
                    name="hora"
                    type="time"
                    value={agendamentoData.hora}
                    onChange={handleChange}
                    required
                  />
                </div>
                <FormGroup
                  label="Observações"
                  name="observacoes"
                  type="textarea"
                  value={agendamentoData.observacoes}
                  onChange={handleChange}
                />
              </div>

              <button type="submit" className="btn-agendar-submit">
                Confirmar Agendamento
              </button>
            </form>
          </Card>

          <Card>
            <h2>Localização</h2>
            <p>{businessInfo.location}</p>
            {businessInfo.mapsUrl && (
              <iframe
                title="Localização do Pet Shop"
                src={businessInfo.mapsUrl}
                width="100%"
                height="220"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
              ></iframe>
            )}
          </Card>
          <Card>
            <p className="footer-text">
              <img
                src={logoImage}
                alt="Logo AugendaPet"
                className="logo-footer"
              />
              Powered By AugendaPet
            </p>
          </Card>
        </div>
      )}
    </>
  );
}

export default Agendamento;