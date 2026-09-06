# 🎓 Sistema de Gerenciamento de Entrada de Alunos

Sistema web desenvolvido como projeto de **Trabalho de Conclusão de Curso (TCC)** do curso de **Desenvolvimento de Sistemas**.

O projeto tem como objetivo auxiliar escolas no **controle de entrada, frequência e acompanhamento dos alunos**, permitindo que a gestão tenha acesso às informações de forma organizada, rápida e segura.

---

## 📌 Sobre o Projeto

O **Sistema de Gerenciamento de Entrada de Alunos** foi desenvolvido para facilitar o controle da entrada dos estudantes na escola.

A proposta é substituir processos manuais por um sistema digital, permitindo registrar informações como:

* Entrada dos alunos;
* Horário de chegada;
* Frequência e faltas;
* Turmas e salas;
* Justificativas de faltas;
* Atestados médicos;
* Histórico de entradas;
* Informações dos alunos;
* Notificações para a gestão;
* Relatórios em PDF.

O sistema possui diferentes áreas de acesso, principalmente a **Área do Aluno** e a **Área da Gestão**.

---

## 🎯 Objetivo

O principal objetivo do projeto é desenvolver uma solução web capaz de **organizar e automatizar o gerenciamento da entrada e frequência dos alunos**, facilitando o trabalho da equipe responsável pela gestão escolar.

Além disso, o sistema busca:

* Reduzir o uso de registros manuais;
* Facilitar o acompanhamento da frequência;
* Organizar informações dos alunos;
* Registrar horários de entrada;
* Facilitar o envio de justificativas;
* Permitir o envio de atestados;
* Auxiliar na identificação de atrasos;
* Melhorar o acesso às informações;
* Aumentar a organização e segurança dos dados.

---

## 🚀 Funcionalidades

### 👨‍🎓 Área do Aluno

O aluno poderá utilizar o sistema para:

* Realizar seu acesso;
* Informar seus dados;
* Informar sua turma e sala;
* Registrar sua entrada;
* Justificar uma falta;
* Enviar atestados;

---

### 👨‍💼 Área da Gestão

A gestão terá acesso a um painel administrativo com funcionalidades como:

* Login de administrador;
* Dashboard;
* Visualização das salas;
* Visualização das turmas;
* Lista de alunos;
* Perfil dos alunos;
* Histórico de entradas;
* Controle de faltas;
* Controle de atrasos;
* Recebimento de notificações;
* Análise de justificativas;
* Confirmação de atestados;
* Geração de relatórios;
* Consulta de informações por aluno ou turma.

---

## ⏰ Controle de Horário

O sistema poderá registrar automaticamente o horário em que o aluno realiza sua entrada.

Com isso, a gestão poderá identificar:

* Entrada dentro do horário;
* Entrada após o horário definido;
* Histórico de horários;
* Quantidade de atrasos;
* Frequência do aluno.

Caso o aluno entre após o horário estabelecido pela escola, o sistema poderá registrar a ocorrência e gerar uma notificação para a gestão.

---

## 📄 Atestados e Justificativas

O sistema possui uma área destinada ao envio de justificativas e atestados.

O aluno poderá:

1. Selecionar a opção de justificar uma falta;
2. Informar o motivo;
3. Enviar o documento necessário;
4. Aguardar a análise da gestão.

A gestão poderá analisar a solicitação e definir seu status, por exemplo:

* 🟡 Pendente;
* 🟢 Aprovado;
* 🔴 Recusado.

---

## 📊 Dashboard

A gestão terá acesso a um painel para visualizar informações importantes do sistema.

Exemplos de informações:

* Total de alunos;
* Total de turmas;
* Alunos presentes;
* Alunos ausentes;
* Alunos atrasados;
* Justificativas pendentes;
* Atestados aguardando análise;
* Registros recentes de entrada.

---

## 🏫 Organização das Turmas

O sistema permite organizar os alunos de acordo com suas respectivas turmas e salas.

Exemplo:

```text
1º Desenvolvimento de Sistemas
│
├── Sala 01
│   ├── Aluno 01
│   ├── Aluno 02
│   └── Aluno 03
│
└── Sala 02
    ├── Aluno 04
    ├── Aluno 05
    └── Aluno 06
```

Essa organização facilita a localização dos alunos e o acompanhamento das informações de cada turma.

---

## 🛠️ Tecnologias Utilizadas

### Front-End

* **HTML5** — Estrutura das páginas;
* **CSS3** — Estilização e layout;
* **JavaScript** — Interatividade e funcionalidades do sistema.

### Back-End

* **Node.js** — Ambiente utilizado para executar o servidor;
* **Express.js** — Framework para criação da API e rotas.

### Banco de Dados

* **MySQL** — Armazenamento dos dados do sistema;
* **MySQL Workbench** — Administração e gerenciamento do banco de dados.

### Ferramentas

* **Visual Studio Code** — Desenvolvimento do código;
* **Git** — Controle de versões;
* **GitHub** — Armazenamento e colaboração do projeto.

---