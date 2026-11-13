-- G.E.A - Banco de dados consolidado (MySQL 8.0+)
-- Para banco novo ou banco existente. NÃO apaga dados.
-- Faça backup antes de aplicar em uma base já utilizada.
-- Não executa automaticamente a invalidação de tokens antigos.
CREATE DATABASE IF NOT EXISTS gea CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE gea;

CREATE TABLE IF NOT EXISTS turmas (
 id INT AUTO_INCREMENT PRIMARY KEY,
 nome VARCHAR(100) NOT NULL UNIQUE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS alunos (
 id INT AUTO_INCREMENT PRIMARY KEY,
 ra VARCHAR(20) NOT NULL UNIQUE,
 nome VARCHAR(100) NOT NULL,
 senha VARCHAR(255) NOT NULL,
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 turma_id INT NULL,
 CONSTRAINT fk_alunos_turma FOREIGN KEY (turma_id) REFERENCES turmas(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- Adiciona turma_id somente se ainda não existir (migração segura).
SET @add_turma_col := (SELECT IF(COUNT(*)=0,
 'ALTER TABLE alunos ADD COLUMN turma_id INT NULL', 'SELECT ''turma_id já existe''')
 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='alunos' AND COLUMN_NAME='turma_id');
PREPARE stmt FROM @add_turma_col; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Adiciona a chave estrangeira somente se ainda não existir.
SET @add_turma_fk := (SELECT IF(COUNT(*)=0,
 'ALTER TABLE alunos ADD CONSTRAINT fk_alunos_turma FOREIGN KEY (turma_id) REFERENCES turmas(id) ON DELETE RESTRICT',
 'SELECT ''vínculo com turmas já existe''')
 FROM information_schema.KEY_COLUMN_USAGE WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='alunos'
 AND COLUMN_NAME='turma_id' AND REFERENCED_TABLE_NAME='turmas');
PREPARE stmt FROM @add_turma_fk; EXECUTE stmt; DEALLOCATE PREPARE stmt;

CREATE TABLE IF NOT EXISTS administradores (
 id INT AUTO_INCREMENT PRIMARY KEY, email VARCHAR(190) NOT NULL UNIQUE, senha VARCHAR(255) NOT NULL
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS sessoes_admin (
 id INT AUTO_INCREMENT PRIMARY KEY, administrador_id INT NOT NULL,
 token_hash CHAR(64) NOT NULL UNIQUE, expiracao DATETIME NOT NULL,
 FOREIGN KEY (administrador_id) REFERENCES administradores(id) ON DELETE CASCADE
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS sessoes_aluno (
 id INT AUTO_INCREMENT PRIMARY KEY, aluno_id INT NOT NULL,
 token_hash CHAR(64) NOT NULL UNIQUE, expiracao DATETIME NOT NULL,
 FOREIGN KEY (aluno_id) REFERENCES alunos(id) ON DELETE CASCADE
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS qr_tokens (
 id INT AUTO_INCREMENT PRIMARY KEY, aluno_id INT NOT NULL,
 token VARCHAR(255) NOT NULL UNIQUE, expiracao DATETIME NOT NULL,
 usado BOOLEAN DEFAULT FALSE,
 FOREIGN KEY (aluno_id) REFERENCES alunos(id) ON DELETE CASCADE
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS frequencias (
 id INT AUTO_INCREMENT PRIMARY KEY, aluno_id INT NOT NULL,
 data DATE NOT NULL, horario TIME NOT NULL,
 status ENUM('presente','atrasado','falta') DEFAULT 'presente',
 justificativa VARCHAR(500) NULL,
 FOREIGN KEY (aluno_id) REFERENCES alunos(id) ON DELETE CASCADE,
 UNIQUE KEY uq_frequencia_aluno_dia (aluno_id,data)
) ENGINE=InnoDB;

-- Migração compatível com banco já criado: amplia o ENUM sem apagar registros.
ALTER TABLE frequencias MODIFY COLUMN status ENUM('presente','atrasado','falta') NOT NULL DEFAULT 'presente';
SET @add_justificativa := (SELECT IF(COUNT(*)=0,
 'ALTER TABLE frequencias ADD COLUMN justificativa VARCHAR(500) NULL',
 "SELECT ''justificativa já existe''")
 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE()
 AND TABLE_NAME='frequencias' AND COLUMN_NAME='justificativa');
PREPARE stmt FROM @add_justificativa; EXECUTE stmt; DEALLOCATE PREPARE stmt;

CREATE TABLE IF NOT EXISTS configuracoes_entrada (
 id TINYINT PRIMARY KEY,
 horario_entrada TIME NOT NULL DEFAULT '07:00:00',
 tolerancia_minutos SMALLINT UNSIGNED NOT NULL DEFAULT 30,
 horario_encerramento TIME NOT NULL DEFAULT '23:59:00',
 atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;
INSERT IGNORE INTO configuracoes_entrada (id,horario_entrada,tolerancia_minutos,horario_encerramento)
VALUES (1,'07:00:00',30,'23:59:00');

-- Checagem de registros duplicados, útil para bancos antigos:
SELECT aluno_id, data, COUNT(*) AS quantidade
FROM frequencias GROUP BY aluno_id,data HAVING COUNT(*)>1;
-- Se uma base antiga não possuir UNIQUE(aluno_id,data), crie-o somente
-- após resolver eventuais duplicatas. Consulte SHOW INDEX FROM frequencias.
-- Migração antiga de QR (OPCIONAL, NÃO EXECUTADA):
-- UPDATE qr_tokens SET usado=TRUE WHERE usado=FALSE;
