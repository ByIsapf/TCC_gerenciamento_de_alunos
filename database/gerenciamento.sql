CREATE DATABASE IF NOT EXISTS gea;

USE gea;

-- Tabela dos alunos
CREATE TABLE alunos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ra VARCHAR(20) NOT NULL UNIQUE,
    nome VARCHAR(100) NOT NULL,
    senha VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela dos tokens usados pelo QR Code
CREATE TABLE qr_tokens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    aluno_id INT NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    expiracao DATETIME NOT NULL,
    usado BOOLEAN DEFAULT FALSE,

    FOREIGN KEY (aluno_id)
        REFERENCES alunos(id)
        ON DELETE CASCADE
);

-- Tabela de frequência
CREATE TABLE frequencias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    aluno_id INT NOT NULL,
    data DATE NOT NULL,
    horario TIME NOT NULL,
    status ENUM('presente', 'atrasado') DEFAULT 'presente',

    FOREIGN KEY (aluno_id)
        REFERENCES alunos(id)
        ON DELETE CASCADE,

    UNIQUE (aluno_id, data)
);