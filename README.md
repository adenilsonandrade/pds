# PDS: App de Gestão para Banho e Tosa

## Sobre o Projeto
Este projeto é uma aplicação de gestão para banho e tosa, desenvolvida para resolver problemas de controle de agendamentos e finanças. Foi idealizado para o estabelecimento "Pet da Guivi" com o objetivo de otimizar a gestão diária.

### Problema & Proposta de Solução

Problema:
O negócio enfrentava dificuldades no controle de agendamentos de banhos (pacotes semanal, quinzenal, mensal e avulsos), além de ter pouca clareza sobre receitas e despesas, o que impedia a avaliação da real lucratividade do negócio.

Proposta de Solução:
Criar uma aplicação que permita o cadastro de pets e agendamentos de forma fácil e intuitiva. A aplicação possibilita a gestão completa de clientes e seus pets, o histórico de atendimentos e, principalmente, um controle eficaz sobre receitas e despesas para determinar a saúde financeira do negócio.

## Funcionalidades

Cadastro completo de pets e seus respectivos donos.

Histórico de atendimentos e valores.

Gerenciamento de despesas e controle financeiro.

Gestão de diferentes tipos de pacotes de banho e tosa (semanal, quinzenal, etc.).

## Tecnologias

Frontend: React, Vite

Backend: Node.js, Express

Banco de Dados: MySQL

Gerenciamento de Processos: PM2

Controle de Versão: Git

## Como Executar o Projeto

Pré-requisitos
Node.js e NPM instalados.

MySQL instalado e configurado.

PM2 instalado globalmente (npm install -g pm2).

Instruções
Clone este repositório:
git clone <https://github.com/adenilsonandrade/pds.git>

Vá para a pasta do backend, instale as dependências e inicie o servidor:
cd pds/backend
npm install
pm2 start server.js

Vá para a pasta do frontend, instale as dependências e compile o projeto:
cd ../frontend
npm install
npm run build

## Autor

[Adenilson Andrade](https://github.com/adenilsonandrade)